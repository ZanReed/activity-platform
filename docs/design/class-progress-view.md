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
