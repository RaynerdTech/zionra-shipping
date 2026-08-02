/**
 * Responsibility:
 * Returns users to the previous Zionra screen while providing a safe route
 * when the page was opened directly without usable browser history.
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
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button type="button" onClick={goBack} {...buttonProps}>
      {children}
    </button>
  );
}
