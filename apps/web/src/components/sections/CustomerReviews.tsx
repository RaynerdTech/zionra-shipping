type Review = {
  id: string;
  quoteColorClass: string;
  avatarClass: string;
  initial: string;
  name: string;
  route: string;
  text: string;
};

const reviews: Review[] = [
  {
    id: "adeaze",
    quoteColorClass: "text-primary-06",
    avatarClass: "bg-primary-06",
    initial: "A",
    name: "Adeaze O.",
    route: "London → Lagos",
    text: "Found an agent at half the price I used to pay. Tracking updates were spot on the whole way.",
  },
  {
    id: "emeka",
    quoteColorClass: "text-secondary-06",
    avatarClass: "bg-secondary-06",
    initial: "E",
    name: "Emeka B.",
    route: "Manchester → Abuja",
    text: "Booking took under 5 minutes. My packages arrived in 9 days — faster than expected. Brilliant.",
  },
  {
    id: "funmi",
    quoteColorClass: "text-tertiary-06",
    avatarClass: "bg-tertiary-06",
    initial: "F",
    name: "Funmi K.",
    route: "Birmingham → Ibadan",
    text: "Love that I can see verified reviews before choosing. Feels completely trustworthy and transparent.",
  },
];

function CustomerReviews() {
  return (
    <section className="w-full text-white">
      <div className="mx-auto w-full max-w-[1440px] px-6 pb-[30px] pt-[36px] md:pb-[42px] md:pt-[42px] lg:px-[24px] lg:pb-[50px] lg:pt-[50px]">
        <div>
          <h2 className="font-sans text-[24px] font-bold leading-[1.08] tracking-[-0.5px] text-primary-10 lg:text-[40px] lg:tracking-[-1.5px]">
            What our customers say
          </h2>

          <p className="mt-[10px] max-w-[760px] font-sans text-[14px] font-light leading-[1.45] text-neutral-08/80 lg:text-[18px]">
            Real reviews from real customers who've shipped with Zionra
          </p>
        </div>

        <div className="mt-[18px] grid grid-cols-1 gap-[22px] lg:mt-[34px] lg:grid-cols-3 lg:gap-[30px]">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="min-w-0 rounded-[12px] border border-primary-06/20 bg-neutral-05/10 px-[16px] pb-[18px] pt-[8px] lg:min-h-[238px] lg:px-[18px] lg:pb-[20px] lg:pt-[10px]">
      <div
        className={`font-sans text-[34px] font-bold leading-none ${review.quoteColorClass}`}
        aria-hidden="true"
      >
        “
      </div>

      <p className="mt-[18px] min-h-[78px] font-sans text-[16px] font-light leading-[1.65] tracking-[0.1px] text-primary-10 lg:mt-[10px] lg:min-h-[86px] lg:text-[16px] lg:leading-[1.55]">
        {review.text}
      </p>

      <div className="mt-[18px] h-px w-full bg-primary-06/20 lg:mt-[24px]" />

      <div className="mt-[14px] flex items-center gap-[12px]">
        <div
          className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full font-sans text-[16px] font-semibold leading-none text-white lg:h-[42px] lg:w-[42px] ${review.avatarClass}`}
        >
          {review.initial}
        </div>

        <div className="min-w-0">
          <h3 className="font-sans text-[15px] font-bold leading-none text-primary-10 lg:text-[15px]">
            {review.name}
          </h3>

          <p className="mt-[6px] truncate font-sans text-[13px] font-light leading-none text-neutral-08/75 lg:text-[13px]">
            {review.route}
          </p>
        </div>

        <div className="ml-auto shrink-0 font-sans text-[15px] leading-none tracking-[2px] text-secondary-06">
          ★★★★★
        </div>
      </div>
    </article>
  );
}

export default CustomerReviews;
