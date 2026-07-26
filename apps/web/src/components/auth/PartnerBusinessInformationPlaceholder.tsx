/**
 * Responsibility:
 * Protects the first partner-onboarding route and provides a temporary handoff
 * until the Business Information form is delivered in the next batch.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function PartnerBusinessInformationPlaceholder() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(buildApiUrl(routes.api.partnerAuth.me), {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json().catch(() => ({}))) as {
          partner?: { firstName?: string };
        };

        if (!response.ok || !result.partner) {
          router.replace(routes.web.partnerApplication);
          return;
        }

        setFirstName(result.partner.firstName ?? "");
        setIsLoading(false);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        router.replace(routes.web.partnerApplication);
      });

    return () => controller.abort();
  }, [router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-01 text-primary-06">
        <LoadingSpinner />
        <span className="sr-only">Loading partner onboarding</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-01 px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-[720px] rounded-2xl border border-neutral-03 bg-white px-6 py-10 text-center sm:px-12">
        <div className="mx-auto flex w-fit items-center gap-2">
          <Image src="/images/logo-zionra.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          <span className="font-display text-xl font-bold text-primary-10">zionra</span>
        </div>
        <h1 className="mt-7 font-display text-3xl font-semibold text-primary-10">
          Email verified{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mx-auto mt-3 max-w-[480px] font-sans text-base leading-7 text-text-body-light">
          Your shipping-partner account is ready. Business Information is the next onboarding step and will be added in the next batch.
        </p>
        <Link href={routes.web.partnerApplication} className="zion-btn zion-btn-md zion-btn-outline-blue mt-8">
          Back to partner registration
        </Link>
      </section>
    </main>
  );
}
