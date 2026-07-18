# Portfolio QA context

Use with visual/responsive/a11y/browser skills on this repo.

## Dev server

- `npm run dev` → [http://localhost:3000](http://localhost:3000)
- Run `npm run build` after structural UI changes

## Pages to check

| Route | What to verify |
|-------|----------------|
| `/` | Spotlight tile (16:9), gapped grid, label stripes (title/subtitle/tags) |
| `/ux` | Category grid, no spotlight |
| `/about` | Masthead, two-column tree, publications |
| `/cubo` (or any slug) | Project page, lightbox, scraped `.project-html` |
| `/keystatic` | Admin UI loads (metadata editing only) |

## Breakpoints (this repo)

| Range | Grid |
|-------|------|
| `<768px` | 2-column project grid, mobile nav drawer |
| `768–1023px` | 2-column grid |
| `≥1024px` | 3-column grid, full header nav |

CSS: [`src/styles/project.css`](../../src/styles/project.css), Tailwind in layout/header components.

## Fallback without browser MCP

If Cursor browser tools are unavailable:

1. `npm run build`
2. `curl -s http://localhost:3000/<route>` and grep for expected classes/text
3. Read changed TSX/CSS and reason about layout/a11y

## Design tokens

Read [`.cursor/skills/frontend-design/portfolio-context.md`](../frontend-design/portfolio-context.md) before judging visual parity.
