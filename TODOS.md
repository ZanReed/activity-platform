# TODOS

Deferred work items with enough context to pick up cold. Durable backlog lives in
ROADMAP.md; this file is for concrete, near-term follow-ups surfaced during reviews.

## Slice 2 — math_block equation-gap reviewability (Model A)

**What:** Make Model A in-equation gaps (`math_block.prompts`) numbered on the page AND
indexed in `buildActivityIndex` so they appear in the teacher results view.

**Why:** Today a graded equation gap is invisible to review on two axes:
- `isNumberedBlock` (`packages/renderer/src/blocks/index.ts:148`) omits `math_block`, so it
  renders with no problem number even though it carries points.
- `buildActivityIndex` (`packages/app/src/lib/submissions.ts:413`) never indexes
  `math_block`, so a submitted gap response is an orphan — the dashboard labels it
  "no-longer-present." A student's equation-gap answer silently vanishes from the teacher's
  review.

**Depends on:** Slice 1 (per-block label control + shared `isGradeable`/`pageLabel` helpers)
landing first — Slice 2 extends the same shared predicate to `math_block`.

**Where to start:** add `math_block` to the shared `isGradeable`/`pageLabel` helpers (it has
`prompts` → gradeable); teach `buildActivityIndex` to index math_block prompts (reconstruct a
prompt from `latex` with `\placeholder` markers shown as `____`, key each gap by its prompt
id into the `blanks` map or a new parallel map); render the results row for that shape.

**Context:** surfaced by /plan-eng-review on 2026-07-20 while reviewing the numbering-vs-
gradeability design doc (`~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260720-015819.md`).
It's a pre-existing defect, not caused by Slice 1 — deliberately split out to keep Slice 1's
blast radius small.
