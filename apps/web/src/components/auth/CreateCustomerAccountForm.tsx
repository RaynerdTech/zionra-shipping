/**
 * Responsibility:
 * Renders and submits the responsive Zionra customer registration experience.
 * It handles client validation, password visibility, Google signup, loading
 * states, and the desktop promotional panel.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
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

function ForwardArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M4 10H16M11 5L16 10L11 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

type ReferralSourceSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

function ReferralSourceSelect({
  value,
  onChange,
}: ReferralSourceSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function selectOption(option: string) {
    onChange(option);
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        ref={triggerRef}
        id="referralSource"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="referralSourceOptions"
        onClick={() => setIsOpen((current) => !current)}
        className={`zion-input flex h-[52px] w-full min-w-0 items-center justify-between gap-3 text-left md:h-12 ${
          value ? "text-neutral-10" : "text-neutral-05"
        }`}
      >
        <span className="min-w-0 flex-1 truncate">
          {value || "Select an option"}
        </span>

        <span
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-01 text-primary-08 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronIcon />
        </span>
      </button>

      {isOpen ? (
        <div
          id="referralSourceOptions"
          role="listbox"
          aria-label="How did you hear about us?"
          className="mt-2 w-full min-w-0 overflow-hidden rounded-lg border border-neutral-03 bg-white shadow-[0_10px_30px_rgba(7,22,44,0.14)] md:absolute md:left-0 md:right-0 md:top-full md:z-50"
        >
          <div className="max-h-56 overflow-y-auto overflow-x-hidden py-1">
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => selectOption("")}
              className={`block w-full min-w-0 px-3 py-2.5 text-left font-sans text-sm leading-[22px] transition-colors ${
                !value
                  ? "bg-primary-06 text-white"
                  : "text-neutral-10 hover:bg-primary-01"
              }`}
            >
              <span className="block break-words">Select an option</span>
            </button>

            {REFERRAL_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => selectOption(option)}
                className={`block w-full min-w-0 px-3 py-2.5 text-left font-sans text-sm leading-[22px] transition-colors ${
                  value === option
                    ? "bg-primary-06 text-white"
                    : "text-neutral-10 hover:bg-primary-01"
                }`}
              >
                <span className="block break-words">{option}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CheckBadgeIcon() {
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[40px] bg-tertiary-09 p-2">
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="h-3 w-3 shrink-0"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.7877 1.78641C9.12375 1.41675 9.7006 1.40302 10.0538 1.75628L11.0795 2.78194C11.4212 3.12365 11.4212 3.67767 11.0795 4.01938L5.0366 10.0623C4.6949 10.404 4.14088 10.404 3.79917 10.0623L1.25628 7.51939C0.914574 7.17769 0.914574 6.62364 1.25628 6.28194L2.04917 5.48904C2.39088 5.14734 2.9449 5.14734 3.28661 5.48904L4.40496 6.60739L8.7877 1.78641Z"
          fill="white"
        />
      </svg>
    </span>
  );
}

type FieldLabelProps = {
  children: ReactNode;
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
  children: ReactNode;
};

function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div className="relative flex h-6 items-center rounded-md bg-primary-01 pl-4 font-sans text-xs font-normal text-primary-06 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-md before:bg-primary-06">
      {children}
    </div>
  );
}

type TextFieldProps = {
  id: "firstName" | "lastName" | "email";
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  type?: "text" | "email";
  onChange: (field: keyof FormValues, value: string) => void;
};

function TextField({
  id,
  label,
  value,
  placeholder,
  error,
  type = "text",
  onChange,
}: TextFieldProps) {
  return (
    <label htmlFor={id}>
      <FieldLabel required>{label}</FieldLabel>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={
          id === "firstName"
            ? "given-name"
            : id === "lastName"
              ? "family-name"
              : "email"
        }
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(id, event.target.value)}
        className="zion-input h-[52px] md:h-12"
      />
      {error ? <p className="zion-field-error mt-1">{error}</p> : null}
    </label>
  );
}

function PromotionalPanel() {
  const bulletItems = [
    "Free account setup",
    "Compare verified agents instantly",
    "Real-time shipment tracking included",
    "Secure payments & shipment visibility",
  ];

  const avatarSources = [
    "/images/man-smiling.svg",
    "/images/woman.svg",
    "/images/Ellipse.svg",
  ];

  return (
    <aside
      className="relative hidden h-screen min-h-0 overflow-hidden bg-primary-10 px-10 pt-16 text-white lg:block xl:px-[84px] xl:pt-[84px]"
      style={{
        backgroundImage:
          "radial-gradient(circle at center, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: "42px 42px",
      }}
    >
      <div className="pointer-events-none absolute left-[72px] top-[120px] h-[360px] w-[360px] rounded-full bg-[rgba(40,107,220,0.06)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2"
        >
          <circle
            cx="100"
            cy="100"
            r="100"
            fill="#286BDC"
            fillOpacity="0.09"
          />
        </svg>
      </div>

      <div className="relative z-[1]">
        <div className="mb-6 flex items-center gap-2">
          <Image
            src="/images/logo-zionra.png"
            alt=""
            width={27}
            height={27}
            className="h-[27px] w-[27px] object-contain"
            priority
          />
          <span className="font-display text-[22px] font-bold tracking-[-0.5px] text-white">
            zionra
          </span>
        </div>

        <h2 className="max-w-[330px] font-display text-[40px] font-bold leading-[48px] tracking-[-1px] text-white">
          Ship Smarter
          <br />
          with Confidence
        </h2>

        <p className="mt-4 font-sans text-base font-normal leading-6 text-neutral-02">
          Compare verified shipping partners instantly.
        </p>
        <div className="mt-2 h-1 w-20 rounded-full bg-secondary-06" />

        <ul className="mt-8 space-y-5">
          {bulletItems.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 font-sans text-base font-normal leading-6 text-neutral-01"
            >
              <CheckBadgeIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-9 flex w-[300px] items-center rounded-xl border border-primary-07 bg-primary-09/80 px-4 py-3">
          <div className="flex -space-x-2">
            {avatarSources.map((src, index) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-full border-2 border-primary-09 object-cover"
                style={{ zIndex: 3 - index }}
              />
            ))}
          </div>

          <div className="ml-3">
            <div className="font-display text-sm font-bold leading-normal text-secondary-06">
              ★★★★★
            </div>
            <p className="mt-1 font-sans text-xs font-normal text-neutral-03">
              Verified Shipping Platform
            </p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-[95px] -left-[85px] h-[360px] w-[360px] rounded-full bg-[rgba(40,107,220,0.06)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2"
        >
          <circle
            cx="100"
            cy="100"
            r="100"
            fill="#286BDC"
            fillOpacity="0.09"
          />
        </svg>
      </div>
    </aside>
  );
}

export default function CreateCustomerAccountForm() {
  const router = useRouter();

  useEffect(() => {
  function resetGoogleLoadingState() {
    setIsStartingGoogle(false);
  }

  window.addEventListener("pageshow", resetGoogleLoadingState);

  return () => {
    window.removeEventListener("pageshow", resetGoogleLoadingState);
  };
}, []);

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>("GB");
  const [residenceCountry, setResidenceCountry] =
    useState<CountryCode>("GB");

  function updateValue(field: keyof FormValues, value: string | boolean) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function validateForm() {
    const nextErrors: FormErrors = {};
    const requiredMessage = "This field can't be left empty.";

    if (!values.firstName.trim()) nextErrors.firstName = requiredMessage;
    if (!values.lastName.trim()) nextErrors.lastName = requiredMessage;

    if (!values.email.trim()) {
      nextErrors.email = requiredMessage;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!values.phoneNumber.trim()) {
      nextErrors.phoneNumber = requiredMessage;
    } else if (values.phoneNumber.replace(/\D/g, "").length < 7) {
      nextErrors.phoneNumber = "Enter a valid phone number.";
    }

    if (!values.password) {
      nextErrors.password = requiredMessage;
    } else if (values.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = requiredMessage;
    } else if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(
        buildApiUrl(routes.api.customerAuth.register),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim().toLowerCase(),
            phoneNumber: values.phoneNumber.replace(/\D/g, ""),
            referralSource: values.referralSource || null,
          }),
        },
      );

      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok) {
        setErrors({
          ...(result.errors ?? {}),
          form: result.message ?? "Unable to create your account.",
        } as FormErrors);
        return;
      }

      const normalizedEmail = values.email.trim().toLowerCase();

      router.push(
        `${routes.web.customerVerifyEmail}?email=${encodeURIComponent(normalizedEmail)}`,
      );
    } catch (error) {
      console.error("Customer registration failed:", error);
      setErrors({
        form: "Unable to reach the server. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleSignup() {
    if (isStartingGoogle || isSubmitting) {
      return;
    }

    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors.form;
      return nextErrors;
    });
    setIsStartingGoogle(true);

    try {
     window.location.assign(buildApiUrl(routes.api.customerAuth.google));
    } catch (error) {
      console.error("Google signup could not start:", error);
      setIsStartingGoogle(false);
      setErrors((current) => ({
        ...current,
        form: "Unable to start Google sign in. Please try again.",
      }));
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-01 pt-3 lg:grid lg:h-screen lg:min-h-0 lg:grid-cols-[36%_64%] lg:pt-0">
      <PromotionalPanel />

      <section className="relative min-h-[calc(100vh-12px)] overflow-hidden rounded-t-[24px] bg-white px-6 pb-7 pt-5 shadow-[0_4px_4px_rgba(0,0,0,0.25)] lg:h-screen lg:min-h-0 lg:overflow-x-hidden lg:overflow-y-auto lg:rounded-none lg:px-12 lg:pb-10 lg:pt-8 lg:shadow-none">
        <AuthDecorativeCircles className="pointer-events-none absolute right-[-6px] top-[-34px] z-10 h-[136px] w-[136px] md:h-[240px] md:w-[240px] lg:fixed lg:right-0 lg:-top-[56px]" />

        <div className="relative z-[1] mx-auto w-full max-w-[424px] md:max-w-[628px]">
          <Link
            href={routes.web.getStarted}
            className="inline-flex min-h-9 items-center gap-2 rounded-md px-2 py-1 font-sans text-base font-normal leading-6 text-primary-06 no-underline transition-colors duration-[180ms] hover:bg-primary-01 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-03"
          >
            <AuthBackArrowIcon />
            <span className="lg:hidden">Back</span>
            <span className="hidden lg:inline">Back to home</span>
          </Link>

          <header className="mt-6 text-center md:mt-2">
            <h1 className="font-display text-[28px] font-semibold leading-[38px] tracking-[-0.7px] text-neutral-10 md:text-2xl md:leading-[34px] md:tracking-[-0.5px]">
              Create your account
            </h1>
            <p className="mx-auto mt-1 max-w-[360px] font-sans text-sm font-normal leading-[22px] text-text-body-light md:max-w-none md:text-base md:leading-[26px]">
              Join thousands of UK senders shipping smarter with Zionra
            </p>
            <div className="mx-auto mt-4 h-px w-full bg-primary-06 md:h-1 md:max-w-[520px] md:rounded-full" />
          </header>

          <GoogleAuthButton
            onClick={handleGoogleSignup}
            disabled={isStartingGoogle || isSubmitting}
            loading={isStartingGoogle}
            className="zion-btn zion-btn-md zion-btn-outline-blue mt-5 w-full min-w-0 md:mt-4"
          />

          <form onSubmit={handleSubmit} noValidate className="mt-5 md:mt-6">
            <SectionLabel>Personal Details</SectionLabel>

            <div className="mt-4 grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-6 md:gap-y-4">
              <TextField
                id="firstName"
                label="First Name"
                value={values.firstName}
                placeholder="e.g Jane"
                error={errors.firstName}
                onChange={updateValue}
              />

              <TextField
                id="lastName"
                label="Last Name"
                value={values.lastName}
                placeholder="e.g. Okonkwo"
                error={errors.lastName}
                onChange={updateValue}
              />

              <TextField
                id="email"
                label="Email Address"
                value={values.email}
                placeholder="You@example.com"
                error={errors.email}
                type="email"
                onChange={updateValue}
              />

              <div>
                <FieldLabel required>Mobile Number</FieldLabel>
                <div className="grid grid-cols-[116px_minmax(0,1fr)] gap-3">
                  <CountrySelect
                    id="phoneCountryCode"
                    value={phoneCountry}
                    compact
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
                {errors.phoneNumber ? (
                  <p className="zion-field-error mt-1">{errors.phoneNumber}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-5">
              <SectionLabel>Account Security</SectionLabel>
            </div>

            <div className="mt-4 grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-6 md:gap-y-4">
              <AuthPasswordField
                id="password"
                label="Password"
                value={values.password}
                placeholder="Min. 8 characters"
                visible={showPassword}
                error={errors.password}
                autoComplete="new-password"
                onToggle={() => setShowPassword((current) => !current)}
                onChange={(value) => updateValue("password", value)}
              />

              <AuthPasswordField
                id="confirmPassword"
                label="Confirm Password"
                value={values.confirmPassword}
                placeholder="Re-enter password"
                visible={showConfirmPassword}
                error={errors.confirmPassword}
                autoComplete="new-password"
                onToggle={() =>
                  setShowConfirmPassword((current) => !current)
                }
                onChange={(value) => updateValue("confirmPassword", value)}
              />
            </div>

            <div className="mt-5">
              <SectionLabel>Your Location</SectionLabel>
            </div>

            <div className="mt-4 grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-6 md:gap-y-4">
              <div>
                <FieldLabel required>Country of Residence</FieldLabel>
                <CountrySelect
                  id="countryOfResidence"
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

              <div className="min-w-0">
                <FieldLabel>How did you hear about us?</FieldLabel>
                <ReferralSourceSelect
                  value={values.referralSource}
                  onChange={(value) => updateValue("referralSource", value)}
                />
              </div>
            </div>

            <div className="mt-5 space-y-3 md:mt-4">
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
              <p className="zion-field-error mt-4 text-center">{errors.form}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || isStartingGoogle}
              className="zion-btn zion-btn-md zion-btn-blue mt-8 w-full min-w-0 md:mt-7"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  <span className="sr-only">Creating your account</span>
                </>
              ) : (
                "Create your Account"
              )}
            </button>
          </form>

          <div className="mt-7 h-px w-full bg-neutral-02" />

          <div className="mt-6 space-y-3 font-sans text-sm font-normal leading-[22px]">
            <div className="flex items-center justify-between">
              <span className="text-text-body-light">
                Already have an account?
              </span>
              <Link
                href={routes.web.customerLogin}
                className="inline-flex items-center gap-2 text-primary-06 no-underline hover:text-primary-07"
              >
                Login
                <ForwardArrowIcon />
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-body-light">
                Are you a shipping partner?
              </span>
              <Link
                href={routes.web.partnerApplication}
                className="inline-flex items-center gap-2 text-secondary-06 no-underline hover:text-secondary-07"
              >
                Become a shipping partner
                <ForwardArrowIcon />
              </Link>
            </div>
          </div>

          <div className="mt-7 rounded-xl border border-primary-02 bg-primary-01 px-4 py-3 text-center font-sans text-xs font-normal leading-[18px] text-primary-04">
            <span className="md:hidden">
              Your data is protected with industry-standard security.
            </span>
            <span className="hidden md:inline">
              Your data is encrypted and protected with industry-standard
              security. We never share your details.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}