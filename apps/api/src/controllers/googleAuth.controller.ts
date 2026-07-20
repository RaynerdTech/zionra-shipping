/**
 * Responsibility:
 * Handles HTTP redirects, cookies, validation, and JSON responses for Google auth.
 */

import type { Request, Response } from "express";
import { env } from "../config/env.js";
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

const GOOGLE_CREATE_ACCOUNT_PATH = "/create-account";
const GOOGLE_VERIFY_EMAIL_PATH = "/verify-email";
const GOOGLE_LINK_ACCOUNT_PATH = "/link-google-account";
const GOOGLE_COMPLETE_PROFILE_PATH = "/complete-profile";
const GOOGLE_AUTH_SUCCESS_PATH = "/dashboard";
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

function redirectGoogleStatus(
  res: Response,
  status: "cancelled" | "expired" | "failed",
) {
  res.redirect(
    REDIRECT_STATUS,
    buildWebAppUrl(GOOGLE_CREATE_ACCOUNT_PATH, {
      googleStatus: status,
    }),
  );
}

function sendValidationError(res: Response, errors: Record<string, string>) {
  res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
    message: "Validation failed.",
    errors,
  });
}

function handleJsonControllerError(
  res: Response,
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof HttpError) {
    if (error.code === "GOOGLE_SIGNUP_EXPIRED") {
      clearGoogleSignupCookie(res);
    }

    res.status(error.statusCode).json({
      message: error.message,
      ...(error.code ? { code: error.code } : {}),
      ...(error.errors ? { errors: error.errors } : {}),
    });

    return;
  }

  console.error(fallbackMessage, error);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: fallbackMessage,
  });
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
        buildWebAppUrl(GOOGLE_AUTH_SUCCESS_PATH),
      );
      return;
    }

    setGoogleSignupCookie(res, result.signupToken);

    if (result.outcome === "verification_required") {
      res.redirect(
        REDIRECT_STATUS,
        buildWebAppUrl(GOOGLE_VERIFY_EMAIL_PATH, {
          email: result.email,
          source: "google",
        }),
      );
      return;
    }

    if (result.outcome === "link_required") {
      res.redirect(
        REDIRECT_STATUS,
        buildWebAppUrl(GOOGLE_LINK_ACCOUNT_PATH),
      );
      return;
    }

    res.redirect(
      REDIRECT_STATUS,
      buildWebAppUrl(GOOGLE_COMPLETE_PROFILE_PATH),
    );
  } catch (error) {
    console.error("Google authentication failed.", error);
    redirectGoogleStatus(res, "failed");
  }
}

export async function getPendingGoogleProfileController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const signupToken = req.cookies?.[GOOGLE_SIGNUP_COOKIE_NAME] as
      | string
      | undefined;
    const result = await getPendingGoogleProfile(signupToken);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    handleJsonControllerError(
      res,
      error,
      "Something went wrong while loading your Google profile.",
    );
  }
}

export async function linkGoogleAccountController(
  req: Request,
  res: Response,
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
      redirectTo: GOOGLE_AUTH_SUCCESS_PATH,
    });
  } catch (error) {
    handleJsonControllerError(
      res,
      error,
      "Something went wrong while connecting your Google Account.",
    );
  }
}

export async function completeGoogleProfileController(
  req: Request,
  res: Response,
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
      redirectTo: GOOGLE_AUTH_SUCCESS_PATH,
    });
  } catch (error) {
    handleJsonControllerError(
      res,
      error,
      "Something went wrong while completing your account.",
    );
  }
}
