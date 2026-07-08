import type { ReactNode } from "react";
import HeroVisual from "./HeroVisual";
const ellipse = "/images/Ellipse.svg";
const woman = "/images/woman.svg";
const man = "/images/man-smiling.svg";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary-10 font-sans text-neutral-05">
      {/* Dotted background only */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.05) 1.5px, transparent 1.5px)",
          backgroundSize: "82px 88px",
          backgroundPosition: "34px 34px",
        }}
      />

      {/* Mobile-only orbit visual */}
      <div className="pointer-events-none absolute inset-x-0 top-[200px] z-0 block h-[540px] overflow-hidden lg:hidden">
        <div className="absolute right-[-118px] top-0 h-[657px] w-[650px] origin-top-right scale-[0.72] opacity-100 sm:right-[-96px] sm:scale-[0.76]">
          <HeroVisual ambientOnly />
        </div>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[620px] max-w-[1440px] grid-cols-1 items-center px-[26px] pb-[0px] lg:min-h-[660px] lg:grid-cols-[560px_minmax(0,1fr)] lg:gap-x-8 lg:px-[36px] min-[1440px]:grid-cols-[560px_650px] min-[1440px]:justify-between">
        {/* Left column */}
        <div className="w-full">
          <div className="inline-flex items-center gap-2 rounded-[20px] border border-neutral-03 bg-primary-09 px-[16px] py-[8px] text-[14px] font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] lg:text-[12px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 5C18.8786 3.17002 15.6351 2 12 2C8.36494 2 5.12137 3.17002 3 5V11C3 19 12 22 12 22C12 22 21 19 21 11V5Z"
                stroke="#4A8EE7"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 13.4545C7 13.4545 8.45455 13.8182 9.54545 16C9.54545 16 13.5882 9.33333 17.1818 8"
                stroke="#4A8EE7"
                strokeWidth="1.09091"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="font-display text-[14px] font-normal leading-[18px] text-white">
              Fast. Secure. Reliable.
            </span>
          </div>

          <h1 className="mt-[18px] font-sans text-[40px] font-bold leading-[52px] tracking-[-1.5px] text-white md:text-[48px] lg:mt-5 lg:text-[72px] lg:leading-[80px] lg:tracking-[-2.5px] lg:whitespace-nowrap">
            Ship Smarter to
            <br />
            Nigeria with
            <br className="block lg:hidden" />{" "}
            <span className="text-secondary-06">Zionra</span>
          </h1>

          <p className="mt-[16px] max-w-[410px] font-display text-[16px] font-light leading-[26px] text-neutral-05 lg:mt-5 lg:max-w-[460px]">
            Compare verified shipping agents, book securely, and track every
            delivery from the UK to Nigeria.
          </p>

          <div className="mt-[34px] flex flex-col items-start gap-[12px] lg:mt-8 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-8 lg:gap-y-4">
            <Feature text="Trusted Agents" icon={<TrustedAgentsIcon />} />
            <Feature text="Real-time Tracking" icon={<TrackingIcon />} />
            <Feature text="Secure Payment" icon={<PaymentIcon />} />
          </div>

          <div className="mt-[44px] w-full max-w-[418px] rounded-[14px] border border-neutral-03 bg-primary-09 px-[14px] py-[12px] lg:mt-[88px] lg:max-w-[396px] lg:px-5 lg:py-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2.5">
                <img
                  src={man}
                  alt="Customer avatar"
                  className="h-[42px] w-[42px] rounded-full border-none object-cover lg:h-11 lg:w-11"
                />
                <img
                  src={woman}
                  alt="Customer avatar"
                  className="h-[42px] w-[42px] rounded-full border-none object-cover lg:h-11 lg:w-11"
                />
                <img
                  src={ellipse}
                  alt="Customer avatar"
                  className="h-[42px] w-[42px] rounded-full border-none object-cover lg:h-11 lg:w-11"
                />
              </div>

              <div className="min-w-0">
                <div className="mb-1.5 flex items-center gap-0.5 text-secondary-06">
                  <Star className="h-[16px] w-[16px] lg:h-[15px] lg:w-[15px]" />
                  <Star className="h-[16px] w-[16px] lg:h-[15px] lg:w-[15px]" />
                  <Star className="h-[16px] w-[16px] lg:h-[15px] lg:w-[15px]" />
                  <Star className="h-[16px] w-[16px] lg:h-[15px] lg:w-[15px]" />
                  <Star className="h-[16px] w-[16px] lg:h-[15px] lg:w-[15px]" />
                </div>

                <p className="font-display text-[12px] font-light leading-[18px] text-neutral-05">
                  Trusted by 10,000+ customers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop right column */}
        <div className="relative hidden w-full max-w-[585px] justify-self-end overflow-visible lg:block">
          <div className="relative aspect-[650/657] w-full">
            <div className="absolute right-0 top-0 h-[657px] w-[650px] origin-top-right scale-[0.4] min-[1100px]:scale-[0.48] min-[1180px]:scale-[0.6] min-[1260px]:scale-[0.7] min-[1360px]:scale-[0.82] min-[1440px]:scale-[0.9]">
              <HeroVisual />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ text, icon }: { text: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-[10px] lg:gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
        {icon}
      </span>

      <span className="text-[14px] font-light leading-[22px] text-neutral-05">
        {text}
      </span>
    </div>
  );
}

function TrustedAgentsIcon() {
  return (
    <>
      {/* Replace with Trusted Agents SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M21 5C18.8786 3.17002 15.6351 2 12 2C8.36494 2 5.12137 3.17002 3 5V11C3 19 12 22 12 22C12 22 21 19 21 11V5Z"
          stroke="#4A8EE7"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 13.4545C7 13.4545 8.45455 13.8182 9.54545 16C9.54545 16 13.5882 9.33333 17.1818 8"
          stroke="#4A8EE7"
          strokeWidth="1.09091"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
}

function TrackingIcon() {
  return (
    <>
      {/* Replace with Real-time Tracking SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M19 8.49817H21.5C19.7007 3.74918 14.497 0.998088 9.4604 2.34292C4.09599 3.77528 0.909632 9.25924 2.34347 14.5917C3.77732 19.9241 9.28839 23.0858 14.6528 21.6534C18.6358 20.5899 21.4181 17.2928 22 13.4826"
          stroke="#4A8EE7"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 7.99841V11.9984L14 13.9984"
          stroke="#4A8EE7"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
}

function PaymentIcon() {
  return (
    <>
      {/* Replace with Secure Payment SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M16.5 9V6.5C16.5 4.01472 14.4853 2 12 2C9.51472 2 7.5 4.01472 7.5 6.5V9"
          stroke="#4A8EE7"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.9999 9H6.00013C4.89548 9 4.00002 9.89554 4.00012 11.0002L4.00096 20.0002C4.00106 21.1047 4.89646 22 6.00096 22H17.9999C19.1045 22 19.9999 21.1046 19.9999 20V11C19.9999 9.89543 19.1045 9 17.9999 9Z"
          stroke="#4A8EE7"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12.125 15.5H12M12.25 15.5C12.25 15.6381 12.1381 15.75 12 15.75C11.8619 15.75 11.75 15.6381 11.75 15.5C11.75 15.3619 11.8619 15.25 12 15.25C12.1381 15.25 12.25 15.3619 12.25 15.5Z"
          stroke="#4A8EE7"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}

function Star({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2.5l2.91 5.89 6.5.94-4.7 4.58 1.11 6.47L12 17.32l-5.82 3.06 1.11-6.47-4.7-4.58 6.5-.94L12 2.5z" />
    </svg>
  );
}

export default Hero;
