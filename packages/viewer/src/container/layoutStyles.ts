// =============================================================================
// container/layoutStyles.ts — authored layout → CSS custom properties (S5 T1)
// -----------------------------------------------------------------------------
// The schema carries three authored layout facts the viewer was ignoring
// entirely, on screen AND on paper:
//
//   Column.width      — a unitless weight, so a 2-beside-1 row is a 2/3 + 1/3
//                       split ("worked example beside a narrow answer strip").
//   Column.minHeight  — reserved work space in rem: a floor, never a cap.
//   Block width/align — a width FRACTION of the container plus where the
//                       narrowed block sits.
//   Block workSpace   — reserved hand-working space below ONE problem (2026-08-21).
//                       Added late because it arrived in the viewer as a DEAD
//                       DECLARATION: the schema carried it, the print CSS
//                       claimed to honour it, and nothing ever set the property.
//
// Every one of them was dropped on the floor before this: a teacher's 2:1 split
// rendered 50/50 and a half-width figure rendered full width. That is a silent
// authoring regression against published pages, and it matters most exactly
// where it was least visible — on paper, where "footprint control is the whole
// point" (the renderer's own words about its print sizing rules).
//
// The emitted shapes deliberately MIRROR the renderer's:
//   grid-template-columns: var(--columns-template)   ← weights
//   width: var(--block-width)  + data-block-align    ← per-block sizing
// under the viewer's `--activity-*` namespace, which is the namespace the token
// guard reserves for document-driven values (as opposed to design tokens). Same
// semantics, same names modulo the prefix, so the parity gate compares like
// with like rather than translating between two vocabularies.
//
// Custom properties rather than direct width declarations, for the reason the
// renderer documents: a custom property loses to a later rule, so the phone
// breakpoint can relax the whole thing back to a single stacked column. An
// inline `width` would win and a teacher's desktop layout would follow a
// student onto a 375px screen.
// =============================================================================

import type { CSSProperties } from 'react';

/** The authored bits this module reads. Structural only — deliberately not the
 * whole Column/Block type, so it stays usable against the sanitized shapes. */
export interface ColumnLayout {
  readonly width?: number | undefined;
  readonly minHeight?: number | undefined;
}

export interface BlockLayout {
  readonly width?: number | undefined;
  readonly align?: 'left' | 'center' | 'right' | undefined;
  /**
   * Reserved hand-working space below THIS problem, in rem — the per-problem
   * override of `meta.print.workSpace`. Declared on fill_in_blank, ordering,
   * matching and multiple_choice; absent everywhere else and on every block the
   * teacher did not size.
   */
  readonly workSpace?: number | undefined;
}

/** Trim float artifacts (0.33 * 100 → 33.000000000000004) while keeping real
 * precision. Mirrors the renderer's formatNumber for the same reason: the two
 * surfaces should round identically or a parity comparison drifts on noise. */
function formatNumber(n: number): string {
  return String(Number(n.toFixed(4)));
}

/**
 * `grid-template-columns` tracks for one row, from its columns' weights.
 *
 * A column with no authored weight counts as 1, so a partially-weighted row
 * still behaves sensibly instead of collapsing: `[2, undefined]` is "twice as
 * wide as its neighbour", which is what an author who set one weight meant.
 */
export function columnsTemplate(columns: readonly ColumnLayout[]): string {
  if (columns.length === 0) return '1fr';
  return columns
    .map((column) => `${formatNumber(column.width ?? 1)}fr`)
    .join(' ');
}

/** Inline style for a row: the track sizing its columns' weights describe. */
export function rowStyle(columns: readonly ColumnLayout[]): CSSProperties {
  return { '--activity-columns-template': columnsTemplate(columns) } as CSSProperties;
}

/**
 * Inline style for a column: its reserved work-space floor, when authored.
 *
 * Returns an empty object when there is none, so the CSS fallback governs and
 * every unauthored cell stays content-sized. Emitting `0` instead would make
 * "no work space reserved" and "zero work space reserved" the same declaration,
 * which is fine today and would stop being fine the moment the fallback moves.
 */
export function columnStyle(column: ColumnLayout): CSSProperties {
  if (column.minHeight === undefined) return {};
  return {
    '--activity-cell-min-height': `${formatNumber(column.minHeight)}rem`,
  } as CSSProperties;
}

/**
 * Inline style for a sized block: its width as a percentage of the container.
 *
 * Absent width → no declaration, so the block stays full width. `align` without
 * `width` is a no-op by design, exactly as in the renderer: a full-width block
 * has nothing to align within.
 */
export function blockStyle(block: BlockLayout): CSSProperties {
  const style: Record<string, string> = {};

  if (block.width !== undefined) {
    style['--activity-block-width'] = `${formatNumber(block.width * 100)}%`;
  }

  // The per-problem work-space override, as ordinary custom-property
  // inheritance: PrintDocumentLayer seeds `--print-work-space` on the worksheet
  // root and this shadows it for one block, which the print rule
  // `[data-block-category='question'] { padding-bottom: var(--print-work-space) }`
  // then reads. Same mechanism the retired renderer used, and its own tests
  // pinned the emitted `style="--print-work-space:3rem"`.
  //
  // BUT DECLARED ONCE, not per block type. The renderer emitted this from FOUR
  // separate block renderers (fill-in-blank, matching, multiple-choice,
  // ordering), which is the "any new type must remember to join this list"
  // shape ruling N2 removed for numbering — and the same shape that let this
  // whole field arrive in the viewer as a dead declaration. A type that gains
  // `workSpace` later inherits this for free.
  //
  // Inert on screen: nothing outside `@media print` reads the property.
  if (block.workSpace !== undefined) {
    style['--print-work-space'] = `${formatNumber(block.workSpace)}rem`;
  }

  return style as CSSProperties;
}

/** `data-block-align` for a sized block, or undefined.
 *
 * Absence IS the centered default (the renderer's convention — centering is
 * the natural read for a narrowed figure on a worksheet), so only the two
 * off-center values are ever emitted. */
export function blockAlign(block: BlockLayout): 'left' | 'right' | undefined {
  if (block.width === undefined) return undefined;
  return block.align === 'left' || block.align === 'right' ? block.align : undefined;
}

/** Whether a block carries any authored footprint at all. */
export function isSized(block: BlockLayout): boolean {
  return block.width !== undefined;
}

/**
 * Resolve a row's tri-state ruled-grid setting against the activity-wide
 * default, ported verbatim from the retired renderer's `resolveGridLines`.
 *
 *   'on'      → always ruled
 *   'off'     → never ruled
 *   'inherit' → whatever `meta.print.gridLines` says (default false)
 *
 * Ruled grids are OPT-IN: the schema's activity default is false, so a document
 * that never mentions grid lines is unruled everywhere, which is what every
 * existing activity expects.
 */
export function resolveGridLines(
  gridLines: 'inherit' | 'on' | 'off' | undefined,
  activityDefault: boolean,
): boolean {
  if (gridLines === 'on') return true;
  if (gridLines === 'off') return false;
  return activityDefault;
}
