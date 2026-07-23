/**
 * Responsibility:
 * Contains small customer-auth helpers shared by registration, login, and session services.
 */

import { env } from "../../config/env.js";

type PublicCustomerInput = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  countryOfResidence: string;
  referralSource: string | null;
  marketingOptIn: boolean;
  emailVerifiedAt: Date | null;
  createdAt: Date;
};

export function toPublicCustomer(customer: PublicCustomerInput) {
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phoneCountryCode: customer.phoneCountryCode,
    phoneNumber: customer.phoneNumber,
    countryOfResidence: customer.countryOfResidence,
    referralSource: customer.referralSource,
    marketingOptIn: customer.marketingOptIn,
    emailVerified: Boolean(customer.emailVerifiedAt),
    createdAt: customer.createdAt,
  };
}

export function developmentCodePayload(code: string) {
  if (env.NODE_ENV !== "development") {
    return {};
  }

  return {
    dev: {
      code,
    },
  };
}
