/**
 * Responsibility:
 * Creates and validates shipping-partner onboarding sessions.
 * Raw session tokens are stored only in httpOnly cookies; Neon stores hashes.
 */

import crypto from "node:crypto";

export const PARTNER_ONBOARDING_COOKIE_NAME =
  "zionra_shipping_partner_onboarding";
export const PARTNER_ONBOARDING_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function createPartnerOnboardingToken() {
  return crypto.randomBytes(64).toString("hex");
}

export function hashPartnerOnboardingToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getPartnerOnboardingExpiresAt() {
  return new Date(Date.now() + PARTNER_ONBOARDING_DURATION_MS);
}
