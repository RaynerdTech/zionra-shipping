/**
 * Responsibility:
 * Validates and normalizes shipping-partner registration and Google profile data.
 */

import type { FieldErrors } from "../lib/httpError.js";

const REQUIRED_MESSAGE = "This field can't be left empty.";

type RequestBody = Record<string, unknown>;
type ValidationSuccess<T> = { success: true; data: T };
type ValidationFailure = { success: false; errors: FieldErrors };
type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export type RegisterShippingPartnerInput = {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  password: string;
  countryOfResidence: string;
  referralSource: string | null;
  acceptedTerms: boolean;
  marketingOptIn: boolean;
};

export type CompleteGoogleShippingPartnerProfileInput = Omit<
  RegisterShippingPartnerInput,
  "email" | "password"
>;

export type LinkGoogleShippingPartnerAccountInput = { password: string };
export type PartnerEmailInput = { email: string };
export type PartnerEmailCodeInput = { email: string; code: string };

function toBody(body: unknown): RequestBody {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  return body as RequestBody;
}

function getString(body: RequestBody, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(body: RequestBody, key: string) {
  return body[key] === true;
}

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateProfileFields(body: RequestBody) {
  const errors: FieldErrors = {};
  const firstName = getString(body, "firstName");
  const lastName = getString(body, "lastName");
  const phoneCountryCode = getString(body, "phoneCountryCode");
  const phoneNumber = normalizePhoneNumber(getString(body, "phoneNumber"));
  const countryOfResidence = getString(body, "countryOfResidence");
  const referralSource = getString(body, "referralSource");
  const acceptedTerms = getBoolean(body, "acceptedTerms");
  const marketingOptIn = getBoolean(body, "marketingOptIn");

  if (!firstName) errors.firstName = REQUIRED_MESSAGE;
  if (!lastName) errors.lastName = REQUIRED_MESSAGE;
  if (!phoneCountryCode) errors.phoneCountryCode = REQUIRED_MESSAGE;
  if (!phoneNumber) {
    errors.phoneNumber = REQUIRED_MESSAGE;
  } else if (phoneNumber.length < 7) {
    errors.phoneNumber = "Enter a valid phone number.";
  }
  if (!countryOfResidence) errors.countryOfResidence = REQUIRED_MESSAGE;
  if (!acceptedTerms) {
    errors.acceptedTerms =
      "You must agree to Zionra's Terms of Service and Privacy Policy.";
  }

  return {
    errors,
    data: {
      firstName,
      lastName,
      phoneCountryCode,
      phoneNumber,
      countryOfResidence,
      referralSource: referralSource || null,
      acceptedTerms,
      marketingOptIn,
    },
  };
}

export function validateRegisterShippingPartner(
  requestBody: unknown,
): ValidationResult<RegisterShippingPartnerInput> {
  const body = toBody(requestBody);
  const profile = validateProfileFields(body);
  const errors = { ...profile.errors };
  const email = getString(body, "email").toLowerCase();
  const password = getString(body, "password");
  const confirmPassword = getString(body, "confirmPassword");

  if (!email) errors.email = REQUIRED_MESSAGE;
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";

  if (!password) errors.password = REQUIRED_MESSAGE;
  else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) errors.confirmPassword = REQUIRED_MESSAGE;
  else if (password && password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(errors).length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      ...profile.data,
      email,
      password,
    },
  };
}

export function validateCompleteGoogleShippingPartnerProfile(
  requestBody: unknown,
): ValidationResult<CompleteGoogleShippingPartnerProfileInput> {
  const validation = validateProfileFields(toBody(requestBody));

  if (Object.keys(validation.errors).length > 0) {
    return { success: false, errors: validation.errors };
  }

  return { success: true, data: validation.data };
}


export function validateLinkGoogleShippingPartnerAccount(
  requestBody: unknown,
): ValidationResult<LinkGoogleShippingPartnerAccountInput> {
  const password = getString(toBody(requestBody), "password");
  const errors: FieldErrors = {};

  if (!password) {
    errors.password = REQUIRED_MESSAGE;
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: { password } };
}

export function validatePartnerEmail(
  requestBody: unknown,
): ValidationResult<PartnerEmailInput> {
  const email = getString(toBody(requestBody), "email").toLowerCase();
  const errors: FieldErrors = {};
  if (!email) errors.email = REQUIRED_MESSAGE;
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  return Object.keys(errors).length
    ? { success: false, errors }
    : { success: true, data: { email } };
}

export function validatePartnerEmailCode(
  requestBody: unknown,
): ValidationResult<PartnerEmailCodeInput> {
  const body = toBody(requestBody);
  const emailValidation = validatePartnerEmail(body);
  const errors: FieldErrors = emailValidation.success
    ? {}
    : { ...emailValidation.errors };
  const code = getString(body, "code");

  if (!code) errors.code = REQUIRED_MESSAGE;
  else if (!/^\d{6}$/.test(code)) {
    errors.code = "Enter the 6 digit verification code.";
  }

  if (Object.keys(errors).length > 0) return { success: false, errors };
  return {
    success: true,
    data: { email: emailValidation.success ? emailValidation.data.email : "", code },
  };
}

export type LoginShippingPartnerInput = {
  email: string;
  password: string;
  marketingOptIn: boolean;
};

export type PartnerLoginVerificationCodeInput = {
  code: string;
};

export type PartnerPasswordResetCodeInput = {
  email: string;
  code: string;
};

export type ResetShippingPartnerPasswordInput = {
  password: string;
};

export function validateLoginShippingPartner(
  requestBody: unknown,
): ValidationResult<LoginShippingPartnerInput> {
  const body = toBody(requestBody);
  const email = getString(body, "email").toLowerCase();
  const password = getString(body, "password");
  const marketingOptIn = getBoolean(body, "marketingOptIn");
  const errors: FieldErrors = {};

  if (!email) errors.email = REQUIRED_MESSAGE;
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";

  if (!password) errors.password = REQUIRED_MESSAGE;

  return Object.keys(errors).length
    ? { success: false, errors }
    : { success: true, data: { email, password, marketingOptIn } };
}

export function validatePartnerLoginVerificationCode(
  requestBody: unknown,
): ValidationResult<PartnerLoginVerificationCodeInput> {
  const code = getString(toBody(requestBody), "code");
  const errors: FieldErrors = {};

  if (!code) errors.code = REQUIRED_MESSAGE;
  else if (!/^\d{6}$/.test(code)) {
    errors.code = "Enter the 6 digit verification code.";
  }

  return Object.keys(errors).length
    ? { success: false, errors }
    : { success: true, data: { code } };
}

export function validatePartnerPasswordResetCode(
  requestBody: unknown,
): ValidationResult<PartnerPasswordResetCodeInput> {
  return validatePartnerEmailCode(requestBody);
}

export function validateResetShippingPartnerPassword(
  requestBody: unknown,
): ValidationResult<ResetShippingPartnerPasswordInput> {
  const body = toBody(requestBody);
  const password = getString(body, "password");
  const confirmPassword = getString(body, "confirmPassword");
  const errors: FieldErrors = {};

  if (!password) errors.password = REQUIRED_MESSAGE;
  else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) errors.confirmPassword = REQUIRED_MESSAGE;
  else if (password && password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return Object.keys(errors).length
    ? { success: false, errors }
    : { success: true, data: { password } };
}
