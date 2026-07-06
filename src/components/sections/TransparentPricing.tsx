type PricingPlan = {
  name: string
  price: string
  time: string
  priceClass: string
  borderClass: string
  badge?: string
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Economy',
    price: '£2.50 – £4.00 /kg',
    time: '14–21 days',
    priceClass: 'text-zion-green',
    borderClass: 'border-zion-teal/40 border-t-zion-teal',
  },
  {
    name: 'Standard',
    price: '£4.00 – £6.50 /kg',
    time: '7–14 days',
    priceClass: 'text-secondarybutton',
    borderClass: 'border-secondarybutton/40 border-t-secondarybutton',
    badge: 'Most popular',
  },
  {
    name: 'Express',
    price: '£7.00+ /kg',
    time: '3–7 days',
    priceClass: 'text-zion-orange',
    borderClass: 'border-zion-orange/50 border-t-zion-orange',
  },
]

function TransparentPricing() {
  return (
    <section className="w-full bg-zion-muted-2/15">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-[26px] pt-[36px] sm:px-6 md:pb-[42px] md:pt-[42px] lg:px-[24px] lg:pb-[50px] lg:pt-[50px]">
        <div>
          <h2 className="font-sans text-[24px] font-bold leading-[1.08] tracking-[-0.5px] text-zion-bg lg:text-[40px] lg:tracking-[-1.5px]">
            Transparent pricing, always
          </h2>

          <p className="mt-[10px] font-sans text-[14px] font-light leading-[1.45] text-navlink-dimblue/80 lg:text-[18px]">
            No hidden fees. See your exact price before you pay.
          </p>
        </div>

        <div className="mt-[22px] grid grid-cols-1 gap-[16px] lg:mt-[30px] lg:grid-cols-3 lg:gap-[30px]">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        <p className="mt-[24px] font-sans text-[13px] font-light leading-[1.5] text-navlink-dimblue/75 lg:mt-[20px] lg:text-[14px]">
          * Final price calculated from actual weight, dimensions and destination. Get a quote above.
        </p>
      </div>
    </section>
  )
}

function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <article
      className={`relative min-w-0 rounded-b-[12px] border border-t-[4px] bg-zion-white px-[16px] pb-[18px] pt-[16px] ${plan.borderClass} lg:min-h-[145px] lg:px-[22px] lg:pb-[18px] lg:pt-[22px]`}
    >
      {plan.badge ? (
        <div className="absolute right-[12px] top-[12px] inline-flex h-[22px] items-center justify-center rounded-full bg-secondarybutton px-[12px] font-sans text-[12px] font-light leading-none text-zion-white lg:right-[30px] lg:top-[14px] lg:h-[23px] lg:px-[13px] lg:text-[13px]">
          {plan.badge}
        </div>
      ) : null}

      <h3 className="font-sans text-[20px] font-bold leading-none text-zion-bg lg:text-[21px]">
        {plan.name}
      </h3>

      <p
        className={`mt-[14px] font-sans text-[24px] font-bold leading-none tracking-[-0.3px] ${plan.priceClass} lg:text-[26px]`}
      >
        {plan.price}
      </p>

      <div className="mt-[14px] flex items-center gap-[8px] font-sans text-[14px] font-light leading-none text-navlink-dimblue/80 lg:text-[15px]">
        <span className="shrink-0 text-navlink-dimblue/60">
          <ClockIcon />
        </span>
        <span>{plan.time}</span>
      </div>

      <p className="mt-[9px] font-sans text-[12px] font-light leading-none text-navlink-dimblue/70 lg:text-[13px]">
        Estimated transit time
      </p>
    </article>
  )
}

function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-[15px] w-[15px]"
    >
      <path
        d="M30.7241 21.716L21.4633 30.9768L17.0959 26.6094"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="24.0561"
        cy="26.186"
        r="16.216"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="24.1831"
        cy="26.144"
        r="12.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M39.6231 15.488L42.1516 12.638L33.8135 5.5975L31.359 8.512L39.6231 15.488Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.3767 15.488L5.8482 12.638L14.1863 5.5975L16.6408 8.512L8.3767 15.488Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default TransparentPricing