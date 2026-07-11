/**
 * Responsibility:
 * Creates and hashes secure auth-related tokens/codes.
 * Raw OTP/reset codes are sent to the user; only hashed versions are stored in the database.
 */

import crypto from "node:crypto";

export function createSixDigitCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}