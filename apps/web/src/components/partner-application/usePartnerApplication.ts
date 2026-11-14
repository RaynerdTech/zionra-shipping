"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import { fetchMemoryCached, readMemoryCache } from "@/lib/memoryCache";
import type { ApiErrorResponse, PartnerApplicationResponse } from "./types";
import { useOptionalPartnerApplication } from "./PartnerApplicationProvider";

type ApplicationRequestResult =
  | { kind: "success"; data: PartnerApplicationResponse }
  | { kind: "unauthorized" }
  | { kind: "redirect"; redirectTo: string };

async function requestPartnerData(
  endpoint: string,
): Promise<ApplicationRequestResult> {
  const response = await fetch(buildApiUrl(endpoint), {
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

export function usePartnerApplication({
  dashboard = false,
}: { dashboard?: boolean } = {}) {
  const router = useRouter();
  const context = useOptionalPartnerApplication();
  const cachedDashboard = readMemoryCache<PartnerApplicationResponse>("partner-dashboard");
  const [dashboardData, setDashboardData] =
    useState<PartnerApplicationResponse | null>(cachedDashboard ?? null);
  const [dashboardError, setDashboardError] = useState("");
  const [dashboardLoading, setDashboardLoading] = useState(dashboard && !cachedDashboard);

  const fetchDashboard = useCallback(async () => {
    return fetchMemoryCached(
      "partner-dashboard",
      async () => {
        const response = await requestPartnerData(routes.api.partnerAuth.dashboard);
        if (response.kind === "unauthorized") {
          router.replace(routes.web.partnerLogin);
          throw new Error("Your partner session has expired.");
        }
        if (response.kind === "redirect") {
          router.replace(response.redirectTo);
          throw new Error("Redirecting to the next application step.");
        }
        return response.data;
      },
      45_000,
    );
  }, [router]);

  const reloadDashboard = useCallback(async () => {
    setDashboardLoading(true);

    try {
      const result = await fetchDashboard();
      setDashboardData(result);
      setDashboardError("");
    } catch (caught) {
      setDashboardError(
        caught instanceof Error
          ? caught.message
          : "Unable to load your dashboard.",
      );
    } finally {
      setDashboardLoading(false);
    }
  }, [fetchDashboard]);

  useEffect(() => {
    if (!dashboard) return;

    let active = true;

    async function loadDashboard() {
      try {
        const result = await fetchDashboard();
        if (!active) return;

        setDashboardData(result);
        setDashboardError("");
      } catch (caught) {
        if (active) {
          setDashboardError(
            caught instanceof Error
              ? caught.message
              : "Unable to load your dashboard.",
          );
        }
      } finally {
        if (active) setDashboardLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [dashboard, fetchDashboard]);

  if (dashboard) {
    return {
      data: dashboardData,
      setData: setDashboardData,
      error: dashboardError,
      isLoading: dashboardLoading,
      reload: reloadDashboard,
    };
  }

  if (!context) {
    throw new Error(
      "usePartnerApplication must be used inside the partner application layout.",
    );
  }

  return context;
}
