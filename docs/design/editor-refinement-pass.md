# Editor refinement pass (2026-07-16)

Author feedback list after dogfooding the MC-coherence pass, with Claude's
pushback and author rulings. This is a multi-session arc; work it in the four
groups below. App/editor-only unless a group says otherwise.

## Through-line

The MC-coherence pass (2026-07-15, commits `06e2bd9`/`83ef878`/`68fe391`)
moved the four classic question blocks' settings into the descriptor drawer +
routed the toolbar at nested fields. **The same migration now reaches graph,
data-plot, and image** — plus a batch of input-validation bugs and two
eng-review items.

## Rulings (author, 2026-07-16)

- **Empty state:** keep the 3 "Start here" starter cards for a truly empty
  doc; **rewrite the per-empty-line ghost hint** (currently "Type / to add a
  block…", power-user-first) to **lead with the `+` affordance**, `/` secondary.
- **Image sizing:** keep **scale** (width) as a drag-handle on the image
  (controls print footprint — the "terrible buttons" go, the capability
  stays); **fold height into a new crop mode**; caption/alt → drawer; the
  redundant **Edit primary is removed**. NOT crop-only (scale ≠ crop: crop
  reframes, scale controls paper used).
- **Start point:** Group 1 (bugs) first.

## Claude's pushback (recorded, some upheld)

- **Static-graph caption stays BELOW** (captions go under figures). Prompt-on-
  top applies to the *interactive* graph only; the *display* mode keeps its
  caption below.
- **Graph sizing reuses the control math but NOT the plumbing** — images store
  `width` in schema + renderer honors it; graphs don't. So graph/data-plot
  sizing = schema + renderer + print CSS + **`publish-activity` redeploy**, not
  app-only. (Group 3.)
- **Multi-part answer add (Enter + button):** support both (button =
  discoverable, Enter = accelerator) but Enter already means "commit/apply" in
  the answer field — the "commit AND open a new row" interaction needs design
  care, not a blind revert.

## Group 1 — bugs (app-only, no redeploy) — IN PROGRESS

1. **Learning-objectives gear.** The quick-bar renders `⚙` unconditionally
   ([BlockQuickBarHost.tsx](../../packages/app/src/editor/components/BlockQuickBarHost.tsx))
   — gate it on the block's descriptor having `simple`/`advanced` (the command
   bar already gates its own gear). Fixes learning_objectives / worked_example /
   unconfigured static graph showing a dead gear.
2. **Numeric-input blank crashes.** Empty numeric fields commit `NaN`/invalid
   shapes instead of restoring a default. Affects data-plot (bin count, bin/
   tick step, min/max) and the histogram delete-to-2 path. Pattern: on
   blur-empty, restore last-valid or a sensible default; never commit blank.
3. **Tolerance blank = 0** (blank tolerance means exact match). Numeric blank +
   data-plot tolerance both.
4. **Graph preview regression.** Author reports the interactive-graph preview
   "not working anymore." VERIFY in browser first (uses `mountGraphDisplay`,
   the lazy kit — likely a kit-load issue, probably NOT caused by the MC pass).

## Group 2 — settings coherence (app-only) — DONE (2026-07-17)

Status: **COMPLETE.** blank popover reorg (`0cc3893`), data-plot → drawer
(`9b3925d`), interactive-graph prompt-on-top (`0a53e60`), and the
**interactive-graph settings → drawer extraction** (`ffa0116` helpers +
`44c7ea3` the migration) all SHIPPED. Image + auto-feedback default-flip moved to
Group 3. The extraction went through /plan-eng-review (CLEARED) → /test-spec
(RATIFIED, TEST_SPEC.md) → build in 2 green commits: `graphAnswerHelpers.ts` leaf
module (shared first* accessors), then `GraphSettings.tsx` custom drawer field +
delete inline bar + summary readout, axis fields converted to DraftNumberInput
(ratified D5), auto-feedback toggle relocated (stays default-on). 13 graph e2e
(all 5 INV1 per-type type-preservation checks + P6/P7/S1/S3/S7/S8/E1); serialize
round-trip (U1) covered by existing tests. **OWED: the author's manual QA pass**
(D6 skip list — drawer layout eyeball, rich editors accept input, predict-then-run
on one type, break-it on a tolerance write).

- Migrate **interactive_graph + data_plot + image** block-level settings into
  the descriptor drawer; delete their bespoke inline "⚙ Advanced settings"
  bars (same as the four question blocks).
- **Auto-feedback** (graph built-in nudges): **default-flip DROPPED (author,
  2026-07-16)** — it's a full-stack schema/renderer/runtime/kit change for modest
  payoff ("won't drive people off by being default-on"). Revisit only on real
  user pushback. The TOGGLE still moves into the drawer with the settings
  extraction (app-only); `builtinFeedback` stays `default(true)`.
  Anticipated-mistakes + the rest → advanced drawer groups.
- **Prompt on top** for the interactive graph (caption stays below for display).
- **Blank popover reorg** ([BlankEditPopover.tsx](../../packages/app/src/editor/components/BlankEditPopover.tsx)):
  Answer + numeric + acceptable/additional answers **always visible**; **hint +
  mistake feedback under an "Advanced options" disclosure**. (Partially reverses
  the 2026-07-14 "collapse acceptable answers under More options" call — but in a
  principled way: core answer config visible, pedagogical extras hidden.)
- ~~**Image:** caption/alt → drawer, Edit primary removed.~~ **MOVED to Group 3**
  (2026-07-16): the image popover bundles source + caption + width + height, and
  Group 3 reworks width/height into drag-handle scale + crop mode. Splitting just
  caption→drawer now leaves a half-migrated popover; the image block is done
  wholesale in Group 3 (caption→drawer + Edit-primary-removed + scale-drag +
  crop) as one coherent redesign.

Implementation note: data-plot and interactive-graph settings are
interaction-dependent (bin-width for histograms only, tolerance for boxplots,
solution/confidence when graded), which the static typed-field model can't
express. Each block's settings panel is extracted into a single `custom`
drawer field (the drawer kind that exists for exactly this) and the inline
"⚙ Advanced settings" bar deleted — same gear→drawer flow as the typed blocks.

## Eng review — interactive-graph settings extraction (/plan-eng-review, 2026-07-17)

**Verdict: CLEARED — buildable, right-sized.** The risk (interwoven helpers) is
smaller than first framed. Usage mapping showed the only genuinely SHARED helpers
are 5 pure module-level accessors (`firstModel`/`firstRegion`/`firstInequality`/
`firstRay`/`firstSegment`, each `return arr[0] ?? DEFAULT`); everything else the
settings use (`setAxis`, `ToleranceRow`, mistake CRUD + validators) is
**settings-only** and relocates wholesale. Write-path conversion
(`updateAttributes({X})` → `setNodeAttr(editor,pos,'X',…)`) is mechanical and
TS-checked under `noUncheckedIndexedAccess`.

**Reactivity risk RESOLVED:** a drawer custom field reflects live edits only if the
host feeds it a fresh node. Traced: `BlockCommandBarHost` re-reads
`editor.state.doc.nodeAt(pos)` each render, and `Editor.tsx`'s `forceTick` re-renders
on every transaction → fresh node cascades to the field after each `setNodeAttr`
(the same mechanism `DataPlotSettings` already relies on).

**Rulings:**
- **D2 — shared helpers → new `graphAnswerHelpers.ts` leaf module** (first* +
  `DEFAULT_LINEAR` + answer-attr types), imported by both the NodeView and
  `GraphSettings.tsx`. DRY, clean import direction. NOT export-from-NodeView (awkward
  dependency on a 1000-line module), NOT duplicate.
- **D3 — run `/test-spec` before building.** A pure refactor's only danger is silent
  regressions; front-load the net.

**Build shape (~5 files):** `graphAnswerHelpers.ts` (new, pure) · `GraphSettings.tsx`
(new custom drawer field, `{editor,node,pos}` → `setNodeAttr`, mirrors
`DataPlotSettings`) · `blockControls.ts` (+1 `interactiveGraph` entry with the custom
advanced field) · `InteractiveGraphView.tsx` (delete inline "⚙ Advanced settings"
disclosure + settings-only helpers; import first* from the new module; add a
display-only summary readout) · `editor.css` (panel styles). App-only, no
wire/schema/renderer/deploy. Auto-feedback toggle relocates into the drawer, stays
`default(true)`. Small green commits on main.

**Test net (input to /test-spec):** per-interaction e2e for all 6 types (insert →
gear → Advanced → type-appropriate tolerance row shows + writing it updates the
`interaction` attr); inline-bar-gone; worked-solution rich field writes; confidence /
partial-credit / allow-no-solution (+ nested no-solution-correct) toggles; mistake
add/edit. Watch (pre-existing, don't worsen): mistake-feedback `InlineRichTextEditor`
keyed by index.

## GSTACK REVIEW REPORT

| Run | Status | Findings |
|---|---|---|
| Scope challenge (Step 0) | ✅ | Right-sized (~5 files, 1 component + 1 leaf module); DataPlotSettings is the template; lighter-touch (gear-expands-inline) rejected — loses cross-block consistency + leaves NodeView bloated for Group 3 |
| Architecture | ✅ | Shared surface = 5 pure accessors; settings-only helpers relocate; single-root-host discipline preserved (rendered by existing AdvancedDrawer, no per-block mounting) |
| Reactivity | ✅ | Fresh-node cascade confirmed via Editor forceTick → host re-read; FieldFocusContext already wraps the hosts so drawer rich editors route to the toolbar |
| Tests | ⏭️ | Deferred to /test-spec (D3): per-interaction-type e2e is the regression net |

VERDICT: CLEARED. No CODEX / CROSS-MODEL run (app-only refactor, in-distribution).

NO UNRESOLVED DECISIONS

## Graph authoring redirection (author, 2026-07-17) — REVERSES the drawer-move

After the token-restyle + blank-start shipped, the author reconsidered the
display-graph reshape. Two rulings + one reversal:

- **REVERSAL: the figure/expression editor STAYS in the block body, NOT the
  drawer.** Adding functions/points IS basic graphing, not a technical setting —
  hiding it behind the gear fails "immediately accessible, no settings change."
  The earlier "whole editor → drawer" call (2026-07-16 Q1) is OFF. (The token
  restyle `abeb682` + blank start stand; only the drawer-move is reversed. The
  caption-toggle call is unaffected but lower priority now.)
- **Point 1 — full Desmos-style expression list (ratified).** Stop
  differentiating "Point" vs "Curve" rows. The student/published graph just
  digests and plots everything; the teacher authoring should match. Rebuild the
  figure editor (`DrawableListEditor`) as ONE uniform list of text expressions
  (type `y=x^2` or `(2,3)` per row, graphed live, no kind categories); per-kind
  extras (point label, open dot, dashed curve) tuck behind a small per-row
  affordance. The add box is already unified (`drawablesFromFreeform`); this
  extends it to the rendered list. Biggest consistency win, biggest build.
- **Point 2 — "preview as student" eye toggle on every graphing block
  (ratified).** A small eye toggle (quick-bar / top-right) hides ALL authoring
  (expression list + type picker + answer controls) → just the rendered graph,
  as it appears in the activity. Per-block, session state. Apply to
  interactive_graph, number_line, data_plot. **OPEN (confirm at build):** what
  "student view" renders for a GRADED interactive graph — the empty plottable
  student board (`mountGraphDisplay`-style) vs. the current author board minus
  chrome. For DISPLAY it's unambiguous (hide list → show figure).

Both are their own focused build (the Desmos rebuild is large + may touch the
graph-kit expression-list engine). Suggested order: preview toggle first
(app-only, contained, immediately useful), then the Desmos expression-list
rebuild (consider /plan-eng-review — it reworks authoring + possibly the kit).

### Design rulings (/plan-design-review, 2026-07-17)

Visual language calibrated against the `--ed-` token system (no DESIGN.md; the
tokens ARE the design language). Mockup approved. Rulings:

- **Row = a blank-chip cousin.** Uniform rows: left **kind swatch** (square for
  curves/regions/rays, circle for points — the one cue that keeps a uniform list
  readable) + **monospace** expression + a per-row **kebab**. Same typographic DNA
  as `.blank-chip`; extras panel reuses `.block-advanced-drawer__field` styling.
- **Extras are contextual to the parsed kind.** Inequality rows **drop the dashed
  toggle** — the operator IS the source of truth (`>`/`<` → dashed boundary,
  `>=`/`<=` → solid; `formatInequality` round-trips it losslessly). Plain
  equation/expression rows KEEP dashed (independent line-style, no operator to
  derive it from).
- **Polygon = uniform row, edited in extras.** Renders as a normal row (swatch +
  read-only `polygon (…)` summary + kebab); it's the one row whose text isn't
  editable — the kebab opens the vertex editor (today's NumCell grid + `+ vertex`
  + filled) inline in the extras. Created via a small `+ shape` secondary control
  by the add-row (can't be typed).
- **List + board = responsive side-by-side.** Side-by-side (list left, board
  right) above a block-width breakpoint (~640px), auto-stack below. Board carries
  the row swatch colors so row↔plot mapping is instant.
- **SCOPE REVERSAL — authored per-drawable color.** Add optional `color` to
  `DrawableAttr` so teachers pick each drawable's color from a **curated ~8-swatch
  `--ed-`-derived palette** (NOT a freeform hex input — keeps every graph
  on-theme). This REVERSES the eng-review "app-only" conclusion for Part B: now
  needs schema + graph-kit/renderer honoring `color` + a **`publish-activity`
  redeploy** (+ kit upload if the author board draws it). **No ingest redeploy** —
  drawables are authored display content, not submission wire.
- **Row affordance is touch/keyboard-safe.** The kebab is **always in the DOM at
  `--ed-faint`**, brightening on row hover/focus (same quiet-affordance trick as
  the gutter rest-dot); Tab-reachable, 44px touch target, screen-reader labelled
  (e.g. "Curve options"). No hover-only controls.
- **States:** empty/add-row is a ghosted mono placeholder + faint `+` ("type an
  equation, point, or ray…"); inline parse error sits under the row in
  `--ed-danger`, row unchanged; board shows a brief kit-loading state while
  `mountGraphAuthor` resolves.
- **Eye toggle (Part A):** outline `eye` icon at the panel header top-right, peer
  to the quick-bar buttons; hides authoring chrome via `--ed-spring` motion.

### Color — eng ruling (/plan-eng-review re-review, 2026-07-17)

Authored per-drawable color, re-reviewed after the design-review scope reversal.
Locked shape:

- **`color` is a palette KEY (string), not a hex.** `z.enum(PALETTE_KEYS)` in
  `@activity/schema` (the key list lives in schema, dependency-free) so an invalid
  key FAILS validation instead of silently falling back. Additive/optional → no
  `schemaVersion` reject; greenfield so no migration.
- **One hex source: `DRAWABLE_PALETTE` (key→hex) in `packages/graph-kit`** (the
  leaf package; renderer + app already depend on it — zero new dep edges). The
  app picker renders THESE hexes as swatches — chosen at design time to match the
  `--ed-` primitives, but stored as static hex (published pages can't read
  `--ed-` CSS vars). Fold the existing `CURVE_COLOR`/`SCATTER_COLOR`/`FIT_COLOR`
  into it — no second color list.
- **Three draw paths honor it:** (1) `graph-kit/board.ts` live + author board
  ALREADY takes `strokeColor: item.color` — just plumb `drawable.color →
  item.color`; (2) `renderer/graph-svg.ts` static/print/fallback — `DRAWABLE_
  PALETTE[d.color] ?? default` at the ~7 `INK` sites. A shared **`'default'`
  palette key** both paths resolve kills the black→blue hydration flash.
- **Shaded fill:** stroke takes the color; the half-plane fill uses the SAME
  color at a FLOORED opacity (so a pale swatch still reads) — board + SVG
  consistent.
- **`expression` color is live-only** (graph-svg deliberately skips expression
  drawables — same limit as today). **Answer-key drawables stay INK** (synthesized
  from answer config; a distinct semantic layer, not display color). **Grayscale
  print:** color is best-effort; solid/dashed style + shape + label stay the
  print-durable differentiators (CLAUDE.md baseline).
- **Deploy (REVERSES app-only):** kit upload FIRST → `bundle:renderer` →
  `publish-activity` redeploy. **No ingest redeploy** (drawables are authored
  display content, not submission wire). `data-graph-drawables` gains `color`
  (additive runtime data-attribute — safe).

## Group 3 — new interactions (some schema/redeploy)

- **Image crop mode** (a button → enter crop → drag a frame). Height folds in.
- **Graph + data-plot sizing** (reuse `imageSizing.ts` math + drag handles) —
  schema field + renderer + print CSS + `publish-activity` redeploy. Print
  footprint is the driver.
- **Multi-part answer add** for plot-point / plot-function: an explicit
  **+ Add** button (discoverable primary) **and** Enter-to-add-a-row
  (accelerator).
- **Answers open by default, collapsible** so the teacher can preview the
  student view.
- **Default seeds:** ray/segment defaults to a **bounded-domain equation**
  (`y = 2x for 0 <= x <= 5` style — how math teachers think), not the
  "ray through two points" command form; **static graph seeds empty** (no
  example drawables).

## Group 4 — eng-review first, then build

Both touch multiple block types; run `/plan-eng-review` before code.

1. **Blank discoverability.** A visual signifier that you can make a blank —
   e.g. a small `+`-with-underline affordance, or trailing ghost text like
   "type `__` to add a blank." (Author's fill_in_blank issue #1.)
2. **Math blank inside a math expression** — a numeric blank mid-equation, esp.
   for worked examples. **Already designed** in
   [math-blanks.md](math-blanks.md) (7 decisions await kickoff); this is the
   author demand that design anticipated.
