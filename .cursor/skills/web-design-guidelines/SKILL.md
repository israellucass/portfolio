---
name: web-design-guidelines
description: Review this portfolio's UI against Vercel Web Interface Guidelines — a11y, UX, performance. Use when asked to audit design, accessibility, or UX of components you authored.
metadata:
  author: vercel
  version: "1.0.0"
---

# Web Interface Guidelines (portfolio)

Review **new UI** (Tailwind components, layout, grid) for guideline compliance. Read [../frontend-design/portfolio-context.md](../frontend-design/portfolio-context.md) first — Adobe parity and token choices override generic “redesign” suggestions.

Do not rewrite `.project-html` scraped blocks to Tailwind.

## How it works

1. Fetch latest rules:

   ```
   https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
   ```

2. Read the files under review (typical set):
   - `src/components/project/ProjectCover.tsx`
   - `src/components/project/ProjectGrid.tsx`
   - `src/components/layout/Header.tsx`
   - `src/app/globals.css`
   - `src/styles/project.css` (cover stripe + focus/lightbox only)

3. Apply fetched rules; output findings in the terse `file:line` format from the guidelines.

## When to use

- After grid, typography, or header changes
- User asks to “review UI”, “check accessibility”, or “audit UX”
