# Variable block sizing — design

**Status:** decisions made with the author (2026-06-12); implementation staged in drops. Drop 1 (schema + renderer + serialization foundation) is in progress. This is the strategic goal the structural-columns container was built toward: differing-width/height blocks, **reflow-safe sizing only, no free canvas**.

## Scope (author-approved)

All four capabilities are in the arc, staged:

1. **Custom column widths** — arbitrary per-column ratios beyond the preset menu, authored by dragging the divider between columns (live preview, snapping to clean ratios). Builds directly on the existing `Column.width` weight; no schema change.
2. **Min-height floors** — reserved work space on column cells that still grows with content. New optional `Column.minHeight` (rem). Authored by dragging the cell's bottom edge, snapping to clean rem steps, with a numeric readout.
3. **Per-block width** — a top-level (or in-cell) block rendered narrower than its container, with alignment. New optional `width` (fraction of container width) + `align` fields on sizable blocks.
4. **Image intrinsic sizing** — **unified with #3**: images expose the same per-block width field via corner drag-handles; no separate image-size mechanism.

### Out of scope (deliberately, unchanged from the columns arc)

- Arbitrary fixed pixel heights decoupled from content, and free-canvas absolute positioning. Both break the foldable's height measurement and print/Chromebook reflow.
- Text wrap-around / floats for narrow blocks. A narrowed block stays in normal flow (its row is its own); wrap-around would make foldable measurement and print pagination depend on neighbor interactions.

## Decisions

| # | Decision | Choice |
|---|---|---|
| 1 | First-drop scope | All four capabilities in one arc, staged in drops |
| 2 | Column width UI | Drag-resize divider (snap to clean ratios) |
| 3 | Height model | `minHeight` in **rem**, on **column cells** (per-block later, additively) |
| 4 | Block width vs image sizing | One unified `width`/`align` mechanism; images surface it as drag-handles |
| 5 | Width values | Fraction of container width `(0, 1]`, UI snaps to 25/33/50/66/75/100% with fine-grained override |
| 6 | Alignment | `left \| center \| right`, **default center**, no wrap-around |
| 7 | Min-height UI | Drag the cell's bottom edge + numeric readout |

Rationale highlights:

- **rem for minHeight** — font-relative, so reserved work space scales with the print font-size config; lines-based UI labels can be layered on later without changing the stored unit.
- **Fraction (not %) stored for block width** — matches `Column.width`'s "schema stores numbers, UI presents presets" pattern; renderer multiplies by 100 for CSS.
- **Default center** — narrowed images/figures read naturally centered on worksheets; `align` is omitted when center so round-trip equality holds.

## Schema (all additive/optional — no `schemaVersion` bump)

```typescript
// Shared fragment (new file packages/schema/src/sizing.ts or inline per block):
width: z.number().gt(0).max(1).optional(),     // fraction of container width; absent = full
align: z.enum(['left', 'center', 'right']).optional(), // absent = center (the default)

// Column gains:
minHeight: z.number().positive().optional(),   // rem; absent = content-determined
```

**Sizable block set in Drop 1: `image` and `math_block`.** Callout and problem have no editor mapping yet (serialize emits null → unauthorable), so adding fields there would be speculative (YAGNI). The fragment extends to any block additively when its authoring surface lands.

## Renderer

- Sized blocks emit `style="--block-width:<n*100>%"` plus `data-block-align="left|right"` (center is the attribute-free default, mirroring `data-grid-lines` absence-as-default).
- Cells with a floor emit `style="--cell-min-height:<n>rem"` on `.column-cell`.
- CSS (in `styles.ts`, reaching screen, print, and foldable alike):

```css
.block[style*='--block-width'] { width: var(--block-width); margin-left: auto; margin-right: auto; }
.block[data-block-align='left']  { margin-left: 0; }
.block[data-block-align='right'] { margin-right: 0; }
.column-cell { min-height: var(--cell-min-height, auto); }
```

(Exact selectors may differ in implementation; the principle is custom-property-driven so media queries can override, same as `--columns-template`.)

- **Narrow-screen behavior:** `@media screen and (max-width: 640px)` relaxes block widths back to 100% (a 33%-wide image on a phone is unusable), exactly parallel to the columns collapse. Print and foldable keep authored widths.
- **Print:** widths and min-heights apply on paper — min-height *is* the work-space feature in print. Foldable measurement needs no changes: the iframe measures real rendered heights, and min-height simply makes the measured height honest.

## Data-attribute contract

`data-block-align`, `--block-width`, `--cell-min-height` are **additive** (RUNTIME.md contract allows additions). The runtime does not consume them; columns and sizing stay purely presentational. No `STORAGE_SCHEMA_VERSION` change (no persisted-state shape change).

## Editor

- **Tiptap attrs** (Drop 1, no UI): `width`/`align` on `image` and `mathBlock` nodes; `minHeight` on `column`. Carried through `serialize.ts` both directions (omit-when-default for round-trip equality), and through each node's `parseHTML`/`renderHTML` so editor copy-paste survives.
- **Editor preview parity:** the editor canvas applies the same width/align/min-height styling so authors see real layout (columns already do this with `flex-grow`).
- **Gestures** (later drops):
  - Column divider drag → writes normalized `Column.width` weights; snaps to clean ratios (1:1, 2:1, 3:1, 1:2, 1:3, 2:3 …); the preset picker stays and `detectWidthPreset` keeps recognizing preset-shaped weights.
  - Image corner-handle drag → writes `width` snapped to 25/33/50/66/75/100% (fine-grained with a modifier key).
  - Cell bottom-edge drag → writes `minHeight` snapped to 1rem steps, with a small numeric readout.
  - Non-image sizable blocks get a width/align control in the toolbar or block popover.
- All three gestures join the standing "human GUI pass" list (synthetic events can't drive live drags).

## Drop plan

1. **Drop 1 — foundation (no UI):** schema fields, renderer output + CSS, print/narrow-screen behavior, Tiptap attrs, serialize round-trip, tests, bundle regen. After this, documents can carry sizing and published pages honor it.
2. **Drop 2 — column divider drag-resize** (+ keep preset picker working).
3. **Drop 3 — image corner handles + width/align control for other sizable blocks.**
4. **Drop 4 — cell min-height bottom-edge drag + readout.**

Each later drop is editor-only (no renderer/bundle change expected beyond Drop 1).
