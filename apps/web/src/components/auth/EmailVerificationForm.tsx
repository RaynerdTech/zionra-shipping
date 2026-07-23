/**
 * Responsibility:
 * Renders and submits the customer email-verification flow.
 * It manages the six-digit OTP interaction, resend cooldown, visual verification
 * states, API feedback, and the correct redirect after verification.
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

const RESEND_COOLDOWN_SECONDS = 30;
const RESEND_NOTICE_DURATION_MS = 2400;
const SUCCESS_REDIRECT_DELAY_MS = 900;

type FeedbackState = {
  type: "error" | "success";
  message: string;
} | null;

type VerificationOutcome = "success" | "failure" | null;

type VerificationVisualState =
  | "default"
  | "filled"
  | "loading"
  | "success"
  | "failure";

type ApiResponse = {
  message?: string;
  code?: string;
  errors?: Record<string, string>;
};

function EmailIcon() {
  return (
    <svg
      aria-hidden="true"
      width="60"
      height="60"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4"
        y="12"
        width="56"
        height="40"
        rx="6"
        fill="#1B2F4E"
        stroke="var(--color-primary-03)"
        strokeWidth="2"
      />
      <path
        d="M4 20L32 38L60 20"
        stroke="var(--color-primary-03)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg
      aria-hidden="true"
      width="60"
      height="60"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 52H14A6 6 0 0 1 8 46V34A6 6 0 0 1 14 28H20M20 52V28M20 52H26L30 56H42A6 6 0 0 0 48 50V30A6 6 0 0 0 42 24H34L30 20H26A4 4 0 0 0 22 24V28"
        stroke="#34C759"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FailureIcon() {
  return (
    <svg
      aria-hidden="true"
      width="60"
      height="60"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 12H14A6 6 0 0 0 8 18V30A6 6 0 0 0 14 36H20M20 12V36M20 12H26L30 8H42A6 6 0 0 1 48 14V30A6 6 0 0 1 42 36H34L30 40H26A4 4 0 0 1 22 36V32"
        stroke="#FF3B30"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M18 6L6 18M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RightArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M2.333 7H11.667M8.167 3.5L11.667 7L8.167 10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

function getApiMessage(result: ApiResponse, fallback: string) {
  return result.message ?? result.errors?.code ?? fallback;
}

type EmailVerificationFormProps = {
  email: string;
  source?: string;
};

export default function EmailVerificationForm({
  email,
  source,
}: EmailVerificationFormProps) {
  const router = useRouter();
  const otpInputRef = useRef<AuthOtpInputHandle | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resendNoticeTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const hasEmail = normalizedEmail.length > 0;
  const isGoogleLinkFlow = source === "google";

  const [code, setCode] = useState<string[]>(() => createEmptyAuthOtp());
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [verificationOutcome, setVerificationOutcome] =
    useState<VerificationOutcome>(null);
  const [resendNotice, setResendNotice] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const verificationCode = useMemo(() => code.join(""), [code]);
  const codeIsComplete = verificationCode.length === AUTH_OTP_LENGTH;

  const visualState: VerificationVisualState =
    verificationOutcome === "success"
      ? "success"
      : verificationOutcome === "failure"
        ? "failure"
        : isVerifying
          ? "loading"
          : codeIsComplete
            ? "filled"
            : "default";

  const inputsAreLocked =
    visualState === "loading" || visualState === "success";

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      if (resendNoticeTimeoutRef.current) {
        clearTimeout(resendNoticeTimeoutRef.current);
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

  function clearVerificationFeedback() {
    setVerificationOutcome(null);
    setFeedback(null);
  }

  function showResendNotice(message: string) {
    setResendNotice(message);

    if (resendNoticeTimeoutRef.current) {
      clearTimeout(resendNoticeTimeoutRef.current);
    }

    resendNoticeTimeoutRef.current = setTimeout(() => {
      setResendNotice("");
    }, RESEND_NOTICE_DURATION_MS);
  }

  function continueAfterVerification(message: string) {
    setVerificationOutcome("success");
    setFeedback({
      type: "success",
      message,
    });

    redirectTimeoutRef.current = setTimeout(() => {
      router.replace(
        isGoogleLinkFlow
          ? routes.web.customerLinkGoogleAccount
          : `${routes.web.customerLogin}?verified=1&email=${encodeURIComponent(
              normalizedEmail,
            )}`,
      );
    }, SUCCESS_REDIRECT_DELAY_MS);
  }

  function isAlreadyVerifiedResponse(result: ApiResponse) {
    return (
      result.code === "EMAIL_ALREADY_VERIFIED" ||
      result.message === "This email address is already verified."
    );
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasEmail) {
      setVerificationOutcome("failure");
      setFeedback({
        type: "error",
        message: "Return to Create Account and submit your email again.",
      });
      return;
    }

    if (
      !codeIsComplete ||
      isVerifying ||
      verificationOutcome === "failure"
    ) {
      return;
    }

    setIsVerifying(true);
    setVerificationOutcome(null);
    setFeedback(null);

    let verificationSucceeded = false;

    try {
      const response = await fetch(
        buildApiUrl(routes.api.customerAuth.verifyEmail),
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
        if (isGoogleLinkFlow && isAlreadyVerifiedResponse(result)) {
          verificationSucceeded = true;
          continueAfterVerification(
            "This email address is already verified. Continue to connect Google.",
          );
          return;
        }

        setVerificationOutcome("failure");
        setFeedback({
          type: "error",
          message: getApiMessage(
            result,
            "Invalid or expired verification code.",
          ),
        });
        return;
      }

      verificationSucceeded = true;
      continueAfterVerification(
        result.message ?? "Email verified successfully.",
      );
    } catch (error) {
      console.error("Email verification failed:", error);
      setVerificationOutcome("failure");
      setFeedback({
        type: "error",
        message: "Unable to reach the server. Please try again.",
      });
    } finally {
      if (!verificationSucceeded) {
        setIsVerifying(false);
      }
    }
  }

  async function handleResend() {
    if (!hasEmail || isResending || isVerifying || cooldownSeconds > 0) {
      return;
    }

    setIsResending(true);
    setVerificationOutcome(null);
    setFeedback(null);
    setResendNotice("");

    try {
      const response = await fetch(
        buildApiUrl(routes.api.customerAuth.resendVerificationCode),
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
        if (isGoogleLinkFlow && isAlreadyVerifiedResponse(result)) {
          continueAfterVerification(
            "This email address is already verified. Continue to connect Google.",
          );
          return;
        }

        setFeedback({
          type: "error",
          message: getApiMessage(
            result,
            "Unable to resend the verification code.",
          ),
        });
        return;
      }

      setCode(createEmptyAuthOtp());
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      showResendNotice(`New code sent to ${maskEmail(normalizedEmail)}`);
      requestAnimationFrame(() => otpInputRef.current?.focus());
    } catch (error) {
      console.error("Verification-code resend failed:", error);
      setFeedback({
        type: "error",
        message: "Unable to reach the server. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  }

  const resendLabel = isResending
    ? "Resending"
    : cooldownSeconds > 0
      ? `Resend in ${cooldownSeconds}s`
      : "Resend";

  const subtitleClass =
    visualState === "success"
      ? "text-[#34C759]"
      : visualState === "failure"
        ? "text-[#FF3B30]"
        : "text-[#D4DAE0]";

  const verifyButtonClass =
    visualState === "filled"
      ? "bg-primary-06 text-white hover:bg-primary-07"
      : visualState === "loading" || visualState === "success"
        ? "cursor-wait bg-primary-06 text-white"
        : "cursor-not-allowed bg-neutral-02 text-neutral-05";

  return (
    <main className="min-h-screen overflow-hidden bg-primary-10 px-4 pb-20 pt-20 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-16">
      <section className="relative mx-auto flex w-full max-w-[560px] flex-col items-center rounded-[24px] bg-primary-09 px-6 py-10 text-center sm:px-10">
        <Link
          href={routes.web.customerCreateAccount}
          aria-label="Close email verification"
          className="absolute right-[18px] top-[18px] inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-03/15 text-primary-03 transition-colors hover:bg-primary-03/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-03"
        >
          <CloseIcon />
        </Link>

        <div className="flex h-[72px] w-[72px] items-center justify-center">
          {visualState === "success" ? (
            <SuccessIcon />
          ) : visualState === "failure" ? (
            <FailureIcon />
          ) : (
            <EmailIcon />
          )}
        </div>

        <div className="mt-6 w-full">
          <h1 className="font-display text-[26px] font-semibold leading-[1.3] tracking-[-1px] text-white sm:text-[28px]">
            Verify your email address
          </h1>

          <p
            className={`mx-auto mt-2 max-w-[390px] font-sans text-[15px] font-normal leading-[1.6] transition-colors ${subtitleClass}`}
          >
            We&apos;ve sent you a 6 digit verification code to your email
          </p>
        </div>

        <div className="mt-6 w-fit max-w-full truncate rounded-full bg-[#1B2F4E] px-[18px] py-2 font-sans text-[15px] font-normal text-white">
          {maskEmail(normalizedEmail)}
        </div>

        <form onSubmit={handleVerify} noValidate className="mt-6 w-full">
          <AuthOtpInput
            ref={otpInputRef}
            value={code}
            idPrefix="verification-code"
            digitLabel="Verification code"
            disabled={inputsAreLocked}
            state={
              visualState === "success"
                ? "success"
                : visualState === "failure"
                  ? "failure"
                  : "default"
            }
            useEnterKeyHints
            inputClassName="tracking-[-0.5px]"
            onChange={setCode}
            onEdit={clearVerificationFeedback}
          />

          <div
            aria-live="polite"
            className="mx-auto mt-4 min-h-[22px] max-w-[380px] font-sans text-sm font-normal leading-[22px]"
          >
            {feedback ? (
              <p
                className={
                  feedback.type === "error"
                    ? "text-[#FF8A82]"
                    : "text-[#34C759]"
                }
              >
                {feedback.message}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={
              !hasEmail ||
              !codeIsComplete ||
              isVerifying ||
              verificationOutcome === "failure"
            }
            aria-busy={isVerifying}
            className={`mt-3 inline-flex h-12 w-[193px] items-center justify-center gap-2 rounded-md border-0 font-sans text-base font-normal transition-colors ${verifyButtonClass}`}
          >
            {visualState === "loading" || visualState === "success" ? (
              <>
                <LoadingSpinner />
                <span className="sr-only">
                  {visualState === "success"
                    ? "Email verified"
                    : "Verifying email"}
                </span>
              </>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 font-sans text-sm font-normal leading-[1.55]">
          <span className="text-white">Didn&apos;t receive it?</span>

          <button
            type="button"
            disabled={
              !hasEmail || isResending || isVerifying || cooldownSeconds > 0
            }
            onClick={handleResend}
            className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-primary-03 transition-colors hover:text-primary-02 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending ? <LoadingSpinner /> : null}
            <span>{resendLabel}</span>
            {!isResending && cooldownSeconds === 0 ? <RightArrowIcon /> : null}
          </button>
        </div>

        {resendNotice ? (
          <div
            role="status"
            className="absolute bottom-[-44px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1B2F4E] px-[18px] py-2 font-sans text-[13px] text-primary-03 shadow-lg"
          >
            {resendNotice}
          </div>
        ) : null}
      </section>
    </main>
  );
}