---
name: vercel-react-best-practices
description: Apply Vercel React/Next.js performance rules to this portfolio when writing or refactoring components, data loading, or images. Triggers on ProjectCover, Header, page loaders, or bundle concerns.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# React best practices (portfolio)

Performance guide for this Next.js 16 App Router site. Full rule set: [Vercel agent-skills react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices).

Read [../frontend-design/portfolio-context.md](../frontend-design/portfolio-context.md) before refactors that change UX.

## Apply when

- Adding `"use client"` or new interactive components
- Changing `src/lib/projects.ts` or page data loading
- Tuning `next/image` on covers (GIF unoptimized, spotlight `priority`, `sizes`)
- Keystatic admin routes (`/keystatic`, API handler)

## Priority rules for this repo

1. **Server Components default** — keep `ProjectGrid`, `ProjectCover`, pages server-side unless hooks required.
2. **No request waterfalls** — parallelize independent reads in loaders; `projects.ts` reads JSON synchronously at request/build time (acceptable for static site).
3. **Bundle** — avoid heavy client libraries; no barrel imports that pull unused code.
4. **Images** — correct `sizes` on grid vs spotlight; `priority` only on homepage spotlight.
5. **Serialization** — pass minimal props from server to client components.

## Verify

Run `npm run build` after structural changes.
