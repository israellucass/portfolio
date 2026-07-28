---
name: redesign-case-study
description: Scaffold and author redesign case studies for this portfolio using the reusable template (fold, HMW, before/after, research, principles, solution gallery, visual language, validation, RESULTS). Use when creating a redesign, visual overhaul, or before/after product design page.
---

# Redesign case study skill

## When to use

- User asks for a **new redesign / visual overhaul / before–after case study**
- User says “use the redesign template” or “redesign case study structure”
- Differentiating from greenfield UX (`ux-case-study`) when the story is transforming an existing product

## Source of truth

| Resource | Path |
|----------|------|
| Body template | `src/content/templates/redesign/body.json` |
| Meta template | `src/content/templates/redesign/meta.json` |
| Authoring guide | `src/content/templates/redesign/GUIDE.md` |
| UX spine reference | `src/content/templates/ux-case-study/GUIDE.md` |
| Design context | `.cursor/skills/frontend-design/portfolio-context.md` |

## Create a new project

```bash
npm run new:redesign -- --slug kebab-slug --title "Project Title" --year 2026
```

Then:

1. Read `GUIDE.md` and replace every remaining `{{placeholder}}` in `src/content/projects/{slug}.json`
2. Fill outcome `description` + card fields in `src/content/project-meta/{slug}.json` (or Keystatic)
3. Drop images under `public/images/` using the `{slug}-*` naming in the guide (especially before/after)
4. If RESULTS has KPIs, add exact label → definition entries in `src/lib/project-metric-tooltips.ts`
5. Run `npm run audit:projects` and fix failures for the new slug
6. Visual QA at `/{slug}` — recruiter skim (fold + HMW + before/after + RESULTS) and IC deep read (constraints → principles → screen rationale)

## Required structure

1. **Fold** (same as UX)
   - Hero `image`
   - `tree` flex 5/3 — intro (name display+bold, scope, **my_contribution**) | meta (`Timeframe`, `Role`, `Team`, `Tools`, `Client`)
2. **Body**
   - Centered **How might we…?**
   - PROBLEM FRAMING + Constraints subsection
   - Before/after 50/50 image tree + Before/After captions
   - RESEARCH (audit findings + usage evidence)
   - DESIGN PRINCIPLES (3 bullets + one tradeoff)
   - SOLUTION + 3 feature-gallery trees (~33/67)
   - VISUAL LANGUAGE (type / color / components)
   - VALIDATION → RESULTS
   - Optional prototype `embed`
3. **Categories**: include `ux`
4. **Meta `description`**: one outcome sentence

## Audience checklist

**Recruiter**
- [ ] Outcome in fold description
- [ ] Role / ownership clear
- [ ] HMW readable in one line
- [ ] Before/after delta obvious
- [ ] RESULTS has metrics

**IC designer**
- [ ] Constraints stated
- [ ] Findings are specific
- [ ] Principles + explicit tradeoff
- [ ] Screen copy explains decisions
- [ ] Visual language has rationale
- [ ] Validation methods present

## Do not

- Point Keystatic at `projects/*.json`
- Leave `{{placeholders}}` or intro placeholders (`.`, `..`)
- Use OUTCOME instead of **RESULTS**
- Lead with moodboards before problem framing
- Write screen captions as marketing blurbs
- Invent a new visual system; match existing `project.css` / RichText patterns
