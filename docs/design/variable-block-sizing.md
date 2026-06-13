# Variable block sizing — design

**Status:** ✅ **COMPLETE** (2026-06-12/13). Drops 1 (foundation), 3 (image width + free height + crop), 4 (cell work-space floor) shipped and deployed; Drop 2 (column drag-resize) was built then cancelled by the author in favor of width presets. This was the strategic goal the structural-columns container was built toward: differing-width/height blocks, **reflow-safe sizing only, no free canvas**.

## Scope (author-approved)

All four capabilities are in the arc, staged:

1. ~~**Custom column widths** — drag-resize divider~~ **CANCELLED (author decision, 2026-06-12).** Built, browser-verified, then removed: the divider competed for the same gap strip as the inner-block drag handle and didn't feel reliable under a real mouse, and the preset picker already covers the real ratios. The width presets remain the column-width system. The schema's `Column.width` weight is unchanged (presets write it; arbitrary imported weights still render), so a future re-attempt stays possible — see git history for the removed `columnResize.ts` implementation (pair-preserving reweighting, ratio snapping, single-transaction commit).
2. **Min-height floors** ✅ — reserved work space on column cells that still grows with content (`Column.minHeight`, rem). **Shipped as a toolbar control, not a drag** (the cancelled-Drop-2 lesson — lead with reliable buttons): a "Cell height" dropdown in the columns cluster with Auto / 4-8-12rem presets / numeric rem input, acting on the cell holding the cursor.
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

`data-block-align`, `--block-width`, `--block-height`, `--cell-min-height` are **additive** (RUNTIME.md contract allows additions). The runtime does not consume them; columns and sizing stay purely presentational. No `STORAGE_SCHEMA_VERSION` change (no persisted-state shape change).

## Editor

- **Tiptap attrs** (Drop 1, no UI): `width`/`align` on `image` and `mathBlock` nodes; `minHeight` on `column`. Carried through `serialize.ts` both directions (omit-when-default for round-trip equality), and through each node's `parseHTML`/`renderHTML` so editor copy-paste survives.
- **Editor preview parity:** the editor canvas applies the same width/align/min-height styling so authors see real layout (columns already do this with `flex-grow`).
- **Controls/gestures as shipped:**
  - **Column width** → the existing **preset picker** (`setColumnWidthPreset`); a drag-divider was tried (Drop 2) and cancelled. `detectWidthPreset` recognizes preset-shaped weights, including arbitrary ones.
  - **Image width** → popover chips (Auto + 25/33/50/66/75/100%) + **side drag-handles** on the live preview, same snap stops, Alt = fine-grained.
  - **Image height** → popover Auto/value field + **bottom-edge drag-handle**, half-rem snapping.
  - **Cell work space** → "Cell height" **toolbar dropdown** (`setColumnMinHeight`): Auto / 4-8-12rem presets / numeric rem input. No drag.
  - MathBlock carries `width`/`align` in schema/renderer/serialize but has **no editor control yet** — additive when wanted.
- The image drag-handles join the standing "human GUI pass" list (synthetic events can't fully exercise live drags under a real mouse).

## Drop plan

1. **Drop 1 — foundation (no UI):** schema fields, renderer output + CSS, print/narrow-screen behavior, Tiptap attrs, serialize round-trip, tests, bundle regen. After this, documents can carry sizing and published pages honor it. **✅ Landed + deployed.**
2. ~~**Drop 2 — column divider drag-resize.**~~ **Cancelled** (see Scope above); presets are the column-width system.
3. **Drop 3 — image resize ✅:** width/align controls in the image edit popover (reliable baseline) + side drag-handles on the editor's live image preview (snap to 25/33/50/66/75/100%, fine-grained with Alt). The NodeView previews the authored width/align so the canvas matches the published page. **Extended same-day with free height** (author request): optional `ImageBlock.height` in rem; when width and height disagree with the natural aspect ratio the image **center-crops (`object-fit: cover`), never stretches** (author chose crop over stretch). Popover gets an Auto/value height field; the preview gets a bottom-edge handle (half-rem snapping). Height alone scales proportionally. Width chips split **Auto** (natural size, never upscaled = `null`) from **100%** (explicit fill = `width:1`) after the author flagged the original "Full"-means-Auto labeling as confusing.
4. **Drop 4 — cell reserved work space ✅:** `Column.minHeight` exposed via a **toolbar dropdown** (CellHeightControl.tsx — Auto / 4-8-12rem presets / numeric rem input), NOT a bottom-edge drag. The Drop-2 cancellation taught us to lead with reliable controls; a cell drag can be layered on later if ever missed. New `setColumnMinHeight` command + `clampCellMinHeight`/`activeColumnMinHeight` helpers; the renderer already consumed `--cell-min-height` from Drop 1, so this is editor-only.

Drops 3–4 are editor-only; the renderer/bundle changed only in Drop 1 (foundation) and the Drop-3 image fill/crop CSS.
