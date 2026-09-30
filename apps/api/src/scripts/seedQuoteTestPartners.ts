/**
 * Seeds approved shipping partners with varied quote/search data for staging testing.
 *
 * Safety: only records using the @quote-test.zionra.local email domain are replaced.
 * Run explicitly with `npm run seed:quote-agents -- --confirm`.
 */

import { prisma } from "../lib/prisma.js";

const TEST_EMAIL_DOMAIN = "quote-test.zionra.local";
const CONFIRM_FLAG = "--confirm";

const cityPlans = [
  { city: "London", count: 8, nearby: ["Croydon", "Westminster", "Wembley", "Ilford", "Hounslow"] },
  { city: "Croydon", count: 5, nearby: ["London", "Bromley", "Sutton"] },
  { city: "Manchester", count: 5, nearby: ["Salford", "Stockport", "Bolton"] },
  { city: "Birmingham", count: 5, nearby: ["Coventry", "Wolverhampton", "Solihull"] },
  { city: "Leeds", count: 4, nearby: ["Bradford", "Wakefield", "Huddersfield"] },
  { city: "Glasgow", count: 4, nearby: ["Paisley", "East Kilbride", "Edinburgh"] },
  { city: "Bristol", count: 4, nearby: ["Bath", "Weston-super-Mare", "Gloucester"] },
  { city: "Liverpool", count: 4, nearby: ["Birkenhead", "St Helens", "Warrington"] },
  { city: "Cardiff", count: 3, nearby: ["Newport", "Barry"] },
  { city: "Newcastle upon Tyne", count: 3, nearby: ["Gateshead", "Sunderland"] },
  { city: "Edinburgh", count: 3, nearby: ["Livingston", "Musselburgh", "Glasgow"] },
  { city: "Nottingham", count: 2, nearby: ["Derby", "Leicester"] },
] as const;

const itemProfiles = [
  ["Personal Items & Luggage", "Documents & Paperwork", "Electronics & Technology"],
  ["Personal Items & Luggage", "Household Goods", "Furniture"],
  ["Retail & Commercial Goods", "Electronics & Technology", "Documents & Paperwork"],
  ["Building Materials", "Machinery & Equipment", "Automotive Parts"],
  ["Personal Items & Luggage", "Retail & Commercial Goods", "Household Goods"],
  ["Furniture", "Palletised Goods", "Building Materials"],
  ["Vehicles", "Automotive Parts", "Machinery & Equipment"],
  ["Other: Artwork", "Documents & Paperwork", "Personal Items & Luggage"],
] as const;

const ratingProfiles = [
  [],
  [5, 5, 5, 5, 5],
  [5, 5, 4, 5, 4],
  [4, 4, 5, 4],
  [5, 4, 4, 5, 5, 4],
  [4, 4, 4],
  [3, 4, 4, 5],
  [5, 5, 5, 4, 5, 5, 4],
] as const;

const brandPrefixes = [
  "Atlas",
  "Swift",
  "Crown",
  "Prime",
  "Metro",
  "Royal",
  "BlueGate",
  "Northstar",
  "Unity",
  "Harbour",
  "Pioneer",
  "Orbit",
  "Summit",
  "Nexus",
  "Beacon",
  "Sterling",
  "Bridge",
  "Skyline",
  "Evergreen",
  "Vertex",
] as const;

const brandSuffixes = ["Logistics", "Cargo", "Freight", "Express", "Shipping", "Link"] as const;

const shippingMethods = ["Both", "Sea cargo", "Air cargo"] as const;
const shipmentFrequencies = ["Daily", "Weekly", "Monthly", "On Demand / As Needed"] as const;
const responseTimes = ["Immediately", "Within 24 Hours", "Within 3 Days", "Within 1 Week"] as const;
const collectionMethods = ["Both Pickup & Drop-off", "Pickup Only", "Drop-off Only"] as const;
const deliveryMethods = ["Both", "Home delivery", "Depo Pickup"] as const;

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildCompanyName(index: number, city: string) {
  const compactCity = city === "Newcastle upon Tyne" ? "Newcastle" : city;
  return `${brandPrefixes[index % brandPrefixes.length]} ${compactCity} ${brandSuffixes[(index * 2) % brandSuffixes.length]}`;
}

function buildCollectionCities(index: number, city: string, nearby: readonly string[]) {
  const cities = [city];

  if (nearby.length > 0 && index % 2 === 0) {
    cities.push(nearby[index % nearby.length]);
  }

  if (nearby.length > 1 && index % 5 === 0) {
    const second = nearby[(index + 1) % nearby.length];
    if (!cities.includes(second)) cities.push(second);
  }

  return cities;
}

const partners = cityPlans.flatMap((plan) =>
  Array.from({ length: plan.count }, (_, localIndex) => ({ plan, localIndex })),
).map(({ plan, localIndex }, index) => {
  const shippingMethod = shippingMethods[index % shippingMethods.length];
  const isLargeCapacity = shippingMethod === "Sea cargo" || index % 6 === 0;
  const isCompactCapacity = shippingMethod === "Air cargo" && index % 4 !== 0;

  const maxLength = isLargeCapacity ? 300 - (index % 5) * 12 : isCompactCapacity ? 125 + (index % 4) * 10 : 195 + (index % 5) * 9;
  const maxHeight = isLargeCapacity ? 245 - (index % 4) * 10 : isCompactCapacity ? 105 + (index % 4) * 8 : 170 + (index % 5) * 8;
  const maxWidth = isLargeCapacity ? 225 - (index % 4) * 9 : isCompactCapacity ? 95 + (index % 4) * 7 : 155 + (index % 5) * 8;

  return {
    companyName: buildCompanyName(index, plan.city),
    collectionCities: buildCollectionCities(localIndex, plan.city, plan.nearby),
    items: [...itemProfiles[index % itemProfiles.length]],
    pricePerKg: Number((3.15 + ((index * 37) % 275) / 100).toFixed(2)),
    pricePerBarrel: 78 + ((index * 7) % 46),
    shippingMethod,
    shipmentFrequency: shipmentFrequencies[index % shipmentFrequencies.length],
    responseTime: responseTimes[(index * 3) % responseTimes.length],
    collectionMethod: collectionMethods[(index + localIndex) % collectionMethods.length],
    deliveryMethod: deliveryMethods[(index * 2 + localIndex) % deliveryMethods.length],
    insuranceAvailable: index % 4 !== 0,
    maxLength,
    maxHeight,
    maxWidth,
    reviewRatings: [...ratingProfiles[(index * 5 + localIndex) % ratingProfiles.length]],
  };
});

if (partners.length !== 50) {
  throw new Error(`Expected 50 quote-test partners, generated ${partners.length}.`);
}

async function seed() {
  if (!process.argv.includes(CONFIRM_FLAG)) {
    throw new Error(`Refusing to seed without ${CONFIRM_FLAG}. Run: npm run seed:quote-agents -- ${CONFIRM_FLAG}`);
  }

  const existing = await prisma.shippingPartner.findMany({
    where: { email: { endsWith: `@${TEST_EMAIL_DOMAIN}` } },
    select: { id: true },
  });

  if (existing.length > 0) {
    await prisma.shippingPartner.deleteMany({
      where: { id: { in: existing.map((partner) => partner.id) } },
    });
  }

  if (process.argv.includes("--clean")) {
    console.log(`Removed ${existing.length} quote-test shipping partner${existing.length === 1 ? "" : "s"}.`);
    return;
  }

  const now = new Date();

  for (const [index, partner] of partners.entries()) {
    const slug = slugify(partner.companyName);
    const email = `${slug}-${index + 1}@${TEST_EMAIL_DOMAIN}`;

    await prisma.shippingPartner.create({
      data: {
        firstName: "Test",
        lastName: `Agent ${index + 1}`,
        email,
        phoneCountryCode: "+44",
        phoneNumber: `7700${String(900000 + index).slice(-6)}`,
        countryOfResidence: "United Kingdom",
        referralSource: "Zionra quote testing seed",
        acceptedTermsAt: now,
        emailVerifiedAt: now,
        status: "APPROVED",
        application: {
          create: {
            currentStep: "SUBMITTED",
            registeredBusinessName: partner.companyName,
            companyEmailAddress: email,
            businessAddress: `${12 + index} Test Logistics Way, ${partner.collectionCities[0]}, United Kingdom`,
            companyHouseNumber: `TEST${String(index + 1).padStart(4, "0")}`,
            companyPhoneCountryCode: "+44",
            companyPhoneNumber: `7700${String(900000 + index).slice(-6)}`,
            website: `https://${slug}-${index + 1}.example.com`,
            collectionCities: partner.collectionCities,
            itemsHandled: partner.items,
            operationalBusinessAddress: `${12 + index} Test Logistics Way, ${partner.collectionCities[0]}, United Kingdom`,
            shippingMethod: partner.shippingMethod,
            shipmentFrequency: partner.shipmentFrequency,
            pricePerKg: partner.pricePerKg,
            pricePerBarrel: partner.pricePerBarrel,
            insuranceAvailable: partner.insuranceAvailable,
            maxLength: partner.maxLength,
            maxHeight: partner.maxHeight,
            maxWidth: partner.maxWidth,
            upfrontImmigrationCharge: index % 3 === 0,
            companyBio: `${partner.companyName} is a seeded Zionra test partner serving ${partner.collectionCities.join(", ")} for UK to Nigeria shipments.`,
            responseTime: partner.responseTime,
            collectionMethod: partner.collectionMethod,
            deliveryMethod: partner.deliveryMethod,
            applicationReference: `ZT-${String(index + 1).padStart(4, "0")}-${slug.slice(0, 8).toUpperCase()}`,
            submittedAt: now,
          },
        },
        reviews: {
          create: partner.reviewRatings.map((rating, reviewIndex) => ({
            source: "GOOGLE",
            externalReviewId: `seed-${slug}-${index + 1}-${reviewIndex + 1}`,
            authorName: ["Adaeze O.", "Emeka B.", "Funmi K.", "Tobi A.", "Chioma N.", "Dami R.", "Michael T."][reviewIndex % 7],
            rating,
            comment: [
              "Reliable collection and clear communication throughout the shipment.",
              "Pricing was explained clearly and the parcel arrived safely.",
              "Good service overall and the team responded quickly.",
              "Collection was straightforward and delivery updates were useful.",
              "Smooth experience from booking through delivery.",
              "Helpful team and the collection process was easy to arrange.",
              "The shipment arrived safely and communication was consistent.",
            ][reviewIndex % 7],
            reviewedAt: new Date(now.getTime() - (reviewIndex + 1) * 7 * 24 * 60 * 60 * 1000),
          })),
        },
      },
    });
  }

  console.log(`Seeded ${partners.length} approved quote-test shipping partners.`);
  console.table(
    partners.map((partner, index) => ({
      number: index + 1,
      company: partner.companyName,
      collectionCities: partner.collectionCities.join(", "),
      items: partner.items.join(" | "),
      pricePerKgEur: partner.pricePerKg.toFixed(2),
      shippingMethod: partner.shippingMethod,
      collectionMethod: partner.collectionMethod,
      deliveryMethod: partner.deliveryMethod,
      insured: partner.insuranceAvailable ? "Yes" : "No",
      maxDimensions: `${partner.maxLength}×${partner.maxWidth}×${partner.maxHeight}`,
      rating: partner.reviewRatings.length
        ? (partner.reviewRatings.reduce((sum, rating) => sum + rating, 0) / partner.reviewRatings.length).toFixed(1)
        : "No reviews",
      reviews: partner.reviewRatings.length,
    })),
  );
}

try {
  await seed();
} catch (error) {
  console.error("Quote test partner seed failed.", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
