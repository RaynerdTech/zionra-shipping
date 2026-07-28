"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ApplicationLoadError, ApplicationLoading } from "./PartnerApplicationUI";
import { usePartnerApplication } from "./usePartnerApplication";

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0 rounded-xl border border-neutral-02 bg-white p-4">
      <p className="font-sans text-xs text-neutral-06">{label}</p>
      <p className="mt-1 break-words font-sans text-sm font-medium text-primary-10">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function formatSubmittedDate(value: string | null) {
  if (!value) return "Not submitted";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function PartnerDashboardPlaceholder() {
  const router = useRouter();
  const { data, error, isLoading } = usePartnerApplication();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function logout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch(buildApiUrl(routes.api.partnerAuth.logout), {
        method: "POST",
        credentials: "include",
      });

      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(result.message ?? "Unable to log out.");
      }

      router.replace(routes.web.home);
      router.refresh();
    } catch (logoutFailure) {
      setLogoutError(
        logoutFailure instanceof Error
          ? logoutFailure.message
          : "Unable to log out.",
      );
      setIsLoggingOut(false);
    }
  }

  if (isLoading || !data) {
    return error ? <ApplicationLoadError message={error} /> : <ApplicationLoading />;
  }

  const fullName = `${data.partner.firstName} ${data.partner.lastName}`.trim();
  const partnerPhone = `${data.partner.phoneCountryCode} ${data.partner.phoneNumber}`.trim();
  const companyPhone = [
    data.application.companyPhoneCountryCode,
    data.application.companyPhoneNumber,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="min-h-screen bg-neutral-01 px-4 py-8 sm:px-6 md:py-10">
      <section className="mx-auto max-w-[920px]">
        <div className="flex flex-col gap-4 rounded-2xl border border-neutral-02 bg-white p-5 sm:flex-row sm:items-center sm:justify-between md:p-7">
          <div>
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo-zionra.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
                priority
              />
              <span className="font-display text-xl font-bold text-primary-10">
                zionra
              </span>
            </div>
            <h1 className="mt-5 font-display text-2xl font-semibold text-primary-10 md:text-3xl">
              Partner Dashboard
            </h1>
            <p className="mt-1 font-sans text-sm leading-6 text-text-body-light">
              Welcome, {data.partner.firstName}. Your submitted partner details are shown below.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            disabled={isLoggingOut}
            className="zion-btn zion-btn-outline-blue zion-btn-md min-w-[120px]"
          >
            {isLoggingOut ? <LoadingSpinner /> : "Log out"}
          </button>
        </div>

        {logoutError ? (
          <p className="zion-field-error mt-3 text-center">{logoutError}</p>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-primary-01 p-4">
            <p className="font-sans text-xs text-neutral-06">Application status</p>
            <p className="mt-1 font-display text-lg font-semibold text-primary-08">
              {data.partner.status.replaceAll("_", " ")}
            </p>
          </div>
          <div className="rounded-xl bg-primary-01 p-4">
            <p className="font-sans text-xs text-neutral-06">Application reference</p>
            <p className="mt-1 break-words font-display text-lg font-semibold text-primary-08">
              {data.application.applicationReference ?? "Not submitted"}
            </p>
          </div>
          <div className="rounded-xl bg-primary-01 p-4 sm:col-span-2 lg:col-span-1">
            <p className="font-sans text-xs text-neutral-06">Submitted on</p>
            <p className="mt-1 font-display text-lg font-semibold text-primary-08">
              {formatSubmittedDate(data.application.submittedAt)}
            </p>
          </div>
        </div>

        <section className="mt-5 rounded-2xl border border-neutral-02 bg-white p-5 md:p-7">
          <h2 className="font-display text-xl font-semibold text-primary-10">
            Personal details
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DetailItem label="Full name" value={fullName} />
            <DetailItem label="Email address" value={data.partner.email} />
            <DetailItem label="Phone number" value={partnerPhone} />
            <DetailItem
              label="Country of residence"
              value={data.partner.countryOfResidence}
            />
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-neutral-02 bg-white p-5 md:p-7">
          <h2 className="font-display text-xl font-semibold text-primary-10">
            Business details
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DetailItem
              label="Registered business name"
              value={data.application.registeredBusinessName}
            />
            <DetailItem
              label="Company email address"
              value={data.application.companyEmailAddress}
            />
            <DetailItem
              label="Company phone number"
              value={companyPhone}
            />
            <DetailItem
              label="Company House Number"
              value={data.application.companyHouseNumber}
            />
            <div className="sm:col-span-2">
              <DetailItem
                label="Business address"
                value={data.application.businessAddress}
              />
            </div>
            <DetailItem label="Website" value={data.application.website} />
            <DetailItem
              label="Shipping method"
              value={data.application.shippingMethod}
            />
            <DetailItem
              label="Collection method"
              value={data.application.collectionMethod}
            />
            <DetailItem
              label="Delivery method"
              value={data.application.deliveryMethod}
            />
          </div>
        </section>
      </section>
    </main>
  );
}