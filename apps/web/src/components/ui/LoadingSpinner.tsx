/**
 * Responsibility:
 * Renders the shared 14px Zionra loading spinner used inside buttons.
 * Its stroke inherits the button text color so it is white on filled buttons
 * and blue on outline buttons.
 */

type LoadingSpinnerProps = {
  className?: string;
};

export default function LoadingSpinner({
  className = "",
}: LoadingSpinnerProps) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={`zion-btn-spinner ${className}`.trim()}
    >
      <path
        d="M6.99984 1.16602V3.49935M6.99984 10.4993V12.8327M2.87567 2.87518L4.5265 4.52602M9.47317 9.47268L11.124 11.1235M1.1665 6.99935H3.49984M10.4998 6.99935H12.8332M2.87567 11.1235L4.5265 9.47268M9.47317 4.52602L11.124 2.87518"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
