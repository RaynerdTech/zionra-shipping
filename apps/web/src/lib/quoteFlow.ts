export type QuoteLocation = {
  label: string;
  primary: string;
  secondary: string;
  city: string;
  coordinates: [number, number] | null;
};

export type QuoteDraft = {
  from: QuoteLocation | null;
  to: QuoteLocation | null;
  itemTypes: string[];
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  collectionMode: string;
  deliveryMode: string;
  shippingMethod: string;
};


export type SelectedQuoteAgent = {
  id: string;
  companyName: string;
  logoUrl: string | null;
  verified: boolean;
  rating: number | null;
  reviewCount: number;
  responseTime: string | null;
  collectionMethod: string | null;
  deliveryMethod: string | null;
  insuranceAvailable: boolean | null;
  shipmentFrequency: string | null;
  shippingMethod: string | null;
  estimatedPriceGbp: number | null;
  pricePerKgEur: number | null;
  eurToGbpRate: number;
};

export type QuoteShipmentDraft = {
  agentId: string;
  senderFullName: string;
  senderPhoneCountryCode: string;
  senderPhoneNumber: string;
  senderEmail: string;
  pickupAddress: string;
  pickupCity: string;
  pickupPostcode: string;
  receiverFullName: string;
  receiverPhoneCountryCode: string;
  receiverPhoneNumber: string;
  receiverEmail: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPostcode: string;
  itemsDescription: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  declaredValueGbp: string;
};

const QUOTE_DRAFT_KEY = "zionra.quote-draft.v1";
const SHIPMENT_DRAFT_KEY = "zionra.shipment-draft.v1";
const SELECTED_AGENT_KEY = "zionra.selected-agent.v1";

export const EMPTY_QUOTE_DRAFT: QuoteDraft = {
  from: null,
  to: null,
  itemTypes: [],
  weightKg: "",
  lengthCm: "",
  widthCm: "",
  collectionMode: "",
  deliveryMode: "",
  shippingMethod: "",
};

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.sessionStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A blocked/full sessionStorage should not stop the quote flow.
  }
}

export function readQuoteDraft(): QuoteDraft {
  return readJson<QuoteDraft>(QUOTE_DRAFT_KEY) ?? EMPTY_QUOTE_DRAFT;
}

export function writeQuoteDraft(draft: QuoteDraft) {
  writeJson(QUOTE_DRAFT_KEY, draft);
}

export function writeShipmentDraft(draft: QuoteShipmentDraft) {
  writeJson(SHIPMENT_DRAFT_KEY, draft);
}

export function readShipmentDraft(): QuoteShipmentDraft | null {
  return readJson<QuoteShipmentDraft>(SHIPMENT_DRAFT_KEY);
}

export function writeSelectedQuoteAgent(agent: SelectedQuoteAgent) {
  writeJson(SELECTED_AGENT_KEY, agent);
}

export function readSelectedQuoteAgent(): SelectedQuoteAgent | null {
  return readJson<SelectedQuoteAgent>(SELECTED_AGENT_KEY);
}

export function normalizeQuoteCity(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");
}

type LocationLike = {
  label: string;
  primary: string;
  secondary: string;
  coordinates: [number, number] | null;
  raw?: unknown;
};

function getObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cityFromPhoton(raw: unknown) {
  const feature = getObject(raw);
  const properties = getObject(feature?.properties);

  return (
    getString(properties?.city) ||
    getString(properties?.locality) ||
    getString(properties?.district) ||
    getString(properties?.county)
  );
}

function cityFromGetAddress(raw: unknown) {
  const address = getObject(raw);
  return (
    getString(address?.town_or_city) ||
    getString(address?.locality) ||
    getString(address?.district) ||
    getString(address?.county)
  );
}

export function toQuoteLocation(
  result: LocationLike,
  countryCode: "GB" | "NG",
): QuoteLocation {
  const rawObject = getObject(result.raw);
  const looksLikePhoton = Boolean(rawObject?.properties);
  const city = looksLikePhoton
    ? cityFromPhoton(result.raw)
    : cityFromGetAddress(result.raw);

  const fallbackCity = result.secondary
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .find((part) => {
      const normalized = normalizeQuoteCity(part);
      return (
        normalized !== "united kingdom" &&
        normalized !== "uk" &&
        normalized !== "nigeria" &&
        !/^[a-z]{1,2}\d/i.test(part)
      );
    });

  return {
    label: result.label,
    primary: result.primary,
    secondary: result.secondary,
    city: city || fallbackCity || (countryCode === "GB" ? result.primary : result.primary),
    coordinates: result.coordinates,
  };
}

export const QUOTE_ITEM_OPTIONS = [
  { value: "parcel", label: "Parcel / package" },
  { value: "documents", label: "Documents / paperwork" },
  { value: "clothing", label: "Clothing / personal items" },
  { value: "electronics", label: "Electronics" },
  { value: "household", label: "Household items" },
  { value: "furniture", label: "Furniture" },
  { value: "commercial", label: "Retail / commercial goods" },
  { value: "machinery", label: "Machinery / equipment" },
  { value: "automotive", label: "Automotive parts" },
  { value: "palletised", label: "Palletised goods" },
  { value: "building", label: "Building materials" },
  { value: "vehicles", label: "Vehicles" },
  { value: "other", label: "Other item" },
] as const;

export const QUOTE_COLLECTION_OPTIONS = [
  { value: "collection", label: "Pickup from address" },
  { value: "dropoff", label: "Drop off at agent" },
] as const;

export const QUOTE_DELIVERY_OPTIONS = [
  { value: "door-to-door", label: "Door-to-door delivery" },
  { value: "receiver-pickup", label: "Receiver pickup" },
] as const;

export const QUOTE_SHIPPING_METHOD_OPTIONS = [
  { value: "air", label: "Air cargo" },
  { value: "sea", label: "Sea cargo" },
] as const;

export function quoteItemLabel(value: string) {
  return QUOTE_ITEM_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
