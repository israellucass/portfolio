import KeystaticApp from "./keystatic";

/**
 * Full-viewport Keystatic shell. Do not force a light background —
 * Keystatic's `kui-scheme--auto` follows the OS theme; a white overlay
 * with dark-scheme foreground fails WCAG contrast (e.g. #page-title).
 */
export default function KeystaticLayout() {
  return (
    <div className="keystatic-shell fixed inset-0 z-[100]">
      <KeystaticApp />
    </div>
  );
}
