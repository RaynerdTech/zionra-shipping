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

type PickerView = "month" | "year" | null;

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
  const selectedYearRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pickerView, setPickerView] = useState<PickerView>(null);
  const [draft, setDraft] = useState<Date | null>(() => parseIsoDate(value));
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = initialCalendarDate(value);
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setPickerView(null);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (pickerView) setPickerView(null);
        else setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, pickerView]);

  useEffect(() => {
    const parsed = parseIsoDate(value);
    if (parsed) setDraft(parsed);
  }, [value]);

  useEffect(() => {
    if (pickerView !== "year") return;
    requestAnimationFrame(() => {
      selectedYearRef.current?.scrollIntoView({ block: "center" });
    });
  }, [pickerView]);

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
    setPickerView(null);
    setOpen(true);
  }

  function shiftMonth(offset: number) {
    setPickerView(null);
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function selectMonth(month: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), month, 1));
    setPickerView(null);
  }

  function selectYear(year: number) {
    setVisibleMonth((current) => new Date(year, current.getMonth(), 1));
    setPickerView(null);
  }

  const draftMatchesVisibleMonth = Boolean(
    draft &&
      draft.getFullYear() === visibleMonth.getFullYear() &&
      draft.getMonth() === visibleMonth.getMonth(),
  );

  function confirmDate() {
    if (draft && draftMatchesVisibleMonth) onChange(toIsoDate(draft));
    setPickerView(null);
    setOpen(false);
  }

  const atCurrentMonth =
    visibleMonth.getFullYear() === today.getFullYear() &&
    visibleMonth.getMonth() === today.getMonth();

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
        onClick={() => {
          if (open) {
            setOpen(false);
            setPickerView(null);
          } else {
            openCalendar();
          }
        }}
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
          className="absolute left-0 top-[78px] z-50 w-full min-w-[292px] overflow-hidden rounded-[10px] border border-neutral-03 bg-white shadow-[0_12px_34px_rgba(7,22,44,0.14)]"
        >
          <div className="relative flex items-center justify-between gap-3 border-b border-neutral-02 px-3 py-2.5">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="grid h-8 w-8 place-items-center rounded-md bg-neutral-01 text-neutral-07 transition-colors hover:bg-primary-01 hover:text-primary-06"
            >
              <ChevronLeftIcon />
            </button>

            <div className="flex min-w-0 items-center justify-center gap-1.5 font-display text-sm font-semibold text-primary-10">
              <button
                type="button"
                aria-expanded={pickerView === "month"}
                onClick={() => setPickerView((current) => current === "month" ? null : "month")}
                className={`inline-flex h-8 items-center gap-1 rounded-md px-2 transition-colors hover:bg-primary-01 hover:text-primary-06 ${pickerView === "month" ? "bg-primary-01 text-primary-06" : ""}`}
              >
                {MONTHS[visibleMonth.getMonth()]}
                <ChevronDownIcon open={pickerView === "month"} />
              </button>
              <button
                type="button"
                aria-expanded={pickerView === "year"}
                onClick={() => setPickerView((current) => current === "year" ? null : "year")}
                className={`inline-flex h-8 items-center gap-1 rounded-md px-2 transition-colors hover:bg-primary-01 hover:text-primary-06 ${pickerView === "year" ? "bg-primary-01 text-primary-06" : ""}`}
              >
                {visibleMonth.getFullYear()}
                <ChevronDownIcon open={pickerView === "year"} />
              </button>
            </div>

            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              disabled={atCurrentMonth}
              className="grid h-8 w-8 place-items-center rounded-md bg-neutral-01 text-neutral-07 transition-colors hover:bg-primary-01 hover:text-primary-06 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRightIcon />
            </button>

            {pickerView === "month" ? (
              <div className="absolute left-1/2 top-[50px] z-20 w-[276px] -translate-x-1/2 rounded-xl border border-neutral-02 bg-white p-2 shadow-[0_12px_30px_rgba(7,22,44,0.14)]">
                <div className="grid grid-cols-3 gap-1">
                  {MONTHS.map((month, index) => {
                    const selected = index === visibleMonth.getMonth();
                    const disabled = visibleMonth.getFullYear() === today.getFullYear() && index > today.getMonth();
                    return (
                      <button
                        key={month}
                        type="button"
                        disabled={disabled}
                        onClick={() => selectMonth(index)}
                        className={`h-10 rounded-lg px-2 font-sans text-sm transition-colors ${
                          selected
                            ? "bg-primary-06 font-medium text-white"
                            : disabled
                              ? "cursor-not-allowed text-neutral-03"
                              : "text-primary-10 hover:bg-primary-01 hover:text-primary-06"
                        }`}
                      >
                        {month.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {pickerView === "year" ? (
              <div className="absolute left-1/2 top-[50px] z-20 w-[292px] -translate-x-1/2 rounded-xl border border-neutral-02 bg-white p-2 shadow-[0_12px_30px_rgba(7,22,44,0.14)]">
                <div className="mb-2 px-2 font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-05">Select year</div>
                <div className="grid max-h-[224px] grid-cols-3 gap-1 overflow-y-auto overscroll-contain pr-1">
                  {years.map((year) => {
                    const selected = year === visibleMonth.getFullYear();
                    return (
                      <button
                        key={year}
                        ref={selected ? selectedYearRef : undefined}
                        type="button"
                        onClick={() => selectYear(year)}
                        className={`h-9 rounded-lg font-sans text-sm transition-colors ${
                          selected
                            ? "bg-primary-06 font-medium text-white"
                            : "text-primary-10 hover:bg-primary-01 hover:text-primary-06"
                        }`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
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
              disabled={!draftMatchesVisibleMonth}
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
  return <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="m8.5 3.5-3.5 3.5 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ChevronRightIcon() {
  return <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="m5.5 3.5 3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`}><path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
