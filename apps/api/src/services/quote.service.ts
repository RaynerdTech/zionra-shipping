import { env } from "../config/env.js";
import { HTTP_STATUS, HttpError } from "../lib/httpError.js";
import { prisma } from "../lib/prisma.js";
import type { QuoteAgentSearchInput } from "../validators/quote.validators.js";

const ITEM_CATEGORY_MAP: Record<string, string[]> = {
  parcel: [],
  documents: ["Documents & Paperwork"],
  clothing: ["Personal Items & Luggage", "Retail & Commercial Goods"],
  electronics: ["Electronics & Technology"],
  household: ["Household Goods"],
  furniture: ["Furniture"],
  commercial: ["Retail & Commercial Goods"],
  machinery: ["Machinery & Equipment"],
  automotive: ["Automotive Parts"],
  palletised: ["Palletised Goods"],
  building: ["Building Materials"],
  vehicles: ["Vehicles"],
  other: ["Other"],
};

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");
}

function decimalNumber(value: { toString(): string } | null | undefined) {
  if (!value) return null;
  const parsed = Number(value.toString());
  return Number.isFinite(parsed) ? parsed : null;
}

function collectionMethodMatches(mode: QuoteAgentSearchInput["collectionMode"], method: string | null) {
  if (!mode) return true;
  if (!method) return false;
  if (mode === "collection") return method === "Pickup Only" || method === "Both Pickup & Drop-off";
  return method === "Drop-off Only" || method === "Both Pickup & Drop-off";
}

function deliveryMethodMatches(mode: QuoteAgentSearchInput["deliveryMode"], method: string | null) {
  if (!mode) return true;
  if (!method) return false;
  if (mode === "door-to-door") return method === "Home delivery" || method === "Both";
  return method === "Depo Pickup" || method === "Both";
}

function shippingMethodMatches(mode: QuoteAgentSearchInput["shippingMethod"], method: string | null) {
  if (!mode) return true;
  if (!method) return false;
  if (mode === "air") return method === "Air cargo" || method === "Both";
  return method === "Sea cargo" || method === "Both";
}

function itemMatches(requested: string, handled: string[]) {
  const normalizedRequested = normalizeText(requested);
  const mapped = ITEM_CATEGORY_MAP[normalizedRequested] ?? [];

  if (normalizedRequested === "parcel") return handled.length > 0;

  if (normalizedRequested === "other") {
    return handled.some((item) => item === "Other" || item.startsWith("Other: "));
  }

  if (mapped.length > 0) {
    return mapped.some((category) => handled.includes(category));
  }

  return handled.some((item) => normalizeText(item) === normalizedRequested);
}


function shippingSpeedRank(method: string | null) {
  if (method === "Air cargo") return 0;
  if (method === "Both") return 1;
  if (method === "Sea cargo") return 2;
  return 99;
}

function responseRank(value: string | null) {
  const ranks: Record<string, number> = {
    Immediately: 0,
    "Within 24 Hours": 1,
    "Within 3 Days": 2,
    "Within 1 Week": 3,
    "Within 2 Weeks": 4,
    "More Than 2 Weeks": 5,
  };
  return value ? ranks[value] ?? 99 : 99;
}

function estimatePriceGbp(pricePerKg: number | null, weightKg: number | null) {
  if (pricePerKg === null) return null;
  const chargeableWeight = weightKg && weightKg > 0 ? weightKg : 1;
  return Math.round(pricePerKg * chargeableWeight * env.EUR_TO_GBP_RATE * 100) / 100;
}

function summarizeReviews(reviews: Array<{ rating: number }>) {
  if (reviews.length === 0) {
    return { rating: null, reviewCount: 0 };
  }

  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return {
    rating: Math.round(average * 10) / 10,
    reviewCount: reviews.length,
  };
}

function scoreAgent(input: QuoteAgentSearchInput, application: {
  itemsHandled: string[];
  collectionMethod: string | null;
  deliveryMethod: string | null;
  insuranceAvailable: boolean | null;
}) {
  let score = 100;
  score += input.itemTypes.filter((item) => itemMatches(item, application.itemsHandled)).length * 15;
  if (collectionMethodMatches(input.collectionMode, application.collectionMethod)) score += 8;
  if (deliveryMethodMatches(input.deliveryMode, application.deliveryMethod)) score += 8;
  if (application.insuranceAvailable) score += 3;

  return Math.round(score * 100) / 100;
}

export async function searchQuoteAgents(input: QuoteAgentSearchInput) {
  const pickupCandidates = [...new Set([
    input.pickupCity.trim(),
    ...input.pickupLabel
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 4),
  ].filter(Boolean))];

  const collectionMethods = input.collectionMode === "collection"
    ? ["Pickup Only", "Both Pickup & Drop-off"]
    : input.collectionMode === "dropoff"
      ? ["Drop-off Only", "Both Pickup & Drop-off"]
      : [];
  const deliveryMethods = input.deliveryMode === "door-to-door"
    ? ["Home delivery", "Both"]
    : input.deliveryMode === "receiver-pickup"
      ? ["Depo Pickup", "Both"]
      : [];
  const shippingMethods = input.shippingMethod === "air"
    ? ["Air cargo", "Both"]
    : input.shippingMethod === "sea"
      ? ["Sea cargo", "Both"]
      : [];
  const itemFilters = input.itemTypes.flatMap((item) => {
    const normalized = normalizeText(item);
    const mapped = ITEM_CATEGORY_MAP[normalized] ?? [];
    if (normalized === "parcel" || normalized === "other" || mapped.length === 0) return [];
    return [{ itemsHandled: { hasSome: mapped } }];
  });

  const partners = await prisma.shippingPartner.findMany({
    where: {
      status: "APPROVED",
      application: {
        is: {
          currentStep: "SUBMITTED",
          submittedAt: { not: null },
          collectionCities: { hasSome: pickupCandidates },
          ...(collectionMethods.length > 0 ? { collectionMethod: { in: collectionMethods } } : {}),
          ...(deliveryMethods.length > 0 ? { deliveryMethod: { in: deliveryMethods } } : {}),
          ...(shippingMethods.length > 0 ? { shippingMethod: { in: shippingMethods } } : {}),
          ...(itemFilters.length > 0 ? { AND: itemFilters } : {}),
        },
      },
    },
    select: {
      id: true,
      status: true,
      application: {
        select: {
          registeredBusinessName: true,
          companyLogoUrl: true,
          collectionCities: true,
          itemsHandled: true,
          shippingMethod: true,
          shipmentFrequency: true,
          pricePerKg: true,
          insuranceAvailable: true,
          maxLength: true,
          maxWidth: true,
          responseTime: true,
          collectionMethod: true,
          deliveryMethod: true,
        },
      },
    },
  });

  const reviewStats = partners.length > 0
    ? await prisma.shippingPartnerReview.groupBy({
        by: ["partnerId"],
        where: { partnerId: { in: partners.map((partner) => partner.id) } },
        _avg: { rating: true },
        _count: { id: true },
      })
    : [];
  const reviewStatsByPartner = new Map(
    reviewStats.map((stat) => [
      stat.partnerId,
      {
        rating: stat._avg.rating === null ? null : Math.round(stat._avg.rating * 10) / 10,
        reviewCount: stat._count.id,
      },
    ]),
  );

  const pickupCity = normalizeText(input.pickupCity);
  const pickupLabel = normalizeText(input.pickupLabel);

  const agents = partners
    .flatMap((partner) => {
      const application = partner.application;
      if (!application) return [];

      const cityMatch = application.collectionCities.some((city) => {
        const normalizedCity = normalizeText(city);
        return normalizedCity === pickupCity || (pickupLabel && pickupLabel.includes(normalizedCity));
      });
      if (!cityMatch) return [];

      const allItemsMatch = input.itemTypes.every((item) => itemMatches(item, application.itemsHandled));
      if (!allItemsMatch) return [];

      if (!collectionMethodMatches(input.collectionMode, application.collectionMethod)) return [];
      if (!deliveryMethodMatches(input.deliveryMode, application.deliveryMethod)) return [];
      if (!shippingMethodMatches(input.shippingMethod, application.shippingMethod)) return [];

      const maxLength = decimalNumber(application.maxLength);
      const maxWidth = decimalNumber(application.maxWidth);
      if (input.lengthCm && maxLength !== null && input.lengthCm > maxLength) return [];
      if (input.widthCm && maxWidth !== null && input.widthCm > maxWidth) return [];

      const pricePerKgEur = decimalNumber(application.pricePerKg);
      const reviewSummary = reviewStatsByPartner.get(partner.id) ?? { rating: null, reviewCount: 0 };

      return [{
        id: partner.id,
        companyName: application.registeredBusinessName ?? "Shipping partner",
        logoUrl: application.companyLogoUrl,
        verified: partner.status === "APPROVED",
        rating: reviewSummary.rating,
        reviewCount: reviewSummary.reviewCount,
        shipmentCount: null,
        onTimeRate: null,
        responseTime: application.responseTime,
        collectionMethod: application.collectionMethod,
        deliveryMethod: application.deliveryMethod,
        insuranceAvailable: application.insuranceAvailable,
        shipmentFrequency: application.shipmentFrequency,
        shippingMethod: application.shippingMethod,
        collectionCities: application.collectionCities,
        itemsHandled: application.itemsHandled,
        pricePerKgEur,
        estimatedPriceGbp: estimatePriceGbp(pricePerKgEur, input.weightKg),
        deliveryEstimate: null,
        bestMatchScore: Math.round((scoreAgent(input, application) + (reviewSummary.rating ?? 0)) * 100) / 100,
        speedRank: shippingSpeedRank(application.shippingMethod),
        responseRank: responseRank(application.responseTime),
      }];
    })
    .sort((a, b) => b.bestMatchScore - a.bestMatchScore || (a.estimatedPriceGbp ?? Number.POSITIVE_INFINITY) - (b.estimatedPriceGbp ?? Number.POSITIVE_INFINITY));

  return {
    agents,
    total: agents.length,
    currency: "GBP" as const,
    rate: {
      from: "EUR" as const,
      to: "GBP" as const,
      value: env.EUR_TO_GBP_RATE,
    },
  };
}

export async function getQuoteAgent(agentId: string) {
  const partner = await prisma.shippingPartner.findFirst({
    where: {
      id: agentId,
      status: "APPROVED",
      application: {
        is: {
          currentStep: "SUBMITTED",
          submittedAt: { not: null },
        },
      },
    },
    select: {
      id: true,
      status: true,
      application: {
        select: {
          registeredBusinessName: true,
          companyLogoUrl: true,
          companyBio: true,
          responseTime: true,
          collectionMethod: true,
          deliveryMethod: true,
          insuranceAvailable: true,
          shipmentFrequency: true,
          shippingMethod: true,
          collectionCities: true,
          itemsHandled: true,
          pricePerKg: true,
        },
      },
      reviews: {
        orderBy: { reviewedAt: "desc" },
        select: {
          id: true,
          source: true,
          authorName: true,
          authorPhotoUrl: true,
          rating: true,
          comment: true,
          reviewedAt: true,
        },
      },
    },
  });

  if (!partner?.application) {
    throw new HttpError(HTTP_STATUS.NOT_FOUND, "Shipping partner not found.");
  }

  const application = partner.application;
  const reviewSummary = summarizeReviews(partner.reviews);
  const pricePerKgEur = decimalNumber(application.pricePerKg);

  return {
    id: partner.id,
    companyName: application.registeredBusinessName ?? "Shipping partner",
    logoUrl: application.companyLogoUrl,
    verified: partner.status === "APPROVED",
    bio: application.companyBio,
    rating: reviewSummary.rating,
    reviewCount: reviewSummary.reviewCount,
    shipmentCount: null,
    onTimeRate: null,
    responseTime: application.responseTime,
    collectionMethod: application.collectionMethod,
    deliveryMethod: application.deliveryMethod,
    insuranceAvailable: application.insuranceAvailable,
    shipmentFrequency: application.shipmentFrequency,
    shippingMethod: application.shippingMethod,
    collectionCities: application.collectionCities,
    itemsHandled: application.itemsHandled,
    pricePerKgEur,
    eurToGbpRate: env.EUR_TO_GBP_RATE,
    reviews: partner.reviews.map((review) => ({
      ...review,
      reviewedAt: review.reviewedAt.toISOString(),
    })),
  };
}
