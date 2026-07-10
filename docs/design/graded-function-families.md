# Graded function families: quadratic / exponential / logarithmic

**Status:** SHIPPED 2026-07-10 (fourth session). All five decisions resolved by the author same-day: (1a) rename picker to "Plot a function", formula-driven family switching stays; (2) seeding fix + SR narration (the narration rode the existing narrate path at ~2 lines); (3c) quadratic-only classifiers, exp/log wait on observed student data; (4) yes — dashboard fits the student's points back into an equation; (5) quadratic inequalities verified in-browser (worked with zero additional code, as the schema promised).

**As-built deltas:** `startsForFamily` lives in `graph-kit/src/graph-score.ts` beside `handlesForFamily`; the inequality path inherits the seeding because it rides the plot_function recipe. The dev harness `/dev/graph-question` grew a scenario picker (point / two-point / linear / quadratic / exponential / logarithmic / quadratic-inequality) — the browser-verification surface for every graded family. Dashboard: `GraphInfo.functionFamily` + `fitStudentEquation` in `app/src/lib/submissions.ts` (shared `formatFunctionModel` now also renders the answer summary, so key and student columns read alike).

## The surprise: this feature is ~80% already built

STATE.md framed this as "one schema member + one fitX call per family." The audit
found it's further along than that — the schema members and fit calls **already
exist**, shipped as foundations during Drop 2 and the 2.7b build:

| Surface | State | Where |
|---|---|---|
| Schema: `FunctionModel` union with all five families (linear, quadratic, exponential, logarithmic, vertical), each with per-parameter tolerances | ✅ shipped | `packages/schema/src/blocks/interactive-graph.ts` |
| Fit engine: `fitQuadratic` / `fitExponential` / `fitLogarithmic` | ✅ shipped (calculator Stage 3) | `graph-kit/src/regression.ts` |
| Kit scorer: `fitFunction` + `scoreFunction` branch on every family | ✅ shipped | `graph-kit/src/graph-score.ts` |
| Widget recipe: `handlesForFamily` (quadratic 3, others 2) + family-generic `deriveCurve` | ✅ shipped | `graph-kit/src/graph-question.ts` |
| Failed-fit behavior: `deriveCurve` → null → NaN → curve simply doesn't draw | ✅ graceful | `graph-kit/src/board.ts` |
| Editor: FormulaField parses any family (sample-and-fit detection), author board seeds handles ON the curve per family (log seeds x > 0), tolerance rows render per family | ✅ shipped; quadratic + vertical browser-verified 2026-07-08 | `app/src/editor/nodeViews/InteractiveGraphView.tsx` |
| Markdown ```graph DSL + Copy-AI prompt: families documented, parser handles them | ✅ shipped | `docs/markdown-import-format.md`, `markdownImportPrompt.ts` |
| Dashboard answer summaries format all families | ✅ shipped | `app/src/lib/submissions.ts` |
| Wire format: `FunctionResponse` stores raw student points — family-agnostic | ✅ no bump needed | `schema/src/submission.ts` |
| Authored mistakeFeedback: matchers compile through `parseGraphFormula` — family-generic | ✅ shipped | `graph-kit/src/mistakes.ts` |

So this is a **gap-closing pass, not a build**: no schema change, no wire bump,
no storage bump, no runtime (renderer) change. Kit + app + tests only.

## The actual gaps

### Gap 1 — student handle seeding breaks exponential/logarithmic (the one real bug)

`board.ts` seeds default handle starts **spread across the x-axis at y = 0**.
That's fine for linear/quadratic/vertical, but:

- `fitExponential` requires y > 0 at every point (y = a·bˣ never touches 0) →
  a student opening an exponential question sees handles but **no curve**, with
  no explanation, until they happen to drag both handles above the axis.
- `fitLogarithmic` requires x > 0 → on the default symmetric window, one
  default handle lands at negative x → same silent no-curve state.

Fix: family-aware default starts on the **student** board (the author board
already seeds on-curve per family). E.g. exponential seeds at y = 1 and y = 2;
logarithmic seeds at x = 1 and x = 2 (clamped to the window). The seeds must NOT
sit on the answer curve — they're just valid fit territory.

Related: when a student drags into invalid territory mid-work, the curve
vanishes (correct) but silently. Options in Decision 2.

### Gap 2 — built-in mistake classifiers are linear-only

`classifyFunctionMistake` returns null for every non-linear family (marked
"linear only in v1"). Candidate nudges, same nudge-not-lesson posture:

- **quadratic:** sign of `a` flipped ("should the parabola open up or down?");
  `a`+`b` right, `c` wrong ("check where it crosses the y-axis"); `c` right,
  shape wrong ("check the width/steepness").
- **exponential:** b vs 1/b flip ("growth or decay?"); `a` right / `b` wrong
  and vice versa (y-intercept vs rate nudges).
- **logarithmic:** sign of `b` flipped ("increasing or decreasing?").

Authored mistakeFeedback already covers all families, so shipping without
built-ins is viable (Decision 3).

### Gap 3 — editor picker says "Plot a line"

The interaction option label predates the families. Family switching works
(typing `y = x^2 - 4` in the formula field flips the board to 3 handles —
browser-verified during Drop 3), but the label undersells it and a teacher who
doesn't know the formula trick can't discover the families (Decision 1).

### Gap 4 — dashboard shows raw points, not the student's fitted curve

`FunctionResponse`'s schema comment anticipates fitting the stored points for
display ("the dashboard can show 'student's line' without a second stored
shape") — not yet done; the row shows bare coordinates. Cheap to add: fit +
format ("plotted (1,1), (3,5) ≈ y = 2x − 1") using the same engine (Decision 4).

### Gap 5 — nothing non-linear has been browser-run on the STUDENT side

Author-side quadratic authoring was browser-verified (2026-07-08). The student
widget path (3-handle drag → live parabola → check → verdict → restore), the
exponential/log flows, and **quadratic inequalities** (y > x² — schema says the
boundary being a FunctionModel means they light up the day the family does; the
half-plane shading samples the boundary curve so it *should* work) have never
run in a browser (Decision 5 on inequality scope).

## Proposed drops (after decisions)

1. **Drop A — seeding fix** (kit): family-aware student starts + tests; decide
   the invalid-fit affordance. Small.
2. **Drop B — editor surfacing** (app): picker label / family UX per Decision 1;
   any steering-text touch-ups. Small.
3. **Drop C — classifiers** (kit): per Decision 3. Medium; pure functions + tests.
4. **Drop D — dashboard fitted equation** (app): per Decision 4. Small.
5. **Drop E — verification**: browser pass on student quad/exp/log end-to-end +
   quadratic inequality; fix whatever falls out. Docs sweep (RUNTIME.md untouched;
   markdown-import doc examples if thin).

## Deploy footprint

Kit changes → re-hash → **kit upload FIRST, then `publish-activity` redeploy**
(standing rule). No wire bump → **no `ingest-submission` redeploy**. No renderer/
runtime change expected → no `bundle:renderer` unless verification finds a
runtime-side fix. Already-published pages keep their pinned kit until re-publish.

## Non-goals

- New drawable kinds, `label` drawables (still YAGNI).
- Trig/rational families (the `expression` display drawable remains the escape hatch).
- Per-family axis-window presets in the editor (revisit if authoring friction shows).

## Decisions to make (author yes/no)

1. **Editor family UX:** (a) just rename the option to "Plot a function" and keep
   formula-driven family switching, or (b) also add an explicit family dropdown
   beside the formula field. *Recommend (a) — the formula field already detects
   and steers; a dropdown duplicates state and invites drift.*
2. **Invalid-fit affordance:** (a) seeding fix only, curve silently absent when
   points can't define the curve (status quo behavior), or (b) also add a small
   status line / SR narration ("these points don't define an exponential curve
   yet"). *Recommend (b)-lite: SR narration only — sighted students see the curve
   vanish; screen-reader students currently get nothing.*
3. **Built-in classifiers:** (a) ship the catalogue above, (b) defer entirely
   (authored mistakeFeedback already works for all families), or (c) quadratic
   only (the Algebra I workhorse). *Recommend (c) — highest value per line;
   exp/log classifiers can follow observed student data.*
4. **Dashboard fitted equation for plot_function rows:** yes/no. *Recommend yes.*
5. **Quadratic inequalities:** include the browser verify + fixes in this pass,
   or punt to its own pass. *Recommend include — it's the schema's promised
   payoff and likely already works.*
