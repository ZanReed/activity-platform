# Data-plot block (`data_plot`)

**Status:** 🟡 DESIGN — decisions in §3 await the author's yes/no per item before any code drop. No schema/renderer/kit/runtime touched yet.

A statistics-chart block: dot plots, histograms, and box plots, both as a **static stimulus** ("read this box plot") and as a **graded construction** ("build a dot plot of this data"). The stats counterpart to the `interactive_graph` (2-D functions) and `number_line` (1-D geometry) families — the third and last named block on the proven `block → kit → pure-scorer` template ([STATE](../../STATE.md) "next candidates"; taxonomy fixed 2026-07-10: stats charts are their OWN family, not forced under `interactive_graph`'s 2-D `AxisConfig`).

## 1. Why now, and why a separate family

- **The template is proven twice.** `interactive_graph` established the block→kit→pure-scorer shape; `number_line` re-ran it end to end with near-zero new architecture (schema block + discriminated `interaction` union + own config; lazy `@activity/graph-kit` widget; pure DOM-free scorer; parallel submission map; editor NodeView with a WYSIWYG author surface; print/no-JS SVG fallback; dashboard table). `data_plot` reuses every one of those seams a third time.
- **It's the missing statistics surface.** Everything graded today is text (blanks/MC/matching/ordering), a 2-D plane (`interactive_graph`), or a 1-D line (`number_line`). Statistics — a full strand of 6th–8th grade and Algebra I — lives on dot plots, histograms, and box plots, and none of the current blocks can render or grade them. Regression (the calculator's Data view) is the only stats touchpoint so far, and it's a calculator tool, not a graded block.
- **Separate family was already decided.** STATE's taxonomy note names `data_plot` (histogram/box/dot) as a SEPARATE block family alongside `number_line`, reusing this same template — NOT a `GraphInteraction` variant. This doc honors that: `data_plot` is a sibling block with its own interaction union.

## 2. The template it mirrors (real seams)

| Concern | `number_line` seam (closest sibling) | `data_plot` parallel |
|---|---|---|
| Block schema | `NumberLineBlock` + `NumberLineInteraction` union ([blocks/number-line.ts](../../packages/schema/src/blocks/number-line.ts)) | new `DataPlotBlock` + `DataPlotInteraction` union |
| Config | lean 1-D `NumberLineConfig` | new `DataPlotConfig` (axis/bins per chart type) — decision 5 |
| Interaction union | `plot_point`, `plot_interval` | `display`, `build_dotplot`, `build_histogram`, `build_boxplot` — decisions 1–2 |
| Block registration | Block union + `ColumnCellBlock` + `factories.ts` | same two unions + a factory |
| Widget | kit 1-D board + `mountNumberLineQuestion` (lazy JSXGraph) | new chart widget in the kit — decision 6 |
| Scorer (pure) | `scoreNumberLine` (values + endpoint styles) | new pure scorer (frequencies / five-number summary) — decision 8 |
| Runtime | `numberLineExt` bridge seam + kit `attachNumberLineRuntime`; `numberLines` storage map | new `dataPlotExt` seam + storage map — decision 2 |
| Submission map | `numberLineResponses` on `SubmissionResponses` ([submission.ts](../../packages/schema/src/submission.ts), wire v7) | new `dataPlotResponses` map — wire v7→v8 — decision 2 |
| Print / no-JS | `renderNumberLineSvg` fallback | new chart SVG renderer — decision 7 (also IS the display renderer) |
| Editor | `NumberLineView` NodeView + numeric list editor + serialize round-trip | parallel NodeView + a data-table editor |
| Dashboard | "Number line" table | "Data plot" table |
| Import | ```numberline``` fence (deferred follow-up) | ```dataplot``` fence — decision 9 (defer) |

## 3. Decisions needed (please yes/no or pick per item)

**Decision 1 — Slice-1 scope: which chart types, and display vs. build?**
`data_plot` has two orthogonal axes: the chart *type* (dot / histogram / box) and the *mode* (read a static one = `display`, or construct one = `build_*`). Reading charts is the more common classroom task (especially box plots, which students rarely hand-construct in early grades); constructing them is the graded-widget showcase. Slice-1 options:
- (a) `display` only (all three chart types renderable as static stimulus), no graded build yet — leanest; proves the stimulus + sibling-question composition path.
- (b) `display` (all three types) **and** `build_dotplot` (the simplest graded construction) — proves both the stimulus half AND the graded-widget path with one interaction; histogram + box builds are fast follows on the same seams.
- (c) All four (`display` + all three builds) in one slice — most complete, but three genuinely different widgets (stacked dots, draggable bar heights, five-handle box) in one drop is a big, riskier slice.
- **Recommendation: (b).** `display` is the highest-value / lowest-cost piece (renderer + a data structure, no scoring, no widget) and serves the dominant "read this chart → answer a numeric/MC question" task immediately via **display data_plot + sibling question block** (the same composition the retired "answer-surface-as-a-graph-field" seam was replaced with, author call 2026-07-10). `build_dotplot` then proves the graded path with the simplest interaction. Histogram/box builds slot in additively — the union is discriminated from day one so they're new members, no other block touched.

**Decision 2 — `display` as a first-class union member + response map / version bumps.**
- `display` is ungraded (a stimulus), so — exactly like `interactive_graph`'s `display` member ([interactive-graph.ts:214](../../packages/schema/src/blocks/interactive-graph.ts)) — it stays OUT of the response map and the score, pulls no problem number, and is emitted as `data-block-category="content"`. It's a *mode of the block*, not a separate family.
- The graded builds get their **own parallel map** `dataPlotResponses` on `SubmissionResponses` (standing rule, CLAUDE.md: a new response category never widens an existing map). That's a wire bump **v7→v8** (ingest accepts 3–8, migrates on read) + a `STORAGE_SCHEMA_VERSION` bump **8→9** (blob gains a `dataPlots` map).
- **Recommendation: display-in-union + own `dataPlotResponses` map + v7→v8 / storage 8→9.** The disciplined path, matching every prior question-type. Cost is the deploy-ordering dance already in CLAUDE.md: **redeploy `ingest-submission` BEFORE republishing** on the wire bump. (If slice 1 is display-ONLY per decision 1a, there's NO graded response yet → no wire/storage bump at all until the first build lands — a point in favor of 1a's leanness, against its lower delivered value.)

**Decision 3 — Authoring the answer key: enter raw data → compute the plot, or hand-author the target?**
A dot plot, histogram, and box plot are all deterministic functions of a dataset. So for build interactions the author could type the raw values once and the correct plot is *computed*, rather than hand-placing every dot / bar height / whisker.
- (a) Author enters `data: number[]`; the kit computes the correct dot plot / bin frequencies / five-number summary. One source of truth, less author error, and the same `data` renders as the source-value list the student reads.
- (b) Author hand-authors the target plot directly (place dots / set bar heights / drag whiskers in the author board), no raw dataset stored.
- **Recommendation: (a),** with the raw `data: number[]` on the block. It's the natural stats authoring story ("here's the data, students plot it"), it eliminates a class of author mistakes, and `display` mode uses the same `data` field to render a chart with no separate answer concept. The one wrinkle is box-plot method ambiguity → decision 4.

**Decision 4 — Box-plot five-number-summary method (only bites when `build_boxplot`/box `display` lands).**
Q1/Q3 depend on the quartile method (inclusive vs. exclusive median; "TI-84 1-Var Stats" vs. some textbooks differ by one data point on even-length sets). Since box builds are a fast-follow (decision 1b), this can be settled when they land, but flag the intent now:
- **Recommendation:** compute with ONE documented method — the **exclusive-median / TI-84 `1-Var Stats` convention**, matching the calculator kit's existing TI-84 regression conventions (consistency across the stats surface) — and apply a small tolerance so an adjacent-method answer still scores correct. Per-block method choice is a documented later lever, not slice 1. Decide for real at box-build time.

**Decision 5 — `DataPlotConfig` shape.**
Per-chart-type config, discriminated alongside the interaction (or a shared numeric-axis core + type extras). Proposed:
- Dot plot / box plot: a numeric axis `{ min, max, tickStep, minorTicksPerStep?, snapToTick }` — literally reuse `NumberLineConfig` (both live on a 1-D number line). Dots stack above their value; the box sits on the axis.
- Histogram: `{ min, max, binWidth }` (or explicit `binEdges: number[]` for unequal bins — recommend equal-width `binWidth` in slice 1, `binEdges` deferred) + a `maxFrequency` for the vertical scale (or auto from data).
- **Recommendation:** reuse `NumberLineConfig` verbatim for the dot/box axis (compounding reuse, identical tick/snap semantics), add a small `HistogramConfig` for bins. Equal-width bins + auto/`maxFrequency` y-scale in slice 1; `binEdges` (unequal bins) deferred YAGNI.

**Decision 6 — Widget: reuse the kit's JSXGraph board, or a dedicated light SVG chart widget (inside the kit)?**
Dot/histogram/box are *chart-like* (stacked marks, bars, box-and-whisker), not *graph-like* (draggable gliders on curves). JSXGraph can draw them, but the idiom fights it a little.
- (a) Draw them with JSXGraph primitives on the existing kit board — maximum machinery reuse (keyboard nav, restore, snap), some awkwardness bending a function-graph board into a bar chart.
- (b) A dedicated small SVG+pointer chart widget, but **housed inside `@activity/graph-kit`** so it still rides the one lazy kit (no new bundle, base runtime stays thin) — cleaner data-viz idiom, but re-implements keyboard/restore plumbing the JSXGraph path gets for free.
- **Recommendation: (b) — a dedicated SVG chart widget inside the kit.** Bars and box-and-whisker are enough unlike function graphs that forcing them onto JSXGraph is a maintenance tax, and the widget's static-SVG render doubles as the `display`/print renderer (decision 7) — one drawing routine, three consumers (interactive widget, display mode, print fallback). Keep it in the kit package so it's lazy and the base/graphs runtime bundles are untouched. Revisit (a) only if the keyboard/restore re-implementation proves heavier than expected.

**Decision 7 — Print / no-JS static SVG fallback in slice 1?**
- **Recommendation: YES — non-negotiable for this audience.** Stats worksheets are print-heavy, and `display` mode IS static rendering, so the chart-drawing routine must exist as pure SVG regardless. A `renderDataPlotSvg` (axis/ticks + dots/bars/box; answer-key variant fills in the correct plot for graded builds) is shared by display mode, the print path, and the widget's no-JS fallback. Not a follow-up.

**Decision 8 — Scoring model.**
- Dot plot / histogram: the answer is an integer **frequency per value / per bin**. Correct iff every frequency matches exactly (integers — no tolerance), scored **all-or-nothing per plot** (mirrors MC/matching set-equality).
- Box plot: five values (min, Q1, median, Q3, max), each matched within a line-unit **tolerance**, all-or-nothing per plot.
- **Recommendation: all-or-nothing per plot, exact integer match for frequencies, tolerance for box handles.** Partial credit (e.g., per-bin credit) is a documented later lever, not slice 1 — same stance `number_line` took (decision 6 there).

**Decision 9 — Markdown ```dataplot``` import in slice 1, or defer?**
- **Recommendation: defer.** Build the block + editor first; add the ```dataplot``` fence (+ Copy-AI prompt line + drift-guard test) as a fast follow once the authored shape is proven — the exact sequence `graph` and `numberline` followed.

## 4. Proposed slice plan (once decisions land)

Assuming the recommended answers (1b, 2 own-map + v7→v8 / storage 8→9, 3a compute-from-data, 4 TI-84 method deferred to box-build, 5 reuse `NumberLineConfig` + `HistogramConfig`, 6 dedicated SVG widget in the kit, 7 yes, 8 all-or-nothing, 9 defer):

1. **Schema** — `DataPlotBlock` + `DataPlotConfig` + `DataPlotInteraction` union (`display`, `build_dotplot`; box/histogram builds reserved as future members). `data: number[]` source field; answer computed from it. Register in the Block + `ColumnCellBlock` unions and `factories.ts`. New `DataPlotResponse` type + `dataPlotResponses` map (wire v7→v8, ingest accepts 3–8). `STORAGE_SCHEMA_VERSION` 8→9. Guard tests per the README add-a-block-type checklist (union parity, column-cell acceptance, dashboard index parity).
2. **Renderer** — block shell (prompt, focusable `role=application` chart for builds, aria-live; `role="img"` for display) + data-attrs threaded like `number_line`; `renderDataPlotSvg` (the shared static chart routine); screen + print CSS. `display` emitted `data-block-category="content"`, pulls no number.
3. **Kit** — `createDataPlotBoard` (dot-plot construction: click-above-value to add/remove a stacked dot; keyboard add/remove/move; snap to tick) + pure `scoreDataPlot` (frequency-map equality) + `mountDataPlotQuestion`/`mountDataPlotAuthor` entries that lazy-import the board + the shared SVG renderer. Browser-verify at a new `/dev/data-plot` harness.
4. **Runtime** — `dataPlotExt` bridge seam mirroring `numberLineExt` (walk `data-block-type="data_plot"`, mount/score/restore through the kit's `attachDataPlotRuntime`, fold into checkpoint + submit payload `dataPlotResponses`, persist in the `dataPlots` storage map; `display` never scored / never in the payload). `document.ts` variant scan triggers the graphs bundle on a data_plot page. Redeploy `ingest-submission` before republishing (wire bump).
5. **Editor** — `DataPlot` Tiptap node + `DataPlotView` reusing `mountDataPlotAuthor` + a **data-table editor** (type the raw values; live preview of the computed plot) + a type/mode picker (display vs. build dotplot) + serialize round-trip + slash-menu / Insert entry + column-cell content expr. Browser-verify at `/playground`.
6. **Dashboard** — `dataPlots` index map + a "Data plot" table (student's plotted distribution vs. the computed key).

Follow-ups (post-slice-1): `build_histogram` + `build_boxplot` (+ decision 4 method call), ```dataplot``` import fence, unequal-bin `binEdges`, per-bin partial credit, custom tick labels.

## 5. Cost / risk notes

- **Wire + storage bump** is the only "careful" part (deploy ordering — redeploy `ingest-submission` before republishing). Everything else is additive and touches no existing block. If slice 1 goes display-only (1a), even that disappears until the first build.
- **Bundle:** the widget rides the lazy kit, so the base/graphs runtime bundles are unaffected (keep the `dataPlotExt` *bridge* thin — init walk + score fold only, as `numberLineExt` does). The graphs variant is 41.2 KiB against a 40 KiB soft target / 60 KiB ceiling, so any bridge growth counts against that; the widget/SVG-renderer weight lands in the kit, not the runtime.
- **New concept count is low.** `NumberLineConfig`, the lazy-kit pattern, the bridge/`attach*` seam, the print-SVG approach, the WYSIWYG author board, and the parallel-map discipline all transfer. The genuinely new pieces are the SVG chart drawing routine (bars/box/stacked-dots) and the compute-key-from-data authoring model — both self-contained.
- **Biggest open judgment call** is decision 1's scope (how much lands in slice 1) and decision 6's widget approach (JSXGraph vs. dedicated SVG). Both are reversible and flagged.
