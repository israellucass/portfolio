"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type MetricTooltipProps = {
  label: string;
  description: string;
  className?: string;
  style?: React.CSSProperties;
};

type VerticalPlacement = "above" | "below";
type ArrowAlign = "left" | "middle" | "right";

type PanelCoords = {
  top: number;
  left: number;
  arrowLeft: number;
  vertical: VerticalPlacement;
  arrow: ArrowAlign;
};

const PANEL_MAX_WIDTH = 260;
const VIEWPORT_PAD = 12;
const GAP = 8;
/** Distance from panel edge to arrow center for left/right presets */
const ARROW_INSET = 16;

export function MetricTooltip({
  label,
  description,
  className = "",
  style,
}: MetricTooltipProps) {
  const tooltipId = useId();
  const termRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<PanelCoords | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chooseArrowAlign = (termRect: DOMRect): ArrowAlign => {
    const spaceLeft = termRect.left - VIEWPORT_PAD;
    const spaceRight = window.innerWidth - termRect.right - VIEWPORT_PAD;

    if (spaceRight > spaceLeft * 1.15) {
      return "left";
    }
    if (spaceLeft > spaceRight * 1.15) {
      return "right";
    }
    return "middle";
  };

  const tipXForAlign = (termRect: DOMRect, arrow: ArrowAlign): number => {
    const inset = Math.min(ARROW_INSET, Math.max(4, termRect.width / 2));
    switch (arrow) {
      case "left":
        return termRect.left + inset;
      case "right":
        return termRect.right - inset;
      default:
        return termRect.left + termRect.width / 2;
    }
  };

  const updatePosition = useCallback(() => {
    const term = termRef.current;
    const panel = panelRef.current;
    if (!term || !panel) {
      return;
    }

    const termRect = term.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const panelWidth = Math.min(
      PANEL_MAX_WIDTH,
      window.innerWidth - VIEWPORT_PAD * 2,
      panelRect.width > 0 ? panelRect.width : PANEL_MAX_WIDTH,
    );
    const panelHeight = panelRect.height > 0 ? panelRect.height : 72;

    const arrow = chooseArrowAlign(termRect);
    const tipX = tipXForAlign(termRect, arrow);

    let left: number;
    let arrowLeft: number;
    switch (arrow) {
      case "left":
        left = tipX - ARROW_INSET;
        arrowLeft = ARROW_INSET;
        break;
      case "right":
        left = tipX - panelWidth + ARROW_INSET;
        arrowLeft = panelWidth - ARROW_INSET;
        break;
      default:
        left = tipX - panelWidth / 2;
        arrowLeft = panelWidth / 2;
        break;
    }

    const minLeft = VIEWPORT_PAD;
    const maxLeft = window.innerWidth - panelWidth - VIEWPORT_PAD;
    const clampedLeft = Math.max(minLeft, Math.min(left, maxLeft));
    const shift = clampedLeft - left;
    left = clampedLeft;
    arrowLeft = Math.max(
      ARROW_INSET,
      Math.min(arrowLeft - shift, panelWidth - ARROW_INSET),
    );

    // Keep the arrow tip within the trigger’s horizontal bounds
    const tipMin = termRect.left + 2;
    const tipMax = termRect.right - 2;
    let tipAfterClamp = left + arrowLeft;
    if (tipAfterClamp < tipMin) {
      arrowLeft += tipMin - tipAfterClamp;
      tipAfterClamp = tipMin;
    } else if (tipAfterClamp > tipMax) {
      arrowLeft -= tipAfterClamp - tipMax;
    }
    arrowLeft = Math.max(
      8,
      Math.min(arrowLeft, panelWidth - 8),
    );

    const spaceAbove = termRect.top - VIEWPORT_PAD;
    const spaceBelow = window.innerHeight - termRect.bottom - VIEWPORT_PAD;
    const vertical: VerticalPlacement =
      spaceAbove >= panelHeight + GAP || spaceAbove >= spaceBelow
        ? "above"
        : "below";

    let top =
      vertical === "above"
        ? termRect.top - panelHeight - GAP
        : termRect.bottom + GAP;

    if (vertical === "above" && top < VIEWPORT_PAD) {
      top = VIEWPORT_PAD;
    }
    if (
      vertical === "below" &&
      top + panelHeight > window.innerHeight - VIEWPORT_PAD
    ) {
      top = Math.max(
        VIEWPORT_PAD,
        window.innerHeight - panelHeight - VIEWPORT_PAD,
      );
    }

    setCoords({
      top,
      left,
      arrowLeft,
      vertical,
      arrow,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();
    const handleReposition = () => {
      updatePosition();
    };

    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, updatePosition]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCoords(null);
  };

  return (
    <span
      className={`project-metric-tooltip${className ? ` ${className}` : ""}`}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={handleClose}
    >
      <span
        ref={termRef}
        tabIndex={0}
        className="project-metric-tooltip__term focus-ring rounded-sm"
        aria-describedby={open ? tooltipId : undefined}
        style={style}
      >
        {label}
      </span>
      {mounted
        ? createPortal(
            <span
              ref={panelRef}
              id={tooltipId}
              role="tooltip"
              className={[
                "project-metric-tooltip__panel",
                "project-metric-tooltip__panel--portal",
                open && coords ? "project-metric-tooltip__panel--visible" : "",
                coords?.vertical === "below"
                  ? "project-metric-tooltip__panel--below"
                  : "",
                coords ? `project-metric-tooltip__panel--arrow-${coords.arrow}` : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                coords
                  ? {
                      top: coords.top,
                      left: coords.left,
                      ["--tooltip-arrow-left" as string]: `${coords.arrowLeft}px`,
                    }
                  : {
                      // Measure off-screen before first paint of visible state
                      top: -9999,
                      left: -9999,
                      visibility: "hidden",
                    }
              }
            >
              {description}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
