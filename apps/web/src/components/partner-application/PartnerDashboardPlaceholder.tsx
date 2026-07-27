"use client";

import Image from "next/image";
import { ApplicationLoadError, ApplicationLoading } from "./PartnerApplicationUI";
import { usePartnerApplication } from "./usePartnerApplication";

export default function PartnerDashboardPlaceholder() {
  const { data, error, isLoading } = usePartnerApplication();
  if (isLoading || !data) return error ? <ApplicationLoadError message={error} /> : <ApplicationLoading />;

  return (
    <main className="min-h-screen bg-neutral-01 px-4 py-10 sm:px-6">
      <section className="mx-auto max-w-[760px] rounded-2xl border border-neutral-02 bg-white p-6 md:p-10">
        <div className="flex items-center gap-2"><Image src="/images/logo-zionra.png" alt="" width={28} height={28} className="h-7 w-7" /><span className="font-display text-xl font-bold text-primary-10">zionra</span></div>
        <h1 className="mt-8 font-display text-3xl font-semibold text-primary-10">Partner Dashboard</h1>
        <p className="mt-3 font-sans text-base leading-7 text-text-body-light">Your application has been received. This temporary dashboard will be replaced by the full partner workspace in the next dashboard phase.</p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-primary-01 p-4"><p className="font-sans text-xs text-neutral-06">Application status</p><p className="mt-1 font-display text-lg font-semibold text-primary-08">{data.partner.status.replaceAll("_", " ")}</p></div>
          <div className="rounded-xl bg-primary-01 p-4"><p className="font-sans text-xs text-neutral-06">Application reference</p><p className="mt-1 font-display text-lg font-semibold text-primary-08">{data.application.applicationReference ?? "Not submitted"}</p></div>
        </div>
      </section>
    </main>
  );
}
