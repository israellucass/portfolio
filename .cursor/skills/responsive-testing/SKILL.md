---
name: responsive-testing
description: Test this portfolio at mobile, tablet, and desktop widths — project grid, spotlight, header nav. Use after layout or project.css changes.
---

# Responsive Testing

Verify layout at standard breakpoints. Read [../portfolio-qa-context.md](../portfolio-qa-context.md).

## Viewports (prioritize for this repo)

| Width | Expect |
|-------|--------|
| 375px | 2-col grid, hamburger nav, readable stripes |
| 768px | 2-col grid, tighter stripe type |
| 1024px | 3-col grid, desktop nav visible |
| 1440px | Content capped at site max-width; grid padding 8% |

## Workflow

1. Open `/` and one category page (`/ux`).
2. At each width: screenshot + check for horizontal scroll, clipped titles, overlapping tags, broken spotlight aspect.
3. Test mobile nav open/close at `<1024px`.
4. Report PASS/WARN per viewport with file hints (`project.css`, `Header.tsx`, `ProjectCover.tsx`).

## Browser tools (when available)

Resize via browser MCP; screenshot each size; use aria snapshot for overflow/hidden content.

## Without browser MCP

Inspect `@media` rules in `src/styles/project.css` and Tailwind breakpoints in `Header.tsx`; run build to confirm no CSS errors.
