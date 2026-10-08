import type { FieldErrors } from "../lib/httpError.js";

export type QuoteAgentSearchInput = {
  pickupCity: string;
  pickupLabel: string;
  itemTypes: string[];
  weightKg: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  collectionMode: "collection" | "dropoff" | null;
  deliveryMode: "door-to-door" | "receiver-pickup" | null;
  shippingMethod: "air" | "sea" | null;
};

type ValidationSuccess<T> = { success: true; data: T };
type ValidationFailure = { success: false; errors: FieldErrors };

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getNullablePositiveNumber(value: unknown) {
  const raw = getString(value);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : Number.NaN;
}

export function validateQuoteAgentSearch(
  query: Record<string, unknown>,
): ValidationSuccess<QuoteAgentSearchInput> | ValidationFailure {
  const errors: FieldErrors = {};
  const pickupCity = getString(query.pickupCity);
  const pickupLabel = getString(query.pickupLabel);
  const itemTypes = getString(query.itemTypes)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const weightKg = getNullablePositiveNumber(query.weightKg);
  const lengthCm = getNullablePositiveNumber(query.lengthCm);
  const widthCm = getNullablePositiveNumber(query.widthCm);
  const collectionModeRaw = getString(query.collectionMode);
  const deliveryModeRaw = getString(query.deliveryMode);
  const shippingMethodRaw = getString(query.shippingMethod);

  if (!pickupCity) errors.pickupCity = "Enter a pickup city.";
  if (itemTypes.length === 0) errors.itemTypes = "Select at least one item type.";
  if (weightKg === null || Number.isNaN(weightKg)) errors.weightKg = "Enter a valid weight.";
  if (Number.isNaN(lengthCm)) errors.lengthCm = "Enter a valid length.";
  if (Number.isNaN(widthCm)) errors.widthCm = "Enter a valid width.";

  const collectionMode = collectionModeRaw
    ? (["collection", "dropoff"].includes(collectionModeRaw)
        ? (collectionModeRaw as QuoteAgentSearchInput["collectionMode"])
        : null)
    : null;
  if (collectionModeRaw && !collectionMode) {
    errors.collectionMode = "Select a valid collection method.";
  }

  const deliveryMode = deliveryModeRaw
    ? (["door-to-door", "receiver-pickup"].includes(deliveryModeRaw)
        ? (deliveryModeRaw as QuoteAgentSearchInput["deliveryMode"])
        : null)
    : null;
  if (deliveryModeRaw && !deliveryMode) {
    errors.deliveryMode = "Select a valid delivery method.";
  }

  const shippingMethod = shippingMethodRaw
    ? (["air", "sea"].includes(shippingMethodRaw)
        ? (shippingMethodRaw as QuoteAgentSearchInput["shippingMethod"])
        : null)
    : null;
  if (shippingMethodRaw && !shippingMethod) {
    errors.shippingMethod = "Select a valid shipping method.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      pickupCity,
      pickupLabel,
      itemTypes: [...new Set(itemTypes)],
      weightKg: Number.isNaN(weightKg) ? null : weightKg,
      lengthCm: Number.isNaN(lengthCm) ? null : lengthCm,
      widthCm: Number.isNaN(widthCm) ? null : widthCm,
      collectionMode,
      deliveryMode,
      shippingMethod,
    },
  };
}
