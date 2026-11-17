# Review period — design pass

**Status:** DRAFT 2026-11-17. RV-0 to RV-13 are OPEN for the author. Nothing
is built.
- **Queue position:** TODOS → "BUILD ORDER", item 6: "the review period keeps
  its place, after their keys". Period assembly reserved it as PA-9.
- **The keys:** the curriculum side's C-196 (answering B-259), in their PR
  [ZanReed/curriculum#98](https://github.com/ZanReed/curriculum/pull/98) at
  `4e69e2f`. It is green and **unmerged until our check** (RV-0).

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
    no change to `mixed_steps`.
- **Two items on one skill in a day are one result.** `mixed_steps` judges a
  day by "every first try on the key that day". Both right steps up once; one
  wrong drops once. A re-try after a wrong can't undo the drop. That matches
  successive relearning's intent: the re-try is practice, not a second score.
- **Sessions are planned at start and fixed.** `start_mixed_session` writes the
  whole plan and snapshots every item (ER-4). **A re-try (R1) is the first
  item ever added mid-session** (RV-5).
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
   (`class_period_items.kind = 'review'`). There they can tick the chains a
   coming unit test covers (focus), and see an estimate: about N items, and
   how many students' pools are thin.
2. **Running it.** On that day, the student's Today list shows "Review" after
   the sprint, if the sprint is on. Starting it starts a **review session**: a
   `mixed_sessions` row marked `review`, which takes the place of that day's
   daily mixed block.
3. **The plan, per student, at start:**
   - due skills first, then pulled-forward skills by elapsed share, marked
     `early`;
   - at most 2 items a skill, 5 items apart, relaxing to never adjacent;
   - discrimination at most a third, with both skills of each pair in the pool;
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
- It is a new `kind = 'review'` on `class_period_items`.
- The student starts it from Today.
- It is a `mixed_sessions` row with a `review` flag, replacing that day's daily
  mixed block, so a student doesn't get both.
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

**Recommend (a).** A re-try is **flagged**:
- it **doesn't count in the practice score** (planned = the items generated at
  start);
- it can't move the step, because the day already holds the wrong answer;
- it never earns another re-try.

**Cost:** the largest piece of the build: a new write path, its replay and
resume rules, and a wire test.

**RV-6. The exhausted-session top-up switches to elapsed share** (their ask).

**Recommend yes, in the same migration.** It changes live behaviour for a
student's second session on a day: which not-yet-due skill comes first. Today
no class has a second session in use.

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

**Recommend yes.** They are practice. A review shows in a student's recent list
labelled "Review".

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
   - `class_period_items.kind` gains `'review'`, plus a focus-chains column and
     a double flag;
   - `mixed_sessions.review`, and a re-try flag on items and attempts;
   - the review plan (with RV-6's top-up order);
   - verify script; data map note.
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
