// =============================================================================
// tableAligns.ts — a table's per-column alignment, kept in step with its
// columns (tables GUI amendment 2026-11-12, T-2; table-block.md)
// -----------------------------------------------------------------------------
// `columnAligns` is index-aligned with each row's cells, optional, and may be
// SHORTER than the table (columns past its end are left). So adding or
// deleting a column must shift it, or a right-aligned number column would hand
// its alignment to its neighbour. An all-left table stores nothing (null), so a
// table authored without alignment re-saves byte-identically.
// =============================================================================

export type Align = 'left' | 'center' | 'right';

/** Trailing lefts dropped; all-left (or empty) → null. */
export function normalizeAligns(aligns: readonly Align[]): Align[] | null {
    const out = [...aligns];
    while (out.length > 0 && out[out.length - 1] === 'left') out.pop();
    return out.length > 0 ? out : null;
}

function padded(aligns: readonly Align[] | null | undefined, width: number): Align[] {
    const out: Align[] = [...(aligns ?? [])];
    while (out.length < width) out.push('left');
    return out;
}

/** `count` new (left) columns inserted at `index`. */
export function insertColumnAligns(
    aligns: readonly Align[] | null | undefined,
    index: number,
    count = 1,
): Align[] | null {
    if (!aligns || aligns.length === 0) return null;
    const out = padded(aligns, index);
    out.splice(index, 0, ...Array<Align>(count).fill('left'));
    return normalizeAligns(out);
}

/** Columns `from` (inclusive) to `to` (exclusive) removed. */
export function removeColumnAligns(
    aligns: readonly Align[] | null | undefined,
    from: number,
    to: number,
): Align[] | null {
    if (!aligns || aligns.length === 0) return null;
    const out = [...aligns];
    out.splice(from, to - from);
    return normalizeAligns(out);
}

/** Columns `from` to `to` (exclusive) set to `align`. */
export function setColumnAligns(
    aligns: readonly Align[] | null | undefined,
    from: number,
    to: number,
    align: Align,
): Align[] | null {
    const out = padded(aligns, to);
    for (let i = from; i < to; i++) out[i] = align;
    return normalizeAligns(out);
}

/** The header choice a teacher picks, from the block's two booleans (T-3). */
export type HeaderChoice = 'row' | 'column' | 'both' | 'none';

export function headerChoiceOf(headerRow: boolean, headerColumn: boolean): HeaderChoice {
    if (headerRow && headerColumn) return 'both';
    if (headerRow) return 'row';
    if (headerColumn) return 'column';
    return 'none';
}

export function headerAttrsOf(choice: HeaderChoice): { headerRow: boolean; headerColumn: boolean } {
    return { headerRow: choice === 'row' || choice === 'both', headerColumn: choice === 'column' || choice === 'both' };
}
