# Interactive graph block — Phase 2.7 design

**Status:** ✅ **SHIPPED** (Stage 5, 2026-07; live-verified 2026-07-10). The block ships four graded interactions — plot a point (N-handle), plot a function (linear/quadratic/exponential/logarithmic/vertical, incl. rays/segments with endpoint gliders), graph an inequality, shade a region — plus an ungraded static `display` mode. The Zod definitions live in `packages/schema/src/blocks/interactive-graph.ts`; `packages/renderer/RUNTIME.md` holds the current data-attribute contract.

**As-built diverges from the architecture sketched below — trust the code, keep this doc for the rationale.** Key deltas: (1) there is **no per-publish `graph-widget.js`** — the widget lives in the shared content-hashed `@activity/graph-kit` bundle on R2, the same kit the calculator uses (see `calculator-tool.md`, "one track, two faces"), lazy-`import()`ed on published pages; (2) there are **no `evaluateAnswer` strategy entries** for graphs — all graph runtime logic sits behind the `graphExt` seam (`runtime/graph-integration.ts`), compiled only into the graphs build variant of the runtime, and scoring is the kit's pure scorer functions; (3) the runtime is inlined into published pages, so there is no separate `runtime.js` either. The parallel-map submission pattern (`graphResponses` on `SubmissionResponses`) shipped as designed and became the template for later response categories (e.g. multiple choice's `choices` map). The rest of this doc is the original Stage 9c-era reasoning, kept unedited.

See ROADMAP.md "Phase 2.7 — Interactive graphing" for the user-visible framing.

## Why this is different from every other block

Every existing block type produces text-shaped output. A graph block produces *geometric* output — a point, a line, a region — that the student manipulates by dragging handles on a coordinate plane. Three structural consequences:

1. **The student's answer isn't a string**, it's a structured value. The submission payload shape extends.
2. **Scoring isn't string comparison**, it's tolerance-based geometric comparison. The runtime's strategy-dispatch hook gains new cases.
3. **The widget is large.** Coordinate transforms, hit testing, snap-to-grid, function plotting, anti-aliased rendering, touch gestures — building from scratch is wrong. Pick a library. JSXGraph (MIT, ~120KB minified, works in static HTML) is the natural choice; Function-plot and Plotly are bigger and less interaction-oriented.

This is the block that most strongly tests the runtime architecture's assumptions. The runtime budget commitment (20KB target / 40KB ceiling) cannot accommodate a graphing library. The fix is lazy loading, not a budget increase.

## Lazy-load architecture

A second esbuild entry produces `graph-widget.js` + map, uploaded per-publish alongside `runtime.js`. The main runtime stays unchanged for pages without graphs; pages with graphs do one extra fetch.

```typescript
// In runtime/index.ts, after the main init pass:
const hasGraphBlock = document.querySelector('[data-graph-block-id]');
if (hasGraphBlock) {
  try {
    const { initGraphBlocks } = await import('./graph-widget.js');
    initGraphBlocks(state);  // pass shared state ref
  } catch (err) {
    console.error('Graph widget failed to load', err);
    // Pages still work for non-graph blocks; graph blocks render as
    // "this question requires JavaScript that didn't load" placeholder.
  }
}
```

Key properties:

- **Zero cost for pages without graphs.** Dynamic import only fires when the block is present.
- **Graceful degradation.** A failed import leaves the rest of the page functional. Non-graph blanks still score, the checkpoint still submits, the student isn't stranded.
- **Versioned with the publish.** Same per-publish bundling story as `runtime.js`. The Phase 3+ CDN-hosted runtime decision will pull graph-widget into the same migration.
- **Source maps emitted, always.** Same discipline as the main runtime.

The build pipeline change is small: `bundle-renderer.mjs` gains a second esbuild call with `runtime/graph-widget.ts` as entry. `publish-activity` uploads three files (`index.html`, `runtime.js`, `graph-widget.js`) plus maps when graph blocks are present in the document.

## Schema shape

The block uses a **discriminated union on interaction type** because the answer-key shape varies per interaction. Each interaction has its own answer-key fields and its own scoring strategy.

```typescript
// packages/schema/src/blocks/interactive-graph.ts (PHASE 2.7)
import { z } from 'zod';
import { InlineNode } from '../inline.js';

// ---- Axis configuration -----------------------------------------------------
const AxisConfig = z.object({
  xMin: z.number(),
  xMax: z.number(),
  yMin: z.number(),
  yMax: z.number(),
  xGridStep: z.number().positive().default(1),
  yGridStep: z.number().positive().default(1),
  showGrid: z.boolean().default(true),
  snapToGrid: z.boolean().default(true),
});

// ---- Interaction variants ---------------------------------------------------
// Each variant carries its OWN answer key shape and tolerance config.
// Adding a new interaction type = adding a new variant + a new runtime
// scoring strategy. No other schema changes.

const PointInteraction = z.object({
  type: z.literal('plot_point'),
  // One or more correct points; student must plot all of them.
  correctPoints: z.array(z.tuple([z.number(), z.number()])).min(1),
  // Per-axis tolerance in graph units (not pixels).
  tolerance: z.number().nonnegative().default(0.1),
});

const LineInteraction = z.object({
  type: z.literal('plot_line'),
  // Authored as a plain equation string; editor parses for preview,
  // runtime parses for scoring. math.js handles slope/intercept extraction.
  correctEquation: z.string(),                // e.g. "y = 2x + 3"
  slopeTolerance: z.number().nonnegative().default(0.05),
  interceptTolerance: z.number().nonnegative().default(0.1),
});

const RegionInteraction = z.object({
  type: z.literal('shade_region'),
  // Polygon vertices defining the correct region.
  correctVertices: z.array(z.tuple([z.number(), z.number()])).min(3),
  // Minimum fraction of overlap area (0-1) required to count as correct.
  minOverlap: z.number().min(0).max(1).default(0.9),
});

const GraphInteraction = z.discriminatedUnion('type', [
  PointInteraction,
  LineInteraction,
  RegionInteraction,
]);

// ---- The block --------------------------------------------------------------
// Auto-numbered like Problem and FillInBlank. hasConfidenceRating follows
// the same opt-in pattern as FillInBlank. solution shown post-check.
export const InteractiveGraphBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('interactive_graph'),
  number: z.number().int().positive().optional(),
  prompt: z.array(InlineNode),
  axisConfig: AxisConfig,
  interaction: GraphInteraction,
  solution: z.string().optional(),
  hasConfidenceRating: z.boolean().default(false),
  skills: z.array(z.string()).default([]),
});
export type InteractiveGraphBlock = z.infer<typeof InteractiveGraphBlock>;
```

The discriminated union pattern matches how the top-level `Block` type already works. Adding parabola support, transformation problems, function-from-table problems is a new variant + a new scoring strategy in the runtime — no schema migration, no changes to any other block type.

## Submission payload extension

The current `BlankResponse` shape (`{ answer: string, correct: boolean, confidence? }`) doesn't fit. Two paths considered:

1. **Widen `BlankResponse.answer` to `z.union([z.string(), z.record(...)])`.** Backward-compatible but blurs the type. Teacher dashboard code that reads `response.answer` as a string starts needing type guards.
2. **Add a parallel `graphResponses` map on `SubmissionResponses`.** Cleaner separation: graphs aren't blanks, the data is shaped differently, the dashboard renders them differently.

**Decision: parallel map.** Bumps `SubmissionResponses.schemaVersion` to 3, follows the "rename when demoting, not when promoting" convention established in Stage 9a (current schema stays named `SubmissionResponses`; the v2 shape gets renamed to `SubmissionResponsesV2` and added as a legacy export; `migrateSubmissionResponses` gains a v2 → v3 branch). Note: "v3" here assumes graph blocks are the next SubmissionResponses bump. If the Phase 2 MC/matching/ordering maps ship first, they take v3 and this becomes v4 — the number is whatever's next at implementation time, and the SubmissionResponsesV(N-1) rename / migrateSubmissionResponses branch follow from that, not from a literal 3.

```typescript
// In submission.ts at Phase 2.7:

// Mirror the interaction discriminated union; each response variant carries
// the student's structured input plus the same correctness fields blanks
// have. The runtime computes `correct` client-side (same security ceiling
// as fill-in-blank — Phase 5 server-side grading is the fix).
const PointResponse = z.object({
  type: z.literal('plot_point'),
  studentPoints: z.array(z.tuple([z.number(), z.number()])),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});

const LineResponse = z.object({
  type: z.literal('plot_line'),
  studentSlope: z.number(),
  studentIntercept: z.number(),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});

const RegionResponse = z.object({
  type: z.literal('shade_region'),
  studentVertices: z.array(z.tuple([z.number(), z.number()])),
  overlapFraction: z.number().min(0).max(1),
  correct: z.boolean(),
  confidence: ConfidenceLevel.optional(),
});

const GraphResponse = z.discriminatedUnion('type', [
  PointResponse,
  LineResponse,
  RegionResponse,
]);

// SubmissionResponses (current, v3) gains:
graphResponses: z.record(z.string().uuid(), GraphResponse).optional(),
```

## Data-attribute contract (renderer output)

Additive to the frozen contract. New attributes only; no rename or remove.

```html
<div class="interactive-graph-block"
     data-graph-block-id="<uuid>"
     data-graph-interaction-type="plot_line"
     data-graph-config='{"xMin":-10,"xMax":10,"yMin":-10,"yMax":10,"xGridStep":1,"yGridStep":1,"showGrid":true,"snapToGrid":true}'
     data-graph-answer-key='{"correctEquation":"y = 2x + 3","slopeTolerance":0.05,"interceptTolerance":0.1}'
     data-blank-strategy="graph-line"
     data-solution="..."
     data-has-confidence-rating="false"
     data-skills='["plotting linear functions"]'>

  <div class="graph-prompt"><!-- inline content from prompt[] --></div>

  <div class="graph-canvas"
       role="application"
       aria-label="Interactive coordinate plane. Use arrow keys to move handles."
       tabindex="0">
    <!-- JSXGraph mounts here. Empty until graph-widget.js loads. -->
  </div>

  <div class="js-graph-feedback"
       data-for-graph="<uuid>"
       aria-live="polite"
       hidden></div>
</div>
```

JSON-encoded attributes (`data-graph-config`, `data-graph-answer-key`, `data-skills`) are HTML-entity-escaped by the renderer. The runtime parses them once on init, wrapped in try/catch with sensible defaults.

`data-blank-strategy` slots into the existing strategy-dispatch mechanism — the strategy values are `'graph-point' | 'graph-line' | 'graph-region'`. The dispatch table grows; existing strategies are untouched.

## Scoring

Strategy dispatch is the right seam. Each interaction type registers a strategy in the runtime:

```typescript
// In graph-widget.ts (lazy-loaded module)
const graphStrategies: Record<string, GraphScorer> = {
  'graph-point': scorePoint,
  'graph-line':  scoreLine,
  'graph-region': scoreRegion,
};

function scoreLine(answerKey: LineAnswerKey, studentInput: LineInput): boolean {
  const { slope: correctSlope, intercept: correctIntercept } =
    parseLineEquation(answerKey.correctEquation);  // via math.js
  return (
    Math.abs(studentInput.slope - correctSlope) <= answerKey.slopeTolerance &&
    Math.abs(studentInput.intercept - correctIntercept) <= answerKey.interceptTolerance
  );
}
```

Tolerance is **authored per problem**. A "plot the line of best fit" question wants loose tolerance; a "plot exactly y = 2x + 3" question wants tight. Defaults are reasonable starting points, not magic constants.

For region scoring, overlap is computed via a polygon-intersection routine. Several pure-JS implementations exist (Martinez-Rueda algorithm, ~5KB); add to the graph-widget bundle, not the main runtime.

## Editor authoring

The NodeView in the editor uses **the same JSXGraph library as the student view**, so authoring and student preview look identical. This is non-negotiable — teachers need to see exactly what students will see.

Authoring flow:

1. Slash-menu insert "Interactive graph."
2. NodeView opens with default axis config and a "Choose interaction type" picker.
3. Teacher picks interaction (plot point, plot line, shade region).
4. NodeView shows the JSXGraph canvas in **author mode** — teacher drags handles to *set the correct answer*.
5. Tolerance sliders for the chosen interaction type appear inline.
6. Prompt content (the question text above the graph) edits inline like any other block.

The Tiptap NodeView is structurally larger than the math NodeView — multiple sub-controls instead of one `<math-field>` — but the 5-commitment NodeView lifecycle pattern still applies. JSXGraph mounts inside a stable ref managed by a layout effect; React owns identity, JSXGraph owns canvas state.

**This will be the most complex NodeView in the editor.** Plan for a UX-iteration loop with real teachers before locking it in. The cost-of-change inside the NodeView is low; the cost of teaching teachers a confusing authoring UI is high.

## Accessibility

This is the part that distinguishes a real educational tool from a demo, and the part most likely to be under-built without explicit planning.

**Commitments for Phase 2.7:**

- **Every interaction has a keyboard equivalent.** Arrow keys move a focused handle by one `xGridStep` / `yGridStep` unit. `Shift+Arrow` moves by 0.1 unit for fine positioning. `Tab` cycles between handles when multiple are present.
- **Screen reader announces position on every move.** "Handle at x equals 2, y equals 5." `aria-live="polite"` region updated as handles move (debounced to avoid announcement spam during continuous drag).
- **The graph canvas is `role="application"` with a descriptive `aria-label`** that names the interaction type and tells the user how to operate it.
- **High-contrast mode respected.** JSXGraph styles are themed via CSS variables so the renderer can swap palettes for `prefers-contrast: more`.
- **`prefers-reduced-motion` respected** for any animation during feedback rendering.
- **Touch targets on handles meet the runtime's 44×44px commitment.** JSXGraph's default handle size is smaller; override via the library's point size config.

JSXGraph has some keyboard support and ARIA hooks but does not provide screen-reader narration of position out of the box. The narration layer is hand-built on top.

**This is a meaningful chunk of work, possibly a third of the total widget effort.** Budget for it explicitly when planning Phase 2.7. Skimping here is the failure mode that makes the platform unusable for students with IEPs — the population this tool needs to serve well.

## Phasing within the feature

Even Phase 2.7 itself benefits from a staged rollout:

1. **2.7a — Plot a single point.** One interaction type, one scoring strategy, one NodeView mode. Validates the lazy-load architecture, the schema discriminated-union pattern, the submission payload extension, and the accessibility layer end-to-end. Low blast radius for discovering UX problems.
2. **2.7b — Plot a line.** Adds equation parsing (math.js), two-handle interaction, slope/intercept tolerance authoring. Mostly additive to 2.7a — same widget, same submission shape with a new variant.
3. **2.7c — Shade a region.** Adds polygon-intersection scoring, multi-vertex authoring UI. The most complex of the three, both for the teacher (defining the correct polygon) and the runtime (overlap computation).
4. **2.7d+ — Parabolas, transformations, function-from-table.** Each is a new variant + a new strategy. Drop in when there's curricular demand.

Don't try to ship all four at once. The discriminated-union schema is built for incremental addition.

## Graded regression (planned variant)

Decided 2026-06-21: a **gradable regression question** is a wanted feature — a "fit a model to data" block a teacher drops into a section and scores. It is a new interaction variant on *this* graded block; the calculator **tool** is and stays ungraded. Captured now, **not yet scheduled** ("note it + keep reusable" — staging unchanged). The plan keeps it cheap to add later:

- **Reuse, don't rebuild.** The calculator track's Stage 3 builds the regression engine (closed-form least-squares — linear / quadratic / exponential) + the data-table component as standalone, framework-agnostic modules ([calculator-tool.md](calculator-tool.md) "pre-emptive cheap moves"). The graded block scores with the *same* engine — it adds only an answer key + a scoring strategy + a submission-map entry on top. Keep the regression engine out of the calculator shell so this stays true.
- **Open sub-question — what gets scored?** This sets the answer-key shape; resolve when the variant is scheduled. Candidates:
  1. *Model choice only* — given the scatter, student picks linear/quad/exp; graded on the model. (Thin: the fit is then deterministic.)
  2. *Line of best fit by eye* — student drags a line over given data; scored on slope/intercept tolerance vs the true least-squares fit. (Essentially `plot_line` with an answer key computed from the data.)
  3. *Fit + interpret* — student fits, then a downstream numeric question ("predict y at x = 10") graded against their model's prediction.
- **Known costs** (same as any graded variant): a parallel response map → a submission `schemaVersion` / `STORAGE_SCHEMA_VERSION` bump when it lands; an answer key in published HTML (client-side security ceiling until Phase 5 server grading).

## What this design does NOT decide

1. **Library lock-in.** JSXGraph is the leading candidate but final selection happens at implementation. Alternatives: Mafs (React-native graphing, smaller but newer), GeoGebra (more features but heavier and AGPL-licensed). Decide after a one-day spike on representative interactions.
2. **Equation-parsing library specifically.** math.js handles enough for linear and quadratic equation parsing; if Phase 2.5 parameterized problems already pull in a math library, reuse it. If not, evaluate math.js vs. nerdamer at Phase 2.7 start.
3. **How `correctEquation` is authored.** Plain string input is the obvious first cut. A MathLive-style WYSIWYG input would match the math NodeView's pattern but adds another sub-control to an already-complex NodeView. Probably defer the WYSIWYG version to a 2.7 polish pass.
4. **Print behavior.** Interactive graphs can't be solved on paper. Probably print as a static rendering of the axes + prompt with empty answer space, but the specifics depend on the print CSS architecture decided at Stage 11 / Phase 2.
5. **Whether to expose tolerance values as sliders or numeric inputs in the editor.** Sliders are friendlier; numeric inputs are precise. Probably both, with the slider as the primary affordance and a numeric override for power users.
6. **Phase 5 server-side grading impact.** The structured answer key in `data-graph-answer-key` is more telling than `data-blank-answers` is for fill-in-blank — a sufficiently motivated student can read off the correct slope/intercept directly. Phase 5's server-side grading should remove the answer key from published HTML for graph blocks first; they're the highest-leverage case. Not a 2.7 problem, but worth knowing the v2 runtime data-attribute contract will probably remove `data-graph-answer-key`.
7. **Mobile/touch authoring.** Teachers may want to build activities on iPads. Touch-drag in the NodeView is a real interaction model question. Probably good enough to inherit JSXGraph's default touch handling; revisit if author feedback says otherwise.

None of these affect the schema or the data-attribute contract for already-published activities, so they're safe to defer to implementation time.

## Pre-emptive cheap moves to make now

In the spirit of the strategy-dispatch decision already made for Phase 1:

- **Keep the `evaluateAnswer` strategy dispatch ready.** It already is — adding `'graph-line'` to the switch is a single case.
- **Structure the runtime init pass for extensibility.** Currently two element classes are wired up: blanks and section checkpoints. When implementing Stages 11–14, structure init so adding a third class — graph blocks — is registering an init handler in a small registry, not refactoring the init function. The registry pattern keeps that door open.
- **Don't extend `BlankResponse.answer` to non-string types speculatively.** The decision to use a parallel `graphResponses` map is captured here; don't pre-implement it in Stage 9a. Wait until the graph block forces the schema change so the v3 migration can be tested against real data.

None of these add work to Phase 1; they preserve the option to add graph blocks cleanly later.
