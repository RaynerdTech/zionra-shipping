"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DateOfBirthFieldProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

function localToday() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDate(value: string) {
  const date = parseIsoDate(value);
  if (!date) return "DD  /  MM  /  YYYY";
  return `${String(date.getDate()).padStart(2, "0")}  /  ${String(date.getMonth() + 1).padStart(2, "0")}  /  ${date.getFullYear()}`;
}

function initialCalendarDate(value: string) {
  const parsed = parseIsoDate(value);
  if (parsed) return parsed;

  const today = localToday();
  return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
}

function sameDay(a: Date | null, b: Date) {
  return Boolean(
    a &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate(),
  );
}

export default function DateOfBirthField({
  value,
  error,
  onChange,
  id = "dateOfBirth",
  label = "Date of Birth",
}: DateOfBirthFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date | null>(() => parseIsoDate(value));
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = initialCalendarDate(value);
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const parsed = parseIsoDate(value);
    if (parsed) setDraft(parsed);
  }, [value]);

  const today = useMemo(() => localToday(), []);
  const years = useMemo(() => {
    const end = today.getFullYear();
    const start = end - 120;
    return Array.from({ length: end - start + 1 }, (_, index) => end - index);
  }, [today]);

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const first = new Date(year, month, 1);
    const mondayIndex = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = Array.from({ length: mondayIndex }, () => null);

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }

    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [visibleMonth]);

  function openCalendar() {
    const initial = initialCalendarDate(value);
    setDraft(parseIsoDate(value));
    setVisibleMonth(new Date(initial.getFullYear(), initial.getMonth(), 1));
    setOpen(true);
  }

  function shiftMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function confirmDate() {
    if (draft) onChange(toIsoDate(draft));
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <label htmlFor={`${id}-trigger`} className="mb-2 block font-sans text-sm font-normal leading-[22px] text-primary-10">
        {label}<span className="text-error-bright"> *</span>
      </label>

      <input type="hidden" id={id} name={id} value={value} />

      <button
        id={`${id}-trigger`}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        onClick={() => (open ? setOpen(false) : openCalendar())}
        className={`flex h-12 w-full items-center justify-between rounded-[10px] border-2 bg-white px-3 text-left font-sans text-sm outline-none transition-colors ${
          open ? "border-primary-04" : error ? "border-error-bright" : "border-neutral-03 hover:border-primary-04"
        }`}
      >
        <span className={value ? "text-primary-10" : "text-neutral-05"}>{displayDate(value)}</span>
        <CalendarIcon />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose date of birth"
          className="absolute left-0 top-[78px] z-50 w-full min-w-[292px] overflow-hidden rounded-[10px] border border-neutral-03 bg-white shadow-[0_10px_30px_rgba(7,22,44,0.12)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-neutral-02 px-3 py-2.5">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="grid h-8 w-8 place-items-center rounded-md bg-neutral-01 text-neutral-07 transition-colors hover:bg-primary-01 hover:text-primary-06"
            >
              <ChevronLeftIcon />
            </button>

            <div className="flex items-center justify-center gap-1 font-display text-sm font-semibold text-primary-10">
              <select
                aria-label="Month"
                value={visibleMonth.getMonth()}
                onChange={(event) => setVisibleMonth(new Date(visibleMonth.getFullYear(), Number(event.target.value), 1))}
                className="cursor-pointer appearance-none bg-transparent text-center outline-none"
              >
                {MONTHS.map((month, index) => <option key={month} value={index}>{month}</option>)}
              </select>
              <select
                aria-label="Year"
                value={visibleMonth.getFullYear()}
                onChange={(event) => setVisibleMonth(new Date(Number(event.target.value), visibleMonth.getMonth(), 1))}
                className="cursor-pointer appearance-none bg-transparent text-center outline-none"
              >
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>

            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              disabled={visibleMonth.getFullYear() === today.getFullYear() && visibleMonth.getMonth() === today.getMonth()}
              className="grid h-8 w-8 place-items-center rounded-md bg-neutral-01 text-neutral-07 transition-colors hover:bg-primary-01 hover:text-primary-06 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRightIcon />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-neutral-02 bg-neutral-01 px-2 py-2 text-center font-sans text-[11px] text-neutral-05">
            {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-y-1 px-2 py-2.5">
            {calendarDays.map((date, index) => {
              if (!date) return <span key={`blank-${index}`} className="h-8" />;
              const selected = sameDay(draft, date);
              const disabled = date > today;

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => setDraft(date)}
                  aria-pressed={selected}
                  className={`mx-auto grid h-8 w-8 place-items-center rounded-md font-sans text-xs transition-colors ${
                    selected
                      ? "bg-primary-06 font-semibold text-white"
                      : disabled
                        ? "cursor-not-allowed text-neutral-03"
                        : "text-primary-10 hover:bg-primary-01 hover:text-primary-06"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end border-t border-neutral-02 px-3 py-2.5">
            <button
              type="button"
              disabled={!draft}
              onClick={confirmDate}
              className="h-9 rounded-md bg-primary-06 px-4 font-sans text-sm font-medium text-white transition-colors hover:bg-primary-07 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirm
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="zion-field-error mt-1">{error}</p> : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-neutral-07">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 3.5V7.5M16 3.5V7.5M3.5 10H20.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ChevronRightIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
