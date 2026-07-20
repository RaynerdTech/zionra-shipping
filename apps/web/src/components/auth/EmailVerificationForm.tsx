/**
 * Responsibility:
 * Renders and submits the customer email-verification flow.
 * It manages the six-digit OTP interaction, resend cooldown, API feedback,
 * loading states, and the redirect to customer login after verification.
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;
const EMPTY_CODE = Array.from({ length: CODE_LENGTH }, () => "");

type FeedbackState = {
  type: "error" | "success";
  message: string;
} | null;

type ApiResponse = {
  message?: string;
  code?: string;
  errors?: Record<string, string>;
};

function EmailIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="84.208"
      height="68.542"
      viewBox="0 0 85 69"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.7708 0C4.82228 0 0 4.82228 0 10.7708V57.7708C0 63.7195 4.82228 68.5417 10.7708 68.5417H73.4375C79.3861 68.5417 84.2083 63.7195 84.2083 57.7708V10.7708C84.2083 4.82228 79.3861 0 73.4375 0H10.7708ZM20.0848 16.0673C18.6834 15.2499 16.8848 15.7232 16.0673 17.1245C15.2499 18.5259 15.7232 20.3246 17.1245 21.142L36.6776 32.5479C40.0311 34.5043 44.178 34.5043 47.5319 32.5479L67.0847 21.142C68.4861 20.3246 68.9596 18.5259 68.1422 17.1245C67.3244 15.7232 65.5258 15.2499 64.1245 16.0673L44.5717 27.4731C43.0473 28.3625 41.1622 28.3625 39.6378 27.4731L20.0848 16.0673Z"
        fill="var(--color-primary-02)"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="3"
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
        d="M2.333 7h9.334M8.167 3.5 11.667 7l-3.5 3.5"
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
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const hasEmail = normalizedEmail.length > 0;
  const isGoogleLinkFlow = source === "google";

  const [code, setCode] = useState<string[]>(EMPTY_CODE);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const verificationCode = useMemo(() => code.join(""), [code]);
  const codeIsComplete = verificationCode.length === CODE_LENGTH;
  const hasError = feedback?.type === "error";

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

  function focusInput(index: number) {
    inputRefs.current[index]?.focus();
  }

  function replaceDigits(startIndex: number, rawValue: string) {
    const digits = rawValue.replace(/\D/g, "").slice(0, CODE_LENGTH);

    if (!digits) {
      return;
    }

    setCode((current) => {
      const next = [...current];

      digits.split("").forEach((digit, offset) => {
        const targetIndex = startIndex + offset;

        if (targetIndex < CODE_LENGTH) {
          next[targetIndex] = digit;
        }
      });

      return next;
    });

    setFeedback(null);
    focusInput(Math.min(startIndex + digits.length, CODE_LENGTH - 1));
  }

  function handleInputChange(
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const rawValue = event.target.value;
    const digits = rawValue.replace(/\D/g, "");

    if (digits.length > 1) {
      replaceDigits(index, digits);
      return;
    }

    setCode((current) => {
      const next = [...current];
      next[index] = digits.slice(-1);
      return next;
    });

    setFeedback(null);

    if (digits && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace") {
      if (code[index]) {
        setCode((current) => {
          const next = [...current];
          next[index] = "";
          return next;
        });
      } else if (index > 0) {
        setCode((current) => {
          const next = [...current];
          next[index - 1] = "";
          return next;
        });
        focusInput(index - 1);
      }

      setFeedback(null);
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

  function continueAfterVerification(message: string) {
    setFeedback({
      type: "success",
      message,
    });

    redirectTimeoutRef.current = setTimeout(() => {
      router.replace(
        isGoogleLinkFlow
          ? routes.web.customerLinkGoogleAccount
          : `${routes.web.customerLogin}?verified=1&email=${encodeURIComponent(normalizedEmail)}`,
      );
    }, 900);
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
      setFeedback({
        type: "error",
        message: "Return to Create Account and submit your email again.",
      });
      return;
    }

    if (!codeIsComplete || isVerifying) {
      return;
    }

    setIsVerifying(true);
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
    setFeedback(null);

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

      setCode([...EMPTY_CODE]);
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      setFeedback({
        type: "success",
        message: result.message ?? "A new verification code was sent.",
      });
      requestAnimationFrame(() => focusInput(0));
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

  return (
    <main className="min-h-screen overflow-hidden bg-primary-10 px-0 pb-12 pt-24 md:flex md:items-center md:justify-center md:px-6 md:py-16">
      <section className="relative mx-auto w-full max-w-[440px] rounded-[16px] bg-primary-09 px-7 pb-8 pt-9 text-center md:max-w-[560px] md:rounded-[20px] md:px-12 md:pb-10 md:pt-10">
        <Link
          href={routes.web.customerCreateAccount}
          aria-label="Close email verification"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md text-primary-03 transition-colors hover:bg-primary-08 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-03 md:right-5 md:top-5"
        >
          <CloseIcon />
        </Link>

        <div className="mx-auto w-fit">
          <EmailIcon />
        </div>

        <h1 className="mt-7 font-display text-xl font-semibold leading-[30px] tracking-[-0.3px] text-white md:text-2xl md:leading-[34px] md:tracking-[-0.5px]">
          Verify your email address
        </h1>

        <p className="mx-auto mt-2 max-w-[330px] font-sans text-sm font-normal leading-[22px] text-primary-02 md:text-base md:leading-[26px]">
          We&apos;ve sent you a 6 digit verification code to your email
        </p>

        <div className="mx-auto mt-5 w-fit rounded-full bg-primary-08 px-5 py-3 font-sans text-sm font-normal leading-[22px] text-neutral-01">
          {maskEmail(normalizedEmail)}
        </div>

        <form onSubmit={handleVerify} noValidate className="mt-6">
          <div className="mx-auto grid w-fit grid-cols-3 gap-x-[18px] gap-y-4 md:grid-cols-6 md:gap-x-3 md:gap-y-0">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                id={`verification-code-${index + 1}`}
                name={`verification-code-${index + 1}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                autoFocus={index === 0}
                enterKeyHint={index === CODE_LENGTH - 1 ? "done" : "next"}
                maxLength={index === 0 ? CODE_LENGTH : 1}
                value={digit}
                aria-label={`Verification code digit ${index + 1}`}
                aria-invalid={hasError}
                disabled={isVerifying}
                onChange={(event) => handleInputChange(index, event)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={(event) => handlePaste(index, event)}
                onFocus={(event) => event.currentTarget.select()}
                className={`h-10 w-12 rounded-md border-2 bg-primary-03 text-center font-display text-xl font-semibold leading-none text-primary-10 caret-primary-10 outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-75 md:h-12 md:w-12 ${
                  hasError
                    ? "border-error"
                    : "border-transparent focus:border-white"
                }`}
              />
            ))}
          </div>

          <div
            aria-live="polite"
            className="mx-auto mt-4 min-h-[22px] max-w-[360px] font-sans text-sm font-normal leading-[22px]"
          >
            {feedback ? (
              <p
                className={
                  feedback.type === "error"
                    ? "text-[#FF8A82]"
                    : "text-tertiary-03"
                }
              >
                {feedback.message}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={!hasEmail || !codeIsComplete || isVerifying}
            aria-busy={isVerifying}
            className="zion-btn zion-btn-sm zion-btn-blue mt-3 h-10 w-[146px] min-w-0"
          >
            {isVerifying ? (
              <>
                <LoadingSpinner />
                <span className="sr-only">Verifying email</span>
              </>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-5 font-sans text-[13px] font-normal leading-normal">
          <span className="text-neutral-01">Didn&apos;t receive it?</span>
          <button
            type="button"
            disabled={
              !hasEmail || isResending || isVerifying || cooldownSeconds > 0
            }
            onClick={handleResend}
            className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-primary-03 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending ? <LoadingSpinner /> : null}
            <span>{resendLabel}</span>
            {!isResending && cooldownSeconds === 0 ? <RightArrowIcon /> : null}
          </button>
        </div>
      </section>
    </main>
  );
}
