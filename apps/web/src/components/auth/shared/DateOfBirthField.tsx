"use client";

import { useRef } from "react";

type DateOfBirthFieldProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
};

function localToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DateOfBirthField({
  value,
  error,
  onChange,
  id = "dateOfBirth",
  label = "Date of Birth",
}: DateOfBirthFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    const input = inputRef.current;
    if (!input) return;

    input.focus();
    if ("showPicker" in input && typeof input.showPicker === "function") {
      input.showPicker();
    }
  }

  return (
    <div className="block min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block font-sans text-sm font-normal leading-[22px] text-neutral-10"
      >
        {label}<span className="text-error-bright"> *</span>
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={id}
          type="date"
          autoComplete="bday"
          max={localToday()}
          value={value}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
          className="zion-input zion-date-input h-[52px] w-full pr-12 md:h-12"
        />
        <button
          type="button"
          aria-label="Open date picker"
          onClick={openPicker}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-neutral-07 transition-colors hover:bg-primary-01 hover:text-primary-08 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/30"
        >
          <CalendarIcon />
        </button>
      </div>

      {error ? <p className="zion-field-error mt-1">{error}</p> : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="15"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 3.5V7.5M16 3.5V7.5M3.5 10H20.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8 14H8.01M12 14H12.01M16 14H16.01M8 17.5H8.01M12 17.5H12.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
