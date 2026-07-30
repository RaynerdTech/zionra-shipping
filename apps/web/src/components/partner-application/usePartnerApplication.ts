"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import type { ApiErrorResponse, PartnerApplicationResponse } from "./types";

type ApplicationRequestResult =
  | { kind: "success"; data: PartnerApplicationResponse }
  | { kind: "unauthorized" }
  | { kind: "redirect"; redirectTo: string };

async function requestPartnerApplication(
  endpoint: string,
  signal?: AbortSignal,
): Promise<ApplicationRequestResult> {
  const response = await fetch(
    buildApiUrl(endpoint),
    {
      credentials: "include",
      cache: "no-store",
      signal,
    },
  );
  const result = (await response.json().catch(() => ({}))) as
    | PartnerApplicationResponse
    | ApiErrorResponse;

  if (response.status === 401) {
    return { kind: "unauthorized" };
  }

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
    typeof result === "object" &&
    result !== null &&
    "application" in result;

  if (!response.ok || !hasApplication) {
    throw new Error(
      (result as ApiErrorResponse).message ??
        "Unable to load your application.",
    );
  }

  return { kind: "success", data: result };
}

export function usePartnerApplication({
  approvedOnly = false,
}: { approvedOnly?: boolean } = {}) {
  const endpoint = approvedOnly
    ? routes.api.partnerAuth.dashboard
    : routes.api.partnerAuth.application;
  const router = useRouter();
  const [data, setData] = useState<PartnerApplicationResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function loadInitialApplication() {
      try {
        const result = await requestPartnerApplication(endpoint, controller.signal);
        if (!isActive) return;

        if (result.kind === "unauthorized") {
          router.replace(routes.web.partnerLogin);
          return;
        }

        if (result.kind === "redirect") {
          router.replace(result.redirectTo);
          return;
        }

        setData(result.data);
      } catch (loadError) {
        if (!isActive || controller.signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your application.",
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadInitialApplication();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [endpoint, router]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await requestPartnerApplication(endpoint);

      if (result.kind === "unauthorized") {
        router.replace(routes.web.partnerLogin);
        return;
      }

      if (result.kind === "redirect") {
        router.replace(result.redirectTo);
        return;
      }

      setData(result.data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load your application.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, router]);

  return { data, setData, error, isLoading, reload };
}
