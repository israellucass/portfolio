# Redesign case study template

Canonical structure for **redesign** projects in this portfolio.  
Same spine as the [UX case study template](../ux-case-study/GUIDE.md) (fold → HMW → process → RESULTS), with redesign-specific proof: **before/after**, audit evidence, and visual language.

**Audience focus**

| Reader | What they scan for first |
|--------|--------------------------|
| **Recruiter** | Outcome description, role ownership, clear HMW, measurable RESULTS |
| **IC designer** | Constraints, evidence → principles, decision rationale on key screens, craft (visual language), validation |

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
| `public/images/assets/{slug}-hero.webp` | Fold hero (final result / money shot) |
| `public/images/assets/{slug}/` | Optional subfolder when a project has many screens (e.g. `ferpa-lima/home-new.webp`) |
| `public/images/assets/{slug}-before.webp` | **Before** (left of 50/50 split) |
| `public/images/assets/{slug}-after.webp` | **After** (right of 50/50 split) |
| `public/images/assets/{slug}-audit.webp` | Annotated audit / heuristic map |
| `public/images/assets/{slug}-screen-1..3.webp` | Key screens (phone-friendly) |
| `public/images/assets/{slug}-design-system.webp` | Visual language / style tile / DS |
| `public/images/assets/{slug}-validation.webp` | Testing / a11y / findings |

---

## Narrative skeleton

```
┌─────────────────────────────────────────┐
│ FOLD (splitProjectFold strips these)    │
│  1. Hero image                          │
│  2. Tree: intro (5) + meta (3)          │
│     intro includes my_contribution      │
└─────────────────────────────────────────┘
│ BODY                                    │
│  HMW (centered) + PROBLEM FRAMING       │
│    + Constraints subsection             │
│  BEFORE / AFTER split (50/50)           │
│  RESEARCH (audit + usage evidence)      │
│  DESIGN PRINCIPLES (prioritized +       │
│    one explicit tradeoff)               │
│  SOLUTION + 3 feature-gallery trees     │
│  VISUAL LANGUAGE (type / color / comps) │
│  VALIDATION                             │
│  RESULTS (metrics → tooltips registry)  │
│  Prototype CTA + embed                  │
└─────────────────────────────────────────┘
```

Aligned with UX template section detection (`subheading` ALL CAPS, HMW, RESULTS, feature trees). Do **not** put `align: "center"` on non-HMW headings.

### Writing “How might we” (HMW)

HMWs reframe an insight as an opportunity for ideation ([NN/g](https://www.nngroup.com/articles/how-might-we-questions/), IDEO). In this portfolio they are a **one-line** Caveat post-it, so keep them short.

**Formula:** `How might we [outcome] for [user]?`  
Optional: `… so that [desired change]?` only if it still fits one line.

| Do | Don’t |
| --- | --- |
| One desired outcome | Pack credibility + conversion + SEO + audience into one question |
| Positive framing (“make … feel trustworthy”) | Negative framing (“stop users from bouncing”) |
| Broad enough for many solutions | Embed a solution (“add pricing cards”, “fix SEO titles”) |
| Match peer length (~12–20 words after “How might we”) | Run-on clauses joined with “while / and / as well as” |

**Put the rest in PROBLEM FRAMING** (constraints, differentiators, audience, SEO, platform). The HMW only names the north-star opportunity.

**Good (this repo):**  
`How might we improve the accessibility of retail store data for managers and supervisors?`  
`How might we make Ferpa Lima’s expertise feel as credible and approachable online as it is in practice?`

**Too long / solution-y:**  
`How might we make expertise feel credible online while making individualized routines and hiring paths unmistakable on a dedicated pricing page?`

`hmw_question` placeholder = text **without** leading “How might we” or trailing `?`.

---

## What to prove (recruiter vs IC)

### Recruiters (10-second skim)

1. **Meta `description`** — one outcome sentence (impact, not “I redesigned the UI”).
2. **Role + `my_contribution`** — what you owned vs the team.
3. **HMW** — problem in one line.
4. **Before/after** — visible delta without reading.
5. **RESULTS** — 2–3 concrete metrics (or honest directional language if NDA).

### IC designers (depth skim)

1. **Constraints** — time, platform, brand, tech, accessibility requirements.
2. **Research findings** — specific (contrast ratios, drop-off steps, competitive gaps), not “bad UX”.
3. **Principles + tradeoff** — show judgment (what you optimized for and what you gave up).
4. **Screen captions** — *why* this decision, not feature marketing copy.
5. **Visual language** — rationale for type/color/components, not a moodboard dump.
6. **Validation** — how you knew it worked (usability, heuristics, a11y, stakeholder).

---

## Block patterns the app detects

| Pattern | Detection | UI effect |
|---------|-----------|-----------|
| Hero + meta tree | First image + tree with Timeframe/Role/… | `ProjectHeroFold` |
| HMW | `/how might we/i` | Caveat post-it blockquote |
| Section | `subheading` ALL CAPS | Section heading style |
| Subsection | marks `bold` + `italic` + `display` | Subsection heading |
| Meta labels | `Timeframe`, `Role`, `Team`, `Tools`, `Client`, `Members` | Fold meta column |
| Before/After pair | Two images in a 50/50 tree | Side-by-side comparison |
| Feature rows | Consecutive image+text trees (~33/67) | `.project-feature-gallery` |
| RESULTS | Heading/subheading `RESULTS` | Ends sticky phase range (if used) |
| Metric tooltips | Exact label in `METRIC_TOOLTIPS` | Hover definition on KPI text |

---

## Placeholders (`{{…}}`)

| Token | Example / intent |
|-------|------------------|
| `slug` | `redesign-banco-inter` |
| `title` | `Banco Inter Redesign` |
| `subtitle` | What it is + who for (card line) |
| `description` | Outcome-focused fold line (Keystatic) |
| `year` | `2024` |
| `product_type` | `iOS app` / `website` / `design system` |
| `client` / `client_url` | Company name + site |
| `original_product_name` | Product before redesign |
| `one_sentence_context` | Why the product exists |
| `intro_scope` | Surfaces / flows in scope |
| `my_contribution` | IC ownership: screens, system, research, shipping |
| `nda_or_scope_note` | NDA redaction note or delete the paragraph |
| `timeframe` / `role` / `team` / `tools` | Fold meta |
| `hmw_question` | Text **without** leading “How might we” or trailing `?`. One outcome, ~12–20 words; see “Writing How might we” above |
| `problem_framing` | Business + user pain that forced the redesign |
| `constraints` | Platform, brand, timeline, tech, a11y |
| `before_description` / `after_description` | Concrete delta, not “cleaner UI” |
| `research_overview` | How you audited (heuristics, competitors, data) |
| `audit_finding_*` | Specific findings (3 bullets) |
| `research_usage` | Analytics / support / interviews that backed the audit |
| `principles_intro` | How findings became design principles |
| `principle_*` | Prioritized, testable principles (3) |
| `principles_tradeoff` | One hard tradeoff you chose and why |
| `solution_intro` | How the new IA/flows/UI address the HMW |
| `screen_*_title` / `screen_*_body` | Decision + rationale for each key screen |
| `visual_language_intro` | New visual direction in one paragraph |
| `typography_detail` / `color_palette_detail` / `components_detail` | Craft rationale |
| `validation` | Methods + what changed after feedback |
| `results_intro` / `metric_*` / `results_closing` | Outcomes (metric strings must match tooltip keys) |
| `prototype_url` | Figma / hosted prototype |

Scaffold only replaces identity fields (`slug`, `title`, `subtitle`, `description`, `year`).  
Replace remaining `{{…}}` tokens while writing (search the body file for `{{`).

---

## Writing rules

1. **Intro** must open with the project name (display + bold) so audits can match title ↔ intro.
2. **Description** (meta) = outcome in one sentence (impact, not process).
3. **Subtitle** (meta) = what it is + who for (card line).
4. **Lead with framing, not decoration** — HMW + PROBLEM FRAMING before before/after.
5. **Before/after is the star visual** — same viewport/angle; make the difference obvious in one glance.
6. **Audit findings must be specific** — e.g. “contrast 2.1:1 on primary CTA”, “72% drop-off on step 3”.
7. **Principles should be measurable or falsifiable** — avoid “make it modern”.
8. **Always include one tradeoff** — ICs trust judgment more than perfect endings.
9. **Screen copy = decisions** — “Reduced fields from 12 → 5 to cut time-to-submit” beats “Cleaner form”.
10. **Use RESULTS** (not OUTCOME) so tooling matches the UX template.
11. **Categories** must include **`ux`** so the tier detector marks it as a case study.
12. Feature trees: image ~33 / copy ~67 — consecutive pairs become `.project-feature-gallery`.
13. Keep phone demos compact; body images share the 960px reading column.
14. No placeholder intro (`.`, `..`).

---

## Publish checklist

- [ ] All `{{placeholders}}` replaced or removed
- [ ] Cover + hero + before/after assets exist under `public/images/`
- [ ] `description` filled in `project-meta/{slug}.json` (outcome sentence)
- [ ] `my_contribution` states IC ownership clearly
- [ ] Categories include `ux` (and `featured` if on homepage)
- [ ] HMW + PROBLEM FRAMING + Constraints present
- [ ] Before/after pair ready (same angle, same viewport)
- [ ] RESEARCH findings are specific; DESIGN PRINCIPLES include a tradeoff
- [ ] SOLUTION feature gallery + VISUAL LANGUAGE + VALIDATION + RESULTS present
- [ ] KPI strings added to `src/lib/project-metric-tooltips.ts` if using RESULTS tooltips
- [ ] Prototype embed URL works (or remove embed block)
- [ ] Registered in `projects/index.json` (`slugs`)
- [ ] Optional: add to Keystatic homepage order / spotlight
- [ ] `npm run audit:projects` — no failures for the new slug
- [ ] Visual pass at `/[slug]` desktop + mobile (recruiter skim + IC deep read)

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
