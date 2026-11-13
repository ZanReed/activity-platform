# Period assembly (D43, last item of the 2026-10-02 BUILD ORDER): design pass

**Status:** RULED by the author 2026-11-04, and LIVE apart from the review period: PA-1 to PA-12 as recommended, read as updated by C-180 to C-183 ("The rulings" below is the summary). Slices 1 to 3 are live (0081, 0082, the student list). Slice 4, the helper line, is live too (0083, registry 0e6df783 imported 2026-11-05). Review isn't built.
Parent: [practice-blocks.md](practice-blocks.md) ("period assembly … get their own pass"). Neighbours: [mixed-practice.md](mixed-practice.md), [chain-hooks-view.md](chain-hooks-view.md), [teacher-guides.md](teacher-guides.md).

## The rule being served (read from their `main` at 2b80f96, graph v0.19.6)

- D43: "A period is assembled from activities and practice blocks", and the teacher **runs it premade**. It is not content generated and managed per class.
- §17 default shapes, "defaults for schools to override":

  | period | shape |
  |---|---|
  | 50 min | fluency 5 · hook 2–3 · activity (cap) · mixed ~8–10 |
  | 55 min | fluency 5 · hook 2–3 · activity (cap) · mixed ~13–15 |
  | 60 min | fluency 5 · hook 2–3 · activity (cap) · mixed ~18–20 |
  | 100 min | fluency 5 · hook 2–3 · activity (cap) · mixed ~12 · activity (cap) · mixed ~12 |

- §17: one hook per day, so a double period's second activity has none. With the sprint off, its minutes go to mixed practice unless the teacher takes them back.
- §18 and `year_plan.placement`: "the teacher places every period"; the platform "may suggest, never schedule".

## What exists today (re-derived from the code, P10)

- **A class has no idea of "today".** `class_activities` holds class, activity, who added it and when (0030). Adding an activity is the whole contract: students see it at once, newest first. No order, date or plan.
- **A student has no class page, by an earlier ruling.** Home shows each class with a Practice link, a progress link and the activity list.
- **Practice is already one link.** `/practice/CODE` offers number facts and mixed practice with their minutes, and goes straight there when only one is on. It ends at a done screen with no way on to the activity, and it knows nothing about the activity.
- **The no-same-day rule needs no work.** A skill enters a student's pool the practice day after that student's check (§17), so the order of blocks in a period can't break it.
- **The hook** lives on the teacher's chain hooks page. It has no student surface.
- **Mixed length is already a class setting** ("Items per session", default `mixed_items_per_session`). Nothing relates it to a period's length, though a 60-minute shape wants about twice a 50-minute one.
- **Period shapes are not machine-readable.** They are a table in `authoring-principles.md`. `activity_defaults` has no key for them. Hard-coding them here would be a hand-kept copy.
- **The shell has no room.** Home is in the eager shell, which sits close to its cap. Anything new belongs on a lazy route.

So the gap is small: **the pieces exist, and nothing says which activity is today or joins the pieces in order.** Teacher and student each stitch the period together by hand.

## Decisions

**PA-1 · Build it now, or after a real class?** No authored draft is capped by this, so it would not pass the 2026-10-02 intake rule as a new wish. It stands only because the author ruled it into the queue the same day the rule was made, and nobody has yet run a period with these parts.
- (a) Build the small v1 below now, ready for February.
- (b) Hold until a teacher has run a few periods by hand, then build what they actually missed.
**Recommend (a), if PA-2 is ruled as recommended,** because that v1 is cheap and removable and first classes are the moment it helps most. If PA-2 goes larger, recommend (b). ⚠ The queue's rank is the author's.

**PA-2 · What is "assembly"?**
- (a) A teacher-only plan page.
- (b) The teacher picks today's activity, and students' one practice link becomes a short ordered list for today.
- (c) A lesson player: the teacher advances the class block by block, with timers.
**Recommend (b).** (a) leaves students stitching by hand. (c) needs realtime, which is stubbed, and it schedules the room, which §18 refuses.

**PA-3 · How is today's activity chosen?** A "Use today" control on the class's activity list. It is never set automatically, and there are no future dates, so there is no calendar to maintain or fall behind. It lapses at the end of the class's day (0063's class timezone). A double period picks up to two. **Recommend this.** A suggestion ("next in the chain") is allowed by §18 and can follow; v1 has none.

**PA-4 · Storage.** One nullable column, `class_activities.today_on date`, set and cleared by one teacher RPC guarded by `is_class_teacher`. No new table and no history. It references no person, so the compliance pack shouldn't change; the build confirms that against `data-map-coverage`. **Recommend this.** YAGNI on a `class_periods` table until a kind other than an activity period needs one (PA-9).

**PA-5 · What a student sees.** On `/practice/CODE`, when anything is picked or practice is on: "Today" with up to three rows in the shape's order: Number facts · the activity · Practice. Each row is a link with its minutes and a done mark. Nothing picked: the page behaves exactly as today. **Recommend this.**

**PA-6 · Order is a suggestion, never a gate.** Any row opens at any time. A student who arrives late goes straight to the activity. Nothing is locked or counted against them. **Recommend this,** because the teacher runs the room and §18 forbids scheduling.

**PA-7 · Way back to the list.** The activity is a separate route with no idea it was reached from Today, so it needs a return link after its check, and the done screen gains the next row. The viewer stays unaware of periods: the link is passed in, and the viewer bundle doesn't change. **Recommend this.** ⚠ Check the student shell at build; the student reaches this through a lazy route, but the viewer's return link must not add eager weight.

**PA-8 · The teacher's view.** A "Today" panel at the top of the class's Practice page: the shape as a line ("Number facts 5 · Hook · 3.2 Unit rates · Practice"), a link to the hook page, and the pick control. No student names, so it is safe on a projector. **Recommend this.** It sits above "Who to see first", which stays closed by default.

**PA-9 · Other period kinds.** A review period (mixed practice run longer and further back, the best-supported kind, `review_share_of_periods` 0.2), corrective, assessment, transfer and buffer are all out of v1.
- Review is close to free: the same scheduler with two parameters. **Recommend it as the next slice, with its own short pass,** since a class in February will want one by about the fifth period.
- The rest keep their TODOS triggers.

**PA-10 · Period length.** Options:
- (a) Store a per-class length, derive items per session.
- (b) Keep "Items per session" as it is, and add one helper line beside it.
**Recommend (b) for v1.** The teacher already has the control. (a) needs their shape table as a graph key and a rule for the double period. Ask for the key anyway (PA-12), so (a) can follow without a copy here.

**PA-11 · No clock.** No countdown or per-block timer on any screen. Minutes are shown only as "about 5 min". **Recommend this,** matching "no clock" on the snapshot and the sprint.

**PA-12 · A letter to the curriculum side, after these rulings.** Three points:
1. Does the v1 read §17 correctly, especially the order, and "Practice" as the last row?
2. Would they add the shapes as a graph key (`activity_defaults.period_shapes`)?
3. Should the sprint-off rule change anything on screen, given that (b) in PA-10 leaves the minutes to the teacher?

Nothing about the file format changes, so no pin bump. **Recommend sending it before the build.**

## C-180: the curriculum side's view (2026-11-04), with recommendations updated

Their author has seen it; the rulings stay with this side's author. Their quotes check: our reading of §17, §18 and D43 was accurate.

| PA | Their view | Recommendation now |
|---|---|---|
| 1, 2 | (a) and (b): this is "runs premade", no need to wait for banks | Unchanged |
| 3, 5, 6 | Keep the order; add a non-link "your teacher's question" row for the hook; up to six rows on a double, one hook only | **Accept.** Stays lazy-route only |
| 4 | A dated row per period (kind and activity), not a column; a future date is fine under §18 | **Accept the table,** `kind` allowing only `activity` until review ships. The first UI still offers today only; future dates when a teacher asks |
| 7, 8, 11 | No objection raised | Unchanged |
| 9 | Review before corrective, but with real rules as graph keys: pull forward stalest first, at most two per skill and never adjacent, more discrimination, no step up on pulled-forward items, a pool floor. About 33 items, so first real use is the lead-up to the week 8 Number test | **Accept; withdraw "two parameters" and "about the fifth period".** Keep it next, on its own pass, after their keys |
| 10 | (b), with numbers from the key: 50 min about 6, 55 about 9–10, 60 about 12–13, a double about 8 per block, sprint off about 3 more. They add `activity_defaults.period_shapes` | **Accept.** It needs a mirror through the importer before the helper line can read it. Slice 1 doesn't depend on it |
| 12 | Answered by this letter | Done, apart from the replies below |

Still to settle:
- **A second Practice on a double.** Today's ER-6 fallback decides what a later session the same day serves. Check it on a real pool before promising two blocks.
- **Their ask: a log of sessions that end early, without names.** Not in the recommendations. It's a new record of student activity, even aggregated, so it needs its own compliance read. File with a trigger unless the author wants it now.
- **Coming separately from them:** a skills diagnostic that seeds practice, and a re-teach suggestion. Neither is designed, and neither changes this pass.

## C-182: a correction and two rulings (2026-11-04)

Letter from their main at 828d121. It reports these as Zan's rulings on their side; the author confirmed them on this side on 2026-11-04.

- **PA-1 is not a D43 obligation.** They withdraw C-180's "this is runs premade": that phrase is about content, which ready-made practice already satisfies. PA-1 is weighed on cost and use. They still recommend building v1 now, and so does this side, so the C-180 table's reason for rows 1 and 2 is replaced.
- **Exhausted sessions.** A same-day second session that runs out of due skills may serve not-yet-due skills, stalest first, one item per skill, with no step up. This replaces reading 4 under ER-6 in [mixed-practice.md](mixed-practice.md), and answers "A second Practice on a double" above.
- **Review.** A wrong answer on a pulled-forward item still drops a step. The pool is taught plus seeded skills, with due skills first. This goes to the review pass (PA-9).
- **New key.** `mixed_seconds_per_item` [60, 90] arrives with `period_shapes`, and the helper line uses 90.

**What exhausted sessions cost (read from 0066 and 0070; nothing built):** one migration and a verify script, with no Edge Function or bundle change. It isn't a one-line change, for two reasons:
- `mixed_steps` works out each step from `mixed_attempts` alone, so today an all-right day always steps up. A pulled-forward item needs a stored marker on `mixed_session_items`, set at session start and read by `mixed_steps`. Existing rows default to not pulled forward, which is correct because none exist.
- `mixed_plan` (0070's body) only falls back when nothing at all was picked, so the fill changes too.

Three things the ruling leaves open, each with a recommendation:
1. **Does a right pulled-forward answer move the due date?** As written, `due_on` is the last practice day plus the interval, so a skill due tomorrow would drop out for up to 28 more days, even with no step up. **Recommend it leaves the due date alone;** only a wrong answer changes the schedule.
2. **Top up, or only when nothing is due?** With 2 due skills and 8 items, should the session serve 6 pulled-forward items or end at 2? **Recommend top up, on second and later sessions only,** because a short second block is the case this ruling exists for. The first session of the day stays as it is and can still end early.
3. **Skills already practised today.** **Recommend they stay as the last resort,** after not-yet-due skills, so a student never meets a repeat while something staler is available.

## C-183: the three open questions answered (2026-11-04)

Their main at 828d121. It reports C-182 and these answers as Zan's rulings; the author confirmed them on this side on 2026-11-04.

- **Due date:** a right early answer leaves it alone. Early items change the schedule only when wrong.
- **Top up:** second and later sessions only, up to the session's size, one item per skill. The first session can still end early.
- **Order:** due skills, then not-yet-due skills stalest first, then skills already practised today.
- **Addition, two readings per skill:** the last scheduled practice sets the due date, and changes only on a scheduled item or a wrong early one. The last practice of any kind sets staleness, so a skill pulled forward in session 2 is last resort in session 3.
- **Early-end log:** filed with a trigger. When built, it includes first sessions.

**Their question, can both readings be derived with no new stored date? Yes** (read from 0066, 0067, 0070):
- The due date comes from carrying the step and its anchor day through `mixed_steps`' recursion past a right early day. Staleness is `max(practice_day)` for the key. `mixed_steps` gains a return column, so it is dropped and recreated; `mixed_plan` is its only migration caller.
- The early marker goes on `mixed_session_items` and is copied to `mixed_attempts`, as `kind` and `bank_key` are, so the derivation stays one index read (ER-14). The prune and purge delete both tables together, so nothing changes there.

Found while checking:
1. **Build note:** a skill pulled forward right in session 2 and repeated right in session 3 has one non-early attempt that day, so a plain check would step it up. A day with any early attempt must not step up. A wrong answer still drops one step, once for the day.
2. **A skip on an early item doesn't drop a step (author ruling, 2026-11-04).** A skip counts as a wrong first try everywhere else (DM-10), but here the student wasn't due that skill and the session added it to fill itself. The skip still counts for staleness and stays visible as a skip.

## The rulings (author, 2026-11-04)

Where this differs from the numbered decisions above, this wins.

- **PA-1, PA-2:** build v1 now: the teacher picks today's activity, and students get a short ordered list. Weighed on cost and use, not as a D43 obligation.
- **PA-3:** "Use today", never automatic. As built, the control is in the PA-8 panel, not on the class's activity list, because that list is on Home in the eager shell. It lapses at the end of the class's day. A double picks up to two (raised to six by 0084, author ruling 2026-11-09, from the walkthrough).
- **PA-4:** a dated row per period item (kind and activity), not a column, with `kind` allowing only `activity` until review ships. The first UI offers today only; future dates wait until a teacher asks.
- **PA-5:** the "Today" list on `/practice/CODE`, in shape order: Number facts · a non-link "your teacher's question" row for the hook · the activity · Practice. Up to six rows on a double, with one hook only. Nothing picked: the page behaves as it does now. Lazy route only. As built, an activity row first showed no minutes; since period planner step 6 (2026-11-14) it shows the activity's own `minutes` (0088, PP-5) as "about N min" when set, and nothing when not (never the cap, never "time not set" to a student).
- **PA-6:** order is a suggestion, never a gate. As built, a student on the list doesn't poll for a snapshot opening, the same as a class with practice on; a reload finds it.
- **PA-7:** a return link after the activity's check, passed in, and the next row on the done screen. The viewer stays unaware of periods. As built, the return link is the viewer's top-bar back link, which reads "← Today" whenever the activity was opened from the list, not only after a check.
- **PA-8:** a "Today" panel at the top of the class's Practice page, with no student names.
- **PA-9:** corrective, assessment, transfer and buffer periods keep their triggers. Review is next, on its own pass, after their keys.
- **PA-10:** "Items per session" stays, with a helper line beside it. The helper line needs `period_shapes` and `mixed_seconds_per_item` mirrored through the importer, so it waits for their PR.
  As built (0083): the two keys are optional fields in `practice-registry.json`'s body, both or neither, like `dol_practice_items`. A new registry revision is stamped on new sessions only, and the scheduler doesn't read these keys.
- **PA-11:** no clock.
- **PA-12:** answered by C-180 to C-183.
- **Exhausted sessions (changes the live scheduler):** second and later sessions the same day top up to the session's size, one item per skill: due skills, then not-yet-due skills stalest first, then skills already practised today. A right or skipped early item doesn't change the step or the due date. A wrong one drops a step and sets the due date from that day. Every item counts for staleness. The first session of the day can still end early.
- **Early-end log:** filed with a trigger in TODOS, and it includes first sessions when built.

## The slices

1. **Exhausted sessions:** a migration, a verify script and the [mixed-practice.md](mixed-practice.md) readings. Independent of the rest, and live as soon as it's applied.
2. **Data and teacher:** the table, the RPC, its verify script, the pick control, the Today panel. Migration first, then push (OV-7).
3. **Student:** the Today list, return links, done-screen next row, measured against the shell budget.
4. **Helper line (PA-10):** after their `period_shapes` PR is merged and mirrored.
5. **Next, on its own pass:** the review period (PA-9).

Each slice gets a Fable review before it counts as done (author ruling, 2026-11-02).

## Not checked yet

- How the Today list reads on a real phone, or with a class that has only some blocks on.
- Whether a teacher finds "Use today" without being told. That's for the design review on the built screens.
- The exact room left in the shell, which is measured at build.
