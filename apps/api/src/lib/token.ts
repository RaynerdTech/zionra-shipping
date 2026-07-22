/**
 * Responsibility:
 * Creates, hashes, compares, and expires secure authentication tokens and codes.
 * Raw OTP and reset-authorization values are never stored in the database.
 */

import crypto from "node:crypto";

export const CUSTOMER_PASSWORD_RESET_AUTH_COOKIE_NAME =
  "zionra_customer_password_reset";
export const CUSTOMER_PASSWORD_RESET_AUTH_DURATION_MS = 10 * 60 * 1000;

export const CUSTOMER_LOGIN_CHALLENGE_COOKIE_NAME =
  "zionra_customer_login_challenge";
export const CUSTOMER_LOGIN_CHALLENGE_DURATION_MS = 10 * 60 * 1000;
export const CUSTOMER_LOGIN_CODE_DURATION_MS = 1 * 60 * 1000;

export function createSixDigitCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function createPasswordResetAuthorizationToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function createCustomerLoginChallengeToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function securelyMatchesTokenHash(
  rawToken: string,
  expectedHash: string,
) {
  const actualBuffer = Buffer.from(hashToken(rawToken), "hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function getPasswordResetAuthorizationExpiresAt() {
  return new Date(Date.now() + CUSTOMER_PASSWORD_RESET_AUTH_DURATION_MS);
}

export function getCustomerLoginChallengeExpiresAt() {
  return new Date(Date.now() + CUSTOMER_LOGIN_CHALLENGE_DURATION_MS);
}

export function getCustomerLoginCodeExpiresAt() {
  return new Date(Date.now() + CUSTOMER_LOGIN_CODE_DURATION_MS);
}