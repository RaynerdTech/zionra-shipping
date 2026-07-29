/**
 * Responsibility:
 * Renders and submits the responsive Zionra shipping-partner registration flow.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import type { CountryCode } from "libphonenumber-js";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import CountrySelect from "../ui/CountrySelect";
import LoadingSpinner from "../ui/LoadingSpinner";
import AuthBackArrowIcon from "./shared/AuthBackArrowIcon";
import AuthPasswordField from "./shared/AuthPasswordField";
import GoogleAuthButton from "./shared/GoogleAuthButton";

const REFERRAL_OPTIONS = [
  "Search Engine",
  "Social Media",
  "Friend or Colleague",
  "Online Ad",
  "Email Campaign",
  "Event or Conference",
] as const;

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  countryOfResidence: string;
  referralSource: string;
  acceptedTerms: boolean;
  marketingOptIn: boolean;
};

type FormErrors = Partial<Record<keyof FormValues | "form", string>>;

type ApiResponse = {
  message?: string;
  errors?: Record<string, string>;
  redirectTo?: string;
};

const INITIAL_VALUES: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneCountryCode: "+44",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  countryOfResidence: "United Kingdom",
  referralSource: "",
  acceptedTerms: false,
  marketingOptIn: false,
};

const SECTION_LABEL_CLASS_NAME =
  "relative flex h-6 items-center rounded-md bg-primary-01 pl-4 font-sans text-xs font-normal text-primary-06 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-md before:bg-primary-06";
const FIELD_LABEL_CLASS_NAME =
  "mb-2 block font-sans text-sm font-normal leading-[22px] text-neutral-10";
const INPUT_CLASS_NAME = "zion-input h-[52px] min-w-0 md:h-12";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none">
      <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SelectChevronIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M4.083 5.833 7 8.75l2.917-2.917" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className={SECTION_LABEL_CLASS_NAME}>
      {children}
    </div>
  );
}

function FieldLabel({ children, required = false }: { children: ReactNode; required?: boolean }) {
  return (
    <span className={FIELD_LABEL_CLASS_NAME}>
      {children}{required ? <span className="text-error"> *</span> : null}
    </span>
  );
}

function PromoItem({ title, body, accent }: { title: string; body: string; accent: "blue" | "orange" | "teal" | "slate" }) {
  const styles = {
    blue: "border-primary-06 before:bg-primary-06",
    orange: "border-secondary-06 before:bg-secondary-06",
    teal: "border-tertiary-06 before:bg-tertiary-06",
    slate: "border-neutral-06 before:bg-neutral-06",
  }[accent];

  return (
    <div className={`relative min-h-[88px] w-full rounded-[12px] border bg-transparent py-3 pl-8 pr-4 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-[4px] before:rounded-full 2xl:min-h-[98px] 2xl:py-[14px] 2xl:pl-[34px] 2xl:pr-[18px] 2xl:before:bottom-[18px] 2xl:before:left-[17px] 2xl:before:top-[18px] ${styles}`}>
      <p className="m-0 font-display text-sm font-semibold leading-5 text-white">{title}</p>
      <p className="mt-2 font-sans text-sm font-normal leading-5 text-neutral-03">{body}</p>
    </div>
  );
}

function DecorativeCircle({ className }: { className: string }) {
  return <span aria-hidden="true" className={`pointer-events-none absolute rounded-full ${className}`} />;
}

export default function PartnerCreateAccountForm() {
  const router = useRouter();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>("GB");
  const [residenceCountry, setResidenceCountry] = useState<CountryCode>("GB");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const referralDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function resetLoadingState() {
      setIsSubmitting(false);
      setIsStartingGoogle(false);
    }
    window.addEventListener("pageshow", resetLoadingState);
    return () => window.removeEventListener("pageshow", resetLoadingState);
  }, []);

  useEffect(() => {
    function closeReferralDropdown(event: MouseEvent) {
      if (!referralDropdownRef.current?.contains(event.target as Node)) {
        setIsReferralOpen(false);
      }
    }

    function closeReferralDropdownWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsReferralOpen(false);
    }

    document.addEventListener("mousedown", closeReferralDropdown);
    document.addEventListener("keydown", closeReferralDropdownWithEscape);

    return () => {
      document.removeEventListener("mousedown", closeReferralDropdown);
      document.removeEventListener("keydown", closeReferralDropdownWithEscape);
    };
  }, []);

  function updateValue(field: keyof FormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field] && !current.form) return current;
      const next = { ...current };
      delete next[field];
      delete next.form;
      return next;
    });
  }

  function validateForm() {
    const next: FormErrors = {};
    const required = "This field can't be left empty.";
    const phone = values.phoneNumber.replace(/\D/g, "");

    if (!values.firstName.trim()) next.firstName = required;
    if (!values.lastName.trim()) next.lastName = required;
    if (!values.email.trim()) next.email = required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (!values.phoneNumber.trim()) next.phoneNumber = required;
    else if (phone.length < 7) next.phoneNumber = "Enter a valid phone number.";
    if (!values.password) next.password = required;
    else if (values.password.length < 8) next.password = "Password must be at least 8 characters.";
    if (!values.confirmPassword) next.confirmPassword = required;
    else if (values.password !== values.confirmPassword) next.confirmPassword = "Passwords do not match.";
    if (!values.countryOfResidence) next.countryOfResidence = required;
    if (!values.acceptedTerms) next.acceptedTerms = "You must agree to Zionra's Terms of Service and Privacy Policy.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(buildApiUrl(routes.api.partnerAuth.register), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim().toLowerCase(),
          phoneNumber: values.phoneNumber.replace(/\D/g, ""),
          referralSource: values.referralSource || null,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as ApiResponse;
      if (!response.ok) {
        setErrors({ ...(result.errors ?? {}), form: result.message ?? "Unable to create your partner account." } as FormErrors);
        return;
      }
      router.push(`${routes.web.partnerVerifyEmail}?email=${encodeURIComponent(values.email.trim().toLowerCase())}`);
    } catch (error) {
      console.error("Partner registration failed:", error);
      setErrors({ form: "Unable to reach the server. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleSignup() {
    if (isStartingGoogle || isSubmitting) return;
    setIsStartingGoogle(true);
    window.location.assign(buildApiUrl(routes.api.partnerAuth.google));
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-white xl:pl-[36%]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-primary-10 xl:fixed xl:inset-y-0 xl:left-0 xl:z-20 xl:flex xl:h-screen xl:w-[36%] xl:flex-col xl:px-10 xl:pb-6 xl:pt-10 2xl:px-[72px] 2xl:pb-8 2xl:pt-[56px]">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_center,rgba(40,107,220,0.28)_0_1px,transparent_1.5px)] [background-size:86px_104px]" />
        <DecorativeCircle className="-right-[60px] -top-[124px] h-[360px] w-[360px] bg-primary-06/[0.06]" />
        <DecorativeCircle className="right-[15px] -top-[40px] h-[200px] w-[200px] bg-primary-06/[0.09]" />
        <DecorativeCircle className="-bottom-[200px] -left-[55px] h-[360px] w-[360px] bg-primary-06/[0.06]" />
        <DecorativeCircle className="-bottom-[102px] left-[22px] h-[200px] w-[200px] bg-primary-06/[0.09]" />

        <div className="relative z-10 w-full max-w-[390px]">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo-zionra.png"
              alt=""
              width={28}
              height={28}
              priority
              className="h-7 w-7 object-contain"
            />
            <span className="font-display text-xl font-bold leading-7 text-white">
              zionra
            </span>
          </div>
          <h2 className="mt-4 font-display text-[32px] font-semibold leading-[40px] tracking-[-1px] text-white 2xl:mt-5 2xl:text-[40px] 2xl:leading-[52px] 2xl:tracking-[-1.5px]">Become A Verified Zionra Partner</h2>
          <div className="mt-4 h-[4px] w-[88px] rounded-full bg-secondary-06 2xl:mt-[18px]" />
          <p className="mt-3 font-sans text-[16px] font-normal leading-6 text-neutral-03 2xl:mt-[16px]  2xl:leading-7">Get started and access to a wide range of customers</p>
        </div>

        <div className="relative z-10 mt-12 w-full max-w-[390px] space-y-3 2xl:mt-10 2xl:space-y-[18px]">
          <PromoItem accent="blue" title="Verified Partner Status" body="Earn a Zionra badge that builds customer trust and sets you apart from unverified competitors." />
          <PromoItem accent="orange" title="Wide Range of Customers" body="Access a growing base of UK senders shipping to Nigeria — individuals, families, and businesses." />
          <PromoItem accent="teal" title="Steady Shipment Volume" body="Receive consistent bookings matched to your collection area and capacity. No slow seasons." />
          <PromoItem accent="slate" title="Fast, Reliable Payouts" body="Fulfil the order, get paid. Your payout lands directly in your business account, right on schedule." />
        </div>
      </aside>

      <section className="relative min-h-screen overflow-x-clip bg-white px-4 pb-6 pt-2 sm:px-6 md:px-10 xl:flex xl:min-w-0 xl:flex-col xl:items-center xl:px-14 xl:pb-6 xl:pt-10 2xl:px-[160px] 2xl:pt-[58px]">
        <DecorativeCircle className="-right-[76px] -top-[104px] h-[200px] w-[200px] bg-primary-06/[0.04]" />
        <DecorativeCircle className="-bottom-[72px] -left-[52px] hidden h-[180px] w-[180px] bg-secondary-06/[0.04] lg:block" />

        <div className="relative z-10 mx-auto w-full max-w-[620px] min-w-0">
          <Link href={routes.web.home} className="inline-flex min-h-9 items-center gap-2 rounded-md px-2 py-1 font-sans text-base font-normal leading-6 text-primary-06 no-underline transition-colors duration-[180ms] hover:bg-primary-01 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-03 2xl:ml-7">
            <AuthBackArrowIcon className="h-5 w-5 shrink-0" />
            <span className="xl:hidden">Back</span>
            <span className="hidden xl:inline">Back to home</span>
          </Link>

          <header className="mx-auto mt-[17px] text-center xl:mt-5">
            <h1 className="mx-auto max-w-[280px] font-display text-[20px] font-semibold leading-[34px] tracking-[-0.5px] text-primary-10 sm:max-w-none text-[24px] mb-[6px]">Become a Zionra Shipping Partner</h1>
            <p className="mx-auto mt-[2px] max-w-[200px] font-sans text-[16px] font-normal leading-[26px] text-text-body-light sm:max-w-none xl:mt-1">
  Get started and access to a wide range of customers
</p>
            <div className="mx-auto mt-[10px] h-[2px] w-full max-w-[572px] bg-primary-06 xl:mt-[13px] xl:h-[6px] xl:rounded-full" />
          </header>

          <div className="mt-5 w-full md:mt-4">
            <GoogleAuthButton onClick={handleGoogleSignup} disabled={isStartingGoogle || isSubmitting} loading={isStartingGoogle} label="Sign up with Google" className="zion-btn zion-btn-md zion-btn-outline-blue w-full min-w-0" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-5 md:mt-6">
            <SectionLabel>Personal Details</SectionLabel>

            <div className="mt-4 grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-6 md:gap-y-4">
              <label htmlFor="partnerFirstName">
                <FieldLabel required>First Name</FieldLabel>
                <input id="partnerFirstName" name="firstName" value={values.firstName} onChange={(event) => updateValue("firstName", event.target.value)} placeholder="e.g Jane" autoComplete="given-name" className={INPUT_CLASS_NAME} aria-invalid={Boolean(errors.firstName)} />
                {errors.firstName ? <p className="zion-field-error mt-1">{errors.firstName}</p> : null}
              </label>

              <label htmlFor="partnerLastName">
                <FieldLabel required>Last Name</FieldLabel>
                <input id="partnerLastName" name="lastName" value={values.lastName} onChange={(event) => updateValue("lastName", event.target.value)} placeholder="e.g. Okonkwo" autoComplete="family-name" className={INPUT_CLASS_NAME} aria-invalid={Boolean(errors.lastName)} />
                {errors.lastName ? <p className="zion-field-error mt-1">{errors.lastName}</p> : null}
              </label>

              <label htmlFor="partnerEmail">
                <FieldLabel required>Email Address</FieldLabel>
                <input id="partnerEmail" name="email" type="email" value={values.email} onChange={(event) => updateValue("email", event.target.value)} placeholder="You@example.com" autoComplete="email" className={INPUT_CLASS_NAME} aria-invalid={Boolean(errors.email)} />
                {errors.email ? <p className="zion-field-error mt-1">{errors.email}</p> : null}
              </label>

              <div>
                <FieldLabel required>Mobile Number</FieldLabel>
                <div className="grid grid-cols-[116px_minmax(0,1fr)] gap-3">
                  <CountrySelect id="partnerPhoneCountry" value={phoneCountry} compact ariaLabel="Phone country code" onChange={(country) => { setPhoneCountry(country.code); updateValue("phoneCountryCode", country.callingCode); }} />
                  <input id="partnerPhoneNumber" name="phoneNumber" type="tel" value={values.phoneNumber} onChange={(event) => updateValue("phoneNumber", event.target.value)} placeholder="0000 0000 00" autoComplete="tel-national" className={INPUT_CLASS_NAME} aria-invalid={Boolean(errors.phoneNumber)} />
                </div>
                {errors.phoneNumber ? <p className="zion-field-error mt-1">{errors.phoneNumber}</p> : null}
              </div>

              <AuthPasswordField id="partnerPassword" label="Password" value={values.password} placeholder="Min. 8 characters" visible={showPassword} error={errors.password} autoComplete="new-password" onToggle={() => setShowPassword((current) => !current)} onChange={(value) => updateValue("password", value)} />

              <AuthPasswordField id="partnerConfirmPassword" label="Confirm Password" value={values.confirmPassword} placeholder="Re-enter password" visible={showConfirmPassword} error={errors.confirmPassword} autoComplete="new-password" onToggle={() => setShowConfirmPassword((current) => !current)} onChange={(value) => updateValue("confirmPassword", value)} />
            </div>

            <div className="mt-5"><SectionLabel>Your Location</SectionLabel></div>

            <div className="mt-4 grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-6 md:gap-y-4">
              <div>
                <FieldLabel required>Country of Residence</FieldLabel>
                <CountrySelect id="partnerResidence" value={residenceCountry} error={Boolean(errors.countryOfResidence)} ariaLabel="Country of residence" onChange={(country) => { setResidenceCountry(country.code); updateValue("countryOfResidence", country.name); }} />
                {errors.countryOfResidence ? <p className="zion-field-error mt-1">{errors.countryOfResidence}</p> : null}
              </div>

              <div ref={referralDropdownRef}>
                <FieldLabel>How did you hear about us?</FieldLabel>
                <div className="relative">
                  <input type="hidden" name="referralSource" value={values.referralSource} />
                  <button
                    id="partnerReferral"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isReferralOpen}
                    aria-controls="partnerReferralOptions"
                    onClick={() => setIsReferralOpen((current) => !current)}
                    className={`zion-input flex h-[52px] w-full min-w-0 items-center justify-between gap-3 text-left md:h-12 ${
                      values.referralSource ? "text-neutral-10" : "text-neutral-05"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {values.referralSource || "Select an option"}
                    </span>
                    <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-01 text-primary-08 transition-transform duration-200 ${isReferralOpen ? "rotate-180" : ""}`}>
                      <SelectChevronIcon />
                    </span>
                  </button>

                  {isReferralOpen ? (
                    <div
                      id="partnerReferralOptions"
                      role="listbox"
                      aria-labelledby="partnerReferral"
                      className="mt-2 w-full min-w-0 overflow-hidden rounded-lg border border-neutral-03 bg-white shadow-[0_10px_30px_rgba(7,22,44,0.14)] md:absolute md:left-0 md:right-0 md:top-full md:z-50"
                    >
                      {REFERRAL_OPTIONS.map((option) => {
                        const selected = values.referralSource === option;

                        return (
                          <button
                            key={option}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => {
                              updateValue("referralSource", option);
                              setIsReferralOpen(false);
                            }}
                            className={`flex w-full min-w-0 items-center justify-between gap-3 px-3 py-2.5 text-left font-sans text-sm leading-[22px] transition-colors ${
                              selected
                                ? "bg-primary-06 text-white"
                                : "text-neutral-10 hover:bg-primary-01"
                            }`}
                          >
                            <span className="block min-w-0 break-words">{option}</span>
                            {selected ? <span className="shrink-0 text-white">✓</span> : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3 md:mt-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={values.acceptedTerms} onChange={(event) => updateValue("acceptedTerms", event.target.checked)} className="mt-[3px] h-4 w-4 shrink-0 accent-primary-06" />
                <span className="font-sans text-sm font-normal leading-[22px] text-neutral-10">
                  I agree to Zionra&apos;s <Link href={routes.web.terms} className="text-primary-06">Terms of Service</Link> and <Link href={routes.web.privacy} className="text-primary-06">Privacy Policy</Link>
                </span>
              </label>
              {errors.acceptedTerms ? <p className="zion-field-error ml-7">{errors.acceptedTerms}</p> : null}

              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={values.marketingOptIn} onChange={(event) => updateValue("marketingOptIn", event.target.checked)} className="mt-[3px] h-4 w-4 shrink-0 accent-primary-06" />
                <span className="font-sans text-sm font-normal leading-[22px] text-text-body-light">Send me Zionra news, shipping tips and exclusive offers</span>
              </label>
            </div>

            {errors.form ? <p className="zion-field-error mt-3 text-center">{errors.form}</p> : null}

            <div className="mt-8 flex justify-end md:mt-7">
              <button type="submit" disabled={isSubmitting || isStartingGoogle} className="zion-btn zion-btn-md zion-btn-blue w-full min-w-0 sm:w-auto sm:min-w-[180px] xl:min-w-[126px]">
                {isSubmitting ? <LoadingSpinner /> : <><span className="xl:hidden">Start Application</span><span className="hidden xl:inline">Next</span></>}
              </button>
            </div>
          </form>

          <div className="mt-7 h-px w-full bg-neutral-02" />

          <div className="mt-6 space-y-3 font-sans text-sm font-normal leading-[22px]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-body-light">Already have a partner account?</span>
              <Link href={routes.web.partnerLogin} className="inline-flex shrink-0 items-center gap-2 text-primary-06 no-underline hover:text-primary-07">Sign in <ArrowIcon /></Link>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-body-light">Are you a customer?</span>
              <Link href={routes.web.customerLogin} className="inline-flex shrink-0 items-center gap-2 text-secondary-06 no-underline hover:text-secondary-07">Login <ArrowIcon /></Link>
            </div>
          </div>

          <div className="mb-12 mt-7 rounded-xl border border-primary-02 bg-primary-01 px-4 py-3 text-center font-sans text-xs font-normal leading-[18px] text-primary-04 md:mb-6">Your data is encrypted and protected with industry-standard security. We never share your details.</div>
        </div>
      </section>
    </main>
  );
}