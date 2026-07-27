import type { Metadata } from "next";
import PartnerApplicationSubmitted from "@/components/partner-application/PartnerApplicationSubmitted";

export const metadata: Metadata = { title: "Application submitted | Zionra", description: "Your Zionra shipping-partner application has been submitted." };
export default function Page() { return <PartnerApplicationSubmitted />; }
