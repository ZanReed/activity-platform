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
automatic "Not to scale" caption) are at the end of §4. ✅ **ENG-REVIEWED
2026-10-03** (`/plan-eng-review`, geometry slice T1–T8 only): §8 holds
fifteen rulings **ER-1 to ER-15, all APPROVED by the author 2026-10-03
("yes to all")**, plus six factual corrections to §2, §5 and §7. No D-, Q- or N-ruling is
reopened; three have their MECHANISM corrected because the code contradicts
it (Q3's "serialize untouched", Q5's ink colour, N8's figcaption markup).
Geometry slice building from 2026-10-03.

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

## 8. Eng review (/plan-eng-review, 2026-10-03)

Target: this document, §4–§5 and tasks T1–T8 (the geometry slice). Charts
(T9–T13) were not reviewed. **ER-1 to ER-15 are APPROVED** — the author's
build brief of 2026-10-03: "My rulings on ER-1 to ER-15: yes to all". No row
was answered "no", so the task list below stands as written.

**What was read (at `main` @ 5c7d8bf).** `graph-primitives.ts`,
`blocks/graph-figure.ts`, `sizing.ts`; `static-svg/graph-svg.ts` whole;
`board.ts` 1786–1982; `GraphFigure.tsx`; `viewer.css` figure rules and the
print block; `tokens.css`; `registry.ts` and `printExpectations.ts`
(graph_figure rows); `markdownToTiptap.ts` (`parseContentLines`,
`parseShowDrawable`, `parseGraphFence`); `importFormatRegistry.ts`;
`capabilityFacts.ts`; `serialize.ts` (both graph-figure directions);
`editor/extensions/GraphFigure.ts`, `editorExtensions.ts`, `SlashMenu.ts`,
`drawableText.ts`, the `DrawableAttr` twin; `batch-import.mjs` exit
conditions; both server handlers; `swRegistration.ts`; TODOS (BUILD ORDER,
the degenerate-axis entry); the curriculum graph v0.17.2 capability list.

**Budget, re-measured 2026-10-03** (`node scripts/check-perf-budget.mjs`,
dist built 17:19 the same day): shell JS **152.5 / 158.0 KiB gz**, shell CSS
**14.7 / 15.0 KiB gz**. Same as the brief. CSS headroom is about 300 bytes
gz. The editor's CSS is a separate lazy file (`ImagePopoverHost-*.css`), so
only `viewer.css` and `tokens.css` additions count against the shell.

### Corrections of fact (no ruling needed)

| # | The doc says | The code says |
|---|---|---|
| C1 | §2: "the main editor doesn't register the node" | It does. `editorExtensions.ts:186-192` registers `GraphFigure` "so the main editor can REPRESENT one". Only the slash item is hidden (`slashMenuItems.ts:343` `referenceOnly: true`); the comment at `SlashMenu.ts:34-36` is stale. T7 is un-hiding plus the popover, not a registration. |
| C2 | §5: grading bundle only "if `graph-score.ts` or the server walk learn anything" | Both bundles carry the schema. `check-activity-handler.ts:406` and `get-activity-handler.ts:429` call `upgradeActivityDocument`, which runs `ActivityDocument.safeParse` (`upgrade.ts:101`). A `Drawable` union change drifts BOTH bundles (ER-6). |
| C3 | Q3: "`serialize.ts` and the round-trip are untouched" | True for drawables, false for block fields. `tiptapGraphFigureToActivity` (`serialize.ts:1169-1180`) copies `axis` and `drawables` only, and the batch importer itself goes through it (`batchImportPipeline.ts:26`). See ER-1. |
| C4 | §7: Q4 "changes `SIZE`'s role and `py`'s scale, nothing else" | `SIZE` is used as the HEIGHT at thirteen sites in `graph-svg.ts` (grid and axis lines 122–141, tick-label clamps 148 and 163, `insideBox` 230, `clipToBox` 242–245, vertical lines and shading 360–366, half-plane edge 373, ray extension 429, the clip rect 616). Each must become height-aware or a ray's arrowhead lands outside a wide figure. Folded into T2 with its own guard. |
| C5 | Q9: "the existing `.block-sized` path" | No such class. Sizing is applied by the container: `ViewerContainer.tsx:806` adds `viewer-block--sized` from `isSized(layout)` (`layoutStyles.ts:147`). T6 extends that path. |
| C6 | T3: "a board test counting created elements per kind" | No unit test in the repo loads JSXGraph (`packages/graph-kit/tests` has none; `createDisplayBoard` is untested outside e2e). See ER-5. |

### Step 0: scope challenge

The slice touches about 22 files across four packages, so the complexity
gate tripped. No feature is cut: every D-, Q- and N-ruling stays. Two files
are added that the task list did not name (a shared mark-geometry module,
ER-4; a figure-line parser function inside the importer, ER-11) and one task
(T8b, the pin bump, ER-14). Result: **scope accepted as-is.**

What already solves part of it: `renderGraphSvg` and its `Plane` map; the
`data-drawable` wrapper and `data-drawables` count; `sizingFields` and the
container's sized path; `.viewer-image__caption` (the caption's exact style
already exists); the polygon read-only row in `drawableText.ts:47-49`; the
`figure/standalone-capped` print row; the `FENCES` registry guard and the
capability-facts drift test.

### Decision ledger (State: APPROVED by the author 2026-10-03, "yes to all")

| ID | Ruling (approved 2026-10-03) | Finding it closes |
|---|---|---|
| ER-1 | **Block fields ride the editor node and the serializer.** `alt`, `plane`, `toScale`, `width`, `align` are added to the Tiptap `graphFigure` attrs (`GraphFigure.ts:48-79`) and to BOTH `serialize.ts` directions (`:1169-1180`, `:1575-1583`). Guard: a serialize round-trip test over a block carrying all five, plus Q9's rendered-output guards. | [P1] (10/10) Without this no figure ever has `alt` or `plane`, file-backed or not: the importer emits Tiptap JSON and the pipeline converts it through this function. Opening any activity in the editor and saving would also strip them. |
| ER-2 | **`plane` lives on `GraphFigureBlock`, not `AxisConfig`.** `plane: z.boolean().default(true)`; the ```figure fence writes `false` unless `plane: on`. `renderGraphSvg` takes it as an option. D3's "an `AxisConfig` switch" is amended in mechanism only. | [P1] (9/10) `AxisConfig` (`graph-primitives.ts:32-43`) is shared by `interactive_graph`, choice figures and the JSXGraph board. A switch there is an orphan on every surface but one. T1 already wrote `GraphFigureBlock.plane`; this makes D3 agree. |
| ER-3 | **Auto-fit runs at IMPORT.** The importer calls a pure `fitFigureWindow(drawables)` exported from `@activity/graph-kit/static-svg` (a node-safe subpath) and writes a concrete `axis`. The schema keeps `axis` required; the engine never guesses a window. A zero-span box (collinear points) is padded to a non-zero span. | [P2] (8/10) Q4 does not say where auto-fit runs. Render-time fitting would make `axis` optional (a schema change felt by four other consumers) and would put fitting code on both renderers. |
| ER-4 | **One shared mark-geometry module.** `packages/graph-kit/src/figure-marks.ts`, pure and DOM-free, turns a mark plus a px mapping into primitives (lines, paths, text anchors) using Q1's numbers. The static engine stringifies them; the board draws the same primitives. Unit-tested once. | [P2] (8/10) Q1's twelve placement numbers would otherwise be typed twice (`graph-svg.ts` and `board.ts`) and drift, which is the two-renderer lesson in a new form. Two proposed callers, both named. Alternative on the table: parallel implementations, the `display-arrows.ts` precedent. |
| ER-5 | **Board proof is an e2e row plus a roster scan.** T3's verify becomes (a) a Playwright row in the student lane over a ```graph fixture with `show:` marks, asserting on-screen elements per kind, and (b) a script test that reads the `Drawable` union's kind literals and fails if `board.ts` or `graph-svg.ts` lacks a `case` for one. | [P1] (9/10) `board.ts:1970-1971` is `default: break`, so a kind the board does not know draws nothing, silently. No JSXGraph unit harness exists (C6). |
| ER-6 | **T1 regenerates BOTH server bundles, and both functions deploy before the first figure is imported.** Pending author actions, in order: push, `pnpm deploy:get-activity`, `pnpm deploy:check`, then import. | [P1] (9/10) C2. A deployed function with the old schema fails `safeParse` on a new drawable kind, so the student's open (and every check on that activity) errors. CI also fails on grading-bundle drift. |
| ER-7 | **INK labels are set by inline `style`, not a `fill` attribute.** The engine emits `style="fill:var(--gk-svg-ink,#1e293b)"` on side, angle, vertex and free-text labels. Tick labels are unchanged. Zero CSS bytes. | [P1] (9/10) `viewer.css:634-637` sets `.viewer-figure > svg text { fill: var(--vw-color-ink-muted) }`, and a CSS rule beats a presentation attribute (that file's own comment says so). Q5's ink labels would render muted on every figure. |
| ER-8 | **The caption needs a wrapper.** Markup becomes `<figure class="viewer-figure-wrap">` holding `<div class="viewer-figure" role="img" aria-label={alt}>` (engine SVG, still a direct child) and `<figcaption class="viewer-image__caption">Not to scale</figcaption>`. Every existing `.viewer-figure > svg` selector, print row and test keeps matching. | [P1] (9/10) N8 puts a `<figcaption>` inside `.viewer-figure`, but that element carries `dangerouslySetInnerHTML` (`GraphFigure.tsx:107`), which cannot coexist with children, and `role="img"` (`:98`) makes its children presentational, so a screen reader would never reach the caption. |
| ER-9 | **Budget plan and stop lines.** Eager CSS added by this slice is the `--gk-svg-ink` token (four declarations) and one selector for the wrapper's margin. The caption reuses `.viewer-image__caption`; sizing and the non-square fallback use inline custom properties on the element (`--vw-figure-cap-standalone`, `aspect-ratio`), not new rules. T2, T6 and T5 each re-measure. Stop and bring it to the author if shell CSS would pass 15.0 KiB or shell JS would pass 156.5 KiB; no cap is raised inside this slice. | [P1] (8/10) About 300 bytes gz of CSS headroom. The engine is 3.3 KiB gz today and gains five marks, plane-less mode, the cuboid and the fit function, so D10's "+1–2 KiB" is a guess until measured. |
| ER-10 | **The source popover's text is GENERATED, never stored.** `formatFigureSource(block)` is the inverse of the fence parser (letters recovered from labelled points). Guard: `parse(format(block))` equals `block` over a fixture of every line form. No `source` field in the schema. In `DrawableListEditor` the new kinds show as read-only summary rows (the polygon precedent); the `DrawableAttr` twin (`InteractiveGraph.ts:163`) gains them. | [P2] (8/10) Q8 says the popover "holds the fence text" but the importer emits coordinates only, so there is no text to hold. Storing it would be a second copy of the truth. Alternative on the table: defer the popover to a triggered TODO and ship un-hide plus read-only rows only. |
| ER-11 | **New grammar gets its own parser, on two surfaces only.** A `parseFigureLine` plus the name pass serves the ```figure fence and the ```graph fence's `show:` lines (Q10). `parseShowDrawable`'s other callers (MC and matching `graph:` choices, ```reference and ```definitions `graph:` lines) keep today's grammar. | [P2] (8/10) `parseShowDrawable` strips the words `open`, `closed`, `dashed` and every quoted string from the whole line before reading it (`markdownToTiptap.ts:4297-4306`), which would eat a label such as "open box"; and a choice figure carries one drawable, so a name can never resolve there. |
| ER-12 | **Two failure rules.** (a) Inside ```graph, a bad annotation `show:` line warns and is skipped (N2); today's kinds keep failing the whole block (`:4551-4553`). (b) A ```figure fence with no valid drawable produces a warning and NO block, never the raw fence as plain text. | [P2] (7/10) A label typo should not turn a graded question into plain text, and an eleven-year-old should never see fence source. Prior learning applied: importer-degrade-paths-can-leak-answer-keys (9/10, 2026-08-21). |
| ER-13 | **Figure problems SKIP the file in every batch run, strict or not, through a typed channel.** *(Amended 2026-10-03, author; was "fail `--strict`".)* `ImportResult` gains `figureProblems: string[]` (missing `alt`, a refused or skipped figure line, a ```figure fence with no valid drawable). In `batch-import.mjs` a non-empty list puts the file in `skipped` with the problems as its error, the existing path that never writes the activity, names the file, and makes the run exit 1 with or without `--strict` (`:3172`). It is NOT the drift `refused` path, which `--force` overrides. The paste dialog keeps warning and still imports: a teacher sees the figure in the editor at once. No matching on warning text. | [P1] (9/10) N7 said `--strict` fails a figure without `alt`, but importer warnings go to `warned` (`batch-import.mjs:2445`) and are absent from both exit conditions. The amendment (curriculum C-33 Q1): in a geometry activity the marks ARE the answer (`ticks AC 1` skipped on a typo draws an isosceles triangle as scalene while the key says isosceles), and `--strict` is opt-in (`:2010`), so a strict-only failure let a non-strict run write that draft. A wrong question is a skip, not a warning. |
| ER-14 | **B14: yes, this slice changes `docs/capability-facts.json`.** A `figure` entry in `FENCES` turns `capabilityFacts.test.ts` red until `JOIN` gains `figure: { fence: 'figure', probe: { type: 'graph_figure' }, scoring: 'none' }`. That lands in T4's commit with `pnpm facts:capabilities`. New task **T8b**: after the author pushes and deploys, open the pin-bump PR on `ZanReed/curriculum` with a pre-merge notice (letter B-34) proposing the id `figure`; they write its prose. The `show:` annotation grammar on ```graph changes no derived field, so T3 and T5 trigger nothing. | [P1] (9/10) The curriculum graph (v0.17.2, 23 capabilities) has no figure entry, and their §9 lets them draft only with shipped capabilities, so figures are not authorable until the pin bump merges. |
| ER-15 | **No commit leaves a field unread.** T1, T2 and T6 land as ONE commit (schema, engine, viewer, serializer, guards). Execution order: T1+T2+T6, T4, T3, T5, T7, T8, T8b. The pin bump may go as soon as T4 is live; it does not wait for T7. | [P2] (8/10) Close-out question 1 and P1: a schema commit on its own is an orphan interval, and the curriculum side is drafting triangles-polygons now, which needs marks plus the fence and nothing else. |

Approval readiness: PASS. All fifteen rows approved (author, 2026-10-03, "yes to all").

### Section findings

**1. Architecture (7).** ER-1, ER-2, ER-3, ER-6, ER-8, ER-14, ER-15.
One realistic production failure per new path:

| Path | Failure | Covered by |
|---|---|---|
| import → document | block fields dropped in the serializer | ER-1 round-trip test |
| document → get-activity | old deployed schema rejects a new kind; open fails | ER-6 deploy order; marker grep after deploy |
| engine, plane-less | arrowhead or clip computed against a square box | C4 fixture: a ray in a 2:1 figure, tip inside the viewBox |
| board (`show:` marks) | kind unknown to the board draws nothing | ER-5 roster scan + e2e row |
| stale precached shell | old engine skips unknown kinds; a triangle with no labels | NOT covered here. It is build-order item 4 (SW stale-shell recovery), ruled "before any real student". Visible, not silent to a teacher previewing; flagged, not a critical gap while no real student exists. |

**2. Code quality (5).** ER-4, ER-7, ER-10, ER-11, ER-12.
**3. Tests (2 rulings, 23 gaps on unbuilt code).** ER-5, ER-13; C6.
**4. Performance (1).** ER-9. No query, memory or caching concern: the
engine is a synchronous string builder and auto-fit runs once at import.

### Coverage diagram (everything below is unbuilt; each GAP is a required test)

```
CODE PATHS                                              USER FLOWS
[+] schema (T1)                                         [+] Curriculum author: file → import → student
  ├── [GAP] 5 kinds + segment.style parse                 ├── [GAP] [→E2E] ```figure imports, renders,
  ├── [GAP] AxisConfig refine rejects xMin>=xMax          │        prints (print lane, plane-less fixture)
  └── [GAP] old documents still parse (REGRESSION)        ├── [GAP] a figure problem skips the file, strict or not (ER-13)
[+] serialize.ts (ER-1)                                   └── [GAP] --strict fails on a refused figure
  └── [GAP] round-trip of alt/plane/toScale/width/align [+] Student: graded transformation (Q10)
[+] figure-marks.ts (ER-4)                                └── [GAP] [→E2E] show: marks visible on the
  ├── [GAP] each mark: Q1 numbers, both polygon windings           board (student lane, ER-5)
  ├── [GAP] side label +8 when ticks share the edge     [+] Teacher: editor
  └── [GAP] reflex / right / coincident-point refusal     ├── [GAP] [→E2E] slash-insert a figure, edit
[+] graph-svg.ts (T2)                                     │        source, Done, reload: same figure
  ├── [GAP] Q9 per-kind element counts (mutation-tested)  └── [GAP] open + save keeps alt/plane (ER-1)
  ├── [GAP] plane off: no grid lines, non-square viewBox[+] Error states
  ├── [GAP] plane on: byte-identical to today (REGRESSION)├── [GAP] unknown point name: line skipped, warned
  ├── [GAP] ray arrow inside a 2:1 viewBox (C4)           ├── [GAP] empty figure fence: no block (ER-12b)
  └── [GAP] label text carries the ink style (ER-7)       └── [★★ TESTED] degenerate axis shows "Figure
[+] GraphFigure.tsx (T6)                                           unavailable" — graph-figure.test.tsx:126
  ├── [GAP] alt → aria-label; absent → "Graph figure"
  ├── [GAP] caption present / absent ×3 (N8), mutation-tested
  ├── [★★★ TESTED] svg is a direct child, capped — figure/standalone-capped
  └── [GAP] unavailable reason enum, both values
[+] board.ts (T3) ── [GAP] roster scan (ER-5b)
[+] importer (T4)
  ├── [GAP] every Q3 line form; names in any order
  ├── [GAP] each N2 refusal names its line
  ├── [GAP] fitFigureWindow: padding, label margin, zero-span (ER-3)
  └── [GAP] FENCES guard + capabilityFacts drift (ER-14)

COVERAGE: 2/25 paths tested (8%)  |  Code paths: 1/18  |  User flows: 1/7
QUALITY: ★★★:1 ★★:1  |  GAPS: 23 (3 E2E, 0 eval)
```

Legend: ★★★ behavior + edge + error | ★★ happy path | [→E2E] needs a browser lane.

**Regression rule.** Two existing behaviors are at risk and both get a
named test: a `plane: on` figure must render byte-identically to today
(every reference-panel figure and choice figure in the catalogue), and
every stored document must still parse after the `AxisConfig` refine (the
TODOS corpus query runs first; a hit blocks the refine, not the slice).

**No LLM eval is owed by T1–T7.** T8 changes `markdownImportPrompt.ts`; the
existing prompt guards (`FENCES` examples import cleanly, the catalogue
prompt drift test) cover it. A drafting-quality eval of the ```figure
grammar is the curriculum side's first authored chain, which is the plan.

### Added to "NOT in scope"

- **Seeded values in figure labels** (`side AB "{a} cm"`): not designed and
  not checked against `substitute.ts`. Y7 geometry does not seed.
- **Annotation grammar in choice figures and the reference panel** (ER-11):
  one drawable per choice cannot carry names.
- **A JSXGraph unit harness** (ER-5): the e2e row and the roster scan are
  the proof; a harness is a project of its own.
- **Stale-shell rendering of new kinds**: build-order item 4.

### Parallelization

Sequential implementation, no parallelization opportunity. T4, T3 and T7
touch disjoint modules after the first commit, but every session shares this
one checkout (CLAUDE.md, Division of labor), and T5 touches all of them.

### Outside voice

Unavailable. Codex is not installed on this host, and the native fallback
needs a bounded-wait tool this session does not have. No second opinion was
taken; that is missing coverage, not a clean pass.

### Completion summary

- Step 0: Scope Challenge: scope accepted as-is
- Architecture Review: 7 issues found
- Code Quality Review: 5 issues found
- Test Review: diagram produced, 23 gaps identified (all on unbuilt code)
- Performance Review: 1 issue found
- NOT in scope: written (§6 plus four additions above)
- What already exists: written (§7 plus Step 0 above)
- TODOS.md updates: 0 items proposed (the status line for this arc was refreshed)
- Failure modes: 0 critical gaps flagged
- Unresolved decisions: 0 (ER-1 to ER-15 approved by the author 2026-10-03)
- Outside voice: codex, unavailable (not installed; native fallback unavailable)
- Parallelization: 1 lane, 0 parallel / 1 sequential
- Lake Score: N/A (no coverage choice has been answered yet)

## Implementation Tasks
Synthesized from the design review and the eng review (§8). Each task
derives from a specific finding. **The geometry list below is the eng
review's list, APPROVED 2026-10-03** (ER-1 to ER-15, "yes to all"; no line reverted).
Run with Claude Code or Codex; checkbox as you ship.

**Geometry slice (D12 first). Execution order (ER-15): T1+T2+T6 as one
commit, then T4, T3, T5, T7, T7b, T8, T8b.**

- [x] **T1 (P1, human: ~2 d / CC: ~1 h)** — schema + serializer — the five annotation kinds, `segment.style`, `GraphFigureBlock.alt / plane / toScale` + sizing, the `AxisConfig` refine; the same fields on the Tiptap node and through both `serialize.ts` directions (ER-1); `plane` on the block (ER-2); the `DrawableAttr` twin
  - Surfaced by: Q2, Q4, N2, N6, N8, D11; ER-1, ER-2, ER-6, C3
  - Files: `packages/schema/src/graph-primitives.ts`, `blocks/graph-figure.ts`; `packages/app/src/lib/serialize.ts`, `editor/extensions/{GraphFigure,InteractiveGraph}.ts`; the axis NumCells' inline error and the importer's `axes:` warning (the TODOS entry's other two parts); `pnpm bundle:viewer-server` AND `pnpm bundle:grading-server` (ER-6)
  - Verify: schema tests incl. "old documents still parse"; the serialize round-trip test; the `jsonb_path_exists` corpus query for bad windows BEFORE the refine lands (a hit blocks the refine, not the slice)
- [x] **T2 (P1, human: ~2.5 d / CC: ~1.5 h)** — static engine — `figure-marks.ts` (ER-4) with Q1's numbers; plane-less mode (Q4) with every `SIZE`-as-height site made height-aware (C4); INK labels by inline style (ER-7); dashed segments; `fitFigureWindow` exported from the `static-svg` subpath (ER-3)
  - Surfaced by: Q1, Q4, Q5; ER-3, ER-4, ER-7, C4
  - Files: `packages/graph-kit/src/figure-marks.ts` (new), `static-svg/graph-svg.ts`, `static-svg.ts`; `packages/viewer/src/tokens/tokens.{css,ts}` (`--gk-svg-ink`)
  - Verify: unit tests on `figure-marks.ts`; `tests/components/graph-figure.test.tsx` per Q9, mutation-tested; `plane: on` output byte-identical to today; a ray's arrow inside a 2:1 viewBox; `node scripts/check-perf-budget.mjs` against ER-9's stop lines
- [x] **T6 (P1, human: ~1 d / CC: ~30 min)** — viewer — wrapper markup with a real `<figcaption>` (ER-8), `alt` → `aria-label`, the unavailable-reason enum, sizing through the container's `viewer-block--sized` path with an inline cap override (C5, ER-9), aspect on the fallback
  - Surfaced by: D11, N2, N6, N8, Q4; ER-8, ER-9, C5
  - Files: `packages/viewer/src/blocks/GraphFigure.tsx`, `container/layoutStyles.ts`, `styles/viewer.css` (one selector)
  - Verify: caption present / absent ×3, mutation-tested; a11y lane; `figure/standalone-capped` over a plane-less fixture added to `scripts/graph-figure-test.md`; budget re-measure
- [x] **T4 (P1, human: ~2.5 d / CC: ~1.5 h)** — importer — the ```figure fence: `parseFigureLine` + name pass (ER-11), Q3 grammar, import-time fit (ER-3), `alt:`, `to scale`, N2 refusals, the two failure rules (ER-12), `figureProblems` skip the file in every batch run (ER-13, amended); the `FENCES` entry, the `JOIN` entry and `pnpm facts:capabilities` (ER-14)
  - Surfaced by: Q3, N2, N7, N8; ER-3, ER-11, ER-12, ER-13, ER-14
  - Files: `packages/app/src/lib/markdownToTiptap.ts`, `importFormatRegistry.ts`, `capabilityFacts.ts`, `docs/capability-facts.json`, `scripts/batch-import.mjs`
  - Verify: importer unit tests per line form and per refusal; a strict dry run that FAILS on a figure without `alt`; `capabilityFacts.test.ts` green; `pnpm --filter @activity/app test`
  - Pending author actions after this lands (ER-6): push, `pnpm deploy:get-activity`, `pnpm deploy:check`, and only then import a figure
  - As built: the parser is its own module, `packages/app/src/lib/figureFence.ts` (T3 and T7 reuse it). The fence-registry guard requires every fence to be taught in `markdownImportPrompt.ts` AND `docs/markdown-import-format.md` in the same commit, so T8's prompt + format-doc teaching landed here (P10), with `pnpm prompt:catalogue`. Curriculum B-36 fixed three parser behaviours, all within Q3: `side GH "7 cm"`; a bare `angle ABC` draws the arc alone; `angle ABC ""` is refused; `to scale` drops only the caption. Their activity 01 (eleven figures) imports with zero problems.
- [ ] **T3 (P1, human: ~1.5 d / CC: ~45 min)** — kit board — the five kinds on the JSXGraph board from the same `figure-marks.ts` primitives (Q10, ER-4); `show:` lines in ```graph take the figure grammar (ER-11) and skip-with-warning on a bad annotation (ER-12a)
  - Surfaced by: §2 two-renderer correction, Q10; ER-4, ER-5, ER-11, ER-12
  - Files: `packages/graph-kit/src/board.ts`, `packages/app/src/lib/markdownToTiptap.ts`, `scripts/tests/` (the roster scan)
  - Verify: the roster scan (every `Drawable` kind has a `case` in both renderers); a student-lane e2e row over a ```graph fixture with `show:` marks (ER-5)
- [ ] **T5 (P1, human: ~1.5 d / CC: ~45 min)** — cuboid — `cuboid` drawable + fence line per Q6, in both renderers; both bundles again (ER-6)
  - Surfaced by: Q6, D6
  - Files: `graph-primitives.ts`, `figure-marks.ts`, `graph-svg.ts`, `board.ts`, `markdownToTiptap.ts`
  - Verify: 3 dashed hidden edges + unit-line count (Q9); the roster scan stays green; budget re-measure (the last eager addition, ER-9)
- [ ] **T7 (P1, human: ~2 d / CC: ~1 h)** — editor — un-hide the slash item (C1); the source popover over `formatFigureSource` (ER-10); read-only rows for the new kinds
  - Surfaced by: Q8; ER-10, C1
  - Files: `packages/app/src/editor/slashMenuItems.ts`, `extensions/SlashMenu.ts` (stale comment), `nodeViews/GraphFigureView.tsx`, `components/{DrawableListEditor.tsx,drawableText.ts}`, `lib/figureSource.ts` (new)
  - Verify: `parse(format(block))` equals `block` over every line form; editor e2e inserts a figure from the slash menu and round-trips the source
- [ ] **T7b (P1, human: ~0.5 d / CC: ~1 h)** — a figure INSIDE a ```columns segment (author, 2026-10-03, pulled into this slice from the curriculum C-35 wish) — a column segment whose first line is `figure:` is read whole by `figureFence.ts` and becomes that column's graph_figure: its own `alt:`, caption, problem checks and the ER-13 skip. No nested fences: the AI already wraps its whole reply in a ``` block, so a third fence level is the failure mode. Closes "a file-authored activity cannot put a figure beside its question" (the layout, viewer, print and editor already support it; only the import syntax was missing). Syntax confirmed with the curriculum side before build (joint contract)
  - Surfaced by: curriculum C-35; author ruling 2026-10-03
  - Files: `packages/app/src/lib/markdownToTiptap.ts` (`parseColumnsFence`), `markdownImportPrompt.ts`, `docs/markdown-import-format.md`, `pnpm prompt:catalogue`
  - Verify: importer tests (figure segment beside a text segment; empty or bad figure segment; problems reach `figureProblems`); a batch-import row; the print lane over a half-width figure-beside-question row
  - NOT in it: the narrow-column label scale for 3–4 small figures per row (stays on its TODOS trigger, the transformations chain), and choice letters A–D
- [ ] **T8 (P1, human: ~0.5 d / CC: ~15 min)** — docs + prompt — format doc section, `markdownImportPrompt.ts`, `pnpm prompt:catalogue`, boundary stamp *(the ```figure teaching landed in T4, forced by the fence-registry guard; T8 is now the stamp refresh after the push, plus the `show:`/cuboid lines T3 and T5 add)*
  - Surfaced by: D12, §5
  - Verify: `catalogueAuthoringPrompt.test.ts`; stamp row refreshed after the push
- [ ] **T8b (P1, human: ~1 h / CC: ~15 min)** — pin bump (ER-14) — after the author has pushed T4 and deployed both functions: open the pin-bump PR on `ZanReed/curriculum` (re-copy `capability-facts.json`, new commit + sha256, the graph's derived fields for `figure`, graph version bump, regenerated registries) and send the pre-merge notice as the next B-letter (B-34 went to other business; the id was asked in B-38)
  - Surfaced by: the B14 standing rule (CLAUDE.md → Standing constraints)
  - Verify: their capability check green on the PR; their `capability-drift.yml` green after merge

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
| Outside Review | codex (not installed); native Claude subagent | Independent 2nd opinion | 2 | design phase 2026-09-30: unavailable (outside) / completed (native, single-model). Eng phase 2026-10-03: unavailable, no reviewer ran | design: 6 findings, all folded into Q1–Q10, N2–N4. eng: none taken |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (ER-1 to ER-15 approved by the author 2026-10-03) | 38 issues (15 findings ruled as ER-1 to ER-15, 23 test gaps on unbuilt code; plus 6 corrections of fact), 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR | score: 5/10 → 9/10, 17 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | not run |

Design pass scores (2026-09-30, before → after): Info Arch 5 → 9 · States 3 → 9 · Journey 5 → 9 · AI Slop 6 → 9 · Design System 6 → 9 · Responsive/a11y 4 → 9. Overall 5/10 → 9/10.

**OUTSIDE COVERAGE:** provider codex, not installed on this host. Design phase: native Claude subagent completed (single-model), six findings folded into the rulings. Eng phase (plan-review): unavailable, the native fallback could not run in this session, so no second opinion was taken. Missing outside coverage is recorded, not inferred clean.

**VERDICT:** DESIGN CLEARED (9/10). ENG CLEARED 2026-10-03: ER-1 to ER-15 approved by the author ("yes to all"). The geometry slice T1–T8 + T8b is cleared to build.

NO UNRESOLVED DECISIONS
