/**
 * Responsibility:
 * Renders the shared back-arrow icon used across Zionra authentication flows.
 */

type AuthBackArrowIconProps = {
  className?: string;
};

export default function AuthBackArrowIcon({
  className,
}: AuthBackArrowIconProps) {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M19 12H5M11 18L5 12L11 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
