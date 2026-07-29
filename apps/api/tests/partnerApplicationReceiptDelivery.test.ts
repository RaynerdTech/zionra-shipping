/** Protects partner application receipt email content and delivery behavior. */

import assert from "node:assert/strict";
import test from "node:test";
import { createPartnerApplicationReceivedEmail } from "../src/emails/PartnerApplicationReceivedEmail.js";
import {
  deliverPartnerApplicationReceipt,
  type PartnerApplicationReceiptRecord,
} from "../src/services/partnerApplicationReceiptDelivery.js";

const submittedRecord: PartnerApplicationReceiptRecord = {
  applicationId: "application-1",
  partnerId: "partner-1",
  firstName: "Jane",
  email: "jane@example.com",
  applicationReference: "ZNR-AGENT-12345",
  submittedAt: new Date("2026-07-29T05:30:00.000Z"),
  submissionEmailSentAt: null,
};

test("application receipt email includes the reference and review timeframe", () => {
  const email = createPartnerApplicationReceivedEmail({
    firstName: "<Jane>",
    applicationReference: "ZNR-AGENT-12345",
    supportEmail: "support@zionra.com",
  });

  assert.equal(email.subject, "We’ve received your Zionra partner application");
  assert.match(email.html, /ZNR-AGENT-12345/);
  assert.match(email.html, /2–3 business days/);
  assert.doesNotMatch(email.html, /Hi <Jane>/);
  assert.match(email.text, /No action is required/);
});

test("successful delivery is marked and a repeated attempt is skipped", async () => {
  let sentAt: Date | null = null;
  let sendCount = 0;
  const now = new Date("2026-07-29T05:31:00.000Z");

  const dependencies = {
    now: () => now,
    sendEmail: async () => {
      sendCount += 1;
      return "email-id";
    },
    markSent: async (_applicationId: string, value: Date) => {
      sentAt = value;
    },
    markFailed: async () => undefined,
    logError: () => undefined,
  };

  const first = await deliverPartnerApplicationReceipt(
    submittedRecord,
    dependencies,
  );
  assert.deepEqual(first, { status: "sent", sentAt: now });
  assert.equal(sentAt, now);
  assert.equal(sendCount, 1);

  const second = await deliverPartnerApplicationReceipt(
    { ...submittedRecord, submissionEmailSentAt: sentAt },
    dependencies,
  );
  assert.deepEqual(second, { status: "skipped", reason: "already_sent" });
  assert.equal(sendCount, 1);
});

test("delivery failure is recorded without throwing or marking the email sent", async () => {
  let markedSent = false;
  let failureMessage = "";
  let logged = false;
  const now = new Date("2026-07-29T05:32:00.000Z");

  const result = await deliverPartnerApplicationReceipt(submittedRecord, {
    now: () => now,
    sendEmail: async () => {
      throw new Error("Resend unavailable");
    },
    markSent: async () => {
      markedSent = true;
    },
    markFailed: async (_applicationId, attemptedAt, message) => {
      assert.equal(attemptedAt, now);
      failureMessage = message;
    },
    logError: () => {
      logged = true;
    },
  });

  assert.deepEqual(result, {
    status: "failed",
    attemptedAt: now,
    error: "Resend unavailable",
  });
  assert.equal(markedSent, false);
  assert.equal(failureMessage, "Resend unavailable");
  assert.equal(logged, true);
});
