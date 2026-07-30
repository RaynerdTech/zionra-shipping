/** Protects shipping-partner post-login routing and dashboard authorization policy. */

import assert from "node:assert/strict";
import test from "node:test";
import { WEB_ROUTES } from "../src/config/routes.js";
import { getPartnerDestination } from "../src/services/partner-auth/partnerDestination.policy.js";

test("approved partners are routed to the dashboard", () => {
  assert.equal(
    getPartnerDestination({
      status: "APPROVED",
      application: {
        currentStep: "SUBMITTED",
        submittedAt: new Date(),
      },
    }),
    WEB_ROUTES.partnerDashboard,
  );
});

test("submitted partners who are not approved remain on the submitted screen", () => {
  for (const status of [
    "APPLICATION_SUBMITTED",
    "UNDER_REVIEW",
    "REJECTED",
    "SUSPENDED",
  ]) {
    assert.equal(
      getPartnerDestination({
        status,
        application: {
          currentStep: "SUBMITTED",
          submittedAt: new Date(),
        },
      }),
      WEB_ROUTES.partnerApplicationSubmitted,
    );
  }
});

test("onboarding partners resume from their current application step", () => {
  const expectations = [
    ["BUSINESS_INFORMATION", WEB_ROUTES.partnerBusinessInformation],
    ["OPERATIONAL_DETAILS", WEB_ROUTES.partnerOperationalDetails],
    ["ACCOUNT_INFORMATION", WEB_ROUTES.partnerAccountInformation],
    ["REVIEW", WEB_ROUTES.partnerApplicationReview],
  ] as const;

  for (const [currentStep, expectedRoute] of expectations) {
    assert.equal(
      getPartnerDestination({
        status: "ONBOARDING",
        application: { currentStep, submittedAt: null },
      }),
      expectedRoute,
    );
  }
});
