/**
 * Responsibility:
 * Verifies the six-digit customer login code before creating an authenticated session.
 * It loads the server-backed login challenge, handles OTP keyboard interactions,
 * resends codes, cancels verification, and redirects after successful authentication.
 */

"use client";

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
const FALLBACK_RESEND_COOLDOWN_SECONDS = 30;
const SUCCESS_REDIRECT_DELAY_MS = 800;
const EMPTY_CODE = Array.from({ length: CODE_LENGTH }, () => "");

type VerificationOutcome = "success" | "failure" | null;

type ApiResponse = {
  message?: string;
  code?: string;
  errors?: Record<string, string>;
  maskedEmail?: string;
  resendAvailableAt?: string;
  redirectTo?: string;
};

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      width="60"
      height="60"
      viewBox="0 0 64 64"
      fill="none"
    >
      <rect
        x="4"
        y="12"
        width="56"
        height="40"
        rx="6"
        fill="#1B2F4E"
        stroke="#9BC0F2"
        strokeWidth="2"
      />
      <path
        d="M4 20L32 38L60 20"
        stroke="#9BC0F2"
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
    >
      <circle cx="32" cy="32" r="24" fill="#124E49" />
      <path
        d="M20 32L28 40L44 24"
        stroke="white"
        strokeWidth="3"
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
    >
      <circle cx="32" cy="32" r="24" fill="#B3261E" fillOpacity="0.2" />
      <path
        d="M24 24L40 40M40 24L24 40"
        stroke="#FF3B30"
        strokeWidth="3"
        strokeLinecap="round"
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

function getApiMessage(result: ApiResponse, fallback: string) {
  return result.message ?? result.errors?.code ?? fallback;
}

function getCooldownSeconds(resendAvailableAt?: string) {
  if (!resendAvailableAt) {
    return FALLBACK_RESEND_COOLDOWN_SECONDS;
  }

  const availableAt = new Date(resendAvailableAt).getTime();

  if (!Number.isFinite(availableAt)) {
    return FALLBACK_RESEND_COOLDOWN_SECONDS;
  }

  return Math.max(0, Math.ceil((availableAt - Date.now()) / 1000));
}

export default function LoginVerificationCodeForm() {
  const router = useRouter();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [code, setCode] = useState<string[]>(EMPTY_CODE);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [outcome, setOutcome] = useState<VerificationOutcome>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const verificationCode = useMemo(() => code.join(""), [code]);
  const codeIsComplete = verificationCode.length === CODE_LENGTH;
  const inputsAreLocked =
    isLoadingChallenge ||
    isVerifying ||
    isCancelling ||
    outcome === "success";

  useEffect(() => {
    const controller = new AbortController();

    async function loadChallenge() {
      try {
        const response = await fetch(
          buildApiUrl(routes.api.customerAuth.loginChallenge),
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const result = (await response.json().catch(() => ({}))) as ApiResponse;

        if (!response.ok || !result.maskedEmail) {
          router.replace(routes.web.customerLogin);
          return;
        }

        setMaskedEmail(result.maskedEmail);
        setCooldownSeconds(
          getCooldownSeconds(result.resendAvailableAt),
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Login challenge could not be loaded:", error);
        router.replace(routes.web.customerLogin);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingChallenge(false);
        }
      }
    }

    void loadChallenge();

    return () => {
      controller.abort();

      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [router]);

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

  function clearFailure() {
    setOutcome(null);
    setFeedback("");
  }

  function replaceDigits(startIndex: number, rawValue: string) {
    if (inputsAreLocked) {
      return;
    }

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

    clearFailure();
    focusInput(Math.min(startIndex + digits.length, CODE_LENGTH - 1));
  }

  function handleInputChange(
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    if (inputsAreLocked) {
      return;
    }

    const digits = event.target.value.replace(/\D/g, "");

    if (digits.length > 1) {
      replaceDigits(index, digits);
      return;
    }

    setCode((current) => {
      const next = [...current];
      next[index] = digits.slice(-1);
      return next;
    });

    clearFailure();

    if (digits && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (inputsAreLocked) {
      return;
    }

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

      clearFailure();
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

  function handlePaste(
    index: number,
    event: ClipboardEvent<HTMLInputElement>,
  ) {
    event.preventDefault();
    replaceDigits(index, event.clipboardData.getData("text"));
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!codeIsComplete || inputsAreLocked) {
      return;
    }

    setIsVerifying(true);
    setOutcome(null);
    setFeedback("");

    try {
      const response = await fetch(
        buildApiUrl(routes.api.customerAuth.verifyLoginCode),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: verificationCode,
          }),
        },
      );

      const result = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        if (result.code === "LOGIN_CHALLENGE_EXPIRED") {
          router.replace(routes.web.customerLogin);
          return;
        }

        setOutcome("failure");
        setFeedback(
          getApiMessage(result, "Invalid or expired sign-in code."),
        );
        return;
      }

      setOutcome("success");
      setFeedback(result.message ?? "Signed in successfully.");

      redirectTimeoutRef.current = setTimeout(() => {
        router.replace(
          result.redirectTo ?? routes.web.customerDashboard,
        );
        router.refresh();
      }, SUCCESS_REDIRECT_DELAY_MS);
    } catch (error) {
      console.error("Login-code verification failed:", error);
      setOutcome("failure");
      setFeedback("Unable to reach the server. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (
      isLoadingChallenge ||
      isVerifying ||
      isResending ||
      isCancelling ||
      cooldownSeconds > 0
    ) {
      return;
    }

    setIsResending(true);
    setOutcome(null);
    setFeedback("");

    try {
      const response = await fetch(
        buildApiUrl(routes.api.customerAuth.resendLoginCode),
        {
          method: "POST",
          credentials: "include",
        },
      );

      const result = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        if (
          result.code === "LOGIN_CHALLENGE_EXPIRED" ||
          result.code === "EMAIL_DELIVERY_FAILED"
        ) {
          router.replace(routes.web.customerLogin);
          return;
        }

        setOutcome("failure");
        setFeedback(
          getApiMessage(
            result,
            "Unable to send another sign-in code.",
          ),
        );
        return;
      }

      setCode([...EMPTY_CODE]);
      setCooldownSeconds(
        getCooldownSeconds(result.resendAvailableAt),
      );
      setFeedback(result.message ?? "A new sign-in code has been sent.");

      requestAnimationFrame(() => focusInput(0));
    } catch (error) {
      console.error("Login-code resend failed:", error);
      setOutcome("failure");
      setFeedback("Unable to reach the server. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  async function handleCancel() {
    if (isCancelling) {
      return;
    }

    setIsCancelling(true);

    try {
      await fetch(buildApiUrl(routes.api.customerAuth.cancelLogin), {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Login verification cancellation failed:", error);
    } finally {
      router.replace(routes.web.customerLogin);
    }
  }

  const resendLabel = isResending
    ? "Resending"
    : cooldownSeconds > 0
      ? `Resend in ${cooldownSeconds}s`
      : "Resend";

  const subtitleClass =
    outcome === "success"
      ? "text-[#34C759]"
      : outcome === "failure"
        ? "text-[#FF8A82]"
        : "text-[#D4DAE0]";

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary-10 px-4 py-12 sm:px-6">
      <section className="relative flex w-full max-w-[560px] flex-col items-center rounded-[24px] bg-[#0F2C58] px-6 py-10 text-center sm:px-10">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isCancelling}
          aria-label="Cancel sign-in verification"
          className="absolute right-[18px] top-[18px] inline-flex h-10 w-10 items-center justify-center rounded-full border-0 bg-[rgba(155,192,242,0.15)] text-[#9BC0F2] transition-colors hover:bg-[rgba(155,192,242,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCancelling ? <LoadingSpinner /> : <CloseIcon />}
        </button>

        <div className="flex h-[72px] w-[72px] items-center justify-center">
          {outcome === "success" ? (
            <SuccessIcon />
          ) : outcome === "failure" ? (
            <FailureIcon />
          ) : (
            <MailIcon />
          )}
        </div>

        <h1 className="mt-6 font-display text-[26px] font-semibold leading-[1.3] tracking-[-1px] text-white sm:text-[28px]">
          Verify your email address
        </h1>

        <p
          className={`mx-auto mt-2 max-w-[390px] font-sans text-[15px] font-normal leading-[1.6] transition-colors ${subtitleClass}`}
        >
          We&apos;ve sent you a 6 digit verification code to your email
        </p>

        <div className="mt-6 min-h-10">
          {isLoadingChallenge ? (
            <LoadingSpinner />
          ) : (
            <div className="w-fit max-w-full truncate rounded-full bg-[#1B2F4E] px-[18px] py-2 font-sans text-[15px] font-normal text-white">
              {maskedEmail}
            </div>
          )}
        </div>

        <form onSubmit={handleVerify} noValidate className="mt-6 w-full">
          <div className="mx-auto grid w-fit grid-cols-3 gap-4 sm:grid-cols-6">
            {code.map((digit, index) => {
              const stateClass =
                outcome === "success"
                  ? "border-[#34C759] bg-[#C3D9F7]"
                  : outcome === "failure"
                    ? "border-[#B3261E] bg-[#C3D9F7]"
                    : digit
                      ? "border-transparent bg-[#C3D9F7] focus:border-white"
                      : "border-transparent bg-[#9BC0F2] focus:border-white";

              return (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  id={`login-code-${index + 1}`}
                  name={`login-code-${index + 1}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  autoFocus={index === 0}
                  enterKeyHint={index === CODE_LENGTH - 1 ? "done" : "next"}
                  maxLength={index === 0 ? CODE_LENGTH : 1}
                  value={digit}
                  aria-label={`Sign-in code digit ${index + 1}`}
                  aria-invalid={outcome === "failure"}
                  disabled={inputsAreLocked}
                  onChange={(event) => handleInputChange(index, event)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={(event) => handlePaste(index, event)}
                  onFocus={(event) => event.currentTarget.select()}
                  className={`h-[53px] w-14 rounded-[10px] border-2 text-center font-display text-[22px] font-semibold leading-none tracking-[-0.5px] text-primary-10 caret-primary-10 outline-none transition-[background-color,border-color,transform] duration-200 hover:scale-105 disabled:cursor-default disabled:opacity-100 disabled:hover:scale-100 ${stateClass}`}
                />
              );
            })}
          </div>

          <div
            aria-live="polite"
            className="mx-auto mt-4 min-h-[22px] max-w-[380px] font-sans text-sm font-normal leading-[22px]"
          >
            {feedback ? (
              <p
                className={
                  outcome === "failure"
                    ? "text-[#FF8A82]"
                    : outcome === "success"
                      ? "text-[#34C759]"
                      : "text-[#9BC0F2]"
                }
              >
                {feedback}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={
              !codeIsComplete ||
              isLoadingChallenge ||
              isVerifying ||
              isCancelling ||
              outcome === "failure" ||
              outcome === "success"
            }
            aria-busy={isVerifying}
            className={`mt-3 inline-flex h-12 w-[193px] items-center justify-center gap-2 rounded-md border-0 font-sans text-base font-normal transition-colors ${
              codeIsComplete &&
              !isLoadingChallenge &&
              !isVerifying &&
              !isCancelling &&
              !outcome
                ? "bg-primary-06 text-white hover:bg-primary-07"
                : outcome === "success" || isVerifying
                  ? "cursor-wait bg-primary-06 text-white"
                  : "cursor-not-allowed bg-[#E2E7F0] text-[#8BA3BF]"
            }`}
          >
            {isVerifying || outcome === "success" ? (
              <>
                <LoadingSpinner />
                <span className="sr-only">
                  {outcome === "success"
                    ? "Signed in successfully"
                    : "Verifying sign-in code"}
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
            onClick={handleResend}
            disabled={
              isLoadingChallenge ||
              isVerifying ||
              isResending ||
              isCancelling ||
              cooldownSeconds > 0 ||
              outcome === "success"
            }
            className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-[#9BC0F2] transition-colors hover:text-[#C3D9F7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending ? <LoadingSpinner /> : null}
            <span>{resendLabel}</span>
            {!isResending && cooldownSeconds === 0 ? (
              <RightArrowIcon />
            ) : null}
          </button>
        </div>
      </section>
    </main>
  );
}
