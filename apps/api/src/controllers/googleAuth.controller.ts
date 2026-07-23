/**
 * Responsibility:
 * Handles HTTP redirects, cookies, validation, and JSON responses for Google auth.
 */

import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { WEB_ROUTES } from "../config/routes.js";
import {
  clearGoogleOAuthCookies,
  clearGoogleSignupCookie,
  setCustomerAuthCookie,
  setGoogleOAuthNonceCookie,
  setGoogleOAuthPkceCookie,
  setGoogleOAuthStateCookie,
  setGoogleSignupCookie,
} from "../lib/cookies.js";
import {
  GOOGLE_OAUTH_NONCE_COOKIE_NAME,
  GOOGLE_OAUTH_PKCE_COOKIE_NAME,
  GOOGLE_OAUTH_STATE_COOKIE_NAME,
  GOOGLE_SIGNUP_COOKIE_NAME,
  securelyMatches,
} from "../lib/googleAuth.js";
import { HTTP_STATUS, HttpError } from "../lib/httpError.js";
import {
  completeGoogleSignup,
  createGoogleAuthorizationRequest,
  getPendingGoogleProfile,
  linkGoogleToExistingCustomer,
  processGoogleCallback,
} from "../services/googleAuth.service.js";
import {
  validateCompleteGoogleProfile,
  validateLinkGoogleAccount,
} from "../validators/customerAuth.validators.js";

const REDIRECT_STATUS = 302;

function getQueryString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function buildWebAppUrl(
  path: string,
  query?: Record<string, string | undefined>,
) {
  const url = new URL(path, env.WEB_APP_URL);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

type GoogleRedirectStatus =
  | "cancelled"
  | "expired"
  | "email-unverified"
  | "link-unavailable"
  | "failed";

function redirectGoogleStatus(
  res: Response,
  status: GoogleRedirectStatus,
) {
  res.redirect(
    REDIRECT_STATUS,
    buildWebAppUrl(WEB_ROUTES.customerCreateAccount, {
      googleStatus: status,
    }),
  );
}


function getGoogleRedirectStatus(error: unknown): GoogleRedirectStatus {
  if (!(error instanceof HttpError)) {
    return "failed";
  }

  if (error.code === "GOOGLE_EMAIL_NOT_VERIFIED") {
    return "email-unverified";
  }

  if (error.code === "GOOGLE_ACCOUNT_LINK_UNAVAILABLE") {
    return "link-unavailable";
  }

  return "failed";
}

function sendValidationError(res: Response, errors: Record<string, string>) {
  res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
    message: "Validation failed.",
    errors,
  });
}

function forwardJsonControllerError(
  res: Response,
  next: NextFunction,
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof HttpError) {
    if (error.code === "GOOGLE_SIGNUP_EXPIRED") {
      clearGoogleSignupCookie(res);
    }

    next(error);
    return;
  }

  console.error(fallbackMessage, error);
  next(
    new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, fallbackMessage),
  );
}

export async function startGoogleAuthController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    clearGoogleOAuthCookies(res);
    clearGoogleSignupCookie(res);

    const authorization = await createGoogleAuthorizationRequest();

    setGoogleOAuthStateCookie(res, authorization.state);
    setGoogleOAuthNonceCookie(res, authorization.nonce);
    setGoogleOAuthPkceCookie(res, authorization.codeVerifier);

    res.redirect(REDIRECT_STATUS, authorization.authorizationUrl);
  } catch (error) {
    console.error("Unable to start Google authentication.", error);
    redirectGoogleStatus(res, "failed");
  }
}

export async function googleAuthCallbackController(
  req: Request,
  res: Response,
): Promise<void> {
  const providerError = getQueryString(req.query.error);
  const code = getQueryString(req.query.code);
  const state = getQueryString(req.query.state);
  const storedState = req.cookies?.[GOOGLE_OAUTH_STATE_COOKIE_NAME] as
    | string
    | undefined;
  const codeVerifier = req.cookies?.[GOOGLE_OAUTH_PKCE_COOKIE_NAME] as
    | string
    | undefined;
  const expectedNonce = req.cookies?.[GOOGLE_OAUTH_NONCE_COOKIE_NAME] as
    | string
    | undefined;

  clearGoogleOAuthCookies(res);

  if (providerError) {
    redirectGoogleStatus(res, "cancelled");
    return;
  }

  if (
    !code ||
    !state ||
    !storedState ||
    !codeVerifier ||
    !expectedNonce ||
    !securelyMatches(state, storedState)
  ) {
    redirectGoogleStatus(res, "expired");
    return;
  }

  try {
    const result = await processGoogleCallback({
      code,
      codeVerifier,
      expectedNonce,
    });

    if (result.outcome === "authenticated") {
      clearGoogleSignupCookie(res);
      setCustomerAuthCookie(res, result.sessionToken);
      res.redirect(
        REDIRECT_STATUS,
        buildWebAppUrl(WEB_ROUTES.customerDashboard),
      );
      return;
    }

    setGoogleSignupCookie(res, result.signupToken);

    if (result.outcome === "verification_required") {
      res.redirect(
        REDIRECT_STATUS,
        buildWebAppUrl(WEB_ROUTES.customerVerifyEmail, {
          email: result.email,
          source: "google",
        }),
      );
      return;
    }

    if (result.outcome === "link_required") {
      res.redirect(
        REDIRECT_STATUS,
        buildWebAppUrl(WEB_ROUTES.customerLinkGoogleAccount),
      );
      return;
    }

    res.redirect(
      REDIRECT_STATUS,
      buildWebAppUrl(WEB_ROUTES.customerCompleteProfile),
    );
  } catch (error) {
    console.error("Google authentication failed.", error);
    redirectGoogleStatus(res, getGoogleRedirectStatus(error));
  }
}

export async function getPendingGoogleProfileController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const signupToken = req.cookies?.[GOOGLE_SIGNUP_COOKIE_NAME] as
      | string
      | undefined;
    const result = await getPendingGoogleProfile(signupToken);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    forwardJsonControllerError(
      res,
      next,
      error,
      "Something went wrong while loading your Google profile.",
    );
  }
}

export async function linkGoogleAccountController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validateLinkGoogleAccount(req.body);

    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const signupToken = req.cookies?.[GOOGLE_SIGNUP_COOKIE_NAME] as
      | string
      | undefined;
    const result = await linkGoogleToExistingCustomer(
      signupToken,
      validation.data,
    );

    clearGoogleSignupCookie(res);
    setCustomerAuthCookie(res, result.sessionToken);

    res.status(HTTP_STATUS.OK).json({
      message: result.message,
      redirectTo: WEB_ROUTES.customerDashboard,
    });
  } catch (error) {
    forwardJsonControllerError(
      res,
      next,
      error,
      "Something went wrong while connecting your Google Account.",
    );
  }
}

export async function completeGoogleProfileController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validateCompleteGoogleProfile(req.body);

    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const signupToken = req.cookies?.[GOOGLE_SIGNUP_COOKIE_NAME] as
      | string
      | undefined;
    const result = await completeGoogleSignup(signupToken, validation.data);

    clearGoogleSignupCookie(res);
    setCustomerAuthCookie(res, result.sessionToken);

    res.status(HTTP_STATUS.CREATED).json({
      message: result.message,
      redirectTo: WEB_ROUTES.customerDashboard,
    });
  } catch (error) {
    forwardJsonControllerError(
      res,
      next,
      error,
      "Something went wrong while completing your account.",
    );
  }
}
