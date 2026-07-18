---
name: accessibility-auditing
description: Audit this portfolio for a11y — cover links, header/mobile nav, lightbox, focus rings. Use after interactive UI changes.
---

# Accessibility Auditing

Audit public pages using the accessibility tree and keyboard checks. Read [../portfolio-qa-context.md](../portfolio-qa-context.md).

## Focus areas (this repo)

| Area | Files | Checks |
|------|-------|--------|
| Project covers | `ProjectCover.tsx` | `aria-label` on link; decorative cover `alt=""`; visible `.focus-ring` |
| Header / mobile nav | `Header.tsx` | `aria-expanded`, Escape to close, focus trap reasonable |
| Lightbox | `project.css`, lightbox component | `role="dialog"`, `aria-modal`, Escape, keyboard nav |
| Scraped content | `.project-html` | Meaningful link text where possible |

## Audit checklist

- Buttons/links have accessible names
- Form controls labeled (Keystatic admin if in scope)
- Landmarks: header nav, main content
- Heading hierarchy on about/project mastheads
- Tab order logical; focus visible on interactive elements
- No `aria-hidden` on focusable content

## Browser tools (when available)

`browser_snapshot` for aria tree; Tab/Escape via browser keyboard simulation on `/`, mobile nav, and a project lightbox.

## Without browser MCP

Read component source for `aria-*`, `role`, `focus-ring`, keyboard handlers; fix gaps in code.
