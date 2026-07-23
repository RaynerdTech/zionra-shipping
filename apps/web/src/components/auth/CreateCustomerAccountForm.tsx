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

function DecorativeCircles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-[-6px] top-[-34px] z-10 h-[136px] w-[136px] md:h-[240px] md:w-[240px] lg:fixed lg:right-0 lg:-top-[56px]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-[-20px] top-0 w-[136px] h-[136px] md:w-[240px] md:h-[240px]"
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
        className="absolute md:right-0 md:top-0 top-[-6px] right-[-6px] w-[95.2px] h-[95.2px] md:w-[150px] md:h-[150px]"
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

function BackArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M19 12H5M11 18L5 12L11 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleLogoIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.702-1.567 2.684-3.875 2.684-6.613Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.182l-2.91-2.258c-.805.54-1.835.86-3.046.86-2.344 0-4.328-1.585-5.037-3.715H.956v2.332A9 9 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.963 10.705A5.42 5.42 0 0 1 3.68 9c0-.592.102-1.168.283-1.705V4.963H.956A9 9 0 0 0 0 9c0 1.45.347 2.824.956 4.037l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.507.454 3.441 1.345l2.582-2.582C13.463.89 11.426 0 9 0A9 9 0 0 0 .956 4.963l3.007 2.332C4.672 5.165 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

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

function PasswordEyeIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.44021 9.14625L10.5224 11.2285C10.7177 11.4238 11.0342 11.4238 11.2295 11.2285C11.4247 11.0332 11.4247 10.7167 11.2295 10.5215L1.22946 0.521445C1.03419 0.326185 0.717687 0.326185 0.522422 0.521445C0.327161 0.71671 0.327161 1.03322 0.522422 1.22848L2.45183 3.15789C2.28212 3.29113 2.12537 3.42989 1.98096 3.57081C1.59315 3.94923 1.2943 4.3432 1.07223 4.68746C0.882362 4.98181 0.746592 5.24315 0.657677 5.4321C0.613222 5.52655 0.580242 5.6034 0.558067 5.6577C0.547002 5.68475 0.538542 5.7063 0.532677 5.72165C0.530657 5.72695 0.528972 5.7316 0.527572 5.73545L0.525842 5.7402L0.522912 5.7485C0.493827 5.83 0.493827 5.91945 0.522912 6.00095C0.534872 6.0325 0.524387 6.00685 0.524387 6.00685C0.524387 6.00685 0.527937 6.0159 0.541957 6.05125C0.553532 6.0807 0.570157 6.1227 0.592737 6.17475C0.637867 6.27885 0.706002 6.42495 0.799277 6.5991C0.985512 6.9467 1.27511 7.4104 1.6899 7.87495C2.52309 8.8081 3.86838 9.74995 5.87596 9.74995C6.61071 9.74995 7.25866 9.62345 7.82621 9.41605C8.04241 9.337 8.24701 9.24625 8.44021 9.14625ZM4.24452 4.95058C4.0896 5.22335 4.00094 5.53895 4.00094 5.87495C4.00094 6.9105 4.84041 7.74995 5.87596 7.74995C6.21196 7.74995 6.52756 7.6613 6.80031 7.5064L6.23531 6.9414L4.80951 5.51555L4.24452 4.95058Z"
        fill="#174184"
      />
      <path
        d="M10.0619 3.87549C9.22873 2.94233 7.88348 2 5.87588 2C5.68548 2 5.36258 2.02907 5.02968 2.08252C4.69933 2.13557 4.32237 2.2185 4.0365 2.33838C4.01209 2.34863 3.98909 2.36131 3.96777 2.3761L9.77588 8.1842C9.78698 8.17605 9.79768 8.16725 9.80798 8.1577C10.2596 7.7408 10.6127 7.2 10.849 6.7783C10.9686 6.5649 11.0613 6.3761 11.1244 6.24025C11.156 6.17225 11.1805 6.11725 11.1971 6.0786C11.2037 6.0633 11.2091 6.05045 11.2132 6.0404L11.2162 6.0332L11.2216 6.0205L11.2235 6.01515C11.2573 5.93115 11.2604 5.82775 11.2269 5.74365C11.2263 5.74175 11.2244 5.73585 11.2235 5.7334L11.22 5.72445L11.2162 5.71475L11.2098 5.69875C11.1983 5.66925 11.1816 5.62725 11.1591 5.5752C11.1139 5.47115 11.0458 5.325 10.9525 5.1509C10.7663 4.8033 10.4766 4.34 10.0619 3.87549Z"
        fill="#141B34"
      />
    </svg>
  );
}

function VisiblePasswordEyeIcon() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M.75 6s1.75-3.25 5.25-3.25S11.25 6 11.25 6 9.5 9.25 6 9.25.75 6 .75 6Z"
        stroke="#174184"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="6"
        cy="6"
        r="1.65"
        stroke="#174184"
        strokeWidth="1.15"
      />
    </svg>
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

type PasswordFieldProps = {
  id: "password" | "confirmPassword";
  label: string;
  value: string;
  placeholder: string;
  visible: boolean;
  error?: string;
  onToggle: () => void;
  onChange: (field: keyof FormValues, value: string) => void;
};

function PasswordField({
  id,
  label,
  value,
  placeholder,
  visible,
  error,
  onToggle,
  onChange,
}: PasswordFieldProps) {
  return (
    <label htmlFor={id}>
      <FieldLabel required>{label}</FieldLabel>
      <span
        className={`zion-input-shell h-[52px] md:h-12 ${
          error ? "zion-input-shell-error" : ""
        }`}
      >
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(id, event.target.value)}
          className="zion-input-shell-control"
        />
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-primary-01 p-0 text-primary-08 transition-colors hover:bg-primary-02 focus-visible:outline-2 focus-visible:outline-primary-03"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={onToggle}
        >
          {visible ? <VisiblePasswordEyeIcon /> : <PasswordEyeIcon />}
        </button>
      </span>
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
        <DecorativeCircles />

        <div className="relative z-[1] mx-auto w-full max-w-[424px] md:max-w-[628px]">
          <Link
            href={routes.web.getStarted}
            className="inline-flex min-h-9 items-center gap-2 rounded-md px-2 py-1 font-sans text-base font-normal leading-6 text-primary-06 no-underline transition-colors duration-[180ms] hover:bg-primary-01 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-03"
          >
            <BackArrowIcon />
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

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isStartingGoogle || isSubmitting}
            className="zion-btn zion-btn-md zion-btn-outline-blue mt-5 w-full min-w-0 md:mt-4"
          >
            {isStartingGoogle ? (
              <>
                <LoadingSpinner />
                <span className="sr-only">Starting Google sign in</span>
              </>
            ) : (
              <>
                <GoogleLogoIcon />
                <span>Continue with Google</span>
              </>
            )}
          </button>

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
              <PasswordField
                id="password"
                label="Password"
                value={values.password}
                placeholder="Min. 8 characters"
                visible={showPassword}
                error={errors.password}
                onToggle={() => setShowPassword((current) => !current)}
                onChange={updateValue}
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm Password"
                value={values.confirmPassword}
                placeholder="Re-enter password"
                visible={showConfirmPassword}
                error={errors.confirmPassword}
                onToggle={() =>
                  setShowConfirmPassword((current) => !current)
                }
                onChange={updateValue}
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