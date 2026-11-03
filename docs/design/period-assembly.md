# Period assembly (D43, last item of the 2026-10-02 BUILD ORDER): design pass

**Status:** DESIGN PASS 2026-11-04, nothing ruled and nothing built. The twelve decisions below wait for the author, one by one, with a recommendation on each.
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

## If ruled as recommended: the slices

1. **Data and teacher:** the column, the RPC, its verify script, the pick control, the Today panel. Migration first, then push (OV-7).
2. **Student:** the Today list, return links, done-screen next row, measured against the shell budget.
3. **Next, on its own pass:** the review period (PA-9).

Each slice gets a Fable review before it counts as done (author ruling, 2026-11-02).

## Not checked yet

- How the Today list reads on a real phone, or with a class that has only some blocks on.
- Whether a teacher finds "Use today" without being told. That's for the design review on the built screens.
- The exact room left in the shell, which is measured at build.
