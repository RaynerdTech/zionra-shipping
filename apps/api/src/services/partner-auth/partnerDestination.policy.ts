/**
 * Responsibility:
 * Applies the shipping-partner post-authentication routing policy without
 * performing database access. Approval is the only state that grants dashboard access.
 */

import { WEB_ROUTES } from "../../config/routes.js";

type PartnerApplicationRouteState = {
  currentStep: string;
  submittedAt: Date | null;
} | null;

type PartnerDestinationInput = {
  status: string;
  application: PartnerApplicationRouteState;
};

export function getPartnerDestination({
  status,
  application,
}: PartnerDestinationInput) {
  if (status === "APPROVED") {
    return WEB_ROUTES.partnerDashboard;
  }

  if (
    status !== "ONBOARDING" ||
    application?.currentStep === "SUBMITTED" ||
    application?.submittedAt
  ) {
    return WEB_ROUTES.partnerApplicationSubmitted;
  }

  switch (application?.currentStep) {
    case "OPERATIONAL_DETAILS":
      return WEB_ROUTES.partnerOperationalDetails;
    case "ACCOUNT_INFORMATION":
      return WEB_ROUTES.partnerAccountInformation;
    case "REVIEW":
      return WEB_ROUTES.partnerApplicationReview;
    case "SUBMITTED":
      return WEB_ROUTES.partnerApplicationSubmitted;
    case "BUSINESS_INFORMATION":
    default:
      return WEB_ROUTES.partnerBusinessInformation;
  }
}
