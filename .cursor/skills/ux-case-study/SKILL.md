---
name: ux-case-study
description: Scaffold and author UX case studies for this portfolio using the reusable template (fold, HMW, process sections, feature gallery, RESULTS). Use when creating a new UX project, case study, or product design page.
---

# UX case study skill

## When to use

- User asks for a **new UX / product design case study**
- User says “use the template”, “new project page”, or “case study structure”
- Expanding or normalizing an existing UX project to match CUBO / Smart Financeiro

## Source of truth

| Resource | Path |
|----------|------|
| Body template | `src/content/templates/ux-case-study/body.json` |
| Meta template | `src/content/templates/ux-case-study/meta.json` |
| Authoring guide | `src/content/templates/ux-case-study/GUIDE.md` |
| Design context | `.cursor/skills/frontend-design/portfolio-context.md` |
| Reference pages | `/cubo` (multi-phase), `/smart-financeiro` (single + features) |

## Create a new project

Prefer the scaffold (keeps `index.json` in sync):

```bash
npm run new:ux -- --slug kebab-slug --title "Project Title" --year 2026
```

Then:

1. Read `GUIDE.md` and replace every remaining `{{placeholder}}` in `src/content/projects/{slug}.json`
2. Fill `description` / card fields in `src/content/project-meta/{slug}.json` (or Keystatic)
3. Drop images under `public/images/covers/` and `public/images/assets/` using the `{slug}-*` naming in the guide
4. If RESULTS has KPIs, add exact label → definition entries in `src/lib/project-metric-tooltips.ts`
5. Run `npm run audit:projects` and fix failures for the new slug
6. Visual QA at `/{slug}` (desktop + mobile)

## Required structure (case study tier)

1. **Fold**
   - First block: hero `image`
   - Second block: `tree` flex 5/3 — intro (project name display+bold + context) | meta labels (`Timeframe`, `Role`, `Team`, `Tools`, `Client`) with `#888888` label color
2. **Body**
   - Centered **How might we…?**
   - `subheading`: PROBLEM FRAMING → RESEARCH → IDEATION and/or SOLUTION → VALIDATION → RESULTS
   - Subsections: marks `bold` + `italic` + `display`
   - Feature rows: consecutive image+text `tree` blocks (flex ~33/67)
   - Optional prototype `embed` at the end
3. **Categories**: include `ux` (and `featured` if homepage-worthy)
4. **Meta `description`**: one outcome sentence (not process)

## Multi-phase (optional)

Insert centered `PHASE I - Topic` / `PHASE II - Topic` paragraphs before each HMW stream. End with a single RESULTS section. Sticky phase nav is automatic via `extractProjectPhaseStickyConfig`.

## Do not

- Point Keystatic at `projects/*.json` (risk of wiping `blocks`)
- Leave `{{placeholders}}` or intro placeholders (`.`, `..`)
- Duplicate the hero image later in the body
- Force full-bleed images — keep the 960px reading column
- Invent a new visual system; match existing `project.css` / RichText patterns

## Checklist before saying “done”

- [ ] Scaffold or files exist for slug
- [ ] No `{{…}}` left in body/meta
- [ ] Media paths resolve (or noted as TODO with real filenames planned)
- [ ] `index.json` includes slug
- [ ] `npm run audit:projects` clean for that slug
- [ ] Page opens without layout breakage
