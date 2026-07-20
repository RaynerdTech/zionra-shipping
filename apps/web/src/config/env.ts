/**
 * Responsibility:
 * Defines and normalizes public runtime configuration used by the Zionra web app.
 * API host changes are made here or through NEXT_PUBLIC_API_URL, not in components.
 */

const LOCAL_API_BASE_URL = "http://localhost:4000";

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

export const env = {
  apiBaseUrl: normalizeBaseUrl(
    configuredApiBaseUrl && configuredApiBaseUrl.trim()
      ? configuredApiBaseUrl
      : LOCAL_API_BASE_URL,
  ),
} as const;
