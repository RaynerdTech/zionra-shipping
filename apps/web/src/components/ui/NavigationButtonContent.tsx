/**
 * Responsibility:
 * Displays a navigation button label or the shared Zionra spinner while its
 * parent Next.js Link is completing navigation.
 */

"use client";

import { useLinkStatus } from "next/link";
import LoadingSpinner from "./LoadingSpinner";

type NavigationButtonContentProps = {
  label: string;
};

export default function NavigationButtonContent({
  label,
}: NavigationButtonContentProps) {
  const { pending } = useLinkStatus();

  if (!pending) {
    return <span>{label}</span>;
  }

  return (
    <>
      <LoadingSpinner />
      <span className="sr-only">Loading {label}</span>
    </>
  );
}
