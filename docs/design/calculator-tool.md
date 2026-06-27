# Calculator tool — graphing-track design

**Status:** design captured, not implemented. Holds the shape decided in a 2026-06-19 conversation so whoever builds Phase 2.7 (probably future-me) has the rationale alongside the code. Companion to [`interactive-graph-block.md`](interactive-graph-block.md) — the two are **one track, two faces** (see below). When the track lands, the Zod definitions here migrate into the schema package as real exports and this doc moves to an `archive/` subdirectory.

See ROADMAP.md "Phase 2.7 — Graphing track" for the user-visible framing.

## One track, two faces

The platform needs two things that look like one thing:

1. **A calculator tool** — a teacher-configurable, Desmos-style calculator a student summons *while working*, like the calculator allowed on a digital SAT. Ungraded. A thinking aid.
2. **Interactive graph blocks** — a graded question type where the student plots an answer (a point, a line, a region) and it's scored against a tolerance answer key. This is the original Phase 2.7 design in `interactive-graph-block.md`.

They share almost all of their hard parts — coordinate planes, plotting, expression parsing, accessibility — so they are designed as **one graphing kit with two faces**, not two independent features. Neither face reimplements plotting or expression parsing. The calculator is the *general, open* surface; the graded block is the *constrained, scored* surface. Building the kit bottom-up means the calculator's early stages (which need the least machinery) build the foundation the graded block later drops onto.

## Why the calculator is a scaffold, not a question

Despite sharing tech with the graded block, the calculator's role in the architecture is the **reference panel's**, not the graph block's. It is a scaffold: it rides alongside the activity and contributes nothing to scoring.

| | `interactive_graph` block | Calculator **tool** |
|---|---|---|
| Block category | `question` | `scaffold` (reference-panel sibling) |
| Scored? | Yes — tolerance vs answer key | **Never** |
| Submission payload | New `graphResponses` map | **None** — produces no response |
| Answer key in HTML? | Yes (security ceiling applies) | **None exists** |
| `STORAGE_SCHEMA_VERSION` bump? | Yes (parallel response map) | **No** — see persistence below |
| Teacher config | Answer + tolerance | Feature allow/deny flags |

Consequence: the *platform integration* for the calculator is small (no schema-version bump, no submission shape, no `evaluateAnswer` strategy, no answer-key leak problem). **All the difficulty is inside the widget**, and the widget is, in effect, rebuilding a chunk of Desmos.

## Strategic posture: self-built (Path B)

The calculator is **built on JSXGraph, self-hosted** — Path B. The platform does not depend on a third party for a load-bearing math feature.

Embedding the real Desmos Calculator API stays a **district-funded escape hatch**: it's the right move only if a paying customer specifically wants real Desmos and is funding the dependency (the API isn't "free" in the way that matters — it ties the product's availability to Desmos's terms and goodwill, a cost that lands precisely at the Phase 4–5 paid tiers). Default is self-built; embed is opt-in and paid for.

**Legal posture — functional twin, visual stranger.** The goal is that students *feel at home* coming from Desmos. That comfort comes from **workflow** familiarity (an expression list, type-and-see graphing, sliders, a table-and-fit regression flow) — which is the non-protectable, functional layer. So the comfort is free and carries no IP risk. What stays clear of Desmos's protected expression: the **name** (never "Desmos" / "College Board" / "SAT" as branding), the **assets** (no copied icons/CSS/SVG/code), and the **skin** (own color identity, own icons, own micro-layout — not a pixel clone of their distinctive palette/typography as a recognizable whole). Be a functional twin; be a visual stranger. Before any commercial launch this should get an hour of a real IP attorney's time, but the principle is settled enough to design against now.

## The shared graphing kit

Layered, bottom-up. Layers 1–2 are shared by both faces; the shells (3a/3b) are thin.

| Layer | What it is | Shared? |
|---|---|---|
| **1. Expression** | MathLive field → LaTeX → compiled function (math.js or lighter). Validation, variable detection, error states. No DOM/graph. | ✅ Both |
| **2. Board** | JSXGraph board: axes, grid, theme via CSS vars, zoom/pan, plot a function, plot points, **keyboard / screen-reader narration**. | ✅ Both |
| **3a. Tool shell** | Expression *list* UI, sliders, data table, regression panel, the summon/float chrome, **restriction-flag gating**. | Calculator only |
| **3b. Question shell** | One constrained interaction (drag a handle), answer-key compare, tolerance, submission + checkpoint wiring. | Graded block only |

The graded block becomes "the kit, locked to one interaction, plus scoring." The calculator becomes "the kit, opened up, minus scoring, plus restriction flags." This is the concrete form of "the tool and the block share functionality."

## Lazy-load / on-click architecture

Reuses the second-esbuild-entry pattern from `interactive-graph-block.md`. That doc's `graph-widget.js` becomes a consumer of a shared **`graph-kit.js`** bundle (layers 1–2 + both shells), or the two are bundled together — decide at build time. The main runtime stays under its 20KB budget either way.

- **Graded blocks** dynamic-import on *presence* (`document.querySelector('[data-graph-block-id]')`), as today's design specifies.
- **The calculator** dynamic-imports on *click* of its summon button — not on page load, not on presence. A page where a calculator is *available* ships only a cheap button + an empty mount until a student actually opens the tool. After first open it's cached.

```typescript
// Emitted (cheap, always): a summon button + an empty mount, no kit bundle.
summonButton.addEventListener('click', async () => {
  try {
    const { mountCalculator } = await import('./graph-kit.js');
    mountCalculator(mountEl, config);   // config = the restriction flags
  } catch (err) {
    console.error('Calculator failed to load', err);
    // The rest of the page is untouched; the student loses only the optional tool.
  }
}, { once: true });
```

**Bundle weight is the real engineering risk** (named here so it isn't a surprise at the graphing stage). MathLive + JSXGraph + an evaluator is the heaviest payload the platform would ship. It's tolerable *because* it's lazy, on-click, and cached — and it fits the Chromebook performance budget on those terms. Mitigations: tree-shaken/custom builds, a lighter evaluator than full math.js (the spike below), and never loading it on pages without the tool.

**This is the feature that brings MathLive into published HTML.** CLAUDE.md currently gates MathLive out of published pages as a "Phase 2.5 decision." A scientific calculator *is* a MathLive input on a published page — so this feature is what crosses (and justifies) that line. The cost is contained by the on-click lazy load.

## Schema shape

The calculator is an **activity-level setting**, parallel to `referencePanel` — not a block. It travels in the wire format and is configured once per activity.

```typescript
// packages/schema/src/calculator.ts (FUTURE — graphing track)
import { z } from 'zod';

// v1 (scientific) restrictions — deliberately TINY. Shape-named, not Desmos-named.
// Permissive defaults: an enabled-but-unconfigured calculator is a full tool;
// teachers opt INTO restrictions, never out of capability.
const CalculatorRestrictions = z.object({
  mode: z.enum(['scientific', 'graphing']).default('graphing'), // capability ceiling
  allowTrig: z.boolean().default(true),
  allowLogExp: z.boolean().default(true),
  // --- ADDED additively as stages land (never renamed; all optional/defaulted): ---
  // stage 2: lockViewport, allowGraphing
  // stage 3: allowedRegressionModels: ('linear'|'quadratic'|'exponential')[]  (default: all)
  // stage 4: maxExpressions?: number
});

export const CalculatorTool = z.object({
  enabled: z.boolean().default(false),
  restrictions: CalculatorRestrictions.default({}),
});
export type CalculatorTool = z.infer<typeof CalculatorTool>;

// On ActivityDocument, parallel to referencePanel:
//   calculator?: CalculatorTool
```

Each later flag is an additive optional/defaulted field — no migration, no `schemaVersion` bump on `ActivityDocument` for additive scaffold config (consistent with how `referencePanel` and the print config grew). Start with the three v1 flags; resist designing the full College-Board-grade taxonomy up front (YAGNI).

## Data-attribute contract (renderer output)

Additive to the frozen contract. Scaffold, rendered once per activity (like the reference panel), outside any `.activity-section` so the scoring runtime never sees it.

```html
<div class="calculator-tool"
     data-block-category="scaffold"
     data-calculator-mode="scientific"
     data-calculator-config='{"allowTrig":true,"allowLogExp":true}'>
  <button class="calculator-summon" aria-haspopup="dialog" aria-expanded="false">
    Calculator
  </button>
  <div class="calculator-mount" hidden><!-- kit mounts the panel here on click --></div>
</div>
```

`data-calculator-config` is JSON, HTML-entity-escaped by the renderer, parsed once on the first summon, wrapped in try/catch with permissive defaults (a parse failure yields a full calculator, never a broken one).

## Teacher restrictions & the both-parties preview

The restriction flags are the **differentiator** — Desmos lets only College Board shape the tool per-deployment; here every classroom teacher can, per activity. The digital-SAT calculator is itself "Desmos with features turned off," so this is matching a real, known pattern, not inventing one.

Authoring (an activity-level control, like the reference-panel disclosure and the print config — *not* a block):

1. A toggle: "Allow a calculator on this activity."
2. When on: the restriction controls (mode ceiling, trig/log gates, later regression models, locked viewport, expression cap) **plus a live preview of the restricted tool**.
3. The preview runs the **same widget** the student gets, in the same restricted state — so the teacher *sees* exactly what they've allowed. "What the teacher sees is what the student gets." This is the reference-panel lesson (authors must see what students see) applied again.

Config scope is **per-activity in v1**. A per-section override (a no-calculator section, then a calculator section — the College Board test-section model) is a real classroom pattern but an additive later change, not a v1 requirement.

## Student-side UI

The College-Board feel is a **floating panel summoned by a button and movable over the work**. Reuse the drag-resize + floating-panel machinery just built for the reference panel.

Guardrail (from prior author feedback — the cancelled column drag-resize): **drag/resize is an enhancement, not the only affordance.** The panel must be fully usable parked at a sensible default position; dragging and resizing are bonuses layered on top, never prerequisites. The panel is a `role="dialog"`, focus-trapped while open, `Esc` to close, summon button reflects state via `aria-expanded`.

## Regression (the Texas Algebra I requirement)

Pulled forward to **stage 3** (ahead of the full expression list) because Algebra I leans on data + curve fitting. Built as a **focused "fit this data" workflow**, deliberately *not* Desmos's generic `y_1 ~ a x_1 + b` tilde regression:

> data table → pick a model (linear / quadratic / exponential) from a dropdown → see the equation, coefficients, and r² → the fit curve draws over the scatter.

This is easier than Desmos's generic regression *and* better for a 9th-grader (no model-expression authoring). It needs:

- **A data-table component** — students type (x, y) pairs. Reusable kit piece (a future graded "line of best fit" question and any later stats feature reuse it).
- **The board layer** — scatter the points, draw the fit curve.
- **A small least-squares engine** — linear (2-var), quadratic (3×3 normal-equations solve), exponential (log-linear fit `ln y = ln a + b·x`). All closed-form, all cheap, all pure JS. This is where the evaluator spike pays off.

Two "feel at home" details, both cheap if decided up front:

- **Match the TI/Desmos coefficient & r² conventions** so a student's numbers *agree* with the calculator next to them — in particular, report exponential r² on the **log-transformed** fit (what TI-84 and Desmos do). A different r² than their handheld breaks the "at home" feeling instantly.
- **Exponential requires y > 0** — surface a clear inline message on bad data rather than emitting NaN. It's the first edge a student hits.

Regression is also a natural restriction flag (`allowedRegressionModels`, default all three; empty = off) — a "by hand" lesson disables it; a data-analysis lab enables it. The digital-SAT calculator exposes exactly this gate.

Statistics **beyond** regression (mean / median / quartiles / one-variable stats) are a **later stage**, not stage 3.

## Accessibility

Inherits the kit's board-layer narration (the `interactive-graph-block.md` commitments: arrow-key handle movement, `aria-live` position announcements, `role="application"` canvas, high-contrast theming, 44×44px touch targets). Calculator-specific:

- The panel is a labelled, focus-trapped `role="dialog"`; `Esc` closes and returns focus to the summon button.
- MathLive input is screen-reader accessible by default; the on-screen keypad is real `<button>`s with labels, not divs.
- Regression results (equation, r²) are announced via an `aria-live` region when a fit is computed.

## Internal staging

| Stage | Slice | New machinery |
|---|---|---|
| 1 | **Scientific calculator** | MathLive + keypad + evaluator. No JSXGraph. Tool shell + restriction-flag plumbing proven end-to-end. |
| 2 | **Single-function graphing** | JSXGraph board layer + a11y narration. |
| 3 | **Data table + regression** (linear / quadratic / exponential) | Table component + least-squares engine. ← Algebra I requirement |
| 4 | **Multi-expression list** | N rows, sliders, points, color coding — the Desmos-defining surface. |
| 5 | **Graded interactions** (= `interactive-graph-block.md`) | Question shell on the mature kit: drag-to-answer + tolerance scoring + `graphResponses`. |
| 6 | **Further advanced** | Stats beyond regression, implicit/inequalities, parametric/polar. |

Don't ship it all at once; each stage is independently useful. Stage 1 alone replaces "students alt-tab to a calculator."

## Print behavior

A calculator can't print. On paper the panel is simply absent. Optional nicety (print is first-class here): the worksheet may print a one-line note of what was permitted — "Calculator: scientific functions only" — so the paper version communicates the same constraint. Low priority.

## Spike results & locked decisions (2026-06-21)

The track started with the bundle-weight spike the "does NOT decide" list called for. Sizes measured through esbuild (the production toolchain, `chrome90` target) against the repo's real MathLive 0.109.2 + Compute Engine 0.55.6, lazy-loaded on first calculator open:

| Stack | minified | gzip | brotli |
|---|---:|---:|---:|
| **MathLive input only** (the fixed floor) | 815 KiB | **219** | **180** |
| MathLive + hand-rolled evaluator | 817 KiB | 220 | 181 |
| MathLive + **math.js** (number-only subset) | 963 KiB | 262 | 215 |
| MathLive + Compute Engine | 1866 KiB | 502 | 403 |

Findings: **MathLive is a fixed ~219 KiB-gzip floor** paid whatever the evaluator (its math-field works for input with *no* engine — it looks for a global `ComputeEngine` and degrades gracefully if absent). The evaluator choice swings ~280 KiB gzip: Compute Engine *more than doubles* the payload; math.js-number adds only ~42 KiB; hand-rolled ~1 KiB. Compute Engine's only edge is "parses MathLive's native LaTeX, no glue" — but math.js and hand-rolled both consume MathLive's `ascii-math` string, so some normalization exists either way.

**Locked:**

1. **Evaluator → math.js (number-only modular build)**, behind a single `evaluate(expr)` seam. Best-practice/size balance: a maintained, tested parser with clean structured errors at +42 KiB gzip on the floor. Compute Engine stays a **drop-in escape hatch** behind that seam if the AsciiMath→math.js normalization proves leaky. (Number-only build only; Stage 3 regression hand-rolls least-squares as planned — the full math.js with matrices is not pulled in.)
2. **Delivery → shared, content-hashed kit on R2** under `shared/`, imported by every calculator activity, **brotli-served** (Cloudflare edge). Cached across activities; immutable version pinning via the content hash; the delivery URL is **not** part of the frozen contract, so it's migratable. MathLive fonts → **the version-matched jsDelivr CDN** (the Stage-1 build-hosting impl chose this over R2-hosted fonts: it matches the renderer's KaTeX-fonts pattern and is the one source that works identically in the editor preview *and* published pages without context-detection; sounds disabled).
3. **Schema field → SHIPPED 2026-06-21** (`CalculatorTool`/`CalculatorRestrictions` in `packages/schema/src/document.ts`, `calculator?` on `ActivityDocument`, `createCalculatorTool()` factory, 12 tests). `mode` enum carries `'scientific' | 'graphing'`, defaults `'scientific'` (graphing is opt-in per activity — and the lighter default, since graphing pulls JSXGraph). No `schemaVersion` bump (additive optional).
4. **Graphing library → JSXGraph, code-split (Stage 2, 2026-06-23).** A spike found JSXGraph is **~240 KB gz** (939 KiB min — 2× this doc's original "~120 KB"; it's a monolith, doesn't tree-shake). So it is NOT bundled into the kit: esbuild `splitting` puts it in its own chunk that the board layer (`board.ts`) is dynamic-imported behind, loaded only in graphing mode. Scientific-only calculators stay ~264 KB gz; graphing pulls +240 KB gz on demand. (Lighter alternatives were weighed — Mafs is React-only so it can't run in the vanilla kit; GeoGebra is AGPL + heavier; a custom plotter was the lean option but JSXGraph's maturity + the drag interactivity the graded block needs won, with the weight contained by the split.)

## What this design does NOT decide

1. ~~**Evaluator / regression-math library.**~~ **RESOLVED 2026-06-21 → math.js (number-only) behind an `evaluate()` seam; Compute Engine escape hatch. See "Spike results & locked decisions" above.** (Stage 3 regression still hand-rolls least-squares; the full math.js with matrices is not pulled in.)
2. ~~**`graph-kit.js` bundling.**~~ **RESOLVED 2026-06-23 → esbuild code-splitting:** one entry chunk (calculator + MathLive + math.js, ~264 KB gz) + a JSXGraph chunk (~240 KB gz, dynamic-imported only in graphing mode) + a tiny shared chunk. The entry references its chunks by relative URL (same-origin on R2); the manifest records only the entry. See "Locked" #4 above.
3. **Calculator state persistence.** Deferred. If added later, it lives in its **own** localStorage key, never the scored-state blob — so it can never trigger a `STORAGE_SCHEMA_VERSION` bump. Lean: add it when graphing lands and losing work actually stings.
4. **Per-section config override.** v1 is per-activity. Additive later if classrooms need a no-calculator section.
5. **Visual identity.** The own-color/own-icon design (the "visual stranger" half of the legal posture) is a design task, not specified here.
6. **Keypad layout.** Button set and arrangement for the scientific keypad — a UX-iteration item with real teachers.
7. **Exact restriction taxonomy beyond v1.** Flags grow additively per stage; the full set is intentionally not enumerated now.

None of these affect the activity-level schema field or the data-attribute contract incompatibly, so they're safe to defer to implementation.

## Pre-emptive cheap moves

- **Author the kit's expression (1) and board (2) layers as standalone modules** the graded block imports, rather than burying them inside the calculator shell. This is what makes "share functionality" real instead of aspirational.
- **Keep the init registry extensible** (already noted in `interactive-graph-block.md`) — the calculator's summon button is one more registered init handler, not a runtime refactor.
- **Don't bump `STORAGE_SCHEMA_VERSION` for calculator state.** Calculator persistence (if it ever lands) is its own storage key; the scored-state schema stays untouched.
- **Don't build regression as generic tilde regression.** The focused table→model→fit workflow is the committed shape; generic `~` regression is explicitly out of scope.
