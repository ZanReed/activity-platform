import { NodeSelection, type EditorState } from '@tiptap/pm/state';
import type { Node as PMNode, ResolvedPos } from '@tiptap/pm/model';
import type { JSONContent } from '@tiptap/core';

// =============================================================================
// strictGrid — shared position/identity helpers for the strict-grid editor.
// -----------------------------------------------------------------------------
// The editor tree IS the stored rows-of-columns model: doc = (sectionBreak |
// row)+, and every leaf block lives inside a `column` (row > column > block+).
// So "the block the user is on" is no longer "the depth-1 doc child" — it is the
// block whose PARENT is a column. Every host/extension that used to reason about
// top-level blocks resolves identity through activeBlockAt here instead. The
// STRUCTURAL fixes (reorder, split, insert-top-level) still live per-site — this
// module is the shared identity + top-level-anchor spine they build on.
// =============================================================================

/**
 * The content block the given resolved position sits inside: the nearest
 * ancestor whose PARENT is a `column` (walking up from the deepest). For a
 * caret in a paragraph directly in a stack column that's the paragraph; for a
 * caret inside a worked-example body it's the worked-example block (its parent
 * is the column, the paragraph's is not). Returns null when the position is not
 * inside a column (e.g. a whole-row NodeSelection).
 */
export function blockAncestor($pos: ResolvedPos): { pos: number; depth: number } | null {
    for (let d = $pos.depth; d >= 1; d--) {
        if ($pos.node(d - 1).type.name === 'column') {
            return { pos: $pos.before(d), depth: d };
        }
    }
    return null;
}

/**
 * The block the current selection acts on, resolved to strict-grid identity:
 * the block whose parent is a `column`. Handles a NodeSelection directly on such
 * a block (image/atom) and a text caret inside one. Null when the selection
 * isn't inside a column cell (a row selection, a section-break selection).
 */
export function activeBlockAt(
    state: EditorState,
): { node: PMNode; pos: number } | null {
    const sel = state.selection;
    if (sel instanceof NodeSelection && sel.$from.parent.type.name === 'column') {
        return { node: sel.node, pos: sel.from };
    }
    const found = blockAncestor(sel.$from);
    if (!found) return null;
    const node = state.doc.nodeAt(found.pos);
    return node ? { node, pos: found.pos } : null;
}

/**
 * The doc position just BEFORE the top-level `row` (depth 1) that contains the
 * given position, and the row node itself. Null when the position isn't inside a
 * top-level row (e.g. resolved at the doc edge). The strict-grid anchor for
 * inserting top-level nodes (a sectionBreak or a fresh row) from a nested caret.
 */
export function topLevelRowAt(
    $pos: ResolvedPos,
): { node: PMNode; pos: number } | null {
    if ($pos.depth >= 1 && $pos.node(1).type.name === 'row') {
        return { node: $pos.node(1), pos: $pos.before(1) };
    }
    // A NodeSelection sitting AT the doc level ($pos.depth === 0) — the row is
    // the node right after the position, if any.
    if ($pos.depth === 0) {
        const after = $pos.nodeAfter;
        if (after && after.type.name === 'row') return { node: after, pos: $pos.pos };
    }
    return null;
}

/**
 * Is the caret in the top-level SECTION FLOW — a block sitting directly in the
 * sole column of a top-level (depth-1) row? This is where the structural
 * `topLevelOnly` insertions (section break, split/insert columns) make sense.
 * False inside a multi-column cell, a nested container (worked example, list),
 * or the reference panel. Mirrors the pre-migration `$from.depth > 1` gate,
 * translated to the strict grid.
 */
export function isTopLevelStack($pos: ResolvedPos): boolean {
    const d = $pos.depth;
    // The caret's immediate block (paragraph/heading/…) must be a direct child
    // of a column — depth d, parent column at d-1, row at d-2 === doc level (1).
    if (d < 2) return false;
    if ($pos.node(d - 1).type.name !== 'column') return false;
    const row = $pos.node(d - 2);
    if (row.type.name !== 'row') return false;
    if (d - 2 !== 1) return false; // the row must be a direct child of the doc
    return row.childCount === 1; // sole-column stack, not a multi-col cell
}

// =============================================================================
// Empty-state shapes — the strict grid's "one empty line" is row > column >
// paragraph, not a bare paragraph. Used by the routes' initial content and the
// normalizing appendTransaction's backfill.
// =============================================================================

/** A fresh empty column holding one empty paragraph. */
export function emptyColumnJSON(): JSONContent {
    return { type: 'column', content: [{ type: 'paragraph' }] };
}

/** A fresh 1-col stack row holding one empty paragraph — the empty section. */
export function emptyRowJSON(): JSONContent {
    return {
        type: 'row',
        attrs: { gridLines: 'inherit' },
        content: [emptyColumnJSON()],
    };
}

/** A brand-new empty document: one 1-col stack row with one empty paragraph. */
export function emptyDocJSON(): JSONContent {
    return { type: 'doc', content: [emptyRowJSON()] };
}
