/**
 * Responsibility:
 * Defines metadata and renders the customer forgot-password route.
 */

import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot your password? | Zionra",
  description: "Request a Zionra customer password-reset code.",
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
