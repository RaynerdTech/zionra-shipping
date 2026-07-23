/**
 * Responsibility:
 * Renders the shared six-digit Zionra authentication-code input.
 * It owns digit filtering, paste distribution, focus movement, backspace,
 * arrow-key navigation, and the approved success/failure field states.
 */

"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import type {
  ChangeEvent,
  ClipboardEvent,
  FocusEvent,
  KeyboardEvent,
} from "react";

export const AUTH_OTP_LENGTH = 6;

export function createEmptyAuthOtp() {
  return Array.from({ length: AUTH_OTP_LENGTH }, () => "");
}

export type AuthOtpInputHandle = {
  focus: (index?: number) => void;
};

type AuthOtpInputState = "default" | "success" | "failure";

type AuthOtpInputProps = {
  value: readonly string[];
  idPrefix: string;
  digitLabel: string;
  onChange: (nextValue: string[]) => void;
  onEdit?: () => void;
  disabled?: boolean;
  state?: AuthOtpInputState;
  autoFocus?: boolean;
  useEnterKeyHints?: boolean;
  className?: string;
  inputClassName?: string;
};

const AuthOtpInput = forwardRef<AuthOtpInputHandle, AuthOtpInputProps>(
  function AuthOtpInput(
    {
      value,
      idPrefix,
      digitLabel,
      onChange,
      onEdit,
      disabled = false,
      state = "default",
      autoFocus = true,
      useEnterKeyHints = false,
      className = "mx-auto grid w-fit grid-cols-3 gap-4 sm:grid-cols-6",
      inputClassName = "",
    },
    forwardedRef,
  ) {
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    function focusInput(index = 0) {
      const boundedIndex = Math.min(
        Math.max(index, 0),
        AUTH_OTP_LENGTH - 1,
      );

      inputRefs.current[boundedIndex]?.focus();
    }

    useImperativeHandle(
      forwardedRef,
      () => ({
        focus: focusInput,
      }),
      [],
    );

    function commitValue(nextValue: string[]) {
      onChange(nextValue);
      onEdit?.();
    }

    function replaceDigits(startIndex: number, rawValue: string) {
      if (disabled) {
        return;
      }

      const digits = rawValue
        .replace(/\D/g, "")
        .slice(0, AUTH_OTP_LENGTH);

      if (!digits) {
        return;
      }

      const nextValue = Array.from(
        { length: AUTH_OTP_LENGTH },
        (_, index) => value[index] ?? "",
      );

      digits.split("").forEach((digit, offset) => {
        const targetIndex = startIndex + offset;

        if (targetIndex < AUTH_OTP_LENGTH) {
          nextValue[targetIndex] = digit;
        }
      });

      commitValue(nextValue);
      focusInput(
        Math.min(startIndex + digits.length, AUTH_OTP_LENGTH - 1),
      );
    }

    function handleInputChange(
      index: number,
      event: ChangeEvent<HTMLInputElement>,
    ) {
      if (disabled) {
        return;
      }

      const digits = event.target.value.replace(/\D/g, "");

      if (digits.length > 1) {
        replaceDigits(index, digits);
        return;
      }

      const nextValue = Array.from(
        { length: AUTH_OTP_LENGTH },
        (_, currentIndex) => value[currentIndex] ?? "",
      );

      nextValue[index] = digits.slice(-1);
      commitValue(nextValue);

      if (digits && index < AUTH_OTP_LENGTH - 1) {
        focusInput(index + 1);
      }
    }

    function handleKeyDown(
      index: number,
      event: KeyboardEvent<HTMLInputElement>,
    ) {
      if (disabled) {
        return;
      }

      if (event.key === "Backspace") {
        const nextValue = Array.from(
          { length: AUTH_OTP_LENGTH },
          (_, currentIndex) => value[currentIndex] ?? "",
        );

        if (nextValue[index]) {
          nextValue[index] = "";
        } else if (index > 0) {
          nextValue[index - 1] = "";
          focusInput(index - 1);
        }

        commitValue(nextValue);
        return;
      }

      if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        focusInput(index - 1);
      }

      if (event.key === "ArrowRight" && index < AUTH_OTP_LENGTH - 1) {
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

    return (
      <div className={className}>
        {Array.from({ length: AUTH_OTP_LENGTH }, (_, index) => {
          const digit = value[index] ?? "";
          const stateClass =
            state === "success"
              ? "border-[#34C759] bg-primary-02"
              : state === "failure"
                ? "border-error bg-primary-02"
                : digit
                  ? "border-transparent bg-primary-02 focus:border-white"
                  : "border-transparent bg-primary-03 focus:border-white";

          return (
            <input
              key={index}
              ref={(element: HTMLInputElement | null) => {
                inputRefs.current[index] = element;
              }}
              id={`${idPrefix}-${index + 1}`}
              name={`${idPrefix}-${index + 1}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              autoFocus={autoFocus && index === 0}
              enterKeyHint={
                useEnterKeyHints
                  ? index === AUTH_OTP_LENGTH - 1
                    ? "done"
                    : "next"
                  : undefined
              }
              maxLength={index === 0 ? AUTH_OTP_LENGTH : 1}
              value={digit}
              aria-label={`${digitLabel} digit ${index + 1}`}
              aria-invalid={state === "failure"}
              disabled={disabled}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleInputChange(index, event)
              }
              onKeyDown={(event: KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(index, event)
              }
              onPaste={(event: ClipboardEvent<HTMLInputElement>) =>
                handlePaste(index, event)
              }
              onFocus={(event: FocusEvent<HTMLInputElement>) =>
                event.currentTarget.select()
              }
              className={`h-[53px] w-14 rounded-[10px] border-2 text-center font-display text-[22px] font-semibold leading-none text-primary-10 caret-primary-10 outline-none transition-[background-color,border-color,transform] duration-200 hover:scale-105 disabled:cursor-default disabled:opacity-100 disabled:hover:scale-100 ${stateClass} ${inputClassName}`}
            />
          );
        })}
      </div>
    );
  },
);

AuthOtpInput.displayName = "AuthOtpInput";

export default AuthOtpInput;
