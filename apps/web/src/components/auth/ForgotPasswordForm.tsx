/**
 * Responsibility:
 * Collects a customer's email address and requests a password-reset code.
 * It validates the email, calls the existing customer authentication API,
 * displays recoverable errors, and moves the customer to the reset-code step.
 */

"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import LoadingSpinner from "../ui/LoadingSpinner";
import AuthRecoveryShell from "./AuthRecoveryShell";

type ForgotPasswordFormProps = {
  initialEmail?: string;
};

type ForgotPasswordErrors = {
  email?: string;
  form?: string;
};

type ApiResponse = {
  message?: string;
  errors?: Record<string, string>;
};

export default function ForgotPasswordForm({
  initialEmail = "",
}: ForgotPasswordFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail.trim().toLowerCase());
  const [errors, setErrors] = useState<ForgotPasswordErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateEmail() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrors({ email: "This field can't be left empty." });
      return null;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrors({ email: "Enter a valid email address." });
      return null;
    }

    return normalizedEmail;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const normalizedEmail = validateEmail();

    if (!normalizedEmail) {
      return;
    }

    setIsSubmitting(true);
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
          ...(result.errors ?? {}),
          form:
            result.message ??
            "Unable to send a password-reset code. Please try again.",
        });
        return;
      }

      router.push(
        `${routes.web.customerResetPassword}?email=${encodeURIComponent(
          normalizedEmail,
        )}`,
      );
    } catch (error) {
      console.error("Password-reset request failed:", error);
      setErrors({ form: "Unable to reach the server. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthRecoveryShell
      backHref={routes.web.customerLogin}
      backLabel="Back to login"
      title="Forgot your password?"
      description="Enter your Zionra email address and we’ll send you a six-digit reset code."
    >
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email" className="block">
          <span className="mb-2 block font-sans text-sm font-normal leading-[22px] text-neutral-10">
            Email Address <span className="text-error">*</span>
          </span>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            placeholder="You@example.com"
            aria-invalid={Boolean(errors.email)}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({
                ...current,
                email: undefined,
                form: undefined,
              }));
            }}
            className="zion-input h-[52px] md:h-12"
          />

          {errors.email ? (
            <p className="zion-field-error mt-1">{errors.email}</p>
          ) : null}
        </label>

        <div className="mt-5 rounded-xl border border-primary-02 bg-primary-01 px-4 py-3 font-sans text-sm font-normal leading-[22px] text-text-body-light">
          The code expires in 1 minute. Requesting another code will invalidate
          the previous one.
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
              <span className="sr-only">Sending reset code</span>
            </>
          ) : (
            "Send reset code"
          )}
        </button>
      </form>
    </AuthRecoveryShell>
  );
}
