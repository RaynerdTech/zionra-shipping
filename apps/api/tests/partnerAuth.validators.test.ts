/** Protects shipping-partner registration validation and normalization. */

import assert from "node:assert/strict";
import test from "node:test";
import {
  validateLinkGoogleShippingPartnerAccount,
  validatePartnerEmailCode,
  validateRegisterShippingPartner,
} from "../src/validators/partnerAuth.validators.js";

const validBody = {
  firstName: " Jane ",
  lastName: " Okonkwo ",
  email: " PARTNER@EXAMPLE.COM ",
  phoneCountryCode: "+44",
  phoneNumber: "07700 900 123",
  password: "secure-password",
  confirmPassword: "secure-password",
  countryOfResidence: "United Kingdom",
  referralSource: "Friend or Colleague",
  acceptedTerms: true,
  marketingOptIn: true,
};

test("partner registration normalizes account data", () => {
  const result = validateRegisterShippingPartner(validBody);
  assert.equal(result.success, true);
  if (!result.success) return;

  assert.equal(result.data.firstName, "Jane");
  assert.equal(result.data.lastName, "Okonkwo");
  assert.equal(result.data.email, "partner@example.com");
  assert.equal(result.data.phoneNumber, "07700900123");
});

test("partner registration requires terms and matching passwords", () => {
  const result = validateRegisterShippingPartner({
    ...validBody,
    acceptedTerms: false,
    confirmPassword: "different-password",
  });

  assert.equal(result.success, false);
  if (result.success) return;
  assert.equal(result.errors.confirmPassword, "Passwords do not match.");
  assert.equal(
    result.errors.acceptedTerms,
    "You must agree to Zionra's Terms of Service and Privacy Policy.",
  );
});

test("partner verification accepts six digits and normalizes email", () => {
  assert.deepEqual(
    validatePartnerEmailCode({ email: " PARTNER@EXAMPLE.COM ", code: "001234" }),
    {
      success: true,
      data: { email: "partner@example.com", code: "001234" },
    },
  );
});


test("partner Google linking requires the existing account password", () => {
  assert.deepEqual(validateLinkGoogleShippingPartnerAccount({ password: "" }), {
    success: false,
    errors: { password: "This field can't be left empty." },
  });

  assert.deepEqual(
    validateLinkGoogleShippingPartnerAccount({ password: " secure-password " }),
    { success: true, data: { password: "secure-password" } },
  );
});
