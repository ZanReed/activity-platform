# Teacher grading bound to `section_checks` — the S4 deferral comes due

**Status: ENG + DESIGN REVIEW CLEAR (2026-08-15) — G1–G14 are the ruled
architecture; §2b (G8-DR) is the ruled UI. Build-ready: T1–T5.** Successor to
Phase 2.6 ([manual-grading.md](manual-grading.md), whose surface was demolished
at S9 Drop 3) and owner of the S4 deferral recorded in
[TODOS.md](../../TODOS.md) → "Teacher grading bound to `section_checks`".

**Why now (unparked 2026-08-15):** the slice was parked on "no teachers using
the system yet." The admission slice (0033) made a stranger-teacher reachable
by self-serve, so the condition expired. Honest framing (outside voice #14
absorbed): the urgency is "before first real usage, while migration is free" —
the live copy (*"Recorded — your teacher will review"*) has been seen by zero
students, and completing the promise in PRACTICE also needs the feedback to be
findable (the discoverability TODO records that second half).

---

## 1. Re-derivation against shipped reality (P10, done 2026-08-15)

The TODOS entry predates S9 and 0033. What re-deriving changed:

**R-1 — There is NO reference implementation, and the doc trail overstates
what exists.** `manual-grading.md`'s status line still reads "SHIPPED +
DEPLOYED + live-verified" — false since S9 Drop 3: the Submissions dashboard
route, `lib/submissions`/`lib/grades`, and `get-feedback` are deleted, and
`get-feedback` **never worked** (bodiless 200s its whole life — arguments to
`jsonResponse` swapped; P9 audit). `grades` rows were wiped by 0029. What
genuinely survives from 2.6: the **rubric schema + authoring UI**
(`Rubric`/`RubricCriterion` on `short_answer`/`essay`, in-document,
version-pinned) and the **empty `grades` table** (which G1 now retires). The
2.6 side-by-side grading UI components exist only in git history.

**R-2 — The capture side is complete and better than 2.6 had.** Every check
writes a `section_checks` row: the full `responses` map, the `verdicts` map
*including the feedback text the student was shown*, version-pinned
(`activity_version_id`, RESTRICT), attempt-numbered per (student, version,
section), idempotent. RLS already grants the teacher read via
`can_read_activity` and the student their own rows. The teacher-side index
(`activity_id, student_id, created_at desc`) was built in 0020 for exactly
this dashboard.

**R-3 — The wire seam exists; the viewer side is a BUILD, not wiring**
(reworded per outside voice #12). `CheckService.fetchReleasedFeedback` and
`ReleasedFeedbackResult` exist with zero call sites, and `ShortAnswer.tsx`'s
render contract is a comment, not code: the store holds no released-feedback
state, nothing fetches, nothing renders. The wire type also needs widening
(stale flag, attempt number, version tag — G5). `StudentViewer` still
constructs a `feedbackUrl` pointing at the deleted function (tombstoned in
place); G5 deletes it. **How a score renders on a surface whose exemplar rule
is "never a verdict glyph, never a score" is a named design-review input.**

**R-4 — `grades` as written keys on a dead world.** `(submission_id,
block_id)` unique, FK → `submissions` (empty, write path demolished), and
`can_grade_submission` routes through the dormant assignments table. Nothing
about the 0010 shape survives contact with checks except its good ideas:
mutable grade rows, criteria jsonb against the pinned rubric, `grade.upsert`
already in the `audit_action` enum.

**R-5 — The write-path precedent has MOVED since 0010.** 2.6 ruled direct RLS
upserts; every privileged mutation since 0027 is an audited SECURITY DEFINER
RPC with contract strings that reach the UI (0027 class RPCs, 0030 share RPCs,
0033 promotions). Grading is a teacher mutating a student's academic record —
the FERPA-shaped kind of write the audit trail exists for.

**R-6 — The teacher already has a per-activity analytics surface.**
`ActivityAnalytics` (S7) reads `section_checks` live against the census. A
grading surface is its sibling: same route family, same data source, same
version-pinning discipline. 0030's `class_activities` also exists now.

**R-7 — Retention interlocks are live and must be extended, not assumed.**
`purge_soft_deleted` (as re-created by 0029 — the current definition) purges
`section_checks` by activity and by student (0022). `check_grades` CASCADEs
from `section_checks` so the purge stays complete without editing the purge
function — with verify rows proving it (P3/P7).

**Live baseline (2026-08-15):** 0 students, 0 checks, 0 grades. Migration cost
of any shape decision here is near zero.

## 2. THE RULED ARCHITECTURE — G1–G14 (eng review 2026-08-15; supersedes the draft's D-numbered recommendations where they conflict)

**G1 — One new table, and the dead one dies in the same migration.**
`check_grades (id, check_id FK→section_checks ON DELETE CASCADE, block_id,
criteria jsonb, general_feedback text, graded_by uuid REFERENCES users ON
DELETE SET NULL, graded_at, updated_at, released_at, unique(check_id,
block_id))`. `criteria` entries are `{criterionId, earned, maxPoints,
feedback?}` — **maxPoints DENORMALIZED at grade time** so no read path ever
touches document content (the 0020 leak-hazard discipline). `graded_by` SET
NULL follows 0024's event-outlives-account pattern ("former teacher" in UI).
Migration **0034 also DROPS `grades` + `can_grade_submission`** (0029 kept
them only for this decision; the P5 citation audit of every comment/verify row
naming them lands in the same commit). `submissions` is deliberately NOT
touched — its retirement is a separate TODOS entry.

**G2 — Attempts vs latest (the S4 deferral, RULED).** Grades key on a
specific check row — immutable "what was graded." The queue surfaces the
latest check per (student, section) **within a version** (version identity is
explicit: block AND section ids never cross versions). **Stale = the graded
check's free TEXT for that block differs from the latest same-version check's
text** — never "a newer check row exists" (re-checking to retry auto-graded
blanks is a designed feature and must not fire false warnings). Where one
block has several released grades, **the latest by `graded_at` wins**
everywhere (queue, readback, wire).

**G3 — `upsert_check_grade` — audited DEFINER write.** Gated on
**`can_edit_activity`** (byte-identical to `can_read_activity` today; immune
to the recorded Activity-Bank read-widening landmine). Validates: block is a
graded free-text type (`short_answer`/`essay` — never `self_explanation`,
never another category's id) **belonging to the check's own section in the
pinned version — response presence NOT required** (an unanswered essay is
gradable; the queue marks it "no answer"); criteria ids ⊆ the pinned rubric's;
earned ≤ maxPoints, server-side. **Teacher feedback is PLAIN TEXT end-to-end
in v1** — the wire carries a string, React escapes it, no inline-node payload
exists to sanitize; rich feedback is a future additive. Audit row per save
(`grade.upsert`); refusal strings join `authContract.json` + pin test. Client
INSERT/UPDATE denied outright.

**G4 — Release: an explicit, AUDITED, visible event.**
`release_check_grades(activity_id, student_id)` stamps `released_at` on that
student's unreleased rows and writes a **`grade.release`** audit row (new enum
value; the most FERPA-significant event in the slice). Released rows STAY
released — teacher edits to a released grade go live immediately (no
silent-vanish state can exist). A grade saved after release sits unreleased
**visibly**: the queue derives an "N unreleased" badge per student and the
release button re-arms. No sticky state, no auto-publish.

**G5 — Student readback: `get_my_released_feedback(activity_id)`, SECURITY
DEFINER, deny-by-default table** (the 0030 `list_class_activities` precedent —
an INVOKER read would widen the policy surface and still need a second query).
Scoped to `auth.uid()`; returns released rows only, one round trip, in the
widened wire shape: plain-text feedback, per-criterion earned/maxPoints (from
the denormalized jsonb), graded attempt number, stale flag (G2 semantics),
and the row's `activity_version_id`. The tombstoned `feedbackUrl` in
`StudentViewer`/`httpCheckService` dies; readback goes through PostgREST like
every other authed read. **The get-feedback rule: a verify row proves a real
body round-trips** (P9 — a readback that "works" while serving nothing is
this slice's named failure mode).

**G6 — Version drift on readback: tag, don't map.** Feedback renders inline
where its block id resolves against the served document; rows against other
versions render a per-activity notice ("feedback on an earlier version of
this worksheet"). No id-mapping infrastructure. (Teacher side: G8's
per-version grouping is the same rule.)

**G7 — Gradability scope.** `short_answer` + `essay` only;
`self_explanation` is readable in the response view but never gradable.
General feedback without a rubric is allowed on graded types.

**G8 — The teacher surface: a "Responses" tab, sibling to Analytics.**
Per-activity queue **grouped by version — current published version expanded,
earlier versions collapsed** ("work on earlier versions"); within a version,
students × sections, needs-grading filter default, side-by-side layout
(student text left, rubric right; 2.6 components salvaged from git history
where useful). Class grouping via 0030 data is a filter, not the organizing
principle. **The rubric panel uses an explicit Save button** — grading is a
deliberate act; autosave would flood the audit trail and re-import the
popover flush-on-close bug class.

**G9 — Containment is proven, not assumed.** `pending` × all four RPCs
refused; student × upsert/release refused; teacher-of-a-different-activity
refused; student A never reads student B. Each a verify row (0033
discipline).

**G10 — The queue read: `list_grading_queue(activity_id)`, one DEFINER RPC.**
Latest check per (student, section) per version; **free-text-only projection**
(a check row's `responses` carries graphs and every blank — megabytes the
grading UI must not ship); existing grade rows (criteria, feedback,
released_at) joined in so the panel can re-open a grade — **no student-side
or extra teacher-side policy on `check_grades` exists at all**; stale flag
computed server-side where both texts are local. Gated on
`can_read_activity` (a read), while writes gate on `can_edit_activity` (G3).

**G11 — Retention.** `check_grades` CASCADEs from `section_checks` (activity
purge and student purge both covered — P7-counted verify rows) and from the
teacher side via `graded_by` SET NULL (a third verify row: teacher purge
leaves the student's grade intact and anonymized).

**G12 — The S7-8 inheritance: RULED HERE, BUILT LATER.** This slice's G2
ruling unblocks check-pruning and the durable rollup; both stay owned by the
TODOS entry, which gains the one consequence that matters: **pruning must
never delete a check row referenced by `check_grades`** — a graded check is
the record, and the CASCADE that makes retention free would otherwise make
pruning destructive.

**G13 — Wire widening.** `ReleasedBlockFeedback` becomes
`{feedbackText?: string, criteria?: Array<{label, earned, maxPoints,
feedbackText?}>, attemptNumber, stale, activityVersionId}`;
`ReleasedFeedbackResult.graded` stays. The mock (`check/mock.ts`) and the
conformance factory follow. How scores render on the recorded family — whose
exemplar rule is "never a verdict glyph, never a score" — is the design
review's question, explicitly.

**G14 — The offline guarantee is a regression constraint.** Readback failure
degrades to `graded:false` — never a throw into the store. Two CRITICAL rows:
the unit degrade row, and an sw-lane row proving offline reopen stays green
with the feedback endpoint unreachable. (S9 Drop 5 made offline reopen true
for the first time; this slice must not un-make it.)

## Data flow

```
TEACHER                                          STUDENT
Responses tab                                    /a/:activityId viewer
   │                                                │
   ├─ list_grading_queue(activity_id) ──────┐       ├─ checkSection ──► check-activity ──► record_check
   │   DEFINER · can_read_activity          │       │                                        │
   │   latest check /(student,section)/ver  │       │                              section_checks (0020)
   │   free-text projection + grade rows    │◄──────┼────────────────────────────────────────┘
   │   + server-side stale (text compare)   │       │
   ▼                                        │       ├─ fetchReleasedFeedback ─► get_my_released_feedback(activity_id)
side-by-side panel                          │       │     DEFINER · auth.uid() scope · released rows only
   │  explicit Save                         │       │     latest-released-by-graded_at per block
   ├─ upsert_check_grade(check_id,block_id,…)       │     {feedbackText, criteria+maxPoints, attempt, stale, versionId}
   │   DEFINER · can_edit_activity                  │     └─ fetch fails ⇒ graded:false  (G14, CRITICAL)
   │   validates: type ∈ section ∈ pinned version   ▼
   │   criteria ⊆ rubric · earned ≤ max         ShortAnswer/Essay render (teacher-attributed;
   │   audit: grade.upsert                      version-mismatch rows → notice, not mapping)
   ▼
check_grades ──(unreleased rows)──► "N unreleased" badge → Release button re-arms
   │
   └─ release_check_grades(activity_id, student_id)
       stamps released_at · audit: grade.release
```

## 2b. G8-DR — THE DESIGN RULING (plan-design-review, 2026-08-15; board:
`~/.gstack/projects/ZanReed-activity-platform/designs/responses-tab-20260815/wireframes.html`, approved.json beside it)

Score 4/10 → 9/10, nine decisions (D4–D12). **One eng-layout amendment:** the
outside voice's strongest finding overturned G8's version-header layout — G2's
per-version DATA semantics stand untouched, but the queue's level-1 is the
workload ("7 need grading"), and earlier-version rows carry a muted version
TAG (shown only when ≥2 versions have work) — G6's "tag, don't map" applied
to the teacher side.

- **Composition (D4):** two-pane master–detail, ≥960px; queue grouped
  **BY QUESTION** (section → question → student rows; the selectable unit is
  a (student, block) response — a section with two essays is two rows, and
  the panel shows one block response at a time). By-student view is a
  recorded follow-on, not a toggle in v1. Below 960px: list → panel push
  view with a back link. Rubric panel scrolls independently; the Save row is
  sticky at the panel's bottom.
- **Save flow (D8):** Save advances to the next ungraded item in queue
  order; Enter submits from the points fields; switching selection with
  dirty edits gets a confirm prompt ("Discard unsaved grade?") — the
  flush-on-close bug class, closed by a prompt rather than a soft-block.
- **Staleness (D5):** the amber "Text changed since grading" chip is the
  ONLY amber on the surface, and **a stale row re-enters the needs-grading
  set** wearing it — revision never silently vanishes behind "Graded".
- **Release (D10):** per-student button always carries its count ("Release
  2 graded to Maya" — preview-in-the-button, no modal); a header **"Release
  all graded (N students)"** iterates the same audited RPC. The panel shows
  a persistent released state — "Released · visible to student · edits
  appear immediately" — styled distinctly from the unreleased editing state.
- **G13 RULED (D6):** teacher-entered points are not a spirit violation —
  **attribution is the distinction.** The student card: feedback-first,
  "Feedback from your teacher" header BEFORE any number, per-criterion
  points as quiet text data ("4/4"), **no total, no glyphs, no state-chrome
  tokens**, rendered in the authored-content register below the block, never
  adjacent to the StatePill. The ShortAnswer exemplar comment is amended in
  the same commit (P5): "never a score" → "never a score in the system's
  voice."
- **Discoverability (D11):** when released feedback exists, the recorded
  pill's LABEL overrides to **"Reviewed by your teacher"** — same state,
  same glyph, union stays closed at four; the family spec blesses the label
  override in the same P5 amendment. Home-level indicator stays in its TODO.
- **Preview (D12):** the panel renders the D6 student card as an "as the
  student sees it" preview — same component, same wire shape, mounted twice.
- **States (D7):** empty ("No responses yet · When students check sections
  with written answers, they'll appear here."), all-caught-up ("All caught
  up ✓ · Every written answer is graded. **· N not yet released**" +
  [Show graded]), no-written-questions ("This activity has no written-answer
  questions."), failed save (panel keeps all entered work, inline error on
  Save, retry reuses the payload), loading (queue skeleton; student side
  reserves the card space — feedback appears on next open, never pops in
  live), stale-while-grading (Save against a superseded check still
  succeeds — grades pin to check rows; the row picks up the amber chip on
  next queue refresh; no live push), student-stale ("You've revised your
  answer since this feedback." — the card persists, never disappears on
  re-check), version-mismatch ("On an earlier version of this worksheet —
  your newest answers aren't graded yet.").
- **Copy table (contract-string candidates, all above plus):** chips "Needs
  grading" / "Graded" / "Text changed since grading" / "N unreleased";
  "No answer" (italic) for response-less blocks; attribution variants
  "Feedback from your teacher" / "from a former teacher" (the SET NULL
  case); "On your answer from attempt N · {date}".
- **A11y block:** points inputs labeled per criterion with the max static
  ("/ 4"), clamped 0..max; the dirty prompt is a focus-trapped dialog (the
  B14 pattern); the released-state line and save/release outcomes announce
  through a role=status region with contract strings; the pill override's
  label change announces via StatePill's existing aria-live; the feedback
  card is a labeled region; 44px targets; the a11y lane gains an axe row for
  the Responses tab and asserts the announcement strings (the R9/0033
  discipline).
- **Salvage scoping (anti-resurrection):** from the 2.6 components, ONLY the
  rubric criterion-row rendering and the points-clamp logic are salvage
  candidates; everything else is greenfield — the old components were built
  against the dead submissions world.

## 3. NOT in scope

- **Score aggregation / a gradebook** — no totals across sections or export.
- **Check pruning + durable rollups** — RULED here (G2), built in the TODOS
  entry that owns them (G12 records the destructive-cascade constraint).
- **Feedback discoverability** (Home indicator for unread released feedback) —
  own TODOS entry; designed together with the DR-11 recency cue.
- **`submissions` retirement** — own TODOS entry; separate migration, never
  bundled into 0034 (the purge function deserves its own commit).
- **Leveled rubric grids, rubric template library** — additive later (2.6
  rulings unchanged).
- **Rich-text teacher feedback** — v1 is plain text by ruling (G3); additive.
- **Notifications** — realtime-push arc's trigger list gains a candidate.
- **Photo grading** — separate design; its server-side answer access arrives
  with this slice.

## 4. What already exists (reuse inventory, honest edition)

Reused verbatim: `section_checks` + indexes/RLS (0020) · in-document `Rubric`
schema + authoring UI (2.6 slice 2) · `can_read_activity`/`can_edit_activity`
· `audit_action.'grade.upsert'` (0010) · the 0027/0030 audited-RPC posture +
`authContract.json` pin test · `ActivityAnalytics`'s route family · 0022's
purge structure (inherited via CASCADE). **Built, not wired** (R-3): the
released-feedback store state, the readback client, ShortAnswer/Essay's
feedback rendering, the widened wire + mock + conformance rows. Built new:
one table, four RPCs, one enum value, two drops, the Responses tab, ~35
verify rows + RTL/e2e. Salvaged from git history: the 2.6 side-by-side +
rubric-entry components.

## 5. Verification matrix (the build must arrive with it)

Upsert: valid insert / valid update / wrong-teacher / pending / student-caller
/ non-graded-type (self_explanation AND a non-free-text id) / block ∉ check's
section / criterion ∉ rubric / earned > max / **unanswered block accepted +
marked** (10). Release: valid + audit row / idempotent re-release /
wrong-teacher / **post-release upsert sits unreleased + badge derivation**
(4). Readback: **body round-trips (P9, the get-feedback rule)** / released-
only / scoped to caller (A never sees B) / zero grades → graded:false / stale
ON when text changed / **stale OFF on identical-text re-check (the 1A
false-positive row)** / version-mismatch tagged / **latest-released-by-
graded_at wins with two released rows** (8). Drops: P5 audit — no verify
script or comment still asserts `grades`/`can_grade_submission` (2). Queue:
free-text-only payload (no graph jsonb) / per-version grouping / needs-
grading derivation / grade rows joined (4). Retention: activity purge
cascades (P7 counts) / student purge cascades / **teacher purge → SET NULL,
grade intact** (3). Viewer: **CRITICAL fetch-fail degrade** / **CRITICAL sw-
lane offline reopen with feedback endpoint dead** / RTL earned-clamp / RTL
release-badge states / integration-lane grade→release→student-sees round trip
(5). ~36 rows.

## Failure modes (per new codepath; test / handling / visibility)

| Failure | Test | Handling | Seen |
|---|---|---|---|
| Readback endpoint unreachable | G14 CRITICAL rows | degrade to graded:false | student sees nothing (correct) |
| Republish between grading and readback | version-tag row | G6 notice | "feedback on an earlier version" |
| Student re-checks, text unchanged | 1A false-positive row | no stale flag | nothing (that's the point) |
| Student re-checks, text changed | stale rows | flag in queue + readback | teacher + student both see it |
| Teacher grades after releasing | badge row | unreleased badge + re-armed button | "N unreleased" |
| Two released grades, one block | winner row | latest graded_at wins | one coherent feedback card |
| Teacher account purged | SET NULL row | 0024 pattern | "former teacher" attribution |
| Cross-section grade write | G3 refusal row | RPC refuses, contract string | inline error |
| Double-click Save | idempotent-upsert row | unique(check_id,block_id) upsert | one save, one audit row |
| Pruning (future) deletes a graded check | G12 sentence + follow-on's verify | constraint recorded in TODOS owner | n/a here |

No silent failure survives the table. **Critical gaps: 0** (the two CRITICAL
rows are requirements, not gaps).

## Worktree parallelization

| Step | Modules touched | Depends on |
|---|---|---|
| S1: migration 0034 + verify-0034 | supabase/, scripts/ | — |
| S2: wire widening + readback client + store + block rendering | packages/viewer/ | S1 (RPC names/strings) |
| S3: Responses tab + queue + release UI | packages/app/ | S1 + S2 + the design review |
| S4: docs (TODOS entries, STATE, manual-grading tombstone) | docs/, TODOS.md | — |

Lane A: S1 → S2 → S3 (sequential — each derives from the previous contract).
Lane B: S4 (independent). The design review gates S3's compositions but not
S1/S2. **Note:** S2 touches the viewer's server-bundle inputs only if the
sanitize/registry source changes — it should NOT; if a change drifts into
those files, the bundle rules in CLAUDE.md apply.

## Implementation Tasks

Synthesized from this review's findings. Checkbox as you ship.

- [x] **T1 (P1, human: ~2d / CC: ~1h)** — supabase — Migration 0034:
  `check_grades` (G1 shape incl. denormalized maxPoints + SET NULL), the four
  RPCs (`upsert_check_grade`, `release_check_grades`,
  `get_my_released_feedback`, `list_grading_queue`), `grade.release` enum
  value, DROP `grades` + `can_grade_submission`
  - Surfaced by: G1–G5, G10 (review issues 1–6, OV #1/#3/#8/#10)
  - Files: supabase/migrations/0034_*.sql
  - Verify: local replay 0001→0034 clean; rolled-back live rehearsal (0029/0030 discipline)
- [x] **T2 (P1, human: ~1d / CC: ~40min)** — scripts — verify-0034: the ~36-row
  matrix of §5, incl. the P5 audit rows for the drops and the three P7-counted
  retention rows
  - Surfaced by: §5; P3/P5/P7/P9 disciplines
  - Files: scripts/verify-0034.sql + runner registration
  - Verify: `pnpm verify:auth --target local` green on a rebuilt DB
- [x] **T3 (P1, human: ~1.5d / CC: ~45min)** — viewer — the feedback BUILD:
  wire widening (G13), PostgREST readback client replacing the tombstoned
  feedbackUrl, store state, ShortAnswer/Essay rendering, mock + conformance
  rows, the CRITICAL degrade row
  - Surfaced by: R-3, G5, G13, G14 (OV #11/#12)
  - Files: packages/viewer/src/check/wire.ts, client/httpCheckService.ts,
    check/mock.ts, blocks/ShortAnswer.tsx + Essay, container store;
    packages/app/src/routes/StudentViewer.tsx (kill feedbackUrl)
  - Verify: viewer suite + the sw-lane offline row; **run `pnpm
    bundle:grading-server` + `bundle:viewer-server` and check for drift —
    wire.ts is shared source**
- [ ] **T4 (P1, human: ~2d / CC: ~1h)** — app — the Responses tab per G8/G4:
  per-version queue, side-by-side panel with explicit Save, release button +
  unreleased badge, needs-grading filter; contract strings + copy tables
  - Surfaced by: G4, G8, G10 (issues 2, 6; OV #13)
  - Files: packages/app/src/routes/ActivityResponses.tsx (new), App.tsx route,
    lib/grading.ts (new), lib/authMessages.ts, RTL suites
  - Verify: RTL rows; **blocked on the design review's compositions**
- [ ] **T5 (P2, human: ~0.5d / CC: ~20min)** — integration lane — the
  grade→release→student-sees round trip through real PostgREST + the refused
  containment rows
  - Surfaced by: G9, §5 integration rows
  - Files: packages/app/e2e/integration/integration.e2e.ts, contract.ts
  - Verify: `pnpm --filter @activity/app test:e2e:integration` green (supabase stop after)
- [ ] **T6 (P2, human: ~2h / CC: ~15min)** — docs — TODOS: the G12 pruning
  sentence into the retention/rollup entry; the two new entries (feedback
  discoverability; submissions retirement); manual-grading.md status line
  corrected to name this doc as successor; STATE pointer
  - Surfaced by: G12, TODO rulings D15/D16, R-1 (drift)
  - Files: TODOS.md, docs/design/manual-grading.md, STATE.md
  - Verify: drift-audit clean

_No new tasks from the Performance section beyond G10 (folded into T1)._

## Approved Mockups

| Screen/Section | Mockup Path | Direction | Notes |
|----------------|-------------|-----------|-------|
| Responses tab (Rows 1–2) + student feedback card (Row 3) + state set (Row 4) | `~/.gstack/projects/ZanReed-activity-platform/designs/responses-tab-20260815/wireframes.html` | Two-pane by-question queue; feedback-first teacher-attributed card; utility APP-UI in the app's own tokens | Approved 2026-08-15 (approved.json beside the board); version headers DEMOTED to row tags post-approval (D9) — amend at build time |

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | (not installed; Claude subagent served as the outside voice) |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | **CLEAR (PLAN)** | 6 review issues + 14 outside-voice findings — all ruled; 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | **CLEAR (FULL, 2026-08-15)** | score 4/10 → 9/10, 9 decisions (D4–D12); board approved (§2b G8-DR) |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **CROSS-MODEL (design):** The design outside voice's independent read converged on the board's 3A for G13 and added the layout rules that keep it safe; its strongest finding (version headers = wrong level-1) OVERTURNED G8's layout half (D9 — data semantics untouched), and its two critical findings (released-state chrome; zero student-perceivable release signal) both shipped as rulings (D10/D11).
- **CROSS-MODEL (eng):** The Claude-subagent outside voice raised 14 findings; 8 absorbed as amendments (feedback = plain text; maxPoints denormalized; can_edit_activity gate; SET NULL graded_by; queue returns grade rows; pruning constraint recorded; honest reuse wording; convergent offline row), 4 ruled as tensions (per-version queue + latest-released-wins; explicit-save + grade.release audit; 5A amended for unanswered blocks; release stays an event with a visible unreleased badge), 1 convergent with the review's own regression rule, 1 (strategic framing) absorbed into the doc's Why-now + a discoverability TODO. Scope rulings: explicit release KEPT; S7-8 rollups rule-only.
- **VERDICT: ENG + DESIGN CLEARED — ready to implement T1–T5, with §2b as T3/T4's UI spec.**

NO UNRESOLVED DECISIONS
