/**
 * Responsibility:
 * Protects customer-only API routes.
 * Reads and verifies the database-backed customer session, refreshes activity
 * periodically, and attaches the authenticated customer identity to the request.
 */

import type { NextFunction, Request, Response } from "express";
import {
  AUTH_COOKIE_NAME,
  getCustomerSessionExpiresAt,
  hashSessionToken,
} from "../lib/auth.js";
import {
  clearCustomerAuthCookie,
  setCustomerAuthCookie,
} from "../lib/cookies.js";
import { HTTP_STATUS } from "../lib/httpError.js";
import { prisma } from "../lib/prisma.js";

const SESSION_ACTIVITY_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

type CustomerAuthProfile = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  nationality: string | null;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  countryOfResidence: string;
  referralSource: string | null;
  marketingOptIn: boolean;
  emailVerifiedAt: Date | null;
  createdAt: Date;
};

declare global {
  namespace Express {
    interface Request {
      customerAuth?: {
        customerId: string;
        role: "CUSTOMER";
        customer?: CustomerAuthProfile;
      };
    }
  }
}

async function authenticateCustomer(
  req: Request,
  res: Response,
  next: NextFunction,
  includeCustomer: boolean,
): Promise<void> {
  const token = req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;

  if (!token) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: "Authentication required.",
    });
    return;
  }

  const where = { tokenHash: hashSessionToken(token) };
  let session: {
    id: string;
    customerId: string;
    revokedAt: Date | null;
    expiresAt: Date;
    lastSeenAt: Date;
  } | null;
  let customer: CustomerAuthProfile | undefined;

  if (includeCustomer) {
    const sessionWithCustomer = await prisma.customerSession.findUnique({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            nationality: true,
            email: true,
            phoneCountryCode: true,
            phoneNumber: true,
            countryOfResidence: true,
            referralSource: true,
            marketingOptIn: true,
            emailVerifiedAt: true,
            createdAt: true,
          },
        },
      },
    });
    session = sessionWithCustomer;
    customer = sessionWithCustomer?.customer ?? undefined;
  } else {
    session = await prisma.customerSession.findUnique({ where });
  }

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    clearCustomerAuthCookie(res);
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: "Invalid or expired session.",
    });
    return;
  }

  const now = new Date();
  if (
    now.getTime() - session.lastSeenAt.getTime() >=
    SESSION_ACTIVITY_REFRESH_INTERVAL_MS
  ) {
    await prisma.customerSession.update({
      where: { id: session.id },
      data: {
        lastSeenAt: now,
        expiresAt: getCustomerSessionExpiresAt(),
      },
    });
    setCustomerAuthCookie(res, token);
  }

  req.customerAuth = {
    customerId: session.customerId,
    role: "CUSTOMER",
    ...(customer ? { customer } : {}),
  };

  next();
}

export async function requireCustomerAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  await authenticateCustomer(req, res, next, false);
}

export async function requireCustomerAuthWithCustomer(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  await authenticateCustomer(req, res, next, true);
}
