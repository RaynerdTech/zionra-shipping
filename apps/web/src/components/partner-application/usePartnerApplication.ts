"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import type { ApiErrorResponse, PartnerApplicationResponse } from "./types";

type ApplicationRequestResult =
  | { kind: "success"; data: PartnerApplicationResponse }
  | { kind: "unauthorized" };

async function requestPartnerApplication(
  signal?: AbortSignal,
): Promise<ApplicationRequestResult> {
  const response = await fetch(
    buildApiUrl(routes.api.partnerAuth.application),
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

export function usePartnerApplication() {
  const router = useRouter();
  const [data, setData] = useState<PartnerApplicationResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function loadInitialApplication() {
      try {
        const result = await requestPartnerApplication(controller.signal);
        if (!isActive) return;

        if (result.kind === "unauthorized") {
          router.replace(routes.web.partnerApplication);
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
  }, [router]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await requestPartnerApplication();

      if (result.kind === "unauthorized") {
        router.replace(routes.web.partnerApplication);
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
  }, [router]);

  return { data, setData, error, isLoading, reload };
}
