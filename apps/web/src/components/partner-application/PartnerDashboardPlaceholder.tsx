"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ApplicationLoadError, ApplicationLoading } from "./PartnerApplicationUI";
import type { PartnerApplicationStep } from "./types";
import { usePartnerApplication } from "./usePartnerApplication";

const DASHBOARD_FEATURES = [
  {
    title: "Shipment requests",
    description: "Review and respond to customer shipment requests.",
  },
  {
    title: "Active shipments",
    description: "Manage accepted shipments and delivery progress.",
  },
  {
    title: "Payments and payouts",
    description: "View earnings, payments, and payout activity.",
  },
] as const;

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

function getApplicationRoute(step: PartnerApplicationStep) {
  switch (step) {
    case "OPERATIONAL_DETAILS":
      return routes.web.partnerOperationalDetails;
    case "ACCOUNT_INFORMATION":
      return routes.web.partnerAccountInformation;
    case "REVIEW":
      return routes.web.partnerApplicationReview;
    case "SUBMITTED":
      return routes.web.partnerApplicationSubmitted;
    case "BUSINESS_INFORMATION":
    default:
      return routes.web.partnerBusinessInformation;
  }
}

function getStatusCopy(status: string) {
  switch (status) {
    case "APPROVED":
      return {
        label: "Approved",
        title: "Full dashboard access",
        description:
          "Your shipping-partner application has been approved. Partner tools will become available here as each dashboard feature is released.",
        panelClass: "border-tertiary-04 bg-tertiary-01",
        badgeClass: "bg-tertiary-09 text-white",
      };
    case "UNDER_REVIEW":
      return {
        label: "Under review",
        title: "Limited dashboard access",
        description:
          "Your application is currently under review. You can view your application details, but operational tools remain locked until approval.",
        panelClass: "border-primary-03 bg-primary-01",
        badgeClass: "bg-primary-06 text-white",
      };
    case "REJECTED":
      return {
        label: "Not approved",
        title: "View-only dashboard access",
        description:
          "Your application was not approved. You can still view your submitted details, but operational tools are unavailable.",
        panelClass: "border-error/30 bg-error/5",
        badgeClass: "bg-error text-white",
      };
    case "SUSPENDED":
      return {
        label: "Suspended",
        title: "View-only dashboard access",
        description:
          "This partner account is suspended. You can view account information, but all operational tools are unavailable.",
        panelClass: "border-error/30 bg-error/5",
        badgeClass: "bg-error text-white",
      };
    case "APPLICATION_SUBMITTED":
      return {
        label: "Application submitted",
        title: "Limited dashboard access",
        description:
          "Your application is awaiting review. You can view your submitted details, but operational tools remain locked until approval.",
        panelClass: "border-secondary-04 bg-secondary-01",
        badgeClass: "bg-secondary-07 text-white",
      };
    case "ONBOARDING":
    default:
      return {
        label: "Application incomplete",
        title: "Limited dashboard access",
        description:
          "Complete and submit your partner application. You can view this dashboard now, but operational tools remain locked until approval.",
        panelClass: "border-secondary-04 bg-secondary-01",
        badgeClass: "bg-secondary-07 text-white",
      };
  }
}

export default function PartnerDashboardPlaceholder() {
  const router = useRouter();
  const { data, error, isLoading } = usePartnerApplication({ dashboard: true });
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

  const isApproved = data.partner.status === "APPROVED";
  const statusCopy = getStatusCopy(data.partner.status);
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
              Welcome, {data.partner.firstName}. View your application status and partner details.
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

        <section className={`mt-5 rounded-2xl border p-5 md:p-6 ${statusCopy.panelClass}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className={`inline-flex rounded-full px-3 py-1 font-sans text-xs font-medium ${statusCopy.badgeClass}`}>
                {statusCopy.label}
              </span>
              <h2 className="mt-3 font-display text-xl font-semibold text-primary-10">
                {statusCopy.title}
              </h2>
              <p className="mt-1 max-w-[660px] font-sans text-sm leading-6 text-text-body-light">
                {statusCopy.description}
              </p>
            </div>

            {data.partner.status === "ONBOARDING" ? (
              <Link
                href={getApplicationRoute(data.application.currentStep)}
                className="zion-btn zion-btn-blue zion-btn-md shrink-0"
              >
                Continue application
              </Link>
            ) : null}
          </div>
        </section>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-primary-01 p-4">
            <p className="font-sans text-xs text-neutral-06">Application status</p>
            <p className="mt-1 font-display text-lg font-semibold text-primary-08">
              {statusCopy.label}
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-primary-10">
                Partner tools
              </h2>
              <p className="mt-1 font-sans text-sm leading-6 text-text-body-light">
                {isApproved
                  ? "Your account is approved. These operational areas are placeholders for upcoming dashboard features."
                  : "These operational areas stay locked until your application is approved."}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 font-sans text-xs font-medium ${isApproved ? "bg-tertiary-01 text-tertiary-09" : "bg-neutral-02 text-neutral-07"}`}>
              {isApproved ? "Approved access" : "Limited access"}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {DASHBOARD_FEATURES.map((feature) => (
              <div
                key={feature.title}
                aria-disabled="true"
                className={`rounded-xl border p-4 ${isApproved ? "border-primary-02 bg-primary-01/40" : "border-neutral-02 bg-neutral-01 opacity-75"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-base font-semibold text-primary-10">
                    {feature.title}
                  </h3>
                  <span className={`rounded-full px-2 py-0.5 font-sans text-[10px] font-medium ${isApproved ? "bg-primary-02 text-primary-08" : "bg-neutral-02 text-neutral-07"}`}>
                    {isApproved ? "Coming soon" : "Locked"}
                  </span>
                </div>
                <p className="mt-2 font-sans text-xs leading-5 text-text-body-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

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
