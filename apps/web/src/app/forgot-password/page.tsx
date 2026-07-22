/**
 * Responsibility:
 * Defines metadata and renders the customer account-lookup step for password recovery.
 */

import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Find your account | Zionra",
  description: "Start secure recovery for a Zionra customer account.",
};

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    email?: string | string[];
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;

  return <ForgotPasswordForm initialEmail={email ?? ""} />;
}