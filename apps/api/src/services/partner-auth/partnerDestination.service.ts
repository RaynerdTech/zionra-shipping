/**
 * Responsibility:
 * Loads the current shipping-partner application state and resolves the correct
 * frontend destination through the shared post-authentication routing policy.
 */

import { prisma } from "../../lib/prisma.js";
import { getPartnerDestination } from "./partnerDestination.policy.js";

type PartnerRouteInput = {
  id: string;
  status: string;
};

export async function resolvePartnerDestination(partner: PartnerRouteInput) {
  const application = await prisma.shippingPartnerApplication.findUnique({
    where: { partnerId: partner.id },
    select: {
      currentStep: true,
      submittedAt: true,
    },
  });

  return getPartnerDestination({
    status: partner.status,
    application,
  });
}
