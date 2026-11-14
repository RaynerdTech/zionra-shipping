import type { ReactNode } from "react";
import { PartnerApplicationProvider } from "@/components/partner-application/PartnerApplicationProvider";

export default function PartnerApplicationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PartnerApplicationProvider>{children}</PartnerApplicationProvider>;
}
