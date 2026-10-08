-- Extend partner operational details to match the current onboarding form.
ALTER TABLE "ShippingPartnerApplication"
ADD COLUMN "pricePerKg" DECIMAL(12,2),
ADD COLUMN "maxLength" DECIMAL(12,2),
ADD COLUMN "maxHeight" DECIMAL(12,2),
ADD COLUMN "maxWidth" DECIMAL(12,2);

-- Preserve an existing per-KG draft value when possible.
UPDATE "ShippingPartnerApplication"
SET "pricePerKg" = COALESCE("airCargoPricePerKg", "seaCargoPricePerKg")
WHERE "pricePerKg" IS NULL;
