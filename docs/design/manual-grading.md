# Manual grading + rubrics (Phase 2.6) — design

**Status: ⚰️ SUPERSEDED 2026-08-15 by [teacher-grading.md](teacher-grading.md) — this doc is kept for its RULINGS, not its status.** Its old status line ("SHIPPED + DEPLOYED + live-verified") stopped being true at S9 Drop 3 and stayed on the page for a month; the P10 re-derivation that opened the successor slice caught it, which is the argument for re-deriving against shipped reality instead of reading a status line.

**What actually survives from this arc:** the in-document rubric schema (`Rubric`/`RubricCriterion` on `short_answer`/`essay`, version-pinned) and its authoring UI, plus the ` ```shortanswer ` / ` ```essay ` import fences. Decisions 1 and 3 below still hold verbatim.

**What is DEAD:** the `grades` table and `can_grade_submission` (dropped by migration 0034 — 0029 had emptied them and kept them only until the successor slice re-decided), the Submissions dashboard and `lib/submissions`/`lib/grades` (deleted at S9 Drop 3), and `get-feedback` — which was deleted at Drop 3 **and had never worked**: it served bodiless 200s its entire life (arguments to `jsonResponse` swapped), so released feedback never reached a published page. ⚠ **Do not treat decision 2 or 4 below as reference implementations.** Grading is now checks-native: grades key on `section_checks` rows through four audited RPCs (0034), and the student readback goes through PostgREST, not an Edge Function.

The arc that opens the platform to subjects whose assessments aren't auto-gradable. Slice 1 shipped the student half (free-text capture into the wire-v9 `freeResponses` map — see ~~RUNTIME.md "Free-text blocks"~~ — that file died with `packages/renderer` at S9 Drop 4 (2026-08-14); the surviving contract is the viewer's `free-response` registry entry + component). This doc designs the grading half.

## Decisions (author-approved 2026-07-13)

1. **Rubrics live IN the document, on the block** — an optional `rubric` field on `short_answer` / `essay`, NOT a `rubrics` table. Rationale: submissions are already pinned to `activity_versions` (migration 0007) and the dashboard already loads the pinned document, so the grading UI reads **the exact rubric the student was assessed against** with zero new infrastructure. "Rubric edits apply prospectively" (the ROADMAP requirement) is exactly what version pinning already does. The renderer does NOT emit the rubric (teacher-side data; never in student HTML). A cross-activity rubric-template library later is an additive table that *copies into* documents — nothing is foreclosed. District sharing stays Phase 4.

2. **Grades are written by direct RLS upsert** from the authenticated dashboard client — no `grade-submission` Edge Function. Same trust model as every dashboard read today. The only new Edge Function in the arc is `get-feedback` (slice 5), which anonymous students need.

3. **Points per criterion.** `RubricCriterion = {id, label, maxPoints, description?}`; the teacher enters earned points + optional per-criterion feedback. Leveled descriptor grids (4/3/2/1 columns) are a future additive extension of the same shape.

4. **Student-facing feedback ships in this arc** (slice 5) via a submission-id capability: `ingest_submission` already returns `{submission_id, attempt_number}`; the runtime stores the id in localStorage and later fetches per-criterion feedback from `get-feedback` using it as an unguessable bearer token. No student accounts needed.

Defaults adopted with the ROADMAP's leanings: **partial grading allowed** (unscored criteria show "not yet scored") + a submission-level `general_feedback` for quick one-line feedback without a rubric; **audit** = one mutable `grades` row per (submission, block) with `updated_at`, each pass also appended to the existing `audit_log` (no `grading_attempt` chain); **re-grade after revision** falls out of keying grades on `submission_id` — a new attempt is a new submission and is simply ungraded; **gradingMode** stays un-gated — "has manual blocks" is derived from the document (no stale-flag bugs). ⚰ **The clause that followed — "the `ActivityMeta.gradingMode` enum remains for a future explicit override" — is DEAD: the field was deleted 2026-08-24 (activity flow modes, R4), on the reasoning this very sentence anticipated. When an explicit override is wanted it lands at the BLOCK grain, which this doc's own design already says it needs.**; **grading UX** is side-by-side in the Submissions dashboard (student text left, rubric right).

## Slices

### Slice 2 — Rubric schema + authoring (no migration)

- `Rubric { criteria: RubricCriterion[] (min 1) }`, `rubric` optional on `ShortAnswerBlock` / `EssayBlock`.
- Rubric builder in `FreeResponseView`'s Options footer (criterion rows: label, points, optional description; add/remove).
- Serialize both directions (attrs-stored, Zod-sanitized like other attrs-stored shapes).
- `FreeTextInfo` in the activity index carries the rubric so slice 4 is pure UI.
- **Deploy note — verified NO hazard:** the version snapshot is written by the `publish_activity` RPC from raw `draft_content` (no Zod), and the Edge Function's `safeParse` output feeds only the *renderer* (where the rubric must not appear anyway; Zod strips the then-unknown key). So rubrics survive draft-save AND publish even under the currently-deployed function; the already-queued slice-1 publish redeploy needs no reordering.

### Slice 3 — `grades` table (migration 0010)

```sql
create table grades (
  id               uuid primary key default gen_random_uuid(),
  submission_id    uuid not null references submissions(id) on delete cascade,
  block_id         uuid not null,          -- short_answer/essay block in the pinned doc
  criteria         jsonb not null default '[]'::jsonb,
    -- [{criterionId, earned, feedback?}] — partial allowed; earned ≤ maxPoints
    -- validated client-side against the pinned rubric (advisory, like `correct`)
  general_feedback text,
  graded_by        uuid not null references users(id) on delete restrict,
  graded_at        timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (submission_id, block_id)
);
```

RLS: select/insert/update for the teacher who can read the submission (reuse `can_access_assignment` / `can_read_activity` through the submission row, mirroring the two submissions SELECT policies). No delete policy (clear a grade = empty criteria + null feedback). `anon` gets nothing — students read via `get-feedback` (service role, slice 5).

### Slice 4 — Teacher grading UI

- Submissions dashboard: "Needs grading" filter (submissions whose pinned doc has short_answer/essay blocks with no/partial `grades` rows).
- Side-by-side grading panel per written response: student text + word count (computed-on-read) left; rubric criteria with earned-points inputs + per-criterion feedback right; general-feedback field; upsert on save; `audit_log` row per pass.
- Score display for mixed activities: auto score and manual points shown as **separate figures** (e.g. "Auto 4/5 · Rubric 12/16" — never a falsely-combined single number while anything is ungraded).

### Slice 5 — Student-facing feedback

- Runtime: store the `submission_id` from the ingest response in localStorage (keyed by activity, like the pending-submission slot); on load of a page with manual blocks and a stored id, offer "Check for feedback" → fetch.
- New Edge Function `get-feedback(submission_id)`: service-role read of the grades rows + the pinned rubric (from the version snapshot), returns per-criterion label/earned/max/feedback + general feedback. The uuid is the capability; no auth. Rate-limit friendly (single-row lookups).
- Published page renders a per-criterion feedback panel near each graded block (sidebar pattern; inline rubric anchors are later polish).
- **Watch the base-runtime budget**: base sits at ~97% of the 40 KiB soft target; the fetch+render UI must be measured, and if it crosses the target this is the trigger for the budget-ladder lever (per-question-type inlining variants) already scheduled in STATE.

## Not in this arc

Rubric template library (additive table later); leveled descriptor grids; district/org rubric sharing (Phase 4); inline feedback anchors on the student page; server-side authoritative grading (Phase 5 ceiling unchanged — `earned` in grades is teacher-entered, so unlike auto-scores it IS authoritative already).
