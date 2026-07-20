/**
 * Responsibility:
 * Defines Google OAuth cookie names, token lifetimes, and cryptographic helpers.
 * Raw signup tokens are sent only through httpOnly cookies; the database stores hashes.
 */

import crypto from "node:crypto";

export const GOOGLE_OAUTH_STATE_COOKIE_NAME = "zionra_google_oauth_state";
export const GOOGLE_OAUTH_PKCE_COOKIE_NAME = "zionra_google_oauth_pkce";
export const GOOGLE_OAUTH_NONCE_COOKIE_NAME = "zionra_google_oauth_nonce";
export const GOOGLE_SIGNUP_COOKIE_NAME = "zionra_google_signup";

export const GOOGLE_OAUTH_COOKIE_DURATION_MS = 10 * 60 * 1000;
export const GOOGLE_SIGNUP_DURATION_MS = 15 * 60 * 1000;

export function createGoogleOAuthState() {
  return crypto.randomBytes(32).toString("hex");
}

export function createGoogleOAuthNonce() {
  return crypto.randomBytes(32).toString("hex");
}

export function createGoogleSignupToken() {
  return crypto.randomBytes(64).toString("hex");
}

export function hashGoogleSignupToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getGoogleSignupExpiresAt() {
  return new Date(Date.now() + GOOGLE_SIGNUP_DURATION_MS);
}

export function securelyMatches(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}
