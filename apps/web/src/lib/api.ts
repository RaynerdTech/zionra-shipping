/**
 * Responsibility:
 * Builds absolute backend URLs from the centralized API base URL and API paths.
 */

import { env } from "@/config/env";

export function buildApiUrl(path: string) {
  if (!path.startsWith("/")) {
    throw new Error(`API path must start with "/": ${path}`);
  }

  return `${env.apiBaseUrl}${path}`;
}
