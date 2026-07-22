/**
 * Responsibility:
 * Handles customer session and Google OAuth cookie creation and clearing.
 * Sensitive cookies are httpOnly so frontend JavaScript cannot read their raw tokens.
 */

import type { CookieOptions, Response } from "express";
import {
  AUTH_COOKIE_NAME,
  CUSTOMER_SESSION_DURATION_MS,
} from "./auth.js";
import {
  GOOGLE_OAUTH_COOKIE_DURATION_MS,
  GOOGLE_OAUTH_NONCE_COOKIE_NAME,
  GOOGLE_OAUTH_PKCE_COOKIE_NAME,
  GOOGLE_OAUTH_STATE_COOKIE_NAME,
  GOOGLE_SIGNUP_COOKIE_NAME,
  GOOGLE_SIGNUP_DURATION_MS,
} from "./googleAuth.js";
import { env } from "../config/env.js";
import {
  CUSTOMER_LOGIN_CHALLENGE_COOKIE_NAME,
  CUSTOMER_LOGIN_CHALLENGE_DURATION_MS,
  CUSTOMER_PASSWORD_RESET_AUTH_COOKIE_NAME,
  CUSTOMER_PASSWORD_RESET_AUTH_DURATION_MS,
} from "./token.js";

const GOOGLE_OAUTH_COOKIE_PATH = "/";
const GOOGLE_SIGNUP_COOKIE_PATH = "/api/customer/auth/google";

function getSensitiveCookieOptions(): Pick<
  CookieOptions,
  "httpOnly" | "secure" | "sameSite"
> {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  };
}

export function setCustomerAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...getSensitiveCookieOptions(),
    maxAge: CUSTOMER_SESSION_DURATION_MS,
    path: "/",
  });
}

export function clearCustomerAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...getSensitiveCookieOptions(),
    path: "/",
  });
}

export function setGoogleOAuthStateCookie(res: Response, state: string) {
  res.cookie(GOOGLE_OAUTH_STATE_COOKIE_NAME, state, {
    ...getSensitiveCookieOptions(),
    maxAge: GOOGLE_OAUTH_COOKIE_DURATION_MS,
    path: GOOGLE_OAUTH_COOKIE_PATH,
  });
}

export function setGoogleOAuthPkceCookie(
  res: Response,
  codeVerifier: string,
) {
  res.cookie(GOOGLE_OAUTH_PKCE_COOKIE_NAME, codeVerifier, {
    ...getSensitiveCookieOptions(),
    maxAge: GOOGLE_OAUTH_COOKIE_DURATION_MS,
    path: GOOGLE_OAUTH_COOKIE_PATH,
  });
}

export function setGoogleOAuthNonceCookie(res: Response, nonce: string) {
  res.cookie(GOOGLE_OAUTH_NONCE_COOKIE_NAME, nonce, {
    ...getSensitiveCookieOptions(),
    maxAge: GOOGLE_OAUTH_COOKIE_DURATION_MS,
    path: GOOGLE_OAUTH_COOKIE_PATH,
  });
}

export function clearGoogleOAuthCookies(res: Response) {
  const options = {
    ...getSensitiveCookieOptions(),
    path: GOOGLE_OAUTH_COOKIE_PATH,
  };

  res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE_NAME, options);
  res.clearCookie(GOOGLE_OAUTH_PKCE_COOKIE_NAME, options);
  res.clearCookie(GOOGLE_OAUTH_NONCE_COOKIE_NAME, options);
}

export function setGoogleSignupCookie(res: Response, token: string) {
  res.cookie(GOOGLE_SIGNUP_COOKIE_NAME, token, {
    ...getSensitiveCookieOptions(),
    maxAge: GOOGLE_SIGNUP_DURATION_MS,
    path: GOOGLE_SIGNUP_COOKIE_PATH,
  });
}

export function clearGoogleSignupCookie(res: Response) {
  res.clearCookie(GOOGLE_SIGNUP_COOKIE_NAME, {
    ...getSensitiveCookieOptions(),
    path: GOOGLE_SIGNUP_COOKIE_PATH,
  });
}

export function setCustomerPasswordResetAuthorizationCookie(
  res: Response,
  token: string,
) {
  res.cookie(CUSTOMER_PASSWORD_RESET_AUTH_COOKIE_NAME, token, {
    ...getSensitiveCookieOptions(),
    maxAge: CUSTOMER_PASSWORD_RESET_AUTH_DURATION_MS,
    path: "/api/customer/auth",
  });
}

export function clearCustomerPasswordResetAuthorizationCookie(res: Response) {
  res.clearCookie(CUSTOMER_PASSWORD_RESET_AUTH_COOKIE_NAME, {
    ...getSensitiveCookieOptions(),
    path: "/api/customer/auth",
  });
}

export function setCustomerLoginChallengeCookie(
  res: Response,
  token: string,
) {
  res.cookie(CUSTOMER_LOGIN_CHALLENGE_COOKIE_NAME, token, {
    ...getSensitiveCookieOptions(),
    maxAge: CUSTOMER_LOGIN_CHALLENGE_DURATION_MS,
    path: "/api/customer/auth/login",
  });
}

export function clearCustomerLoginChallengeCookie(res: Response) {
  res.clearCookie(CUSTOMER_LOGIN_CHALLENGE_COOKIE_NAME, {
    ...getSensitiveCookieOptions(),
    path: "/api/customer/auth/login",
  });
}