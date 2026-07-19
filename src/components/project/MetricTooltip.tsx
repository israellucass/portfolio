"use client";

import { useId } from "react";

type MetricTooltipProps = {
  label: string;
  description: string;
  className?: string;
  style?: React.CSSProperties;
};

export function MetricTooltip({
  label,
  description,
  className = "",
  style,
}: MetricTooltipProps) {
  const tooltipId = useId();

  return (
    <span className={`project-metric-tooltip${className ? ` ${className}` : ""}`}>
      <span
        tabIndex={0}
        className="project-metric-tooltip__term focus-ring rounded-sm"
        aria-describedby={tooltipId}
      >
        {label}
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className="project-metric-tooltip__panel"
      >
        {description}
      </span>
    </span>
  );
}
