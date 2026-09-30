# Y7 figures and charts — geometry figures in prompts, statistics charts

**Status:** ✅ RULED 2026-09-30 — D1–D12 accepted by the author as proposed
(all twelve recommendations, no amendments). ✅ **DESIGN-REVIEWED
2026-09-30** (`/plan-design-review`, author-run): §2 re-derived against the
code (P10; six corrections, none reopening a ruling), the ten §4 forks
plus seven new findings ruled — **all accepted as recommended** (§4). Two
D-rulings carry amendments, not reversals: D7's mechanism is stated (N5)
and D11 is split for charts (N3). ✅ **Curriculum side CONFIRMED the
authoring model** (their boundary page, 2026-09-30: five yes/no's all yes,
author-ruled) — disposition and the one ruling it produced (**N8**, the
automatic "Not to scale" caption) are at the end of §4. Nothing here is
built; next is the eng review.

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

## 2. Shipped reality (re-derived 2026-09-30 against `main` @ 700edd6 — P10)

The 2026-09-29/30 read was re-derived line by line before the design review.
Items marked ⚠ are CORRECTIONS or omissions that change a ruling's cost.

- **One static-SVG engine draws every static figure**: `renderGraphSvg`
  (`packages/graph-kit/src/static-svg/graph-svg.ts`), EAGER by ruling
  (DECISIONS.md → "The static-SVG engine is EAGER, and one renderer serves
  every figure", 2026-08-23). Confirmed: `packages/viewer/src/registry/bindings.ts`
  binds `graph_figure` with `loading: 'eager'`.
- ⚠ **But TWO renderers draw the `Drawable` union, not one.** The kit's
  JSXGraph board (`packages/graph-kit/src/board.ts`, the `case 'ray' |
  'segment' | 'polygon'` switch near line 1920) draws `interactive_graph`'s
  `display` drawables and the `show:` drawables that sit beside a graded
  answer. Every new drawable kind or annotation must be taught to BOTH, or an
  angle mark on a graded transformation item (D9) prints on paper and
  vanishes on screen. The first read named only the static engine.
- **Drawables** (`packages/schema/src/graph-primitives.ts`, the `Drawable`
  union): `point` (with `label`), `curve` (FunctionModel — a line is
  `family: 'linear'`), `expression` (NOT drawn statically), `segment`, `ray`,
  `polygon` (`filled`). A free `label` drawable was deliberately deferred
  (YAGNI note in that file) — this arc is the "when needed". ⚠ `curve` and
  `expression` already take `style: 'dashed'`; `segment` and `polygon` do
  not. ⚠ `polygon.filled` exists (engine fills at 0.18 opacity, the board at
  0.2), but the fence grammar's `region (x,y), …` ALWAYS emits `filled: true`
  (`parseShowDrawable`) — there is no fence spelling for an outline polygon.
- **Missing:** angle marks, right-angle marks, equal-length ticks, parallel
  arrows, side labels, free text, dashed segments, outline polygons (fence).
- **No plane-less mode.** `AxisConfig` has `showGrid` but no axes/ticks
  switch; `renderGridAndAxes` always draws axes where 0 is in the window and
  always draws tick labels (on the edge if no axis). The viewBox is a fixed
  `SIZE = 400` square with `px`/`py` scaled **independently** — angles
  distort whenever the window is not square. ⚠ The viewer's
  `.viewer-figure--unavailable` fallback is `aspect-ratio: 1 / 1`, and the
  print rows target `.viewer-figure > svg`, so "square" is assumed in two
  more places than the engine.
- **Where static figures can appear:** `graph_figure` is in the body `Block`
  union and in `DefinitionBlock`, but the importer creates one only inside
  ```reference and ```definitions (`parseContentLines`: an `axes:` line sets
  the window for the NEXT figure, consecutive `graph:` lines share one grid,
  default window `DEFAULT_CHOICE_AXIS` ±10). ⚠ **The editor cannot insert one
  in the body either**: `SlashMenu.ts` filters `referenceOnly` items because
  "the main editor doesn't register the node" (while `Columns.ts`'s content
  expression already lists `graphFigure`). D5's body-level figure needs the
  editor registration, not only the fence. ⚠ `graph_figure` has NO
  `sizingFields` — image, math, interactive_graph, number_line and data_plot
  all do. Choice figures (MC/matching) carry one drawable per choice. A
  prompt figure today means an `interactive_graph` in `display` mode — lazy,
  and question chrome.
- **Accessibility:** `GraphFigure` renders `role="img" aria-label="Graph
  figure"`; the engine's SVG is `aria-hidden`. No author text reaches a screen
  reader. Precedents for D11: `ImageBlock.alt` (schema default `''`, editors
  warn); `DataPlot` uses a fixed `aria-label="Chart"`.
- **Charts:** `data_plot` = dot plot / histogram / box plot, always computed
  from `data: number[]` on a `NumberLineConfig` axis. No categories, no line
  chart. ⚠ Its ON-SCREEN picture is a LAZY JSXGraph board
  (`data-plot-board.ts`); `renderDataPlotSvg` is its `display:none` PRINT
  TWIN (`printTwin.tsx`), not what the student sees. The static renderer's
  drawing helpers (`renderAxisAndTicks`, `renderHistogram`) are
  module-private — only `dotCounts` / `histogramBins` / `fiveNumberSummary`
  are exported — and its viewBox is 500×200 on a numeric axis. D7's "reuses
  `data_plot`'s SVG drawing helpers" therefore means the pattern and
  constants, not importable functions.
- **Graded geometry today:** `interactive_graph` has `plot_point`,
  `plot_function`, `plot_segment`, `plot_ray`, `shade_region`,
  `graph_inequality`, `transform_curve`. No polygon-drawing interaction.
  `plot_point` scores order-independent, consume-once matching
  (`graph-score.ts` ~40–64) with no labels on targets. A graded ```graph
  block already accepts `show:` display drawables beside its `answer:`, so
  "pre-image polygon + mirror line, plot the image vertices" is expressible
  TODAY minus the labels (bears on §4.10).
- ⚠ **Budget:** student shell **152.5 KiB gz** measured 2026-09-30
  (`node scripts/check-perf-budget.mjs` on the dist built 2026-09-28 at
  f389409) against the 158 cap (`scripts/perf-budgets.mjs`
  `SHELL_JS_GZ_KIB`) — **~5.5 KiB headroom, not ~15**. The glossary arc took
  it from 143.2 to 152.5, past the ~150 target the cap was rebased on. D10's
  +1–2 KiB fits; nothing else eager does.
- **Dark mode / print (bear on §4.4–4.5):** `viewer.css` re-points only
  `.viewer-figure > svg text` at `--vw-color-ink-muted`; grid and axes keep the
  engine's hex (dark axes measured 3.75:1). `tokens.css` defines
  `--gk-svg-grid/axis/label` with dark and print values. `data-plot-svg.ts`
  emits `--gk-board-*`, which the viewer never defines (print twin only).
  Screen cap `--vw-figure-cap-standalone: 20rem`; paper `min(100%, 3.25in)`.
  Print rows: `figure/capped` and `drawable-count {zero:false}` in
  `printExpectations.ts`; `tests/components/graph-figure.test.tsx` asserts
  the exact drawn count. The degenerate-axis refusal in TODOS is filed to
  "ride the next schema-changing slice" — this arc is that slice.
- **Authoring prompt:** `catalogueAuthoringPrompt.ts` COMPOSES
  `MARKDOWN_IMPORT_AI_PROMPT` verbatim plus catalogue-only rules; fence
  syntax is taught in `markdownImportPrompt.ts`. D12's "teach its syntax in
  `catalogueAuthoringPrompt.ts`" lands in `markdownImportPrompt.ts` + the
  format doc; the catalogue prompt regenerates from them.

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

## 4. Design-review rulings (2026-09-30 — every recommendation accepted)

Ruled in the plan-design-review against a rendered SVG prototype of the
annotation set, cuboid and charts (`~/.gstack/projects/ZanReed-activity-platform/designs/y7-figures-charts-20260930/prototype.html`)
and an independent design read (Claude subagent; Codex unavailable). Q-numbers
are §4's original forks; N-items are findings the review added. All
dimensions below are **viewBox units** (400 wide); marks are stroke 1.5
unless stated.

**Q1 — Label placement is AUTOMATIC; no author offsets.** Side label: edge
midpoint pushed **16** along the outward normal — sign from the polygon's
signed area, or away from the centroid of every named point when the edge
belongs to no polygon — **plus 8 more when the same edge carries ticks or
chevrons** (the prototype showed "6 cm" sitting on its own tick marks).
Vertex letters: **18** along the exterior-angle bisector (lone points: away
from the centroid). Angle arc radius **22**, second arc **27**, right-angle
square side **14**; the angle label sits on the interior bisector at **40**.
Equal-length ticks: **12** long, **5** apart, at the edge midpoint.
Parallel chevrons: **10**, at t = 0.5 of the edge, or t = 0.7 when ticks
share it. No collision solver in slice 1 — the escape hatch is the free
`text` line. Rejected: per-annotation `offset` fields (the field a drafting
model gets wrong on every figure) and author-placed-everything.

**Q2 — Annotations are STANDALONE, coordinate-based drawable kinds** in the
`Drawable` union: `angle_mark {at, from, to, label?, style: 'arc' | 'double'
| 'right', reflex?}`, `tick_mark {from, to, count: 1|2|3}`, `parallel_mark
{from, to, count: 1|2}`, `side_label {from, to, text}`, `text {at, text}`;
plus additive `style: 'dashed'` on `segment` and a fence spelling for an
outline polygon. One `case` per kind in EACH renderer (static engine + kit
board); the `data-drawables` count and the print `drawable-count` row count
marks unchanged. Rejected: `polygon.sideLabels[]`-style decorations (would
need a second copy for `segment`, and cannot annotate parallel lines).

**Q3 — Fence grammar: letters in the fence, coordinates in the schema.**

```
```figure
alt: Triangle ABC with AB = 8 cm, AC = 6 cm and angle A = 68°
point (0,0) "A"
point (8,0) "B"
point (2,5) "C"
polygon A B C
side AB "8 cm"
side AC "6 cm"
angle BAC 68°
angle ABC "x"
angle ACB right
ticks BC 2
parallel AB DC
segment A C dashed
text (4,-1.5) "base"
```
```

Rules: names resolve in a SECOND pass, in any order, and must be a
`point … "X"` in the same fence; plain `(x,y)` coordinates are accepted
anywhere a name is; `angle ABC` is the angle under 180° at B from BA to BC,
`reflex` selects the other; `right` draws the square only (never square +
arc); an angle's label is a degree value (`68°`), `right`, or a QUOTED
text label (`"x"`) — never bare text, so the parser has one text rule
fence-wide and `right`/`68°` can never be read as a label (confirmed to
the curriculum side 2026-09-30); `polygon A B C` is an OUTLINE (`filled: false`) — `region` keeps
today's filled meaning; **the whole fence is ONE figure and blank lines are
ignored** (the ```reference rule "a blank line ends the figure" must not
leak — the model would split every figure); a bad line warns and is
skipped, the figure survives (the reference-fence precedent). The importer
emits coordinates only, so `serialize.ts` and the round-trip are untouched.
Rejected: coordinates-only (the model mis-writes an angle's three
coordinates), a per-polygon mini-language.

**Q4 — Plane-less mode: viewBox width fixed at 400, height from the window's
aspect,** clamped between 1:3 and 3:1 (`SIZE` stays the width; `py` shares
`px`'s scale). `axes:` is OPTIONAL in ```figure: absent → auto-fit the
drawables' bounding box (marks included) + 12 % padding + a 24-unit label
margin; `plane: on` opts a figure back into grid + axes + tick labels (the
transformation case, which stays a coordinate task). No CSS changes:
`.viewer-figure > svg` keeps `width: 100%; height: auto`, the 20rem screen
cap and 3.25in print cap hold, `figure/capped` passes unchanged, and the
foldable's measure === print invariant holds because the height is
intrinsic. The `--unavailable` fallback takes the same computed aspect
instead of `1 / 1`. Rejected: letterboxing in 400×400 (prototype B1: half
the box empty; prints at half height).

**Q5 — Dark mode.** Marks (arcs, ticks, chevrons, right-angle squares,
dashed segments) take the colour of the drawable they annotate, so they read
as part of that shape. ALL label text (side, angle, vertex, free text) is
INK through a new engine token **`--gk-svg-ink`** (light `#1e293b`, dark
`#e2e8f0`, print black; added to `tokens.css` + `tokens.ts`) at **16** units
(side/angle/free) and **15** italic (vertex letters). Existing point labels
keep today's rendering in plane figures; in plane-less mode a labelled point
renders as a vertex letter. Chart chrome uses the viewer-defined `--gk-svg-*`
tokens, never `--gk-board-*` (which the viewer does not define); series
fills come from `DRAWABLE_PALETTE` keys. Rejected: all marks in INK (loses
"which shape" when two shapes share a figure).

**Q6 — Cuboid.** Cabinet oblique: 45°, depth × 0.5, receding upper-right.
Hidden edges dashed `6 4` at stroke 1.5, drawn by default (Y7 counts edges);
`hidden: off` omits them. Dimension labels OUTSIDE: length below the
front-bottom edge, height **left** of the front-left edge (prototype C1: the
right side collides with unit-cube lines), depth along the receding
bottom-right edge. Unit-cube lines on the three visible faces only; more
than 12 per dimension is refused with a warning. Faces filled at 0.12 in
the drawable colour. The cuboid's bounding box drives Q4's auto-fit. Fence:
`cuboid 4 2 3 cm units` — the unit word is optional (absent = unlabelled),
`units` draws the cube grid. Rejected: isometric 30° (harder to count
layers; not the NZ textbook default).

**Q7 — Chart block schema.**

```
```chart
type: bar | stacked | clustered | line
title: Books borrowed
xlabel: Day
ylabel: Number of books
categories: Mon, Tue, Wed, Thu, Fri
series: 12, 7, 15, 9, 4
series: Bus = 4, 6, 3, 5, 2
y: 0..20 step 5
```
```

`ChartBlock { id, type: 'chart', chart: 'bar' | 'stacked' | 'clustered' |
'line', title?, xLabel?, yLabel?, categories: string[], series: { name?,
values: number[], color?: DrawableColor }[], yMax?, yStep?, ...sizingFields }`.
Categories and series draw in authored order; a NAMED series produces a
legend; the baseline is ALWAYS zero (no truncated axes at Y7); the ceiling
defaults to the next 1/2/5 × 10ⁿ step above the max (stacked: the max
total) and `y:` overrides it; `line` = a time series on evenly spaced
categories with marked points (a real time scale is rejected — the model
would then write dates); `title:` is REQUIRED by the authoring prompt.
Reuses `data-plot-svg.ts`'s constants and axis pattern (500-wide viewBox,
`--gk-svg-*` chrome), not its private functions.

**Q8 — Editor, slice 1: source popover, no form.** Register `graphFigure`
in the MAIN editor (it is already in `Columns.ts`'s content expression;
`SlashMenu.ts` drops its `referenceOnly` filter), keep `GraphFigureView`'s
live preview, and add a "figure source" popover that holds the fence text
and re-runs the SAME importer parser on Done. Same for `chart`. Rejected: a
per-annotation form (weeks of UI for a surface Y7 authoring never touches —
catalogue activities are file-backed by rule) and no editor surface at all.

**Q9 — Orphan guards, per field, bound to RENDERED output**, each
mutation-tested once by reverting its wiring:
- each annotation kind → `tests/components/graph-figure.test.tsx` renders a
  fixture and asserts `[data-drawable="<kind>"]` count AND the mark's element
  count (arc `<path>`, tick `<line>`, chevron `<path>`, `<text>`);
- `plane: off` → no `<line>` inside the grid `<g>` and a non-square
  `viewBox`; `plane: on` → the grid is back;
- `alt` → `aria-label` equals it; absent → `"Graph figure"`;
- cuboid → exactly 3 dashed hidden edges (0 with `hidden: off`) and the
  unit-line count for `l × w × h`;
- chart `title` / `xLabel` / `yLabel` → each `<text>` present; series →
  `<pattern>` count = series − 1 and `<rect>` count = categories × series;
  the hidden table has one row per series and one header cell per category;
- sizing → the existing `.block-sized` path test extended to both blocks;
- the print `drawable-count` row's comment states that marks are counted.

**Q10 — Grading figures live INSIDE the `interactive_graph` as `show:`
drawables** — the ```graph fence already accepts them beside `answer:`, and
the student plots on the pre-image's own grid. Consequence: the JSXGraph
board learns all five annotation kinds in the SAME slice (one `case` each;
JSXGraph has arc/segment/text primitives) — the two-renderer lesson from the
convergence arc. No labelled targets: `plot_point` is order-independent, so
"plot A′B′C′" is graded as the SET of image points; letters appear
post-check on the answer-key drawables. Rejected: a `figure` block above the
graph (two grids; the eleven-year-old copies coordinates across).

**N1 — Grayscale print of chart series.** Series 2+ carry SVG hatch
patterns (diagonal, cross, dots) in ADDITION to colour; legend swatches
carry the pattern. Stacked/clustered bars in two blues print identical
otherwise, and paper is a first-class surface here.

**N2 — Failure states, all named.** Import: an unknown point name, a bad
annotation line, or a series whose length ≠ categories WARNS and skips that
line (the figure/chart survives). Degenerate geometry — coincident angle
points, a 0° or 180° angle, a zero-area polygon, a cuboid dimension ≤ 0,
more than 12 unit cubes per dimension, more than 12 categories or 4 series
— is REFUSED at import with a warning naming the line. `GraphFigure`'s
single `UNAVAILABLE_REASON` becomes the enum its comment promised
(`'degenerate-axis' | 'degenerate-figure'`). **The TODOS degenerate-axis
`refine` on `AxisConfig` rides this arc** (it was filed to "ride the next
schema-changing slice"; corpus check first per its own note).

**N3 — Chart accessibility (D11 amended for charts).** A chart auto-renders
a visually-hidden `<table>` from its own data (caption = title, header =
categories, one row per series) — zero authoring cost, always true. `alt:`
stays REQUIRED on ```figure and becomes OPTIONAL on ```chart (when present
it names the figure; the table is always there).

**N4 — Chart label overflow.** Category labels wrap at ~10 characters to at
most two lines; longer than 20 characters warns at import. Never rotated —
eleven-year-olds do not read 45° text. Values are formatted with a thin
space as the thousands separator.

**N5 — Chart rendering mechanism (D7 stated precisely).** `chart` binds
`loading: 'lazy'` in `bindings.ts` exactly as `data_plot` does; its
component renders the static SVG synchronously once its chunk loads, and
print rides the same lazy-block path `data_plot` already prints through.
`printExpectations.ts` gains a `chart` row (`figure` treatment +
`drawable-count`-style series count). Rejected: an eager static chart
renderer — +~2 KiB against ~1.5 KiB of headroom after D10.

**N6 — Sizing.** `sizingFields` (width fraction + align) are added to
`graph_figure` and `chart` — additive, no schema-version bump, the same
fields image / math / data_plot carry — so a wide plane-less figure or a
chart can take a column's full width while a small triangle stays at the
20rem cap.

**N7 — Alt-text enforcement.** `pnpm import:batch --strict` FAILS a
```figure without `alt:`; a non-strict run warns. The paste importer warns
only.

**Curriculum confirmation asked (2026-09-30).** The Q3/Q6/Q7 grammar is the
contract their drafting model writes to, so the model above was posted to
the boundary page for a yes/no per surface before code — chain by chain
against §1's needs. Their answer lands on their page; this doc records the
disposition when it arrives.

✅ **Disposition (their "Figure/chart primitive: authoring model" section,
2026-09-30, author-ruled).** All five yes: ∠ABC notation (`reflex` needed
at Y7), not-to-scale by default, `alt:`/`title:` required — with a
curriculum-side rule that `alt:` names an unknown as the figure does
("angle x"), never its value — the caps, and the v1 exclusions (where they
bite: dimension lines → area-volume composites use a dashed segment + free
text; solids → nets use images; "draw" items stay choose/read/complete
until the graded chart slice). Their one "gap", text labels on angles, was
already in Q3 (`angle ABC "x"`); the quoted-only rule above is the answer.
**Build order within the geometry slice follows their chains:**
triangles-polygons → parallel-lines → area-volume → transformations →
charts (T9–T13) → nets.

**N8 — Automatic "Not to scale" caption (author, 2026-09-30, on the
curriculum side's question).** Every plane-less figure renders a caption
**"Not to scale"** below the drawing, as NZ assessment figures do; a
`plane: on` figure never does. A fence line `to scale` opts one figure
out (`GraphFigureBlock.toScale: boolean`, default false, meaningful only
when plane-less). It is an HTML `<figcaption>` inside the `.viewer-figure`,
NOT SVG text: screen readers read it after the `alt:` name, it prints, and
it can never collide with Q1's automatic label placement. The drafting
model no longer writes it, so the prompt teaches `to scale` only (rare —
a true-size drawing). Guard (close-out Q1): a component test asserting
the caption's presence over a plane-less fixture, its absence under
`plane: on` and under `toScale: true`, mutation-tested by deleting the
render.

## 5. Consequences (updated by the review)

- **Two renderers per new kind.** Every annotation kind lands in
  `graph-svg.ts` AND `board.ts` in the same commit; the component test
  covers the first, a board test the second.
- **Editor registration** of `graphFigure` in the main editor (Q8) is part
  of the geometry slice, not a follow-up.
- **New token** `--gk-svg-ink` in `tokens.css` + `tokens.ts` (the tokens
  test enforces the pair); no hex in `viewer.css` (the styles test forbids
  it even inside selectors).
- **Schema changes** (`Drawable` union, `GraphFigureBlock.alt` + sizing +
  `plane`, `ChartBlock`, the `AxisConfig` refine) → `pnpm
  bundle:viewer-server` in the same commit, `SANITIZER_REV` bump if the
  sanitize spec moves, `get-activity` redeploy as a pending author action;
  and `pnpm bundle:grading-server` if `graph-score.ts` or the server walk
  learn anything (Q10 should not need it — scoring is unchanged).
- **Shell budget:** re-measure after the geometry slice (`node
  scripts/check-perf-budget.mjs`); D10's +1–2 KiB is the LAST eager
  addition this arc makes. The chart block is lazy (N5).
- **Print:** `printExpectations.ts` rows for `chart`; the `graph_figure`
  rows keep passing under Q4 (asserted by the existing print e2e over a
  plane-less fixture added to `scripts/graph-figure-test.md`).
- **Format + prompt:** `docs/markdown-import-format.md` gains the ```figure
  and ```chart sections; `markdownImportPrompt.ts` teaches both (with `alt:`
  required on figures and `title:` on charts); `pnpm prompt:catalogue`;
  boundary-page stamp refresh after the push — each arc, per D12.
- **TODOS:** the degenerate-axis refine closes here (N2); the "grid louder
  than data on dark" engine nit is unchanged and still filed.

## 6. NOT in scope (considered, deferred with reasons)

- **Dimension lines and arrowheads on segments** (D4) — nets and
  area-volume shapes are readable with side labels; add when a chain asks.
- **A collision solver for labels** — Q1's deterministic rules plus the
  free `text` line cover Y7 figures; a solver is a project of its own.
- **Per-annotation author offsets** — rejected in Q1 for the drafting
  model's sake; revisit only if teachers author figures by hand.
- **Labelled `plot_point` targets** — scoring is order-independent; a
  label cannot be matched to a point without changing the scorer.
- **Polygon-drag / "draw the shape" interactions** (D9) — until classroom
  use asks.
- **Prisms, pyramids as 3-D drawables** (D6) — images for now.
- **A real time scale for line charts** — evenly spaced categories only.
- **Isometric projection** — cabinet oblique is the textbook default.
- **Chart interactions** (D8 slice 2) — display first.
- **Rotated category labels** — wrap or warn instead (N4).

## 7. What already exists (reused, not rebuilt)

- `renderGraphSvg` and the `Plane` mapping (`graph-svg.ts`) — Q4 changes
  `SIZE`'s role and `py`'s scale, nothing else.
- `parseShowDrawable` + `parseContentLines` (`markdownToTiptap.ts`) — the
  ```figure fence reuses the show-spec grammar and adds the name pass.
- `GraphFigure.tsx` (eager, `role="img"`, unavailable fallback),
  `GraphFigureView.tsx` (live preview), `DrawableListEditor`.
- `board.ts`'s drawable switch — the second renderer.
- `data-plot-svg.ts`'s viewBox, margins and axis pattern; `printTwin.tsx`;
  `bindings.ts`'s lazy tier; `kitPreload.ts`.
- `sizingFields`, `ImageBlock.alt`, `DRAWABLE_PALETTE`,
  `--gk-svg-grid/axis/label` tokens, `figure/capped` +
  `drawable-count` print rows, `tests/components/graph-figure.test.tsx`.
- `answerKeyDrawables` (letters post-check, Q10); the ```graph fence's
  `show:` lines (Q10).

## Implementation Tasks
Synthesized from this review's findings. Each task derives from a specific
finding above. Run with Claude Code or Codex; checkbox as you ship.

**Geometry slice (D12 first)**

- [ ] **T1 (P1, human: ~1.5 d / CC: ~40 min)** — schema — the five annotation kinds + `segment.style` + `GraphFigureBlock.alt/plane/sizing/toScale` + the `AxisConfig` refine (corpus check first)
  - Surfaced by: Q2, Q4, N2, N6, N8, D11
  - Files: `packages/schema/src/graph-primitives.ts`, `blocks/graph-figure.ts`, `sizing.ts`; `pnpm bundle:viewer-server`
  - Verify: schema tests; `jsonb_path_exists` corpus query for bad windows before the refine lands
- [ ] **T2 (P1, human: ~2 d / CC: ~1 h)** — static engine — plane-less mode (Q4 viewBox/aspect/auto-fit), the five marks with Q1's placement numbers, INK labels via `--gk-svg-ink` (Q5), dashed segments
  - Surfaced by: Q1, Q4, Q5
  - Files: `packages/graph-kit/src/static-svg/graph-svg.ts`, `packages/viewer/src/tokens/tokens.{css,ts}`
  - Verify: `tests/components/graph-figure.test.tsx` per Q9, mutation-tested; `node scripts/check-perf-budget.mjs`
- [ ] **T3 (P1, human: ~1 d / CC: ~30 min)** — kit board — the same five kinds on the JSXGraph board (Q10)
  - Surfaced by: §2 two-renderer correction, Q10
  - Files: `packages/graph-kit/src/board.ts`
  - Verify: a board test counting created elements per kind; the ```graph fixture with `show:` marks renders them on screen
- [ ] **T4 (P1, human: ~2 d / CC: ~1 h)** — importer — the ```figure fence: name pass, Q3 grammar, `alt:` required under `--strict` (N7), N2 warnings, outline polygons, quoted-only angle labels, the `to scale` line (N8)
  - Surfaced by: Q3, N2, N7, N8
  - Files: `packages/app/src/lib/markdownToTiptap.ts`, `scripts/batch-import.mjs`
  - Verify: importer unit tests per line form + each N2 refusal; `pnpm --filter @activity/app test`
- [ ] **T5 (P1, human: ~1 d / CC: ~30 min)** — cuboid — `cuboid` drawable + fence line per Q6
  - Surfaced by: Q6, D6
  - Files: `graph-primitives.ts`, `graph-svg.ts`, `board.ts` (display-only case), `markdownToTiptap.ts`
  - Verify: 3 dashed hidden edges + unit-line count (Q9)
- [ ] **T6 (P1, human: ~1 d / CC: ~30 min)** — viewer — `alt` → `aria-label`, unavailable-reason enum, sizing on `graph_figure`, aspect on the fallback, the "Not to scale" `<figcaption>` (N8)
  - Surfaced by: D11, N2, N6, N8, Q4
  - Files: `packages/viewer/src/blocks/GraphFigure.tsx`, `viewer.css`
  - Verify: a11y lane; `figure/capped` row over a plane-less fixture
- [ ] **T7 (P1, human: ~1.5 d / CC: ~45 min)** — editor — register `graphFigure` in the main editor; source popover re-running the importer parser (Q8)
  - Surfaced by: §2 editor correction, Q8
  - Files: `packages/app/src/editor/extensions/{GraphFigure,SlashMenu}.ts`, `nodeViews/GraphFigureView.tsx`
  - Verify: editor e2e inserts a figure from the slash menu and round-trips the source
- [ ] **T8 (P1, human: ~0.5 d / CC: ~15 min)** — docs + prompt — format doc section, `markdownImportPrompt.ts`, `pnpm prompt:catalogue`, boundary stamp
  - Surfaced by: D12, §5
  - Verify: `catalogueAuthoringPrompt.test.ts`; stamp row refreshed after the push

**Chart slice (D12 second)**

- [ ] **T9 (P1, human: ~1 d / CC: ~30 min)** — schema — `ChartBlock` (Q7) + sizing (N6); registry row; sanitize strip list; `pnpm bundle:viewer-server`
- [ ] **T10 (P1, human: ~2 d / CC: ~1 h)** — static chart renderer — bar/stacked/clustered/line, nice-step ceiling, zero baseline, hatch patterns (N1), label wrap (N4), `--gk-svg-*` chrome (Q5)
  - Verify: Q9 chart guards, mutation-tested
- [ ] **T11 (P1, human: ~1 d / CC: ~30 min)** — viewer — lazy `chart` block (N5), hidden data table (N3), print row in `printExpectations.ts`
  - Verify: print e2e over a chart fixture; a11y lane
- [ ] **T12 (P1, human: ~1 d / CC: ~30 min)** — importer + editor + docs — ```chart fence (Q7, N2 series-length warning), source popover, format doc, prompt regeneration
- [ ] **T13 (P2, human: ~2 h / CC: ~10 min)** — TODOS — close the degenerate-axis entry by quoting T1's refine; leave the dark-grid nit

_No new tasks from Pass 4 (AI slop)._

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | not run (scope ruled by the author, D1–D12) |
| Outside Review | Claude subagent (native); Codex not installed | Independent 2nd opinion | 1 | unavailable (outside) / completed (native, single-model) | 6 findings, all folded into Q1–Q10, N2–N4 |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | not run |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR | score: 5/10 → 9/10, 17 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | not run |

Pass scores (before → after): Info Arch 5 → 9 · States 3 → 9 · Journey 5 → 9 · AI Slop 6 → 9 (OPERATE/READ surface; no slop patterns, vagueness only) · Design System 6 → 9 · Responsive/a11y 4 → 9. Pass 7: 17 resolved, 0 deferred. Overall 5/10 → 9/10 (lowest pass). Mockups: one rendered SVG prototype (not the AI designer — the surface is an SVG figure whose questions are geometric), approved by the rulings it evidenced.

**OUTSIDE COVERAGE:** provider codex — not installed on this host; phase design — native Claude subagent completed (single-model); its six findings were folded into the rulings. Missing outside coverage is recorded, not inferred clean.

**VERDICT:** DESIGN CLEARED (9/10, 0 unresolved). Eng review required before the geometry slice starts (recommended: `/plan-eng-review` over §4–§5 + the task list once the curriculum side confirms the authoring model).

NO UNRESOLVED DECISIONS
