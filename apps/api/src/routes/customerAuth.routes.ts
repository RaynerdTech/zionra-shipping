/**
 * Responsibility:
 * Defines customer authentication routes and connects them to controller functions.
 * This file should only describe URLs, middleware, and controller mapping.
 */

import { Router } from "express";
import {
  forgotPasswordController,
  getCurrentCustomerController,
  loginCustomerController,
  logoutCustomerController,
  registerCustomerController,
  resendCustomerVerificationCodeController,
  resetPasswordController,
  verifyCustomerEmailController,
} from "../controllers/customerAuth.controller.js";
import { requireCustomerAuth } from "../middleware/requireCustomerAuth.js";

const router = Router();

router.post("/register", registerCustomerController);
router.post("/verify-email", verifyCustomerEmailController);
router.post(
  "/resend-verification-code",
  resendCustomerVerificationCodeController,
);
router.post("/login", loginCustomerController);
router.post("/logout", logoutCustomerController);
router.get("/me", requireCustomerAuth, getCurrentCustomerController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

export default router;