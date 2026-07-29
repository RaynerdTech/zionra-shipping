/** Protects shipping-partner application validation and conditional pricing. */

import assert from "node:assert/strict";
import test from "node:test";
import {
  validatePartnerAccountInformation,
  validatePartnerBusinessInformation,
  validatePartnerOperationalDetails,
} from "../src/validators/partnerApplication.validators.js";

test("business information normalizes contacts and website", () => {
  const result = validatePartnerBusinessInformation({
    registeredBusinessName: " Zionra Logistics ",
    companyEmailAddress: " TEAM@EXAMPLE.COM ",
    businessAddress: "1 Zionra Way",
    companyHouseNumber: "12345678",
    companyPhoneCountryCode: "+44",
    companyPhoneNumber: "07700 900 123",
    website: "zionra.com",
    contacts: [{
      fullName: " Jane Okonkwo ",
      jobTitle: "Founder",
      email: " JANE@EXAMPLE.COM ",
      phoneCountryCode: "+44",
      phoneNumber: "07700 900 456",
    }],
  });

  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.data.website, "https://zionra.com");
  assert.equal(result.data.contacts[0].isPrimary, true);
  assert.equal(result.data.contacts[0].email, "jane@example.com");
});

test("both shipping methods require both per-KG prices", () => {
  const result = validatePartnerOperationalDetails({
    collectionCities: ["London"],
    itemsHandled: ["Furniture"],
    operationalBusinessAddress: "1 Zionra Way",
    shippingMethod: "Both",
    shipmentFrequency: "Weekly",
    airCargoPricePerKg: "6",
    seaCargoPricePerKg: "",
    pricePerBarrel: "140",
    insuranceAvailable: true,
    upfrontImmigrationCharge: false,
  });

  assert.equal(result.success, false);
  if (result.success) return;
  assert.equal(result.errors.seaCargoPricePerKg, "Enter a valid sea-cargo price.");
});

test("air cargo ignores a hidden sea-cargo price", () => {
  const result = validatePartnerOperationalDetails({
    collectionCities: ["London"],
    itemsHandled: ["Documents & Paperwork"],
    operationalBusinessAddress: "1 Zionra Way",
    shippingMethod: "Air cargo",
    shipmentFrequency: "On Demand / As Needed",
    airCargoPricePerKg: "6.50",
    seaCargoPricePerKg: "999",
    pricePerBarrel: "140",
    insuranceAvailable: true,
    upfrontImmigrationCharge: false,
  });

  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.data.airCargoPricePerKg, "6.50");
  assert.equal(result.data.seaCargoPricePerKg, null);
});

test("account information enforces the 160-word company bio limit", () => {
  const result = validatePartnerAccountInformation({
    companyBio: Array.from({ length: 161 }, () => "word").join(" "),
    responseTime: "Immediately",
    collectionMethod: "Pickup Only",
    deliveryMethod: "Home delivery",
  });

  assert.equal(result.success, false);
  if (result.success) return;
  assert.equal(result.errors.companyBio, "Company bio must not exceed 160 words.");
});
