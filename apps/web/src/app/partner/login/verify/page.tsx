import type { Metadata } from "next";
import LoginVerificationCodeForm from "@/components/auth/LoginVerificationCodeForm";

export const metadata: Metadata = {
  title: "Verify partner sign-in | Zionra",
  description: "Verify the code sent to your email to finish signing in.",
};

export default function PartnerLoginVerificationPage() {
  return <LoginVerificationCodeForm accountType="partner" />;
}
