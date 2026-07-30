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
  clearPartnerLoginChallengeCookie,
  clearPartnerOnboardingCookie,
  clearPartnerPasswordResetAuthorizationCookie,
  setGoogleOAuthFlowCookie,
  setGoogleOAuthNonceCookie,
  setGoogleOAuthPkceCookie,
  setGoogleOAuthStateCookie,
  setPartnerLoginChallengeCookie,
  setPartnerOnboardingCookie,
  setPartnerPasswordResetAuthorizationCookie,
} from "../lib/cookies.js";
import { PARTNER_GOOGLE_SIGNUP_COOKIE_NAME } from "../lib/googleAuth.js";
import { HTTP_STATUS, HttpError } from "../lib/httpError.js";
import {
  PARTNER_LOGIN_CHALLENGE_COOKIE_NAME,
  PARTNER_ONBOARDING_COOKIE_NAME,
  PARTNER_PASSWORD_RESET_AUTH_COOKIE_NAME,
} from "../lib/partnerAuth.js";
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
  cancelPartnerLoginChallenge,
  getPartnerLoginChallenge,
  resendPartnerLoginCode,
  startPartnerLogin,
  verifyPartnerLoginCode,
} from "../services/partner-auth/partnerLogin.service.js";
import {
  getPartnerPasswordResetSession,
  resetPartnerPassword,
  sendPartnerPasswordResetCode,
  verifyPartnerPasswordResetCode,
} from "../services/partner-auth/partnerPasswordReset.service.js";
import { resolvePartnerDestination } from "../services/partner-auth/partnerDestination.service.js";
import { getPartnerApplication } from "../services/partnerApplication.service.js";
import {
  validateCompleteGoogleShippingPartnerProfile,
  validateLinkGoogleShippingPartnerAccount,
  validateLoginShippingPartner,
  validatePartnerEmail,
  validatePartnerEmailCode,
  validatePartnerLoginVerificationCode,
  validatePartnerPasswordResetCode,
  validateRegisterShippingPartner,
  validateResetShippingPartnerPassword,
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
    const redirectTo = await resolvePartnerDestination(partner);
    res.status(HTTP_STATUS.OK).json({ partner, redirectTo });
  } catch (error) {
    forwardError(next, error, "Unable to load the shipping-partner session.");
  }
}


export async function loginShippingPartnerController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validateLoginShippingPartner(req.body);
    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const result = await startPartnerLogin(validation.data);
    clearPartnerOnboardingCookie(res);
    setPartnerLoginChallengeCookie(res, result.challengeToken);

    res.status(HTTP_STATUS.OK).json({
      message: result.message,
      redirectTo: WEB_ROUTES.partnerLoginVerification,
    });
  } catch (error) {
    forwardError(next, error, "Unable to sign in to the shipping-partner account.");
  }
}

export async function getPartnerLoginChallengeController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.[PARTNER_LOGIN_CHALLENGE_COOKIE_NAME] as
      | string
      | undefined;
    res.status(HTTP_STATUS.OK).json(await getPartnerLoginChallenge(token));
  } catch (error) {
    clearPartnerLoginChallengeCookie(res);
    forwardError(next, error, "Unable to load partner sign-in verification.");
  }
}

export async function verifyPartnerLoginCodeController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validatePartnerLoginVerificationCode(req.body);
    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const token = req.cookies?.[PARTNER_LOGIN_CHALLENGE_COOKIE_NAME] as
      | string
      | undefined;
    const result = await verifyPartnerLoginCode(token, validation.data);

    clearPartnerLoginChallengeCookie(res);
    setPartnerOnboardingCookie(res, result.sessionToken);

    res.status(HTTP_STATUS.OK).json({
      message: result.message,
      redirectTo: result.redirectTo,
    });
  } catch (error) {
    if (
      error instanceof HttpError &&
      error.code === "PARTNER_LOGIN_CHALLENGE_EXPIRED"
    ) {
      clearPartnerLoginChallengeCookie(res);
    }
    forwardError(next, error, "Unable to verify the partner sign-in code.");
  }
}

export async function resendPartnerLoginCodeController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.[PARTNER_LOGIN_CHALLENGE_COOKIE_NAME] as
      | string
      | undefined;
    res.status(HTTP_STATUS.OK).json(await resendPartnerLoginCode(token));
  } catch (error) {
    if (
      error instanceof HttpError &&
      (error.code === "PARTNER_LOGIN_CHALLENGE_EXPIRED" ||
        error.code === "EMAIL_DELIVERY_FAILED")
    ) {
      clearPartnerLoginChallengeCookie(res);
    }
    forwardError(next, error, "Unable to resend the partner sign-in code.");
  }
}

export async function cancelPartnerLoginChallengeController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.[PARTNER_LOGIN_CHALLENGE_COOKIE_NAME] as
      | string
      | undefined;
    const result = await cancelPartnerLoginChallenge(token);
    clearPartnerLoginChallengeCookie(res);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    clearPartnerLoginChallengeCookie(res);
    forwardError(next, error, "Unable to cancel partner sign-in verification.");
  }
}

export async function forgotPartnerPasswordController(
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

    clearPartnerPasswordResetAuthorizationCookie(res);
    res.status(HTTP_STATUS.OK).json(
      await sendPartnerPasswordResetCode(validation.data),
    );
  } catch (error) {
    forwardError(next, error, "Unable to send the partner password reset code.");
  }
}

export async function verifyPartnerPasswordResetCodeController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validatePartnerPasswordResetCode(req.body);
    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const result = await verifyPartnerPasswordResetCode(validation.data);
    setPartnerPasswordResetAuthorizationCookie(
      res,
      result.resetAuthorizationToken,
    );

    res.status(HTTP_STATUS.OK).json({
      message: result.message,
      redirectTo: WEB_ROUTES.partnerResetPassword,
    });
  } catch (error) {
    forwardError(next, error, "Unable to verify the partner password reset code.");
  }
}

export async function getPartnerPasswordResetSessionController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.[PARTNER_PASSWORD_RESET_AUTH_COOKIE_NAME] as
      | string
      | undefined;
    res.status(HTTP_STATUS.OK).json(
      await getPartnerPasswordResetSession(token),
    );
  } catch (error) {
    clearPartnerPasswordResetAuthorizationCookie(res);
    forwardError(next, error, "Unable to load the partner password reset session.");
  }
}

export async function resetPartnerPasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validateResetShippingPartnerPassword(req.body);
    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const token = req.cookies?.[PARTNER_PASSWORD_RESET_AUTH_COOKIE_NAME] as
      | string
      | undefined;
    const result = await resetPartnerPassword(token, validation.data);
    clearPartnerPasswordResetAuthorizationCookie(res);
    clearPartnerOnboardingCookie(res);
    clearPartnerLoginChallengeCookie(res);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    if (
      error instanceof HttpError &&
      error.code === "PARTNER_PASSWORD_RESET_SESSION_EXPIRED"
    ) {
      clearPartnerPasswordResetAuthorizationCookie(res);
    }
    forwardError(next, error, "Unable to reset the partner password.");
  }
}

export async function getApprovedPartnerDashboardController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.[PARTNER_ONBOARDING_COOKIE_NAME] as
      | string
      | undefined;
    const partner = await getPartnerFromOnboardingToken(token);
    const redirectTo = await resolvePartnerDestination(partner);

    if (partner.status !== "APPROVED") {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        message: "Your shipping-partner application must be approved before you can access the dashboard.",
        code: "PARTNER_APPROVAL_REQUIRED",
        redirectTo,
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json(await getPartnerApplication(token));
  } catch (error) {
    forwardError(next, error, "Unable to load the partner dashboard.");
  }
}

export async function startPartnerGoogleAuthController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    clearGoogleOAuthCookies(res);
    clearGoogleOAuthFlowCookie(res);
    clearPartnerGoogleSignupCookie(res);

    const authorization = await createGoogleAuthorizationRequest();
    setGoogleOAuthFlowCookie(
      res,
      req.query.source === "login" ? "partner-login" : "partner",
    );
    setGoogleOAuthStateCookie(res, authorization.state);
    setGoogleOAuthNonceCookie(res, authorization.nonce);
    setGoogleOAuthPkceCookie(res, authorization.codeVerifier);

    res.redirect(REDIRECT_STATUS, authorization.authorizationUrl);
  } catch (error) {
    console.error("Unable to start partner Google authentication.", error);
    const url = new URL(
      req.query.source === "login"
        ? WEB_ROUTES.partnerLogin
        : WEB_ROUTES.partnerApply,
      env.WEB_APP_URL,
    );
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
      redirectTo: result.redirectTo,
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
      redirectTo: result.redirectTo,
    });
  } catch (error) {
    forwardError(next, error, "Unable to complete the partner Google profile.");
  }
}
