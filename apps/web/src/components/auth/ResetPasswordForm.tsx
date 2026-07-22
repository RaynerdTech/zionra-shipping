/**
 * Responsibility:
 * Validates the secure password-reset authorization, collects the new password,
 * completes the reset, and presents the approved responsive success treatment.
 */

"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import LoadingSpinner from "../ui/LoadingSpinner";
import AuthRecoveryShell from "./AuthRecoveryShell";

type ResetErrors = {
  password?: string;
  confirmPassword?: string;
  form?: string;
};

type ApiResponse = {
  message?: string;
  code?: string;
  errors?: Record<string, string>;
};

type SessionState = "loading" | "valid" | "invalid";

function HiddenPasswordIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M1 1l10 10M4.17 4.17A2.5 2.5 0 0 0 7.83 7.83M3.25 2.76A5.8 5.8 0 0 1 6 2c3.5 0 5.25 4 5.25 4a9.8 9.8 0 0 1-1.6 2.18M7.03 9.15A5.7 5.7 0 0 1 6 9.25C2.5 9.25.75 6 .75 6a9.5 9.5 0 0 1 1.3-1.88"
        stroke="#174184"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VisiblePasswordIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M.75 6s1.75-3.25 5.25-3.25S11.25 6 11.25 6 9.5 9.25 6 9.25.75 6 .75 6Z" stroke="#174184" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="6" r="1.65" stroke="#174184" strokeWidth="1.15" />
    </svg>
  );
}

function PasswordUpdatedIcon() {
  return (
    <div className="relative h-[88px] w-[88px]" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88" fill="none" className="absolute inset-0">
        <circle cx="44" cy="44" r="44" fill="#286BDC" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" width="68" height="68" viewBox="0 0 68 68" fill="none" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <circle cx="34" cy="34" r="34" fill="#2EC4B6" fillOpacity="0.3" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <path fillRule="evenodd" clipRule="evenodd" d="M29.292 5.95471C30.4122 4.72249 32.335 4.67673 33.5125 5.85428L36.9313 9.27313C38.0703 10.4122 38.0703 12.2589 36.9313 13.3979L16.7883 33.541C15.6494 34.68 13.8026 34.68 12.6636 33.541L4.18727 25.0646C3.04825 23.9256 3.04825 22.0788 4.18727 20.9398L6.83025 18.2968C7.96929 17.1578 9.81602 17.1578 10.955 18.2968L14.6829 22.0246L29.292 5.95471Z" fill="white" />
      </svg>
    </div>
  );
}

type PasswordFieldProps = {
  id: "password" | "confirmPassword";
  label: string;
  value: string;
  placeholder: string;
  visible: boolean;
  error?: string;
  disabled: boolean;
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
  disabled,
  onChange,
  onToggle,
}: PasswordFieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block font-sans text-sm font-normal leading-[22px] text-neutral-10">
        {label} <span className="text-error">*</span>
      </span>

      <span className={`zion-input-shell h-[52px] md:h-12 ${error ? "zion-input-shell-error" : ""}`}>
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="zion-input-shell-control"
        />
        <button
          type="button"
          disabled={disabled}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-primary-01 p-0 text-primary-08 transition-colors hover:bg-primary-02 focus-visible:outline-2 focus-visible:outline-primary-03 disabled:cursor-not-allowed"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          onClick={onToggle}
        >
          {visible ? <VisiblePasswordIcon /> : <HiddenPasswordIcon />}
        </button>
      </span>

      {error ? <p className="zion-field-error mt-1">{error}</p> : null}
    </label>
  );
}

function PasswordUpdatedOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex items-end bg-[rgba(7,22,44,0.24)] md:items-center md:justify-center md:px-6 md:py-10">
      <section className="relative flex min-h-[56vh] w-full items-center justify-center overflow-hidden rounded-t-[24px] bg-primary-10 px-5 py-12 md:min-h-0 md:max-w-[560px] md:rounded-[20px] md:px-16 md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle, rgba(155,192,242,0.55) 1px, transparent 1px)", backgroundSize: "74px 74px" }} />

        <div className="relative z-10 w-full max-w-[360px] rounded-2xl bg-white px-6 py-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
          <div className="mx-auto w-fit">
            <PasswordUpdatedIcon />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold tracking-[-0.5px] text-primary-10">
            Password updated!
          </h2>
          <p className="mt-3 font-sans text-sm leading-[22px] text-text-body-light">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
          <Link
            href={`${routes.web.customerLogin}?passwordReset=1`}
            className="zion-btn zion-btn-md zion-btn-blue mt-6 w-full min-w-0"
          >
            Continue
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ResetErrors>({});
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function validateResetSession() {
      try {
        const response = await fetch(
          buildApiUrl(routes.api.customerAuth.passwordResetSession),
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        setSessionState(response.ok ? "valid" : "invalid");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Password-reset session validation failed:", error);
        setSessionState("invalid");
      }
    }

    void validateResetSession();

    return () => controller.abort();
  }, []);

  function validateForm() {
    const nextErrors: ResetErrors = {};

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

    if (isSubmitting || completed || sessionState !== "valid" || !validateForm()) {
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
            password,
            confirmPassword,
          }),
        },
      );

      const result = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        if (result.code === "PASSWORD_RESET_SESSION_EXPIRED") {
          setSessionState("invalid");
          return;
        }

        setErrors({
          ...(result.errors ?? {}),
          form: result.message ?? "Unable to update your password.",
        });
        return;
      }

      setCompleted(true);
    } catch (error) {
      console.error("Password reset failed:", error);
      setErrors({
        form: "Unable to reach the server. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <AuthRecoveryShell
        backHref={routes.web.customerForgotPassword}
        backLabel="Cancel"
        title="Create a new password"
        description="Choose a secure password for your Zionra account."
        showRightDecoration
      >
        {sessionState === "loading" ? (
          <div className="flex min-h-[220px] items-center justify-center text-primary-06">
            <LoadingSpinner />
            <span className="sr-only">Validating password reset session</span>
          </div>
        ) : sessionState === "invalid" ? (
          <div className="mx-auto max-w-[440px] rounded-xl border border-primary-02 bg-primary-01 px-5 py-6 text-center">
            <p className="font-sans text-sm leading-[22px] text-primary-09">
              Your password reset session is missing or has expired. Request a new code to continue.
            </p>
            <Link
              href={routes.web.customerForgotPassword}
              className="zion-btn zion-btn-md zion-btn-blue mt-5 w-full min-w-0"
            >
              Start again
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-[560px]">
            <div className="space-y-5">
              <PasswordField
                id="password"
                label="Password"
                value={password}
                placeholder="Min. 8 characters"
                visible={showPassword}
                error={errors.password}
                disabled={isSubmitting}
                onChange={(value) => {
                  setPassword(value);
                  setErrors((current) => ({ ...current, password: undefined, form: undefined }));
                }}
                onToggle={() => setShowPassword((current) => !current)}
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm Password"
                value={confirmPassword}
                placeholder="Re-enter password"
                visible={showConfirmPassword}
                error={errors.confirmPassword}
                disabled={isSubmitting}
                onChange={(value) => {
                  setConfirmPassword(value);
                  setErrors((current) => ({ ...current, confirmPassword: undefined, form: undefined }));
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
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="zion-btn zion-btn-md zion-btn-blue mt-7 w-full min-w-0"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  <span className="sr-only">Updating password</span>
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>
        )}
      </AuthRecoveryShell>

      {completed ? <PasswordUpdatedOverlay /> : null}
    </>
  );
}