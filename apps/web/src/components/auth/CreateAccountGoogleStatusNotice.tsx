/**
 * Responsibility:
 * Shows a friendly recovery message after Google sign-in is cancelled,
 * expires, or fails, without exposing internal OAuth error codes.
 */

"use client";

import { useState } from "react";

type GoogleStatus = "cancelled" | "expired" | "failed";

type CreateAccountGoogleStatusNoticeProps = {
  status?: string;
};

const STATUS_MESSAGES: Record<GoogleStatus, string> = {
  cancelled: "Google sign-in was cancelled. You can try again when ready.",
  expired: "Your Google sign-in session expired. Please start again.",
  failed: "Google sign-in could not be completed. Please try again.",
};

function isGoogleStatus(value: string | undefined): value is GoogleStatus {
  return Boolean(value && value in STATUS_MESSAGES);
}

export default function CreateAccountGoogleStatusNotice({
  status,
}: CreateAccountGoogleStatusNoticeProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !isGoogleStatus(status)) {
    return null;
  }

  return (
    <div className="fixed left-1/2 top-4 z-[100] w-[calc(100%-32px)] max-w-[520px] -translate-x-1/2 rounded-xl border border-primary-02 bg-white px-4 py-3 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <p className="font-sans text-sm font-normal leading-[22px] text-primary-09">
          {STATUS_MESSAGES[status]}
        </p>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="shrink-0 border-0 bg-transparent p-0 font-sans text-sm font-medium text-primary-06 hover:text-primary-07"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
