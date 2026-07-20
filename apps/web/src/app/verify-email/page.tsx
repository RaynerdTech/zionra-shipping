/**
 * Responsibility:
 * Defines metadata and passes the registration email and flow source to the
 * customer email-verification experience.
 */

import type { Metadata } from "next";
import EmailVerificationForm from "@/components/auth/EmailVerificationForm";

export const metadata: Metadata = {
  title: "Verify your email | Zionra",
  description: "Verify the email address connected to your Zionra account.",
};

type VerifyEmailPageProps = {
  searchParams: Promise<{
    email?: string | string[];
    source?: string | string[];
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const emailValue = Array.isArray(params.email)
    ? params.email[0]
    : params.email;
  const sourceValue = Array.isArray(params.source)
    ? params.source[0]
    : params.source;

  return (
    <EmailVerificationForm
      email={emailValue ?? ""}
      source={sourceValue}
    />
  );
}
