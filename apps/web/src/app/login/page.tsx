/**
 * Responsibility:
 * Defines metadata and prepares URL feedback for the customer login route.
 */

import type { Metadata } from "next";
import CustomerLoginForm from "@/components/auth/CustomerLoginForm";

export const metadata: Metadata = {
  title: "Customer login | Zionra",
  description: "Sign in to your Zionra customer account.",
};

type LoginPageProps = {
  searchParams: Promise<{
    verified?: string | string[];
    email?: string | string[];
  }>;
};

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const verified = firstQueryValue(params.verified);
  const email = firstQueryValue(params.email) ?? "";

  return (
    <CustomerLoginForm
      initialEmail={email}
      wasVerified={verified === "1"}
    />
  );
}
