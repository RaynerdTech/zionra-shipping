/**
 * Responsibility:
 * Creates, revokes, and reads authenticated customer sessions and customer profile data.
 */

import { prisma } from "../../lib/prisma.js";
import {
  createCustomerSessionToken,
  getCustomerSessionExpiresAt,
  hashSessionToken,
} from "../../lib/auth.js";
import { HTTP_STATUS, HttpError } from "../../lib/httpError.js";
import { toPublicCustomer } from "./customerAuth.shared.js";

export async function createCustomerSession(customerId: string) {
  const sessionToken = createCustomerSessionToken();

  await prisma.customerSession.create({
    data: {
      customerId,
      tokenHash: hashSessionToken(sessionToken),
      expiresAt: getCustomerSessionExpiresAt(),
    },
  });

  return sessionToken;
}

export async function logoutCustomer(sessionToken: string | undefined) {
  if (sessionToken) {
    await prisma.customerSession.updateMany({
      where: {
        tokenHash: hashSessionToken(sessionToken),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  return {
    message: "Signed out successfully.",
  };
}

export async function getCurrentCustomer(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  });

  if (!customer) {
    throw new HttpError(
      HTTP_STATUS.UNAUTHORIZED,
      "Customer account no longer exists.",
    );
  }

  return {
    customer: toPublicCustomer(customer),
  };
}
