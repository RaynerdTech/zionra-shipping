/**
 * Responsibility:
 * Defines metadata and renders the password-reset code verification step.
 */

import type { Metadata } from "next";
import VerifyPasswordResetCodeForm from "@/components/auth/VerifyPasswordResetCodeForm";

export const metadata: Metadata = {
  title: "Verify reset code | Zionra",
  description: "Verify the secure code sent for Zionra password recovery.",
};

type VerifyPasswordResetPageProps = {
  searchParams: Promise<{
    email?: string | string[];
  }>;
};

export default async function VerifyPasswordResetPage({
  searchParams,
}: VerifyPasswordResetPageProps) {
  const params = await searchParams;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;

  return <VerifyPasswordResetCodeForm email={email ?? ""} />;
}