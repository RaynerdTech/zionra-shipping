/**
 * Responsibility:
 * Renders the shared Google authentication button content and loading state.
 */

"use client";

import LoadingSpinner from "../../ui/LoadingSpinner";

type GoogleAuthButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  label?: string;
  loadingLabel?: string;
};

function GoogleLogoIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.702-1.567 2.684-3.875 2.684-6.613Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.182l-2.91-2.258c-.805.54-1.835.86-3.046.86-2.344 0-4.328-1.585-5.037-3.715H.956v2.332A9 9 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.963 10.705A5.42 5.42 0 0 1 3.68 9c0-.592.102-1.168.283-1.705V4.963H.956A9 9 0 0 0 0 9c0 1.45.347 2.824.956 4.037l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.507.454 3.441 1.345l2.582-2.582C13.463.89 11.426 0 9 0A9 9 0 0 0 .956 4.963l3.007 2.332C4.672 5.165 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function GoogleAuthButton({
  onClick,
  disabled = false,
  loading = false,
  className = "",
  label = "Continue with Google",
  loadingLabel = "Starting Google sign in",
}: GoogleAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading}
      className={className}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          <span className="sr-only">{loadingLabel}</span>
        </>
      ) : (
        <>
          <GoogleLogoIcon />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
