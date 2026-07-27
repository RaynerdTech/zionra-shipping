import type { Metadata } from "next";
import PartnerDashboardPlaceholder from "@/components/partner-application/PartnerDashboardPlaceholder";

export const metadata: Metadata = { title: "Partner dashboard | Zionra", description: "View your Zionra partner application status." };
export default function Page() { return <PartnerDashboardPlaceholder />; }
