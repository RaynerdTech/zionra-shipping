/** Protects shipping-partner application validation and operational details. */

import assert from "node:assert/strict";
import test from "node:test";
import {
  validatePartnerAccountInformation,
  validatePartnerBusinessInformation,
  validatePartnerOperationalDetails,
} from "../src/validators/partnerApplication.validators.js";

const validOperationalDetails = {
  collectionCities: ["London"],
  itemsHandled: ["Furniture"],
  operationalBusinessAddress: "1 Zionra Way, London",
  shippingMethod: "Both",
  shipmentFrequency: "Weekly",
  pricePerKg: "6",
  pricePerBarrel: "140",
  insuranceAvailable: true,
  maxLength: "6",
  maxHeight: "140",
  maxWidth: "1",
  upfrontImmigrationCharge: false,
};

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

test("operational details require the current pricing and shipment requirement fields", () => {
  const result = validatePartnerOperationalDetails({
    ...validOperationalDetails,
    pricePerKg: "",
    maxHeight: "",
  });

  assert.equal(result.success, false);
  if (result.success) return;
  assert.equal(result.errors.pricePerKg, "Enter a valid price per KG.");
  assert.equal(result.errors.maxHeight, "Enter a valid maximum height.");
});

test("operational details normalize current pricing and dimensions", () => {
  const result = validatePartnerOperationalDetails({
    ...validOperationalDetails,
    pricePerKg: "6.5",
    pricePerBarrel: "140",
    maxLength: "6",
    maxHeight: "140.25",
    maxWidth: "1.5",
  });

  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.data.pricePerKg, "6.50");
  assert.equal(result.data.pricePerBarrel, "140.00");
  assert.equal(result.data.maxLength, "6.00");
  assert.equal(result.data.maxHeight, "140.25");
  assert.equal(result.data.maxWidth, "1.50");
});

test("items handled requires a description when Other is selected", () => {
  const result = validatePartnerOperationalDetails({
    ...validOperationalDetails,
    itemsHandled: ["Furniture", "Other"],
    otherItemsHandled: "",
  });

  assert.equal(result.success, false);
  if (result.success) return;
  assert.equal(
    result.errors.otherItemsHandled,
    "Tell us what other items you handle.",
  );
});

test("items handled stores a custom Other description", () => {
  const result = validatePartnerOperationalDetails({
    ...validOperationalDetails,
    itemsHandled: ["Furniture", "Other"],
    otherItemsHandled: "Fine art",
  });

  assert.equal(result.success, true);
  if (!result.success) return;
  assert.deepEqual(result.data.itemsHandled, ["Furniture", "Other: Fine art"]);
});

test("stored custom item values remain valid during final submission", () => {
  const result = validatePartnerOperationalDetails({
    ...validOperationalDetails,
    itemsHandled: ["Furniture", "Other: Fine art"],
  });

  assert.equal(result.success, true);
  if (!result.success) return;
  assert.deepEqual(result.data.itemsHandled, ["Furniture", "Other: Fine art"]);
});

test("operational details accept only canonical UK cities", () => {
  const result = validatePartnerOperationalDetails({
    ...validOperationalDetails,
    collectionCities: ["london", "Manchester"],
  });

  assert.equal(result.success, true);
  if (!result.success) return;
  assert.deepEqual(result.data.collectionCities, ["London", "Manchester"]);
});

test("operational details reject cities outside the UK suggestion list", () => {
  const result = validatePartnerOperationalDetails({
    ...validOperationalDetails,
    collectionCities: ["Londn"],
  });

  assert.equal(result.success, false);
  if (result.success) return;
  assert.equal(
    result.errors.collectionCities,
    "Select valid UK cities from the suggestions.",
  );
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
