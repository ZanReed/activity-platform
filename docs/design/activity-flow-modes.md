# Activity flow modes — wiring the checkpoint orphan class

**Status:** RULED 2026-08-23 (author, Q1–Q6) — ready for eng review + design review, then build. Filed from TODOS → "S9
left FIVE MORE ORPHAN CLASSES", item 5 (the last content-shaped one).

## Why now

Six authored knobs describe how an activity FLOWS for a student and **not one
is read by the viewer or the server** (verified 2026-08-23: `isCheckpoint` has
zero consumers outside fixtures and serialize tests; `submissionMode`,
`revisionMode`, `gradingMode`, `activityType`, `answerFeedback` appear in zero
files under `packages/viewer/src`). The schema describes all six in the present
tense. The editor's config drawer, the importer's ```meta fence, the
`{checkpoint}` heading marker and the format doc all write them.

The author is about to write ~150 activities and wants the system to carry
every expected feature BEFORE that corpus exists, so it is authored against
real behaviour rather than against fiction. **1 of the 3 pilot files already
uses `{checkpoint}`** (`unit-3/unit-rate.md:20`).

The implementations lived in `packages/renderer`'s runtime
(`runtime/checkpoints.ts`, `runtime/blanks.ts`, `runtime/submission.ts`,
recoverable at `11002cf^`) and died at S9 Drop 4. They are the precedent for
SEMANTICS; they are not portable code, because of the one architectural fact
that shapes everything below.

## The fact that shapes the design: grading moved to the server

The renderer scored **client-side** — answer keys were baked into the
published HTML, so "score this blank on blur" was free and "Submit" was a
POST of already-computed results. The viewer is the opposite by design
(DECISIONS → S4): **answers never reach the client**; every verdict is a
`check-activity` round-trip that writes a `section_checks` row (responses +
verdicts + `attempt_number`), and those rows feed the analytics rollup and
the (disarmed) prune.

Consequences, each of which decides a knob below:

- There is **no "submit"** in the viewer. A check is the only act and the
  only record. "Single submit at the end" can only mean "one check, at the
  end, covering everything".
- "Immediate feedback on blur" means **a server round-trip and a durable row
  per blur**, not a local comparison.
- "Resubmit after final submit" has no referent: without a submit there is
  nothing to re-do except check again, which `submissionMode` already
  governs.

## The rulings (proposed — see Open questions for the ones that are yours)

### R1 — A checkpoint is where checking happens; everything since the last one is checked there

Today: a Check button on every section, each checking only itself.

Proposed: `isCheckpoint` gates the button. A checkpoint section's Check
covers **every section since the previous checkpoint, inclusive** — the
"check group". **The end of the activity is always a checkpoint**, so
trailing sections are never orphaned and a document with no `{checkpoint}`
at all degrades to exactly one Check at the end.

```
  [Warm up]            ← no button
  [Reading a rate table {checkpoint}]
  [Your turn]          ← a heading INSIDE the checkpoint section, not a new one
                       ← Check here covers Warm up + Reading + Your turn
  [Practice]
  [Exit]               ← end of activity = implicit checkpoint: Check covers both
```

Why this rule and not the renderer's: the renderer let non-checkpoint
sections wait for the final Submit. There is no Submit, so without this rule
a non-checkpoint section's questions would **never be checked** — the
free-text in them never recorded, the blanks never graded — silently. That
is the defect class this repo keeps paying for. "Everything since the last
checkpoint" is also what a teacher means when they type `{checkpoint}`: "stop
here and check".

Mechanics: the client fires one `checkSection` per covered section
(P2A's one-atomic-RPC-per-section stands; a group is N of them, sequenced,
with one combined status line). `section_checks` is unchanged. Whether the
server should instead accept a span is an eng-review question, not a
blocker.

### R2 — `submissionMode` collapses to two real behaviours

| value | meaning in the viewer | status |
|---|---|---|
| `free` (default) | checkpoints per R1; a group may be re-checked any number of times | today's behaviour, now scoped to checkpoints |
| `locked` | checkpoints per R1; **inputs in a group freeze the moment its check fires** | NEW — author wants it, "used sparingly" |
| `single` | no mid-activity checkpoints; the end-of-activity Check is the only one | = R1 with every `isCheckpoint` ignored |

`locked` mechanics: freeze at FIRE time, not at response time. The check
snapshots current values when fired (ruling 2.2A) and a queued offline check
will grade exactly that snapshot, so editing after firing was already
pointless; freezing makes that visible. The viewer already has the idiom — a
`<fieldset disabled>` wrapping the worksheet for `readOnly` — so a frozen
group is a per-section disabled fieldset, no per-input threading.

**Freeze only on a check that actually fired (Q5 ruled).** A shortfall — the
existing "N questions couldn't be checked" path — refuses the check and
freezes nothing; a freeze on a partial check would trap the student with no
way to fix what was skipped. After a real freeze the group's Check button is
gone and the status line says "Checked — locked".

**The button says "Check" everywhere (Q4 ruled)** — mid-activity and at the
end. One verb, one meaning; the status line says what was covered. "Finish"
was rejected because it implies a submit that does not exist.

**What `locked` does NOT do:** it does not prevent a student reloading and
seeing their frozen answers (the check is recorded; the freeze is restored
from the store's checked state), and it is not a security boundary — a
student with devtools can un-disable a fieldset. It is a pedagogical
commitment device, and the copy should say so nowhere near the student.

### R3 — `answerFeedback: 'immediate'` is REDEFINED: auto-check on completion (Q1 ruled)

As specified ("each blank turns green/red as the student leaves it") it would
cost a `check-activity` round-trip and a `section_checks` row **per blur** —
twelve durable rows before a student finishes a twelve-blank section,
`attempt_number` in the teens on a first pass, analytics counting blurs as
checks, every row under the prune horizon, and per-blank correctness leaking
through a channel S4 deliberately made section-granular.

**Ruled (Q1): keep the field; `immediate` now means the check group fires its
own Check the moment every item in it has a value.** Still one RPC per
section, still section-granular verdicts, but a self-check experience with no
button to press. The format doc's one-line definition changes to match.

"Has a value" is the existing coverage walk's notion of answered (the same one
the shortfall path uses), not "non-empty string": an MC with nothing selected
is unanswered; a graph with no plotted point is unanswered.

**`immediate` + `locked` (Q6 ruled): auto-check, never auto-freeze.** In
locked mode, completion fires the check and shows verdicts; the freeze waits
for an explicit Check press. Consequence worth stating: between the
auto-check and the press, the group behaves like `free` (editable, re-checkable),
and the explicit press records a second `attempt_number`. That is the
accepted price of not letting a typo in the last blank lock the whole group.

### R4 — `revisionMode` and `gradingMode` are DELETED in this slice (Q2 ruled)

- `revisionMode` has no referent (no submit; re-checking is already
  `submissionMode`'s job). Deferring keeps a knob whose description can never
  become true.
- `gradingMode` is **derived, not authored**: the server already records
  free-text as "Recorded — your teacher will review" and grades everything
  else, purely from block types. `'manual'` on an all-MC activity would be a
  lie; `'auto'` on an essay would be ignored. The teacher-grading slice will
  need per-BLOCK grading metadata (its own design says so); an activity-level
  enum is the wrong grain and would have to be deleted then anyway.

Deleting is a schema change → both server bundles regenerate in the same
commit, a `get-activity` redeploy is owed (pending author action), and the
importer's ```meta fence, the format doc, the AI prompt, and the config
drawer each lose two keys (`revision:`, and there was never a `grading:` key
— confirm with the importFormatRegistry guard). Old drafts that still carry
the fields parse fine: zod `.object()` strips unknown keys, so they vanish on
next save. `SANITIZER_REV` does not move (it hashes block sanitize specs, not
meta) — verify rather than assume.

### R5 — `activityType` becomes a LABEL, printed and on screen (Q3 ruled)

The schema says it "drives presentation: an exit_ticket renders as a
single-page focused layout; a worksheet renders with full section
navigation". The viewer has ONE layout and NO section navigation, so there is
nothing for it to drive. It is not the catalog facet either — that is
`pedagogical_role` (0037), and `pedagogicalRole.ts:9` explicitly says they
are different things.

The author's question — "is this just covered by the modes?" — was the right
one. Flow is covered by R1/R2. **Ruled: `activityType` is rendered as a label**
— "Exit ticket" / "Warm-up" / "Review" beside the title where `course`/`unit`
already render, on screen and on paper (`worksheet`, the default, renders
nothing: it is the unmarked case). The schema comment's "drives presentation
… section navigation" sentence is rewritten to say what it now does. Anything
more is a layout design pass that nothing is asking for.

## What stays untouched

- `section_checks`, `check-activity`, the grading walk, the sanitizer:
  **no schema or server change** for R1/R2. R4 is the only schema change and
  it is a deletion.
- The importer's `{checkpoint}` grammar and the ```meta keys for `submission`
  and `feedback` — they already write the right fields.
- Print: checkpoints are a screen concept; the worksheet prints the same.

## Guards (the part that outlives the slice)

Every one bound to RENDERED OUTPUT or to a real RPC, never to a declaration:

1. **Check buttons exist only where R1 says** — component test over a
   fixture document with `[plain, checkpoint, plain, plain]` sections asserts
   exactly two buttons (the checkpoint, the end), and that the checkpoint's
   click fires `checkSection` for sections 1 AND 2.
2. **`single` hides every mid button** — same fixture, `submissionMode:
   'single'`, one button.
3. **`locked` freezes** — after a fired check, every input in the group is
   inside a disabled fieldset and the button is gone; after a refused check
   (shortfall), nothing is frozen. Mutation-test: remove the freeze, watch it
   go red.
4. **`free` does not freeze** — the regression pin for today's behaviour.
5. **No section is ever un-checkable** — a document walk asserting every
   section id belongs to exactly one check group. This is the guard for the
   silent-loss failure R1 exists to prevent.
6. **a11y** — a frozen group announces its state once; the a11y lane's
   post-check scan already runs, extend it to a locked document.
7. **Schema-field reachability** (P1 family) — after R4, the drift audit's
   sweep should find every remaining `meta` field read somewhere under
   `viewer/src`. This is the slice that makes that guard writable.

## Rulings record (author, 2026-08-23)

| Q | Ruling | Folded into |
|---|---|---|
| Q1 | `immediate` = auto-check when the group is complete | R3 |
| Q2 | delete `revisionMode` + `gradingMode` now | R4 |
| Q3 | `activityType` is a printed + on-screen label | R5 |
| Q4 | the button reads "Check" everywhere | R2 |
| Q5 | `locked` never freezes on a refused check | R2 |
| Q6 | `immediate` + `locked`: auto-check, never auto-freeze | R3 |

Earlier, in conversation: checkpoint semantics are not precious (the three
pilot files exist only to test features); `locked` is wanted "sparingly";
everything the system will support must exist before the ~150-file corpus
is authored, so it is written against real behaviour.

## NOT in scope

- Section NAVIGATION (a per-section sidebar/stepper) — `activityType`'s
  original promise; nothing asks for it.
- Per-blank server checks — R3's reason.
- Teacher grading, released feedback, attempts UI — the parked slice.
- Print changes — none; checkpoints are screen-only by construction.
