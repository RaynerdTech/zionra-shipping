/**
 * Responsibility:
 * Creates the configured Google OAuth client used by the customer auth flow.
 */

import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";

export const googleOAuthClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_CALLBACK_URL,
);

export const GOOGLE_OAUTH_SCOPES = ["openid", "email", "profile"];
