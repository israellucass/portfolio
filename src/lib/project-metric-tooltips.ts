/** Plain-language definitions for case-study terms and metrics (hover tooltips). */
export const METRIC_TOOLTIPS: Readonly<Record<string, string>> = {
  "82% daily active usage":
    "Percentage of users who opened the app at least once on a typical workday.",
  "72% reduction":
    "How much less time each store data lookup took compared to the previous workflow.",
  "93% accuracy rate":
    "Share of spoken commands the system interpreted correctly on the first attempt.",
  "62.5% decrease":
    "How much less time the quality team spent running training sessions each week.",
  Wix: "A no-code website builder with hosting and online payments, often used by small businesses instead of a custom-built site.",
};

export function getMetricTooltip(label: string): string | undefined {
  const normalized = label.trim();
  return METRIC_TOOLTIPS[normalized];
}
