import type { ReactNode } from 'react'

type Agent = {
  id: string
  initials: string
  name: string
  desktopName: string
  rating: string
  reviews: string
  transit: string
  accentClass: string
  cardClass: string
  buttonClass: string
}

const agents: Agent[] = [
  {
    id: 'quickship',
    initials: 'Q',
    name: 'QuickShip Lagos',
    desktopName: 'QuickS********',
    rating: '4.9',
    reviews: '312 reviews',
    transit: '7–10 days',
    accentClass: 'bg-secondarybutton',
    cardClass: 'border-zion-blue/25 border-t-zion-blue',
    buttonClass: 'border-zion-blue text-zion-blue hover:bg-zion-blue/5',
  },
  {
    id: 'nigeriaxpress',
    initials: 'N',
    name: 'NigeriaXpress',
    desktopName: 'Niger*********',
    rating: '4.8',
    reviews: '247 reviews',
    transit: '5–8 days',
    accentClass: 'bg-primarybutton',
    cardClass: 'border-zion-orange/30 border-t-zion-orange',
    buttonClass: 'border-zion-orange text-zion-orange hover:bg-zion-orange/5',
  },
  {
    id: 'saferoute',
    initials: 'S',
    name: 'SafeRoute Co.',
    desktopName: 'Safe***********',
    rating: '4.7',
    reviews: '198 reviews',
    transit: '10–14 days',
    accentClass: 'bg-zion-teal',
    cardClass: 'border-zion-teal/30 border-t-zion-teal',
    buttonClass: 'border-zion-teal text-zion-teal hover:bg-zion-teal/5',
  },
]

function TrustedVerifiedAgents() {
  return (
    <section className="w-full bg-zion-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-[26px] pt-[36px] sm:px-6 md:pb-[42px] md:pt-[42px] lg:px-[24px] lg:pb-[50px] lg:pt-[52px]">
        <div>
          <h2 className="font-sans text-[24px] font-bold leading-[1.05] tracking-[-0.5px] text-zion-bg lg:text-[40px] lg:tracking-[-1.5px]">
            Trusted Verified Agents
          </h2>

          <p className="mt-[10px] max-w-[720px] font-sans text-[14px] font-light leading-[1.55] text-navlink-dimblue/80 lg:text-[18px]">
            Every agent on Zionra is vetted, verified and rated by real customers
          </p>
        </div>

        <div className="mt-[18px] grid grid-cols-1 gap-[26px] lg:mt-[22px] lg:grid-cols-3 lg:gap-[24px]">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        <div className="mt-[32px] lg:mt-[24px]">
          <button
            type="button"
            className="zion-btn hidden bg-secondarybutton px-[24px] font-light text-zion-white lg:inline-flex"
          >
            Become a verified agent
          </button>

          <button
            type="button"
            className="zion-btn h-[42px] rounded-[8px] border border-zion-blue/25 bg-zion-white px-[22px] font-light text-zion-bg lg:hidden"
          >
            Become a verified agent
          </button>
        </div>
      </div>
    </section>
  )
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <article
      className={`min-w-0 rounded-b-[12px] border border-t-[4px] bg-zion-white px-[18px] pb-[18px] pt-[14px] ${agent.cardClass} lg:min-h-[158px] lg:px-[20px] lg:pb-[18px] lg:pt-[20px]`}
    >
      <div className="flex items-start justify-between gap-[16px]">
        <div className="flex min-w-0 items-start gap-[12px] lg:block">
          <div
            className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full font-sans text-[18px] font-semibold leading-none text-zion-white lg:h-[60px] lg:w-[60px] lg:text-[21px] ${agent.accentClass}`}
          >
            {agent.initials}
          </div>

          <div className="min-w-0 pt-[2px] lg:mt-[16px] lg:pt-0">
            <h3 className="font-sans text-[20px] font-bold leading-[1.15] text-zion-bg lg:hidden">
              {agent.name}
            </h3>

            <h3 className="hidden font-sans text-[16px] font-bold leading-none text-zion-bg lg:block">
              {agent.desktopName}
            </h3>

            <AgentMeta agent={agent} />
          </div>
        </div>

        <VerifiedPill />
      </div>

      <div className="mt-[18px] lg:hidden">
        <button
          type="button"
          className={`zion-btn h-[32px] rounded-[7px] border bg-zion-white px-[13px] text-[14px] font-light ${agent.buttonClass}`}
        >
          View profile →
        </button>
      </div>
    </article>
  )
}

function AgentMeta({ agent }: { agent: Agent }) {
  return (
    <>
      <div className="mt-[8px] flex min-w-0 items-center gap-[7px] font-sans text-[14px] font-light leading-none text-navlink-dimblue/75 lg:text-[13px]">
        <StarIcon />
        <span>{agent.rating}</span>
        <span>·</span>
        <span className="truncate">{agent.reviews}</span>
      </div>

      <div className="mt-[8px] flex min-w-0 items-center gap-[7px] font-sans text-[14px] font-light leading-none text-navlink-dimblue/75 lg:text-[13px]">
        <span className="shrink-0 text-navlink-dimblue/55">
          <TransitClockIcon />
        </span>
        <span className="truncate">Transit: {agent.transit}</span>
      </div>
    </>
  )
}

function VerifiedPill() {
  return (
    <div className="inline-flex h-[22px] shrink-0 items-center gap-[5px] rounded-full bg-zion-green/15 px-[10px] font-sans text-[12px] font-light leading-none text-zion-green">
      <span className="text-[11px]">✓</span>
      <span>Verified</span>
    </div>
  )
}

function StarIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0 text-navlink-dimblue/70"
    >
      <path d="M12 3.75L14.5489 8.91543L20.25 9.74342L16.125 13.7646L17.0983 19.4421L12 16.7616L6.90167 19.4421L7.875 13.7646L3.75 9.74342L9.45111 8.91543L12 3.75Z" />
    </svg>
  )
}

function TransitClockIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
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

export default TrustedVerifiedAgents