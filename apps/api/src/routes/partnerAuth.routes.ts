/**
 * Responsibility:
 * Defines shipping-partner registration and onboarding-authentication routes.
 */

import { Router } from "express";
import {
  completePartnerGoogleProfileController,
  getCurrentShippingPartnerController,
  getPendingPartnerGoogleProfileController,
  linkPartnerGoogleAccountController,
  registerShippingPartnerController,
  resendShippingPartnerVerificationCodeController,
  startPartnerGoogleAuthController,
  verifyShippingPartnerEmailController,
} from "../controllers/partnerAuth.controller.js";

const router = Router();

router.post("/register", registerShippingPartnerController);
router.post("/verify-email", verifyShippingPartnerEmailController);
router.post(
  "/resend-verification-code",
  resendShippingPartnerVerificationCodeController,
);
router.get("/me", getCurrentShippingPartnerController);
router.get("/google", startPartnerGoogleAuthController);
router.get("/google/pending-profile", getPendingPartnerGoogleProfileController);
router.post(
  "/google/link-existing-account",
  linkPartnerGoogleAccountController,
);
router.post(
  "/google/complete-profile",
  completePartnerGoogleProfileController,
);

export default router;
