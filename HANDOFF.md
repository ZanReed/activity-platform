# Handoff — 2026-08-25

Paste the block below `PASTE FROM HERE` into a new chat. Everything above it is
context for a human deciding whether the handoff is accurate.

---

## What happened in the session that wrote this

**The misconception sensor shipped end to end and is LIVE.** A distractor can
now name the misconception it senses, in markdown, and that id survives import
→ serialize → grading → the stored check verdict. Both Edge Functions are
deployed and code-verified. The same arc deleted the last three orphan knobs.

**It went through two reviews, and both outside voices were right.** Nine
cross-model tensions were raised across `/plan-eng-review` and
`/plan-devex-review`; the author accepted all nine. The eng review's outside
voice found that the ratified storage premise was **false against the
retention design** — misconception ids live on non-latest attempts, exactly
the rows `prune_section_checks` deletes. That became a blocking step on the
arming checklist.

**Then the build falsified one of the reviews.** X3 split the graph nudge text
out partly on a bundle-cost argument; measuring it both ways showed the split
saved **10.5 KiB, not 108** — the ~98 KiB is the formula parser, which the id
feature needs anyway. The split still stands on its UX ground. Recorded,
because "a claim with a number attached is still a claim."

**The most useful thing built was a test.** Three seam tests passed while the
chain was broken end to end: importer, serializer and grader were each correct
and an authored binding still reached no student. The cross-package
`misconceptionEndToEnd.test.ts` caught it, then caught a second instance
minutes later.

## What the next session should know before trusting anything here

- **`HANDOFF.md` is REPLACED, not appended** — like STATE. It is a transient
  baton, not a durable doc, and it is not in CLAUDE.md's doc map.
- Everything is **pushed**; confirm CI green before building on it
  (`gh run list`).
- The catalogue still has **3 files and zero bindings**. Nothing about the
  sensor has been exercised by real content.

---

# PASTE FROM HERE

I'm picking up the activity-platform repo cold. Read CLAUDE.md, then STATE.md,
then TODOS.md.

## Where things stand (2026-08-25, pushed)

The misconception-sensors arc SHIPPED and is live: authored `:: mis.*`
bindings on blanks / MC choices / graph `mistake:` lines reach the stored
check verdict. Both functions deployed and CODE-verified. Design doc +
both review passes + as-built corrections:
`docs/design/misconception-sensors.md`.

```
{{12 | !21 :: digits reversed :: mis.place-value.digit-reversal}}
( ) $4 per kg :: mis.roc.uses-endpoint-value
mistake: y = x + 2 :: The coefficient is the slope. :: mis.slope.reads-intercept
```

`pnpm verify` = 8/8. Script guards 130. All orphan classes are closed.

## The ordering — RULED vs my reading

RULED BY THE AUTHOR (still standing from 2026-08-24):

1. **Writing activities comes before more code.** ~150 markdown files planned
   in `~/activity-catalogue-pilot/`, still **3**, and **none carries a
   binding**. The sensor, the manifest, the registry check and the
   dead-binding detector are all built and all unexercised by real content.
   The single highest-value next action is authoring — and the first binding
   written is also the first real test of the tooling.
2. **Do NOT harden constraints out of STATE yet.** It sits over its word
   budget deliberately; the cut is by PROMOTION when the bug tail closes.

HARD DEPENDENCIES (facts, not preferences):

3. 🚫 **The check-prune CANNOT be armed until misconceptions roll up.** Ids
   live on NON-latest attempts — precisely what `prune_section_checks`
   deletes — and no rollup table has a misconception dimension. The amendment
   naming the four open design questions is
   `docs/design/check-retention-and-rollup.md` §II.6; the blocking step is on
   the ARMING checklist in TODOS. Also still gated on counsel Q10.
4. **The UNITS slice's syntax is UNPINNED, and its old spelling was
   unimplementable.** Three code-verified tokenizer collisions killed it —
   worst: `unit: km/h|kph` would make the literal string "kph" an ACCEPTED
   ANSWER, because the blank grammar splits on `|` before any unit parsing.
   Read X2 in the design doc before designing; do not re-derive.
5. **The graph nudge TEXT is a separate slice with its own UX pass.** It is
   first-ever student-visible feedback on graph blocks and would default ON
   for every published graph activity.

MY READING (not ruled):

6. The offline misconception match-rate query (T6) is worth writing early, as
   the first real consumer of the stored ids — but it depends on attempt rows,
   so it is bound by the same prune ordering as #3.

## Traps that cost this session real time

- **A seam test cannot see a gap between two correct halves.** Three passing
  unit tests, one broken chain. Write the end-to-end walk FIRST for anything
  that crosses packages.
- **Mutation-test the guard, and pick a mutation that can actually be
  observed.** One mutation here "passed" because an `isFinite` check downstream
  masked it — the guard was fine, the mutation was badly chosen. If a mutation
  does not go red, ask whether it changes behaviour at all before trusting the
  test.
- **A review's confident number can be wrong.** Measure before acting on it.
- **`get_edge_function` CANNOT read `check-activity`** (2.6 MB; 3/3 errors).
  Download + `shasum` instead — byte-identical is a stronger proof than any
  marker grep. The method is in CLAUDE.md's deploy-verification rule.
- **The docs race the shipping and the docs lose.** The closing drift audit
  found 6 findings and 5 were self-created hours earlier — a status line
  saying PLAN on shipped code, STATE's "current focus" still on the previous
  arc, and three entries describing just-fixed things in the present tense.

## House rules that bite hardest here

- Never `git push` — the author pushes. Check `git branch --show-current` is
  `main` before committing.
- `pnpm verify` is the definition of done for CI's check job.
- A schema change means both bundles regenerate in the SAME commit, and a
  redeploy is owed.
- STATE.md is measured in WORDS (~1,500 target, 4,000 ceiling). Do not raise
  the ceiling to make a commit pass.

## Start here

Say which of 1–6 you're taking and why, before touching anything. If it's (1),
you are authoring, not coding — and the interesting output is the bugs the
corpus finds. Run `pnpm import:batch ~/activity-catalogue-pilot --dry-run`
first: it now prints a binding manifest, and today that manifest is empty.
