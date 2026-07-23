/**
 * Responsibility:
 * Protects request validation and normalization for customer-authentication inputs.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizePhoneNumber,
  validateEmailCodeInput,
  validateLoginCustomer,
  validateLoginVerificationCode,
  validateRegisterCustomer,
  validateResetPassword,
} from "../src/validators/customerAuth.validators.js";

const validRegistrationBody = {
  firstName: "  Rudy  ",
  lastName: "  Romero  ",
  email: "  RUDY@EXAMPLE.COM  ",
  phoneCountryCode: "+44",
  phoneNumber: " 07700 900-123 ",
  password: "secure-password",
  confirmPassword: "secure-password",
  countryOfResidence: "United Kingdom",
  referralSource: "",
  acceptedTerms: true,
  marketingOptIn: false,
};

test("registration validation normalizes customer input", () => {
  const result = validateRegisterCustomer(validRegistrationBody);

  assert.equal(result.success, true);

  if (!result.success) {
    return;
  }

  assert.deepEqual(result.data, {
    firstName: "Rudy",
    lastName: "Romero",
    email: "rudy@example.com",
    phoneCountryCode: "+44",
    phoneNumber: "07700900123",
    password: "secure-password",
    countryOfResidence: "United Kingdom",
    referralSource: null,
    acceptedTerms: true,
    marketingOptIn: false,
  });
});

test("registration validation reports required fields before format errors", () => {
  const result = validateRegisterCustomer({});

  assert.equal(result.success, false);

  if (result.success) {
    return;
  }

  assert.equal(result.errors.firstName, "This field can't be left empty.");
  assert.equal(result.errors.lastName, "This field can't be left empty.");
  assert.equal(result.errors.email, "This field can't be left empty.");
  assert.equal(result.errors.phoneNumber, "This field can't be left empty.");
  assert.equal(result.errors.password, "This field can't be left empty.");
  assert.equal(
    result.errors.confirmPassword,
    "This field can't be left empty.",
  );
  assert.equal(
    result.errors.acceptedTerms,
    "You must agree to Zionra's Terms of Service and Privacy Policy.",
  );
});

test("registration validation rejects mismatched passwords", () => {
  const result = validateRegisterCustomer({
    ...validRegistrationBody,
    confirmPassword: "different-password",
  });

  assert.equal(result.success, false);

  if (result.success) {
    return;
  }

  assert.equal(result.errors.confirmPassword, "Passwords do not match.");
});

test("login validation trims and lowercases the email address", () => {
  const result = validateLoginCustomer({
    email: "  CUSTOMER@ZIONRA.COM ",
    password: " password-value ",
  });

  assert.deepEqual(result, {
    success: true,
    data: {
      email: "customer@zionra.com",
      password: "password-value",
    },
  });
});

test("login validation reports input errors without querying account data", () => {
  const invalidEmail = validateLoginCustomer({
    email: "not-an-email",
    password: "password-value",
  });
  const missingPassword = validateLoginCustomer({
    email: "customer@zionra.com",
    password: "",
  });

  assert.equal(invalidEmail.success, false);
  assert.equal(missingPassword.success, false);

  if (!invalidEmail.success) {
    assert.equal(invalidEmail.errors.email, "Enter a valid email address.");
  }

  if (!missingPassword.success) {
    assert.equal(
      missingPassword.errors.password,
      "This field can't be left empty.",
    );
  }
});

test("OTP validation accepts exactly six digits", () => {
  assert.deepEqual(validateLoginVerificationCode({ code: "012345" }), {
    success: true,
    data: {
      code: "012345",
    },
  });

  const shortCode = validateLoginVerificationCode({ code: "12345" });
  const alphabeticCode = validateLoginVerificationCode({ code: "12A456" });

  assert.equal(shortCode.success, false);
  assert.equal(alphabeticCode.success, false);
});

test("email-code validation normalizes email and preserves leading-zero OTPs", () => {
  const result = validateEmailCodeInput({
    email: "  RESET@EXAMPLE.COM ",
    code: "001234",
  });

  assert.deepEqual(result, {
    success: true,
    data: {
      email: "reset@example.com",
      code: "001234",
    },
  });
});

test("reset-password validation enforces length and confirmation", () => {
  const shortPassword = validateResetPassword({
    password: "short",
    confirmPassword: "short",
  });
  const mismatch = validateResetPassword({
    password: "secure-password",
    confirmPassword: "different-password",
  });
  const valid = validateResetPassword({
    password: "secure-password",
    confirmPassword: "secure-password",
  });

  assert.equal(shortPassword.success, false);
  assert.equal(mismatch.success, false);
  assert.deepEqual(valid, {
    success: true,
    data: {
      password: "secure-password",
    },
  });

  if (!shortPassword.success) {
    assert.equal(
      shortPassword.errors.password,
      "Password must be at least 8 characters.",
    );
  }

  if (!mismatch.success) {
    assert.equal(mismatch.errors.confirmPassword, "Passwords do not match.");
  }
});

test("phone normalization removes presentation characters", () => {
  assert.equal(normalizePhoneNumber("+44 (0)7700-900 123"), "4407700900123");
});
