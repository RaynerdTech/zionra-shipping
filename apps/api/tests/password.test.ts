/**
 * Responsibility:
 * Protects password hashing and verification behavior.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../src/lib/password.js";

test("password hashes do not expose the original password", async () => {
  const password = "zionra-secure-password";
  const passwordHash = await hashPassword(password);

  assert.notEqual(passwordHash, password);
  assert.match(passwordHash, /^\$2[aby]\$/);
});

test("password verification accepts only the matching password", async () => {
  const passwordHash = await hashPassword("correct-password");

  assert.equal(await verifyPassword("correct-password", passwordHash), true);
  assert.equal(await verifyPassword("wrong-password", passwordHash), false);
});
