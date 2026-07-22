/**
 * Responsibility:
 * Defines metadata and renders the customer password-reset route.
 */

import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password | Zionra",
  description: "Reset a Zionra customer account password.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    email?: string | string[];
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;

  return <ResetPasswordForm email={email ?? ""} />;
}
