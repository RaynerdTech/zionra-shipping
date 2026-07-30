/** Protects shipping-partner login email wording while reusing the shared template. */

import assert from "node:assert/strict";
import test from "node:test";
import { createLoginVerificationCodeEmail } from "../src/emails/LoginVerificationCodeEmail.js";

test("partner login email identifies the shipping-partner account", () => {
  const email = createLoginVerificationCodeEmail({
    firstName: "Jane",
    code: "001234",
    supportEmail: "support@zionra.com",
    accountLabel: "shipping partner",
  });

  assert.match(email.html, /Zionra shipping partner account/);
  assert.match(email.text, /Zionra shipping partner account/);
  assert.match(email.text, /001234/);
});
