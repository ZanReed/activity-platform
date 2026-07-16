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

## Group 2 — settings coherence (app-only)

- Migrate **interactive_graph + data_plot + image** block-level settings into
  the descriptor drawer; delete their bespoke inline "⚙ Advanced settings"
  bars (same as the four question blocks).
- **Auto-feedback** (graph built-in nudges) → a drawer toggle, **default off**.
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
