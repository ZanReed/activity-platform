# Review period — design pass

**Status:** RULED 2026-11-17 (author: "Yes to all"). Drafted and Fable-reviewed the same day. Its four major
findings are folded in, marked "review finding". RV-0 to RV-14 were open for
the author. Nothing is built.
- **Queue position:** TODOS → "BUILD ORDER", item 6: "the review period keeps
  its place, after their keys". Period assembly reserved it as PA-9.
- **The keys:** the curriculum side's C-196 (answering B-259), in their PR
  [ZanReed/curriculum#98](https://github.com/ZanReed/curriculum/pull/98) at
  `4e69e2f`. It is green and **unmerged until our check** (RV-0).

## RULED by the author 2026-11-17: "Yes to all"

RV-0 to RV-14 are ruled **as recommended**, including:
- RV-0 as widened by C-197;
- RV-1, which confirms R1–R4 on this side;
- RV-14 (a).

**Next:** RV-0's importer change is built ahead of the review build. It
accepts the 15 new keys and mirrors none. After the author pushes it, and
#98/#99 are re-verified at their rebased heads, B-262 clears them to merge.
The review build itself follows in the slices in §5.

## As built — slice 2, migration 0091 (2026-11-18)

Built locally, unapplied live, Fable-reviewed (nothing major; its minor
findings fixed below). `scripts/verify-0091.sql` passes 16/16 on the local
stack, and its top-up, placement, score, stop-early and recent-list checks were
each mutation-tested once. verify-0066/0067/0068/0070–0074/0077/0079/0081–0084/0088
are unchanged and still pass. Two readings were settled while building it:

- **Elapsed share = days since the key was last practised (of any kind) ÷ its
  current interval.** C-196 says "days since last practice". Measured from the
  day the schedule last moved, it would pull the same skill forward every day,
  because a right pulled item leaves the schedule alone (R2). This reading also
  keeps verify-0081's staleness check (B10) true as written.
- **Placement needs no gap loop.** Every key's first item goes before any key's
  second, repeating keys first. A key's items then end up at least as many
  places apart as there are keys: that meets the 5-item gap whenever the pool
  has 5 keys, and is the furthest apart any order can manage when it has fewer
  (never adjacent unless there's a single key). A greedy gap loop was written
  first; a mutation showed it changed nothing, so it was removed.
- **One review a day, with no position.** A review is the day's practice block,
  so `class_period_reviews` is keyed `(class_id, on_date)`.
- **One entry.** On a review day `start_mixed_session` plans the review itself,
  so the daily block and the review can't both run. After a finished review,
  the day is done.
- **A skip earns no re-try; only a wrong answer does.** A re-try lands half a
  place after the furthest of: the original + gap, the furthest answered item,
  and the key's other items + gap. It prefers a template not yet served in
  the session. A replayed wrong answer hands back the same re-try and adds none.
- **Stopping a review early doesn't end the day.** A review counts as done only
  once every planned item is answered; the next start plans the rest (never
  re-serving a skill practised today). Resuming reports the open session's own
  kind.
- **Focus backfills.** C-196 says "up to 60%". When the other keys run out
  (for example, every chain is ticked), focus keys fill the rest, so the
  session isn't left at 60% of its size. **To tell the curriculum side** in the
  next letter, with the elapsed-share reading above.
- **Re-tries are left out of every panel read:** `mixed_recent`,
  `mixed_student_recent`, `mixed_who_first`'s same-mistake window, and
  `finish_mixed_session`'s skip count.
- **Known, accepted:** a session whose planned items are all answered but whose
  re-try is left unanswered stays unfinished, like an abandoned daily session.
  Slice 3's screen shows the waiting re-try. Focus counts a skill by its
  activity's `primary_skill`; skills a consolidation brings in (D71) count as
  non-focus.

**Owed before slice 3:** the author applies 0091 live and runs verify-0091
there. The importer change that mirrors the review keys ships after that
(OV-7), and so does the check-activity re-try path.

## As built — slice 3a, the check-activity re-try path (2026-11-18)

Built locally, Fable-reviewed (nothing major; its tie and test findings fixed).
- **Start** passes `review`, `capacity` and `thin` on a review day, and
  `session.review`; served items name `retryOf`. The fields are optional, so
  the wire version stays 3 and today's app ignores them.
- **Check**: after the try is RECORDED, a wrong answer that earned a re-try
  returns `retry: { item, afterSeq }`. The item is sanitized and seeded like
  any slot, and `afterSeq` follows the payload's `(position, seq)` order. A
  wrong replay, or a lost race, hands back the same re-try. A daily wrong
  answer pays no extra read; DoL practice never looks.
- `supabase/functions/check-activity/index.ts` reads `position` and `retry_of`.
  **`pnpm deploy:check` is owed**, then a hash-verify of the grading bundle.

**What slice 4's runner must handle** (`practice/MixedRunner.tsx` today):
- it fixes `items` at mount and ignores `result.retry`, so a review shows
  "finished" after the last planned item while the session is still open;
- `total={items.length}` counts re-tries on resume;
- `tallyOf(results, planned)` counts re-try results, so the done screen can
  disagree with the server's planned-only score;
- a wrong replay returns the re-try again, so the runner dedupes by seq;
- nothing yet reads `review`, `capacity` or `thin`.

**Slice 3b** (the importer mirroring the ten review keys) is BUILT
(2026-11-18): `planPracticeRegistry` puts the ten keys into the mirrored
settings when present (all ten or none, as RV-0 already checked) and refuses
`review_items_max` over 50 by name, the bound 0091's CHECK holds it to. The five
diagnostic keys stay out of the mirror: no migration counts them yet. Checked
against both rebased registries (#98 at 2911793, #99 at 24f2956): each mirror
payload is 20 keys and passes the local `mixed_settings_ok`. It takes effect at
the first import run after #98 merges (B-263 cleared #98, then #99).

- **Push before importing.** `mixed_settings_revision` is insert-only, and a
  revision is the hash of the WHOLE registry body, but the mirror is a subset.
  An import on the old importer would store ee1bebbb/60e36b25 without the
  review keys, and every later run would be REFUSED ("already mirrored with
  DIFFERENT settings") until the curriculum body changed. Live was clear
  2026-11-18 (latest mirrored revision 0e6df783, v0.19.8).
- **The same trap waits for the diagnostic build:** 60e36b25 will be mirrored
  without the diagnostic keys, so mirroring them needs a new curriculum
  revision or a migration that lets a revision gain keys.
- `review_pulled_step_up` / `review_pulled_moves_due` set to `true` are refused
  by name: 0091 builds only false, and a true would pass the CHECK and change
  nothing (review finding).

## As built — slice 4, the screens (2026-11-18)

Migration **0092** (reads only, no personal data) plus the app. verify-0092 passes
4/4 locally. The app tests pass, and so does `pnpm verify`; the student and a11y
Playwright lanes pass too (124 and 26), though neither has a review fixture yet.
Fable-reviewed: nothing major. Its findings on cost and accuracy are fixed: the
estimate is read only for days that hold a review, and sized for that day; a
stored unit stays tickable; the copy names no setting's value.
- **Planner** (`routes/ClassPlan.tsx` DayReview): "Make this a review day" on any
  day from today on. The review box shows:
  - the estimate ("About 33 questions · fewer for N of M students (not much
    learned yet)", from `review_preview` for that day), or, until the review
    keys are imported, a line saying students get their usual practice;
  - the Double period tick and Remove review;
  - "Before a unit test: weight it towards these units", listing the class's
    chains (Bank copies under their source's chain).
- **Practice settings** (`MixedPanel`): "Period length", from the mirrored
  `period_shapes` lengths, defaulting to the shortest.
- **Student:** on a review day the Today list and the practice card say
  "Review". The card explains it. The runner names itself "Review", slots each
  re-try in where the server says, labels it "Another go at one you missed. This
  one isn't scored.", and counts planned questions only on the done screen. The
  resume card counts planned questions answered.
- **Browser-checked on the local stack** (`pnpm playtest`, with the review keys
  mirrored locally): placed a review, ticked a unit, ran it as a student,
  answered one wrong. Its re-try arrived after question 6 on another template.
  The done screen read "0 of 6 right, skipped 5", and the stored session matched
  (review, planned 6, one re-try, finished).
- **Seen while checking, not changed:**
  - a class with no daily practice yet gets small reviews, because new skills
    are capped at `mixed_new_skills_per_session` (2);
  - ~~the done screen still says "Practice done"~~ fixed in slice 5;
  - the "✕ Try again" pill in a one-try place is TODOS → Playtest sweep 1.
- **Known:** if the re-try read fails on a check, the runner ends early and the
  next resume serves the waiting re-try.

**Owed:** apply 0092 live and run verify-0092 there, BEFORE pushing the app
(OV-7: the planner calls `review_preview`). Then push. Until the review keys are
mirrored by an import run (slice 3b, above), a placed review changes nothing
for students, and the planner says so.

## As built — slice 5, polish (2026-11-18)

- **The end of a review says so:** "Review done" and "Review score: …", from
  the runner (`session.review`) and from Finish here on the resume card (the
  preview's `review`, which follows the open session's kind). Unit tests on
  both paths, mutation-tested.
- **A review walk in the student lane** (`e2e/student/mixed-practice.e2e.ts`
  test 5; the stub's `review` option): the card names the review, a wrong first
  answer brings its re-try back as "Question 2 of 3: another go…", the end is
  "Review done", and the score counts the 2 planned questions only. The checks
  go 1, 3 (the re-try), 2.
- **Review findings fixed:** the review card no longer says "mixed" (DM-13 is
  now asserted on the card as well as at the end); its score line says "review
  score"; the e2e stub's payloads are typed against the wire (`satisfies`,
  mutation-checked). The rest is in TODOS → "Review period: copy and edge
  cases left after slice 5".
- **B-264 asked the curriculum side about small first reviews:** the daily
  new-skills cap (2) also limits a review, so a class with little daily
  practice gets a short one (6 of 33 locally). Options (a) keep, (b) lift in a
  review, (c) a review-only key. No answer is needed before #98/#99 merge.

## 1. What C-196 rules (their side)

A review period is **the mixed scheduler with overrides**.
- **Ten `review_*` keys** are added beside the `mixed_*` keys in
  `practice-registry.json` (21 keys, revision `ee1bebbb…`).
- **Anything without a `review_` key inherits its mixed value:** the
  intervals, `mixed_wrong_drop`, 90 s an item, and the class's grading
  setting.

C-196 reports **R1–R4** as Zan's rulings of 2026-11-17. They **need
confirming on this side** (RV-1).

| Key | Value | Rule |
|---|---|---|
| `review_items_max` | 36 | Items = (period minutes − sprint minutes) × 60 ÷ 90, capped at this. The sprint stays in the period when it's on |
| `review_max_items_per_skill` | 2 | Never raised: a third item on one skill is massed practice |
| `review_same_skill_min_gap` | 5 | A skill's second item comes at least 5 items later. It relaxes to "never adjacent" when the pool is too small |
| `review_retry_after_wrong` | 1 | **R1:** a wrong answer earns one re-try, at least 5 items later, outside the cap |
| `review_max_discrimination_share` | 0.33 | Replaces `mixed_max_discrimination` (1). Both skills of a pair must be in the student's pool |
| `review_pull_order` | `"elapsed_share"` | **R3:** rank not-yet-due skills by days since last practice ÷ current interval, highest first. **They ask that the exhausted-session top-up switch to it too** |
| `review_pulled_step_up` | false | A right pulled-forward item doesn't step up |
| `review_pulled_moves_due` | false | **R2:** a right pulled-forward item leaves the due date. A wrong one drops a step and reschedules from today |
| `review_min_fill` | 0.67 | Floor: below it the platform doesn't suggest a review. If the teacher places one anyway, it serves what it has, says the pool is thin, and leaves the rest unassigned |
| `review_focus_share` | 0.6 | Before a unit test, up to 60% of items come from the chains the teacher ticks |

- **Look-back:** no limit. The pool is the student's own, as in daily
  practice: skills they checked, plus seeded secure skills once the diagnostic
  exists.
- **Fill order:** due skills, then pulled-forward skills, then re-tries. Then
  the session ends, and its minutes show as unassigned.
- **Graded:** the class's mixed setting. "Planned" = the items generated, not
  the period's capacity.
- **R4:** 36, 0.67, 0.6 and 5 are judgements, kept as keys so classroom data
  can move them.

## 2. What is shipped (read from this repo)

- **The importer refuses #98 today.** `planPracticeRegistry` allows only "the
  agreed eleven" keys (`scripts/batch-import.mjs:276-281`). After a merge, any
  `--practice-registry` import fails by name until we accept the ten. **#92
  was the same trap** (B-248).
  - 0083's `mixed_settings_ok` counts the mirrored keys exactly. So mirroring
    the review keys is a migration; *accepting* them without mirroring is not
    (C-189's `duration_min` precedent, `batch-import.mjs:318-321`).
- **The schedule rules R2 asks for already hold.** "Early" items (0081) are
  scored the way R2 needs a pulled-forward item to be scored:
  - `mixed_steps` (0081:33-41, 64-70): "a right or skipped early try leaves the
    step and due date alone", and a wrong try drops `p_drop` and "the schedule
    restarts from that day".
  - **So a pulled-forward review item is an `early` item.** That gives
    `review_pulled_step_up = false` and `review_pulled_moves_due = false` with
    no change to `mixed_steps`, **with one condition (review finding).**
    `mixed_steps` collapses a day to two flags, "not wrong" and "has early"
    (0081:52-53, 66-69). Suppose a skill gets a right DUE item and an early
    item on the same day: for example, the student did the daily session,
    then a review pulled the same skill forward. Then the step-up the due item
    earned is erased. **So the review plan never pulls forward a skill already
    practised that day** (`last_any = today`), and a re-try inherits its
    original item's marker.
- **Two items on one skill in a day are one result.** `mixed_steps` judges a
  day by "every first try on the key that day". Both right steps up once; one
  wrong drops once. A re-try after a wrong can't undo the drop. That matches
  successive relearning's intent: the re-try is practice, not a second score.
- **Sessions are planned at start and fixed.** `start_mixed_session` writes the
  whole plan and snapshots every item (ER-4). **A re-try (R1) is the first
  item ever added mid-session** (RV-5).
  - **Review finding:** `record_mixed_attempt` computes `score_right`,
    `score_answered` and the finish test from EVERY attempt in the session
    (0081:404-410). A naive re-try would close a session early, refusing the
    items still to come, or break 0066:391's `score_answered <= planned` check.
    All three must skip re-tries (RV-5).
- **The daily start counts every session that day** (0081:292-295). It would
  treat a finished review as session 1 and plan a top-up, and it would offer
  an open review as "resume" (RV-3, review finding).
- **`class_period_items` can't hold a review as it stands** (review finding).
  `activity_id` is `not null`, is part of the primary key, and references
  `class_activities` (0082:20-26). Every 0088 planner function assumes an
  activity (RV-14).
- **A second item on a one-template skill repeats the same numbers.** The row
  hash uses the session and item id only (0081:354), so the hash needs the
  item's position salted in.
- **The panel reads every attempt as a first try** (0068:272, 0071,
  `mixed_recent`), so re-tries must be filtered out of it (RV-9).
- **Live, 2026-11-17: no mixed sessions exist yet,** and so none at ordinal 2.
  RV-6 changes nothing anyone has used.
- **The exhausted-session top-up orders by `last_any`,** stalest first
  (0081 t4). C-196 asks to switch it to the elapsed share (RV-6).
- **Classes store no period length.** The planner and the helper line read the
  FIRST length in `period_shapes` (`lib/classPlan.ts:229-245`). Session size
  needs a length (RV-2).
- **`class_period_items.kind` allows only `'activity'`** (0082:19), and was
  reserved for review from the start (0082:5).
- **Nothing on the platform suggests period kinds today.** The planner plans
  what the teacher places, so the floor's "don't suggest" has nothing to
  attach to yet (RV-7).
- **The pool is `mixed_taught`** (0066:470-501): own checks and consolidations.
  Seeds join it when the diagnostic is built (skills-diagnostic.md, SD-5).
  Nothing else changes for review.

## 3. The shape proposed

1. **Placing it.** The teacher places a **Review** on a day in the planner
   (its own row, RV-14). There they can tick the chains a
   coming unit test covers (focus), and see an estimate: about N items, and
   how many students' pools are thin.
2. **Running it.** On that day, the student's Today list shows "Review" after
   the sprint, if the sprint is on. Starting it starts a **review session**: a
   `mixed_sessions` row marked `review`, which takes the place of that day's
   daily mixed block.
3. **The plan, per student, at start:**
   - due skills first, then pulled-forward skills by elapsed share, marked
     `early` (never a skill already practised today);
   - at most 2 items a skill, 5 items apart, relaxing to never adjacent;
   - discrimination at most a third, with every skill of each pair TAUGHT to
     the student (`mixed_taught`, as C-148 already rules for `disc_ok`);
   - focus chains up to 60% of items when ticked;
   - the size is the class's period length minus the sprint, at 90 s an item,
     capped at 36.
4. **A re-try.** On a wrong answer, the server adds one re-try item: the same
   skill, a different template or row, placed at least 5 items later, and
   snapshotted when it is added.
5. **When the pool runs out,** the session ends early, with "That's everything
   for today". The plan shows the minutes left as unassigned.
6. **Afterwards,** review attempts are ordinary `mixed_attempts`, so the
   teacher panel ("Who to see first", "Getting stuck on") reads them with no
   change.

## 4. Decisions for the author

**RV-0. Let #98 merge: accept the keys in the importer now.**
- (a) Ship a small importer change ahead of the build. It validates the ten
  keys with C-196's bounds and does **not** mirror them, like `duration_min`.
  After you push it, we clear #98 to merge.
- (b) Hold #98 until the review build.

**Widened by C-197:** #99, stacked on #98, adds five `diagnostic_*` keys
(skills-diagnostic.md → C-197). The same importer change accepts and validates
them, and mirrors nothing, so #98 and #99 clear together.

**Recommend (a).** Under (b), their `main` stays behind, and any
`--practice-registry` import is blocked meanwhile. (a) needs no migration and
no deploy.

**RV-1. Confirm R1–R4** (re-try after a wrong, a right pulled item keeps its
due date, elapsed-share order, the judgement values as keys).

**Recommend confirm.** R2 and the no-step-up rule are already how "early" items
work. R1 has a real cost (RV-5).

**RV-2. Period length.**
- (a) **A per-class setting,** "Period length", one of the `period_shapes`
  lengths (50/55/60/100), defaulting to the first. The planner's estimates and
  the helper line read it as well, instead of always the first length.
- (b) Pick a length each time a review is placed.

**Recommend (a),** plus a "Double" tick on the review row for the odd double.
It is one nullable column with no personal data.

**RV-3. How a review runs.**
- It is a planner row of its own (RV-14), not an activity row.
- The student starts it from Today.
- It is a `mixed_sessions` row with a `review` flag, replacing that day's daily
  mixed block, so a student doesn't get both.
  - **Written into the start functions (review finding):** on a day with a
    review placed or started, the daily start returns "done today".
  - Resume matches on the review flag, so neither entry resumes the other's
    session.
- **If a day has a review and an activity** (a double), the activity's own
  practice is the review.

**Recommend yes.**

**RV-4. The plan rules as in §3 step 3.** A pulled-forward item reuses
`early`, which delivers R2 and no-step-up with no `mixed_steps` change.

**Recommend yes.**

**RV-5. The re-try (R1): the first mid-session write.**
- (a) On a wrong answer, `practice-handler` appends one item, snapshotted at
  append, keeping ER-4's "graded from the snapshot" rule.
- (b) Reserve re-try slots in the plan at start. That can't know which items
  will be wrong.
- (c) Drop R1 from v1.

**Recommend (a).** The session's score and its finish rule count **only the
items planned at start**. A session is finished when every planned item is
answered and no re-try is still waiting. This fixes the finish test and
0066:391's check (review finding). A re-try is **flagged**:
- it **doesn't count in the practice score** (planned = the items generated at
  start);
- it can't move the step, because the day already holds the wrong answer;
- it never earns another re-try.

**Cost:** the largest piece of the build: a new write path, its replay and
resume rules, and a wire test.

**RV-6. The exhausted-session top-up switches to elapsed share** (their ask).

**Recommend yes, in the same migration.** It changes which not-yet-due skill
comes first in a student's second session on a day. Read live 2026-11-17: no
mixed session exists yet, so nothing in use changes.

**RV-7. The floor and a thin pool.** Nothing suggests periods today, so
"don't suggest" isn't needed. When the teacher places a review, the row shows
"Thin pool for N students; they'll get fewer items". It serves what it has, and
the plan shows the minutes left as unassigned.

**Recommend yes.** A suggestion of when to place a review is filed with a
trigger (D49 allows one).

**RV-8. Graded:** the class's mixed setting. Planned = the items generated at
start; re-tries excluded (RV-5).

**Recommend yes.** It is ER-7 unchanged.

**RV-9. The teacher panel counts review attempts** as practice ("Getting stuck
on", the struggling window).

**Recommend yes, but re-tries are filtered out** (review finding). The panel
reads each attempt as a first try, so a wrong re-try would count twice. A
review shows in a student's recent list labelled "Review".

**RV-10. Unit-test focus.**
- The teacher ticks chains on the review row.
- Their skills are the primary skills of the class's activities in those
  chains, using the `source_path` chain folder.
- With nothing ticked, the review is unweighted.

**Recommend yes.** This is the same ticking pattern as the diagnostic (SD-3).

**RV-11. Compliance.** There is **no new table of student data.** Reviews are
`mixed_sessions` and `mixed_attempts` rows with one new flag, so they fall
under the same retention and the same disarmed `prune_mixed_practice`. The data
map gets a version note for the new columns.

**Recommend yes.** No counsel question is needed: it is the same data, in the
same tables.

**RV-12. GUI rule.** A review is a planner control, not a fence or a
capability, so it gets no `guiSurfaces` row.

**Recommend confirm.**

**RV-14. Where a review row lives (review finding).** `class_period_items` is
keyed on an activity.
- (a) A separate `class_period_reviews(class_id, on_date, position,
  focus_chains, is_double)`, which the planner reads beside the activity rows.
- (b) Make `activity_id` nullable, with a new surrogate key.

**Recommend (a).** Every 0088 function and its verify script stay correct as
they are; the planner merges the two lists by position. Under (b), every one of
them has to be re-audited for a null activity. 0082's reserved `kind` column
stays as it is.

**RV-13. When to build.** It is next in the ruled queue once ruled. The first
real use is before the week 8 Number test, and C-196 warns the floor may block
early-year reviews.

**Recommend:** build after your rulings, in the slices below. The registry
mirror migration is applied live before any UI push (OV-7).

## 5. Build slices

1. **Importer acceptance** (RV-0): validate the ten keys, mirror nothing.
   Ships now if RV-0 is (a).
2. **Migration:**
   - mirror the review keys (`mixed_settings_ok` grows);
   - `classes.period_minutes`;
   - `class_period_reviews` (RV-14);
   - `mixed_sessions.review`, and a re-try flag on items and attempts;
   - the review plan (with RV-6's top-up order);
   - the daily start's "done today" on a review day, and resume matched by
     the flag;
   - re-tries left out of score, finish and the panel reads;
   - the row hash salted with the item's position;
   - verify script; the data map and retention-policy version stamps.
3. **check-activity:** the review start and the re-try append. Bundle, deploy
   and hash-verify.
4. **Screens:** the planner's Review row (focus ticks, estimate, thin-pool
   line) and the period-length setting; the student's Review entry and its
   end screen.

## 6. Not in scope

- Corrective, assessment, transfer and buffer periods (PA-9 triggers).
- Suggesting when to place a review.
- Giving the unassigned minutes to the sprint or DoL practice (C-196: "a later
  option").
- Any score beyond the practice score.
