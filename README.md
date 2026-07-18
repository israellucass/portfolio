# Israel Silva — Portfolio

A self-hosted replica of [isrrr.com](https://isrrr.com/), migrated from Adobe Portfolio to Next.js.

## What's included

- Homepage with featured projects grid
- Category pages: UX, Motion, Game design, Graphic design
- About page with bio and publications
- 17 individual project pages with images and embeds
- Responsive navigation with social links
- Static export-ready build (deploy anywhere)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Edit metadata at [http://localhost:3000/keystatic](http://localhost:3000/keystatic) (order, spotlight, titles, subtitles).

**Agent skills** (`.cursor/skills/`): `frontend-design`, `web-design-guidelines`, `react-best-practices`, `visual-qa-testing`, `responsive-testing`, `accessibility-auditing`, `verifying-in-browser` — see `.cursor/rules/front-end-cursor-rules.mdc`.

### Content admin (Keystatic)

Edit homepage order, spotlight, titles, subtitles, tags, and featured flags without hand-editing JSON:

1. `npm run dev`
2. Open [http://localhost:3000/keystatic](http://localhost:3000/keystatic)
3. Use **Homepage** (order + spotlight) and **Projects** (per-project metadata)
4. Save — files update under `src/content/homepage.json` and `src/content/project-meta/`

Local mode writes to disk. For production editing on Vercel, enable Keystatic GitHub mode (see `.env.example` and [Keystatic GitHub mode](https://keystatic.com/docs/github-mode)): set `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO` and the GitHub App env vars, then only collaborators with write access can sign in at `/keystatic`.

## Build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add your custom domain in **Project Settings → Domains**
4. Update DNS at your registrar:
   - **A record** → `76.76.21.21`
   - **CNAME** for `www` → `cname.vercel-dns.com`

## Deploy elsewhere

The site works on any platform that supports Next.js (Netlify, Cloudflare Pages, etc.).

## Full archival (before losing Adobe access)

Run this once to capture everything still on the live site:

```bash
npm run archive
```

This saves:
- Raw HTML snapshots of all pages → `archive/html/`
- Site metadata (title, OG tags, analytics ID) → `archive/site-meta.json`
- Favicon, OG image, apple-touch icon, Adobe theme CSS → `public/images/site/`
- Embed page snapshots (Adobe XD, Vimeo) → `archive/embeds/`
- Vimeo video locally → `public/videos/`
- Embed inventory + manual steps → `archive/embeds.json`

To re-scrape projects and re-download images:

```bash
python3 scripts/scrape.py
```

### Still requires manual action

| Content | Status | Action |
|---------|--------|--------|
| 17 projects + 315 images | Archived locally | Done |
| About page, nav, social links | In `src/data/site.ts` | Done |
| Favicon / OG image | In `public/images/site/` | Done |
| Vimeo (Cowboys vs Cyborgs) | Local MP4 | Done after `npm run archive` |
| **Adobe XD prototypes** (CUBO, Smart Financeiro) | External embeds | Export as MP4/PDF from Adobe XD before account closes |
| Mega.nz game downloads (Brasilero) | External links | Verify links work; re-host files if dead |

## Updating content

- **Card metadata / homepage layout** — prefer `/keystatic` (writes `project-meta/` + `homepage.json`)
- **Case-study bodies** — still in `src/content/projects/{slug}.json` (`blocks`); scrape or edit carefully

To refresh bodies from the live Adobe site:

```bash
python3 scripts/scrape.py
```

That re-scrapes project data and downloads images into `public/images/`. Overlay metadata in `project-meta/` is kept unless you run `npm run extract-project-meta`.

To download images only (after scraping or if URLs were reset):

```bash
npm run download-images
```

Then rebuild and redeploy.

## Custom domain migration from Adobe

1. Deploy this site to your new host
2. Point your new domain DNS to the host
3. When ready, update DNS for `isrrr.com` or keep both domains pointing to the new site
4. Optionally add redirects from old Adobe URLs to new ones in `next.config.ts`

## Project structure

```
src/
  app/                      # Routes (pages, API)
  components/
    layout/                 # Header, PageLayout, PageMasthead, BackToTop, SocialLinks
    project/                # Grid, cover, blocks, lightbox, embeds, category page
  content/projects/         # Case-study JSON + index.json
  content/project-meta/     # Keystatic metadata overlays
  content/homepage.json     # Keystatic homepage order + spotlight
  data/                     # Site config (nav, about, social)
  lib/                      # Project loading + block helpers
  styles/                   # Project-specific CSS (imported by globals.css)
  types/                    # Shared TypeScript types
scripts/
  scrape.py                 # Content migration
  extract-project-meta.ts   # Seed/refresh Keystatic meta from project JSON
  download_images.py        # Localize CDN images
  archive_site.py           # Full site backup before Adobe access ends
  prune_dead_embeds.py      # Remove dead embed blocks from JSON
keystatic.config.ts         # Admin schema (Homepage + Projects)
```

## Notes

- Project images are stored locally under `public/images/` (covers in `covers/`, page assets in `assets/`).
- Adobe XD embeds require an internet connection to display prototypes.
