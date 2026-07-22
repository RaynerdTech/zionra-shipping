/**
 * Responsibility:
 * Defines metadata and renders the authorized new-password step.
 */

import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Create a new password | Zionra",
  description: "Create a new password after secure code verification.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}