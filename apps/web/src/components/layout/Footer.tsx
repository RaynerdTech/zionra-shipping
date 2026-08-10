import type { ReactNode } from "react";
import Link from "next/link";

import { routes } from "@/config/routes";
import HomepageReveal from "@/components/sections/HomepageReveal";

const logoZionra = "/images/logo-zionra.png";

type FooterItem = {
  label: string;
  href?: string;
};

type FooterGroup = {
  title: string;
  items: FooterItem[];
};

const groups: FooterGroup[] = [
  {
    title: "Company",
    items: [
      { label: "How it works", href: routes.web.homeHowItWorks },
      { label: "About us" },
    ],
  },
  {
    title: "Services",
    items: [
      { label: "Get a quote", href: routes.web.homeQuote },
      { label: "Track Shipment", href: routes.web.homeTrack },
      { label: "Become an Agent", href: routes.web.partnerApplication },
    ],
  },
  {
    title: "Support",
    items: [{ label: "Help center" }, { label: "Contact Us" }, { label: "FAQs" }],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy Policy", href: routes.web.privacy },
      { label: "Terms of service", href: routes.web.terms },
      { label: "Cookie Policy" },
    ],
  },
];

function Footer() {
  return (
    <footer className="bg-primary-10 px-5 py-10 font-sans text-text-on-dark-muted sm:px-8 lg:px-10 xl:px-20">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 lg:grid-cols-[178px_minmax(0,1fr)_220px] lg:gap-16">
        <HomepageReveal>
          <div>
            <Link href={routes.web.home} className="inline-flex flex-col items-start">
              <span className="flex items-center gap-2">
                <img src={logoZionra} alt="Zionra" className="h-[30px] w-auto" />
                <span className="font-display text-[15px] font-bold text-white">Zionra</span>
              </span>
            </Link>
            <p className="mt-4 max-w-[178px] font-display text-[13px] leading-5 text-text-on-dark-muted">Ship smarter. Every time.</p>
          </div>
        </HomepageReveal>

        <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4 lg:gap-x-12">
          {groups.map((group, index) => (
            <HomepageReveal key={group.title} delay={index * 70}>
              <FooterColumn group={group} />
            </HomepageReveal>
          ))}
        </div>

        <HomepageReveal delay={280}>
          <div className="lg:ml-auto">
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <SocialItem icon={<XIcon />} label="Twitter/X" />
              <SocialItem icon={<InstagramIcon />} label="Instagram" />
              <SocialItem icon={<LinkedInIcon />} label="Linkedin" />
            </div>
            <p className="mt-6 font-display text-[10px] leading-4 text-text-on-dark-muted lg:text-right">© 2025 Zionra Ltd. All rights reserved.</p>
          </div>
        </HomepageReveal>
      </div>
    </footer>
  );
}

function FooterColumn({ group }: { group: FooterGroup }) {
  return (
    <div>
      <h2 className="font-display text-[12px] font-semibold leading-[15px] text-white">{group.title}</h2>
      <ul className="mt-3 space-y-1">
        {group.items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <Link href={item.href} className="flex min-h-[40px] items-center text-[14px] leading-[22px] text-text-on-dark-muted transition hover:translate-x-0.5 hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span className="flex min-h-[40px] items-center text-[14px] leading-[22px] text-text-on-dark-muted">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex min-w-[58px] flex-col items-center gap-1 text-text-on-dark-muted">
      <span className="h-6 w-6">{icon}</span>
      <span className="text-[13px] leading-[20px]">{label}</span>
    </div>
  );
}

function XIcon() {
  return <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true"><path d="M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.1L4.7 21H1.5l7.5-8.6L1.2 3h6.6l4.5 5.6L17.5 3Zm-1.1 16.1h1.8L7.7 4.8H5.8l10.6 14.3Z" /></svg>;
}

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1Zm0 3.2a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2Zm0 10.9a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6Zm8.4-11.2a1.55 1.55 0 1 1-3.1 0 1.55 1.55 0 0 1 3.1 0Z" /></svg>;
}

function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.06c.53-1 1.83-2.06 3.76-2.06C21.5 8.64 22 11 22 14.2V21h-4v-6c0-1.43-.03-3.27-2-3.27-2 0-2.3 1.56-2.3 3.17V21h-4V9Z" /></svg>;
}

export default Footer;
