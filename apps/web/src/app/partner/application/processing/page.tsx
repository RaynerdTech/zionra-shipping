import type { Metadata } from "next";
import PartnerApplicationProcessing from "@/components/partner-application/PartnerApplicationProcessing";

export const metadata: Metadata = { title: "Submitting application | Zionra", description: "Zionra is processing your shipping-partner application." };
export default function Page() { return <PartnerApplicationProcessing />; }
