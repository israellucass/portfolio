"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ProjectPhase } from "@/lib/project-phases";

type ProjectPhaseStickyNavProps = {
  phases: ProjectPhase[];
  endBeforeBlockIndex: number | null;
};

function getHeaderHeightPx(): number {
  const headerHeight = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height")
    .trim();
  const parsed = Number.parseFloat(headerHeight);
  return Number.isFinite(parsed) ? parsed * 16 : 56;
}

function getSiteHeaderOffsetPx(): number {
  const offset = getComputedStyle(document.documentElement)
    .getPropertyValue("--site-header-offset")
    .trim();
  const parsed = Number.parseFloat(offset);
  return Number.isFinite(parsed) ? parsed : getHeaderHeightPx();
}

function getScrollOffset(): number {
  return getSiteHeaderOffsetPx() + 12;
}

function getPhaseHeading(phaseId: string): HTMLElement | null {
  return document.querySelector(
    `#project-phase-${phaseId} .project-phase-heading`,
  );
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function animateStickyFromHeading(
  source: HTMLElement,
  target: HTMLElement,
): void {
  if (prefersReducedMotion()) {
    target.style.transform = "";
    target.style.opacity = "1";
    source.classList.add("project-phase-heading--handoff");
    source.setAttribute("aria-hidden", "true");
    return;
  }

  const sourceRect = source.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  if (sourceRect.width === 0 || targetRect.height === 0) {
    return;
  }

  const scale = Math.max(sourceRect.height / targetRect.height, 1);
  const deltaX =
    sourceRect.left +
    sourceRect.width / 2 -
    (targetRect.left + targetRect.width / 2);
  const deltaY = sourceRect.top - targetRect.top;

  source.classList.add("project-phase-heading--handoff");
  source.setAttribute("aria-hidden", "true");

  target.classList.remove("project-phase-sticky__inner--animating");
  target.style.transformOrigin = "top center";
  target.style.transition = "none";
  target.style.opacity = "1";
  target.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`;

  requestAnimationFrame(() => {
    target.classList.add("project-phase-sticky__inner--animating");
    target.style.transform = "translate3d(0, 0, 0) scale(1)";
  });

  const handleTransitionEnd = (event: TransitionEvent) => {
    if (event.propertyName !== "transform" || event.target !== target) {
      return;
    }

    target.removeEventListener("transitionend", handleTransitionEnd);
    target.classList.remove("project-phase-sticky__inner--animating");
    target.style.transform = "";
    target.style.transition = "";
    target.style.transformOrigin = "";
  };

  target.addEventListener("transitionend", handleTransitionEnd);
}

function updateHeadingHandoff(
  phases: ProjectPhase[],
  activePhase: ProjectPhase | null,
): void {
  const handoffTop = getSiteHeaderOffsetPx();

  for (const phase of phases) {
    const heading = getPhaseHeading(phase.id);
    if (!heading) {
      continue;
    }

    const shouldHandoff =
      activePhase?.id === phase.id &&
      heading.getBoundingClientRect().top < handoffTop;

    heading.classList.toggle("project-phase-heading--handoff", shouldHandoff);
    if (shouldHandoff) {
      heading.setAttribute("aria-hidden", "true");
    } else {
      heading.removeAttribute("aria-hidden");
    }
  }
}

function normalizePhaseSubtitle(subtitle: string): string {
  return subtitle.replace(/^[\s–\-—]+/, "").trim();
}

function formatStickyPhaseLabel(phase: ProjectPhase): string {
  const subtitle = normalizePhaseSubtitle(phase.subtitle);
  return subtitle ? `${phase.label} - ${subtitle}` : phase.label;
}

export function ProjectPhaseStickyNav({
  phases,
  endBeforeBlockIndex,
}: ProjectPhaseStickyNavProps) {
  const [activePhase, setActivePhase] = useState<ProjectPhase | null>(null);
  const stickyInnerRef = useRef<HTMLDivElement>(null);
  const activePhaseIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (phases.length < 2) {
      return;
    }

    const handleScroll = () => {
      const scrollPos = window.scrollY + getScrollOffset();
      let active: ProjectPhase | null = null;

      for (const phase of phases) {
        const marker = document.getElementById(`project-phase-${phase.id}`);
        if (!marker) {
          continue;
        }

        const top = marker.getBoundingClientRect().top + window.scrollY;
        if (top <= scrollPos) {
          active = phase;
        }
      }

      if (active && endBeforeBlockIndex !== null) {
        const endMarker = document.getElementById("project-phase-sticky-end");
        if (endMarker) {
          const endTop = endMarker.getBoundingClientRect().top + window.scrollY;
          if (endTop <= scrollPos) {
            active = null;
          }
        }
      }

      setActivePhase(active);
      updateHeadingHandoff(phases, active);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      for (const phase of phases) {
        getPhaseHeading(phase.id)?.classList.remove("project-phase-heading--handoff");
      }
    };
  }, [phases, endBeforeBlockIndex]);

  useLayoutEffect(() => {
    if (!activePhase || !stickyInnerRef.current) {
      activePhaseIdRef.current = null;
      return;
    }

    const sourceHeading = getPhaseHeading(activePhase.id);
    if (!sourceHeading) {
      return;
    }

    if (activePhaseIdRef.current === activePhase.id) {
      return;
    }

    activePhaseIdRef.current = activePhase.id;
    animateStickyFromHeading(sourceHeading, stickyInnerRef.current);
  }, [activePhase]);

  if (!activePhase) {
    return null;
  }

  const stickyLabel = formatStickyPhaseLabel(activePhase);
  const stickySubtitle = normalizePhaseSubtitle(activePhase.subtitle);

  return (
    <div
      className="project-phase-sticky"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Current section: ${stickyLabel}`}
    >
      <div ref={stickyInnerRef} className="project-phase-sticky__inner">
        <p className="project-phase-sticky__line">
          <span className="project-phase-sticky__label">{activePhase.label}</span>
          {stickySubtitle ? (
            <span className="project-phase-sticky__subtitle">{stickySubtitle}</span>
          ) : null}
        </p>
      </div>
    </div>
  );
}
