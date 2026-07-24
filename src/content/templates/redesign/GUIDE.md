# Redesign case study template

Canonical structure for redesign projects in this portfolio.  
Use when the core narrative is **before → after**: a visual or UX overhaul of an existing product, website, or brand.

Scaffold a new project:

```bash
npm run new:redesign -- --slug my-redesign --title "My Redesign"
```

Optional flags: `--year 2026`, `--subtitle "..."`, `--description "..."`, `--dry-run`.

---

## Files created

| File | Purpose |
|------|---------|
| `src/content/projects/{slug}.json` | Case-study body (`blocks`) |
| `src/content/project-meta/{slug}.json` | Card + fold copy (Keystatic) |
| `src/content/projects/index.json` | Slug registered in `slugs` |

Also add media:

| Path | Role |
|------|------|
| `public/images/covers/{slug}.webp` | Grid cover |
| `public/images/assets/{slug}-hero.webp` | Hero (final result / money shot) |
| `public/images/assets/{slug}-before.webp` | **Before** screenshot (left side of split) |
| `public/images/assets/{slug}-after.webp` | **After** screenshot (right side of split) |
| `public/images/assets/{slug}-audit.webp` | Audit annotations / heuristic map |
| `public/images/assets/{slug}-design-system.webp` | Visual language / style tile / DS |
| `public/images/assets/{slug}-screen-{1..3}.webp` | Key detail screens (phone-friendly) |

---

## Narrative skeleton

```
┌─────────────────────────────────────────┐
│ FOLD (splitProjectFold strips these)    │
│  1. Hero image                          │
│  2. Tree: intro (5) + meta (3)         │
└─────────────────────────────────────────┘
│ BODY                                    │
│  THE CHALLENGE (context + problem)      │
│  BEFORE / AFTER split (50/50 image)     │
│  AUDIT & DISCOVERY (findings list)      │
│  DESIGN GOALS (bullet priorities)       │
│  VISUAL LANGUAGE (typography → color →  │
│    components, with design-system img)  │
│  KEY SCREENS (3 feature-detail trees)   │
│  OUTCOME (metrics + reflection)         │
│  Prototype CTA + embed                  │
└─────────────────────────────────────────┘
```

---

## Block patterns the app detects

| Pattern | Detection | UI effect |
|---------|-----------|-----------|
| Hero + meta tree | First image + tree with Timeframe/Role/… | `ProjectHeroFold` |
| Section | `subheading` ALL CAPS | Section heading style |
| Subsection | marks `bold` + `italic` + `display` | Subsection heading |
| Meta labels | `Timeframe`, `Role`, `Team`, `Tools`, `Client` | Fold meta column |
| Before/After pair | Two images in a 50/50 tree with "Before" / "After" text | Side-by-side comparison |
| Design Goals | Bullet list after DESIGN GOALS subheading | Goal highlight |
| Metric tooltips | Exact label in `METRIC_TOOLTIPS` | Hover definition on KPI text |

---

## Placeholders (`{{…}}`)

| Token | Example |
|-------|---------|
| `slug` | `redesign-banco-inter` |
| `title` | `Banco Inter Redesign` |
| `subtitle` | One line for cards |
| `description` | Outcome-focused fold line (Keystatic) |
| `year` | `2024` |
| `product_type` | `iOS app` / `website` / `design system` |
| `client` / `client_url` | Company name + site |
| `original_product_name` | Name of the product before redesign |
| `one_sentence_context` | Why the product exists |
| `intro_scope` | What the redesign covered (scope) |
| `nda_or_scope_note` | NDA redaction note or delete the paragraph |
| `timeframe` / `role` / `team` / `tools` | Fold meta |
| `challenge_context` | The problem that motivated the redesign |
| `before_description` | What was wrong with the old design |
| `after_description` | How the new design addresses those issues |
| `audit_overview` | Heuristic / competitive audit summary |
| `audit_finding_*` | Key pain points found (3 bullets) |
| `goal_*` | Design objectives (3 bullets) |
| `goals_context` | How goals were prioritized |
| `visual_language_intro` | New visual direction |
| `typography_detail` | Font choice + rationale |
| `color_palette_detail` | Palette reasoning |
| `components_detail` | Key UI components / patterns |
| `key_screens_intro` | Overview of the screens shown |
| `screen_*_title` / `screen_*_body` | Feature detail |
| `outcome_intro` | Before/after impact summary |
| `metric_*` | Quantified results (month over month) |
| `outcome_reflection` | What the redesign unlocked |
| `prototype_url` | Figma / hosted prototype |

---

## Writing rules

1. **Lead with the problem** — THE CHALLENGE is the hook. State what was broken and why a redesign mattered.
2. **Before/after is the star** — the 50/50 image split is the most powerful visual in this template. Make the difference obvious.
3. **Be specific in audit findings** — name exact issues (e.g., "72% drop-off on step 3", "contrast ratio 2.1:1 on primary CTA").
4. **Goals should be measurable** — "Increase conversion" is weak; "Reduce time-to-task from 45s to 20s" is strong.
5. **Visual language section** — show the design system evolution, not just final screens.
6. **Categories** must include **`ux`** (the tier detector marks it as a case study) — add `featured` if on homepage.
7. **Metrics** — prefer real data. If NDA-protected, use directional language ("over 2× improvement") or mark as fictional.

---

## Publish checklist

- [ ] All `{{placeholders}}` replaced or removed
- [ ] Cover + hero + before/after assets exist under `public/images/`
- [ ] `description` filled in `project-meta/{slug}.json`
- [ ] Categories include `ux` (and `featured` if on homepage)
- [ ] Before/after split image pair ready (same angle, same viewport)
- [ ] Audit findings are specific (not generic "bad UX")
- [ ] KPI strings added to `src/lib/project-metric-tooltips.ts` if using OUTCOME metrics
- [ ] Prototype embed URL works (or remove embed block)
- [ ] Registered in `projects/index.json` (`slugs`)
- [ ] Optional: add to Keystatic homepage order / spotlight
- [ ] `npm run audit:projects` — no failures for the new slug
- [ ] Visual pass at `/[slug]` desktop + mobile

---

## After scaffold — edit paths

```bash
# Body (blocks)
src/content/projects/{slug}.json

# Card + fold description
src/content/project-meta/{slug}.json

# Or Keystatic UI for meta only
npm run dev  →  http://localhost:3000/keystatic
```

Never point Keystatic at `projects/*.json` — saving would risk wiping `blocks`.
