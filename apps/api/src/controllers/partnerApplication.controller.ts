/**
 * Responsibility:
 * Handles protected shipping-partner application draft, upload, cancellation,
 * review, and final-submission requests.
 */

import type { NextFunction, Request, Response } from "express";
import { clearPartnerOnboardingCookie } from "../lib/cookies.js";
import { uploadPartnerLogo } from "../lib/cloudinary.js";
import { HTTP_STATUS, HttpError } from "../lib/httpError.js";
import { PARTNER_ONBOARDING_COOKIE_NAME } from "../lib/partnerAuth.js";
import {
  cancelPartnerApplication,
  getPartnerApplication,
  removePartnerCompanyLogo,
  revokeCurrentPartnerSession,
  savePartnerAccountInformation,
  savePartnerBusinessInformation,
  savePartnerCompanyLogo,
  savePartnerOperationalDetails,
  submitPartnerApplication,
} from "../services/partnerApplication.service.js";
import {
  validatePartnerAccountInformation,
  validatePartnerBusinessInformation,
  validatePartnerOperationalDetails,
} from "../validators/partnerApplication.validators.js";

function getToken(req: Request) {
  return req.cookies?.[PARTNER_ONBOARDING_COOKIE_NAME] as string | undefined;
}

function sendValidationError(res: Response, errors: Record<string, string>) {
  res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
    message: "Validation failed.",
    errors,
  });
}

function forwardError(next: NextFunction, error: unknown, fallbackMessage: string) {
  if (error instanceof HttpError) {
    next(error);
    return;
  }

  console.error(fallbackMessage, error);
  next(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, fallbackMessage));
}

export async function getPartnerApplicationController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.status(HTTP_STATUS.OK).json(await getPartnerApplication(getToken(req)));
  } catch (error) {
    forwardError(next, error, "Unable to load the partner application.");
  }
}

export async function savePartnerBusinessInformationController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validatePartnerBusinessInformation(req.body);
    if ("errors" in validation) {
      sendValidationError(res, validation.errors);
      return;
    }

    const application = await savePartnerBusinessInformation(
      getToken(req),
      validation.data,
    );
    res.status(HTTP_STATUS.OK).json({
      message: "Business information saved.",
      application,
    });
  } catch (error) {
    forwardError(next, error, "Unable to save the business information.");
  }
}

export async function savePartnerOperationalDetailsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validatePartnerOperationalDetails(req.body);
    if ("errors" in validation) {
      sendValidationError(res, validation.errors);
      return;
    }

    const application = await savePartnerOperationalDetails(
      getToken(req),
      validation.data,
    );
    res.status(HTTP_STATUS.OK).json({
      message: "Operational details saved.",
      application,
    });
  } catch (error) {
    forwardError(next, error, "Unable to save the operational details.");
  }
}

export async function savePartnerAccountInformationController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validatePartnerAccountInformation(req.body);
    if ("errors" in validation) {
      sendValidationError(res, validation.errors);
      return;
    }

    const application = await savePartnerAccountInformation(
      getToken(req),
      validation.data,
    );
    res.status(HTTP_STATUS.OK).json({
      message: "Account information saved.",
      application,
    });
  } catch (error) {
    forwardError(next, error, "Unable to save the account information.");
  }
}

export async function uploadPartnerCompanyLogoController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      sendValidationError(res, { logo: "Select a JPG or PNG image to upload." });
      return;
    }

    const token = getToken(req);
    const state = await getPartnerApplication(token);
    if (state.application.currentStep === "SUBMITTED") {
      throw new HttpError(
        HTTP_STATUS.CONFLICT,
        "This application has already been submitted and can no longer be edited.",
        { code: "APPLICATION_ALREADY_SUBMITTED" },
      );
    }
    const result = await uploadPartnerLogo(state.partner.id, req.file.buffer);
    const application = await savePartnerCompanyLogo(token, {
      secureUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format ?? null,
      bytes: result.bytes,
    });

    res.status(HTTP_STATUS.OK).json({
      message: "Company logo uploaded.",
      application,
    });
  } catch (error) {
    forwardError(next, error, "Unable to upload the company logo.");
  }
}

export async function removePartnerCompanyLogoController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const application = await removePartnerCompanyLogo(getToken(req));
    res.status(HTTP_STATUS.OK).json({
      message: "Company logo removed.",
      application,
    });
  } catch (error) {
    forwardError(next, error, "Unable to remove the company logo.");
  }
}

export async function submitPartnerApplicationController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await submitPartnerApplication(getToken(req));
    res.status(HTTP_STATUS.OK).json({
      message: "Application submitted successfully.",
      ...result,
    });
  } catch (error) {
    forwardError(next, error, "Unable to submit the partner application.");
  }
}

export async function cancelPartnerApplicationController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await cancelPartnerApplication(getToken(req));
    clearPartnerOnboardingCookie(res);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    forwardError(next, error, "Unable to cancel the partner application.");
  }
}

export async function logoutPartnerController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await revokeCurrentPartnerSession(getToken(req));
    clearPartnerOnboardingCookie(res);
    res.status(HTTP_STATUS.OK).json({ message: "Logged out successfully." });
  } catch (error) {
    forwardError(next, error, "Unable to log out the shipping partner.");
  }
}