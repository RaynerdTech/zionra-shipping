/**
 * Responsibility:
 * Loads a pending Google profile and collects the remaining information needed
 * to create the Zionra customer account and authenticated customer session.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import type { CountryCode } from "libphonenumber-js";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import CountrySelect from "../ui/CountrySelect";
import LoadingSpinner from "../ui/LoadingSpinner";

const REFERRAL_OPTIONS = [
  "Search Engine",
  "Social Media",
  "Friend or Colleague",
  "Online Ad",
  "Email Campaign",
  "Event or Conference",
] as const;

type PendingGoogleProfile = {
  firstName: string;
  lastName: string;
  email: string;
};

type FormValues = {
  firstName: string;
  lastName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  countryOfResidence: string;
  referralSource: string;
  acceptedTerms: boolean;
  marketingOptIn: boolean;
};

type FormErrors = Partial<Record<keyof FormValues | "form", string>>;

type ApiResponse = {
  message?: string;
  code?: string;
  errors?: Record<string, string>;
  profile?: PendingGoogleProfile;
  redirectTo?: string;
};

const INITIAL_VALUES: FormValues = {
  firstName: "",
  lastName: "",
  phoneCountryCode: "+44",
  phoneNumber: "",
  countryOfResidence: "United Kingdom",
  referralSource: "",
  acceptedTerms: false,
  marketingOptIn: false,
};

function DecorativeCircles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-[-6px] top-[-34px] z-10 h-[136px] w-[136px] md:h-[240px] md:w-[240px] md:right-0 md:-top-[56px]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-[-20px] top-0 h-[136px] w-[136px] md:h-[240px] md:w-[240px]"
        viewBox="0 0 220 160"
        fill="none"
      >
        <circle
          cx="120"
          cy="40"
          r="120"
          fill="#286BDC"
          fillOpacity="0.05"
        />
      </svg>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-[-6px] top-[-6px] h-[95.2px] w-[95.2px] md:right-0 md:top-0 md:h-[150px] md:w-[150px]"
        viewBox="0 0 150 150"
        fill="none"
      >
        <circle
          cx="75"
          cy="75"
          r="75"
          fill="#286BDC"
          fillOpacity="0.04"
        />
      </svg>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M4.083 5.833 7 8.75l2.917-2.917"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type FieldLabelProps = {
  children: React.ReactNode;
  required?: boolean;
};

function FieldLabel({ children, required = false }: FieldLabelProps) {
  return (
    <span className="mb-2 block font-sans text-sm font-normal leading-[22px] text-neutral-10">
      {children}
      {required ? <span className="text-error"> *</span> : null}
    </span>
  );
}

type SectionLabelProps = {
  children: React.ReactNode;
};

function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div className="relative flex h-6 items-center rounded-md bg-primary-01 pl-4 font-sans text-xs font-normal text-primary-06 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-md before:bg-primary-06">
      {children}
    </div>
  );
}

function getApiMessage(result: ApiResponse, fallback: string) {
  return result.message ?? fallback;
}

export default function CompleteGoogleProfileForm() {
  const router = useRouter();

  const [profile, setProfile] = useState<PendingGoogleProfile | null>(null);
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>("GB");
  const [residenceCountry, setResidenceCountry] =
    useState<CountryCode>("GB");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestartingGoogle, setIsRestartingGoogle] = useState(false);
  const [loadError, setLoadError] = useState<ApiResponse | null>(null);

  useEffect(() => {
    function resetRestoredLoadingState() {
      setIsSubmitting(false);
      setIsRestartingGoogle(false);
    }

    window.addEventListener("pageshow", resetRestoredLoadingState);

    return () => {
      window.removeEventListener("pageshow", resetRestoredLoadingState);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPendingProfile() {
      try {
        const response = await fetch(
          buildApiUrl(routes.api.customerAuth.googlePendingProfile),
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const result = (await response.json().catch(() => ({}))) as ApiResponse;

        if (!response.ok || !result.profile) {
          setLoadError({
            message: getApiMessage(
              result,
              "Unable to load your Google profile. Start again with Google.",
            ),
            code: result.code,
          });
          return;
        }

        setProfile(result.profile);
        setValues((current) => ({
          ...current,
          firstName: result.profile?.firstName ?? "",
          lastName: result.profile?.lastName ?? "",
        }));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Pending Google profile could not be loaded:", error);
        setLoadError({
          message: "Unable to reach the server. Start again with Google.",
        });
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProfile(false);
        }
      }
    }

    void loadPendingProfile();

    return () => controller.abort();
  }, []);

  function updateValue(field: keyof FormValues, value: string | boolean) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      if (!current[field] && !current.form) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      delete nextErrors.form;
      return nextErrors;
    });
  }

  function validateForm() {
    const nextErrors: FormErrors = {};
    const requiredMessage = "This field can't be left empty.";
    const normalizedPhoneNumber = values.phoneNumber.replace(/\D/g, "");

    if (!values.firstName.trim()) {
      nextErrors.firstName = requiredMessage;
    }

    if (!values.lastName.trim()) {
      nextErrors.lastName = requiredMessage;
    }

    if (!values.phoneCountryCode) {
      nextErrors.phoneCountryCode = requiredMessage;
    }

    if (!values.phoneNumber.trim()) {
      nextErrors.phoneNumber = requiredMessage;
    } else if (normalizedPhoneNumber.length < 7) {
      nextErrors.phoneNumber = "Enter a valid phone number.";
    }

    if (!values.countryOfResidence) {
      nextErrors.countryOfResidence = requiredMessage;
    }

    if (!values.acceptedTerms) {
      nextErrors.acceptedTerms =
        "You must agree to Zionra's Terms of Service and Privacy Policy.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(
        buildApiUrl(routes.api.customerAuth.googleCompleteProfile),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            phoneCountryCode: values.phoneCountryCode,
            phoneNumber: values.phoneNumber.replace(/\D/g, ""),
            countryOfResidence: values.countryOfResidence,
            referralSource: values.referralSource || null,
            acceptedTerms: values.acceptedTerms,
            marketingOptIn: values.marketingOptIn,
          }),
        },
      );

      const result = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        if (result.code === "GOOGLE_SIGNUP_EXPIRED") {
          setLoadError(result);
          return;
        }

        setErrors({
          ...(result.errors ?? {}),
          form: getApiMessage(result, "Unable to complete your account."),
        } as FormErrors);
        return;
      }

      router.replace(result.redirectTo ?? routes.web.customerDashboard);
      router.refresh();
    } catch (error) {
      console.error("Google profile completion failed:", error);
      setErrors({
        form: "Unable to reach the server. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function restartGoogleSignup() {
    if (isRestartingGoogle) {
      return;
    }

    setIsRestartingGoogle(true);
    window.location.replace(buildApiUrl(routes.api.customerAuth.google));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-01 px-0 pt-3 md:flex md:items-center md:justify-center md:p-8">
      <DecorativeCircles />

      <section className="relative min-h-[calc(100vh-12px)] w-full overflow-hidden rounded-t-[24px] bg-white px-6 pb-8 pt-7 shadow-[0_4px_4px_rgba(0,0,0,0.25)] md:min-h-0 md:max-w-[660px] md:rounded-2xl md:px-12 md:py-10 md:shadow-none">
        <div className="relative z-[1] mx-auto w-full max-w-[520px]">
          <div className="mx-auto flex w-fit items-center gap-2">
            <Image
              src="/images/logo-zionra.png"
              alt=""
              width={28}
              height={28}
              priority
              className="h-7 w-7 object-contain"
            />
            <span className="font-display text-xl font-bold leading-normal tracking-[-0.5px] text-primary-10">
              zionra
            </span>
          </div>

          <header className="mt-6 text-center">
            <h1 className="font-display text-2xl font-semibold leading-[34px] tracking-[-0.5px] text-neutral-10">
              Complete your profile
            </h1>
            <p className="mx-auto mt-2 max-w-[390px] font-sans text-sm font-normal leading-[22px] text-text-body-light md:text-base md:leading-[26px]">
              Add the remaining details to finish setting up your Zionra
              account.
            </p>
            <div className="mx-auto mt-4 h-px w-full bg-primary-06" />
          </header>

          {isLoadingProfile ? (
            <div className="flex min-h-[360px] items-center justify-center text-primary-06">
              <LoadingSpinner />
              <span className="sr-only">Loading your Google profile</span>
            </div>
          ) : loadError ? (
            <div className="mt-8 rounded-xl border border-primary-02 bg-primary-01 px-5 py-6 text-center">
              <p className="font-sans text-sm font-normal leading-[22px] text-primary-09">
                {loadError.message ??
                  "Your Google signup session has expired. Start again with Google."}
              </p>
              <button
                type="button"
                onClick={restartGoogleSignup}
                disabled={isRestartingGoogle}
                className="zion-btn zion-btn-md zion-btn-blue mt-5 w-full min-w-0"
              >
                {isRestartingGoogle ? (
                  <>
                    <LoadingSpinner />
                    <span className="sr-only">Starting Google signup</span>
                  </>
                ) : (
                  "Continue with Google"
                )}
              </button>
              <Link
                href={routes.web.customerLogin}
                className="mt-4 inline-flex font-sans text-sm font-normal text-primary-06 no-underline hover:text-primary-07"
              >
                Return to login
              </Link>
            </div>
          ) : profile ? (
            <>
              <div className="mt-6 rounded-xl border border-primary-02 bg-primary-01 px-4 py-3">
                <p className="font-display text-base font-semibold leading-6 text-neutral-10">
                  {[values.firstName, values.lastName]
                    .filter(Boolean)
                    .join(" ") || "Google profile"}
                </p>
                <p className="mt-1 break-all font-sans text-sm font-normal leading-[22px] text-text-body-light">
                  {profile.email}
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="mt-6">
                <SectionLabel>Personal Details</SectionLabel>

                <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-6">
                  <label htmlFor="firstName">
                    <FieldLabel required>First Name</FieldLabel>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={values.firstName}
                      placeholder="e.g. Jane"
                      aria-invalid={Boolean(errors.firstName)}
                      onChange={(event) =>
                        updateValue("firstName", event.target.value)
                      }
                      className="zion-input h-[52px] md:h-12"
                    />
                    {errors.firstName ? (
                      <p className="zion-field-error mt-1">
                        {errors.firstName}
                      </p>
                    ) : null}
                  </label>

                  <label htmlFor="lastName">
                    <FieldLabel required>Last Name</FieldLabel>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={values.lastName}
                      placeholder="e.g. Okonkwo"
                      aria-invalid={Boolean(errors.lastName)}
                      onChange={(event) =>
                        updateValue("lastName", event.target.value)
                      }
                      className="zion-input h-[52px] md:h-12"
                    />
                    {errors.lastName ? (
                      <p className="zion-field-error mt-1">
                        {errors.lastName}
                      </p>
                    ) : null}
                  </label>
                </div>

                <div className="mt-5">
                  <FieldLabel required>Mobile Number</FieldLabel>
                  <div className="grid grid-cols-[116px_minmax(0,1fr)] gap-3">
                    <CountrySelect
                      id="googleProfilePhoneCountry"
                      value={phoneCountry}
                      compact
                      error={Boolean(errors.phoneCountryCode)}
                      ariaLabel="Phone country code"
                      onChange={(country) => {
                        setPhoneCountry(country.code);
                        updateValue("phoneCountryCode", country.callingCode);
                      }}
                    />

                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={values.phoneNumber}
                      placeholder="0000 0000 00"
                      aria-invalid={Boolean(errors.phoneNumber)}
                      onChange={(event) =>
                        updateValue("phoneNumber", event.target.value)
                      }
                      className="zion-input h-[52px] md:h-12"
                    />
                  </div>
                  {errors.phoneCountryCode || errors.phoneNumber ? (
                    <p className="zion-field-error mt-1">
                      {errors.phoneCountryCode ?? errors.phoneNumber}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6">
                  <SectionLabel>Your Location</SectionLabel>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-6">
                  <div>
                    <FieldLabel required>Country of Residence</FieldLabel>
                    <CountrySelect
                      id="googleProfileResidenceCountry"
                      value={residenceCountry}
                      error={Boolean(errors.countryOfResidence)}
                      ariaLabel="Country of residence"
                      onChange={(country) => {
                        setResidenceCountry(country.code);
                        updateValue("countryOfResidence", country.name);
                      }}
                    />
                    {errors.countryOfResidence ? (
                      <p className="zion-field-error mt-1">
                        {errors.countryOfResidence}
                      </p>
                    ) : null}
                  </div>

                  <label htmlFor="referralSource">
                    <FieldLabel>How did you hear about us?</FieldLabel>
                    <div className="relative">
                      <select
                        id="referralSource"
                        name="referralSource"
                        value={values.referralSource}
                        onChange={(event) =>
                          updateValue("referralSource", event.target.value)
                        }
                        className="zion-input h-[52px] appearance-none pr-10 text-neutral-10 md:h-12"
                      >
                        <option value="">Select an option</option>
                        {REFERRAL_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary-01 text-primary-08">
                        <ChevronIcon />
                      </span>
                    </div>
                  </label>
                </div>

                <div className="mt-6 space-y-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={values.acceptedTerms}
                      onChange={(event) =>
                        updateValue("acceptedTerms", event.target.checked)
                      }
                      className="mt-[3px] h-4 w-4 shrink-0 accent-primary-06"
                    />
                    <span className="font-sans text-sm font-normal leading-[22px] text-neutral-10">
                      I agree to Zionra&apos;s{" "}
                      <Link
                        href={routes.web.terms}
                        className="text-primary-06 no-underline hover:text-primary-07"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href={routes.web.privacy}
                        className="text-primary-06 no-underline hover:text-primary-07"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.acceptedTerms ? (
                    <p className="zion-field-error ml-7">
                      {errors.acceptedTerms}
                    </p>
                  ) : null}

                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={values.marketingOptIn}
                      onChange={(event) =>
                        updateValue("marketingOptIn", event.target.checked)
                      }
                      className="mt-[3px] h-4 w-4 shrink-0 accent-primary-06"
                    />
                    <span className="font-sans text-sm font-normal leading-[22px] text-text-body-light">
                      Send me Zionra news, shipping tips and exclusive offers
                    </span>
                  </label>
                </div>

                {errors.form ? (
                  <p className="zion-field-error mt-5 text-center">
                    {errors.form}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="zion-btn zion-btn-md zion-btn-blue mt-8 w-full min-w-0"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner />
                      <span className="sr-only">Completing your account</span>
                    </>
                  ) : (
                    "Complete Account"
                  )}
                </button>
              </form>

              <p className="mt-5 text-center font-sans text-xs font-normal leading-[18px] text-primary-04">
                Your Google email is already verified. Your account will be
                ready after this step.
              </p>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
