# Gradebook export — one file a teacher can take to the school's gradebook

**Status:** RULED 2026-11-20 (author: "Yes to all"), GB-1 to GB-13 as
recommended. That includes **GB-4: a DoL pass counts only with a check on this
class's activity**, and **GB-8: an email column, deliberately reversing E-1's
names-only ruling of 2026-11-13**. The draft was revised after a Fable review
the same day. Build next: "Build shape" below, with the migration applied live
before the UI push. Asked for by the author on 2026-11-20
("Gradebook export"), chosen over the February readiness pass.

## Why

From February a teacher has no way to get **marks** out of the platform.
Mixed practice's eng review filed this as ER-8 (TODOS → "Mixed practice: three
items filed by its eng review"): design the export once, for activity grades
(`check_grades`) and graded practice scores together. Classroom grade passback
is Phase 3 and has not been started, so for now a file is the only route.

## Correction first: a progress CSV already exists (P10)

TODOS says "No grades export exists for anything." That stopped being true on
2026-11-13. UI review E-1 shipped **Download CSV** on class progress
(`packages/app/src/lib/progressCsv.ts`, button at
`packages/app/src/routes/ClassProgress.tsx:256`), and the due-dates arc added
due columns to it. It writes one row per student and, per activity, these
columns:

- due (when the class uses due dates)
- sections checked
- % right, for auto-marked work only, on DONE cells

It deliberately leaves out **hand grades** and **DoL passes** (header comment,
lines 14–15), and it carries no practice scores. Its safety is already solved:
every field is quoted, anything formula-like gets a leading apostrophe, and the
file has a BOM and CRLF line endings for Excel. Names are always included
(ruled: the hide-names switch is for a projector).

So this pass is about **what to add to that file**, not a new surface. ER-8's
TODOS row is corrected as part of this pass's commit.

## What the grade data is today (mapped 2026-11-20, file:line in the map below)

| Kind | Where | "The" score today | Teacher read |
|---|---|---|---|
| Auto-checked work | `section_checks` (0020) | derived: latest attempt per section; correct ÷ (correct + incorrect) per version; current version if checked, else the most recent | `class_progress` (0099:433, `is_class_teacher`) — the CSV already uses it |
| Hand (rubric) grades: short answer, essay, photo | `check_grades` (0034) — `criteria[{earned, maxPoints}]`, `released_at` | **no total is stored or computed anywhere**; per block, the latest grade wins (0099:653), and it may sit on an older attempt (`stale`) | `list_grading_queue` (0099:601, `can_read_activity`, per ACTIVITY, not per class) |
| DoL mastery | `dol_pass` (0070) — one sticky row per student × skill, `auto` or `teacher` | binary: Passed or not. D/C/P/E are practice tiers, not results. Data-map calls it "not a grade" | `dol_pass_status(activity)` (0070:530), per activity; **no class-level teacher view** |
| Practice score (opt-in per class) | `mixed_sessions` (0066): `graded`, `score_right`, `planned`, `score_answered`, `review` | per session: right ÷ PLANNED (ER-7 as amended); the teacher sees the latest finished graded session only, and reviews are not separated out | `mixed_class_students` (0068:350) |
| Number facts | 0045, 0050 | rates and groups, derived | its own page; the curriculum default is "practice is never graded" |
| Printed quiz / exam | nothing | no table holds hand marks | — |

Two access facts bind any new read:

1. **The ownership trap.** `check_grades` and `section_checks` are readable by
   activity OWNERSHIP (`can_read_activity`). A per-class read must be scoped
   **live roster × `class_activities`**, the way `class_progress` is
   (class-progress-view.md → "The access trap to avoid").
2. Rubric points have never been added up, so a total is a new number and the
   student has never seen one. Whatever rule makes it has to be one a teacher
   can explain to a parent.

## Decisions (recommendation first; you rule on each)

**GB-1. Extend the existing Download CSV; no second button or page.**
One file, still from class progress, renamed `<class> gradebook <date>.csv`.
*Alternative:* a separate "Download gradebook" next to it. *Recommend:* extend
it. Two near-identical files is a choice a teacher shouldn't have to make, and
the current file's columns stay as they are.

**GB-2. Hand grades go in three numeric columns per activity that has any
rubric block: points, out of, and to grade.** Numbers, not text, so a
spreadsheet can add them up. A text cell like `"7 / 10"` can't be summed, and
Excel may read it as a date. Any caveat goes in a fourth column, "notes" (for
example "answer changed since graded").
- **Released only, and the latest RELEASED grade wins per block**, the same
  rule the student's own read uses. A student who hasn't seen a grade
  shouldn't have it in a gradebook first. If attempt 2 is graded but not yet
  released, attempt 1's released mark still counts, so a mark the student has
  already seen never disappears from the file.
- **"Out of" comes from the pinned rubric**, ungraded blocks included, so every
  student has the same denominator for the same version. Today `maxPoints` is
  copied onto each grade (0034:69), which would give two students different
  denominators. A block not yet graded or not released adds to "to grade",
  never to "points".
- "To grade" reuses the grid's own owed-grade rules (`hand_grade_owed`,
  `dol_optional_block`, 0099:513), so the file and the grid agree.
- A **stale** grade (the answer changed after it was graded, 0099:695) still
  counts, with "answer changed since graded" in notes.

**GB-3. No combined per-activity score.** Auto "% right" and hand points stay
separate columns. Weighting a computer-marked item against a 4-point rubric is
the teacher's call in their own gradebook, and any default we picked would read
as ours. *Alternative:* one weighted percent. *Recommend:* separate columns.

**GB-4. DoL: a "DoL passed" column, only for activities whose DoL has a skill
(`dol_pass_skill` is not null).** Values are `Passed`, `Passed (teacher)` or
blank. `dol_pass` is one row per student per SKILL (0070:67), and an earlier
part of a skill, or a teacher-written DoL, has no skill to look up. A column
for those would be blank forever and would read as "nobody passed", so they
get no column. A pass counts only when the student has a check on this
activity, the same filter as `dol_pass_status` (0070:548).
**Question for you:** a pass is per skill, so a student can have passed the
skill under ANOTHER teacher's copy of the lesson. Should that show?
*Recommend:* no. Only a pass with a check on this class's activity counts, so
the file states what happened in this class.

**GB-5. Practice scores: a separate column group at the end, only for a class
whose "Record a practice score" switch has ever been on.** Per ER-7, they are
labelled "Practice score" and kept apart from attainment. Columns:
- **average**, pooled: total right ÷ total planned across sessions, not a mean
  of each session's ratio, so a 3-question day doesn't weigh as much as a
  12-question one
- **sessions** counted
- **latest**

Review sessions get their own pair. ⚠ **Which sessions count (found by the
review):** a session is "finished" only when every planned question is
answered or the student presses finish (0091:990, :1279). One left open closes
after a day (0091:908) but is never finished. Counting finished sessions only
would let a student wipe out a bad day by walking away, which is what ER-7's
"right ÷ planned" exists to stop. *Recommend:* count **every graded session
that has closed** (finished, or more than a day old with at least one answer)
at right ÷ planned. A day the student never opened isn't a session and adds
nothing. *Alternative:* latest only, which is all the screen shows today. That
is one bad day's number in a gradebook.

**GB-6. Leave number facts out.** It has its own page, the curriculum default
is that practice is never graded, and its numbers are rates rather than scores.
*Recommend:* out, with a trigger: a teacher asks for facts in the file.

**GB-7. Which attempt counts for auto-marked work: the latest, as on screen** (hand grades follow GB-2's latest-released rule). Best and first are
both arguable. First tries already have their own view, and best rewards
retrying until right, which form grading and DoL retakes already shape.
*Recommend:* latest, so that the file says what the grid says (the Fable rule
from E-1).

**GB-8. Who is in the file: the live roster. ⚠ The email column REVERSES a
ruling.** E-1 was ruled on 2026-11-13: "the CSV carries names only (no
emails)" (ui-review-group-e.md:114). The case for reversing it is that we hold
no school student ID, names repeat and can be blank, and a school gradebook
import matches rows best on email. (Emails already appear today as the name
when `display_name` is NULL, 0099:450.) *Recommend:* add an email column, as a
deliberate reversal for you to rule on. *Alternative:* keep names only.
Removed students stay out, as on the grid. Including them at term end is
filed with a trigger: a teacher moves a student out mid-term and asks for
their marks.

**GB-9. One new read: `class_gradebook(class_id)`, SECURITY DEFINER, gated on
`is_class_teacher`, scoped roster × `class_activities`.** It returns:
- per student × activity: hand-grade totals (released earned, released max,
  to-grade count, stale flag)
- per student × DoL activity: the pass and its source
- per student: practice and review aggregates

The CSV stays client-built, merged with `class_progress`, which the page
already loads.

It ships the usual way:
- a migration plus `verify-01xx` (including a row proving that a student in no
  class of the caller's never appears, i.e. the ownership trap)
- applied live **before** the UI is pushed (OV-7)
- no Edge Function and no bundle change

*Alternative:* call the three per-activity reads N times from the client. That
means N round trips and two of them are ownership-scoped. *Recommend:* one RPC.

**GB-10. The download is a data flow the compliance pack doesn't record. Fix
that in this pass's commit.** Today's CSV already puts names and scores on a
teacher's machine, outside our retention clocks, and neither `data-map.md`
(→ Flows) nor `privacy-policy.md` says so. This pass adds three things:
- a Flows row: "teacher downloads a class file: names, emails, scores; held
  under the school's own policy from then on"
- one sentence in the privacy page's "who sees it" list
- a counsel question for the next packet, alongside 5(g)'s "export for
  moderation". It is not a blocker: the teacher is the school's own agent

It also rewords two purpose cells: data-map.md says DoL passes (:445) and
practice scores (:443) are "not a grade" or shown only on screen, and a file
named "gradebook" now carries both. The retention policy gets the same
sentence (a prose-only rule, CLAUDE.md).
`data-map-coverage.test.mjs` cannot see this (it sweeps migrations, and this is
UI), so it is a prose rule here.

**GB-11. CSV only, with no school-system formats.** NZ schools import into
KAMAR, Linc-Ed or Edge, and US schools into PowerSchool or Infinite Campus.
Each has its own template, and Phase 3 (Classroom / LTI passback) is the real
answer. *Recommend:* CSV only. Trigger: a teacher's import fails on our
columns, and then we add that system's layout.

**GB-12. No date window in v1: the file holds every activity the class has and
all its practice.** A term filter needs a notion of terms that the platform
doesn't have (a class has one end date). *Recommend:* none in v1. Trigger: a
teacher asks for one term's marks, and then a "from / to" pair on practice
sessions and due dates.

**GB-13. Edge rules, stated so nobody is surprised:**
- A student in two of the teacher's classes shows the same marks on the same
  activity in both files, because a check belongs to a student and a version,
  not to a class.
- The file-name date is the teacher's local day, not UTC (today it's UTC,
  `progressCsv.ts:66`, which makes it a day behind on an NZ morning).
- `class_gradebook` lists exactly the activities `class_progress` lists (its
  published, not-deleted filter, 0099:455) so the merge lines up.

## Not in this pass (each with a trigger)

- **Marks for printed quizzes and exams.** Nothing stores them. Trigger: the
  first drafted quiz (the quiz/exam print pass, TODOS → "Printed exams and
  quizzes").
- **Per-skill columns** (a student × skill mastery sheet). Trigger: an HoD asks
  for skill-level reporting.
- **A long format** (one row per student × item). Trigger: a teacher wants to
  analyse answers in a spreadsheet.
- **Grade passback.** Phase 3.

## Build shape, if ruled as recommended

1. Migration `class_gradebook` + verify script (+ data-map/retention stamps if
   the read changes any documented flow; it adds no column).
2. `gradebookCsv` replaces `classProgressCsv`, with the existing columns
   unchanged, then the points, DoL and practice groups. Unit tests on each
   cell's wording; mutation-test the released-only filter, the roster
   scope and the closed-session rule. The `data-progress-csv` e2e rows move
   with the rename.
3. The compliance rows (GB-10) and the corrected TODOS ER-8 row.
4. Fable review, `pnpm verify` cold, the Playwright lanes, then the push after
   the migration is live.

Effort: M (one migration, one file builder, no deploys).

## The map's sources

`section_checks` 0020:58, 0059:41; `class_progress` 0099:433, 478–484, 539–546;
`check_grades` 0034:76; `list_grading_queue` 0099:601, 653–654, 695;
`validate_check_grade_criteria` 0096:82; `dol_pass` 0070:67, `set_dol_pass`
0070:461, `dol_pass_status` 0070:530; `mixed_sessions` 0066:365, 0091:253,
score 0091:984; `mixed_class_students` 0068:350, 389–395; `class_activities`
0030:52, `due_on` 0087:25; `class_members` 0014:87; names 0099:450.

## As built (2026-11-20; 0102 live, unpushed)

Migration `0102_class_gradebook.sql` + `scripts/verify-0102.sql`, both
mutation-tested: eight deliberate breaks, seven caught. The one that stayed
green only matters for an activity whose OLDER version has rubrics and whose
current one has none. Client: `lib/gradebook.ts`, `lib/progressCsv.ts`
(`gradebookCsv`), and `DownloadGradebook` in `routes/ClassProgress.tsx`, which
reads the marks on the click. Unit tests (four mutations, all red) and the
student lane's download row are updated. Compliance: data-map draft-70,
retention-policy draft-35, a privacy page sentence, and counsel **Q15** (DRAFT,
not sent).

**Differences from the rulings, all from the Fable review of the build, each
inside what GB-2 promised:**
- **"Points pending" counts POINTS**: the rubric totals of questions with no
  released grade. A question count would have read as points. So points +
  pending + points lost = possible.
- **A released grade is the latest per question ACROSS versions** (the
  student's own read, `get_my_released_feedback`). That way a republish doesn't
  wipe out a mark the student has seen. The note column says "grade from an
  earlier version". The denominator is still the shown version's.
- **Points columns appear only where the current version's rubrics total more
  than 0** (no 0 / 0 columns for rubric-less questions).
- **A pruned practice session counts only if it had an answer**, as before the
  prune (the prune is unarmed, so this is latent).
- **The file carries the roster's emails and the class's date** from the same
  read (GB-8, GB-13).

**0102 applied on live 2026-11-20** (`supabase db push`, by the session at the
author's request). `verify-0102` passed on live, and so did verify-0061, -0028
and -0017. No residue rows were left. **Pending (author): push.** No function
deploy.
