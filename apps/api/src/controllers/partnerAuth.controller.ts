/**
 * Responsibility:
 * Handles shipping-partner registration, verification, onboarding-session,
 * and Google profile-completion HTTP requests.
 */

import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { WEB_ROUTES } from "../config/routes.js";
import {
  clearGoogleOAuthCookies,
  clearGoogleOAuthFlowCookie,
  clearPartnerGoogleSignupCookie,
  setGoogleOAuthFlowCookie,
  setGoogleOAuthNonceCookie,
  setGoogleOAuthPkceCookie,
  setGoogleOAuthStateCookie,
  setPartnerOnboardingCookie,
} from "../lib/cookies.js";
import { PARTNER_GOOGLE_SIGNUP_COOKIE_NAME } from "../lib/googleAuth.js";
import { HTTP_STATUS, HttpError } from "../lib/httpError.js";
import { PARTNER_ONBOARDING_COOKIE_NAME } from "../lib/partnerAuth.js";
import {
  completePartnerGoogleSignup,
  getPartnerFromOnboardingToken,
  getPendingPartnerGoogleProfile,
  linkGoogleToExistingPartner,
  registerShippingPartner,
  resendShippingPartnerVerificationCode,
  verifyShippingPartnerEmail,
} from "../services/partnerAuth.service.js";
import { createGoogleAuthorizationRequest } from "../services/googleAuth.service.js";
import {
  validateCompleteGoogleShippingPartnerProfile,
  validateLinkGoogleShippingPartnerAccount,
  validatePartnerEmail,
  validatePartnerEmailCode,
  validateRegisterShippingPartner,
} from "../validators/partnerAuth.validators.js";

const REDIRECT_STATUS = 302;

function sendValidationError(res: Response, errors: Record<string, string>) {
  res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
    message: "Validation failed.",
    errors,
  });
}

function forwardError(
  next: NextFunction,
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof HttpError) {
    next(error);
    return;
  }

  console.error(fallbackMessage, error);
  next(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, fallbackMessage));
}

export async function registerShippingPartnerController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validateRegisterShippingPartner(req.body);
    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const result = await registerShippingPartner(validation.data);
    res.status(HTTP_STATUS.CREATED).json({
      ...result,
      redirectTo: WEB_ROUTES.partnerVerifyEmail,
    });
  } catch (error) {
    forwardError(next, error, "Unable to create the shipping-partner account.");
  }
}

export async function verifyShippingPartnerEmailController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validatePartnerEmailCode(req.body);
    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const result = await verifyShippingPartnerEmail(validation.data);
    setPartnerOnboardingCookie(res, result.sessionToken);

    res.status(HTTP_STATUS.OK).json({
      message: result.message,
      redirectTo: WEB_ROUTES.partnerBusinessInformation,
    });
  } catch (error) {
    forwardError(next, error, "Unable to verify the partner email address.");
  }
}

export async function resendShippingPartnerVerificationCodeController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validatePartnerEmail(req.body);
    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    res
      .status(HTTP_STATUS.OK)
      .json(await resendShippingPartnerVerificationCode(validation.data));
  } catch (error) {
    forwardError(next, error, "Unable to resend the partner verification code.");
  }
}

export async function getCurrentShippingPartnerController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.[PARTNER_ONBOARDING_COOKIE_NAME] as
      | string
      | undefined;
    const partner = await getPartnerFromOnboardingToken(token);
    res.status(HTTP_STATUS.OK).json({ partner });
  } catch (error) {
    forwardError(next, error, "Unable to load the shipping-partner session.");
  }
}

export async function startPartnerGoogleAuthController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    clearGoogleOAuthCookies(res);
    clearGoogleOAuthFlowCookie(res);
    clearPartnerGoogleSignupCookie(res);

    const authorization = await createGoogleAuthorizationRequest();
    setGoogleOAuthFlowCookie(res, "partner");
    setGoogleOAuthStateCookie(res, authorization.state);
    setGoogleOAuthNonceCookie(res, authorization.nonce);
    setGoogleOAuthPkceCookie(res, authorization.codeVerifier);

    res.redirect(REDIRECT_STATUS, authorization.authorizationUrl);
  } catch (error) {
    console.error("Unable to start partner Google authentication.", error);
    const url = new URL(WEB_ROUTES.partnerApply, env.WEB_APP_URL);
    url.searchParams.set("googleStatus", "failed");
    res.redirect(REDIRECT_STATUS, url.toString());
  }
}

export async function getPendingPartnerGoogleProfileController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.[PARTNER_GOOGLE_SIGNUP_COOKIE_NAME] as
      | string
      | undefined;
    res.status(HTTP_STATUS.OK).json(await getPendingPartnerGoogleProfile(token));
  } catch (error) {
    forwardError(next, error, "Unable to load the partner Google profile.");
  }
}


export async function linkPartnerGoogleAccountController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validateLinkGoogleShippingPartnerAccount(req.body);
    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const token = req.cookies?.[PARTNER_GOOGLE_SIGNUP_COOKIE_NAME] as
      | string
      | undefined;
    const result = await linkGoogleToExistingPartner(
      token,
      validation.data,
    );

    clearPartnerGoogleSignupCookie(res);
    setPartnerOnboardingCookie(res, result.sessionToken);

    res.status(HTTP_STATUS.OK).json({
      message: result.message,
      redirectTo: WEB_ROUTES.partnerBusinessInformation,
    });
  } catch (error) {
    forwardError(next, error, "Unable to connect the partner Google Account.");
  }
}

export async function completePartnerGoogleProfileController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validateCompleteGoogleShippingPartnerProfile(req.body);
    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const token = req.cookies?.[PARTNER_GOOGLE_SIGNUP_COOKIE_NAME] as
      | string
      | undefined;
    const result = await completePartnerGoogleSignup(token, validation.data);

    clearPartnerGoogleSignupCookie(res);
    setPartnerOnboardingCookie(res, result.sessionToken);

    res.status(HTTP_STATUS.CREATED).json({
      message: result.message,
      redirectTo: WEB_ROUTES.partnerBusinessInformation,
    });
  } catch (error) {
    forwardError(next, error, "Unable to complete the partner Google profile.");
  }
}
