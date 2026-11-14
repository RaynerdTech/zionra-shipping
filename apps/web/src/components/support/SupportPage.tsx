"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { supportQuestions, supportResponsibilities, supportTopics } from "./supportContent";

function SupportIcon({ type, className = "h-6 w-6" }: { type: "parcel" | "chat" | "help" | "arrow" | "down" | "check" | "email" | "phone" | "clock"; className?: string }) {
  const paths: Record<typeof type, ReactNode> = {
    parcel: <><path d="M12 2.5 3.5 7v10L12 21.5 20.5 17V7L12 2.5Z" /><path d="M3.5 7 12 11.6 20.5 7M12 11.6v9.9" /></>,
    chat: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-2.8-.5l-4.6 1.5 1.5-4.3A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z" />,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4.9c0 1.9-2.7 2.4-2.7 4M12 17.2h.01"/></>,
    arrow: <path d="M2 12h20m-7-7 7 7-7 7" />,
    down: <path d="m5 9 7 7 7-7" />,
    check: <path d="m5 12 4 4L19 6" />,
    email: <><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3 7 9 6 9-6"/></>,
    phone: <><path d="M4.5 9H5a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-.5A2.5 2.5 0 0 1 2 14.5v-3A2.5 2.5 0 0 1 4.5 9Z"/><path d="M19.5 9H19a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h.5a2.5 2.5 0 0 0 2.5-2.5v-3A2.5 2.5 0 0 0 19.5 9Z"/><path d="M5 10V9a7 7 0 0 1 14 0v1M19 17v.5a3.5 3.5 0 0 1-3.5 3.5H13"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  };
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

const routeCards = [
  { title: "Track shipment", description: "Follow your parcel from the UK to Nigeria using your 11-digit tracking code.", action: "Track a parcel", href: routes.web.homeTrack, icon: "parcel" as const, className: "bg-primary-06 text-white", circle: "bg-white/20", button: "bg-white text-primary-06", order: "order-1" },
  { title: "FAQs", description: "Quick answers to the things customers ask most. Best for a fast check before you book.", action: "Read FAQs", href: "#faq", icon: "help" as const, className: "bg-primary-01 text-primary-10", circle: "bg-white text-primary-06", button: "bg-primary-10 text-white", order: "order-3 lg:order-2" },
  { title: "Contact us", description: "Talk to a person about a specific shipment, payment or agent. Best when something has gone wrong.", action: "Get in touch", href: "#contact", icon: "chat" as const, className: "bg-primary-10 text-white", circle: "bg-white/10", button: "bg-primary-06 text-white", order: "order-2 lg:order-3" },
];

const contacts = [
  { title: "Email", value: "support@zionra.com", detail: "Best for claims and anything needing photos or documents.", icon: "email" as const, href: "mailto:support@zionra.com" },
  { title: "Live chat", value: "Mon–Fri, 9am–6pm GMT", detail: "Fastest for a quick question about an active shipment.", icon: "chat" as const },
  { title: "Phone", value: "[PHONE NUMBER]", detail: "Mon–Fri, 9am–5pm GMT. For urgent delivery issues.", icon: "phone" as const },
];

export default function SupportPage() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  return (
    <main className="bg-neutral-01 pb-0 font-sans text-[#3E5775]">
      <section className="mx-auto max-w-[1324px] px-4 pt-12 sm:px-6 lg:pt-[72px]">
        <div className="mb-6 text-center lg:mb-9">
          <h1 className="font-display text-[32px] font-semibold leading-[34px] tracking-[-0.6px] text-primary-10 lg:text-[44px] lg:leading-[44px] lg:tracking-[-1px]">Where would you <span className="lg:hidden"><br /></span>like to go?</h1>
          <p className="mt-2 text-[15px] leading-6 lg:mt-1 lg:text-base">Three ways to get an answer, depending on what you need.</p>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {routeCards.map((card) => (
            <Link href={card.href} key={card.title} className={`group flex min-h-[245px] flex-1 flex-col gap-3 rounded-[20px] p-6 transition-transform hover:-translate-y-1 hover:shadow-xl lg:min-h-[264px] lg:p-8 ${card.className} ${card.order}`}>
              <span className={`flex h-12 w-12 items-center justify-center rounded-full lg:h-[52px] lg:w-[52px] ${card.circle}`}><SupportIcon type={card.icon} /></span>
              <h2 className="mt-1 font-display text-[22px] font-semibold leading-[30px] lg:mt-2 lg:text-2xl lg:leading-8">{card.title}</h2>
              <p className={`flex-1 text-[15px] leading-6 ${card.title === "Contact us" ? "text-text-on-dark-muted" : ""}`}>{card.description}</p>
              <div className="flex items-center justify-between gap-3 text-[15px] font-medium"><span>{card.action}</span><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${card.button}`}><SupportIcon type={card.title === "Track shipment" ? "arrow" : "down"} className="h-4 w-4" /></span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1324px] px-4 pt-12 sm:px-6 lg:pt-16">
        <h2 className="mb-6 text-center font-display text-[26px] font-semibold tracking-[-0.6px] text-primary-10 lg:mb-9 lg:text-[32px]">Browse by topic</h2>
        <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {supportTopics.map((topic) => (
            <a key={topic.title} href="#faq" className="group flex min-h-[76px] items-center justify-between gap-3 rounded-[14px] border border-neutral-03 bg-white p-4 transition-colors hover:border-primary-05 lg:min-h-[144px] lg:items-start lg:rounded-xl lg:p-5">
              <span className="flex flex-col"><strong className="font-display text-[15px] font-semibold leading-[22px] text-primary-10">{topic.title}</strong><span className="mt-1 text-[13px] leading-5 text-neutral-06">{topic.description}</span><span className="mt-1.5 text-xs font-medium text-primary-06 lg:mt-2.5">{topic.count}</span></span>
              <SupportIcon type="arrow" className="h-4 w-4 shrink-0 text-neutral-06 lg:hidden" />
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1324px] px-4 pt-12 sm:px-6 lg:pt-[72px]">
        <div className="mb-6 text-center lg:mb-9"><h2 className="font-display text-[26px] font-semibold tracking-[-0.6px] text-primary-10 lg:text-[32px]">Who handles what</h2><p className="mt-1 text-[15px] leading-6 lg:text-base">Zionra is a marketplace. Some things are ours, some belong to your agent.</p></div>
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {supportResponsibilities.map((group, index) => <div key={group.title} className={`rounded-[14px] border p-6 lg:p-7 ${index===0?"border-[#285082] bg-primary-10 text-white":"border-neutral-03 bg-white text-primary-10"}`}><h3 className="mb-3.5 font-display text-lg font-semibold">{group.title}</h3><ul className="space-y-2.5">{group.items.map(item=><li key={item} className={`flex items-start gap-2.5 text-sm leading-[22px] ${index===0?"text-text-on-dark-muted":"text-[#3E5775]"}`}><span className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${index===0?"bg-tertiary-06/20 text-tertiary-06":"bg-primary-01 text-primary-06"}`}><SupportIcon type="check" className="h-3 w-3"/></span>{item}</li>)}</ul></div>)}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[1324px] scroll-mt-24 px-4 pt-12 sm:px-6 lg:pt-[72px]">
        <h2 className="mb-6 text-center font-display text-[26px] font-semibold tracking-[-0.6px] text-primary-10 lg:mb-9 lg:text-[32px]">Top questions</h2>
        <div className="overflow-hidden rounded-[14px] border border-neutral-03 bg-white">
          {supportQuestions.map((item,index)=><div key={item.question} className={index>0?"border-t border-neutral-03":""}><h3><button type="button" aria-expanded={openQuestion===index} aria-controls={`support-answer-${index}`} onClick={()=>setOpenQuestion(openQuestion===index?null:index)} className="flex min-h-16 w-full items-start justify-between gap-3 p-4 text-left font-display text-[15px] font-semibold leading-[22px] text-primary-10 hover:bg-neutral-01 focus-visible:outline-2 focus-visible:outline-primary-06 lg:items-center lg:px-6 lg:py-5"><span>{item.question}</span><SupportIcon type="down" className={`mt-1 h-4 w-4 shrink-0 text-neutral-06 transition-transform lg:mt-0 ${openQuestion===index?"rotate-180":""}`}/></button></h3><div id={`support-answer-${index}`} hidden={openQuestion!==index} className="px-4 pb-5 text-sm leading-[22px] lg:px-6"><p className="max-w-[960px]">{item.answer}</p></div></div>)}
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-[1324px] scroll-mt-24 px-4 pb-14 pt-12 sm:px-6 lg:pb-20 lg:pt-[72px]">
        <div className="mb-6 text-center lg:mb-9"><h2 className="font-display text-[26px] font-semibold tracking-[-0.6px] text-primary-10 lg:text-[32px]">Still stuck?</h2><p className="mt-1 text-[15px] leading-6 lg:text-base">Have your tracking number ready — it gets you a useful answer far faster.</p></div>
        <div className="grid gap-3 lg:grid-cols-3 lg:gap-6">{contacts.map((contact)=><div key={contact.title} className="rounded-[14px] border border-neutral-03 bg-white p-5 lg:p-6"><span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-01 text-primary-06"><SupportIcon type={contact.icon} className="h-5 w-5"/></span><h3 className="font-display text-base font-semibold text-primary-10">{contact.title}</h3>{contact.href?<a href={contact.href} className="mt-1 block text-sm text-primary-06 underline-offset-2 hover:underline">{contact.value}</a>:<span className="mt-1 block text-sm text-primary-06">{contact.value}</span>}<p className="mt-2 text-[13px] leading-5 text-neutral-06">{contact.detail}</p></div>)}</div>
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-primary-03 bg-primary-02 p-4 text-sm leading-[22px] text-primary-10 lg:mt-6 lg:px-6"><SupportIcon type="clock" className="mt-0.5 h-5 w-5 shrink-0 text-primary-08"/><p>We reply to email within <strong>1 working day</strong>. Escalated agent cases are picked up within <strong>1 working day</strong> of escalation. We don’t currently offer weekend cover.</p></div>
      </section>
    </main>
  );
}
