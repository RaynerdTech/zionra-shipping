"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

type RouteNodeProps = {
  x: number;
  y: number;
  title: string;
  subtitle: string;
  origin?: boolean;
};

type RoutePulse = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
};

const BASE_WIDTH = 516;
const BASE_HEIGHT = 520;

const routePulses: RoutePulse[] = [
  { startX: 383, startY: 75, endX: 258, endY: 217, delay: 200 },
  { startX: 429, startY: 207, endX: 258, endY: 217, delay: 520 },
  { startX: 255, startY: 217, endX: 103, endY: 95, delay: 900 },
  { startX: 255, startY: 217, endX: 110, endY: 351, delay: 1150 },
  { startX: 255, startY: 217, endX: 379, endY: 355, delay: 1400 },
];

function HeroVisual() {
  const visualRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual) return;

    const pulses = Array.from(visual.querySelectorAll<HTMLElement>("[data-route-pulse]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animations: Animation[] = [];
    let wasInView = false;

    const resetPulses = () => {
      animations.forEach((animation) => animation.cancel());
      animations = [];
      pulses.forEach((pulse) => {
        pulse.style.opacity = "0";
      });
    };

    const playPulses = () => {
      resetPulses();
      if (reducedMotion.matches) return;

      animations = pulses.flatMap((pulse, index) => {
        const config = routePulses[index];
        if (!config) return [];

        const animation = pulse.animate(
          [
            {
              left: `${(config.startX / BASE_WIDTH) * 100}%`,
              top: `${(config.startY / BASE_HEIGHT) * 100}%`,
              opacity: 0,
            },
            {
              left: `${(config.startX / BASE_WIDTH) * 100}%`,
              top: `${(config.startY / BASE_HEIGHT) * 100}%`,
              opacity: 1,
              offset: 0.12,
            },
            {
              left: `${(config.endX / BASE_WIDTH) * 100}%`,
              top: `${(config.endY / BASE_HEIGHT) * 100}%`,
              opacity: 1,
              offset: 0.88,
            },
            {
              left: `${(config.endX / BASE_WIDTH) * 100}%`,
              top: `${(config.endY / BASE_HEIGHT) * 100}%`,
              opacity: 0,
            },
          ],
          {
            duration: 1400,
            delay: config.delay,
            easing: "cubic-bezier(.22,.61,.36,1)",
            fill: "forwards",
          },
        );

        return [animation];
      });
    };

    if (reducedMotion.matches) {
      resetPulses();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting && !wasInView) {
          wasInView = true;
          playPulses();
          return;
        }

        if (!entry.isIntersecting) {
          wasInView = false;
          resetPulses();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(visual);

    const handleMotionPreference = () => {
      if (reducedMotion.matches) {
        resetPulses();
      } else if (wasInView) {
        playPulses();
      }
    };

    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", handleMotionPreference);
      resetPulses();
    };
  }, []);

  return (
    <div ref={visualRef} className="relative aspect-[516/520] w-full max-w-[516px] text-white">
      <div className="absolute left-[-0.3876%] top-[-3.8462%] h-[100%] w-[100.7752%] rounded-full border border-white/[0.09]" />
      <div className="absolute left-[11.2403%] top-[7.6923%] h-[76.9231%] w-[77.5194%] rounded-full border border-white/[0.09]" />
      <div className="absolute left-[22.8682%] top-[19.2308%] h-[53.8462%] w-[54.2636%] rounded-full border border-tertiary-06/20" />
      <div className="absolute left-[32.9457%] top-[29.2308%] h-[33.8462%] w-[34.1085%] rounded-full border border-tertiary-06/25" />

      <svg
        className="absolute inset-0 h-full w-full text-white/20"
        viewBox={`0 0 ${BASE_WIDTH} ${BASE_HEIGHT}`}
        fill="none"
        aria-hidden="true"
      >
        <path d="M106 98 L258 220" stroke="currentColor" strokeWidth="1.25" strokeDasharray="4 5" />
        <path d="M386 78 L258 220" stroke="currentColor" strokeWidth="1.25" strokeDasharray="4 5" />
        <path d="M379 358 L258 220" stroke="currentColor" strokeWidth="1.25" strokeDasharray="4 5" />
        <path d="M110 354 L258 220" stroke="currentColor" strokeWidth="1.25" strokeDasharray="4 5" />
        <path d="M432 210 L258 220" stroke="currentColor" strokeWidth="1.25" strokeDasharray="4 5" />
        <path d="M66 218 L258 220" stroke="currentColor" strokeWidth="1.25" strokeDasharray="4 5" />
      </svg>

      <RouteNode x={86} y={72} title="Lagos" subtitle="Received" />
      <RouteNode x={366} y={52} title="London" subtitle="Origin" origin />
      <RouteNode x={359} y={332} title="Ibadan" subtitle="Received" />
      <RouteNode x={90} y={328} title="Abuja" subtitle="Received" />
      <RouteNode x={412} y={184} title="Glasgow" subtitle="Origin" origin />
      <RouteNode x={46} y={192} title="Port" subtitle="Harcourt" />

      {routePulses.map((pulse) => (
        <span
          key={`${pulse.startX}-${pulse.startY}-${pulse.delay}`}
          data-route-pulse
          aria-hidden="true"
          className="pointer-events-none absolute z-[2] h-[7px] w-[7px] rounded-full bg-tertiary-06 opacity-0 shadow-[0_0_10px_currentColor] text-tertiary-06 motion-reduce:hidden"
          style={{
            left: `${(pulse.startX / BASE_WIDTH) * 100}%`,
            top: `${(pulse.startY / BASE_HEIGHT) * 100}%`,
          }}
        />
      ))}

      <div className="absolute left-[43.0233%] top-[35.3846%] flex h-[13.8462%] w-[13.9535%] items-center justify-center rounded-full bg-gradient-to-br from-primary-06 to-primary-08 shadow-[0_0_0_10px_rgba(40,107,220,0.12),0_0_44px_rgba(40,107,220,0.45)]">
        <span className="font-display text-[30px] font-extrabold tracking-[-1px] text-white">
          Z
        </span>
        <span className="absolute right-[2px] top-[20px] h-[10px] w-[10px] rounded-full border-2 border-primary-10 bg-tertiary-06" />
      </div>
    </div>
  );
}

function RouteNode({ x, y, title, subtitle, origin = false }: RouteNodeProps) {
  const style: CSSProperties = {
    left: `${(x / BASE_WIDTH) * 100}%`,
    top: `${(y / BASE_HEIGHT) * 100}%`,
  };

  return (
    <div className="absolute flex items-start gap-2" style={style}>
      <span
        className={`mt-[14px] grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full ${
          origin ? "bg-primary-06/25" : "bg-tertiary-06/20"
        }`}
      >
        <span className={`h-[10px] w-[10px] rounded-full ${origin ? "bg-primary-05" : "bg-tertiary-06"}`} />
      </span>
      <span className="pt-[14px]">
        <strong className="block font-display text-[11px] font-semibold leading-4 text-white sm:text-[12px] lg:text-[13px]">
          {title}
        </strong>
        <span className="block font-sans text-[10px] leading-[15px] text-text-on-dark-muted/70 sm:text-[11px] lg:text-[12px]">
          {subtitle}
        </span>
      </span>
    </div>
  );
}

export default HeroVisual;
