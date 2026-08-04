/**
 * Responsibility:
 * Returns users to the known previous screen for the current Zionra auth flow.
 * Deterministic replacement prevents cancelled verification screens from being
 * reopened by stale browser-history entries.
 */

"use client";

import { useRouter } from "next/navigation";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type AuthBackButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "onClick" | "children"
> & {
  fallbackHref: string;
  children: ReactNode;
};

export default function AuthBackButton({
  fallbackHref,
  children,
  ...buttonProps
}: AuthBackButtonProps) {
  const router = useRouter();

  function goBack() {
    router.replace(fallbackHref);
  }

  return (
    <button type="button" onClick={goBack} {...buttonProps}>
      {children}
    </button>
  );
}
