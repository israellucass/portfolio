# UX case study template

Canonical structure for new UX projects in this portfolio.  
Reference implementations: **`/cubo`** (multi-phase), **`/smart-financeiro`** (single stream + feature gallery).

Scaffold a new project:

```bash
npm run new:ux -- --slug my-project --title "My Project"
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
| `public/images/assets/{slug}-hero.webp` | First-fold hero |
| `public/images/assets/{slug}-research.webp` | Research visual |
| `public/images/assets/{slug}-ideation.webp` | Ideation / wireflow |
| `public/images/assets/{slug}-feature-1..3.webp` | Feature demos (phone-friendly) |
| `public/images/assets/{slug}-validation.webp` | Testing / findings |

---

## Narrative skeleton (default = single stream)

```
┌─────────────────────────────────────────┐
│ FOLD (splitProjectFold strips these)    │
│  1. Hero image                          │
│  2. Tree: intro (5) + meta (3)          │
└─────────────────────────────────────────┘
│ BODY                                    │
│  HMW (centered) + PROBLEM FRAMING       │
│  RESEARCH (methods + subsections)       │
│  research image                         │
│  IDEATION (insights + outcome)          │
│  ideation image                         │
│  SOLUTION + feature gallery trees       │
│  VALIDATION                             │
│  RESULTS (metrics → tooltips registry)  │
│  Prototype CTA + embed                  │
└─────────────────────────────────────────┘
```

### Multi-phase variant (CUBO)

Insert **before** each problem stream:

1. Centered paragraph: `PHASE I - Short topic` (must match `/PHASE\s+[IVXLCDM]+/i`)
2. Centered HMW: `How might we …?`
3. Full cycle: PROBLEM FRAMING → RESEARCH → IDEATION → VALIDATION  
4. Repeat as `PHASE II`, …
5. Shared **RESULTS** section once at the end (sticky phase nav ends here)

Do **not** put `align: "center"` on non-phase headings — only phase labels and HMW.

### Writing “How might we” (HMW)

HMWs reframe an insight as an opportunity for ideation ([NN/g](https://www.nngroup.com/articles/how-might-we-questions/), IDEO). In this portfolio they are a **one-line** Caveat post-it, so keep them short.

**Formula:** `How might we [outcome] for [user]?`

| Do | Don’t |
| --- | --- |
| One desired outcome | Stack multiple problems with “while / and” |
| Positive framing | Negative framing (“stop…”, “reduce…”) |
| Broad enough for many solutions | Embed a solution in the question |
| ~12–20 words after “How might we” | Paragraph-length challenge statements |

Details (constraints, audience, metrics) belong in **PROBLEM FRAMING**, not the HMW.

**Good:** `How might we enable the remote and safe monitoring of the financial data?`  
**Too long:** anything that needs a second breath or lists several goals.

`hmw_question` placeholder = text **without** leading “How might we” or trailing `?`.

---

## Block patterns the app detects

| Pattern | Detection | UI effect |
|---------|-----------|-----------|
| Hero + meta tree | First image + tree with Timeframe/Role/… | `ProjectHeroFold` |
| Phase label | Centered text matching `PHASE I/II/…` | Sticky phase nav |
| HMW | `/how might we/i` | Caveat post-it blockquote |
| Section | `subheading` ALL CAPS | Section heading style |
| Subsection | marks `bold` + `italic` + `display` | Subsection heading |
| Meta labels | `Timeframe`, `Role`, `Team`, `Tools`, `Client`, `Members` | Fold meta column |
| RESULTS | Heading/subheading `RESULTS` | Ends phase sticky range |
| Metric tooltips | Exact label in `METRIC_TOOLTIPS` | Hover definition on KPI text |

---

## Placeholders (`{{…}}`)

| Token | Example |
|-------|---------|
| `slug` | `smart-financeiro` |
| `title` | `Smart Financeiro` |
| `subtitle` | One line for cards |
| `description` | Outcome-focused fold line (Keystatic) |
| `year` | `2020` |
| `product_type` | `iOS app` / `Android app` / `web product` |
| `client` / `client_url` | Company name + site |
| `one_sentence_context` | Why the product exists |
| `intro_paragraph_2` | Scope / users / constraints |
| `nda_or_scope_note` | NDA redaction note or delete the paragraph |
| `timeframe` / `role` / `team` / `tools` | Fold meta |
| `hmw_question` | Text **without** leading “How might we” or trailing `?`. One outcome, short; see “Writing How might we” above |
| `problem_framing` | Context before research |
| `research_*` | Method copy |
| `ideation_*` / `insight_*` | Synthesis |
| `solution_intro` / `feature_*` | Product story |
| `validation` | Tests, heuristics, feedback |
| `results_*` / `metric_*` | Outcomes (metric strings must match tooltip keys) |
| `prototype_url` | Figma / Maze / hosted prototype |

Scaffold only replaces identity fields (`slug`, `title`, `subtitle`, `description`, `year`).  
Replace remaining `{{…}}` tokens while writing the case study (search the body file for `{{`).

---

## Writing rules

1. **Intro** must open with the project name (display + bold) so the audit can match title ↔ intro.
2. **Description** (meta) = outcome in one sentence (impact, not process). Used under the title in the fold.
3. **Subtitle** (meta) = what it is + who for (card line).
4. Prefer **SOLUTION** or **IDEATION** (audit accepts either); hybrid UX+game may use **GAME DESIGN** instead of IDEATION (`/olhe-e-aprenda`).
5. Feature trees: image column ~33 / copy ~67 — consecutive pairs become `.project-feature-gallery`.
6. Keep phone demos compact; body images share the 960px reading column.
7. No placeholder intro (`.`, `..`).
8. Categories must include **`ux`** so the tier detector marks it as a case study.

---

## Publish checklist

- [ ] All `{{placeholders}}` replaced or removed
- [ ] Cover + hero assets exist under `public/images/`
- [ ] `description` filled in `project-meta/{slug}.json`
- [ ] Categories include `ux` (and `featured` if on homepage)
- [ ] At least one HMW + PROBLEM FRAMING
- [ ] RESEARCH and SOLUTION/IDEATION/VALIDATION/RESULTS present
- [ ] KPI strings added to `src/lib/project-metric-tooltips.ts` if using RESULTS tooltips
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
