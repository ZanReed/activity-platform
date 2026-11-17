# Skills diagnostic, with seeding — design pass

**Status:** DRAFT 2026-11-15, Fable-reviewed the same day. All three major
findings are folded into SD-5, SD-6, SD-7 and SD-11, marked "review
correction" or "review finding". Decisions SD-1 to SD-12 are OPEN for the
author. **C-194 answered 2026-11-17: §0 supersedes §3–§4 where they differ.**
Nothing is built. Its place in the queue is TODOS → "BUILD ORDER", item 6, the
author's 2026-11-05 ruling: form grading, then this, then the re-teach
suggestion. Each gets its own pass, with rulings before code.

**The curriculum side's letters (asked for in B-242) have not arrived.** Their
own tracker (`proposals/overhaul-decision-items.md` on their main at `5ab5372`)
lists the item as "not sent, for Zan's go". So this pass works from what is
already ruled on their side and puts its asks in one letter (§7). Form grading
was done the same way.

## 0. After C-194 (2026-11-17) — read this first

B-254 was sent 2026-11-15 (§7). C-194 answered on 2026-11-17. **Where this
section and §3–§4 disagree, this section wins.** §3–§4 are kept as the record
of what was proposed.

### What C-194 changes

1. **A gap is NOT seeded.** C-194 reports this as Zan's ruling of 2026-11-17,
   and it **still needs the author's confirmation on this side** (R-1).
   - A gap means the student needs that skill's **Developing-tier lesson**. For
     Term 1 2027 those are the Y7 chains 702–706, because D55 puts Y9 Number
     first.
   - The teacher assigns the lesson. The platform may suggest it, never assign
     it (D49).
   - When the student checks the lesson, the skill enters their pool by the
     normal C-145 route.
   - Their reason: D47, "spacing needs initial learning first". A never-learned
     skill seeded into practice just loops.
   - A gap with no drafted lesson behind it shows on the grid and isn't seeded.
     Today none of 702–708's activities is drafted.
   - This amends §17. They land the wording change and its decision-log entry
     on their side.
2. **A secure skill IS seeded,** next due in 7 days. That is SD-6 (b), now
   required, not optional. It includes the `mixed_steps` first-case rewrite the
   review found (SD-6 note). Their reason: it is the only way a student who
   skips the Developing lessons ever gets spaced practice on those skills.
3. **`diagnostic_skills`: yes.** One list per chain, in the graph and mirrored
   in a registry.
   - It holds the unit's Developing-tier skills plus the chain's direct
     prerequisites outside itself, `ext.*` included. It goes one level deep.
   - Left out: skills taught earlier in the same school year, and `ext` ids the
     facts check already reads (`ext.arith.times-tables`).
   - Order: never before a skill's own prerequisites. Then, among skills that
     don't depend on each other, the one the coming chain uses first goes
     first.
   - **Term 1 2027 reads 19 skills.**
     - *Number:* the twelve 702–706 skills plus `ext.arith.whole-ops`.
     - *Algebra (next term):* `like-terms`, `notation.write`,
       `equations.two-step` and `formulae.rearrange`, plus `ext.arith.signed`
       and `ext.arith.fractions`.
4. **Items: 1 per skill,** as blanks rather than mc so a guess can't pass, with
   2–3 blanks where that's natural.
   - Gap = not every blank right.
   - Tiers D and C. Untagged templates are served (D66 item 3).
   - Both the item count and the tiers are graph keys.
   - At 1 item, 19 skills is about 19–29 minutes, which needs its own sitting
     (D43 item 24).
5. **Priority:** a skill taught that day wins over a seeded secure skill. Its
   first interval is 1 day.
6. **Banks by mid-January: NO, and plan no date** (D55 amendment item 4: no
   bank work before the HoD meeting). The trigger stays "their first
   prerequisite bank PR". **Knock-on:** the seeded half of the review-period
   pool (C-180) will be thin for the week 8 Number test.
7. **Their two asks back to us:**
   - (a) Skip a listed skill already in the student's pool. **RULED YES by
     the author here, 2026-11-17.**
   - (b) Can a bank hang on an `ext.*` id? (Answer under SD-2′ below.)
8. **Their scope ask: design the re-teach suggestion in THIS pass.**
   - For a gap: suggest the Developing lesson per student. When many students
     have the gap, also suggest it for the whole class, at a teacher-adjustable
     threshold key.
   - For a seeded secure skill wrong on its first two practice tries: probably
     a false secure. Pause it and suggest the same lesson. The two is a key.
   - D73 catch-up videos sit beside the lesson.
   - This **reverses the author's 2026-11-05 ruling** that each arc gets its
     own pass, so it is R-2, and his call.

### Checked here after C-194

- **Assigning to one student or a group does not exist.** `class_activities`
  is per class (0030:52-58), with the primary key `(class_id, activity_id)`.
  The 0001 `assignments` table has never been written, and 0087 deliberately
  didn't revive it (0087:7-8). "The teacher assigns the Developing lesson to
  one student or a group" therefore needs a new way for a class to hold an
  activity for some students only (R-3).
- **An `ext.*` bank works on our side, with one importer change.**
  - `practice_item.skill_id` is plain text (0058).
  - The seed row carries its bank owner, so nothing has to join through an
    activity (SD-5's owner rule).
  - The importer only WARNS on a bank `skill:` that isn't in the skill
    registry (`batch-import.mjs`, the `is not in` warning). Under `--strict`
    that warning fails the import, so it should accept the external-prereq
    registry's ids for banks.
  - The teacher's label comes from the external-prereq registry, which is
    already mirrored.
  - Which chain folder holds an ext bank is their call (the Y7 entry bank,
    D43 item 8).

### The open decisions now

| # | Decision | Recommendation |
|---|---|---|
| **R-1** | Confirm C-194's reported ruling: a gap → suggest the Developing lesson, not seeded; a secure skill → seeded, next due in 7 days; a gap with no lesson shows on the grid only | **Confirm.** It is the facts check's wrong-vs-slow split applied to skills, and it stops never-learned skills looping in practice |
| **R-2** | Design the re-teach suggestion in this pass (their ask), reversing "each in its own pass" | **Yes, but only the two suggestions and where they show.** Most of re-teach now IS this check's output, and per-student assigning (R-3) is shared by both. Correctives written per misconception (D49) stay in their own pass |
| **R-3** | How a teacher gives a Developing lesson to some students only | **(a) A per-student list on the class's activity row:** `class_activity_students(class_id, activity_id, student_id)`. No rows = the whole class, as today; rows = only those students see it. One way a class holds an activity, so 0087's "no second way" stands. (b) Revive `assignments` (0001): rejected by 0087's own reasoning. (c) No assigning: the student sees "Suggested for you" on their own page, unprompted. That breaks D49, so no |
| **SD-1′** | When to build | **Unchanged: build at their first prerequisite bank PR.** The gap half also needs a drafted Developing lesson before it does anything |
| **SD-2′** | Their skill list; `ext.*` banks | **Accept their list rules.** `ext.*` banks: yes, after the importer change above (in slice 1) |
| **SD-4′** | 1 item per skill as blanks; gap = any blank wrong; tiers D/C; all as keys | **Accept.** A false secure is seeded and caught by practice (R-2's pause rule); a false gap only reaches the teacher as a suggestion |
| **SD-5′** | How a secure seed enters, now that gaps don't | It enters as a stepped skill: step 2, anchored on the seed day, due 7 days later, through the `mixed_steps` first-case rewrite. **Stagger the first due dates** across days 7–13 in list order, so 19 seeds don't all fall due on one day and crowd out real due skills. Tier 1 (just taught) already goes first, which matches their priority answer |
| **SD-5′b** | Seeds and discrimination banks | **Seeds don't count toward discrimination eligibility.** Discrimination stays gated on D71's consolidation check (0081:122-128) |
| **SD-6′** | Maintenance seeding | **Settled by R-1** (it is the secure half) |
| **SD-8′** | What the teacher sees | The grid (gap / secure / not reached). Each gap names its Developing lesson, or says "no lesson yet". **"Give this lesson to N students"** opens R-3's picker with them ticked. A whole-class suggestion appears when the gap share passes the key. The untick-before-close control is **dropped**: nothing a gap does is automatic any more |
| **R-4** | Where the "probably a false secure" suggestion shows | **On the class grid, and in "Who to see first" while a block runs** (the D68 list is live only then). The paused skill stays out of the student's sessions until the lesson is checked |
| SD-3, SD-7, SD-9, SD-10, SD-11, SD-12 | As in §4 | Unchanged. SD-11 still asks you whether this needs its own counsel question |

## 1. What is already ruled (curriculum side, quoted from their main)

- **§17:** a class diagnostic runs at the start of each term. It covers the
  facts up to this year, **plus the ancestors of the chains starting this term
  and next.** "Diagnostic gaps in prerequisites seed the mixed-practice queue
  from day one."
- **§17, late joiners:** a late-joiner diagnostic runs on enrolment. It covers
  the facts, the skills the class has already been taught, and the upcoming
  ancestors.
- **D43 item 5:** the skill half uses **bank items, not catalogue activities.**
  The §17 banks serve both the diagnostic and mixed practice.
- **D43 item 8:** the Y7 entry bank is Phase 2 facts plus "a small set of skill
  items on the Y7 external prereqs (the `ext.*` ids)".
- **D43 item 24:** the facts half and the skills half may run in separate
  sittings.
- **D49 / D74 ruling 8:** "The diagnostic stays a reading." It is not
  reportable.
- **`year_plan.assessment_per_term = {diagnostic: 1}`**, and the teacher places
  periods. The platform may suggest, but never schedules.
- **Held by Zan on 2026-11-04, to be ruled here: maintenance seeding.** Should
  the skills a student got right also enter their pool, at a higher step? §17
  seeds gaps only. (SD-6)

## 2. What is shipped (read from this repo; citations are file:line)

- **There is one way into a student's mixed-practice pool:** that student
  checks the activity whose `primary_skill` is the skill. A second route checks
  a consolidation (D71). Both live in `mixed_taught`
  (0066_mixed_practice.sql:470-501). A skill enters the plan the practice day
  after that check (0066:577). There is no seed, no manual add and no "mark as
  taught". The "mark as taught" entry in TODOS.md:511 is filed with a trigger.
- **Steps are never stored.** `mixed_steps` derives them from `mixed_attempts`
  (0081:33-41); the intervals are `mixed_step_intervals` [1, 3, 7, 14, 28]. So
  a seeded skill needs either a stored starting step or a synthetic history.
  SD-5 picks between them.
- **The pool also needs a ratified bank item from the source activity's
  owner** (0066:579-587).
- **Live banks today: chain 1 only.**
  - `rate.unit-rate`: 6 items
  - `rate.constant-of-proportionality`: 6 items
  - `rate.proportional-graph`: 7 items
  - discrimination: 3 items

  (live `practice_item` read 2026-11-15, not retired.) **None of the skills a
  diagnostic would test has a bank.** Chain 1's own prerequisites are
  `number.fractions.to-decimal`, `coord.four-quadrant` and
  `ext.arith.fractions`. The school's first unit (D55: Y9 Algebra, chains
  904/905) needs `ext.arith.signed`, `number.fractions.equivalent`,
  `algebra.expressions.like-terms` and similar. None of them has a bank.
- **No prerequisite edges are mirrored here.** The skill registry brings only
  labels (`skill_label`, 0068:39) and part counts (`skill_part_count`,
  0070:46). External prereqs are labels only. Nothing on this side can compute
  "ancestors of the chains starting this term".
- **There are no terms in the database.** The only calendar field is
  `classes.school_year_ends_on` (0048:57), and classes have no year level.
  What a class will teach shows up only as:
  - `class_activities` (with `due_on`);
  - future-dated `class_period_items` (0082/0088);
  - `source_path` order.
- **The facts half is LIVE as a model to copy.** It is `class_probes`
  (0045:63):
  - one open probe per class, opened by hand from `FactsTeacher.tsx`;
  - a 7-day window;
  - a snapshot taken at close;
  - students enter by code (`/facts/:code`);
  - per-family results for the teacher: Fluent / Slow / Needs strategy / Not
    met / Not judged.

  Its late-joiner probe is DEFERRED with a trigger (TODOS.md:3822).
- **Bank items can already be served outside a mixed session.** DoL targeted
  practice (`start_dol_practice`, 0072/0077) serves a skill's templates and
  grades them through `practice-handler.ts`. The diagnostic's serving and
  grading path is a third mode of the same handler, not a new engine.
- **Joining a class has no hook** (`join_class`, 0033:387). A "diagnostic on
  enrolment" needs a trigger to be designed; nothing exists to reuse.

**What this means.** For a Y9 class at this school, every Y7/Y8 prerequisite is
a skill the class never "taught here". By C-145's rule it can therefore NEVER
enter a pool through checks. **The diagnostic is the only way prerequisite gaps
reach mixed practice at all.** That is why it matters, and why it can't do
anything until the prerequisite skills have banks.

## 3. The shape proposed

A teacher opens a **start-of-term skills check** for a class from the same
practice page as the facts check:

1. The teacher picks the chains that start this term and next. The page
   suggests the ones in the class's plan.
2. The platform lists those chains' prerequisite skills (from a curriculum
   registry, SD-2) that have a ratified bank.
3. Each student sits a short, seeded set of bank items on those skills. Every
   student gets different numbers, from the same per-student hash as practice.
   The set is ungraded and has no feedback per item.
4. The check closes, by hand or after 7 days, like the facts check. Each
   student's result for each skill is **gap**, **secure** or **not reached**.
5. Gaps enter that student's mixed-practice pool from the next practice day, at
   step 0. If SD-6 is yes, secure skills enter at a higher step.
6. The teacher sees a skills × students grid and the gap count per skill.

## 4. Decisions for the author

Each has a recommendation. The ones marked **(joint)** need the curriculum
side's answer before the ruling is final.

**SD-1. When to build.** Nothing can be served until prerequisite skills have
banks, and today none do.
- (a) Rule the design now, send the letter, and build when the first
  prerequisite bank is ratified. That is the intake rule: a wish waits for its
  trigger.
- (b) Build now and test on chain 1 by pretending its skills are prerequisites,
  as mixed practice did.

**Recommend (a).** Under (b), the test proves the plumbing against data that can
never occur. The real first use is the start of Term 1 2027, early February,
with 904/905 prerequisites, which needs their banks by about mid-January. **The
build trigger:** their first prerequisite bank PR.

**SD-2. Which skills it covers (joint).** The platform has no prerequisite
edges and no terms.
- (a) Mirror the graph's prerequisite edges and compute ancestors here.
- (b) The curriculum side generates a **per-chain diagnostic list**,
  `diagnostic_skills`. This is the chain's prerequisites outside itself, chosen
  by them: how deep to go, which `ext.*` ids to include, and which skills are
  not worth a reading. It would be mirrored like the other registries.

**Recommend (b).** "How far back" is a curriculum judgement (D25: what we
compute from lives in their graph), and a list costs one registry key rather
than an edge table and a graph algorithm here. **The ask:** a key on each chain
in the skill or practice registry.

**SD-3. How the teacher says what's starting.**
- The teacher ticks chains, or a unit.
- The page pre-ticks every chain that has an activity on the class's plan or
  assignments, among those the class hasn't checked yet.
- There are no stored terms. The check is dated when it opens, so "this term"
  is simply "this check".

**Recommend yes.** This adds no term model, and it fits "the teacher places the
periods".

**SD-4. Items per skill and the gap rule (joint).**
- **Proposed:** 2 items per skill, each from a different template where the
  bank has two.
- **Gap** = fewer than 2 right. **Secure** = both right. **Not reached** = the
  student didn't answer both.
- Drawn from the lower tiers (D/C) where the bank is tiered (the D66 tier tag,
  "read now, use later").
- **Cost:** at 60–90 s an item, 8 skills is about 16 items, or 16–24 minutes.
  That fits D43 item 24's separate sitting, but not inside a normal period.
  Two items per skill reads noisily. One item would be quicker, and a wrong
  answer would still be worth a few spaced repetitions.

**Recommend:** make `diagnostic_items_per_skill` and the tier filter graph keys,
default 2 and D/C, with their reasoning in the letter.

**SD-5. How a gap enters the pool.**
- (a) A stored seed row per student per skill (`diagnostic_seeds`: the skill,
  the day, the bank owner and an order key). **`mixed_taught` reads it as a
  third source of "taught"**, the same way it reads a check. Nothing else
  changes in `mixed_steps` or `mixed_plan`.
- (b) Write synthetic `mixed_attempts`.

**Recommend (a).** Under (b), practice scores and "Getting stuck on" would read
diagnostic answers as practice. The seed is the reading itself, not an
attempt.
- **A gap enters as a NEW skill (no step), not at step 0.** That puts it in
  `mixed_plan`'s first tier, and the new-skill cap applies:
  `mixed_new_skills_per_session` (2) per session (0081:132-155), so 8 gaps
  can't swamp a session. *Review correction:* the draft said "step 0". A
  stored step would land in tier 2, which has no cap, and tier 2 also needs a
  past practice (`last_any`). A seed has none, so it would never be served.
- **Order.** Seeds go in the registry's list order (deepest first, SD-2),
  carried as an order key that sorts against `chain_order`. On days a skill was
  just taught, that skill goes first (tier 1's existing rule). So in a week
  with daily lessons, seeds trickle in. **Joint question:** is that the right
  priority, or should a gap outrank the lesson just taught?
- **Bank owner.** The pool joins bank items on the owner
  (`p.owner_id = t.owner_id`, 0081:104-106). For a seed, the owner is the
  **source owner of the ticked chains' activities** (through
  `copied_from_activity_id`, as `mixed_taught` already resolves it), stored on
  the seed row. `practice_item` is owner-read-only (0058:84-90), so the
  teacher's page lists "skills with a bank" through a new definer RPC
  (slice 2).
- **Side effects of counting as taught. Each needs your yes:**
  - A discrimination bank whose skills are all seeded or taught becomes
    eligible without its consolidation being checked (0081:122-128).
    Recommend: no. Discrimination stays gated on D71's consolidation check, so
    seeds are excluded from that test.
  - The unit tracker (0074:191) would show a seeded prerequisite as
    "learning". Recommend: fine. The tracker lists the unit's own skills, and
    prerequisites aren't in it.

**SD-6. Maintenance seeding (yours, held 2026-11-04).**
- (a) Gaps only, as §17 says.
- (b) Secure skills enter too, at step 2 (next due in 7 days).

**Not as cheap as the draft said (review finding):** `mixed_steps` derives
every step from attempts, and its first case ignores any starting step
(0081:59-63). A "secure at step 2" seed needs a designed first case: the
seed's day as anchor, step 2 as the start, and the seed's day standing in for
the last practice. Without it, the first right answer resets the skill to
step 1. That is one more function rewrite in slice 2, plus its verify rows.

**Recommend (b).** Under (a), a strong student's pool at the start of a Y9 year
is empty until their first check. Their mixed block then has nothing to serve
except the exhausted-session top-ups, and their earlier-year skills are never
revisited, because those were never "taught here". Under (b), the spacing they
get is light, and it is the only spacing those skills will ever get. **Cost:**
bigger pools, so more items compete for 6 slots. It's a ruling on your side;
their tracker says so.

**SD-7. What the student sees.**
- No right/wrong per item and no score.
- The intro says "This shows your teacher what to practise. It isn't marked."
- The done screen says "Done — your practice will start from this."
- Solutions aren't shown, because the items reappear in practice, where
  solutions are shown.
- Entry is by code, like the facts check.

**Recommend yes.** This is "the diagnostic is a reading" made literal.

**The server must enforce it, not only the screen (review finding).** Today's
practice path returns verdicts, solutions and answers on every recorded try,
and again on resume and replay (`practice-handler.ts:396-408, 644-656`). The
diagnostic mode returns **only "recorded"** on every path, including replay
and resume. This is guarded by a wire test using the shared answer-key secret
fixture, mutation-tested once by returning verdicts and watching it go red.
Otherwise a student could read the answers to templates that come back in
practice.

**SD-8. What the teacher sees.**
- A skills × students grid (gap / secure / not reached).
- A per-skill gap count, and students not started.
- It lives on the practice page beside the facts results.
- **Seeding happens at close, automatically.** §17 says gaps seed "from day
  one", and the teacher already decides whether mixed practice is on.
- A teacher can untick a skill before close, for one they plan to teach anyway,
  so it isn't seeded.

**Recommend yes.**

**SD-9. Sittings and lifecycle.**
- It copies `class_probes`: one open check per class, a 7-day window, close by
  hand or at the deadline, a snapshot at close, never reopened.
- It is separate from the facts check (item 24). One page, two "Start" buttons.

**Recommend yes.**

**SD-10. Late joiners.**
- **Not in v1:** a student who joins after close gets no skills check. There is
  no enrolment hook, and the facts half's late-joiner probe is already deferred
  with a trigger.
- **The data model is per student per sitting,** so a single-student check
  later adds no reshaping.
- **Trigger:** a student joins a class after its check closed, the same as the
  facts trigger. Both get built together.

**Recommend yes.**

**SD-11. Retention and compliance.** The new rows are student-derived: the
sittings, the answers and the seeds.
- Same window as mixed practice: school year + 30 days, with a 400-day
  backstop.
- A prune is built **disarmed**. It is a fifth student-work prune, so CLAUDE.md
  gets a "don't arm" bullet.
- The data map and retention policy are updated in the migration's commit.
- **The seed rows are NOT pruned with the sittings.** *Review correction:*
  pool membership comes from `mixed_taught`, so pruning a seed removes the
  skill from the student's pool. The seeds therefore live as long as the mixed
  pool they feed (school year + 30 days). Only the answers and the sitting
  rows prune earlier, if at all.
- **The prune has its own arming checklist in TODOS and a
  `prune_is_unscheduled` verify row,** like 0048/0066/0080.

**Recommend yes. One point is yours to rule outright:** does counsel's
2026-10-06 answer ("current measures are sufficient", Q1–Q11) cover a new
store of student answers? Or does this need its own counsel question, as the
two earlier prunes got Q10 and Q11(b)? We recommend asking. It is cheap, and
every earlier prune had one.

**SD-12. GUI rule.** There is no new fence or authoring capability, so no
`guiSurfaces` row. The teacher can open, close, untick and read. Bank items are
curriculum-owned and exempt from editing, and already viewable in the Bank
preview.

**Recommend:** confirm no row is needed.

## 5. Not in scope

- The re-teach suggestion (its own pass, next).
- Late joiners (SD-10).
- Any score or report.
- A term model.
- Carrying a reading across years.
- Suggesting when to place the diagnostic period (D49 allows a suggestion; file
  it with a trigger).

## 6. Build slices (if SD-1 is (a), these wait for the trigger)

1. Importer: mirror `diagnostic_skills` (and the SD-4 keys). The migration is
   applied live before the importer push.
2. Migration: sittings, items, answers, seeds; open/close/snapshot RPCs;
   `mixed_taught` and `mixed_steps` read the seeds; prune disarmed; verify
   script; compliance pack.
3. check-activity mode `diagnostic-start` / `diagnostic`: bundle, deploy and
   hash-verify.
4. Student sitting screens.
5. Teacher open, grid and untick screens.

## 7. The letter (B-254, SENT 2026-11-15; answered by C-194, §0)

> B-254 · Skills diagnostic with seeding: our design pass, unbuilt.
>
> Your B-242 letters haven't arrived, so we've designed from §17, D43 items
> 5/8/24 and D49. It's in docs/design/skills-diagnostic.md. Asks:
>
> 1. **A `diagnostic_skills` list per chain** in a registry: the prerequisites
>    you want read before that chain starts, `ext.*` included, in the order to
>    seed them. We won't compute ancestors here.
> 2. **Keys:** `diagnostic_items_per_skill` (we propose 2) and which bank tiers
>    the diagnostic draws from (we propose D and C). Is gap = "fewer than all
>    right" what you'd want?
> 3. **Banks for the prerequisites** of the first chains to be taught (for the
>    school: 904/905), in time for early February. Today only chain 1's three
>    skills have banks, so the diagnostic has nothing to serve. We'll build
>    when your first prerequisite bank PR opens.
> 4. **Maintenance seeding** is Zan's ruling here (SD-6). We'll tell you which
>    way it went.
