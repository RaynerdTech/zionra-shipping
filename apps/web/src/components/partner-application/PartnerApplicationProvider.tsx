"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import type { ApiErrorResponse, PartnerApplicationResponse } from "./types";

type ApplicationRequestResult =
  | { kind: "success"; data: PartnerApplicationResponse }
  | { kind: "unauthorized" }
  | { kind: "redirect"; redirectTo: string };

type PartnerApplicationContextValue = {
  data: PartnerApplicationResponse | null;
  setData: Dispatch<SetStateAction<PartnerApplicationResponse | null>>;
  error: string;
  isLoading: boolean;
  reload: () => Promise<void>;
};

const PartnerApplicationContext =
  createContext<PartnerApplicationContextValue | null>(null);

async function requestPartnerApplication(): Promise<ApplicationRequestResult> {
  const response = await fetch(buildApiUrl(routes.api.partnerAuth.application), {
    credentials: "include",
    cache: "no-store",
  });
  const result = (await response.json().catch(() => ({}))) as
    | PartnerApplicationResponse
    | ApiErrorResponse;

  if (response.status === 401) return { kind: "unauthorized" };

  if (
    response.status === 403 &&
    typeof result === "object" &&
    result !== null &&
    "redirectTo" in result &&
    typeof result.redirectTo === "string"
  ) {
    return { kind: "redirect", redirectTo: result.redirectTo };
  }

  const hasApplication =
    typeof result === "object" && result !== null && "application" in result;

  if (!response.ok || !hasApplication) {
    throw new Error(
      (result as ApiErrorResponse).message ?? "Unable to load your application.",
    );
  }

  return { kind: "success", data: result as PartnerApplicationResponse };
}

export function PartnerApplicationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<PartnerApplicationResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const inFlightRef = useRef<Promise<ApplicationRequestResult> | null>(null);
  const hasLoadedRef = useRef(false);

  const reload = useCallback(async () => {
    try {
      const request = inFlightRef.current ?? requestPartnerApplication();
      inFlightRef.current = request;
      const result = await request;

      if (result.kind === "unauthorized") {
        router.replace(routes.web.partnerLogin);
        return;
      }

      if (result.kind === "redirect") {
        router.replace(result.redirectTo);
        return;
      }

      setData(result.data);
      setError("");
      hasLoadedRef.current = true;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load your application.",
      );
    } finally {
      inFlightRef.current = null;
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (pathname === routes.web.partnerApplicationProcessing || hasLoadedRef.current) {
      return;
    }

    void reload();
  }, [pathname, reload]);

  const value = useMemo(
    () => ({ data, setData, error, isLoading, reload }),
    [data, error, isLoading, reload],
  );

  return (
    <PartnerApplicationContext.Provider value={value}>
      {children}
    </PartnerApplicationContext.Provider>
  );
}

export function useOptionalPartnerApplication() {
  return useContext(PartnerApplicationContext);
}
