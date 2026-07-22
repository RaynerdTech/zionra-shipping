/**
 * Responsibility:
 * Defines customer authentication routes and connects them to controller functions.
 * This file should only describe URLs, middleware, and controller mapping.
 */

import { Router } from "express";
import {
  cancelLoginChallengeController,
  forgotPasswordController,
  getCurrentCustomerController,
  getLoginChallengeController,
  loginCustomerController,
  logoutCustomerController,
  registerCustomerController,
  resendCustomerVerificationCodeController,
  resendLoginCodeController,
  getPasswordResetSessionController,
  resetPasswordController,
  verifyLoginCodeController,
  verifyPasswordResetCodeController,
  verifyCustomerEmailController,
} from "../controllers/customerAuth.controller.js";
import {
  completeGoogleProfileController,
  getPendingGoogleProfileController,
  googleAuthCallbackController,
  linkGoogleAccountController,
  startGoogleAuthController,
} from "../controllers/googleAuth.controller.js";
import { requireCustomerAuth } from "../middleware/requireCustomerAuth.js";

const router = Router();

router.post("/register", registerCustomerController);
router.post("/verify-email", verifyCustomerEmailController);
router.post(
  "/resend-verification-code",
  resendCustomerVerificationCodeController,
);
router.post("/login", loginCustomerController);
router.get("/login/challenge", getLoginChallengeController);
router.post("/login/verify-code", verifyLoginCodeController);
router.post("/login/resend-code", resendLoginCodeController);
router.post("/login/cancel", cancelLoginChallengeController);
router.post("/logout", logoutCustomerController);
router.get("/me", requireCustomerAuth, getCurrentCustomerController);
router.post("/forgot-password", forgotPasswordController);
router.post(
  "/verify-password-reset-code",
  verifyPasswordResetCodeController,
);
router.get("/password-reset-session", getPasswordResetSessionController);
router.post("/reset-password", resetPasswordController);

router.get("/google", startGoogleAuthController);
router.get("/google/callback", googleAuthCallbackController);
router.get("/google/pending-profile", getPendingGoogleProfileController);
router.post(
  "/google/link-existing-account",
  linkGoogleAccountController,
);
router.post("/google/complete-profile", completeGoogleProfileController);

export default router;