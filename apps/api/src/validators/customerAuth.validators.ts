/**
 * Responsibility:
 * Validates and normalizes request bodies for customer authentication flows.
 * Required-empty validation has highest priority before format-specific errors.
 */

import type { FieldErrors } from "../lib/httpError.js";

const REQUIRED_MESSAGE = "This field can't be left empty.";

type RequestBody = Record<string, unknown>;

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

type ValidationFailure = {
  success: false;
  errors: FieldErrors;
};

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export type RegisterCustomerInput = {
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

export type LoginCustomerInput = {
  email: string;
  password: string;
};

export type EmailInput = {
  email: string;
};

export type EmailCodeInput = {
  email: string;
  code: string;
};

export type ResetPasswordInput = {
  email: string;
  code: string;
  password: string;
};

function toBody(body: unknown): RequestBody {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }

  return body as RequestBody;
}

function getString(body: RequestBody, key: string) {
  const value = body[key];

  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(body: RequestBody, key: string) {
  return body[key] === true;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/\D/g, "");
}

function isValidPhoneNumber(phoneNumber: string) {
  return normalizePhoneNumber(phoneNumber).length >= 7;
}

export function validateRegisterCustomer(
  requestBody: unknown,
): ValidationResult<RegisterCustomerInput> {
  const body = toBody(requestBody);
  const errors: FieldErrors = {};

  const firstName = getString(body, "firstName");
  const lastName = getString(body, "lastName");
  const email = getString(body, "email").toLowerCase();
  const phoneCountryCode = getString(body, "phoneCountryCode");
  const phoneNumber = getString(body, "phoneNumber");
  const password = getString(body, "password");
  const confirmPassword = getString(body, "confirmPassword");
  const countryOfResidence = getString(body, "countryOfResidence");
  const referralSource = getString(body, "referralSource");
  const acceptedTerms = getBoolean(body, "acceptedTerms");
  const marketingOptIn = getBoolean(body, "marketingOptIn");

  if (!firstName) errors.firstName = REQUIRED_MESSAGE;
  if (!lastName) errors.lastName = REQUIRED_MESSAGE;

  if (!email) {
    errors.email = REQUIRED_MESSAGE;
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!phoneCountryCode) {
    errors.phoneCountryCode = REQUIRED_MESSAGE;
  }

  if (!phoneNumber) {
    errors.phoneNumber = REQUIRED_MESSAGE;
  } else if (!isValidPhoneNumber(phoneNumber)) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  if (!password) {
    errors.password = REQUIRED_MESSAGE;
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = REQUIRED_MESSAGE;
  } else if (password && password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!countryOfResidence) {
    errors.countryOfResidence = REQUIRED_MESSAGE;
  }

  if (!acceptedTerms) {
    errors.acceptedTerms =
      "You must agree to Zionra's Terms of Service and Privacy Policy.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: {
      firstName,
      lastName,
      email,
      phoneCountryCode,
      phoneNumber: normalizePhoneNumber(phoneNumber),
      password,
      countryOfResidence,
      referralSource: referralSource || null,
      acceptedTerms,
      marketingOptIn,
    },
  };
}

export function validateLoginCustomer(
  requestBody: unknown,
): ValidationResult<LoginCustomerInput> {
  const body = toBody(requestBody);
  const errors: FieldErrors = {};

  const email = getString(body, "email").toLowerCase();
  const password = getString(body, "password");

  if (!email) {
    errors.email = REQUIRED_MESSAGE;
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = REQUIRED_MESSAGE;
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: {
      email,
      password,
    },
  };
}

export function validateEmailInput(
  requestBody: unknown,
): ValidationResult<EmailInput> {
  const body = toBody(requestBody);
  const errors: FieldErrors = {};

  const email = getString(body, "email").toLowerCase();

  if (!email) {
    errors.email = REQUIRED_MESSAGE;
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: {
      email,
    },
  };
}

export function validateEmailCodeInput(
  requestBody: unknown,
): ValidationResult<EmailCodeInput> {
  const body = toBody(requestBody);
  const emailValidation = validateEmailInput(requestBody);
  const code = getString(body, "code");
  const errors: FieldErrors = emailValidation.success
    ? {}
    : { ...emailValidation.errors };

  if (!code) {
    errors.code = REQUIRED_MESSAGE;
  } else if (!/^\d{6}$/.test(code)) {
    errors.code = "Enter the 6 digit verification code.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: {
      email: emailValidation.success ? emailValidation.data.email : "",
      code,
    },
  };
}

export function validateResetPassword(
  requestBody: unknown,
): ValidationResult<ResetPasswordInput> {
  const body = toBody(requestBody);
  const codeValidation = validateEmailCodeInput(requestBody);
  const password = getString(body, "password");
  const confirmPassword = getString(body, "confirmPassword");

  const errors: FieldErrors = codeValidation.success
    ? {}
    : { ...codeValidation.errors };

  if (!password) {
    errors.password = REQUIRED_MESSAGE;
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = REQUIRED_MESSAGE;
  } else if (password && password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: {
      email: codeValidation.success ? codeValidation.data.email : "",
      code: codeValidation.success ? codeValidation.data.code : "",
      password,
    },
  };
}