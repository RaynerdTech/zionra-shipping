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

export default function LoginVerificationPage() {
  return <LoginVerificationCodeForm />;
}