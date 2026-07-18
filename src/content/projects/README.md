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

## Refresh bodies from the live Adobe site

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
  "cover": "/images/covers/cubo.gif",
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
