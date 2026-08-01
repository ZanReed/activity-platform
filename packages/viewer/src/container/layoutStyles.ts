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
  if (block.width === undefined) return {};
  return {
    '--activity-block-width': `${formatNumber(block.width * 100)}%`,
  } as CSSProperties;
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
