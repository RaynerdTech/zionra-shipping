"use client";

import { useEffect, useRef } from "react";

const trackingLabels = ["Booked", "Picked up", "In transit", "Customs", "Done"];

function HomepageTrackingPreview() {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const preview = previewRef.current;
    const progress = progressRef.current;
    if (!preview || !progress) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation: Animation | null = null;
    let wasInView = false;

    const reset = () => {
      animation?.cancel();
      animation = null;
      progress.style.width = reducedMotion.matches ? "48%" : "0%";
    };

    const play = () => {
      animation?.cancel();

      if (reducedMotion.matches) {
        progress.style.width = "48%";
        return;
      }

      progress.style.width = "0%";
      animation = progress.animate(
        [{ width: "0%" }, { width: "48%" }],
        {
          duration: 1100,
          delay: 250,
          easing: "cubic-bezier(.22,.61,.36,1)",
          fill: "forwards",
        },
      );
    };

    reset();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting && !wasInView) {
          wasInView = true;
          play();
          return;
        }

        if (!entry.isIntersecting) {
          wasInView = false;
          reset();
        }
      },
      { threshold: 0.45 },
    );

    observer.observe(preview);

    const handleMotionPreference = () => {
      if (reducedMotion.matches) {
        reset();
      } else if (wasInView) {
        play();
      } else {
        progress.style.width = "0%";
      }
    };

    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", handleMotionPreference);
      animation?.cancel();
    };
  }, []);

  return (
    <div ref={previewRef} className="min-h-[120px] rounded-[8px] border border-primary-02 px-3 py-4">
      <div className="relative mx-auto max-w-[330px] pt-1">
        <div className="absolute left-[10%] right-[10%] top-[14px] h-[3px] rounded-full bg-neutral-03" />
        <div
          ref={progressRef}
          className="absolute left-[10%] top-[14px] h-[3px] w-0 rounded-full bg-primary-06 motion-reduce:w-[48%]"
        />
        <div className="relative grid grid-cols-5">
          {trackingLabels.map((label, index) => (
            <div key={label} className="flex flex-col items-center">
              <span className={`relative z-10 h-[22px] w-[22px] rounded-full ${index < 3 ? "bg-primary-06" : "bg-neutral-03"}`} />
              <span className={`mt-1.5 whitespace-nowrap text-center font-display text-[7px] ${index < 3 ? "text-primary-06" : "text-neutral-06"}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-6 flex h-[24px] max-w-[300px] items-center gap-2 rounded-[5px] bg-primary-02 px-2">
        <span className="h-[10px] w-[10px] shrink-0 rounded-full bg-primary-06" />
        <span className="truncate font-sans text-[8px] font-medium tracking-[1.3px] text-primary-10">Live ZNR-20480 · Manchester → Lagos</span>
      </div>
    </div>
  );
}

export default HomepageTrackingPreview;
