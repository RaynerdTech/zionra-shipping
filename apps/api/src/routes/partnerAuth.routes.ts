/**
 * Responsibility:
 * Defines shipping-partner registration, Google linking, and protected
 * onboarding-application routes.
 */

import { Router } from "express";
import multer from "multer";
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
import {
  cancelPartnerApplicationController,
  getPartnerApplicationController,
  removePartnerCompanyLogoController,
  savePartnerAccountInformationController,
  savePartnerBusinessInformationController,
  savePartnerOperationalDetailsController,
  submitPartnerApplicationController,
  uploadPartnerCompanyLogoController,
} from "../controllers/partnerApplication.controller.js";
import { HTTP_STATUS, HttpError } from "../lib/httpError.js";

const router = Router();

const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowed = new Set(["image/jpeg", "image/png"]);
    if (!allowed.has(file.mimetype)) {
      callback(
        new HttpError(
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Select a JPG or PNG image to upload.",
          { errors: { logo: "Only JPG and PNG images are supported." } },
        ),
      );
      return;
    }
    callback(null, true);
  },
});

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

router.get("/application", getPartnerApplicationController);
router.put(
  "/application/business-information",
  savePartnerBusinessInformationController,
);
router.put(
  "/application/operational-details",
  savePartnerOperationalDetailsController,
);
router.put(
  "/application/account-information",
  savePartnerAccountInformationController,
);
router.post(
  "/application/logo",
  (req, res, next) => {
    logoUpload.single("logo")(req, res, (error) => {
      if (!error) {
        void uploadPartnerCompanyLogoController(req, res, next);
        return;
      }

      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        next(
          new HttpError(
            HTTP_STATUS.UNPROCESSABLE_ENTITY,
            "The company logo is too large.",
            { errors: { logo: "The logo must not exceed 5 MB." } },
          ),
        );
        return;
      }

      next(error);
    });
  },
);
router.delete("/application/logo", removePartnerCompanyLogoController);
router.post("/application/submit", submitPartnerApplicationController);
router.delete("/application", cancelPartnerApplicationController);

export default router;