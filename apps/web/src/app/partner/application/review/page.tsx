import type { Metadata } from "next";
import PartnerApplicationReview from "@/components/partner-application/PartnerApplicationReview";

export const metadata: Metadata = { title: "Review application | Zionra", description: "Review your Zionra shipping-partner application." };
export default function Page() { return <PartnerApplicationReview />; }
