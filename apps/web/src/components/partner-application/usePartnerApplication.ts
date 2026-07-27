"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import type { ApiErrorResponse, PartnerApplicationResponse } from "./types";

export function usePartnerApplication() {
  const router = useRouter();
  const [data, setData] = useState<PartnerApplicationResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(buildApiUrl(routes.api.partnerAuth.application), {
        credentials: "include",
        cache: "no-store",
      });
      const result = (await response.json().catch(() => ({}))) as
        | PartnerApplicationResponse
        | ApiErrorResponse;

      if (!response.ok || !("application" in result)) {
        if (response.status === 401) {
          router.replace(routes.web.partnerApplication);
          return;
        }
        throw new Error((result as ApiErrorResponse).message ?? "Unable to load your application.");
      }

      setData(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your application.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, setData, error, isLoading, reload: load };
}
