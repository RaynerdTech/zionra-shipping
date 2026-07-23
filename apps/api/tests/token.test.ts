/**
 * Responsibility:
 * Protects the low-level token and OTP guarantees used by customer authentication.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
  CUSTOMER_LOGIN_CHALLENGE_DURATION_MS,
  CUSTOMER_LOGIN_CODE_DURATION_MS,
  CUSTOMER_PASSWORD_RESET_AUTH_DURATION_MS,
  createCustomerLoginChallengeToken,
  createPasswordResetAuthorizationToken,
  createSixDigitCode,
  getCustomerLoginChallengeExpiresAt,
  getCustomerLoginCodeExpiresAt,
  getPasswordResetAuthorizationExpiresAt,
  hashToken,
  securelyMatchesTokenHash,
} from "../src/lib/token.js";

test("createSixDigitCode always returns a six-digit numeric string", () => {
  for (let index = 0; index < 250; index += 1) {
    assert.match(createSixDigitCode(), /^\d{6}$/);
  }
});

test("opaque authentication tokens are URL-safe and independently generated", () => {
  const loginTokenA = createCustomerLoginChallengeToken();
  const loginTokenB = createCustomerLoginChallengeToken();
  const resetToken = createPasswordResetAuthorizationToken();

  assert.match(loginTokenA, /^[A-Za-z0-9_-]+$/);
  assert.match(resetToken, /^[A-Za-z0-9_-]+$/);
  assert.equal(loginTokenA.length, 43);
  assert.equal(resetToken.length, 43);
  assert.notEqual(loginTokenA, loginTokenB);
});

test("hashToken creates a deterministic SHA-256 hash", () => {
  const firstHash = hashToken("zionra-token");
  const secondHash = hashToken("zionra-token");

  assert.equal(firstHash, secondHash);
  assert.match(firstHash, /^[a-f0-9]{64}$/);
  assert.notEqual(firstHash, hashToken("different-token"));
});

test("securelyMatchesTokenHash accepts the correct token and rejects others", () => {
  const expectedHash = hashToken("correct-token");

  assert.equal(securelyMatchesTokenHash("correct-token", expectedHash), true);
  assert.equal(securelyMatchesTokenHash("wrong-token", expectedHash), false);
  assert.equal(securelyMatchesTokenHash("", expectedHash), false);
});

function assertExpiryIsWithinExpectedRange(
  createExpiry: () => Date,
  expectedDurationMs: number,
) {
  const before = Date.now();
  const expiresAt = createExpiry().getTime();
  const after = Date.now();

  assert.ok(expiresAt >= before + expectedDurationMs);
  assert.ok(expiresAt <= after + expectedDurationMs);
}

test("authentication expiry helpers preserve the configured security windows", () => {
  assertExpiryIsWithinExpectedRange(
    getCustomerLoginCodeExpiresAt,
    CUSTOMER_LOGIN_CODE_DURATION_MS,
  );
  assertExpiryIsWithinExpectedRange(
    getCustomerLoginChallengeExpiresAt,
    CUSTOMER_LOGIN_CHALLENGE_DURATION_MS,
  );
  assertExpiryIsWithinExpectedRange(
    getPasswordResetAuthorizationExpiresAt,
    CUSTOMER_PASSWORD_RESET_AUTH_DURATION_MS,
  );
});
