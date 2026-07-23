/**
 * Responsibility:
 * Verifies the six-digit password-reset code and establishes a secure,
 * short-lived server-backed authorization before the password form is shown.
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import LoadingSpinner from "../ui/LoadingSpinner";
import AuthOtpInput, {
  AUTH_OTP_LENGTH,
  type AuthOtpInputHandle,
  createEmptyAuthOtp,
} from "./shared/AuthOtpInput";

const RESEND_COOLDOWN_SECONDS = 60;

type ApiResponse = {
  message?: string;
  code?: string;
  errors?: Record<string, string>;
  redirectTo?: string;
};

type VerifyPasswordResetCodeFormProps = {
  email: string;
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg aria-hidden="true" width="60" height="60" viewBox="0 0 64 64" fill="none">
      <rect x="4" y="12" width="56" height="40" rx="6" fill="#1B2F4E" stroke="var(--color-primary-03)" strokeWidth="2" />
      <path d="M4 20 32 38 60 20" stroke="var(--color-primary-03)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg aria-hidden="true" width="60" height="60" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="24" stroke="#34C759" strokeWidth="2.5" />
      <path d="m20 32 8 8 16-17" stroke="#34C759" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FailureIcon() {
  return (
    <svg aria-hidden="true" width="60" height="60" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="24" stroke="#FF3B30" strokeWidth="2.5" />
      <path d="m23 23 18 18M41 23 23 41" stroke="#FF3B30" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function RightArrowIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.333 7h9.334M8.167 3.5 11.667 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return "Email address unavailable";
  }

  return `${localPart.slice(0, 1)}*****@${domain}`;
}

export default function VerifyPasswordResetCodeForm({
  email,
}: VerifyPasswordResetCodeFormProps) {
  const router = useRouter();
  const otpInputRef = useRef<AuthOtpInputHandle | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const hasEmail = normalizedEmail.length > 0;

  const [code, setCode] = useState<string[]>(() => createEmptyAuthOtp());
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(
    RESEND_COOLDOWN_SECONDS,
  );
  const [resendNotice, setResendNotice] = useState("");

  const verificationCode = useMemo(() => code.join(""), [code]);
  const codeIsComplete = verificationCode.length === AUTH_OTP_LENGTH;
  const hasFailure = Boolean(error);
  const fieldsAreLocked = isVerifying || isVerified;

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  function clearFailure() {
    setError("");
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasEmail) {
      setError("Start password recovery again to request a new code.");
      return;
    }

    if (!codeIsComplete || isVerifying || isVerified) {
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch(
        buildApiUrl(routes.api.customerAuth.verifyPasswordResetCode),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            code: verificationCode,
          }),
        },
      );

      const result = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(
          result.message ??
            result.errors?.code ??
            "Invalid or expired password reset code.",
        );
        return;
      }

      setIsVerified(true);
      redirectTimeoutRef.current = setTimeout(() => {
        router.replace(
          result.redirectTo ?? routes.web.customerResetPassword,
        );
      }, 700);
    } catch (requestError) {
      console.error("Password-reset code verification failed:", requestError);
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (
      !hasEmail ||
      isResending ||
      isVerifying ||
      isVerified ||
      cooldownSeconds > 0
    ) {
      return;
    }

    setIsResending(true);
    setError("");
    setResendNotice("");

    try {
      const response = await fetch(
        buildApiUrl(routes.api.customerAuth.forgotPassword),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        },
      );

      const result = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setError(
          result.message ?? "Unable to request another code. Please try again.",
        );
        return;
      }

      setCode(createEmptyAuthOtp());
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      setResendNotice(
        "If an account exists, a new reset code has been sent.",
      );
      requestAnimationFrame(() => otpInputRef.current?.focus());
    } catch (requestError) {
      console.error("Password-reset code resend failed:", requestError);
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  if (!hasEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-01 px-4">
        <div className="w-full max-w-[500px] rounded-2xl bg-white px-6 py-8 text-center">
          <p className="font-sans text-sm leading-[22px] text-error">
            Your password-recovery request is missing an email address.
          </p>
          <Link
            href={routes.web.customerForgotPassword}
            className="zion-btn zion-btn-md zion-btn-blue mt-6 w-full min-w-0"
          >
            Start again
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-01 px-4 py-10">
      <section className="relative flex w-full max-w-[560px] flex-col items-center rounded-[24px] bg-primary-09 px-6 py-10 text-center sm:px-10">
        <Link
          href={routes.web.customerForgotPassword}
          aria-label="Close password-reset verification"
          className="absolute right-[18px] top-[18px] inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-03/15 text-primary-03 transition-colors hover:bg-primary-03/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-03"
        >
          <CloseIcon />
        </Link>

        <div className="flex h-[72px] w-[72px] items-center justify-center">
          {isVerified ? (
            <SuccessIcon />
          ) : hasFailure ? (
            <FailureIcon />
          ) : (
            <EmailIcon />
          )}
        </div>

        <h1 className="mt-6 font-display text-[28px] font-semibold leading-[1.3] tracking-[-1px] text-white">
          We have sent
        </h1>
        <p
          className={`mx-auto mt-2 max-w-[420px] font-sans text-[15px] leading-[1.6] ${
            isVerified
              ? "text-[#34C759]"
              : hasFailure
                ? "text-[#FF8A82]"
                : "text-[#D4DAE0]"
          }`}
        >
          If an account exists, we&apos;ve sent a 6 digit reset code to the email below.
        </p>

        <div className="mt-6 max-w-full truncate rounded-full bg-[#1B2F4E] px-[18px] py-2 font-sans text-[15px] text-white">
          {maskEmail(normalizedEmail)}
        </div>

        <form onSubmit={handleVerify} noValidate className="mt-6 w-full">
          <AuthOtpInput
            ref={otpInputRef}
            value={code}
            idPrefix="password-reset-code"
            digitLabel="Password reset code"
            disabled={fieldsAreLocked}
            state={
              isVerified
                ? "success"
                : hasFailure
                  ? "failure"
                  : "default"
            }
            onChange={setCode}
            onEdit={clearFailure}
          />

          <div aria-live="polite" className="mx-auto mt-4 min-h-[22px] max-w-[390px] font-sans text-sm leading-[22px]">
            {error ? <p className="text-[#FF8A82]">{error}</p> : null}
            {isVerified ? <p className="text-[#34C759]">Code verified securely.</p> : null}
            {resendNotice && !error && !isVerified ? (
              <p className="text-primary-03">{resendNotice}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={!codeIsComplete || isVerifying || isVerified}
            aria-busy={isVerifying}
            className={`mt-3 inline-flex h-12 w-[193px] items-center justify-center rounded-md font-sans text-base transition-colors ${
              codeIsComplete && !isVerified
                ? "bg-primary-06 text-white hover:bg-primary-07"
                : "cursor-not-allowed bg-neutral-02 text-neutral-05"
            }`}
          >
            {isVerifying || isVerified ? (
              <>
                <LoadingSpinner />
                <span className="sr-only">
                  {isVerified ? "Code verified" : "Verifying code"}
                </span>
              </>
            ) : (
              "Verify code"
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 font-sans text-sm leading-[1.55]">
          <span className="text-white">Didn&apos;t receive it?</span>
          <button
            type="button"
            disabled={isResending || isVerifying || isVerified || cooldownSeconds > 0}
            onClick={handleResend}
            className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-primary-03 transition-colors hover:text-primary-02 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending ? <LoadingSpinner /> : null}
            <span>
              {isResending
                ? "Resending"
                : cooldownSeconds > 0
                  ? `Resend in ${cooldownSeconds}s`
                  : "Resend"}
            </span>
            {!isResending && cooldownSeconds === 0 ? <RightArrowIcon /> : null}
          </button>
        </div>
      </section>
    </main>
  );
}
