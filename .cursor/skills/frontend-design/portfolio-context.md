# Portfolio design context

Use this alongside the main frontend-design skill when reviewing or editing this repo.

## Brief (pinned)

| Axis | Choice |
|------|--------|
| **Subject** | Israel Silva — Brazilian product designer (UX, motion, games, graphic) |
| **Audience** | Recruiters, clients, collaborators browsing case studies |
| **Job** | Showcase featured work; category filters; about + publications |
| **Reference** | Migrated from [isrrr.com](https://isrrr.com/) (Adobe Portfolio) |

Parity with the live Adobe site is the default goal. Do not swap to generic AI portfolio templates (cream/terracotta, acid-green-on-black hero, broadsheet 01/02/03) unless the user requests a redesign.

## Token system (current)

**Color**

| Token | Hex | Role |
|-------|-----|------|
| background | `#FFFFFF` | Page, header, cover label stripe |
| text-primary | `#14191D` | Body, titles |
| text-muted | `#666666` | Tags, captions, subtitles, back-to-top |

**Type**

| Role | Face | Use |
|------|------|-----|
| Logo / display | Space Grotesk | Header tagline, project titles, mastheads, `.sub-title` |
| Body / tags | Inter | Nav, body, UI, cover tags, subtitles |

**Layout**

- Max width 1440px, 8% horizontal padding on text/mastheads and project grids
- Homepage: asymmetric first-fold hero — large spotlight + configurable 2–3 stacked sidebar projects (`spotlightSlug`, `featureSideCount` in `homepage.json`), then 1 / 2 / 3-col gapped grid
- Category grids: same gapped grid, no spotlight
- Project pages: full-bleed images, 8% padding on text modules and trees
- About: two-column desktop layout (bio ~58% / publications ~42%); stacked on mobile; publications heading is small uppercase muted label

**Signature**

Cover label stripe under the thumbnail — title/subtitle left, muted chevron right as a quiet click cue (no “Featured” eyebrow; spotlight scale/span carries hierarchy). Hover/focus: slight image scale, title softens, chevron darkens and nudges right. Homepage feature fold is an asymmetric mosaic (wide spotlight + 2–3 stacked sidebar cards, `featureSideCount` in Keystatic); thumbnails fill their slots with `object-fit: cover` in the fold. Keep the rest of the grid quiet and evenly spaced.

## Constraints

- Scraped HTML in JSON uses inline styles — override via `src/styles/project.css`, not Tailwind rewrites
- Images are local under `public/images/`
- Adobe XD embeds may disappear; `ProjectEmbed` hides dead embeds
- Prefer minimal diffs; match `src/components/layout/` and `src/components/project/` structure

## Review checklist

1. Does it still read as *this* designer’s portfolio, not a template?
2. Typography hierarchy clear (logo / display / body)?
3. Motion limited to lightbox, header shadow, back-to-top?
4. Keyboard focus visible on interactive elements?
5. `prefers-reduced-motion` respected?
6. Copy plain and navigational (nav labels, “Back to Top”, “About me”)?
