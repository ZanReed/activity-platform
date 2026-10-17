# First tries — what students answered before any feedback

**Status:** RULED 2026-10-18: FT-1..FT-9 all as recommended (author). Asked for by the author the same day ("initial mistakes … especially
multiple choice questions with feedback"), as a follow-on to
[class-progress-view.md](class-progress-view.md) (live, 0061).

## Why

Every class-progress screen shows a student's LATEST attempt. A student who
picked distractor B, read its feedback and re-checked with the right answer
leaves no trace there — and that first pick is exactly what says which
misconception a class walked in with, and whether the authored feedback fixed
it. The data exists: `section_checks` keeps every attempt (attempt 1 of each
student × version × section), with `responses.choices` holding the picked
choice ids (whether or not the author tagged them) and `verdicts` holding the
feedback and misconception the grader returned (grading/choices.ts: feedback
for the SELECTED choices only). On live today: 21 first attempts, 28 checks with
multiple-choice picks (the author's test student).

## Decisions (recommendation first; the author rules each)

**FT-1 — Where.** A "First tries" section on the per-activity progress page
(`/activity/:id/progress`), above "Common wrong answers", same roster scope
(D6: live roster of the teacher's classes that have the activity). Not on the
class grid page in v1 (one activity at a time is where a distractor means
something). *Recommend:* yes.

**FT-2 — What "first try" means.** A student's attempt 1 at a section of the
activity's CURRENT version (block and choice ids are minted fresh per publish,
so first tries on an older version are a different worksheet; the panel says
how many students are left out because they only checked an older version).
An item left blank on that check counts as "no answer". *Recommend:* yes.

**FT-3 — Multiple choice: the whole spread.** Per question, every choice with
how many students picked it on their first try, correct choice marked
"✓ correct", in the authored order (A, B, C as the key prints it), plus
"no answer". Multi-select: each choice counts every student who ticked it, and
the line says "students could pick more than one". *Recommend:* yes.

**FT-4 — The feedback beside each distractor.** Under each choice that was
picked, the feedback the author wrote for it and its misconception
(registry description), so the teacher reads "9 picked B — they were told:
'…'". Read from the teacher's own document (the student was shown exactly
this; grading/choices.ts). *Recommend:* yes.

**FT-5 — Did the feedback work.** For students wrong on their first try, how
many are right on their LATEST attempt at that question: "9 wrong first ·
6 right now". Per question, and per distractor ("of the 5 who picked B,
4 right now"). This is the signal that tells a teacher which feedback works.
*Recommend:* yes.

**FT-6 — Other question types.** Blanks, matching, ordering, number lines,
graphs: first-try correct count plus the top 5 first-try wrong answers, grouped
as "Common wrong answers" already groups (trim, case-fold, numeric by value),
with the same "right now" count. *Recommend:* yes, so one panel answers the
question for the whole activity. *Alternative:* multiple choice only in v1.

**FT-7 — Size and order (the DR-11 pattern).** Questions ordered by
first-try correct rate, lowest first; each a closed disclosure
"Q4 · 12 of 20 right first time · 6 right now"; the first 3 open. Questions
nobody has checked are left out. *Recommend:* yes.

**FT-8 — Who.** Each choice / wrong answer opens a list of students (Hide
names applies), each linking to their answer panel, which gains a
"First try / Latest" switch per section so the teacher can see that first
answer in context. *Recommend:* yes. *Alternative:* counts only in v1 (no names,
no panel change).

**FT-9 — The prune.** `prune_section_checks` (unarmed) deletes every
superseded attempt — i.e. every first try that was later re-checked. Arming it
as specified would empty this panel. *Recommend:* record it as an arming
BLOCKER in TODOS (the arming arc must keep attempt 1, or roll first-try counts
up, before it may run), and change nothing in the prune now. *Alternative:*
amend `prune_section_checks` in this migration to never delete attempt 1
(touches a function that deletes student work; it would need its own verify
and counsel's retention answer re-read).

## Cost (if ruled as recommended)

One migration 0062: `activity_first_tries(p_activity_id)`, SECURITY DEFINER,
the D6 gate (roster × assignment; `can_read_activity` gates the call only),
returning per item the first-try answer groups, counts and right-now counts;
plus `class_student_work` gaining each section's FIRST attempt beside its
latest (a re-create of a live function, same gates, verify-0061 re-run).
verify-0062 (every gate row, first-try vs latest, multi-select, older-version
exclusion, the "right now" count). App: a First tries panel, the panel switch,
tests, an e2e row. No Edge Function change. Release as before: Fable review →
author applies 0062 → verify live → push.
