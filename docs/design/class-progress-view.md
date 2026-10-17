# Class progress — a teacher's per-student view of auto-checked work

**Status:** RULED 2026-10-17: CP-1 to CP-9 all as recommended (CP-3 A, the
plain answer list; CP-5 names shown with a Hide names switch). Earlier the
same day: build it; **per class first** (not per activity). Next: eng review.

## Why

The author completed six activities as a test student (36 section checks on
live, 2026-10-15/16) and found no way to see that work as the teacher. Today
the teacher side has:

- **Analytics** (`/activity/:id/analytics`): class-wide counts per block kind
  for ONE activity. No names, no per-question or per-student rows
  (`get_activity_analytics`, 0036:638). Per-student analytics were deferred in
  0026 and again in check-retention-and-rollup.md:190.
- **Responses** (`/activity/:id/responses`): the grading queue, HAND-graded
  answers only (short answer, essay), by question (`list_grading_queue`,
  0034:445). Linked from the activity row since `88dd812a`.

Nothing answers "how is each of my students doing on what I assigned?" The
grading design recorded a by-student view as a follow-on
(teacher-grading.md:242) and ruled a gradebook out of its scope (:305).

## What exists to build on

- **Roster:** `class_members` (0014:87), live rows `removed_at is null`; the
  teacher reads it through `list_class_members` (0014:265, `is_class_teacher`,
  returns display_name + email because users RLS is self-only).
- **Assigned work:** `class_activities` (0030:52), one row per activity shared
  to a class.
- **The work itself:** `section_checks` (0020:58): per student × version ×
  section × attempt, with `responses`, `verdicts` (per-item verdict, feedback,
  misconception ids) and, since 0059, `section_total`.
- **The "done" rule already exists:** a version is done when a student's
  distinct checked sections reach `section_total`; a NULL total reads
  "Started", never "Done" (0059:9-15). `my_activity_progress()` computes it
  for the student; nothing computes it for a teacher.
- **Access precedent:** the class number-facts page (`/classes/:classId/facts`,
  `fact_sprint_overview`, 0051) is SECURITY DEFINER, gated on
  `is_class_teacher`, and names students as
  `coalesce(display_name, email, 'Unknown')`. Its rulings keep names behind a
  disclosure on screens that may be projected (practice-blocks.md DR-19/21/22).
- **The access trap to avoid:** the teacher RLS policy on `section_checks` is
  `can_read_activity` (activity OWNERSHIP), so it would return any student who
  checked the teacher's activity, including students in no class of theirs.
  0059/0060 deliberately did not widen it. The new reads must be scoped by
  ROSTER (live `class_members`) × ASSIGNMENT (`class_activities`).

## Decisions (recommendation first; the author rules each)

**CP-1 — Where it lives.** `/classes/:classId/progress`, opened from each
class on the Classes page (beside its number-facts link). *Recommend:* yes.
The class is the unit a teacher thinks in, and the facts page is the
precedent.

**CP-2 — The grid.** Rows = students on the live roster (sorted by name);
columns = the class's assigned activities, in the order the Classes page
shows them. Each cell shows **status** (— not started · *Started 2/5* sections ·
*Done*) and the **latest score**: correct ÷ marked items across each section's
latest attempt (recorded-only items, e.g. essays, excluded). *Recommend:* yes,
with status as the main read and the score as secondary text.

**CP-3 — Opening a cell (one student, one activity).** *Recommend:* **A, a
plain answer list:** per section, each question's label, the student's latest
answer as text, ✓/✗, attempt count, and any authored feedback or
misconception the grader attached. *Alternative B:* render the activity in the
viewer, read-only, with the student's answers filled in (richer, but needs the
student's seeded/shuffled document rebuilt teacher-side and a new grader path;
a later slice if A proves thin).

**CP-4 — Data access.** Two new SECURITY DEFINER reads, both gated on
`is_class_teacher(p_class_id)` and scoped to live roster × assigned
activities, never to activity ownership: `class_progress(p_class_id)` (the
grid) and `class_student_work(p_class_id, p_student_id, p_activity_id)` (the
cell). One migration; `can_read_activity` is NOT widened. *Recommend:* yes.
Reads only: no new personal data stored, so the data map gains no table, but
the compliance pack notes a new teacher READ path to student answers.

**CP-5 — Names on screen.** The grid is a desk view, but a teacher may open it
with a projector on. *Recommend:* **names shown, with a "Hide names" switch**
that replaces them with "Student 1, 2…" and is remembered on this device.
*Alternative:* the facts-page rule (names closed until a disclosure is
opened), consistent but awkward on a page whose whole point is who is where.

**CP-6 — Older versions.** A student who checked an earlier published version
is shown against THAT version's sections and total, with an "older version"
chip, the same rule the student's own progress uses (0059). *Recommend:* yes.

**CP-7 — Hand-graded answers in the grid.** A cell with ungraded short
answers or essays shows "N to grade", linking to that activity's Responses.
*Recommend:* yes; it ties the two teacher surfaces together at no data cost
(the grading tables already hold it).

**CP-8 — Refresh.** Loaded on open, with a Refresh button and the time of the
last load. No live updates (the realtime client is stubbed until the realtime
arc). *Recommend:* yes.

**CP-9 — Students who left.** Only the live roster appears; a removed
student's work stays stored but is not shown here. *Recommend:* yes (the
roster is what carries the teacher's right to see the work).

## Not in scope (v1)

Per-activity-across-classes view (ruled: per class first); exports (CSV,
gradebook sync); number facts (their own page); live updates; a teacher
annotating a student's auto-checked answer; per-skill or misconception
summaries across activities.

## Cost (if ruled as recommended)

One migration (two RPCs + grants + a verify script), `pnpm` types, one new
teacher route (lazy, outside the student shell) plus a link on Classes,
component + RPC tests, an e2e row in the editor lane, compliance pack note.
No Edge Function or grading-bundle change. Next after rulings: /plan-eng-review
(it needs a migration).

## Eng review (2026-10-17)

**Target:** this file (CP-1..CP-9 ruled). **Scope record:** feature answers CP-1..CP-9 (author, 2026-10-17); structure A Original arrangement (D1); accepted scope: the Cost section; pending remedies: R1. **Scope Challenge: scope accepted as-is.**

### Reality rows

- REALITY: premise-table pass — 7 premises, 0 unverified: teacher RLS on checks is ownership (0020:118 `can_read_activity`); share requires edit rights so a class teacher owns every assigned activity (0030:100-103); "done" = distinct sections ≥ `section_total`, NULL reads Started (0059:239-260); answers live in seven families (wire.ts:55-94); seeds are `versionId:studentId` and pure (serveSeed.ts:22-23, seedValues.ts:47, substitute.ts:66); 0 of 23 live activities are seeded or shuffled (live read 2026-10-17); 36 checks by the test student (live read).
- REALITY: already-done pass — no `class_progress` / `class_student_work` anywhere; the only by-student mentions are follow-ons (teacher-grading.md:242).
- REALITY: surface-check pass — `is_class_teacher` (0014:112), `list_class_members` (0014:265), `share_activity_to_class` (0030:90), `AUTH_VERIFY_SET` (verify-runner.mjs:62).
- REALITY: binding-decisions pass — 0059/0060 rule "`can_read_activity` is NOT widened" (0059:29-30) is honoured: the new reads gate on `is_class_teacher` and scope to roster × assignment.
- REALITY: numbers n/a — no budget numbers; the route is lazy (teacher-only), outside the student shell.
- REALITY: deferred-asks pass — the author's ask ("read that data on the teacher side") is answered by CP-1..CP-4; per-activity-across-classes deferred by ruling.
- REALITY: pr-count n/a — commits to main; the migration is applied live BEFORE the SPA push (OV-7: a push is a deploy).

### Section 1 — Architecture

- [P2] (confidence: 9/10) wire.ts:55-94 — CP-3's "the student's latest answer as text" is defined only for typed answers. Five of seven families store IDS or COORDINATES (`choices`, `matches`, `correspondences`, `orderings` hold choice/item ids; `graphs` holds points), so "as text" needs a per-family rule or the list shows raw ids. → R1.
- [P2] (confidence: 9/10) serveSeed.ts:22, substitute.ts:66 — a seeded activity shows each student different numbers, so labels must be built from THAT student's served document (`deriveSeedValues(seedVars, serveSeed(versionId, studentId))` then `substituteSeedValues`), both pure and deterministic, client-side. Necessary implementation of CP-3 (show what the student saw); no question. No live activity is seeded today (0/23), so a fixture pins it.
- [P3] (confidence: 9/10) 0030:103 — labels come from `activity_versions.content`, read under the teacher's own RLS for EVERY version a student checked (CP-6). Ownership holds by construction (share needs `can_edit_activity`). A soft-deleted activity drops out of the grid. Necessary implementation; no question.
- [P3] (confidence: 8/10) 0059:239-260 — checks recorded before 0059 have NULL `section_total` and read "Started" forever, even when every section was checked. CP-6 ruled "the same rule the student's own progress uses", so the teacher grid matches the student's own screen. Carried as ruled; noted so nobody "fixes" one side only.

Dispositions: R1 pending (D2); the rest carried as required implementation of CP-3/CP-6.

## Decision ledger

### R1: how each answer type reads in the plain answer list
Finding: 1, P2, 9/10, packages/viewer/src/check/wire.ts:55-94, Claude (Section 1)
Plan baseline: CP-3 A (author, 2026-10-17): "the student's latest answer as text"
Runtime evidence: answer families = blanks (text), freeText (text), choices (choice ids), matches (id→id), correspondences (nested ids), orderings (id lists), graphs (points + interaction kind)
Comparison grid:
| Choice | Current | A | B |
|---|---|---|---|
| R1 per-family text | unspecified | every family as words: choice/item ids resolved to their labels from the student's served document; graphs as coordinates ("plotted 1.09, 1.1, 1.15, 1.2"; "(2, −3)") | typed answers and choices as words; matches, correspondences, orderings and graphs show ✓/✗ only with "open in viewer (later)" |
| CP-3 A plain list | approved | kept | kept |
Question D2:
D2 — In the plain answer list, how should non-typed answers (choices, matching, ordering, graphs) read?
Project/branch/task: activity-platform on main, class progress view (CP-3 A).
ELI10: Only two answer types are typed words (blanks, short answers). The others are stored as hidden ids or coordinates: a multiple-choice pick is an id, a matching is pairs of ids, a number line is a list of points. To show them to you as text, each id has to be turned back into its label from the activity, and each graph into numbers. Option A does that for all seven types. Option B shows only a tick or cross for the structured types.
Stakes if we pick wrong: B leaves you seeing ✗ on a number line with no idea what the student plotted.
Recommendation: A because the point of the page is seeing what the student did, and every label is already in the document you own.
Completeness: A=10/10, B=6/10
Pros / cons:
A) Every type as words (recommended)
  ✅ You see the student's actual pick, pairing, order or plotted points, not just a cross
  ✅ One formatter module, unit-tested per type, shared with any later view
  ❌ More formatter code and tests: seven types instead of three (human: ~1 day / CC: ~45min)
B) Ticks for structured types
  ✅ Smallest build: words only for blanks, short answers and multiple choice
  ❌ Number lines, graphs, matching and ordering show ✓/✗ with no detail until a later slice
Net: a day of formatter work buys seeing what was actually answered.
Header: Answer text
Options:
A) Every type as words (recommended)
All seven families as text: choice, match, correspondence and ordering ids resolved to their labels from the student's served document; graph work as coordinates (number lines as plotted values, 2-D points as (x, y), with "no solution" when chosen). One formatter module with a unit test per family. Effort human ~1 day / CC ~45 min.
B) Ticks for structured types
Blanks, short answers and multiple choice as text; matching, correspondence, ordering and graph answers show only ✓/✗ (detail deferred to a later viewer-based slice). Effort human ~3h / CC ~15 min.

State: approved
Actual answer: A) Every type as words (D2, author, 2026-10-17)
Accepted scope: one formatter module rendering all seven families as text from the student's served document (choice, match, correspondence and ordering ids resolved to labels; graphs as coordinates, number lines as plotted values, "no solution" when chosen), a unit test per family
History: none

### Section 2 — Code quality

- [P2] (confidence: 9/10) 0059:207-270 `my_activity_progress()` — the class grid needs the SAME "done" arithmetic (distinct sections vs the latest non-NULL `section_total`, per version, older-version flags), for every rostered student instead of `auth.uid()`. Two verified callers of one rule (the live student function and the proposed `class_progress`), and the student's screen and the teacher's grid must never disagree. → R2.
- [P3] (confidence: 8/10) 0045:484, 0051:58 — name every student with the facts pages' `coalesce(nullif(btrim(display_name),''), email, 'Unknown')`, not `list_grading_queue`'s email-only label (0034). Necessary implementation of CP-2/CP-5; no question.

Dispositions: R2 pending (D3); the naming note carried.

### R2: one "done" rule for the student's screen and the teacher's grid
Finding: Section 2 #1, P2, 9/10, supabase/migrations/0059_student_progress.sql:207-270, Claude
Plan baseline: CP-6 (author): same rule as the student's own progress
Runtime evidence: `my_activity_progress()` is live (0059 applied 2026-10-15), SECURITY DEFINER, filtered on `auth.uid()`
Comparison grid:
| Choice | Current | A | B |
|---|---|---|---|
| R2 sharing | n/a | `class_progress` writes its own SQL; verify-0061 adds an AGREEMENT row: for a seeded student, class_progress's cells equal my_activity_progress run as that student | extract a private SQL helper `activity_progress_of(student)` used by both; my_activity_progress is re-created on top of it |
| live student path | untouched | untouched | re-created in 0061; verify-0059 re-run |
Question D3:
D3 — Should the teacher grid share the student's "done" code, or duplicate it with a test that they agree?
Project/branch/task: activity-platform on main, class progress view (CP-6).
ELI10: Your students' own progress screen already works out "Done / Started 2 of 5" in the database, and it's live. The teacher grid needs exactly the same sum for every student. We can pull that sum into one shared piece both screens call, which means rebuilding the live student function. Or write the teacher version separately and add a check that runs both on the same student and fails if they ever disagree.
Stakes if we pick wrong: sharing risks breaking a live student screen; duplicating without the check lets the two screens drift.
Recommendation: A because it leaves the live student path untouched and the agreement row catches drift the day it happens.
Completeness: A=9/10, B=9/10
Pros / cons:
A) Separate + agreement check (recommended)
  ✅ The live student progress function is not touched by this migration at all
  ✅ A verify row runs both on the same student and goes red the moment they disagree
  ❌ The rule exists twice in SQL, kept in step by a test rather than by construction (human: ~2h / CC: ~15min)
B) Shared helper
  ✅ One rule by construction; a future change lands in both screens at once
  ❌ Re-creates a live student function in this migration, widening its blast radius and re-verify
Net: an agreement test buys zero risk to a live screen.
Header: Done rule
Options:
A) Separate + agreement check (recommended)
class_progress has its own SQL; verify-0061 adds a row that, for a seeded rostered student, compares every class_progress cell with my_activity_progress() run as that student and fails on any difference. my_activity_progress is not touched. Effort human ~2h / CC ~15 min.
B) Shared helper
0061 adds a private helper computing one student's progress; my_activity_progress() is re-created to call it and class_progress calls it per student. verify-0059 re-run. Effort human ~3h / CC ~25 min.

State: approved
Actual answer: A) Separate + agreement check (D3, author, 2026-10-17)
Accepted scope: class_progress carries its own SQL; my_activity_progress is untouched; verify-0061 adds an agreement row comparing every class_progress cell for a seeded rostered student with my_activity_progress() run as that student
History: none

### Section 3 — Tests

Framework: SQL verify scripts (`supabase/verify-*.sql`, run by `scripts/verify-runner.mjs`, roster `AUTH_VERIFY_SET`), vitest (app), Playwright editor lane (teacher surface).

```
CODE PATHS                                             USER FLOWS
[+] 0061 class_progress(class)                         [+] Teacher opens Classes → a class → Progress
  ├── [GAP] not the class's teacher → raises/empty       ├── [GAP] [→E2E] grid shows roster × assigned, statuses, scores
  ├── [GAP] rostered students only (removed excluded)    ├── [GAP] Hide names → "Student 1…", survives reload (device)
  ├── [GAP] assigned activities only (unshared excl.)     ├── [GAP] cell → answer list per section, ✓/✗, attempts
  ├── [GAP] deleted class / deleted activity excluded    ├── [GAP] "N to grade" → that activity's Responses
  ├── [GAP] Done / Started / none; NULL total = Started   └── [GAP] Refresh reloads, shows the load time
  ├── [GAP] older version → its own total + chip
  ├── [GAP] score = correct ÷ marked, latest per section [+] Empty / error
  ├── [GAP] N to grade = ungraded hand-graded latest       ├── [GAP] class with no students / no activities
  └── [GAP] AGREEMENT with my_activity_progress (D3)     └── [GAP] RPC error → message, not a blank grid
[+] 0061 class_student_work(class, student, activity)
  ├── [GAP] same three gates (teacher, roster, assignment)
  └── [GAP] latest attempt per section: responses + verdicts
[+] lib/answerText.ts (D2)
  ├── [GAP] one row per family (7) incl. missing label, no answer
  ├── [GAP] graphs: number line values, 2-D points, no-solution
  └── [GAP] seeded document → the student's own numbers
```

COVERAGE: 0/24 (all new code). Required proof of CP-1..CP-9, R1, R2:
1. **verify-0061.sql** (live + local, added to `AUTH_VERIFY_SET`): every gate row above, the NULL-total and older-version rows, the agreement row (D3). Value: protects=a teacher sees only their roster × assignment; fails_when=a gate is dropped or the done rule drifts; why_new=no class-scoped read exists; seam=none; no_claim=UI rendering.
2. **answerText.test.ts**: one table row per family, plus a seeded fixture (P2: fixtures derived from the real schema types). Value: protects=every answer type reads as words; fails_when=a family falls back to raw ids; why_new=new module; seam=none; no_claim=page layout.
3. **ClassProgress.test.tsx**: grid statuses and scores from a stubbed RPC payload whose shape is imported from the lib's types, Hide names (DOM has no names when on), "N to grade" href, error and empty states. Value: protects=CP-2/5/7/8; fails_when=a status or the hide switch regresses; why_new=new route; seam=none; no_claim=SQL correctness (verify-0061 owns it).
4. **Editor-lane e2e** (`class-progress.e2e.ts`): signed-in teacher stub → Classes → Progress → a cell → answer list; Hide names. Value: protects=the route is reachable and renders end to end; fails_when=the link or route breaks; why_new=no teacher class-progress spec; seam=none; no_claim=live data (stubbed RPC).
Each guard mutation-tested the day it is written.

### Section 4 — Performance

- [P3] (confidence: 8/10) 0020:103 index `(activity_id, student_id, created_at desc)` serves "latest per student × activity". A class is ~30 students × ~20 assigned activities × a few sections: a few thousand rows per call, one round trip. `class_student_work` returns one student × one activity. No issue. The route is lazy and teacher-only: no effect on the student shell budget.

Dispositions: no new choices.

### Outside voice

Codex CLI not installed; native fallback needs TaskOutput, which this session lacks: **unavailable**. A Fable review of the built migration and route before the live apply is recommended (the pattern this arc used), in the build plan.

### R3: TODO for the per-activity-across-classes view
Finding: TODO review, P3, 9/10, this file "Not in scope" + ruling "per class first", Claude
Plan baseline: author ruled per class first (2026-10-17); per-activity deferred
Comparison grid:
| Choice | Current | A | B |
|---|---|---|---|
| R3 deferred view | unrecorded outside this doc | TODOS.md entry with trigger "a teacher teaches one activity to two or more classes and asks to compare them" | no TODO |
Question D4:
D4 — Record the deferred per-activity (across classes) view as a TODO with a trigger?
Project/branch/task: activity-platform on main, class progress view.
ELI10: You chose "per class first". The other view, one activity across all your classes, isn't being built. Writing it in TODOS with the event that would make it next means it isn't lost; skipping it leaves it only in this design doc.
Stakes if we pick wrong: without a TODO the idea lives only in a design doc nobody rereads.
Recommendation: A because a deferred wish gets a trigger, not a slot (your 2026-10-02 rule).
Note: options differ in kind, not coverage — no completeness score.
Pros / cons:
A) Add TODO with trigger (recommended)
  ✅ The deferred view has a named trigger and a pointer to this design
  ✅ Costs one TODOS entry and nothing in the build
  ❌ One more TODOS entry to keep honest (human: ~5min / CC: ~1min)
B) Skip
  ✅ TODOS stays one entry shorter
  ❌ The deferred view is recorded only inside this design doc
Net: one line keeps a ruled deferral findable.
Header: TODO
Options:
A) Add TODO with trigger (recommended)
TODOS.md entry: per-activity progress across a teacher's classes; trigger = a teacher runs one activity in two or more classes and asks to compare them; pointer to this doc. Effort ~5 min.
B) Skip
No TODO; the deferral stays only in this file's "Not in scope".

State: approved
Actual answer: "roll in now" (D4, author, 2026-10-17): neither A nor B; BUILD the per-activity-across-classes view in this change. The "Not in scope" line is superseded. Its shape and student scope are new choices → R4, R5.
Accepted scope: a per-activity view in this build (shape and scope pending R4/R5)
History: none

### R4: the per-activity view's place and shape
Finding: scope change from D4, Claude
Plan baseline: none (newly in scope)
Comparison grid:
| Choice | Current | A | B |
|---|---|---|---|
| R4 place + shape | none | a "Progress" page at `/activity/:id/progress`, linked from the activity row beside Analytics and Responses: rows = students across every class this activity is assigned to, GROUPED by class; columns = the activity's sections (✓ checked with score, or —); a cell opens the same answer list (D2) | add a per-student table to the existing Analytics page, below the block-kind totals |
| D2 formatter, CP-5 hide names, CP-6 versions, CP-9 live roster | approved | reused | reused |
State: approved — A) Own Progress page (D5, author, 2026-10-17). `/activity/:id/progress`, linked from the activity row beside Analytics and Responses; rows = students across every class the activity is assigned to, grouped by class; columns = the activity's sections (checked with score, or not yet); a cell opens the D2 answer list; Hide names, older-version chip and live-roster rules reused.

### R5: which students the per-activity view may show
Finding: scope change from D4, P1-class privacy rule, 9/10, 0020:118 + 0034:430-440, Claude
Plan baseline: CP-4/CP-9: reads scoped by live roster × assignment; can_read_activity not widened
Runtime evidence: the teacher RLS policy is activity OWNERSHIP, so "everyone who checked this activity" includes students in no class of this teacher's (e.g. a link shared outside a class)
Comparison grid:
| Choice | Current | A | B |
|---|---|---|---|
| R5 student scope | n/a | only students on the live roster of a class of THIS teacher that has this activity assigned (the CP-4 rule) | every student with a check on this activity, rostered or not (the ownership rule) |
State: approved — A) Rostered students only (D6, author, 2026-10-17). Rows = students on the live roster of a class the caller teaches that has the activity assigned, grouped by class; others never appear (Analytics' anonymous totals still count them). Same gate as CP-4.

### R6: class misconception and common-error data (raised by the author mid-review)
Finding: author question 2026-10-17 ("where does misconception id come into play… gather class data"), Claude
Runtime evidence: `misconceptionIds` is stored per item with each check's verdicts (wire.ts:222-231, "stored verbatim… what makes the misconception signal aggregable"); `misconception_registry` maps ids to descriptions (0042:92); NO teacher screen reads them (Analytics ignores them; the 0036 rollup has no misconception dimension; only the parked AI-assist notes use them). Untagged wrong answers carry no id.
State: approved — A) Roll it in (D7, author, 2026-10-17). Class page: a "Common misconceptions" panel (registry description, number of students who showed it, which activities; opens the students). Per-activity page: the same panel scoped to that activity, plus the most common wrong answers per question with counts. One more roster-scoped read in 0061 (same gate as CP-4/D6); tests for each.
Caveat recorded: `prune_section_checks` (unarmed) deletes superseded attempts, where misconception ids live; arming it changes these counts. Add a line to TODOS → the check-rollup ARMING arc.

### R7: misconception count basis
State: approved — A) Ever + still (D8, author, 2026-10-17). Each misconception row: students who showed it on ANY attempt, and of those how many still show it on their latest attempt at that question.

Common wrong answers (implementation of D7, no question): per question, students' LATEST attempt only, wrong verdicts only, grouped by the answer as stored after trimming and case-folding (numeric blanks grouped by parsed value, so `0.75` and `.75` are one row), top 5 with counts; each row shows its misconception when the grader attached one.

Approval readiness: PASS — CP-1..CP-9 (author), D1 structure, R1 (D2), R2 (D3), R3 (D4 roll in), R4 (D5), R5 (D6), R6 (D7), R7 (D8).

## Working plan (as reviewed)

1. **Migration 0061**, three SECURITY DEFINER reads, every one gated on `is_class_teacher` and scoped to LIVE roster × ASSIGNED activities (CP-4, D6); `can_read_activity` and `my_activity_progress` untouched (D3):
   - `class_progress(p_class_id)`: per rostered student × assigned activity: version checked (latest), sections checked / total (NULL total → Started, CP-6), older-version flag, latest score (correct ÷ marked across each section's latest attempt), ungraded hand-graded count (CP-7). Names as `coalesce(display_name, email, 'Unknown')`.
   - `activity_progress(p_activity_id)`: the same per student × SECTION for one activity, across every class the caller teaches that has it assigned, with the class name (D5).
   - `class_student_work(p_class_id, p_student_id, p_activity_id)`: latest attempt per section (responses, verdicts incl. feedback and misconception ids, attempt count) for the answer list (CP-3).
   - `class_misconceptions(p_class_id, p_activity_id default null)`: per misconception id: registry description, students ever / still (D8), activities and questions, student list; and, when `p_activity_id` is given, the top 5 wrong answers per question (D7).
   - grants to `authenticated`; verify-0061.sql with every gate row, the agreement row (D3), NULL-total and older-version rows; `AUTH_VERIFY_SET`; migrations README index; data-map draft-28 (no new column; a new teacher READ path to rostered students' answers and misconception tags).
2. **lib/answerText.ts** (D2): all seven families as words from the student's served document (seed substitution for seeded activities).
3. **lib/classProgress.ts**: typed RPC wrappers.
4. **routes/ClassProgress.tsx** (`/classes/:classId/progress`) and **routes/ActivityProgress.tsx** (`/activity/:id/progress`): grid, answer list, misconception panel, common wrong answers (activity page), Hide names (CP-5, device-remembered), older-version chip, "N to grade" → Responses, Refresh + load time; lazy, teacher-only.
5. Links: Classes page (per class) → Progress; activity row → Progress (beside Analytics, Responses).
6. Tests: verify-0061, answerText.test.ts, ClassProgress/ActivityProgress component tests, editor-lane e2e; each guard mutation-tested.
7. Release: Fable review of 0061 + routes → the author applies 0061 live → `verify-0061` on live → THEN push (OV-7). TODOS: prune-arming caveat (R6).

## NOT in scope

Exports and gradebook sync; number facts (own page); live updates; teacher annotation of auto-checked answers; per-skill rollups across chains; rendering answers in the viewer (CP-3 B, a later slice).

## What already exists (reused)

`is_class_teacher`, `class_members`, `class_activities`, `section_checks` + its `(activity_id, student_id, created_at desc)` index, `misconception_registry`, `check_grades` (ungraded count), the facts pages' name expression, `deriveSeedValues` / `substituteSeedValues` / `serveSeed`, `ICON_BUTTON` row icons, `list_grading_queue` for the Responses link target.

## Failure modes

| Path | Realistic failure | Covered by | User sees |
|---|---|---|---|
| any new read | gate dropped → another teacher's students | verify-0061 gate rows | caught pre-apply |
| class_progress vs my_activity_progress | rules drift | verify-0061 agreement row (D3) | caught pre-apply |
| answer list | an unknown family or missing label | answerText.test "unknown" row → shows "(answer not shown)" | a clear placeholder, not raw ids |
| seeded activity | labels from the unseeded doc | answerText seeded fixture | caught pre-merge |
| misconception id not in registry | description missing | panel shows the raw id with "description not mirrored" | visible, not silent |
| prune armed later | "ever" counts shrink | TODOS arming-arc line | documented |
| push before apply | SPA calls RPCs that do not exist | release order (OV-7) | avoided by order |

Critical gaps: 0.

## Worktree parallelization strategy

| Step | Modules touched | Depends on |
|---|---|---|
| SQL (0061, verify) | supabase/ | — |
| Formatter | packages/app/src/lib | — |
| Pages + links | packages/app/src/routes, components | SQL shape, formatter |

Sequential implementation in one session: SQL first (its return shapes type the client).

## Implementation Tasks

- [ ] **T1 (P1, human: ~1 day / CC: ~1h)** — db — migration 0061: class_progress, activity_progress, class_student_work, class_misconceptions; grants
  - Surfaced by: CP-4, D3, D5, D6, D7, D8
  - Files: supabase/migrations/0061_class_progress.sql, supabase/migrations/README.md
  - Verify: local `supabase db reset` + verify-0061
- [ ] **T2 (P1, human: ~4h / CC: ~30min)** — db — verify-0061.sql incl. agreement row; AUTH_VERIFY_SET; data-map draft-28
  - Files: supabase/verify-0061.sql, scripts/verify-runner.mjs, docs/compliance/data-map.md
  - Verify: verify runner local; data-map-coverage test
- [ ] **T3 (P1, human: ~1 day / CC: ~45min)** — app — answerText formatter, seven families + seeded
  - Surfaced by: D2, Section 1 (seeded)
  - Files: packages/app/src/lib/answerText.ts, its test
- [ ] **T4 (P1, human: ~2 days / CC: ~1.5h)** — app — ClassProgress + ActivityProgress pages, misconception panel, common wrong answers, Hide names, links
  - Surfaced by: CP-1..CP-9, D5, D7
  - Files: packages/app/src/lib/classProgress.ts, routes/ClassProgress.tsx, routes/ActivityProgress.tsx, App.tsx, Classes.tsx, Activities.tsx, tests
  - Verify: component tests + editor-lane e2e; `pnpm verify`
- [ ] **T5 (P2, ~10 min)** — docs — TODOS prune-arming line (R6); STATE
- [ ] **T6 (P1, author-gated)** — release — Fable review → apply 0061 live → verify-0061 live → push

## Unresolved decisions

None.

## Completion summary

- Step 0: Scope Challenge — scope accepted as-is (D1); later EXPANDED by the author (D4 per-activity view, D7 misconceptions)
- Reality rows: 7/7 emitted, 0 unverified premises
- Architecture Review: 4 issues (R1 + 3 carried)
- Code Quality Review: 2 issues (R2 + naming note)
- Test Review: diagram produced, 24 gaps (all new code) + misconception/per-activity rows
- Performance Review: 0 issues
- NOT in scope: written
- What already exists: written
- TODOS.md updates: 1 proposed (R3 → rolled in instead), 1 note (prune caveat)
- Failure modes: 0 critical gaps
- Unresolved decisions: 0
- Outside voice: codex unavailable; Fable review planned before the live apply
- Parallelization: 3 steps, 0 parallel / 3 sequential
- Lake Score: 3/3 (D2, D3, D7 chose the 10/10 or tied-top option)

## Design review (2026-10-17)

**Target:** this file after the eng review. **Focus:** all 7 dimensions (D1). **Initial rating: 4/10**: a data spec with no layout. No DESIGN.md; calibrated against the teacher pages (FactsTeacher `.ft-table`, Analytics `Stat`, Responses, Activities `ICON_BUTTON`) and the app's tokens. Mockups: not generated (designer has no OpenAI key). Outside voice: Fable cold read (D2), findings verified against the cited files and folded into the passes below.

### Pass 1 — Information hierarchy: 3/10

A 30 × 25 grid of equal cells has no first read. The question a teacher opens it with on Monday is "who hasn't done what I set last week?", which is a COLUMN question, then "who is behind overall?", a ROW question. → DR-1. The per-activity page groups rows by class, so its first read is class headers (the trap Responses' D9 removed). → DR-2. The misconception panel's position is unspecified. → DR-3.

### DR-1: a first read for the class grid
Options: A) count summaries: each activity column header carries "18 done · 5 started · 7 not started"; each student row ends with "done 4 of 9"; a 3-stat header above (assigned · students · last check, Analytics' `Stat` style) (recommended) · B) the grid alone
State: approved — A) Lead with counts (author, 2026-10-17): column headers carry 'N done · N started · N not started', each row ends 'done N of M', three Stat cards above the grid (activities assigned, students, last check).

### DR-2: the per-activity page's rows
Plan baseline: D5 (grouped by class)
Options: A) one flat roster with a Class column and class filter · B) keep D5's grouping by class, each block with its own counts (recommended; the comparison is why the page exists)
State: approved — B) Grouped by class (author, 2026-10-17): one block per class, its heading carries that class's done/started/not-started counts; students sorted by name inside.

### DR-3: where the misconception panel sits
Options: A) class page: BELOW the grid (the grid is the page, misconceptions are the second read); per-activity page: ABOVE the section grid (one activity's misconceptions are the actionable signal) (recommended) · B) below the grid on both pages · C) a separate tab on each page
State: approved — A) (author, 2026-10-17): class page = grid first, panel below; per-activity page = misconceptions and common wrong answers ABOVE the section grid.

Pass 1 re-rated: 8/10.

### Pass 2 — States: 2/10 (none specified)

### DR-4: the state set (house patterns from FactsTeacher)
Proposed set:
- Loading: `role="status"` "Loading…". Error on first load: `role="alert"` "Couldn't load progress" + Try again.
- Refresh failure: keep the last grid, show "Couldn't refresh · showing 9:41" (never blank the grid).
- No students: "No students yet" + the class join code with Copy (as on Classes).
- No activities assigned: "Nothing assigned yet" + link to Activities, where "Add to class" lives.
- Nobody started: the full grid of "—" with one line "No one has checked any work yet" (the roster still shows).
- A student with no checks on an activity: "—" (only checks are stored, so "opened but not checked" cannot be told apart and is not claimed).
- NULL section total (checked before 0059): "Started · ?" with a title "Checked before progress totals were recorded".
- Misconception id not in the registry: "Unknown misconception" with the id in small mono text.
- Untitled section (activity page): "Section 3".
Options: A) adopt this set (recommended) · B) only loading and error now, the rest when a teacher hits them
State: approved — A) Adopt the set (author, 2026-10-17): all nine states as listed above.

Pass 2 re-rated: 9/10.

### Pass 3 — Journey: 4/10

Desk, Monday: Classes → class → Progress → the newest activity's column (left, newest first) → a cell → that student's answers. The plan never says where "that student's answers" opens. → DR-5.

### DR-5: where a student's answer list opens
Options: A) its own address (`/classes/:classId/progress/:studentId/:activityId`, and the same under `/activity/:id/progress/…`), shown as a side panel over the right of the grid on screens ≥ 768 px and as a full page on phones; Back closes it, the link can be shared or reopened, Refresh keeps it open; focus moves into it and returns to the cell on close (recommended) · B) a modal dialog over the grid (the repo's RemoveStudentDialog pattern) · C) an expanding row under the student
State: approved — A) Own address, side panel (author, 2026-10-17): `/classes/:classId/progress/:studentId/:activityId` and `/activity/:id/progress/:studentId`; side panel over the grid's right at ≥ 768 px, full page on phones; Back closes it, Refresh keeps it, focus moves in and returns to the clicked cell.

### DR-6: show the correct answer in the answer list?
Evidence: the teacher owns every assigned activity (0030:103), so the key is theirs; the answer key print already shows the canonical answer (answer-key/extract.ts).
Options: A) under each WRONG answer, a muted "Answer: 0.8" line (the canonical answer only, as the printed key shows it; graphs as their target points) (recommended) · B) never show the key here
State: approved — A) (author, 2026-10-17): under each wrong answer a muted "Answer: …" with the canonical answer only (graph items: target points); correct answers get no extra line. Hide names does not hide answers (a projector note for the page copy).

### DR-7: sorting
Options: A) default by name (ruled), plus one toggle "Least done first" (fewest done, then most started), mirroring the facts page's "Slowest first" checkbox; the choice is remembered on this device (recommended) · B) name only
State: approved — A) (author, 2026-10-17): default by name; a "Least done first" checkbox (fewest done, then fewest started, then name), remembered on this device.

### DR-8: getting back from Responses
Evidence: ActivityResponses offers only "Back to editor"; "N to grade" (CP-7) leads there from a progress page.
Options: A) "N to grade" links carry where they came from (`?from=` the progress page's own path, validated as an in-app path); Responses then shows "Back to progress" in place of "Back to editor" (recommended) · B) leave Responses as it is; the browser Back button returns
State: approved — A) (author, 2026-10-17): "N to grade" links add `?from=<progress path>` (accepted only if it starts with `/classes/` or `/activity/`); Responses shows "Back to progress" when present, "Back to editor" otherwise.

Pass 3 re-rated: 9/10.

### Pass 4 — Visual specificity: 2/10 (data only)

### DR-9: the visual spec (house tokens, no new colours)
- **Table**, not cards: a real `<table>` in the facts page's style (`.ft-table`: 14 px, tabular numbers, `--color-line` row rules, muted 600-weight headers), inside a horizontal scroller (`.ft-tablewrap`).
- **Sticky** header row and sticky first column. Name column 12 rem, truncated with the full name in a tooltip (no tooltip while names are hidden). Activity headers max 9 rem, clamped to two lines (full title to screen readers), the DR-1 counts under them in small muted text. Columns newest-assigned first, left.
- **Cells, glyph + words, never colour alone:** `—` not started · `◐ 2/5` started · `● Done 80%` done (score shown on Done cells only) · `Started · ?` (pre-0059) · a small `older` tag when the student's latest work is on an older version.
- **Colour:** Done cells `bg-success-bg` + `text-success-strong`; started in ink; not started muted; "N to grade" an amber chip (`bg-warning-bg`, `text-warning-strong`), amber meaning "look again" as on Responses; NO red anywhere on these pages (a wrong answer is a teaching signal, not an alarm).
- **Rows** at least 44 px tall; the row total ("done 4 of 9") as the last column, right-aligned.
- **Controls** in one line above the grid, under the Stat cards: "Hide names" switch, "Least done first" checkbox, Refresh button + "Updated 9:41".
- **Answer panel** (DR-5): 28 rem wide on desk; sections as headings; per question one row: question label · student's answer · ✓ Right / ✗ Wrong (glyph + word) · attempts; feedback and misconception on a second muted line; "Answer: …" under wrong ones (DR-6). "Latest attempt" stated once at the top.
- **Misconception panel:** one row per misconception: description · "7 showed it · 3 still do" · activities; a disclosure opens the students (Hide names applies), each linking to that student's answer panel.
Options: A) adopt this spec (recommended) · B) leave visuals to the build and review screenshots after
State: approved — A) Adopt the spec (author, 2026-10-17), as written above.

Pass 4 re-rated: 9/10.

### Pass 5 — Design system: 7/10 → 9/10 (no new decision)

Only existing tokens are used (DR-9). `.ft-table` / `.ft-tablewrap` live in `practice/factsTeacher.css`, a lazy facts chunk; the build MOVES them to a shared teacher-table stylesheet that both the facts page and the progress pages import (two real callers, same behaviour; the facts page's look is unchanged). Recorded on purpose: the facts page keeps names CLOSED until disclosed (DR-19/21, a live class-time screen often projected) while these pages show names with a Hide switch (CP-5, a desk review screen). Two pages, two jobs, two rules; not to be "unified" without a ruling.

### Pass 6 — Responsive & accessibility: 5/10

Phone layout follows from DR-5 (answers as a full page) and DR-9 (horizontal scroller, sticky name column, 44 px rows). The accessibility set is open. → DR-10.

### DR-10: the accessibility set
- Table semantics: student names `th scope="row"`, activity or section titles `th scope="col"` (full text, clamped only visually).
- A cell WITH work is a `<button>` inside the cell, named in full: "Ana Lee, Fractions 2: started, 2 of 5 sections" / "… done, 80 percent". A cell without work is plain text "not started", not a button.
- Hide names is a real switch (`role="switch"`, `aria-checked`); when on, names leave the DOM entirely, including tooltips and button names ("Student 4, Fractions 2: …"), and the e2e asserts no name appears in text OR attributes.
- Focus moves into the answer panel on open and returns to the cell that opened it (DR-5).
- "N to grade" is named with its activity: "3 to grade in Fractions 2".
- The misconception disclosure is a button with `aria-expanded`; its count text reads in full ("7 students showed it, 3 still do").
Options: A) adopt this set (recommended) · B) table semantics only now
State: approved — A) Adopt the set (author, 2026-10-17), as written above.

Pass 6 re-rated: 9/10.

### Pass 7 — Unresolved decisions: 6/10

"Top 5 wrong answers per question" on a 40-question activity is up to 200 rows above the grid (DR-3 put this panel first). → DR-11.

### DR-11: common wrong answers, sized
Options: A) only questions where 2 or more students are wrong on their latest attempt, ordered by how many are wrong (most first); each question is a closed disclosure showing "Q4 · 9 wrong · most common: 0.75 (6)", opening to its top 5; the first 3 questions open by default (recommended) · B) every question, every top 5, always open
State: approved — A) (author, 2026-10-17): questions with ≥ 2 students wrong on their latest attempt, most wrong first; each a closed disclosure "Q4 · 9 wrong · most common: 0.75 (6)" opening to its top 5; the first 3 open by default.

Pass 7 re-rated: 9/10.

### Design review outputs

**Rating: 4/10 → 9/10.** The last point is real-teacher use (and mockups, which need an OpenAI key for the designer).

**Design tasks (amend eng T4):**
- [ ] **T4e (P1, human: ~1 day / CC: ~45min)** — layout per DR-1, DR-2, DR-3, DR-9: Stat cards, column counts, row totals, grouped activity page, panel placement, glyph+word cells, sticky header and name column, newest-first columns; move `.ft-table`/`.ft-tablewrap` to a shared teacher-table stylesheet (facts page unchanged).
- [ ] **T4f (P1, human: ~4h / CC: ~25min)** — the nine states (DR-4), each with a component test.
- [ ] **T4g (P1, human: ~1 day / CC: ~40min)** — the answer panel as its own route (DR-5): side panel ≥ 768 px, full page on phone, Back/Refresh behaviour, focus in/out; "Answer: …" under wrong answers (DR-6).
- [ ] **T4h (P2, human: ~2h / CC: ~15min)** — "Least done first" (DR-7) and "Back to progress" on Responses via a validated `?from=` (DR-8).
- [ ] **T4i (P1, human: ~3h / CC: ~20min)** — the accessibility set (DR-10), incl. the e2e assertion that hidden names appear in no text or attribute.
- [ ] **T4j (P2, human: ~2h / CC: ~15min)** — common wrong answers sized per DR-11.

**NOT in scope (design):** a projector/full-screen mode (these are desk pages; Hide names covers the projector case, recorded in Pass 5); mockups (no designer key; the build's e2e screenshots are the visual record).

**Completion summary (design):** focus all 7 (D1); outside voice: Fable cold read (D2), findings verified and folded; passes: IA 3→8, states 2→9, journey 4→9, visual 2→9, system 7→9, a11y 5→9, unresolved 6→9; decisions made: 11 (DR-1..DR-11); unresolved: 0.


## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 3 | not run for this plan | — |
| Outside Review | codex via `/plan-eng-review`; Fable subagent via `/plan-design-review` | Independent 2nd opinion | 40 | eng: unavailable; design: Fable (in-host, different model) completed | design: 2 critical, 14 high, 9 medium, resolved in DR-1..DR-11 |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 53 | ISSUES OPEN (all mapped to tasks) | 30 issues, 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 21 | ISSUES OPEN (all mapped to tasks) | score: 4/10 → 9/10, 11 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 9 | not run for this plan | — |

- **OUTSIDE COVERAGE:** eng phase: codex unavailable (2026-10-17). Design phase: codex unavailable; Fable subagent completed at the author's choice (in-host, not a codex record).
- **VERDICT:** no review CLEAR (issues_open = mapped work, 0 open decisions). eng review required. Ready to implement T1–T5 with T4e–T4j; T6 (Fable review, live apply, push) author-gated.

NO UNRESOLVED DECISIONS
