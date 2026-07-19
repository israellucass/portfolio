"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type ProjectRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms (CSS custom property) */
  delay?: number;
  id?: string;
  phaseId?: string;
  /** Skip scroll reveal — use for embeds and other above-the-fold/end-of-page content */
  eager?: boolean;
};

export function ProjectReveal({
  children,
  className = "",
  delay = 0,
  id,
  phaseId,
  eager = false,
}: ProjectRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (eager) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const reveal = () => {
      setVisible(true);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px 12% 0px" },
    );

    observer.observe(element);

    const rect = element.getBoundingClientRect();
    const nearDocumentBottom =
      document.documentElement.scrollHeight - (window.scrollY + rect.bottom) <
      96;

    if (rect.top < window.innerHeight * 0.92 || nearDocumentBottom) {
      reveal();
      observer.disconnect();
    }

    return () => {
      observer.disconnect();
    };
  }, [eager]);

  return (
    <div
      ref={ref}
      id={id}
      data-project-phase={phaseId}
      className={`project-reveal${visible ? " project-reveal--visible" : ""}${
        className ? ` ${className}` : ""
      }`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
