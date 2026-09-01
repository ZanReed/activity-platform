# draggable_curve — the drag-then-type disagreement diagnostic (wishlist #5)

**Status: DESIGN PASS, awaiting outside-voice review, then the author's yes/no
per decision** (drafted 2026-09-01). Verified against the shipped graph
architecture, not the design docs alone.

**What the builder asked for**: ~11 transformation-band activities where the
student TRANSFORMS a shown parent curve by dragging AND types the resulting
equation — and the diagnostic is the DISAGREEMENT between the two channels. A
student who drags the parabola correctly two right but types `y = (x+2)²` has
a precise, nameable misconception (sign-of-horizontal-shift) that neither
channel alone can see. The fallback ("which graph shows…" MC with choice
graphs) collapses the two signals into one pick.

**What exists to build on.** `plot_function` already does drag-a-curve: N
handles seed on the board, `fitFunction` fits the family curve through them
live, and `scoreFunction` compares fitted parameters to the key with
per-parameter tolerances (`graph-kit/src/graph-question.ts`,
`graph-score.ts`). The cubic/quartic slice (#2) extended the families the
transformation band needs. Graph mistake annotation is shipped and ruled
(#1): authored `mistake:` matchers compile through `parseGraphFormula`, and
`selectGraphMistake` returns feedback + an optional `mis.*` id that rides
`CheckItemResult.misconceptionIds`. `GraphWork` takes ADDITIVE-OPTIONAL
fields without a wire bump — `shape` is the precedent (`check/wire.ts`).

## Decisions

**D1 — A new INTERACTION VARIANT on `interactive_graph`
(`type: 'transform_curve'`), not a new block.** It is a graph question: axis
config, widget mount plumbing, print twin, `questionShape` derivation, and
the graph grader's dispatch all exist per variant. A new block would rebuild
all of that to hold one extra input. (Naming: name-by-shape — the interaction
is "transform a curve and state it"; `drag_then_type` describes the gesture,
`transform_curve` the task. Recommend `transform_curve`.)

**D2 — The variant's schema: a SHOWN start curve + the target key + the
typed-equation requirement.**
```
{ type: 'transform_curve',
  start: FunctionModel,          // the parent curve, DRAWN and labeled; not secret
  models: [FunctionModel],       // the target (key) — same shape as plot_function
  requireEquation: true }        // future-proofing: false = drag-only (a cheaper
                                 // plot_function-with-start, free to allow)
```
`start` is display material (the student must see the parent), so it SURVIVES
sanitize; `models` strips exactly as plot_function's do. `questionShape`
gains the start model — it is not answer material (the whitelist widens to a
`startFamily`/params channel, or the start rides the served interaction
since only `models` is stripped — the cheaper path, verify at build).

**D3 — The student widget: plot_function's recipe with seeded-on-start
handles + one plain-text equation input in the widget chrome.** Handles seed
ON the start curve (the author-board's `functionStartPoints` logic, moved
into the kit for the student side) so the gesture IS "drag the parent". The
equation input is a plain `<input type="text">` accepting the calculator's
ASCII forms (`y = (x-2)^2 + 3`) — NOT a MathLive field: MathLive is
content-pinned out of the student shell, and the transformation band's
equations are typable in ASCII. The typed string is NOT parsed client-side
in v1 (no live preview of the typed curve) — the dragged curve is the visual
feedback, and client parsing would pull mathjs into the eager path.

**D4 — Wire: one additive-optional field, NO bump.** `GraphWork.equation?:
string` (raw typed text). The `shape` precedent applies verbatim: absent
means "not typed", which the grader treats as an unanswered channel, never a
default.

**D5 — Grading: two channels scored independently, verdict = both.**
- DRAG: `scoreFunction(key, points)` — unchanged machinery.
- TYPE: server-side `parseGraphFormula(equation)` (the formula subpath pulls
  mathjs/number, no MathLive — already proven in the grading bundle) → the
  parsed model must match the key's family and parameters within the same
  tolerances the drag uses. A parse failure or family mismatch scores the
  channel wrong, never throws (the S4-B3 posture).
- Verdict: `correct` iff both channels right; unanswered iff NEITHER channel
  answered (no points placed AND no equation typed) — one answered channel is
  an answered item.

**D6 — The disagreement signal rides #1's machinery, unit-blanks style: two
RESERVED mistake matches, locally derived.** On a `transform_curve` block
only, authored `mistake:` entries with the reserved matches `drawn-not-written`
(drag right, type wrong/missing) and `written-not-drawn` (type right, drag
wrong) fire on the locally recomputed channel outcomes — same mechanism as
`!unit-missing` (no verdict threading; the matcher re-derives). Ordinary
authored matchers keep their shipped semantics and are checked against BOTH
channels: a `mistake: y = (x+2)^2 + 3` entry matches whether the student
DRAGGED that wrong curve or TYPED it (parse the match once, compare fitted
params to the drag fit and to the typed parse). The 2×2 outcome is therefore
fully bindable to `mis.*` ids without any new stored field — the raw
`equation` string is stored with the responses anyway (query-time recovery,
the correspondence precedent).

**D7 — Authoring: the ```graph fence grows two lines, no new fence.**
```
```graph
prompt: Shift the parabola 2 right and 3 up, then write its equation.
start: y = x^2
answer: y = (x-2)^2 + 3
options: type-equation
```
`start:` parses through `parseGraphFormula` (shared parser — both surfaces
light up at once); `options: type-equation` selects the variant (an
`answer:`+`start:` fence without it is the free D2 drag-only case).
`mistake:` lines work as today, plus the two reserved tokens.

**D8 — Editor: the author board shows the start curve (display drawable) and
the key curve exactly as plot_function does; a Start formula field beside the
Answer field.** No new NodeView — `InteractiveGraphView` grows the variant
the way inequality/ray/segment did.

**D9 — Print: the printed question shows the START curve on the axes and the
equation write-line; the drag channel becomes "sketch it" on paper.** The
print answer-key twin overlays the target curve (the shipped `graphOverlay`
channel) and prints the key equation on the line.

**D10 — Deliberately OUT of v1:** live preview of the typed equation
(client-side parsing), a MathLive input, partial credit weighting between
channels (the verdict is boolean like every graph block; the channels are
diagnosis, not points), and drag-only capture of intermediate drag paths
(the response is the final position, not a trace).

## Cost

Schema variant + questionShape/sanitize check + kit recipe (seed-on-start +
equation input chrome) + `GraphWork.equation` + grader (type channel +
reserved matches) + importer lines + format doc + prompt regen + editor
variant + print twin + tests/mutations + BOTH bundles + both redeploys.
Cheaper than #4 (no new block type, no wire bump); the kit recipe is the
biggest piece.

## Non-goals

Trig/exotic families (the family set is #2's), free-drag-anywhere curve
sculpting, storing drag traces, client-side equation preview.
