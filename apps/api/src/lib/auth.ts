/**
 * Responsibility:
 * Creates and hashes customer session tokens.
 * The raw session token is stored only in an httpOnly cookie; the database stores only its hash.
 */

import crypto from "node:crypto";

export const AUTH_COOKIE_NAME = "zionra_customer_session";

export const CUSTOMER_SESSION_DURATION_DAYS = 14;

export const CUSTOMER_SESSION_DURATION_MS =
  CUSTOMER_SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

export function createCustomerSessionToken() {
  return crypto.randomBytes(64).toString("hex");
}

export function hashSessionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getCustomerSessionExpiresAt() {
  return new Date(Date.now() + CUSTOMER_SESSION_DURATION_MS);
}