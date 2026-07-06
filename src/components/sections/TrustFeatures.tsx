import type { ReactNode } from 'react'

type FeatureItem = {
  title: string
  description: string
  icon: ReactNode
  iconWrapClass: string
  iconClass: string
}

const featureItems: FeatureItem[] = [
  {
    title: 'Verified Shipping Agents',
    description: 'We work with reliable verified shipping agents',
    iconWrapClass: 'bg-zion-blue-soft',
    iconClass: 'text-zion-blue-light',
    icon: <VerifiedIcon />,
  },
  {
    title: 'Compare  Prices',
    description: 'Compare rates and save more',
    iconWrapClass: 'bg-zion-orange/25',
    iconClass: 'text-zion-orange',
    icon: <PriceIcon />,
  },
  {
    title: 'Real-time Tracking',
    description: 'Track every step of the way',
    iconWrapClass: 'bg-zion-teal/25',
    iconClass: 'text-zion-teal',
    icon: <TrackingIcon />,
  },
  {
    title: 'Safe & Secure',
    description: 'Protected & secure payment',
    iconWrapClass: 'bg-zion-green/20',
    iconClass: 'text-zion-green',
    icon: <SecureIcon />,
  },
  {
    title: '24/7 Support',
    description: 'Always here when you need us',
    iconWrapClass: 'bg-zion-blue-soft',
    iconClass: 'text-zion-blue-light',
    icon: <SupportIcon />,
  },
]

function TrustFeatures() {
  return (
    <section className="w-full bg-zion-bg">
      <div className="w-full lg:px-25">
        <div className="hidden min-h-[124px] grid-cols-5 md:grid">
          {featureItems.map((item, index) => (
            <FeatureCard
              key={item.title}
              item={item}
              desktop
              showDivider={index !== featureItems.length - 1}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 px-[22px] py-[16px] md:hidden">
          {featureItems.slice(0, 3).map((item) => (
            <FeatureCard key={item.title} item={item} mobile />
          ))}

          <div className="col-span-3 mt-[18px] flex items-start justify-center gap-[42px]">
            {featureItems.slice(3).map((item) => (
              <FeatureCard key={item.title} item={item} mobile />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  item,
  desktop = false,
  mobile = false,
  showDivider = false,
}: {
  item: FeatureItem
  desktop?: boolean
  mobile?: boolean
  showDivider?: boolean
}) {
  if (desktop) {
    return (
      <div className="relative flex min-h-[146px] items-center justify-center">
        <div className="w-[205px]">
          <div
            className={`flex h-[32px] w-[32px] items-center justify-center rounded-full ${item.iconWrapClass}`}
          >
            <span className={item.iconClass}>{item.icon}</span>
          </div>

          <h3 className="mt-[12px] font-sans text-[12px] lg:text-[14px] font-medium leading-none text-zion-white whitespace-nowrap">
            {item.title}
          </h3>

          <p className="mt-[8px] font-sans text-[10px] lg:text-[12px] font-light leading-[16px] text-zion-muted-2">
            {item.description}
          </p>
        </div>

        {showDivider && (
          <span className="absolute right-0 top-1/2 h-[92px] w-px -translate-y-1/2 bg-zion-border" />
        )}
      </div>
    )
  }

  if (mobile) {
    return (
      <div className="flex w-[92px] flex-col items-center text-center">
        <div
          className={`flex h-[28px] w-[28px] items-center justify-center rounded-full ${item.iconWrapClass}`}
        >
          <span className={item.iconClass}>{item.icon}</span>
        </div>

        <h3 className="mt-[10px] font-sans text-[12px] font-semibold text-zion-white">
          {item.title}
        </h3>
      </div>
    )
  }

  return null
}

function VerifiedIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 910.29 910.29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M873.206 202.06L871.994 173.55L843.608 170.635C734.572 159.437 640.835 118.748 581.398 86.586C516.299 51.36 476.838 18.312 476.476 18.007L455.165 0L433.84 17.981C433.448 18.311 393.987 51.36 328.889 86.585C269.452 118.747 175.716 159.436 66.68 170.634L38.293 173.549L37.081 202.059C36.864 207.163 32.304 328.757 79.14 475.996C106.777 562.883 146.689 640.732 197.767 707.392C261.906 791.093 343.715 857.072 440.922 903.494L455.143 910.287L469.364 903.494C566.571 857.072 648.381 791.096 712.519 707.392C763.598 640.734 803.51 562.882 831.147 475.997C877.982 328.759 873.423 207.165 873.206 202.06Z"
        stroke="currentColor"
        strokeWidth="55"
        strokeLinejoin="round"
      />
      <path
        d="M635.013 305.016L588.969 351.06L417.368 522.662L330.399 435.693L318.573 423.867L295.239 447.201L271.904 470.537L417.368 616L681.682 351.686L635.013 305.016Z"
        fill="currentColor"
      />
    </svg>
  )
}

function PriceIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M18 8.5V8.354C18 6.502 16.498 5 14.646 5H9.5C7.567 5 6 6.567 6 8.5C6 10.433 7.567 12 9.5 12H14.5C16.433 12 18 13.567 18 15.5C18 17.433 16.433 19 14.5 19H9.427C7.534 19 6 17.466 6 15.573V15.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrackingIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
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

function SecureIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.6456 43.2973H30.3544C33.3166 43.2973 36.0537 41.717 37.5348 39.1517L43.8892 28.1456C45.3703 25.5803 45.3703 22.4197 43.8892 19.8544L37.5348 8.8483C36.0537 6.283 33.3166 4.7027 30.3544 4.7027H17.6456C14.6834 4.7027 11.9463 6.283 10.4652 8.8483L4.1108 19.8544C2.6297 22.4197 2.6297 25.5803 4.1108 28.1456L10.4652 39.1517C11.9463 41.717 14.6834 43.2973 17.6456 43.2973Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="18.6033"
        cy="24"
        r="4.9355"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="34.3323"
        y1="24.0177"
        x2="23.5388"
        y2="24.0177"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="30.7154"
        y1="26.971"
        x2="30.7154"
        y2="24.0177"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SupportIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="14.4631"
        y="6"
        width="26.6485"
        height="22.2071"
        rx="2.6213"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30.9156 13.5747H9.51A2.6212 2.6212 0 0 0 6.8884 16.196V40.9494A1.0485 1.0485 0 0 0 8.6784 41.6908L14.5873 35.7819H30.9156A2.6212 2.6212 0 0 0 33.5369 33.1606V16.196A2.6212 2.6212 0 0 0 30.9156 13.5747Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default TrustFeatures