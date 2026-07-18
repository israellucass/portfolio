---
name: verifying-in-browser
description: After UI or content-loader changes, start dev server and verify this portfolio renders — homepage, grid, Keystatic saves. Use proactively before calling UI work done.
---

# Verify in Browser

Proactively confirm the app works after changes. Read [../portfolio-qa-context.md](../portfolio-qa-context.md).

## Steps

1. Start or reuse `npm run dev` (background if needed).
2. Open `http://localhost:3000` (side panel if browser MCP supports it).
3. **Health check:** console errors, failed network requests, blank or broken layout.
4. **Changed surface** — navigate to the route you edited; re-check.
5. **Keystatic** — if metadata loader changed, spot-check `/` order/spotlight and one project title from `/keystatic` save.
6. **Verdict** — pass/fail with specific issues.

## Browser tools (when available)

`browser_navigate`, `browser_console_messages`, `browser_network_requests`, `browser_take_screenshot`, `browser_snapshot` + click/fill for nav/lightbox.

## Without browser MCP

`npm run build` + curl homepage for `cover-subtitle`, `project-cover--spotlight`, expected project titles.
