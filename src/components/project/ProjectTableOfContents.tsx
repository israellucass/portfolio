"use client";

import { useCallback, useEffect, useState } from "react";
import type { GroupedHeadings, TocHeading } from "@/lib/project-headings";
import {
  getTocScrollOffsetPx,
  resolveActiveTocHeading,
  scrollToTocHeading,
} from "@/lib/toc-scroll";

type ProjectTableOfContentsProps = {
  grouped: GroupedHeadings;
  alwaysExpanded?: boolean;
  className?: string;
};

function TocLink({
  heading,
  isActive,
  onHeadingClick,
}: {
  heading: TocHeading;
  isActive: boolean;
  onHeadingClick: (id: string) => void;
}) {
  return (
    <li className="project-toc__item">
      <a
        href={`#${heading.id}`}
        className={`project-toc__link project-toc__link--level-${heading.level}${
          isActive ? " project-toc__link--active" : ""
        }`}
        onClick={(e) => {
          e.preventDefault();
          onHeadingClick(heading.id);
        }}
      >
        {heading.label}
      </a>
    </li>
  );
}

function TocPhaseGroupView({
  group,
  isExpanded,
  activeChildId,
  phaseIndex,
  onPhaseClick,
  onHeadingClick,
}: {
  group: { phase: TocHeading; children: TocHeading[] };
  isExpanded: boolean;
  activeChildId: string | null;
  phaseIndex: number;
  onPhaseClick: (id: string) => void;
  onHeadingClick: (id: string) => void;
}) {
  return (
    <li className="project-toc__item project-toc__phase-group">
      <button
        onClick={() => onPhaseClick(group.phase.id)}
        className={`project-toc__phase-btn project-toc__phase-btn--idx-${phaseIndex}${
          isExpanded ? " project-toc__phase-btn--expanded" : ""
        }`}
        aria-expanded={isExpanded}
      >
        <span className="project-toc__phase-chevron" aria-hidden>
          {isExpanded ? "▾" : "▸"}
        </span>
        <span>{group.phase.label}</span>
      </button>
      <div
        className={`project-toc__phase-children${
          isExpanded ? " project-toc__phase-children--open" : ""
        }`}
      >
        <ul className="project-toc__phase-links">
          {group.children.map((child) => (
            <TocLink
              key={child.id}
              heading={child}
              isActive={activeChildId === child.id}
              onHeadingClick={onHeadingClick}
            />
          ))}
        </ul>
      </div>
    </li>
  );
}

function TocFlatPhase({
  group,
  activeChildId,
  phaseIndex,
  onHeadingClick,
}: {
  group: { phase: TocHeading; children: TocHeading[] };
  activeChildId: string | null;
  phaseIndex: number;
  onHeadingClick: (id: string) => void;
}) {
  return (
    <li className="project-toc__item project-toc__phase-group">
      <span className={`project-toc__phase-label project-toc__phase-label--idx-${phaseIndex}`}>{group.phase.label}</span>
      <ul className="project-toc__phase-links">
        {group.children.map((child) => (
          <TocLink
            key={child.id}
            heading={child}
            isActive={activeChildId === child.id}
            onHeadingClick={onHeadingClick}
          />
        ))}
      </ul>
    </li>
  );
}

export function ProjectTableOfContents({
  grouped,
  alwaysExpanded = false,
  className = "",
}: ProjectTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);

  const allIds: string[] = [];
  for (const h of grouped.before) allIds.push(h.id);
  for (const g of grouped.phases) {
    for (const c of g.children) allIds.push(c.id);
  }
  for (const h of grouped.after) allIds.push(h.id);

  const findPhaseForChild = useCallback(
    (id: string): string | null => {
      for (const g of grouped.phases) {
        if (g.children.some((c) => c.id === id)) return g.phase.id;
      }
      return null;
    },
    [grouped.phases],
  );

  useEffect(() => {
    if (allIds.length === 0) return;

    let ticking = false;

    const updateActive = () => {
      const latestId = resolveActiveTocHeading(allIds, getTocScrollOffsetPx());

      if (latestId) {
        setActiveId(latestId);
        if (!alwaysExpanded) {
          const phaseId = findPhaseForChild(latestId);
          if (phaseId) {
            setExpandedPhaseId(phaseId);
          } else if (
            grouped.before.some((h) => h.id === latestId) ||
            grouped.after.some((h) => h.id === latestId)
          ) {
            setExpandedPhaseId(null);
          }
        }
      }
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check — run immediately then again after elements are guaranteed in DOM
    updateActive();
    const fallbackTimer = setTimeout(updateActive, 150);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(fallbackTimer);
    };
  }, [allIds, grouped, findPhaseForChild, alwaysExpanded]);

  const handleHeadingClick = useCallback((id: string) => {
    scrollToTocHeading(id);
  }, []);

  const handlePhaseClick = useCallback(
    (id: string) => {
      setExpandedPhaseId((current) => {
        const next = current === id ? null : id;
        return next;
      });
      scrollToTocHeading(id);
    },
    [],
  );

  if (allIds.length === 0) return null;

  const hasPhases = grouped.phases.length >= 2;

  return (
    <nav
      className={`project-toc ${className}`.trim()}
      aria-label="Table of contents"
    >
      <h2 className="project-toc__title">On this page</h2>
      <ul className="project-toc__list">
        {grouped.before.map((h) => (
          <TocLink
            key={h.id}
            heading={h}
            isActive={activeId === h.id}
            onHeadingClick={handleHeadingClick}
          />
        ))}

        {alwaysExpanded
          ? grouped.phases.map((g, idx) => (
              <TocFlatPhase
                key={g.phase.id}
                group={g}
                phaseIndex={idx}
                activeChildId={
                  activeId && g.children.some((c) => c.id === activeId)
                    ? activeId
                    : null
                }
                onHeadingClick={handleHeadingClick}
              />
            ))
          : hasPhases
            ? grouped.phases.map((g, idx) => (
                <TocPhaseGroupView
                  key={g.phase.id}
                  group={g}
                  phaseIndex={idx}
                  isExpanded={expandedPhaseId === g.phase.id}
                  activeChildId={
                    activeId && g.children.some((c) => c.id === activeId)
                      ? activeId
                      : null
                  }
                  onPhaseClick={handlePhaseClick}
                  onHeadingClick={handleHeadingClick}
                />
              ))
            : grouped.phases.map((g) => (
                <TocLink
                  key={g.phase.id}
                  heading={g.phase}
                  isActive={activeId === g.phase.id}
                  onHeadingClick={handleHeadingClick}
                />
              ))}

        {!hasPhases && !alwaysExpanded
          ? grouped.phases.flatMap((g) =>
              g.children.map((child) => (
                <TocLink
                  key={child.id}
                  heading={child}
                  isActive={activeId === child.id}
                  onHeadingClick={handleHeadingClick}
                />
              )),
            )
          : null}

        {grouped.after.map((h) => (
          <TocLink
            key={h.id}
            heading={h}
            isActive={activeId === h.id}
            onHeadingClick={handleHeadingClick}
          />
        ))}
      </ul>
    </nav>
  );
}
