/**
 * Responsibility:
 * Connects partner application receipt delivery to Prisma and Resend, and
 * exposes a retry path for submitted applications whose receipt is pending.
 */

import { prisma } from "../lib/prisma.js";
import { sendPartnerApplicationReceivedEmail } from "./email.service.js";
import {
  deliverPartnerApplicationReceipt,
  type PartnerApplicationReceiptDeliveryResult,
} from "./partnerApplicationReceiptDelivery.js";

function toReceiptRecord(application: {
  id: string;
  applicationReference: string | null;
  submittedAt: Date | null;
  submissionEmailSentAt: Date | null;
  partner: {
    id: string;
    firstName: string;
    email: string;
  };
}) {
  return {
    applicationId: application.id,
    partnerId: application.partner.id,
    firstName: application.partner.firstName,
    email: application.partner.email,
    applicationReference: application.applicationReference,
    submittedAt: application.submittedAt,
    submissionEmailSentAt: application.submissionEmailSentAt,
  };
}

export async function attemptPartnerApplicationReceivedEmail(
  applicationId: string,
): Promise<PartnerApplicationReceiptDeliveryResult> {
  const application = await prisma.shippingPartnerApplication.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      applicationReference: true,
      submittedAt: true,
      submissionEmailSentAt: true,
      partner: {
        select: {
          id: true,
          firstName: true,
          email: true,
        },
      },
    },
  });

  if (!application) {
    return { status: "skipped", reason: "not_submitted" };
  }

  return deliverPartnerApplicationReceipt(toReceiptRecord(application), {
    now: () => new Date(),
    sendEmail: sendPartnerApplicationReceivedEmail,
    markSent: async (id, sentAt) => {
      await prisma.shippingPartnerApplication.updateMany({
        where: { id, submissionEmailSentAt: null },
        data: {
          submissionEmailSentAt: sentAt,
          submissionEmailLastAttemptAt: sentAt,
          submissionEmailLastError: null,
        },
      });
    },
    markFailed: async (id, attemptedAt, errorMessage) => {
      await prisma.shippingPartnerApplication.updateMany({
        where: { id, submissionEmailSentAt: null },
        data: {
          submissionEmailLastAttemptAt: attemptedAt,
          submissionEmailLastError: errorMessage,
        },
      });
    },
    logError: (message, context) => console.error(message, context),
  });
}

export async function retryPendingPartnerApplicationReceivedEmails(
  limit = 50,
) {
  const applications = await prisma.shippingPartnerApplication.findMany({
    where: {
      submittedAt: { not: null },
      applicationReference: { not: null },
      submissionEmailSentAt: null,
    },
    select: { id: true },
    orderBy: { submittedAt: "asc" },
    take: Math.max(1, Math.min(limit, 250)),
  });

  const summary = {
    checked: applications.length,
    sent: 0,
    skipped: 0,
    failed: 0,
  };

  for (const application of applications) {
    const result = await attemptPartnerApplicationReceivedEmail(application.id);
    summary[result.status] += 1;
  }

  return summary;
}
