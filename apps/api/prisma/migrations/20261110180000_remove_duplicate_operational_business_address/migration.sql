-- Preserve the only populated address if a legacy draft has not filled business information.
UPDATE "ShippingPartnerApplication"
SET "businessAddress" = "operationalBusinessAddress"
WHERE ("businessAddress" IS NULL OR BTRIM("businessAddress") = '')
  AND "operationalBusinessAddress" IS NOT NULL
  AND BTRIM("operationalBusinessAddress") <> '';

-- Business Information is now the only source of business address.
ALTER TABLE "ShippingPartnerApplication"
DROP COLUMN "operationalBusinessAddress";
