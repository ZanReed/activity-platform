# The teacher's period planner (design pass, 2026-11-13)

Status: **RULED 2026-11-13 (author: "Yes to all"): PP-1 to PP-12 as
recommended, as amended by the review below.** Not built. The order of work is
"Build shape"; the letter goes after step 1 and before step 2 is pushed. A Fable review of this draft (2026-11-13) found one wrong fact
("Make a copy" is client code, not SQL) and seven gaps; all are folded in below. Source: TODOS.md → "BUILD ORDER", item 6 ("NEXT, author 2026-11-09,
from the walkthrough"): what "Use today" gives a teacher is thin. Wanted: a
summary or presenting view of the period, a time per activity and a total,
somewhere to see the hook while presenting, planning days ahead, and a
per-activity time the curriculum side supplies (a letter, drafted below, not
sent). Neighbours: [period-assembly.md](period-assembly.md) (PA-1…PA-12, which
this builds on), [due-dates.md](due-dates.md) (DD-5 keeps due dates separate),
[chain-hooks-view.md](chain-hooks-view.md) (CH-1…CH-12).

Each fact below was re-read in the code, the live database or the curriculum
repo on 2026-11-13 (P10).

## What the code has today

**Today's picks (0082, 0084).**
- `class_period_items (class_id, on_date, kind, activity_id, position)`, primary
  key `(class_id, on_date, activity_id)`, FK to `class_activities` with cascade.
  `kind` is checked to `'activity'` only. No client grants; two definer
  functions are the only doors.
- `class_today(class)` returns `{on_date, activities:[{activity_id, title}]}`
  for **today only**, in `fact_class_zone`, hiding anything unpublished or
  deleted. Teacher or current member.
- `set_class_today(class, activity, on)` writes **today only**: there is no
  date parameter. The table allows future dates, but nothing can write one.
  Every write first **deletes the class's earlier days** (`on_date < today`), so
  there is no history. Cap 6 a day (`today_full`), audited as
  `class.update` / `use_today` / `clear_today`.
- Live, 2026-11-13: 2 classes, 4 rows, 0 future-dated.

**The teacher's Today panel** ([TodayPanel.tsx](../../packages/app/src/practice/TodayPanel.tsx)), top of `/classes/:classId/facts`:
the period as one line from `periodLine()` ("Number facts 5 · Hook · 3.2 Unit
rates · Practice"), a "Pick today's activity" / "Change" toggle listing the
class's published activities with "Use today" / "Remove", and a "Hooks for this
unit" link to `/chains/:chainId`. No minutes on anything except the literal
"Number facts 5". No order control (position is append order). No total.

**The student's Today list** ([FactsEntry.tsx](../../packages/app/src/routes/FactsEntry.tsx), `/practice/CODE`, lazy): Number facts
"about 5 min", the activity rows with **no minutes** (PA-5 as built: "until
`duration_min` reaches this side"), Practice "about N min" from
`practiceMinutes(items)` (questions × 60–90 s).

**Hooks (0057).** `chain_hook` is teacher-only (a note carries the answer, so it
is answer-key-class). `my_chain_hooks()` returns every pool for the caller's
chains plus `activityChains` (activity → chain). `class_hook_use (class_id,
hook_id, used_on, marked_by)`, **one row per class per hook**, written directly
by the teacher under `is_class_teacher` RLS; the chain page marks with the
**browser's** `localToday()` and caps the date input at it (`max=`). The hook
page shows the prompt large, notes open, literal text; CH-8 declined a
full-screen or copy view ("not asked for").

**Time.** No per-activity time exists anywhere on this side.
- The curriculum graph's `activity_defaults.duration_min` is **32**, one number
  for every activity (a cap: authoring-principles "One activity, hard cap"),
  with `phase_budget_min` review 4 · worked 7 · faded 9 · independent 7 · dol 5.
  It is **not mirrored** here; `period_shapes` (mirrored by 0083) names it only
  as the string `"duration_min"`.
- Their `builder.html` already has a per-activity **Minutes** field (5–40,
  default `duration_min`), but no activity file carries a time in its
  ```meta fence (grep of `~/activity-catalogue-pilot`: none), and the graph's
  `activities` list is empty.
- `period_shapes` (mirrored, 0083) gives fluency [5, 5], hook [2, 3], mixed per
  length; the class's practice length is its own "Items per session".
- The ```meta fence is "activity settings, not a capability"
  (`capabilityFacts.ts`), so a new meta key needs no capability row and no pin
  bump.
- Precedent for a row-native activity field: `pedagogical_role` and `tags`
  (0037) are columns on `activities`, written by the client and by the
  importer, carried by a Bank copy (0054's copy function lists them).

**The class's day.** `fact_class_zone(class)` = the class teacher's
`users.timezone` if valid, else `analytics_default_zone()` = **`America/Chicago`**.
`users.timezone` has **no editing surface**: only the author's row was set (0036,
email-keyed, `Pacific/Auckland`). Live today every class has a zone set (0
without), but **every new teacher gets Chicago**. For an NZ colleague that
puts the class's "today" on the *previous* day until about 7–8 pm NZ time,
which already affects Today's picks and due dates, and would make a planner's
"Tue 18 Nov" wrong all school day. A client write to `users` hits a known RLS
recursion (TODOS: "`users_update_self`'s WITH CHECK re-selects `users`"), so a
control writes through a definer RPC like `set_public_name`. TODOS already
files "A teacher timezone control" (bundled with the name control).

**Due dates (0087).** `class_activities.due_on`, set by
`set_class_activity_due(class, activity, date|null)` in the class's Activities
panel ([ClassActivitiesPanel.tsx](../../packages/app/src/components/ClassActivitiesPanel.tsx)). DD-5: the planner's dates and due dates
are two fields; the planner may offer "due at the end of the day it's used".

**Budgets.** Everything here is teacher-side and lazy except the student Today
list, which is already a lazy route. New teacher routes need `TEACHER_JOURNEYS`
rows. No Edge Function reads any of this: no bundle, no deploy.

## Decisions

**PP-1 · Where planning ahead lives.** Recommended: **a Plan page per class,
`/classes/:classId/plan`**, linked from the Today panel ("Plan ahead") and from
the class card. It lists the next 10 school days (Mon–Fri) from the class's
today, each day a card with its activities in order, its hook and its total; a
date field jumps to any later day. Weekends appear only when something is
planned on one. Today's card is the same card the Today panel shows, so there is
one picture of a day, not two.
- *Not* a calendar grid or a term view: 10 days is what a teacher plans, and a
  grid is a second UI to build and keep honest.
- *Not* students: students still see **today only** (`class_today` unchanged
  in that respect). A plan is the teacher's and changes; showing it to students
  turns it into a promise.

**PP-2 · How far ahead, and what about the past.** Recommended:
- Future days up to the class's `school_year_ends_on`, or 365 days when unset.
  Refused beyond (one error, `too_far`), so a typo year can't plant rows.
- **Keep the most recent past day, and only that one.** Today every write
  deletes anything before today. Instead, a write deletes past days except the
  latest one that has rows, so the Today panel can offer **"Last time (Tue 12
  Nov): 3.2 Unit rates · Carry on today"** when an activity ran over, which is
  the commonest reason a plan changes. "The latest" rather than "14 days" so a
  term break doesn't erase it. Past days are read-only. Deletion still happens
  only inside a write, so a class that stops planning keeps its last day until
  the next write; the retention line says exactly that. Still no person named.
  This changes 0082's rule, so `verify-0082` B6, the table comment and the
  migrations README line ("a pick lapses") change in 0088.

**PP-3 · Writing a day.** Recommended: one new RPC,
`set_class_plan(class, on_date, activity, on)`, the same rules as
`set_class_today` (teacher only, published and in the class, cap 6 a day,
audited, idempotent) plus a date that is today or later and within PP-2's
limit. `set_class_today` becomes a call to it with the class's today, so the
two can't drift. One read, `class_plan(class, from, to)`, returns the days in
range with their activities (title, minutes, position) and each day's hook
**id** (the prompt comes from `my_chain_hooks()`, whose owner logic isn't
duplicated).
- **The cap counts only rows a teacher can see.** Today it counts every row,
  while `class_today` hides unpublished or soft-deleted activities (and a soft
  delete doesn't fire the FK cascade). Planned weeks ahead, a day would show 5
  and refuse a sixth. `class_plan` also returns such rows flagged "no longer
  available · Remove".
- The cap's error becomes `day_full` (today's `today_full` reads wrong on a
  future day); the client accepts both during the push window.
Plus `move_class_plan_item(class, from_date, activity, to_date)` and
`reorder_class_plan(class, on_date, activity_ids[])`: moving a row is the
second-commonest change, and doing it as remove-then-add loses its place and
writes two audit rows.

**PP-4 · Order within a day.** Recommended: **up / down buttons** on each
activity in a day card (keyboard-reachable, labelled by title). Position
already exists; today it is only append order, which the walkthrough's
six-a-day ruling makes awkward. No drag in v1 (drag needs the a11y pass the
editor's grip is still waiting on).

**PP-5 · A time for each activity.** Recommended: **a nullable whole-minutes
column, `activities.minutes` (1–120)**, row-native like `pedagogical_role`:
- **The catalogue sets it** from a new ```meta key `minutes:` (the letter, PP-12).
  On update the file wins and the dry run reports the change. It joins the
  importer's `NOT_CONTENT` set (the `primary_skill` path), so a minutes-only
  change writes the column and **no draft**; otherwise the first catalogue-wide
  `minutes:` run would put a draft on every published activity. As with
  `tags:`, an absent key leaves the column alone, so a file can't clear it.
- **Its own write in the editor.** Autosave writes row fields in the same
  statement as `draft_content`, so a minutes edit riding along would make a
  draft on a published Bank copy. The drawer field writes `minutes` alone.
- **The teacher sets it** in the editor's settings drawer ("About how long:
  __ min"), beside role and tags, on their own activities and Bank copies (the
  GUI rule). A file-backed activity keeps it in the `.md`: the next import
  overwrites an app edit, as it does for tags, so the drawer field says so on a
  catalogue activity.
- **A Bank copy carries it** (`copy_bank_activity`, SQL), and "Make a copy" too
  (client code, `lib/copyActivity.ts`, its own select and insert). The time is
  a fact about the content, unlike a due date.
- **Shown the day it lands:** the Activities list row shows "about 30 min"
  in the same step as the drawer field, so the field never ships without a
  reader (P1).
- **No guessed default.** An activity with no time shows "time not set", never
  32: the graph's number is a cap, not an estimate, and a wrong number on a
  plan is worse than a gap.
- *Not* derived from section kinds × `phase_budget_min`: activities authored in
  the app have no phase labels, and a derived figure is the guess this
  refuses.

**PP-6 · The day's total.** Recommended: each day card sums its blocks as a
range, from numbers that already exist:
- Number facts: the class's sprint minutes when the sprint is on (the value
  the student list reads, `sprint.minutes`, 5 when unset).
- Hook: `period_shapes` hook minutes (2–3) when the day has a hook.
- Each activity: its `minutes`.
- Practice after each activity when mixed practice is on: `practiceMinutes(items)`.
- Shown as "About 47–52 min". When any activity has no time: "About 15–20 min
  + 3.2 Unit rates (time not set)". Never a clock (PA-11 stands).
- *Not* a stored period length to compare against ("8 minutes over"). That is
  PA-10 (a), which was ruled down; filed with a trigger: a teacher asks whether
  a day fits.

**PP-7 · The hook for a day.** Recommended: **the planner dates a hook through
the existing `class_hook_use` row**, allowing a future `used_on`:
- On a day card, "Hook: choose" offers the unit's pool (the chain of the day's
  first chained activity, as the Today panel's link does now), unused hooks
  first, in pool order. Picking writes `class_hook_use (class, hook, used_on =
  that day)`.
- The chain page then shows a future mark as **"Planned Tue 18 Nov"** and a
  past one as "Used 12 Nov", as now. Its date field loses the `max=today` cap.
- One hook per class per hook stays true (a class hears a hook once), and one
  hook a day is the planner's display rule (§17): a second hook dated the same
  day shows as a warning on the card, not an error.
- Why not a `kind = 'hook'` row in `class_period_items`: that needs
  `activity_id` nullable and the FK reworked, and it would be a second record
  of "this class used this hook" beside `class_hook_use`. The costs of reuse: a
  planned hook the class never got to reads "Used" once its day passes ("Not
  used" unmarks it), and **a hook does not travel with a moved activity**: it
  is tied to its day only by `used_on`, written by the client, while moves are
  definer RPCs on another table. Recommended: the hook stays on its date; when
  its day no longer has an activity from its unit, the card says "Hook
  planned, no activity from this unit · Move hook". A carry-on leaves last
  time's hook alone (the class did hear it).
- `chainHooks.ts` and `ChainHooks.tsx` are its only readers, and its RLS has
  no date rule, so a future `used_on` breaks nothing (checked in review).
- The hook dates use **the class's day**, not the browser's (`localToday()`
  today); the chain page's marks change to the class's day in the same step.

**PP-8 · The summary view.** Recommended: the **day card** (PP-1) is the summary,
shown in three places: the Today panel (today's card, replacing the one-line
`periodLine`), the Plan page (every day), and the present view's header. It
reads top to bottom in §17's order: Number facts · about 5 min → Hook (its
prompt, first eight words) · about 2–3 min → each activity with its minutes,
then Practice · about 6–9 min → the total. Each activity links to its existing
teacher page; the hook links to the present view.

**PP-9 · The presenting view.** Recommended: **`/classes/:classId/present`**
(lazy, teacher only), for the projector:
- Today's blocks as large rows in order, each with "about N min"; the student
  link and join code large at the top (`/practice/CODE`), so students know
  where to go.
- **The hook, large**: its prompt full width. **Its teacher note is hidden** and
  opens with "Show note (on screen)": notes carry answers, and this page is on
  the projector.
- No student names, no progress, no answers, no clock, no timer.
- One "Highlight" per row the teacher clicks to say "we're here" (a local
  highlight only, nothing saved or sent to students: not the lesson player PA-2
  refused).
- Escape or "Back" returns to the class.
- *Not* the activity itself on the projector: opening it is the existing
  preview, one link away.

**PP-10 · "Due at the end of the day it's used."** Recommended: **a one-click
offer, never automatic.** On a planned activity with no due date, the day card
offers "Make it due this day", which calls `set_class_activity_due` with that
date. After that the two are independent: moving the plan does **not** move the
due date (the card says "Due Tue 18 Nov" so the teacher can see they differ).
DD-5's separation holds; this is a shortcut into the existing field.

**PP-11 · The class's timezone, before planning ahead.** Recommended: **a
teacher timezone control ships with the planner** (TODOS' "A teacher timezone
control", pulled forward):
- On the Plan page: "Days follow Pacific/Auckland time · Change", a select of
  IANA zones, written through a definer RPC `set_my_timezone(zone)` (the RLS
  recursion rules out a direct write), validated by 0036's guard.
- **Prefilled on a teacher's first visit when unset**: if `users.timezone` is
  null, the page offers the browser's zone ("Your classes follow Chicago time.
  Use Auckland time?"), one click, never silent.
- Also offered on the class page, not only the Plan page: a teacher who never
  plans would otherwise stay on Chicago for sprints and due dates.
- Why now: planning "Tue 18 Nov" is wrong all school day for an NZ teacher on
  the Chicago default, and a US teacher outside Central time is off at the day
  boundary.
- **What a change touches, said in the control ("This moves the day for all
  your classes"):** the zone is per teacher, and `fact_class_zone` keys the
  sprint's and mixed practice's `practice_day`, the unit tracker, video first
  tries, DoL retakes, due dates, Today and the check rollup (whose self-heal
  handles it, 0036). A forward change in the middle of a school day can give
  students a new `practice_day`, so a second sprint that day. Recommended: allow
  it, warn in the confirm line ("best done outside class time"), and add a
  verify row for a mid-day change.
- The name control it was bundled with stays filed.

**PP-12 · The letter to the curriculum side (drafted below, not sent).**
Recommended: send it **after these rulings and before the importer step**, so
the key name is theirs to agree. It asks for a `minutes:` line in each
activity's ```meta fence.

## The GUI (every feature ships with one)

| feature | insert | edit | remove | where |
|---|---|---|---|---|
| plan a future day | "Add activity" on a day card | move up/down, "Move to…" a date | "Remove" | Plan page |
| carry on from last time | "Carry on today" | n/a | ignore it | Today panel |
| activity time | the drawer field | the drawer field | clear the field | editor settings drawer |
| a day's hook | "Hook: choose" | choose another | "Not used" | day card; chain page shows "Planned" |
| due from a plan | "Make it due this day" | the due field (existing) | "Clear" (existing) | day card → class Activities panel |
| timezone | first-visit offer | "Change" | n/a (a zone is always in force) | Plan page |
| present | "Present" on the Today panel | n/a | Back | present route |

Catalogue `minutes:` is mirrored data the teacher can SEE (on every card) and,
for their own copies, edit.

## Data, compliance, migration

**One migration, 0088** (author applies live before the push, OV-7):
- `activities.minutes smallint null check (minutes between 1 and 120)`;
  `copy_bank_activity` carries it ("Make a copy" is client code, step 2);
  `publish_activity` is untouched
  (a row column, not the document, so **no sanitize change and no viewer
  bundle**).
- `class_period_items`: the latest past day kept (PP-2), with `verify-0082` B6,
  the table comment and the migrations README line rewritten to match; `set_class_plan`,
  `class_plan`, `move_class_plan_item`, `reorder_class_plan`; `set_class_today`
  re-pointed at `set_class_plan`; `class_today` gains each activity's
  `minutes` (the student list shows it, PA-5).
- `set_my_timezone(zone)` (PP-11).
- `verify-0088.sql`.

**Compliance.** No new personal data: `minutes` is about content;
`class_period_items` names no person (data-map draft-48 stands); keeping the
latest past day ("removed at the next write after a later day has passed") is a
retention change to planning state, so `retention-policy.md` gets a line and
its stamp in the migration's commit. `class_hook_use` future dates
change no column. `users.timezone` already exists and is documented. The
migration header says so, and `data-map-coverage` confirms the range.

**No Edge Function change, no deploy.** The catalogue prompt changes
(`pnpm prompt:catalogue`; refresh the boundary-page stamp row after the push),
the teacher paste prompt (`markdownImportPrompt.ts`) and
`docs/markdown-import-format.md` teach `minutes:`. No capability-facts change
(meta is exempt), so **no pin bump**.

## Test discipline

- `verify-0088`: owner-only writes; a student can't call the planner functions;
  a past date and a date past the year end are refused; the cap holds across
  days; a move keeps the cap on the target day; `set_class_today` still behaves
  as 0084 apart from the kept day; only the latest past day survives a write
  (B6 rewritten); a hidden activity doesn't count toward the cap; `class_today`
  shows today only, with minutes; a Bank copy carries `minutes`; a mid-day
  zone change (PP-11).
- "Make a copy" carries `minutes` (client test).
- The importer: a minutes-only change writes the column and no draft.
- **The class's day at both hemispheres' midnights**: a plan for "tomorrow"
  written at 23:30 and 00:30 in Pacific/Auckland and America/Chicago, in fresh
  Node processes for the client helpers (the due-dates lesson: Node caches its
  zone, so the in-process test passed with the guard removed).
- The day total as a pure function, with a mutation test (remove the "time not
  set" branch; watch it go red).
- The present view never renders a hook note until asked, and never a student
  name: a browser-lane assertion bound to rendered output, mutation-tested once.
- The importer: `minutes:` parsed, out-of-range refused by name, the update
  reported in the dry run, an absent key leaves the column alone.
- The shell is measured; new teacher routes get `TEACHER_JOURNEYS` rows.
- A Fable review per build step.

## Build shape (if all yes)

1. **0088 + verify** (author applies live, runs verify, then the push of any UI
   that calls it).
2. **Importer, prompts, drawer field, "Make a copy", the Activities row's
   minutes:** `minutes:` end to end; regenerate the catalogue prompt. Every
   select that reads the new column is OV-7-bound (pushed after 0088 is live).
3. **Timezone control** (PP-11), before any planner screen, so the first
   planned day is on the right date.
4. **Plan page + day card + Today panel** (PP-1–PP-4, PP-6–PP-8, PP-10).
5. **Present view** (PP-9).
6. **Student Today list minutes.**
7. Send the letter (after step 1 lands, before step 2 is pushed), then refresh
   the stamp row after the prompt change is on `main`.

## Not checked yet

- Whether 10 days is the right window for a teacher who plans a unit at a time.
- How the present view reads on a real projector (contrast, distance).
- Whether teachers notice that moving a plan doesn't move its due date.

## The letter (SENT 2026-11-13 as B-246, with a summary of PP-1…PP-12, to the curriculum session the author confirmed; answered by C-188, 2026-11-14)

> **B-___ · Per-activity minutes in the ```meta fence**
>
> The platform is building a teacher's period planner: a day card with each
> block's minutes and a total, and planning days ahead. Number facts, the hook
> and practice already have minutes from `period_shapes` and the class's
> settings. Activities have none: `activity_defaults.duration_min` (32) is a cap,
> and we won't show a cap as an estimate.
>
> 1. **Would you add `minutes: <whole number>` to each activity file's ```meta
>    fence**, your estimate for a typical class to finish the activity including
>    its DoL? Your builder already has a per-activity Minutes field; this asks
>    for it to reach the file. We propose the key `minutes:`, matching the
>    fence's plain words; tell us if you prefer `duration_min:`.
> 2. **Range:** we accept 1–120 and refuse anything else by name. Should the
>    importer *warn* above `activity_defaults.duration_min`, or is a longer
>    activity sometimes right (an assessment, a consolidation)?
> 3. **Quizzes and tests:** a quiz has `quiz.duration_min` 12. Should quiz files
>    carry `minutes: 12` too, or should the platform read the type's default?
> 4. **Missing:** an activity without the key shows "time not set". Fine, or
>    would you rather every approved file must carry it (a check on your side)?
>    Note that removing the line later leaves the last imported value in place,
>    as `tags:` does; a file can change its minutes but not clear them.
> 5. **Planning ahead, for the record:** the teacher places every future day by
>    hand; the platform never fills one in or suggests a date (§18, C-180's
>    view on PA-4). Students see only today.
>
> No pin bump: meta keys are not capabilities. We'll regenerate the
> catalogue-authoring prompt once the key is agreed and send the new stamp.

## Their answer (C-188, 2026-11-14)

- **Key: `minutes:`, agreed; push the importer.** Not `duration_min:`, which
  already means two things on their side (the activity cap 32 and the time a
  quiz is given, 12). No `x_` prefix, since we read it (D20). **Definition:** a
  typical class's time for the whole activity, review through DoL. It leaves out
  the hook, the sprint, mixed practice and transitions, which the planner adds
  as separate blocks. That matches PP-6. Their builder's Minutes field will write
  `minutes:`, start unset, and stop at the cap.
- **Above the cap:** their lint REFUSES anything over
  `activity_defaults.duration_min` (§10 is a hard cap; consolidations are
  activities, D24). They ask the importer to WARN, not refuse, so one bad estimate
  can't block an import. **Teacher copies stay 1–120 with no warning** (the cap
  governs authoring, not classrooms), as PP-5 has it. ⚠ The importer can't warn
  yet: `duration_min` reaches this side only as the string `"duration_min"` in
  `period_shapes`, never as a number, and a hard-coded 32 is the value that has
  already changed once (24 → 32). B-247 asks whether to mirror it.
- **Quizzes carry no `minutes:`.** Quizzes are printed, never imported. A
  planner showing a quiz should read `quiz.duration_min` from the graph (D25).
  **Their ask:** on a quiz day the quiz's 12 minutes REPLACE the sprint and
  mixed practice (`quiz.slot`, §17); they aren't added on top. How does the
  planner know a day is a quiz day? **It doesn't: v1 has no quiz day.** A quiz
  isn't an activity row, and PP-6 sums only what's planned. Filed in TODOS as
  a wish with a trigger.
- **Missing key:** they REQUIRE `minutes:` on approved lessons and
  consolidations (lint), warn on drafts, and banks and quizzes carry none.
  **Their ask:** an unset activity must not count as zero. **PP-6 already rules
  this:** the total reads "About 15–20 min + 3.2 Unit rates (time not set)",
  never a lower sum.
- **§18 correction:** "never suggests" was our v1 choice, not their rule. §18
  says the platform "may suggest, never schedule" (D49), so a later prompt such
  as "chain final done, a corrective is next" stays open. **Suggesting a date
  stays out.** Letter item 5 put that wrongly; PP-1 never claimed it as their
  rule.
- They want the new authoring-prompt stamp once the importer is pushed, and will
  send their builder/lint PR number.
- **B-247 sent 2026-11-14:** recorded the above; asked them to carry the cap as a
  number (`activity_duration_min` beside `period_shapes` in practice-registry.json)
  so the importer can warn; told them there's no quiz day in v1 (filed with a
  trigger); accepted the §18 correction.
- **C-189 (2026-11-14):** the cap is in practice-registry.json as
  **`duration_min: 32`** (the graph's name, not ours: every body key is copied
  from the graph unchanged). Their PR #92 (head dcebdd63, revision b4d730f3…, 11
  keys) is open and waits for our clearance. Builder/lint is PR #93:
  `minutes:` is required before Approve, and anything above the cap fails their
  gate. None of the 15 activities in their drafts/ carries `minutes:` until the
  author sets each one.
- **B-248 sent 2026-11-14: #92 NOT CLEAR, hold the merge.** Our importer
  refused it by name ("keys outside the agreed ten: duration_min"); the same
  file without the key passed. B-248 said a migration (0089) relaxing 0083's
  `mixed_settings_ok` would come first. **Superseded when step 2 was built: no
  0089.** The importer reads `duration_min` for the over-cap warning and keeps
  it OUT of the mirror (nothing in the app reads the cap; YAGNI), so the
  database's exact key count never sees it. #92 is clear once the importer is
  pushed. **B-249 sent 2026-11-14:** told them so, named the built commit (ae85b0c3,
  unpushed), and asked them to keep #92 open until B-250 confirms the push and
  carries the new prompt stamp. Next C-190.

## As built

**Step 1, migration 0088 (2026-11-13), LIVE:** applied by the author, verify-0088 7/7 and verify-0082 4/4 on live. Applied and verified on
the local stack (verify-0088: A 5/5, B 10/10, C 6/6; verify-0082 with B6
rewritten, 0084 and 0054 still green). Fable-reviewed: no P0; the fixes it
asked for are in. Differences from the plan:

- **Only adding is held to the year-end limit.** A row left beyond a shortened
  year end can still be removed, or moved back inside it (review P1: it was
  otherwise stuck until the activity left the class).
- **`class_today` shows at most six**, first by position. A soft-deleted pick
  frees a slot, so restoring it can leave seven rows; students never see
  seven. The teacher's `class_plan` shows them all.
- **Audit ops:** `use_today` / `clear_today` for today, as 0082 wrote them;
  `plan_add` / `plan_remove` for other days; `move_plan`, `reorder_plan`.
- **The class lock is `for no key update`**, so a planner write doesn't block a
  student joining the class.
- **`set_class_today` keeps 0084's `today_full`** by catching `day_full` in
  its wrapper, so the shipped Today panel needs no change at the push.
- Mutation-tested: counting hidden rows in the cap (B4 red), deleting every
  past day (B7 and verify-0082 B6 red), holding removes to the limit (B3 red).

**Step 2, `minutes:` end to end (2026-11-14, overnight run):** no migration,
no deploy (0088 already holds the column; nothing in sanitize, viewer or grading
changed).

- **Importer** (`scripts/batch-import.mjs`): `minutes:` (1–120; anything else
  warns and is ignored, never clamped) is NOT_CONTENT like `primary_skill`. A
  minutes-only change goes to path-only and writes no draft; an absent key
  writes nothing (`minutesPayload` → `{}`); creates carry it; the update report
  and the path-only line name the change.
- **The cap (C-189):** the practice registry may carry `duration_min` (whole ≥
  1). The importer reads it for a per-file WARNING on any `minutes:` above it
  (not a binding warning, so `--strict` doesn't fail) and keeps it out of
  `mixed_settings`. **So no 0089**, which supersedes what B-248 promised.
  Proven with a local dry run of curriculum PR #92's own file (revision b4d730f3):
  accepted, the warning fired on a 40-minute probe, the mirror listed ten keys.
- **Editor:** "About how long" in the settings drawer
  (`components/ActivityMinutesField.tsx`) commits on blur or Enter through
  `saveMinutes`, whose body is `minutesUpdate(next)` = `{ minutes }` alone,
  pinned by its test. Browser-checked on the local stack: on a published activity with
  no draft, setting 35 wrote `minutes = 35`, left `draft_content` NULL and
  `updated_at` unmoved; the Activities row then read "about 35 min". A paste's
  `minutes:` fills an unset time only (`mergeImportedMinutes`, D16), with its
  own write.
- **Copies:** "Make a copy" carries it (`lib/copyActivity.ts`, tested).
- **Prompts:** the catalogue prompt says drafts never carry `minutes:` (the
  approver sets it, C-189), and was regenerated. The teacher paste prompt teaches it only when the
  teacher gave a time. `docs/markdown-import-format.md` documents it.
- Fable-reviewed: P0 (the dev drawer route lacked the new prop, so typecheck was
  red) was fixed. The P1 was this record's 0089. The P2s were also fixed: the
  payload pin, the copy assertion, and the help text, which now says the import
  replaces the value only if the file states one.
- Mutation-tested: removing the row's time render (Activities test red);
  dropping `minutes` from NOT_CONTENT (two PP-5 importer tests red).

**Step 3, the timezone control (PP-11, 2026-11-14, overnight run):** no migration, no
deploy (0088's `my_timezone` / `set_my_timezone` are live).

- `components/TimezoneControl.tsx` + `lib/teacherTimezone.ts`, on **My classes**
  (one per teacher, not per class), lazy-loaded and rendered **for teachers
  only**. A student can reach `/classes`, and the server refuses them anyway.
  It reads "Days follow Auckland time · Change". When unset and the browser
  differs, it offers "Use Auckland time?", one click and never a silent write.
  Every path to a save shows the warning that a change moves the day for all
  classes and is best done outside class time. A teacher on the Chicago default
  can save it to confirm it.
- Browser-checked on the local stack: the offer showed for the unset playtest
  teacher; one click wrote `Pacific/Auckland` and an audit row (`op:
  set_timezone`, no zone in the log).
- Fable-reviewed. P0: the classes journey went over its 14.25 KiB cap; fixed by
  lazy-loading the control, with no cap raised. P1: students saw the offer;
  fixed by the teacher-only render. P1: a Chicago teacher could never confirm;
  fixed. P2s fixed: focus returns to Change, the save is announced, the warning
  is tied to the select, and load-error and refused-offer tests were added.
  Mutation-tested: the unset-only offer (2 red); the teacher-only render (1 red).
- Zone names: the browser lists legacy aliases (Asia/Calcutta); Postgres accepts
  them (0063's lookup falls back to `pg_timezone_names`). The label is cosmetic.
- The mid-day change is covered by verify-0088 C5 (`fact_class_zone` and
  `class_today` move). Not asserted: a plan row left on the old "today".

**Step 4a, the Plan page (PP-1–PP-4, PP-6; 2026-11-14, overnight run):** no
migration, no deploy. Step 4 was split because the whole of it was too large
for one reviewable change: **4b** covers the hook picker (PP-7), "Make it due
this day" (PP-10), "Carry on today" from the last day (PP-2), and the itemized
day card in the Today panel (PP-8).

- `/classes/:classId/plan` (`routes/ClassPlan.tsx`, `lib/classPlan.ts`, lazy;
  `class_plan` refuses anyone but the class's teacher). It is linked as "Plan
  ahead" from the Today panel and from each class card on My classes. It shows
  ten school days from the class's today (a weekend day only when something is
  on it; today always), with Earlier / Later / Back to today and "Go to" a date
  (clamped to today…limit). "Last time" is shown read-only. The timezone control
  sits at the top (PP-11).
- Each day card has its activities in order, each with its time ("about 30 min" /
  "time not set" / struck "no longer available"), ↑ / ↓ (the full day's ids,
  unavailable rows included, as `reorder_class_plan` requires), "Move to…" a
  date, Remove, and "Add activity" (this class's published activities not
  already on the day; hidden past the limit and before today, where the rows
  stay removable).
- Total (PP-6): number facts 5 when the sprint is on and the day has an activity;
  hook minutes from `period_shapes` when a hook is dated that day; each
  activity's minutes; practice per activity at 60–90 s a question. That is the
  student list's own arithmetic, not the mirrored copies, so the two agree. An
  unset time is named ("+ Graphs (time not set)"), never counted as zero.
- After every write the page re-reads its window, so the server's answer is what
  shows (latest-wins, so a slow read never overwrites a newer one).
- Browser-checked on the local stack: add ×2, ↓, and Move to Tue each wrote the
  expected rows and audit ops (`plan_add` ×2, `reorder_plan`, `move_plan`);
  test rows removed afterwards.
- Fable-reviewed, no P0. P1s fixed: no latest-wins guard, and "Go to" loaded on
  every keystroke (a past start gave dead Add forms); a stale `start` after a
  write, with navigation not disabled while busy; sprint/practice minutes not
  matching the student list; thin tests (range args, limits, weekend today,
  reorder with an unavailable row). P2s fixed: a failed re-read keeps the page
  with "Try again"; Later is bounded by the limit; a weekend today has a card;
  the card is labelled by its heading. P2s left: focus when an arrow disables at
  the top or bottom of a list; the error line sits at the top of the page.
- Mutation-tested: an unset time counted as zero (2 red); the Go to range guard
  (1 red).

**Step 4b-1, "Make it due this day" (PP-10) and "Carry on today" (PP-2), on the
Plan page (2026-11-14, overnight run):** no migration, no deploy.

- Make it due: on a planned, available activity in the class with no due date,
  a button calls `set_class_activity_due(class, activity, that day)`; the row
  then reads "Due Mon 16 Nov". After that the plan and the due date are
  independent (a move doesn't move it). Clearing or changing it stays in the
  class Activities panel (DD-2's field).
- Carry on today: "Last time (Thu 12 Nov):" lists that day's activities, each
  available one not already on today with "Carry on today" (`set_class_plan`
  for the class's today; the cap and refusals are named as everywhere else).
- **Where it differs from the doc, recorded rather than ruled:** PP-2 and the
  GUI table put "Carry on today" on the **Today panel**. `class_today` doesn't
  return the last day, so the panel needs a `class_plan` read. That read lands
  with the panel's itemized day card (PP-8) in **4b-2**, together with the hook
  picker (PP-7) and the chain page's "Planned" marks. Until then the Plan page,
  linked from the panel as "Plan ahead", is where carry-on lives.
- Browser-checked on the local stack: carry-on put Decimals on Fri 13 Nov
  ("on today" replaced the button); Make it due wrote `due_on = 2026-11-13` and
  the row read "Due Fri 13 Nov"; test data reverted.
- Fable-reviewed, no P0. P1s fixed: the "Due …" line was untested; it is now
  bound to render, and mutation-tested (dropping the refresh fails 1). The doc
  mismatch is recorded above. P2s fixed: a failed options refresh keeps the
  list; "not in this class" gets its own message. P2s left: no undo on the page
  (the class panel clears a due date); a date set in another tab isn't seen
  until reload; a weekend today carries onto the weekend.
