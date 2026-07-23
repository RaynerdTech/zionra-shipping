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
import AuthPasswordField from "./shared/AuthPasswordField";

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

function PasswordUpdatedIcon() {
  return (
    <div className="relative h-[88px] w-[88px]" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88" fill="none" className="absolute inset-0">
        <circle cx="44" cy="44" r="44" fill="var(--color-primary-06)" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" width="68" height="68" viewBox="0 0 68 68" fill="none" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <circle cx="34" cy="34" r="34" fill="var(--color-tertiary-06)" fillOpacity="0.3" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <path fillRule="evenodd" clipRule="evenodd" d="M29.292 5.95471C30.4122 4.72249 32.335 4.67673 33.5125 5.85428L36.9313 9.27313C38.0703 10.4122 38.0703 12.2589 36.9313 13.3979L16.7883 33.541C15.6494 34.68 13.8026 34.68 12.6636 33.541L4.18727 25.0646C3.04825 23.9256 3.04825 22.0788 4.18727 20.9398L6.83025 18.2968C7.96929 17.1578 9.81602 17.1578 10.955 18.2968L14.6829 22.0246L29.292 5.95471Z" fill="white" />
      </svg>
    </div>
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
              <AuthPasswordField
                id="password"
                label="Password"
                value={password}
                placeholder="Min. 8 characters"
                visible={showPassword}
                error={errors.password}
                disabled={isSubmitting}
                autoComplete="new-password"
                visibilityLabel="password"
                onChange={(value) => {
                  setPassword(value);
                  setErrors((current) => ({ ...current, password: undefined, form: undefined }));
                }}
                onToggle={() => setShowPassword((current) => !current)}
              />

              <AuthPasswordField
                id="confirmPassword"
                label="Confirm Password"
                value={confirmPassword}
                placeholder="Re-enter password"
                visible={showConfirmPassword}
                error={errors.confirmPassword}
                disabled={isSubmitting}
                autoComplete="new-password"
                visibilityLabel="confirm password"
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