/**
 * Responsibility:
 * Defines metadata and renders the customer login-code verification route.
 */

import type { Metadata } from "next";
import LoginVerificationCodeForm from "@/components/auth/LoginVerificationCodeForm";

export const metadata: Metadata = {
  title: "Verify your sign-in | Zionra",
  description: "Verify the code sent to your email to finish signing in.",
};

type LoginVerificationPageProps = {
  searchParams: Promise<{ returnTo?: string | string[] }>;
};

export default async function LoginVerificationPage({ searchParams }: LoginVerificationPageProps) {
  const params = await searchParams;
  const returnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  return <LoginVerificationCodeForm returnTo={returnTo ?? ""} />;
}