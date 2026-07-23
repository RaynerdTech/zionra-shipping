/**
 * Responsibility:
 * Renders a reusable Zionra password field with validation feedback and the
 * approved hidden/visible password interaction.
 */

"use client";

type AuthPasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  visible: boolean;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: "current-password" | "new-password";
  className?: string;
  visibilityLabel?: string;
  onChange: (value: string) => void;
  onToggle: () => void;
};

function HiddenPasswordIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.44021 9.14625L10.5224 11.2285C10.7177 11.4238 11.0342 11.4238 11.2295 11.2285C11.4247 11.0332 11.4247 10.7167 11.2295 10.5215L1.22946 0.521445C1.03419 0.326185 0.717687 0.326185 0.522422 0.521445C0.327161 0.71671 0.327161 1.03322 0.522422 1.22848L2.45183 3.15789C2.28212 3.29113 2.12537 3.42989 1.98096 3.57081C1.59315 3.94923 1.2943 4.3432 1.07223 4.68746C0.882362 4.98181 0.746592 5.24315 0.657677 5.4321C0.613222 5.52655 0.580242 5.6034 0.558067 5.6577C0.547002 5.68475 0.538542 5.7063 0.532677 5.72165C0.530657 5.72695 0.528972 5.7316 0.527572 5.73545L0.525842 5.7402L0.522912 5.7485C0.493827 5.83 0.493827 5.91945 0.522912 6.00095C0.534872 6.0325 0.524387 6.00685 0.524387 6.00685C0.524387 6.00685 0.527937 6.0159 0.541957 6.05125C0.553532 6.0807 0.570157 6.1227 0.592737 6.17475C0.637867 6.27885 0.706002 6.42495 0.799277 6.5991C0.985512 6.9467 1.27511 7.4104 1.6899 7.87495C2.52309 8.8081 3.86838 9.74995 5.87596 9.74995C6.61071 9.74995 7.25866 9.62345 7.82621 9.41605C8.04241 9.337 8.24701 9.24625 8.44021 9.14625ZM4.24452 4.95058C4.0896 5.22335 4.00094 5.53895 4.00094 5.87495C4.00094 6.9105 4.84041 7.74995 5.87596 7.74995C6.21196 7.74995 6.52756 7.6613 6.80031 7.5064L6.23531 6.9414L4.80951 5.51555L4.24452 4.95058Z"
        fill="#174184"
      />
      <path
        d="M10.0619 3.87549C9.22873 2.94233 7.88348 2 5.87588 2C5.68548 2 5.36258 2.02907 5.02968 2.08252C4.69933 2.13557 4.32237 2.2185 4.0365 2.33838C4.01209 2.34863 3.98909 2.36131 3.96777 2.3761L9.77588 8.1842C9.78698 8.17605 9.79768 8.16725 9.80798 8.1577C10.2596 7.7408 10.6127 7.2 10.849 6.7783C10.9686 6.5649 11.0613 6.3761 11.1244 6.24025C11.156 6.17225 11.1805 6.11725 11.1971 6.0786C11.2037 6.0633 11.2091 6.05045 11.2132 6.0404L11.2162 6.0332L11.2216 6.0205L11.2235 6.01515C11.2573 5.93115 11.2604 5.82775 11.2269 5.74365C11.2263 5.74175 11.2244 5.73585 11.2235 5.7334L11.22 5.72445L11.2162 5.71475L11.2098 5.69875C11.1983 5.66925 11.1816 5.62725 11.1591 5.5752C11.1139 5.47115 11.0458 5.325 10.9525 5.1509C10.7663 4.8033 10.4766 4.34 10.0619 3.87549Z"
        fill="#141B34"
      />
    </svg>
  );
}

function VisiblePasswordIcon() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M.75 6s1.75-3.25 5.25-3.25S11.25 6 11.25 6 9.5 9.25 6 9.25.75 6 .75 6Z"
        stroke="#174184"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="6"
        cy="6"
        r="1.65"
        stroke="#174184"
        strokeWidth="1.15"
      />
    </svg>
  );
}

export default function AuthPasswordField({
  id,
  label,
  value,
  placeholder,
  visible,
  error,
  disabled = false,
  required = true,
  autoComplete = "current-password",
  className,
  visibilityLabel = "password",
  onChange,
  onToggle,
}: AuthPasswordFieldProps) {
  return (
    <label htmlFor={id} className={className}>
      <span className="mb-2 block font-sans text-sm font-normal leading-[22px] text-neutral-10">
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </span>

      <span
        className={`zion-input-shell h-[52px] md:h-12 ${
          error ? "zion-input-shell-error" : ""
        }`}
      >
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
          className="zion-input-shell-control"
        />

        <button
          type="button"
          disabled={disabled}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-primary-01 p-0 text-primary-08 transition-colors hover:bg-primary-02 focus-visible:outline-2 focus-visible:outline-primary-03 disabled:cursor-not-allowed"
          aria-label={visible ? `Hide ${visibilityLabel}` : `Show ${visibilityLabel}`}
          onClick={onToggle}
        >
          {visible ? <VisiblePasswordIcon /> : <HiddenPasswordIcon />}
        </button>
      </span>

      {error ? <p className="zion-field-error mt-1">{error}</p> : null}
    </label>
  );
}
