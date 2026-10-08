"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

type RevealVariant = "fade" | "fade-up" | "blur-up" | "scale";

type HomepageRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
};

const hiddenClasses: Record<RevealVariant, string> = {
  fade: "opacity-0",
  "fade-up": "translate-y-7 opacity-0",
  "blur-up": "translate-y-7 opacity-0 blur-[6px]",
  scale: "scale-[0.96] opacity-0",
};

export default function HomepageReveal({
  children,
  className = "",
  delay = 0,
  variant = "fade-up",
}: HomepageRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties = { transitionDelay: `${delay}ms` };

  return (
    <div
      ref={ref}
      style={style}
      className={`transition-[opacity,transform,filter] duration-700 ease-out motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:blur-none ${
        visible ? "translate-y-0 scale-100 opacity-100 blur-none" : hiddenClasses[variant]
      } ${className}`}
    >
      {children}
    </div>
  );
}
