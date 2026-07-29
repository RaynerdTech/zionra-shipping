/**
 * Responsibility:
 * Retries pending shipping-partner application receipt emails as a manual or
 * scheduled maintenance command.
 */

import { prisma } from "../lib/prisma.js";
import { retryPendingPartnerApplicationReceivedEmails } from "../services/partnerApplicationEmail.service.js";

const requestedLimit = Number.parseInt(process.argv[2] ?? "50", 10);
const limit = Number.isFinite(requestedLimit) ? requestedLimit : 50;

try {
  const summary = await retryPendingPartnerApplicationReceivedEmails(limit);
  console.log("Partner application receipt email retry completed.", summary);
} catch (error) {
  console.error("Partner application receipt email retry failed.", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
