"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { useAppDrafts } from "@/components/providers/AppDraftProvider";
import { buildApiUrl } from "@/lib/api";
import { clearMemoryCache } from "@/lib/memoryCache";
import { clearQuoteDrafts } from "@/lib/quoteFlow";

export type CustomerAccount = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  nationality: string | null;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  countryOfResidence: string;
  referralSource: string | null;
  marketingOptIn: boolean;
  emailVerified: boolean;
  createdAt: string;
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type CustomerAuthContextValue = {
  customer: CustomerAccount | null;
  status: AuthStatus;
  error: string;
  refreshCustomer: () => Promise<CustomerAccount | null>;
  signOut: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

type MeResponse = {
  customer?: CustomerAccount;
  message?: string;
};

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { clearAllDrafts } = useAppDrafts();
  const protectedCustomerPath =
    pathname === routes.web.customerDashboard || pathname === routes.web.customerProfile;
  const partnerPath = pathname.startsWith("/partner/") || pathname === "/partner";
  const lastProtectedPathCheckRef = useRef<string | null>(null);
  const lastVerifiedAtRef = useRef(0);
  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState("");
  const inFlightRef = useRef<Promise<CustomerAccount | null> | null>(null);

  const refreshCustomer = useCallback(async () => {
    if (inFlightRef.current) return inFlightRef.current;

    const request = (async () => {
      setError("");

      try {
        const response = await fetch(buildApiUrl(routes.api.customerAuth.me), {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result = (await response.json().catch(() => ({}))) as MeResponse;

        if (response.status === 401) {
          setCustomer(null);
          setStatus("unauthenticated");
          return null;
        }

        if (!response.ok || !result.customer) {
          throw new Error(result.message ?? "Unable to load your account.");
        }

        setCustomer(result.customer);
        setStatus("authenticated");
        return result.customer;
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "Unable to load your account.";
        setCustomer(null);
        setStatus("error");
        setError(message);
        return null;
      } finally {
        lastVerifiedAtRef.current = Date.now();
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    if (partnerPath) return;

    if (status === "loading") {
      if (protectedCustomerPath) lastProtectedPathCheckRef.current = pathname;
      if (!inFlightRef.current) void refreshCustomer();
      return;
    }

    if (
      status === "unauthenticated" &&
      protectedCustomerPath &&
      lastProtectedPathCheckRef.current !== pathname
    ) {
      lastProtectedPathCheckRef.current = pathname;
      void refreshCustomer();
    }
  }, [pathname, partnerPath, protectedCustomerPath, refreshCustomer, status]);

  useEffect(() => {
    if (partnerPath || status !== "authenticated") return;

    function revalidateWhenVisible() {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastVerifiedAtRef.current < 2 * 60 * 1000) return;
      void refreshCustomer();
    }

    window.addEventListener("focus", revalidateWhenVisible);
    document.addEventListener("visibilitychange", revalidateWhenVisible);

    return () => {
      window.removeEventListener("focus", revalidateWhenVisible);
      document.removeEventListener("visibilitychange", revalidateWhenVisible);
    };
  }, [partnerPath, refreshCustomer, status]);

  const signOut = useCallback(async () => {
    const response = await fetch(buildApiUrl(routes.api.customerAuth.logout), {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(result.message ?? "Unable to sign out.");
    }

    setCustomer(null);
    setStatus("unauthenticated");
    setError("");
    clearAllDrafts();
    clearMemoryCache("customer-profile:");
    clearQuoteDrafts();
  }, [clearAllDrafts]);

  const value = useMemo(
    () => ({ customer, status, error, refreshCustomer, signOut }),
    [customer, status, error, refreshCustomer, signOut],
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);

  if (!context) {
    throw new Error("useCustomerAuth must be used inside CustomerAuthProvider.");
  }

  return context;
}
