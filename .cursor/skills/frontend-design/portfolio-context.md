# Portfolio design context

Use this alongside the main frontend-design skill when reviewing or editing this repo.

## Brief (pinned)

| Axis | Choice |
|------|--------|
| **Subject** | Israel Silva — Brazilian product designer (UX, motion, games, graphic) |
| **Audience** | Recruiters, clients, collaborators browsing case studies |
| **Job** | Showcase featured work; category filters; about + publications |
| **Reference** | [isrrr.com](https://isrrr.com/) — self-hosted Next.js portfolio |

Visual parity with isrrr.com is the default goal. Do not swap to generic AI portfolio templates (cream/terracotta, acid-green-on-black hero, broadsheet 01/02/03) unless the user requests a redesign.

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
| Logo / display | Merriweather | Header tagline, project titles, mastheads, `.sub-title` |
| Body / tags | Inter | Nav, body, UI, cover tags, subtitles |
| Design questions | Caveat | “How might we…” post-it callouts — casual handwriting, still readable |

**Layout**

- Max width 1440px, 8% horizontal padding on text/mastheads and project grids
- Homepage: asymmetric first-fold hero — large spotlight + configurable 2–3 stacked sidebar projects (`spotlightSlug`, `featureSideCount` in `homepage.json`), then 1 / 2 / 3-col gapped grid
- Category grids: same gapped grid, no spotlight
- Project pages: **images and reading text share a centered max-width 960px column** with 8% horizontal padding — not full-bleed; phone/demo GIFs in image+copy trees stay compact (max 376px)
- About: two-column desktop layout (bio ~58% / publications ~42%); stacked on mobile; publications heading is small uppercase muted label

**Signature**

Cover label stripe under the thumbnail — title/subtitle left, muted chevron right as a quiet click cue (no “Featured” eyebrow; spotlight scale/span carries hierarchy). Hover/focus: slight image scale, title softens, chevron darkens and nudges right. Homepage feature fold is an asymmetric mosaic (wide spotlight + 2–3 stacked sidebar cards, `featureSideCount` in Keystatic); thumbnails fill their slots with `object-fit: cover` in the fold. Keep the rest of the grid quiet and evenly spaced.

## Constraints

- Scraped HTML in JSON uses inline styles — override via `src/styles/project.css`, not Tailwind rewrites
- Images are local under `public/images/`
- Prototype embeds may go offline; prune dead ones with `python3 scripts/prune_dead_embeds.py`
- Prefer minimal diffs; match `src/components/layout/` and `src/components/project/` structure

## Case study layout (CUBO reference)

Use CUBO (`/cubo`) as the reference for UX case studies.  
**New projects:** scaffold with `npm run new:ux -- --slug … --title "…"` from [`src/content/templates/ux-case-study/`](../../../src/content/templates/ux-case-study/GUIDE.md) (see skill `ux-case-study`).

### Block rhythm

| Block type | Width | Padding | Notes |
|------------|-------|---------|-------|
| Hero image | `max-width: 960px`, centered | `px-[8%]` | First fold via `ProjectHeroFold` |
| Top-level richtext | `max-width: 960px`, centered | `px-[8%]` on module | Class `project-module-text--reading` |
| Tree (image + image) | `max-width: 960px`, centered | `px-[8%]` | Flex row on desktop; stacks on mobile |
| Tree (image + text) | Grouped into `.project-feature-gallery` when consecutive | `px-[8%]` on gallery | Phone above caption in a 3-col row; single pairs stay compact |
| Body image | `max-width: 960px`, centered | `px-[8%]` | Same reading column as text |

**Do not** apply `px-[8%]` or the 960px reading width to richtext nested inside tree columns — that was the “narrow strip / right-aligned” bug.

### First fold (every project)

1. Title + one-line `description` (from `project-meta`)
2. Hero image (first image block, same reading width as body)
3. Two-column details: intro prose (~5/8) + metadata labels (~3/8) on desktop; stacked on mobile
4. Metadata items (Timeframe, Role, Team, Tools, Client): **0.5rem gap** between each block via `.project-fold__meta-text`
5. Fold blocks are removed from the scrolling body via `splitProjectFold()`

### Typography hierarchy (light theme)

Map legacy dark-theme colors to current tokens in `RichText.tsx` — do not restore a dark panel.

| Pattern | Detection | Style |
|---------|-----------|-------|
| Phase label | Centered `PHASE I/II/…` | `.project-phase-heading` — Merriweather, clamp size |
| HMW question | Paragraph matching `/how might we/i` | `<blockquote class="project-design-question">` — muted yellow post-it + Caveat handwriting |
| Subsection | Bold + italic + display marks | `.project-subsection-heading` |
| Body | Default `.main-text` | Inter, 16px / 26px line-height |
| Accent gold `#ffc239` | Inline color in JSON | `--accent-gold-accessible` (`#9a6700`) for WCAG on white |

### Motion

- `ProjectReveal` on fold sections and each body block — fade + 12px slide-up, stagger ≤350ms
- Respect `prefers-reduced-motion: reduce` (instant reveal)

### Replicating on other projects

1. Ensure `description` exists in `project-meta/*.json`
2. Confirm first blocks split cleanly (hero image + intro tree or richtext + metadata)
3. Apply hierarchy CSS automatically via `RichText` — works wherever PHASE/HMW/subsection patterns appear (e.g. Atendimento Mateus)
4. Audit tree blocks: image+text columns should use nested richtext, not default padding
5. Keep images in the same centered 960px reading column as text; phone demos in image+copy trees stay compact (max 376px)
6. Run `npm run audit:projects` before publishing changes

## Project page tiers

Every project is assigned a **tier** (auto-detected from Keystatic categories + content). Styles are shared; structure expectations differ.

| Tier | Detection | Examples |
|------|-----------|----------|
| **caseStudy** | `categories` includes `ux`, or body has HMW + PROBLEM FRAMING | cubo, smart-financeiro, olhe-e-aprenda |
| **creativeShowcase** | `graphic`, or motion/games with named section headings | tutti-frutti, dark-feelings, brasilero |
| **gallery** | Image-heavy, ≤3 substantive text blocks or placeholder intro | ratildo, baralho-samba, ilustracoes |

Reference implementation for UX: `/cubo`. Hybrid UX + game design: `/olhe-e-aprenda` (GAME DESIGN sections instead of IDEATION).

### Universal checklist (all projects)

- [ ] `description` in `project-meta/{slug}.json`
- [ ] Fold: hero image → intro/metadata tree → body (`splitProjectFold`)
- [ ] No duplicate fold blocks in scrolling body
- [ ] Images + text in centered 960px reading column
- [ ] Nested tree richtext without page-level `px-[8%]`
- [ ] Links use hover-only `.link-underline`
- [ ] `ProjectReveal` on fold + body; `prefers-reduced-motion` respected
- [ ] Floating back-to-top only
- [ ] Keystatic `categories` set

### Case study tier (UX)

- [ ] Intro: project name (display bold) + context + NDA note if applicable
- [ ] Metadata: Timeframe, Role, Team (`#888` labels); **0.5rem gap** between items in fold column
- [ ] HMW blockquote before each PROBLEM FRAMING phase
- [ ] Section labels (`subheading`): PROBLEM FRAMING → RESEARCH → IDEATION → VALIDATION → RESULTS
- [ ] Subsections: bold + italic + display (e.g. “Interviews”, “Direct observation”)
- [ ] Consecutive image+text trees in `.project-feature-gallery`
- [ ] RESULTS KPIs with tooltips in `project-metric-tooltips.ts` (definitions only — no repeat of body copy)
- [ ] Content matches `archive/html/{slug}.html` (no truncated sections)

### Creative showcase tier

- [ ] Fold: Client/Year or intro + metadata (Role, Tools, Client)
- [ ] Section headings via `subheading` or short ALL-CAPS labels (`.project-section-heading`)
- [ ] Images/trees within reading column
- [ ] No forced HMW / PHASE / RESULTS unless content has them

### Gallery tier

- [ ] Fold: title + description + hero
- [ ] No placeholder intro (`"."`, `".."`)
- [ ] Images in reading column

## Review checklist

1. Does it still read as *this* designer’s portfolio, not a template?
2. Typography hierarchy clear (logo / display / body)?
3. Motion limited to lightbox, header shadow, back-to-top?
4. Keyboard focus visible on interactive elements?
5. `prefers-reduced-motion` respected?
6. Copy plain and navigational (nav labels, “Back to Top”, “About me”)?
