/** Plain-language definitions for highlighted case-study metrics (CUBO RESULTS). */
export const METRIC_TOOLTIPS: Readonly<Record<string, string>> = {
  "82% daily active usage":
    "Percentage of users who opened the app at least once on a typical workday.",
  "72% reduction":
    "How much less time each store data lookup took compared to the previous workflow.",
  "93% accuracy rate":
    "Share of spoken commands the system interpreted correctly on the first attempt.",
  "62.5% decrease":
    "How much less time the quality team spent running training sessions each week.",
};

export function getMetricTooltip(label: string): string | undefined {
  const normalized = label.trim();
  return METRIC_TOOLTIPS[normalized];
}
