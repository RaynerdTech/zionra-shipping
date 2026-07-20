/**
 * Responsibility:
 * Renders the Zionra account-type selection route.
 * Interactive selection behaviour is handled by AccountTypeSelector.
 */

import type { Metadata } from "next";
import AccountTypeSelector from "@/components/auth/AccountTypeSelector";

export const metadata: Metadata = {
  title: "Choose your account type | Zionra",
  description:
    "Choose whether to continue as a Zionra customer or shipping partner.",
};

export default function GetStartedPage() {
  return <AccountTypeSelector />;
}
