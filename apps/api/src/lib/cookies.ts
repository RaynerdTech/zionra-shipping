/**
 * Responsibility:
 * Handles customer auth cookie creation and clearing.
 * Auth cookies are httpOnly so frontend JavaScript cannot read the session token directly.
 */

import type { Response } from "express";
import {
  AUTH_COOKIE_NAME,
  CUSTOMER_SESSION_DURATION_MS,
} from "./auth.js";
import { env } from "../config/env.js";

export function setCustomerAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: CUSTOMER_SESSION_DURATION_MS,
    path: "/",
  });
}

export function clearCustomerAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
}