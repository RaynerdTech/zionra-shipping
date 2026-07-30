import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Create a new partner password | Zionra",
  description: "Create a new password after secure partner code verification.",
};

export default function PartnerResetPasswordPage() {
  return <ResetPasswordForm accountType="partner" />;
}
