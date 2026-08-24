# Handoff — 2026-08-24 (late)

Paste the block below `PASTE FROM HERE` into a new chat. Everything above it is
context for a human deciding whether the handoff is accurate.

---

## What happened in the session that wrote this

**The activity flow modes shipped end to end and are LIVE.** Six knobs that
described how an activity flows for a student, none of which was read by
anything, became: check groups (`{checkpoint}` now covers every section since
the previous one, and the end of the activity is always a checkpoint), a
server-enforced `locked` mode derived from the stored document (migration 0040
+ `check-activity` v20), `activityType` as a printed label, and two knobs
deleted outright.

**Three things were then found broken that nobody had noticed**, none of them
part of the slice:

1. `verify-0033`'s caps assertion had been failing since the self-serve teacher
   door opened on 2026-08-19 — the predicate was wider than its own message.
2. `verify-0036`'s rollup matrix was green only 3.5 hours a day, which made the
   check-prune's **arming evidence invalid**.
3. A CI claim in STATE cited a run id as proof of green; that run had failed.

**Two structural rulings landed** (both the author's): STATE's `~150 lines` rule
became a **~1,500 word budget** with a guard, and **constraints are hardened out
of STATE only after the code they describe stops moving** — which is why STATE
sits deliberately over budget.

**The closing drift audit found 2 findings, both self-created** — including an
orphan field (`implicitEnd`) shipped by the very slice written to end that
defect class.

## What the next session should know before trusting anything here

- **`HANDOFF.md` is REPLACED, not appended** — like STATE. This file is not in
  CLAUDE.md's doc map (checked); it is a transient baton, not a durable doc.
- Everything is **pushed and CI-green**; verify before building on it.
- The ordering below distinguishes **RULED** from **my reading**. Do not treat
  the second kind as settled.

---

# PASTE FROM HERE

I'm picking up the activity-platform repo cold. Read CLAUDE.md, then STATE.md,
then TODOS.md.

## Where things stand (2026-08-24, all pushed, CI green)

The activity flow modes shipped and are LIVE: check groups, the server-enforced
lock (migration 0040 + check-activity v20), two deleted schema knobs
(revisionMode, gradingMode), activityType as a printed label. Live
`verify:auth --target live` = 168/0. `pnpm verify` = 8/8. 104 script guards.

Three unrelated defects were also found and fixed: verify-0033's caps assertion
(over-scoped since the self-serve door opened 2026-08-19), verify-0036's rollup
matrix (green only 3.5 hours a day — it made the check-prune's ARMING EVIDENCE
invalid), and a CI-green claim in STATE that cited a run which had failed.

TODOS has ~51 entries / ~15k words. Do NOT work it top-to-bottom.

## The ordering — RULED vs my reading

RULED BY THE AUTHOR:

1. **Writing activities comes before more code.** ~150 markdown files planned in
   `~/activity-catalogue-pilot/`, currently 3. This is the stated source of the
   next real information and it has been validated twice: authoring a single
   test file surfaced a four-month-old content-loss bug (graph_figure skipped
   every curve), and the corpus keeps finding what the fixture set cannot. Use
   `pnpm import:batch <folder> --owner <email>` (always `--dry-run` first).
   Two capabilities no real activity exercises yet: a blank inside a table cell,
   and a graph_figure.
2. **Do NOT harden constraints out of STATE yet.** STATE sits ~2.4x over its
   word budget deliberately. Reducing it means promoting constraints into
   CLAUDE.md/DECISIONS.md, which are read as SETTLED — hardening one
   mid-bug-fix records the wrong rule where it is hardest to correct. The cut
   waits for the re-architecture's bug tail to close, and is then done by
   PROMOTION, not deletion. (CLAUDE.md → Working style, first bullet.)

HARD DEPENDENCIES (facts, not preferences):

3. **The check-rollup ARMING arc cannot count green nights before 2026-08-24.**
   verify-0036 — the instrument that demonstrates the rollup is trustworthy —
   was green only 00:00–03:30 UTC and red the other 20.5 hours, so a scheduler
   inside that window would have produced N green nights that meant nothing.
   Fixed; counting can begin now. Still also gated on counsel question Q10.
4. **`answerFeedback: 'immediate'` is blocked on a commit seam that does not
   exist.** All eleven input components write to the store per keystroke. This
   is a cross-cutting slice of its own. Three design constraints are already
   settled for it — read the TODOS entry, do not re-derive them.
5. **The teacher unlock (flow modes T3) belongs to the teacher-grading slice**,
   and would be the first teacher-facing write that DESTROYS student work. Read
   `prune_section_checks`' arming discipline before designing it.
6. **The two remaining orphan classes need an AUTHOR RULING first** (wire it or
   delete it), not engineering: the interactive-graph feedback knobs
   (partialCredit / builtinFeedback / graph-level mistakeFeedback) and
   hasConfidenceRating / allowTargetReuse. Confirmed still orphaned 2026-08-24.

~~7. Cheap self-contained items between authoring sessions.~~ **DONE
2026-08-24** — the static-SVG palette (viewer half) and the a11y GAP-2 capture.
Both were re-filed rather than closed; read those two TODOS entries for what
remains, which in both cases is smaller and better specified than before.

## Traps that cost this session real time

- **Mutation-test every guard the day you write it.** The flow-modes slice —
  written specifically to end this repo's declaration-outlives-implementation
  defect class — committed it THREE times in its own new code. Two were caught
  by mutation-testing on the day; one only by the drift audit hours later.
  **"Bound to rendered output" is NOT checkable by reading your own test:** the
  vacuous one DID query the DOM, and the vacuity was in the FIXTURE, one level
  away.
- **A claim with a number attached is still a claim.** STATE cited a CI run id
  as proof of green; that run had failed, and predated the fix by 11 minutes.
  Open the run.
- **A single observation of a time-dependent bug is not its behaviour.** The
  verify-0036 diagnosis was measured, mechanised, confirmed — and wrong,
  because every observation came from the same instant.
- **verify-*.sql carry unstated data-state AND time-state preconditions.**
  "It's just the fixtures" is a hypothesis to TEST, not a category to file a
  red in.
- **Answer the entry's own blocking question by measurement before designing
  around it.** Both item-7 fixes turned on one probe each: does `var()` resolve
  in an SVG presentation attribute (yes), and is tokens.css even loaded by the
  editor (no). Each took a minute and each changed the plan.

## House rules that bite hardest here

- Never `git push` — the author pushes. Check `git branch --show-current` is
  `main` before committing.
- `pnpm verify` is the definition of done for CI's check job; it prints the
  browser lanes it does NOT cover.
- A schema change means both bundles regenerate in the same commit and a
  `get-activity` redeploy is owed.
- STATE.md is measured in WORDS (~1,500 target, 4,000 enforced ceiling via
  `scripts/tests/state-budget.test.mjs`). Do not raise the ceiling to make a
  commit pass — ask where the content belongs.

## Start here

Say which of 1–6 you're taking and why, before touching anything. If it's (1),
you are authoring, not coding — and the interesting output is the bugs the
corpus finds.
