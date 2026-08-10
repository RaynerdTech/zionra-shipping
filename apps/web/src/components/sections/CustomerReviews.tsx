import HomepageReveal from "./HomepageReveal";

type Review = {
  id: string;
  avatar: string;
  name: string;
  route: string;
  text: string;
};

const reviews: Review[] = [
  {
    id: "funmi",
    avatar: "/images/homepage/testimonial-funmi.jpg",
    name: "Funmi K.",
    route: "Birmingham → Ibadan",
    text: "Love that I can see verified reviews before choosing. Feels completely trustworthy and transparent.",
  },
  {
    id: "emeka",
    avatar: "/images/homepage/testimonial-emeka.jpg",
    name: "Emeka B.",
    route: "Manchester → Abuja",
    text: "Booking took under 5 minutes. My packages arrived in 9 days — faster than expected. Brilliant.",
  },
  {
    id: "adaeze",
    avatar: "/images/homepage/testimonial-adaeze.jpg",
    name: "Adaeze O.",
    route: "London → Lagos",
    text: "Found an agent at half the price I used to pay. Tracking updates were spot on the whole way.",
  },
];

function CustomerReviews() {
  return (
    <section id="reviews" className="relative overflow-hidden bg-neutral-01 px-4 py-16 font-sans sm:px-6 md:py-20 lg:min-h-[680px] lg:px-8">
      <div className="pointer-events-none absolute -right-[190px] bottom-[-220px] h-[480px] w-[480px] rounded-full bg-tertiary-06/[0.06]" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-[-125px] h-[220px] w-[600px] -translate-x-1/2 rounded-full bg-secondary-06/[0.04]" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-[1272px] flex-col items-center">
        <HomepageReveal className="text-center">
          <h2 className="font-display text-[34px] font-bold leading-[44px] tracking-[-1px] text-primary-10 sm:text-[40px] sm:leading-[52px] sm:tracking-[-1.5px]">
            What our customers say
          </h2>
          <p className="mt-1 text-[16px] leading-[26px] text-text-body-light">Real reviews from real customers who’ve shipped with Zionra</p>
        </HomepageReveal>

        <div className="mt-12 grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-6">
          {reviews.map((review, index) => (
            <HomepageReveal key={review.id} delay={index * 90} className={index === 2 ? "md:col-span-2 lg:col-span-1" : ""}>
              <ReviewCard review={review} />
            </HomepageReveal>
          ))}
        </div>

        <HomepageReveal delay={240} className="mt-10">
          <TrustpilotBlock />
        </HomepageReveal>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="relative flex min-h-[212px] flex-col rounded-[12px] border border-neutral-03 bg-white px-5 pb-4 pt-3 transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(7,22,44,0.08)]">
      <span aria-hidden="true" className="font-display text-[40px] font-bold leading-none text-primary-06">“</span>
      <p className="mt-3 flex-1 text-[14px] leading-[22px] text-primary-10">{review.text}</p>
      <div className="mt-5 h-px w-full bg-neutral-03" />
      <div className="mt-3 flex items-center gap-2">
        <img src={review.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
        <div className="min-w-0">
          <h3 className="font-display text-[14px] font-bold leading-[22px] text-primary-10">{review.name}</h3>
          <p className="truncate text-[12px] leading-[18px] text-text-body-light">{review.route}</p>
        </div>
        <span className="ml-auto shrink-0 font-display text-[12px] tracking-[1px] text-secondary-06">★★★★★</span>
      </div>
    </article>
  );
}

function TrustpilotBlock() {
  return (
    <div className="flex w-full max-w-[350px] flex-col items-center gap-5">
      <div className="inline-flex h-[20px] items-center rounded-full border border-tertiary-06/35 bg-tertiary-01 px-3 font-display text-[11px] font-bold text-tertiary-07">★ Trustpilot</div>
      <div className="rounded-[16px] border border-neutral-03 bg-white px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-[10px] bg-tertiary-06 font-display text-[22px] font-bold text-white">★</div>
          <div>
            <strong className="block font-display text-[14px] font-bold text-primary-10">Trustpilot</strong>
            <span className="mt-1 inline-flex h-5 items-center gap-1 rounded-full bg-tertiary-10 px-2 text-[12px] text-white">✓ Verified</span>
          </div>
          <span className="h-12 w-px bg-neutral-03/60" />
          <div>
            <div className="font-display text-[18px] font-bold leading-none text-tertiary-06">★★★★★</div>
            <div className="mt-1 text-[14px] text-primary-10">0/5.0</div>
            <div className="text-[10px] text-text-body-light">0 reviews</div>
          </div>
        </div>
      </div>
      <button type="button" className="zion-btn zion-btn-sm zion-btn-ghost-blue min-w-[192px]">See our reviews</button>
    </div>
  );
}

export default CustomerReviews;
