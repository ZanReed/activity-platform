# Y7 figures and charts — geometry figures in prompts, statistics charts

**Status:** ✅ RULED 2026-09-30 — D1–D12 accepted by the author as proposed
(all twelve recommendations, no amendments). ⏳ **Awaiting a full
plan-design-review** (author-run, separate session) before any code. Nothing
here is built.

**Why now.** Y7 is the first part of the curriculum builder's order (D38
bottom-up), and the curriculum's Y7 stubs (`proposals/y7-chain-stubs.md`, open
question 5, on the `proposals-y7-stubs-threads` branch — draft PR #4, not yet
ruled on their side) need figures in prompts in **7 of 19** chains. The
curriculum side calls this their "wish #3"; that number collides with this
repo's wishlist #3 (unit-bearing answers, shipped), so it is named here by what
it is.

## 1. What the Y7 chains need

| chain | needs in prompts |
|---|---|
| `chain.geom.triangles-polygons` | labelled triangles/polygons: side lengths, angle marks + values, equal-side ticks, right-angle marks |
| `chain.geom.parallel-lines` | lines cut by a transversal, parallel arrows, labelled angles |
| `chain.geom.transformations` | a shape and its image on a grid, mirror lines; students produce an image |
| `chain.geom.nets` | nets (flat polygons); prisms/pyramids for "which net folds into this" |
| `chain.measure.area-volume` | rectangles, triangles, composite shapes with dimensions; cuboids, unit-cube layers |
| `chain.stats.data-displays` | bar graphs (incl. stacked, clustered), dot plots, time-series — "read, draw and choose" |
| `chain.stats.summaries` | dot plots / small data sets (≤ 20 values, inline) |

Stub counts are the curriculum side's DRAFT; a chain may move before their
graph lands. The design must not depend on exact counts.

## 2. Shipped reality (verified 2026-09-29/30 — re-derive before building, P10)

- **One static-SVG engine draws every static figure**: `renderGraphSvg`
  (`packages/graph-kit/src/static-svg/graph-svg.ts`), EAGER by ruling
  (DECISIONS.md → "The static-SVG engine is EAGER, and one renderer serves
  every figure", 2026-08-23).
- **Drawables** (`packages/schema/src/graph-primitives.ts`, the `Drawable`
  union): `point` (with `label`), `curve` (FunctionModel — a line is
  `family: 'linear'`), `expression` (NOT drawn statically), `segment`, `ray`,
  `polygon` (`filled`). A free `label` drawable was deliberately deferred
  (YAGNI note in that file) — this arc is the "when needed".
- **Missing:** angle marks, right-angle marks, equal-length ticks, parallel
  arrows, side labels, free text, dashed segments.
- **No plane-less mode.** `AxisConfig` has `showGrid` but no axes/ticks
  switch; `renderGridAndAxes` always draws axes where 0 is in the window and
  always draws tick labels (on the edge if no axis). The viewBox is a fixed
  400×400 with x and y scaled **independently** — angles distort whenever the
  window is not square.
- **Where static figures can appear:** `graph_figure` is in the body `Block`
  union, but the importer creates one only inside ```reference and
  ```definitions (`axes:` + `graph:` lines). Choice figures (MC/matching)
  carry one drawable per choice. A prompt figure today means an
  `interactive_graph` in `display` mode — lazy, and question chrome.
- **Accessibility:** `GraphFigure` renders `role="img" aria-label="Graph
  figure"`; the engine's SVG is `aria-hidden`. No author text reaches a screen
  reader.
- **Charts:** `data_plot` = dot plot / histogram / box plot, always computed
  from `data: number[]` on a `NumberLineConfig` axis. No categories, no line
  chart. Its static renderer is `renderDataPlotSvg`; the block is LAZY.
- **Graded geometry today:** `interactive_graph` has `plot_point`,
  `plot_function`, `plot_segment`, `plot_ray`, `shade_region`,
  `graph_inequality`, `transform_curve`. No polygon-drawing interaction.
- **Budget:** student shell 143.2 KiB gz measured 2026-08-23 against a 158 cap
  (`scripts/perf-budgets.mjs` `SHELL_JS_GZ_KIB`) — ~15 KiB headroom.
  Re-measure; do not trust this number at build time.

## 3. Rulings (author, 2026-09-30)

**D1 — Two families, separate slices.** Geometry figures (engine extension)
and statistics charts (a block) share almost no code; one arc would serialize
them.

**D2 — Geometry extends `graph_figure` + `renderGraphSvg`; no new block.**
Shapes are placed by coordinates and labels are independent text, so a figure
may be "not to scale" (NZ textbook convention). Rejected: a
construction-by-measurements model (a geometry solver).

**D3 — A plane-less mode.** An `AxisConfig` switch that hides axes, tick
labels and grid, and in that mode only, locks x and y to ONE scale (true
angles). Existing figures keep their current rendering.

**D4 — The annotation set, exactly:** angle arc + label; right-angle square;
side label (placed outside the shape); equal-length ticks (1/2/3); parallel
arrows (single/double); free text label; dashed segment style. Deferred:
dimension lines, arrowheads on segments.

**D5 — A body-level ```figure fence** producing a `graph_figure` block, using
the same `axes:` / drawable line grammar the ```reference fence already
parses.

**D6 — One 3-D drawable: `cuboid`** (length, width, height, oblique
projection, optional unit-cube grid lines for "volume as layers"). Prisms and
pyramids use images for now; nets are flat polygons (D2 + D4).

**D7 — Charts are a NEW `chart` block**, not a `data_plot` extension: bar,
stacked bar, clustered bar, time-series line; data is category → value or
time → value. Reuses `data_plot`'s SVG drawing helpers; LAZY like
`data_plot`, so zero shell cost.

**D8 — Display first, graded drawing second.** Chart slice 1 is display-only.
Slice 2: "draw the bar graph" reuses `build_histogram`'s bar-height board
adapted to categories; "draw the time-series" is existing `plot_point`.

**D9 — Transformations are graded as "plot the image vertices"** with the
existing `plot_point` interaction. No polygon-drag interaction until
classroom use asks for one.

**D10 — Geometry annotations ride the EAGER engine** (expected +1–2 KiB gz;
measure, don't estimate), keeping the one-engine ruling intact.

**D11 — Figures carry author alt text.** An `alt:` fence line becomes the
figure's accessible name; the catalogue-authoring prompt requires it on every
figure (a labelled triangle is content, not decoration).

**D12 — Order: geometry (D2–D6, D9–D11) first, then charts (D7–D8).** Each
arc closes by teaching its syntax in `catalogueAuthoringPrompt.ts` →
`pnpm prompt:catalogue` → refresh the boundary-page stamp.

## 4. Questions for the design review (not yet decided)

These are the forks the rulings leave open; the review should settle them
before the implementation plan, not during it.

1. **Label placement.** Side labels "outside the shape" need the polygon's
   winding/centroid; angle labels need the bisector. How are collisions
   between labels (and with vertex labels) handled — auto, author offset, or
   both?
2. **Schema shape of the annotations.** Separate drawable kinds
   (`angle_mark`, `tick_mark`, …) that reference coordinates, or decorations
   hanging off `segment`/`polygon` (e.g. `polygon.sideLabels[]`,
   `polygon.angleMarks[]`)? The second is easier for a drafting model to write
   correctly; the first composes with parallel lines that are not polygons.
3. **Fence grammar.** Exact line syntax for each annotation — it is the
   contract the curriculum's drafting model writes to, so it must be
   unambiguous and round-trip through `serialize.ts`.
4. **Plane-less scale.** With one scale and a non-square window, is the SVG
   viewBox non-square (figure keeps its aspect) or letterboxed? Print sizing
   (`figure/standalone-capped`) and the foldable's measure === print
   invariant both care.
5. **Dark mode.** Chrome follows the theme, drawables keep authored colours
   (DECISIONS 2026-08-23). Where do annotation marks and label text fall?
6. **Cuboid projection.** Oblique angle/depth ratio, hidden edges dashed or
   omitted, where dimension labels sit, unit-cube grid density limits.
7. **Chart block schema** (D7): category order, stacked/clustered series
   shape, time axis (evenly spaced labels vs real time scale), y-axis range
   and step, legend.
8. **Editor authoring.** A plane-less figure and a chart both need an editor
   surface (at least a fence-equivalent form + live preview). How much for
   slice 1?
9. **Orphan guard (CLAUDE.md close-out Q1).** Every new schema field needs a
   guard bound to RENDERED output, mutation-tested. The review should name
   them per field.
10. **Grading figures in D9.** A "plot A′ B′ C′" item: does `plot_point`
    need labelled target points, and does the prompt figure (a `figure`
    block) sit above the `interactive_graph`, or inside it as display
    drawables?

## 5. Consequences already known

- Catalogue-authoring prompt regeneration at the end of each arc (standing
  constraint) and a boundary-page stamp refresh.
- `docs/markdown-import-format.md` gains the ```figure and chart fences.
- Viewer-server bundle: schema changes → `pnpm bundle:viewer-server`
  (+ `get-activity` redeploy flagged as an author action if the sanitize
  path changes).
- Print: new per-block print expectations for `chart`; `graph_figure`'s
  existing check covers plane-less figures only if the aspect question (§4.4)
  keeps it valid.
