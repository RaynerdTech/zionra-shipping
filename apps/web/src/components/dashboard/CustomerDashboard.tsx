/**
 * Responsibility:
 * Renders the protected customer dashboard placeholder.
 * It verifies the current customer session, displays basic account details,
 * and signs the customer out through the API.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  countryOfResidence: string;
  referralSource: string | null;
  marketingOptIn: boolean;
  emailVerified: boolean;
  createdAt: string;
};

type CurrentCustomerResponse = {
  customer?: Customer;
  message?: string;
};

type LogoutResponse = {
  message?: string;
};

function PackageIcon() {
  return (
    <svg
      aria-hidden="true"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
    >
      <path
        d="M4.667 8.633 14 3.5l9.333 5.133v10.734L14 24.5l-9.333-5.133V8.633Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m4.9 8.75 9.1 5 9.1-5M14 13.75V24"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m9.333 6.067 9.334 5.133v4.433"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 3 5.5 5.7v5.45c0 4.23 2.76 7.97 6.5 9.35 3.74-1.38 6.5-5.12 6.5-9.35V5.7L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m9 11.8 1.9 1.9 4.2-4.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M8.25 3.5H5.5A1.5 1.5 0 0 0 4 5v10a1.5 1.5 0 0 0 1.5 1.5h2.75M12.5 6l4 4-4 4M16.5 10H8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatCustomerSince(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Recently joined";
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}

class UnauthenticatedCustomerError extends Error {
  constructor() {
    super("Customer is not authenticated.");
    this.name = "UnauthenticatedCustomerError";
  }
}

async function requestCurrentCustomer(signal?: AbortSignal) {
  const response = await fetch(buildApiUrl(routes.api.customerAuth.me), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal,
  });

  const result = (await response
    .json()
    .catch(() => ({}))) as CurrentCustomerResponse;

  if (response.status === 401) {
    throw new UnauthenticatedCustomerError();
  }

  if (!response.ok || !result.customer) {
    throw new Error(result.message ?? "Unable to load your account.");
  }

  return result.customer;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    void requestCurrentCustomer(controller.signal)
      .then((currentCustomer) => {
        if (controller.signal.aborted) {
          return;
        }

        setCustomer(currentCustomer);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (
          controller.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }

        if (error instanceof UnauthenticatedCustomerError) {
          router.replace(routes.web.customerLogin);
          return;
        }

        console.error("Customer dashboard could not load:", error);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load your account. Please try again.",
        );
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [router]);

  async function handleRetry() {
    setIsLoading(true);
    setLoadError("");

    try {
      const currentCustomer = await requestCurrentCustomer();
      setCustomer(currentCustomer);
    } catch (error) {
      if (error instanceof UnauthenticatedCustomerError) {
        router.replace(routes.web.customerLogin);
        return;
      }

      console.error("Customer dashboard retry failed:", error);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load your account. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch(
        buildApiUrl(routes.api.customerAuth.logout),
        {
          method: "POST",
          credentials: "include",
        },
      );

      const result = (await response
        .json()
        .catch(() => ({}))) as LogoutResponse;

      if (!response.ok) {
        throw new Error(result.message ?? "Unable to sign out.");
      }

      router.replace(routes.web.customerLogin);
      router.refresh();
    } catch (error) {
      console.error("Customer logout failed:", error);
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Unable to sign out. Please try again.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-01 px-6">
        <div className="flex items-center gap-3 text-primary-06" role="status">
          <LoadingSpinner />
          <span className="font-sans text-sm text-neutral-07">
            Loading your dashboard…
          </span>
        </div>
      </main>
    );
  }

  if (loadError || !customer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-01 px-6 py-12">
        <section className="w-full max-w-md rounded-2xl border border-neutral-02 bg-white p-6 text-center shadow-[0_14px_42px_rgba(15,44,88,0.08)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-01 text-primary-06">
            <PackageIcon />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold text-neutral-10">
            We could not load your dashboard
          </h1>
          <p className="mt-2 font-sans text-sm leading-[22px] text-text-body-light">
            {loadError || "Please try loading your account again."}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="zion-btn zion-btn-md zion-btn-blue mt-6 w-full"
          >
            Try again
          </button>
          <Link
            href={routes.web.customerLogin}
            className="mt-3 inline-flex min-h-10 items-center justify-center font-sans text-sm font-medium text-primary-06 no-underline"
          >
            Return to login
          </Link>
        </section>
      </main>
    );
  }

  const fullName = `${customer.firstName} ${customer.lastName}`.trim();
  const initials = `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();

  return (
    <main className="min-h-screen bg-neutral-01">
      <header className="border-b border-neutral-02 bg-white">
        <div className="mx-auto flex min-h-[72px] w-full max-w-[1200px] items-center justify-between gap-4 px-5 md:px-8">
          <Link
            href={routes.web.home}
            aria-label="Zionra home"
            className="flex items-center gap-2 no-underline"
          >
            <Image
              src="/images/logo-zionra.png"
              alt=""
              width={32}
              height={32}
              priority
              className="h-8 w-8 object-contain"
            />
            <span className="font-display text-[22px] font-bold tracking-[-0.5px] text-primary-10">
              zionra
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="zion-btn zion-btn-outline-blue min-w-0 px-4"
          >
            {isLoggingOut ? (
              <>
                <LoadingSpinner />
                <span>Signing out</span>
              </>
            ) : (
              <>
                <LogoutIcon />
                <span>Log out</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-8 md:py-12">
        <section className="overflow-hidden rounded-3xl bg-primary-10 px-6 py-8 text-white shadow-[0_20px_55px_rgba(7,22,44,0.16)] md:px-10 md:py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full bg-primary-08 px-3 py-1 font-sans text-xs font-medium tracking-[0.4px] text-primary-02">
                CUSTOMER ACCOUNT
              </span>
              <h1 className="mt-4 font-display text-[30px] font-semibold leading-[40px] tracking-[-0.8px] md:text-[40px] md:leading-[50px]">
                Welcome, {customer.firstName}
              </h1>
              <p className="mt-2 max-w-[620px] font-sans text-sm leading-[22px] text-text-on-dark-muted md:text-base md:leading-[26px]">
                Your Zionra customer dashboard is ready. Shipment tools and
                account features will appear here as they are released.
              </p>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-primary-07 bg-primary-09 font-display text-2xl font-semibold text-white md:h-24 md:w-24 md:text-3xl">
              {initials || "ZR"}
            </div>
          </div>
        </section>

        {logoutError ? (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-error/20 bg-white px-4 py-3 font-sans text-sm leading-[22px] text-error"
          >
            {logoutError}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-2xl border border-neutral-02 bg-white p-6 shadow-[0_10px_30px_rgba(15,44,88,0.06)] md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-sans text-xs font-medium tracking-[1.2px] text-primary-06">
                  ACCOUNT DETAILS
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.5px] text-neutral-10">
                  Your profile
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-tertiary-01 text-tertiary-08">
                <ShieldCheckIcon />
              </div>
            </div>

            <dl className="mt-7 divide-y divide-neutral-02">
              <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
                <dt className="font-sans text-sm text-neutral-06">Full name</dt>
                <dd className="font-sans text-sm font-medium text-neutral-10 sm:text-right">
                  {fullName}
                </dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
                <dt className="font-sans text-sm text-neutral-06">Email address</dt>
                <dd className="break-all font-sans text-sm font-medium text-neutral-10 sm:text-right">
                  {customer.email}
                </dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
                <dt className="font-sans text-sm text-neutral-06">Phone number</dt>
                <dd className="font-sans text-sm font-medium text-neutral-10 sm:text-right">
                  {customer.phoneCountryCode} {customer.phoneNumber}
                </dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
                <dt className="font-sans text-sm text-neutral-06">Country</dt>
                <dd className="font-sans text-sm font-medium text-neutral-10 sm:text-right">
                  {customer.countryOfResidence}
                </dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
                <dt className="font-sans text-sm text-neutral-06">Member since</dt>
                <dd className="font-sans text-sm font-medium text-neutral-10 sm:text-right">
                  {formatCustomerSince(customer.createdAt)}
                </dd>
              </div>
            </dl>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-tertiary-02 bg-tertiary-01 p-6 md:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-tertiary-08">
                <ShieldCheckIcon />
              </div>
              <h2 className="mt-5 font-display text-xl font-semibold text-neutral-10">
                Account verified
              </h2>
              <p className="mt-2 font-sans text-sm leading-[22px] text-text-body-light">
                Your email is verified and your customer session is active.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 font-sans text-xs font-medium text-tertiary-09">
                <span className="h-2 w-2 rounded-full bg-tertiary-06" />
                {customer.emailVerified ? "Verified" : "Verification pending"}
              </span>
            </section>

            <section className="rounded-2xl border border-primary-02 bg-primary-01 p-6 md:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary-06">
                <PackageIcon />
              </div>
              <h2 className="mt-5 font-display text-xl font-semibold text-neutral-10">
                Shipping dashboard coming next
              </h2>
              <p className="mt-2 font-sans text-sm leading-[22px] text-text-body-light">
                Quotes, shipments, tracking updates, and saved delivery details
                will be added here as the platform develops.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
