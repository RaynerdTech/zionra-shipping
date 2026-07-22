/**
 * Responsibility:
 * Completes the customer password-reset flow.
 * It manages the six-digit reset code, password validation, resend behavior,
 * API submission, and the successful return to customer login.
 */

"use client";

import Link from "next/link";
import {
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import LoadingSpinner from "../ui/LoadingSpinner";
import AuthRecoveryShell from "./AuthRecoveryShell";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;
const EMPTY_CODE = Array.from({ length: CODE_LENGTH }, () => "");

type ResetPasswordFormProps = {
  email: string;
};

type ResetErrors = {
  code?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

type ApiResponse = {
  message?: string;
  errors?: Record<string, string>;
};

function HiddenPasswordIcon() {
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

function VisiblePasswordIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M.75 6s1.75-3.25 5.25-3.25S11.25 6 11.25 6 9.5 9.25 6 9.25.75 6 .75 6Z"
        stroke="#174184"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="6" r="1.65" stroke="#174184" strokeWidth="1.15" />
    </svg>
  );
}

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  const visibleCharacters = Math.min(2, localPart.length);
  return `${localPart.slice(0, visibleCharacters)}${"*".repeat(
    Math.max(4, localPart.length - visibleCharacters),
  )}@${domain}`;
}

type PasswordFieldProps = {
  id: "password" | "confirmPassword";
  label: string;
  value: string;
  placeholder: string;
  visible: boolean;
  error?: string;
  onChange: (value: string) => void;
  onToggle: () => void;
};

function PasswordField({
  id,
  label,
  value,
  placeholder,
  visible,
  error,
  onChange,
  onToggle,
}: PasswordFieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block font-sans text-sm font-normal leading-[22px] text-neutral-10">
        {label} <span className="text-error">*</span>
      </span>

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
          onChange={(event) => onChange(event.target.value)}
          className="zion-input-shell-control"
        />

        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-primary-01 p-0 text-primary-08 transition-colors hover:bg-primary-02 focus-visible:outline-2 focus-visible:outline-primary-03"
          aria-label={
            visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`
          }
          onClick={onToggle}
        >
          {visible ? <VisiblePasswordIcon /> : <HiddenPasswordIcon />}
        </button>
      </span>

      {error ? <p className="zion-field-error mt-1">{error}</p> : null}
    </label>
  );
}

export default function ResetPasswordForm({ email }: ResetPasswordFormProps) {
  const normalizedEmail = email.trim().toLowerCase();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [code, setCode] = useState<string[]>(EMPTY_CODE);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ResetErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [completed, setCompleted] = useState(false);

  const verificationCode = useMemo(() => code.join(""), [code]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  function focusInput(index: number) {
    inputRefs.current[index]?.focus();
  }

  function replaceDigits(startIndex: number, rawValue: string) {
    const digits = rawValue.replace(/\D/g, "").slice(0, CODE_LENGTH);

    if (!digits) {
      return;
    }

    setCode((current) => {
      const nextCode = [...current];

      digits.split("").forEach((digit, offset) => {
        const targetIndex = startIndex + offset;

        if (targetIndex < CODE_LENGTH) {
          nextCode[targetIndex] = digit;
        }
      });

      return nextCode;
    });

    setErrors((current) => ({
      ...current,
      code: undefined,
      form: undefined,
    }));

    focusInput(Math.min(startIndex + digits.length, CODE_LENGTH - 1));
  }

  function handleCodeChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, "");

    if (digits.length > 1) {
      replaceDigits(index, digits);
      return;
    }

    setCode((current) => {
      const nextCode = [...current];
      nextCode[index] = digits.slice(-1);
      return nextCode;
    });

    setErrors((current) => ({
      ...current,
      code: undefined,
      form: undefined,
    }));

    if (digits && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  }

  function handleCodeKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace") {
      if (code[index]) {
        setCode((current) => {
          const nextCode = [...current];
          nextCode[index] = "";
          return nextCode;
        });
      } else if (index > 0) {
        setCode((current) => {
          const nextCode = [...current];
          nextCode[index - 1] = "";
          return nextCode;
        });

        focusInput(index - 1);
      }

      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    replaceDigits(index, event.clipboardData.getData("text"));
  }

  function validateForm() {
    const nextErrors: ResetErrors = {};

    if (!normalizedEmail) {
      nextErrors.form = "Your reset session is missing an email address. Start again.";
    }

    if (verificationCode.length !== CODE_LENGTH) {
      nextErrors.code = "Enter the complete six-digit reset code.";
    }

    if (!password) {
      nextErrors.password = "This field can't be left empty.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "This field can't be left empty.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || completed || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(
        buildApiUrl(routes.api.customerAuth.resetPassword),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            code: verificationCode,
            password,
            confirmPassword,
          }),
        },
      );

      const result = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setErrors({
          ...(result.errors ?? {}),
          form:
            result.message ??
            "Unable to reset your password. Check the code and try again.",
        });
        return;
      }

      setCompleted(true);
    } catch (error) {
      console.error("Password reset failed:", error);
      setErrors({ form: "Unable to reach the server. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!normalizedEmail || isResending || isSubmitting || cooldownSeconds > 0) {
      return;
    }

    setIsResending(true);
    setErrors({});

    try {
      const response = await fetch(
        buildApiUrl(routes.api.customerAuth.forgotPassword),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: normalizedEmail }),
        },
      );

      const result = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setErrors({
          form:
            result.message ??
            "Unable to send another reset code. Please try again.",
        });
        return;
      }

      setCode([...EMPTY_CODE]);
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      requestAnimationFrame(() => focusInput(0));
    } catch (error) {
      console.error("Password-reset code resend failed:", error);
      setErrors({ form: "Unable to reach the server. Please try again." });
    } finally {
      setIsResending(false);
    }
  }

  if (completed) {
    return (
      <AuthRecoveryShell
        backHref={routes.web.customerLogin}
        backLabel="Back to login"
        title="Password updated"
        description="Your password has been changed successfully. You can now sign in with your new password."
      >
        <Link
          href={`${routes.web.customerLogin}?email=${encodeURIComponent(
            normalizedEmail,
          )}`}
          className="zion-btn zion-btn-md zion-btn-blue w-full min-w-0"
        >
          Sign in to Zionra
        </Link>
      </AuthRecoveryShell>
    );
  }

  return (
    <AuthRecoveryShell
      backHref={routes.web.customerForgotPassword}
      backLabel="Start again"
      title="Reset your password"
      description="Enter the six-digit code from your email and choose a new password."
    >
      {!normalizedEmail ? (
        <div className="rounded-xl border border-error bg-[#FFF1F0] px-4 py-3 text-center font-sans text-sm leading-[22px] text-error">
          <p>Your reset session is missing an email address.</p>
          <Link
            href={routes.web.customerForgotPassword}
            className="mt-2 inline-block font-medium text-primary-06 no-underline"
          >
            Return to Forgot Password
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="rounded-full bg-primary-01 px-4 py-3 text-center font-sans text-sm leading-[22px] text-primary-08">
            If an account exists for {maskEmail(normalizedEmail)} a reset code has been sent.
          </div>

          <fieldset className="mt-6">
            <legend className="mb-3 block w-full text-center font-sans text-sm font-normal leading-[22px] text-neutral-10">
              Six-digit reset code
            </legend>

            <div className="mx-auto grid w-fit grid-cols-6 gap-2 md:gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  id={`reset-code-${index + 1}`}
                  name={`reset-code-${index + 1}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={index === 0 ? CODE_LENGTH : 1}
                  value={digit}
                  aria-label={`Reset code digit ${index + 1}`}
                  aria-invalid={Boolean(errors.code)}
                  disabled={isSubmitting}
                  onChange={(event) => handleCodeChange(index, event)}
                  onKeyDown={(event) => handleCodeKeyDown(index, event)}
                  onPaste={(event) => handlePaste(index, event)}
                  onFocus={(event) => event.currentTarget.select()}
                  className={`h-12 w-10 rounded-md border-2 bg-primary-01 text-center font-display text-xl font-semibold leading-none text-primary-10 caret-primary-10 outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-70 md:w-12 ${
                    errors.code
                      ? "border-error"
                      : "border-primary-02 focus:border-primary-06"
                  }`}
                />
              ))}
            </div>

            {errors.code ? (
              <p className="zion-field-error mt-2 text-center">{errors.code}</p>
            ) : null}
          </fieldset>

          <div className="mt-4 text-center font-sans text-sm leading-[22px]">
            <button
              type="button"
              disabled={isResending || isSubmitting || cooldownSeconds > 0}
              onClick={handleResend}
              className="inline-flex items-center gap-2 border-0 bg-transparent p-0 text-primary-06 transition-colors hover:text-primary-07 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResending ? <LoadingSpinner /> : null}
              <span>
                {isResending
                  ? "Sending"
                  : cooldownSeconds > 0
                    ? `Send another code in ${cooldownSeconds}s`
                    : "Send another code"}
              </span>
            </button>
          </div>

          <div className="mt-6 space-y-5">
            <PasswordField
              id="password"
              label="New Password"
              value={password}
              placeholder="Min. 8 characters"
              visible={showPassword}
              error={errors.password}
              onChange={(value) => {
                setPassword(value);
                setErrors((current) => ({
                  ...current,
                  password: undefined,
                  form: undefined,
                }));
              }}
              onToggle={() => setShowPassword((current) => !current)}
            />

            <PasswordField
              id="confirmPassword"
              label="Confirm New Password"
              value={confirmPassword}
              placeholder="Re-enter password"
              visible={showConfirmPassword}
              error={errors.confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value);
                setErrors((current) => ({
                  ...current,
                  confirmPassword: undefined,
                  form: undefined,
                }));
              }}
              onToggle={() => setShowConfirmPassword((current) => !current)}
            />
          </div>

          {errors.form ? (
            <p aria-live="polite" className="zion-field-error mt-4 text-center">
              {errors.form}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || isResending}
            aria-busy={isSubmitting}
            className="zion-btn zion-btn-md zion-btn-blue mt-7 w-full min-w-0"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                <span className="sr-only">Updating password</span>
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>
      )}
    </AuthRecoveryShell>
  );
}
