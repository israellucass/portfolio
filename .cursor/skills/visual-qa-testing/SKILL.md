---
name: visual-qa-testing
description: Visually QA this portfolio after UI changes — dev server, screenshots, console, network. Use on homepage grid, ProjectCover, header, category pages, or Keystatic admin.
---

# Visual QA

After UI changes, verify rendering in the browser. Read [../portfolio-qa-context.md](../portfolio-qa-context.md) for routes and breakpoints.

## Steps

1. **Dev server** — ensure `npm run dev` is running on port 3000.
2. **Navigate** — open the changed route (`/`, `/ux`, `/about`, a project slug, or `/keystatic`).
3. **Screenshot** — full page; check spotlight span, grid gaps, label stripes, typography (Playfair titles, Inter body/tags).
4. **Console** — flag errors (hydration, failed imports, React warnings).
5. **Network** — flag 4xx/5xx on images, fonts, API routes.
6. **Interact** — mobile nav, project cover links, lightbox on a project page if touched.
7. **Report** — what looks wrong vs portfolio-context tokens; list console/network issues.

## Browser tools (when available)

Use Cursor browser MCP: `browser_navigate`, `browser_take_screenshot`, `browser_console_messages`, `browser_network_requests`, `browser_snapshot` before clicks.

## Without browser MCP

Run `npm run build`, curl the route HTML, and inspect changed files in `src/components/` and `src/styles/project.css`.
