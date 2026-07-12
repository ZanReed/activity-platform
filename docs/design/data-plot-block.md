# Data-plot block (`data_plot`)

**Status:** ✅ SHIPPED (code complete, all 6 slices, all green; pending the author's deploy train — see STATE). All §3 decisions resolved = the recommended answers (1b display + build_dotplot; 2 own `dataPlotResponses` map + wire v7→v8 + storage v8→v9; 3a compute the plot from `data`; 4 TI-84 exclusive-median for box display, per-block method deferred to box-build; 5 reuse `NumberLineConfig` + histogram extras; 6 dedicated SVG chart widget in the kit; 7 print/no-JS SVG yes; 8 all-or-nothing; 9 defer the ```dataplot``` fence). **Built + committed (6 slices):** schema + wire v8 + ingest 3–8 (`96e3da6`), static SVG renderer + print/no-JS (`96e3da6`), pure `scoreDotplot` + SVG dot-plot board + `mountDataPlotQuestion` (`ee9a5bc`, browser-verified at `/dev/data-plot`), the runtime bridge (`dataPlotExt` seam + `attachDataPlotRuntime` + storage v9 + wire v8 + variant scan; `e2f8a39`, browser-verified on a **bundle-rendered** page: display box plot + build→check→"1/1 correct"→reload-restore, zero console errors), the editor NodeView + data-table authoring + serialize round-trip (`39c26c6`, `/playground`-verified: live preview + mode switch), and the dashboard "Data plot" table (`bd26f19`). As-built deltas from the plan: **no author board** (a data_plot is authored by editing its dataset + a static preview, so there is no `mountDataPlotAuthor` — the plot is computed from `data`, decision 3a); **display is pure static SVG** (no kit hydration — dot/histogram/box are fully static-drawable, unlike graph `expression` drawables), so display data plots stay on the leaner base runtime and only a GRADED data_plot triggers the graphs variant. Follow-ups (§4) unchanged: `build_histogram` + `build_boxplot` (+ decision 4 method call), ```dataplot``` import fence, unequal-bin `binEdges`, per-bin partial credit.

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

---

# Follow-up design pass: graded histogram + box-plot builds

**Status:** 🟢 APPROVED — building (2026-07-12). All §B decisions = the recommended answers: 1a both builds (histogram → box), 2 NO wire/storage bump (additive union members), 3a draggable bar tops, **4 box-plot method LOCKED: TI-84 exclusive-median + `tolerance`**, 5 histogram marker / box `tolerance`, 6 all-or-nothing, 7 picker + preview (no author board), 8 per-variant dashboard formatting, 9 defer the ```dataplot``` fence. Extends the SHIPPED block above (slice 1: `display` + `build_dotplot`).

Slice 1 shipped `display` (all three chart types render statically) + graded `build_dotplot`. This pass adds the two remaining graded *constructions* so the block can grade a student building **any** of the three stats charts: **`build_histogram`** (set each bar's frequency) and **`build_boxplot`** (drag the five-number-summary handles). The static renderers already exist — `renderDataPlotSvg` draws all three charts, and `histogramBins` / `fiveNumberSummary` (TI-84 exclusive-median) already compute the keys — so this pass is mostly two new interactive widgets + their pure scorers, riding every seam slice 1 built.

## A. What's already in place (the seams these reuse)

| Concern | Already built (slice 1) | What this pass adds |
|---|---|---|
| Schema union | `DataPlotInteraction` = `display` \| `build_dotplot` | `build_histogram`, `build_boxplot` members (additive) |
| Config | `DataPlotConfig` has `binWidth` + `maxFrequency` already | reused as-is; box adds a per-interaction `tolerance` |
| Static draw | `renderDataPlotSvg(config, chart, values, uid)` draws dot/histogram/box | reused verbatim (the widgets' no-JS fallback + preview) |
| Key compute | `histogramBins`, `fiveNumberSummary` (renderer, pure) | mirror in the kit scorer (or share) |
| Response | `DataPlotResponse` = `build_dotplot` (`studentValues`) | `build_histogram` (`studentBins`), `build_boxplot` (`studentFive`) members |
| Widget | `createDataPlotBoard` (SVG dot builder) + `mountDataPlotQuestion` | a bar-height board + a 5-handle board; same mount entry branches on type |
| Runtime | `dataPlotExt` + `attachDataPlotRuntime`; `DataPlotBlockState.studentValues` | additive optional `studentBins?` / `studentFive?` on the state |
| Editor | `DataPlotView` Type picker (build_dotplot + display×3) | two more picker options; a five-number readout for box |
| Dashboard | `dataPlots` index + `formatDotValues` | `formatBins` / `formatFive` for the answer + student cells |

## B. Decisions needed (please yes/no or pick per item)

**Decision 1 — Scope: both builds this pass, or one at a time?**
- (a) Both `build_histogram` + `build_boxplot` in one pass (two sub-slices). Completes the stats-construction set; they share the schema/runtime/editor/dashboard seams and differ only in the widget + scorer.
- (b) Histogram first (closer to the dot-plot frequency model), box-plot as a later pass.
- **Recommendation: (a),** sequenced histogram → box. The shared plumbing is written once; only two widgets + two scorers are genuinely new, and doing them together keeps the editor picker / dashboard formatting changes to a single edit.

**Decision 2 — Version bumps: NONE (additive union members), unlike slice 1.**
Slice 1 introduced the `dataPlotResponses` map, which needed the v7→v8 wire bump. Adding *variants* to the existing `DataPlotResponse` union only WIDENS what's accepted — the exact pattern the graph block's `plot_ray`/`plot_segment` used ("v4-only members … adding union members ACCEPTS MORE — no stored row is invalidated and no version bump is needed", submission.ts). Likewise `DataPlotBlockState` gains OPTIONAL `studentBins?` / `studentFive?` fields — additive, so an older blob reads forward with them absent → **no `STORAGE_SCHEMA_VERSION` bump** either.
- **Recommendation: no wire bump, no storage bump.** Still a kit change + a widened ingest union, so the deploy is: upload the re-hashed kit → **redeploy `ingest-submission`** (now accepts the widened union) → redeploy `publish-activity` (pins the new kit) — same ordering discipline, just no schemaVersion number change. (Sanity floor: keep the `build_dotplot`-only shape a valid parse so already-published slice-1 pages keep submitting.)

**Decision 3 — Histogram widget interaction.**
The student sets each bin's frequency; the correct heights are `histogramBins(data, config)`.
- (a) **Draggable bar tops** — each bin is a column with a draggable top edge; drag up/down sets the integer frequency (snaps to whole dots of height). Keyboard: Tab to a bin, ↑/↓ change its height. Mirrors the dot-plot board's SVG+pointer model.
- (b) +/− steppers per bin (no drag).
- **Recommendation: (a).** "Build the histogram" is most direct as draggable bars; keyboard ↑/↓ keeps it accessible. Bars snap to integer frequencies (a histogram bar is a whole count), y-scale capped by `config.maxFrequency` (or auto). Bins come straight from `config.binWidth` over `[min,max]`.

**Decision 4 — Box-plot widget interaction + the quartile method (decision 4 from slice 1 now bites).**
The student drags five handles — min, Q1, median, Q3, max — along the axis; the box + whiskers redraw live. The correct answer is `fiveNumberSummary(data)`.
- **Handles:** five tick-snapping draggable markers, each **clamped between its neighbors** (min ≤ Q1 ≤ median ≤ Q3 ≤ max) so the box is always well-formed; keyboard ←/→ to nudge the active handle, Tab to cycle. The box (Q1–Q3) + median line + whiskers (min/Q1, Q3/max) reuse `renderDataPlotSvg`'s box drawing.
- **Method:** the computed key uses `fiveNumberSummary` = **TI-84 exclusive-median** (already implemented + tested). A per-interaction `tolerance` (line units, default = half a `tickStep`) absorbs the adjacent inclusive-median answer on even-length sets, so a student who used the other common method isn't marked wrong. Per-block method choice stays deferred (YAGNI).
- **Recommendation:** 5 clamped tick-snapping handles + a `tolerance`-scored key against `fiveNumberSummary`; all-or-nothing (all five within tolerance). This is the moment to lock the method — confirm **TI-84 exclusive-median + tolerance** rather than adding a method flag now.

**Decision 5 — Config + interaction shapes.**
- `DataPlotConfig` is unchanged — `binWidth` (histogram) and `maxFrequency` (bar/dot y-cap) already exist; the box uses the numeric axis already there.
- New interaction members: `build_histogram` is a **bare marker** (exact integer frequencies, like `build_dotplot`); `build_boxplot` carries a **`tolerance`** (line units, default `tickStep/2`).
- **Recommendation:** as above — histogram exact/no-tolerance, box-plot tolerance-bearing. The answer for both is still COMPUTED from `data` (no hand-authored key), consistent with decision 3a.

**Decision 6 — Scoring (confirm all-or-nothing).**
- Histogram: correct iff every bin's frequency matches exactly (integers); all-or-nothing.
- Box plot: correct iff all five values are within `tolerance`; all-or-nothing.
- **Recommendation: all-or-nothing both**, matching the block's stance. Per-bin / per-handle partial credit is a documented later lever (would ride the graph block's `earned`/`total` precedent if ever wanted).

**Decision 7 — Editor authoring (no new author board).**
Same compute-from-data model as `build_dotplot`: the author types the dataset, the preview shows the computed chart. The Type picker gains **"Build a histogram"** and **"Build a box plot"**. For box-plot, show a small **five-number-summary readout** under the preview so the author sees the target (min/Q1/median/Q3/max); histogram reuses the existing bin-width advanced control (shown when the chart is a histogram) + a `tolerance` field for box.
- **Recommendation: extend the picker + preview only.** No `mountDataPlotAuthor` (there still isn't one — authoring is dataset entry, as decided in slice 1's as-built delta).

**Decision 8 — Dashboard.**
The "Data plot" table's answer-key + student cells format per variant: histogram → the bin frequencies (`2, 3, 1, 0`); box-plot → the five-number summary (`min 2 · Q1 4 · med 5 · Q3 7 · max 8`).
- **Recommendation:** add `formatBins` / `formatFive`, branch the table cells on `resp.type` (the response is already a discriminated union, so this is a small switch).

**Decision 9 — ```dataplot``` markdown import** — still **defer** (out of scope; same as slice 1 decision 9).

## C. Proposed slice plan (once decisions land)

Assuming the recommended answers (1a both, 2 no version bump, 3a draggable bars, 4 clamped handles + TI-84/tolerance, 5 as above, 6 all-or-nothing, 7 picker+preview, 8 per-variant formatting, 9 defer):

1. **Schema + wire** — add `build_histogram` (marker) + `build_boxplot` (`tolerance`) to `DataPlotInteraction`; add `build_histogram` (`studentBins: number[]`) + `build_boxplot` (`studentFive`) to `DataPlotResponse`; widen `DataPlotBlockState` with optional `studentBins?` / `studentFive?`. NO version bumps. Ingest's `DataPlotResponse` parse widens (redeploy, no schemaVersion change). Guard/factory/round-trip tests.
2. **Kit** — pure `scoreHistogram(data, config, studentBins)` (exact bin-frequency equality) + `scoreBoxplot(data, tolerance, studentFive)` (each of five within tolerance vs `fiveNumberSummary`); a bar-height board + a 5-handle clamped board; `mountDataPlotQuestion` branches on `interactionType`. Extend `/dev/data-plot` with histogram + box scenarios; browser-verify.
3. **Runtime** — `attachDataPlotRuntime` / the `dataPlotExt` gather branch on the interaction type to read `studentBins` / `studentFive` into the response; scoring fold is unchanged (still one all-or-nothing unit each). Bundle regen. Browser-verify on a bundle-rendered page.
4. **Editor** — two Type-picker options + the box five-number readout + a `tolerance` field; serialize round-trip covers the new interactions.
5. **Dashboard** — `formatBins` / `formatFive`; per-variant table cells.

Deploy (author): re-hashed kit → `ingest-submission` (widened union) → `publish-activity`. No wire/storage bump, so no migration; already-published dot-plot pages are unaffected.

## D. Cost / risk notes

- **Cheaper than slice 1** — no version bumps, no new submission map, every non-widget seam already exists. The genuinely new code is two SVG widgets + two pure scorers (+ small editor/dashboard formatting).
- **Bundle:** both widgets ride the lazy kit (not the inline runtime), so base/graphs bundles barely move (the `dataPlotExt` bridge is untouched — it already handles the generic data_plot gather; only the response-building branch grows a little).
- **Box-plot method** is the one real judgment call (decision 4) — locking TI-84 exclusive-median + tolerance now avoids a later method-flag migration.
- **New concept count ≈ 0** — draggable-handle boards mirror the number-line board; bar-drag mirrors the dot board; both static renders already ship.

## 5. Cost / risk notes

- **Wire + storage bump** is the only "careful" part (deploy ordering — redeploy `ingest-submission` before republishing). Everything else is additive and touches no existing block. If slice 1 goes display-only (1a), even that disappears until the first build.
- **Bundle:** the widget rides the lazy kit, so the base/graphs runtime bundles are unaffected (keep the `dataPlotExt` *bridge* thin — init walk + score fold only, as `numberLineExt` does). The graphs variant is 41.2 KiB against a 40 KiB soft target / 60 KiB ceiling, so any bridge growth counts against that; the widget/SVG-renderer weight lands in the kit, not the runtime.
- **New concept count is low.** `NumberLineConfig`, the lazy-kit pattern, the bridge/`attach*` seam, the print-SVG approach, the WYSIWYG author board, and the parallel-map discipline all transfer. The genuinely new pieces are the SVG chart drawing routine (bars/box/stacked-dots) and the compute-key-from-data authoring model — both self-contained.
- **Biggest open judgment call** is decision 1's scope (how much lands in slice 1) and decision 6's widget approach (JSXGraph vs. dedicated SVG). Both are reversible and flagged.
