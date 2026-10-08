import Link from "next/link";

import { routes } from "@/config/routes";
import HomepageReveal from "./HomepageReveal";

type Partner = {
  id: string;
  image: string;
  name: string;
  rating: string;
  reviews: string;
  transit: string;
};

const partners: Partner[] = [
  {
    id: "quickship",
    image: "/images/homepage/partner-quickship.jpg",
    name: "QuickShi****",
    rating: "4.9",
    reviews: "12 reviews",
    transit: "7–10 days",
  },
  {
    id: "nigeriaxpress",
    image: "/images/homepage/partner-nigeriaxpress.jpg",
    name: "NigeriaX****",
    rating: "4.8",
    reviews: "8 reviews",
    transit: "7–14 days",
  },
  {
    id: "saferoute",
    image: "/images/homepage/partner-saferoute.jpg",
    name: "SafeRou****",
    rating: "4.7",
    reviews: "4 reviews",
    transit: "10–14 days",
  },
];

function TrustedVerifiedAgents() {
  return (
    <section id="shipping-partners" className="relative overflow-hidden bg-white px-4 py-16 font-sans sm:px-6 md:py-20 lg:px-8 lg:py-24">
      <div className="relative mx-auto w-full max-w-[1277px]">
        <div className="relative max-w-[590px] py-3">
          <div className="pointer-events-none absolute bottom-0 left-[-80px] top-0 w-[660px] rounded-r-full bg-secondary-06/[0.04]" aria-hidden="true" />
          <HomepageReveal>
            <div className="relative">
              <h2 className="font-display text-[34px] font-bold leading-[44px] tracking-[-1px] text-primary-10 sm:text-[40px] sm:leading-[52px] sm:tracking-[-1.5px]">
                Verified shipping partnership
              </h2>
              <p className="mt-1 max-w-[530px] text-[16px] leading-[26px] text-neutral-06">
                Submit your application and become a Zionra Shipping Partner. Access a wide range of customers.
              </p>
            </div>
          </HomepageReveal>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {partners.map((partner, index) => (
            <HomepageReveal key={partner.id} delay={index * 90} className={index === 2 ? "md:col-span-2 lg:col-span-1" : ""}>
              <PartnerCard partner={partner} />
            </HomepageReveal>
          ))}
        </div>

        <HomepageReveal delay={240} className="mt-12 flex justify-center">
          <Link
            href={routes.web.partnerApplication}
            className="zion-btn zion-btn-md zion-btn-outline-blue min-w-[240px] px-5"
          >
            Become a shipping partner
          </Link>
        </HomepageReveal>
      </div>
    </section>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <article className="min-h-[186px] rounded-b-[16px] border border-neutral-04/50 bg-white px-6 py-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(7,22,44,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <img src={partner.image} alt="" className="h-12 w-12 rounded-full object-cover" />
          <div className="mt-5">
            <h3 className="font-display text-[16px] font-bold leading-[24px] text-primary-10">{partner.name}</h3>
            <p className="mt-1 text-[13px] leading-[18px] text-text-body-light">★ {partner.rating} · {partner.reviews}</p>
            <p className="mt-1 text-[13px] leading-[18px] text-text-body-light">◷ Transit: {partner.transit}</p>
          </div>
        </div>
        <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-tertiary-10 px-2 text-[12px] leading-[18px] text-white">✓ Verified</span>
      </div>
    </article>
  );
}

export default TrustedVerifiedAgents;
