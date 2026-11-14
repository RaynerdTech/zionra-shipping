import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SupportPage from "@/components/support/SupportPage";

export const metadata: Metadata = {
  title: "Support | Zionra",
  description: "Explore shipment tracking, common questions, contact options, and guidance for Zionra customers.",
};

export default function SupportRoute() {
  return <><Header /><SupportPage /><Footer /></>;
}
