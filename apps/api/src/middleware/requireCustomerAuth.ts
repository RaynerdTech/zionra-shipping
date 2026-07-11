/**
 * Responsibility:
 * Protects customer-only API routes.
 * Reads the customer session cookie, verifies the database-backed session,
 * refreshes the session expiry on activity, and attaches customer auth data to the request.
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

declare global {
  namespace Express {
    interface Request {
      customerAuth?: {
        customerId: string;
        role: "CUSTOMER";
      };
    }
  }
}

export async function requireCustomerAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;

  if (!token) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: "Authentication required.",
    });

    return;
  }

  const session = await prisma.customerSession.findUnique({
    where: {
      tokenHash: hashSessionToken(token),
    },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    clearCustomerAuthCookie(res);

    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: "Invalid or expired session.",
    });

    return;
  }

  await prisma.customerSession.update({
    where: {
      id: session.id,
    },
    data: {
      lastSeenAt: new Date(),
      expiresAt: getCustomerSessionExpiresAt(),
    },
  });

  setCustomerAuthCookie(res, token);

  req.customerAuth = {
    customerId: session.customerId,
    role: "CUSTOMER",
  };

  next();
}