# Projects content

Case-study bodies live here. Editable card metadata (titles, order, spotlight) is managed separately via Keystatic.

```
src/content/
  projects/
    index.json                 # slug manifest (scrape source of truth for which projects exist)
    cubo.json                  # blocks + fallback metadata
    ...
  project-meta/
    cubo.json                  # Keystatic-owned overlay (title, subtitle, tags, …)
  homepage.json                # Keystatic singleton (spotlight + homepage order)
```

At runtime, [`src/lib/projects.ts`](../../lib/projects.ts) loads each project JSON and **overlays** `project-meta/{slug}.json` when present. Homepage order/spotlight come from `homepage.json`.

## Edit in the admin UI

```bash
npm run dev
```

Open [http://localhost:3000/keystatic](http://localhost:3000/keystatic).

- **Homepage** — drag-reorder projects; pick the spotlight
- **Projects** — edit title, subtitle, year, tags, cover path, featured, categories

Do not point Keystatic at `projects/*.json` directly — saving would rewrite files and risk wiping `blocks`.

## Refresh bodies from the live site

```bash
python3 scripts/scrape.py
npm run migrate-richtext
```

Or: `npm run scrape`

Scrape updates `projects/*.json` (including blocks). Card copy in `project-meta/` is unchanged unless you re-extract:

```bash
npm run extract-project-meta
```

That overwrites meta + homepage from the current project JSON / index (use when you intentionally want scrape metadata to win).

## Project JSON shape (body file)

```json
{
  "slug": "cubo",
  "title": "CUBO",
  "year": "2020",
  "tags": "User Interface Design, User Research",
  "cover": "/images/covers/cubo.webp",
  "categories": ["featured", "ux"],
  "featured": true,
  "blocks": [
    { "type": "image", "src": "..." },
    {
      "type": "richtext",
      "paragraphs": [
        {
          "kind": "subheading",
          "inlines": [{ "text": "Moodboard", "marks": ["display", "bold"] }]
        },
        {
          "kind": "paragraph",
          "inlines": [{ "text": "Project description…" }]
        }
      ]
    },
    { "type": "embed", "src": "..." }
  ]
}
```

Blocks preserve the original page order (images and text interleaved).

## New UX case study (template)

Use the reusable UX template instead of copying an old project by hand:

```bash
npm run new:ux -- --slug my-project --title "My Project" --year 2026
```

That writes:

- `projects/{slug}.json` — body scaffold (fold → HMW → process → features → RESULTS → embed)
- `project-meta/{slug}.json` — Keystatic card/fold fields
- Registers the slug in `index.json`

Authoring guide + placeholder list: [`../templates/ux-case-study/GUIDE.md`](../templates/ux-case-study/GUIDE.md)  
Agent skill: [`.cursor/skills/ux-case-study/SKILL.md`](../../../.cursor/skills/ux-case-study/SKILL.md)

## Before publishing a project

Run the structure audit (tier detection + checklist):

```bash
npm run audit:projects
```

Fix any failing rules for that project’s tier. See [`.cursor/skills/frontend-design/portfolio-context.md`](../../.cursor/skills/frontend-design/portfolio-context.md) for the full universal / case study / creative / gallery checklists.

Reference routes: `/cubo` (UX), `/tutti-frutti-visual-identity` (creative), `/the-life-of-ratildo-flash-animation` (gallery).
