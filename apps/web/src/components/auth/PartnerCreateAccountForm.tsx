/**
 * Responsibility:
 * Renders and submits the responsive Zionra shipping-partner registration flow.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import type { CountryCode } from "libphonenumber-js";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import CountrySelect from "../ui/CountrySelect";
import LoadingSpinner from "../ui/LoadingSpinner";
import AuthBackArrowIcon from "./shared/AuthBackArrowIcon";
import AuthDecorativeCircles from "./shared/AuthDecorativeCircles";
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

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none">
      <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-6 items-center rounded-md bg-primary-01 pl-4 font-sans text-xs text-primary-06 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-md before:bg-primary-06">
      {children}
    </div>
  );
}

function FieldLabel({ children, required = false }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="mb-2 block font-sans text-sm leading-[22px] text-neutral-10">
      {children}{required ? <span className="text-error"> *</span> : null}
    </span>
  );
}

function PromoItem({ title, body, accent }: { title: string; body: string; accent: "blue" | "orange" | "teal" | "slate" }) {
  const accentClass = {
    blue: "border-primary-06 before:bg-primary-06",
    orange: "border-secondary-06 before:bg-secondary-06",
    teal: "border-tertiary-06 before:bg-tertiary-06",
    slate: "border-neutral-06 before:bg-neutral-06",
  }[accent];

  return (
    <div className={`relative rounded-xl border bg-primary-10 px-6 py-4 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-[3px] before:rounded-full ${accentClass}`}>
      <p className="font-display text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 font-sans text-xs leading-[18px] text-neutral-03">{body}</p>
    </div>
  );
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

  useEffect(() => {
    function resetLoadingState() {
      setIsSubmitting(false);
      setIsStartingGoogle(false);
    }
    window.addEventListener("pageshow", resetLoadingState);
    return () => window.removeEventListener("pageshow", resetLoadingState);
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
        setErrors({
          ...(result.errors ?? {}),
          form: result.message ?? "Unable to create your partner account.",
        } as FormErrors);
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
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[408px_minmax(0,1fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-primary-10 px-[66px] py-24 lg:flex lg:flex-col">
        <AuthDecorativeCircles className="pointer-events-none absolute -right-24 -top-20 h-[340px] w-[340px] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Image src="/images/logo-zionra.png" alt="" width={26} height={26} className="h-[26px] w-[26px] object-contain" />
            <span className="font-display text-xl font-bold text-white">zionra</span>
          </div>
          <h2 className="mt-8 max-w-[290px] font-display text-[34px] font-semibold leading-[42px] tracking-[-1px] text-white">
            Become A Verified Zionra Partner
          </h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-secondary-06" />
          <p className="mt-5 font-sans text-sm leading-6 text-neutral-03">
            Compare verified shipping partners instantly
          </p>
        </div>

        <div className="relative z-10 mt-14 space-y-[18px]">
          <PromoItem accent="blue" title="Verified Partner Status" body="Earn a Zionra badge that builds customer trust and sets you apart from unverified competitors." />
          <PromoItem accent="orange" title="Wide Range of Customers" body="Access a growing base of UK senders shipping to Nigeria — individuals, families, and businesses." />
          <PromoItem accent="teal" title="Steady Shipment Volume" body="Receive consistent bookings matched to your collection area and capacity. No slow seasons." />
          <PromoItem accent="slate" title="Fast, Reliable Payouts" body="Fulfil the order, get paid. Your payout lands directly in your business account, right on schedule." />
        </div>
      </aside>

      <section className="relative min-h-screen overflow-hidden bg-white px-4 pb-8 pt-4 sm:px-6 lg:px-12 lg:pb-10 lg:pt-7">
        <AuthDecorativeCircles className="pointer-events-none absolute -right-12 -top-20 h-[220px] w-[220px] opacity-50" />
        <div className="relative z-10 mx-auto w-full max-w-[780px]">
          <Link href={routes.web.home} className="inline-flex items-center gap-2 rounded-md px-1 py-2 font-sans text-sm text-primary-06 no-underline hover:text-primary-07">
            <AuthBackArrowIcon className="h-5 w-5" />
            <span className="lg:inline">Back to home</span>
          </Link>

          <header className="mx-auto mt-4 max-w-[640px] text-center lg:mt-0">
            <h1 className="font-display text-2xl font-semibold leading-[34px] tracking-[-0.5px] text-primary-10 lg:text-[28px] lg:leading-[38px]">
              Become a Zionra Shipping Partner
            </h1>
            <p className="mt-1 font-sans text-sm leading-[22px] text-text-body-light lg:text-base">
              Get started and access to a wide range of customers
            </p>
            <div className="mx-auto mt-3 h-1 w-full rounded-full bg-primary-06" />
          </header>

          <GoogleAuthButton
            onClick={handleGoogleSignup}
            disabled={isStartingGoogle || isSubmitting}
            loading={isStartingGoogle}
            label="Continue with Google"
            className="zion-btn zion-btn-md zion-btn-outline-blue mx-auto mt-5 w-full min-w-0 lg:max-w-[494px]"
          />

          <div className="mx-auto my-4 flex max-w-[494px] items-center gap-3 text-xs text-neutral-05 before:h-px before:flex-1 before:bg-neutral-02 after:h-px after:flex-1 after:bg-neutral-02">
            or continue with email
          </div>

          <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-[640px]">
            <SectionLabel>Personal Details</SectionLabel>
            <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-4">
              <label htmlFor="partnerFirstName">
                <FieldLabel required>First Name</FieldLabel>
                <input id="partnerFirstName" value={values.firstName} onChange={(event) => updateValue("firstName", event.target.value)} placeholder="e.g Jane" autoComplete="given-name" className="zion-input h-[52px] lg:h-12" aria-invalid={Boolean(errors.firstName)} />
                {errors.firstName ? <p className="zion-field-error mt-1">{errors.firstName}</p> : null}
              </label>
              <label htmlFor="partnerLastName">
                <FieldLabel required>Last Name</FieldLabel>
                <input id="partnerLastName" value={values.lastName} onChange={(event) => updateValue("lastName", event.target.value)} placeholder="e.g. Okonkwo" autoComplete="family-name" className="zion-input h-[52px] lg:h-12" aria-invalid={Boolean(errors.lastName)} />
                {errors.lastName ? <p className="zion-field-error mt-1">{errors.lastName}</p> : null}
              </label>
              <label htmlFor="partnerEmail">
                <FieldLabel required>Email Address</FieldLabel>
                <input id="partnerEmail" type="email" value={values.email} onChange={(event) => updateValue("email", event.target.value)} placeholder="You@example.com" autoComplete="email" className="zion-input h-[52px] lg:h-12" aria-invalid={Boolean(errors.email)} />
                {errors.email ? <p className="zion-field-error mt-1">{errors.email}</p> : null}
              </label>
              <div>
                <FieldLabel required>Mobile Number</FieldLabel>
                <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-2">
                  <CountrySelect id="partnerPhoneCountry" value={phoneCountry} compact ariaLabel="Phone country code" onChange={(country) => { setPhoneCountry(country.code); updateValue("phoneCountryCode", country.callingCode); }} />
                  <input type="tel" value={values.phoneNumber} onChange={(event) => updateValue("phoneNumber", event.target.value)} placeholder="0000 0000 00" autoComplete="tel-national" className="zion-input h-[52px] lg:h-12" aria-invalid={Boolean(errors.phoneNumber)} />
                </div>
                {errors.phoneNumber ? <p className="zion-field-error mt-1">{errors.phoneNumber}</p> : null}
              </div>
              <AuthPasswordField id="partnerPassword" label="Password" value={values.password} placeholder="Min. 8 characters" visible={showPassword} error={errors.password} autoComplete="new-password" onToggle={() => setShowPassword((current) => !current)} onChange={(value) => updateValue("password", value)} />
              <AuthPasswordField id="partnerConfirmPassword" label="Confirm Password" value={values.confirmPassword} placeholder="Re-enter password" visible={showConfirmPassword} error={errors.confirmPassword} autoComplete="new-password" onToggle={() => setShowConfirmPassword((current) => !current)} onChange={(value) => updateValue("confirmPassword", value)} />
            </div>

            <div className="mt-5"><SectionLabel>Your Location</SectionLabel></div>
            <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-x-5">
              <div>
                <FieldLabel required>Country of Residence</FieldLabel>
                <CountrySelect id="partnerResidence" value={residenceCountry} error={Boolean(errors.countryOfResidence)} ariaLabel="Country of residence" onChange={(country) => { setResidenceCountry(country.code); updateValue("countryOfResidence", country.name); }} />
                {errors.countryOfResidence ? <p className="zion-field-error mt-1">{errors.countryOfResidence}</p> : null}
              </div>
              <label htmlFor="partnerReferral">
                <FieldLabel>How did you hear about us?</FieldLabel>
                <select id="partnerReferral" value={values.referralSource} onChange={(event) => updateValue("referralSource", event.target.value)} className="zion-input h-[52px] lg:h-12">
                  <option value="">Select an option</option>
                  {REFERRAL_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            </div>

            <div className="mt-5 space-y-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={values.acceptedTerms} onChange={(event) => updateValue("acceptedTerms", event.target.checked)} className="mt-1 h-4 w-4 accent-primary-06" />
                <span className="font-sans text-sm leading-[22px] text-neutral-10">I agree to Zionra&apos;s <Link href={routes.web.terms} className="text-primary-06">Terms of Service</Link> and <Link href={routes.web.privacy} className="text-primary-06">Privacy Policy</Link></span>
              </label>
              {errors.acceptedTerms ? <p className="zion-field-error ml-7">{errors.acceptedTerms}</p> : null}
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={values.marketingOptIn} onChange={(event) => updateValue("marketingOptIn", event.target.checked)} className="mt-1 h-4 w-4 accent-primary-06" />
                <span className="font-sans text-sm leading-[22px] text-text-body-light">Send me Zionra news, shipping tips and exclusive offers</span>
              </label>
            </div>

            {errors.form ? <p className="zion-field-error mt-4 text-center">{errors.form}</p> : null}

            <div className="mt-8 flex justify-end">
              <button type="submit" disabled={isSubmitting || isStartingGoogle} className="zion-btn zion-btn-md zion-btn-blue w-full min-w-0 lg:w-[116px]">
                {isSubmitting ? <LoadingSpinner /> : <><span className="lg:hidden">Start Application</span><span className="hidden lg:inline">Next</span></>}
              </button>
            </div>
          </form>

          <div className="mx-auto mt-5 h-px max-w-[520px] bg-neutral-02" />
          <div className="mx-auto mt-4 max-w-[420px] space-y-3 font-sans text-sm">
            <div className="flex items-center justify-between"><span className="text-text-body-light">Already have a partner account?</span><Link href={routes.web.partnerLogin} className="inline-flex items-center gap-2 text-primary-06 no-underline">Sign in <ArrowIcon /></Link></div>
            <div className="flex items-center justify-between"><span className="text-text-body-light">Are you a customer?</span><Link href={routes.web.customerLogin} className="inline-flex items-center gap-2 text-secondary-06 no-underline">Login <ArrowIcon /></Link></div>
          </div>
          <div className="mx-auto mt-5 max-w-[494px] rounded-lg border border-primary-02 bg-primary-01 px-4 py-3 text-center font-sans text-xs leading-[18px] text-primary-04">
            Your data is encrypted and protected with industry-standard security. We never share your details.
          </div>
        </div>
      </section>
    </main>
  );
}
