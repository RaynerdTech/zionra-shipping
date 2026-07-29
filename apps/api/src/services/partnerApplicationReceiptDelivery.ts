/**
 * Responsibility:
 * Coordinates one safe attempt to deliver a shipping-partner application
 * receipt email without allowing email-provider failures to undo submission.
 */

export type PartnerApplicationReceiptRecord = {
  applicationId: string;
  partnerId: string;
  firstName: string;
  email: string;
  applicationReference: string | null;
  submittedAt: Date | null;
  submissionEmailSentAt: Date | null;
};

export type PartnerApplicationReceiptDeliveryResult =
  | { status: "sent"; sentAt: Date }
  | { status: "skipped"; reason: "not_submitted" | "already_sent" }
  | { status: "failed"; attemptedAt: Date; error: string };

export type PartnerApplicationReceiptDeliveryDependencies = {
  now: () => Date;
  sendEmail: (input: {
    applicationId: string;
    partnerId: string;
    firstName: string;
    email: string;
    applicationReference: string;
  }) => Promise<unknown>;
  markSent: (applicationId: string, sentAt: Date) => Promise<void>;
  markFailed: (
    applicationId: string,
    attemptedAt: Date,
    errorMessage: string,
  ) => Promise<void>;
  logError: (message: string, context: Record<string, unknown>) => void;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown email delivery error.";
}

export async function deliverPartnerApplicationReceipt(
  record: PartnerApplicationReceiptRecord,
  dependencies: PartnerApplicationReceiptDeliveryDependencies,
): Promise<PartnerApplicationReceiptDeliveryResult> {
  if (!record.submittedAt || !record.applicationReference) {
    return { status: "skipped", reason: "not_submitted" };
  }

  if (record.submissionEmailSentAt) {
    return { status: "skipped", reason: "already_sent" };
  }

  const attemptedAt = dependencies.now();

  try {
    await dependencies.sendEmail({
      applicationId: record.applicationId,
      partnerId: record.partnerId,
      firstName: record.firstName,
      email: record.email,
      applicationReference: record.applicationReference,
    });
    await dependencies.markSent(record.applicationId, attemptedAt);

    return { status: "sent", sentAt: attemptedAt };
  } catch (error) {
    const message = errorMessage(error).slice(0, 1000);

    try {
      await dependencies.markFailed(record.applicationId, attemptedAt, message);
    } catch (trackingError) {
      dependencies.logError(
        "Unable to record a failed partner application receipt email attempt.",
        {
          applicationId: record.applicationId,
          trackingError,
        },
      );
    }

    dependencies.logError("Unable to send partner application receipt email.", {
      applicationId: record.applicationId,
      partnerId: record.partnerId,
      email: record.email,
      error,
    });

    return { status: "failed", attemptedAt, error: message };
  }
}
