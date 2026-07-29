-- Track delivery of the partner application receipt email without coupling
-- email-provider availability to the application submission transaction.
ALTER TABLE "ShippingPartnerApplication"
ADD COLUMN "submissionEmailSentAt" TIMESTAMP(3),
ADD COLUMN "submissionEmailLastAttemptAt" TIMESTAMP(3),
ADD COLUMN "submissionEmailLastError" TEXT;

CREATE INDEX "partner_application_submission_email_pending_idx"
ON "ShippingPartnerApplication"("submittedAt", "submissionEmailSentAt");
