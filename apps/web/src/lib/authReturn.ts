const CUSTOMER_AUTH_RETURN_KEY = "zionra.customer-auth-return.v1";
const RETURN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

type StoredReturn = {
  path: string;
  createdAt: number;
};

export function normalizeCustomerReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  try {
    const url = new URL(value, "https://zionra.local");

    if (url.origin !== "https://zionra.local") {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function storeCustomerAuthReturnTo(value: string | null | undefined) {
  if (typeof window === "undefined") return null;

  const path = normalizeCustomerReturnTo(value);
  if (!path) return null;

  try {
    window.localStorage.setItem(
      CUSTOMER_AUTH_RETURN_KEY,
      JSON.stringify({ path, createdAt: Date.now() } satisfies StoredReturn),
    );
  } catch {
    // Storage failure must not block authentication.
  }

  return path;
}

export function readCustomerAuthReturnTo() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CUSTOMER_AUTH_RETURN_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredReturn | string;
    const path = normalizeCustomerReturnTo(
      typeof parsed === "string" ? parsed : parsed.path,
    );
    const createdAt = typeof parsed === "string" ? Date.now() : parsed.createdAt;

    if (!path || !Number.isFinite(createdAt) || Date.now() - createdAt > RETURN_MAX_AGE_MS) {
      window.localStorage.removeItem(CUSTOMER_AUTH_RETURN_KEY);
      return null;
    }

    return path;
  } catch {
    return null;
  }
}

export function consumeCustomerAuthReturnTo(fallback: string) {
  const path = readCustomerAuthReturnTo() ?? normalizeCustomerReturnTo(fallback) ?? fallback;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(CUSTOMER_AUTH_RETURN_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
  }

  return path;
}

export function withCustomerReturnTo(path: string, returnTo: string | null | undefined) {
  const safeReturnTo = normalizeCustomerReturnTo(returnTo);
  if (!safeReturnTo) return path;

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}returnTo=${encodeURIComponent(safeReturnTo)}`;
}
