/**
 * Responsibility:
 * Defines metadata and renders the protected customer dashboard placeholder.
 */

import type { Metadata } from "next";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Customer dashboard | Zionra",
  description: "View your Zionra customer account.",
};

export default function CustomerDashboardPage() {
  return (
    <>
      <Header />
      <CustomerDashboard />
    </>
  );
}
