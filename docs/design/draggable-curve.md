# draggable_curve — the drag-then-type disagreement diagnostic (wishlist #5)

**Status:** ✅ **SHIPPED 2026-09-01 — see the Build record at the bottom
(as-built corrections included) before the plan above it.** *(Was: GREENLIT
2026-09-01, with TWO author rulings that change the plan below.)* The review had found 7 defects (amendments A1–A7);
the author then ruled:

- **Q2 RULED: the transformation band DOES transform |x| and √x — the
  parent-families slice is a PREREQUISITE and builds first.** `absolute`
  (y = a·|x − h| + k) and `sqrt` (y = a·√(x − h) + k) join the graded
  families through the #2 pipeline before this slice starts.
- **D3 OVERRULED: the typed channel gets a REAL math input, not a plain
  ASCII field.** The student types in a lazy-mounted MathLive field (the
  shipped math-prompt mount machinery — `mountMathPrompts` already lazy-loads
  MathLive in the student viewer, and its fonts self-host). The wire carries
  the ascii-math mirror form (the MA-D3 precedent, so the server's
  `parseGraphFormula` channel is unchanged). A live preview of the typed
  curve draws on the board — the parse runs INSIDE the kit's lazy chunk,
  which the graph surface has already loaded by the time the input exists;
  the chunk budgets are re-measured at build and this is the slice's main
  new cost.

Everything else stands as amended: both channels must be right (D5/A1 with
the `dragged` flag), the reserved disagreement matches (D6/A4), `start:` +
`options: type-equation` authoring (D7/A7), the conscious print-invariant
revision (D9/A3), and boolean verdicts (D10).

## Amendments after the outside-voice review (2026-09-01)

- **A1 (changes D5 — the review's sharpest find).** The seeded handles POISON
  the diagnostic as designed: the kit reports current handle positions on
  every onChange, the equation input would force an emit, and the wire's
  unanswered proxy is points-length-only — so a student who ONLY typed would
  ship the seed positions (sitting exactly on the parent curve) as drawn
  work, and `written-not-drawn` would fire against work they never did.
  transform_curve is the first variant where a non-drag input forces an emit.
  RULING: the kit's existing `answered` bit ("true once a handle moved")
  finally reaches the wire as additive-optional `GraphWork.dragged?: boolean`
  (the `shape` precedent); the drag channel is UNANSWERED unless `dragged`,
  regardless of points; the item is answered iff `dragged` OR a non-empty
  `equation`; `isUntouched` learns both fields.
- **A2 (cost — the wiring is four seams, not one field).** `equation` (and
  `dragged`) must be threaded through the kit's `toSurfaceResponse`
  WHITELIST, `GraphSurfaceResponse`, the viewer's field-by-field onChange
  rebuild, AND a new restore channel (today's restore is points-only — the
  typed text would vanish on reload). Inbound, the mount config
  (`GraphSurfaceConfig`) must carry the start curve — which settles Q4: the
  widget's start authority is the SERVED `interaction.start`, threaded
  through the config, one source for board, print, and editor preview.
- **A3 (revises D9 and retracts a D2 aside).** "A QUESTION prints empty axes"
  is a deliberately pinned invariant (comment + type-level proof + a named
  test suite). transform_curve is the first question variant carrying
  display material, so the trio is revised CONSCIOUSLY: the print twin gains
  a variant-scoped start-curve channel (the key still never prints on the
  student sheet), the pinned suite grows the case, and the importer's
  deferred "show lines alongside an answer" note is partially discharged —
  `start:` only, not general graded stimuli. The D2 aside that drag-only
  (`requireEquation: false`) is "free to allow" is RETRACTED — it needs this
  same display-on-graded machinery; it is cheap-after-this-slice, not free.
- **A4 (costs D6's mechanism honestly).** Three uncosted sites: the kit's
  matcher COMPILER has no default branch (an unknown interaction type
  compiles every matcher to never-match), so transform_curve needs its own
  branch; "checked against BOTH channels" needs a model-vs-model comparison
  (the typed channel yields a model, not points — sample-and-rescore, small
  but new); and the editor's per-entry matcher validator would reject the
  reserved tokens as parse errors, so they need an editor carve-out. One
  worry the blanks precedent raised does NOT transfer: graph matchers are
  authored predicates over work, never compared against student text, so a
  student typing the literal token cannot summon the entry.
- **A5 (cost).** The per-variant fan-out is triple-guarded and bigger than
  the cost line said: registry variants roster, leak-fixture variant,
  authored+sanitized fixtures 1:1, the dispatch test's correct-work builder,
  the answer-key overlay case (a TS-exhaustive switch — it stops compiling),
  and the census walk. Ground truth: plot_ray touches 23 files across all
  four packages. Two mitigations verified: serialize passes the whole
  interaction attr through (free), and no e2e lane enumerates variants.
- **A6 (hardening).** The typed equation is the first STUDENT free text to
  enter mathjs compilation server-side. It gets a length cap (the handler
  has none for graphs work) and hostile-input tests under the S4-B3
  never-throw posture.
- **A7 (corrects D7's degrade claim).** The fence's line grammar is a CLOSED
  keyword regex and an unrecognized line fails the WHOLE block to plain
  text — so an old importer meeting `start:` degrades the whole fence (key
  masked? NO — a graph fence's answer line is inside the fence; the R5
  degrade-visibility note from the correspondence review applies here too
  and the format doc's warning already covers it). `start:` joins the
  keyword set; there is no "degrade to drag-only" path.

**Open question for the author (Q2, from the review): does the
transformation band need `absolute` and `sqrt` PARENT families?** The schema
grades linear/quadratic/cubic/quartic/exp/log/vertical; |x| and √x — the two
classic transformation parents — have no schema member or fitter, yet the
sanitizer's family whitelist already anticipates both. If the ~11 activities
transform |x| or √x, that is a hidden prerequisite slice (two new families
through the #2 pipeline) and should be ruled BEFORE this build starts.

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
sculpting, storing drag traces. (Client-side equation preview MOVED from this
list into scope by the D3 overrule — it shipped with the MathLive field.)

## Build record (2026-09-01 — SHIPPED)

Everything above as ruled: schema variant, kit recipe (MathLive equation
field + dotted-green typed-curve preview via `setPreviewCurve`), two-channel
grader with reserved matches, viewer wiring (equation/dragged forwarded;
restore gated on `dragged` so buffered seeds never pin), print (start curve
via `questionDrawables` + equation write line; answer key overlays the target
and fills the line via the new `graphEquation` channel), editor variant
(picker, Start field, requireEquation toggle, reserved mistake tokens),
importer (`start:` + `options: type-equation`, loud degradation on both
misuses) + format doc + prompt regen. Browser-verified end-to-end in
/dev/graph-question: both channels correct → `correct: true`; drag-only
variant renders no field.

Two live bugs found and pinned during the browser pass, both in
`pointsOnModel`'s generic branch: (1) seeds spread across the x-window left
the y-window and the board CLAMPED them off-model (x² mounted as 0.4x²);
(2) after the in-window shrink, off-grid seed xs were snapped off-model by
snapToGrid. Fix: shrink to the in-window x-range (the editor seeder's rule),
then grid-align the xs. Mutation ledger for the slice's new guards: 9 this
session (3 print, 2 importer, 3 viewer wiring, 1 seed fix), each watched red
once.

One perf correction: `formatModel` moved to a LEAF `model-format.ts`
subpath — the answer-key extract's import of `formula.ts` had pulled
evaluate/mathjs into the student shell entry (+35 KiB gz, perf gate red).
formula.ts re-exports it; no call site changed behavior.
