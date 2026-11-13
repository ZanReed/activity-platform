# Due dates (design pass, 2026-11-13)

Status: **RULED 2026-11-13 (author: "Yes to all") and BUILT the same day** — see
"As built" at the end; 0087 is applied live by the author before the push. Source:
TODOS.md → "Due dates" (the author, 2026-11-13: "still a good feature to
have"), and UI review group E-7. Each fact below was re-read in the code on
2026-11-13.

## What the code has today

- **Where a class holds an activity:** `class_activities` (0030), one row per
  class per activity: `class_id`, `activity_id`, `added_by`, `added_at`. Written
  only through `share_activity_to_class` / `unshare_activity_from_class`;
  read by students through `list_class_activities()` (their Home rows) and by
  the teacher's class panel and class progress (0061/0064).
- **`assignments` (0001)** has a `due_at` column, but nothing has ever written
  or read the table: classes moved to `class_activities` instead.
- **A class's day:** `fact_class_zone(class)` is the class teacher's timezone
  (`users.timezone`, the per-teacher ruling), with the app default when unset.
  Today's picks (`class_period_items`, 0082) already ask "what is today" in it.
- **The period planner** (TODOS → "BUILD ORDER", NEXT): planning days ahead in
  `class_period_items`, which already allows future dates. Not designed yet.
- Nothing locks a student out of anything by date today (PA-6: "a student can
  still open any activity at any time").

## Decisions

**DD-1. A due date is a DATE on the class's activity row.** Recommended:
- A new nullable column `class_activities.due_on date`. One date per class per
  activity; the same activity can be due on different days in two classes.
- A **date, not a time**: "due Friday" means by the end of Friday in the
  class's timezone. No hour picker; school deadlines are days.
- **Not** reviving `assignments`: it would be a second way a class holds an
  activity, beside `class_activities`. It stays dead (a later cleanup can drop
  it).
- Removing the activity from the class removes its date with it (it's on the
  row).

**DD-2. The teacher sets it where they add the activity.** Recommended:
- In the class's Activities panel (the "Added 13 Nov" list), each row gets
  "Due: none ▾" → a date field, with "Clear". Also offered at the moment of
  adding ("Add" then an optional date).
- Written through one audited RPC, `set_class_activity_due(class, activity,
  date | null)`, like sharing. Past dates are allowed (a teacher may be
  recording a deadline that already passed) and say so ("That day has
  passed").
- *Not* in v1: one date for several activities at once, and a date per
  student (extensions). Both filed with triggers.

**DD-3. What a student sees: a label, never a lock.** Recommended:
- On their Home row: "Due Fri" when it's within the next 7 days, "Due 28 Nov"
  when further, "Due today" on the day.
- **After the date, if not finished:** "Was due Tue 12 Nov", in the normal
  muted text colour. No red, no "overdue", no "late" in front of the student.
  Once every section is checked the date stops showing (finished work doesn't
  need a deadline).
- **Order:** within a class, activities with a date and not finished come
  first, soonest first; then the rest in today's order (newest added first).
- **Nothing locks.** The activity opens and checks exactly as before,
  before and after its date (PA-6 stands).

**DD-4. What a teacher sees.** Recommended:
- **Class progress:** the activity's column header shows "Due Fri". After the
  date, a cell that isn't done gets a small "not done by the date" marker
  (words for screen readers, a quiet glyph on screen). Done-after-the-date is
  just done: no "late" mark on finished work in v1.
- **Class card:** "2 due this week" next to the class's activity count,
  linking to class progress. That's the v1 "due this week" view.
- **The CSV** (E-1) gains a "Due" column per activity.
- *Not* in v1: a cross-class "due this week" page. **Trigger:** a teacher with
  more than one class asks for one.

**DD-5. It stays separate from the period planner, on purpose.** Recommended:
- Today's picks and the planner answer "**what do we do in class on day X**";
  a due date answers "**finished by day X**". Different questions, so two
  fields, not two scheduling models: the planner's future-dated rows don't
  set a due date, and a due date doesn't put anything on Today.
- The planner design pass may later offer a shortcut ("due at the end of the
  day it's used"). That's its call, not this one's.

**DD-6. Time zones.** The class's timezone (`fact_class_zone`), as everything
else about a class's day. "Due Fri" is Friday there, for the teacher and every
student in the class. A student travelling sees the class's day, not theirs.

**DD-7. Republish, copy and the Bank.** A due date belongs to the class's
row, so: a republish keeps it; "Make a copy" and a Bank copy don't carry it
(the copy is in no class); deleting a class takes its dates with it.

**DD-8. Data and compliance.** No personal data: the date is about a class's
activity, and who set it goes to `audit_log` like a share. The data map
doesn't change (no student-derived rows); the migration says so in its header.
No new retention question.

**DD-9. Test discipline.** A migration with its verify script (column, RPC
owner-only, audit row, student read through `list_class_activities`); the
student Home wording and order, and the teacher's header/marker, in the
browser lanes; the "end of the day in the class's zone" boundary tested at the
two hemispheres' midnights (NZ and US, the author's split); a Fable review per
step.

## Build shape (if all yes)

- **Step 1, migration 0087 (author applies it live before the push, OV-7):**
  the column, `set_class_activity_due`, `list_class_activities` and the
  class progress read gain `due_on`, plus `verify-0087.sql`.
- **Step 2, teacher:** set/clear in the Activities panel, the column header
  and marker in class progress, the class card count, the CSV column.
- **Step 3, student:** the Home label, wording and order.
- No Edge Function change, so no deploy. The student shell is measured (the
  Home row is in it).

## As built (2026-11-13)

Commits on `main`: 66c88045 + bf735cc4 (0087 and its verify), 19ea204a (step
2, teacher), eeedd456 (step 3, student, and step 2's review fixes), plus the
close-out commit. A Fable review per step; each change mutation-tested.
Differences from the plan:

- **The teacher reads `due_on` straight from `class_activities`** (its SELECT
  policy covers the column) instead of `class_progress` gaining it: copying
  that 150-line function to add one field was the larger risk. The student
  list (`list_class_activities`) carries `due_on` and `class_today`, the
  class's date, so a Home with several classes needs no extra round trip;
  `class_local_date` gives a teacher's page the class's day (all of a
  teacher's classes share the teacher's zone, so one read serves the page).
- **The timezone test runs in fresh Node processes** under NZ and US zones:
  Node caches its default zone, so the first in-process test passed even with
  the UTC guard removed (found by mutation). The pure date helpers live in an
  import-free `dueWords.ts` for that.
- **"That day has passed"** needs the class's today before any row has a
  date, so it is read whenever the teacher has rows (the first build read it
  only when one was dated, and its test fixture hid that).
- **The CSV** gains a due column per activity only when the class has dates.
- **Finished** = the student's Home says "Done" (current or earlier version);
  a dated row's label goes then. Unknown progress counts as unfinished.
- Budgets: the Classes page 12.5 → 14.25 KiB (reason in the file); the
  student shell +34 B, inside its band.
