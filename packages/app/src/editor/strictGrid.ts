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

/** Is this an empty paragraph node (a placeholder line)? */
function isEmptyParagraph(node: PMNode): boolean {
    return node.type.name === 'paragraph' && node.content.size === 0;
}

/**
 * The brand-new empty document — one 1-col stack row holding a single empty
 * paragraph. Drives the first-run "Start here" trigger and the "was the doc
 * blank?" check before an insert.
 */
export function isEmptyStackDoc(doc: PMNode): boolean {
    if (doc.childCount !== 1) return false;
    const row = doc.firstChild;
    if (!row || row.type.name !== 'row' || row.childCount !== 1) return false;
    const col = row.firstChild;
    if (!col || col.type.name !== 'column' || col.childCount !== 1) return false;
    return isEmptyParagraph(col.firstChild!);
}

/**
 * After inserting into a freshly-empty doc, the seed empty paragraph lingers.
 * Returns the range to delete so a fresh activity doesn't open with a blank line:
 *   • a new top-level row was inserted (e.g. columns) → drop the whole empty
 *     seed stack row;
 *   • a block was inserted INTO the seed column → drop the leading empty
 *     paragraph.
 * Null when there is nothing to clean (the seed is the only content, or the doc
 * no longer starts with an empty stack).
 */
export function emptySeedCleanupRange(
    doc: PMNode,
): { from: number; to: number } | null {
    const firstRow = doc.firstChild;
    if (!firstRow || firstRow.type.name !== 'row') return null;
    const col = firstRow.firstChild;
    if (!col || col.type.name !== 'column') return null;
    const seedRowIsEmpty =
        firstRow.childCount === 1 &&
        col.childCount === 1 &&
        isEmptyParagraph(col.firstChild!);
    // Case B: a whole new row was added — drop the empty seed row entirely.
    if (seedRowIsEmpty && doc.childCount > 1) {
        return { from: 0, to: firstRow.nodeSize };
    }
    // Case A: content landed in the seed column — drop the leading empty line.
    if (col.childCount > 1 && isEmptyParagraph(col.firstChild!)) {
        const from = 2; // into row (+1), into column (+1)
        return { from, to: from + col.firstChild!.nodeSize };
    }
    return null;
}

/**
 * Position-based sibling of isTopLevelStack, for an INSERT position (where a
 * picked block will land) rather than a caret. True at a doc-level position (the
 * end square, a row boundary) and at a column-level position whose column is the
 * sole column of a top-level row. Drives the "Add a block" window's
 * `topLevelOnly` gate (section break / columns).
 */
export function isTopLevelStackInsertPos(doc: PMNode, pos: number): boolean {
    const $pos = doc.resolve(Math.min(Math.max(pos, 0), doc.content.size));
    if ($pos.depth === 0) return true; // doc-level: between rows / at the end
    for (let d = $pos.depth; d >= 1; d--) {
        if ($pos.node(d).type.name === 'column') {
            const row = $pos.node(d - 1);
            return (
                row.type.name === 'row' &&
                d - 1 === 1 && // the row is a direct child of the doc
                row.childCount === 1 // a sole-column stack, not a multi-col cell
            );
        }
    }
    return false;
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

/**
 * A strict-grid doc wrapping the given blocks in one 1-col stack row — the
 * valid-shape equivalent of the old `{ type: 'doc', content: [...blocks] }`.
 * For seeding editor content from a bare block list (dev fixtures, tests).
 */
export function stackDocJSON(...blocks: JSONContent[]): JSONContent {
    return {
        type: 'doc',
        content: [
            {
                type: 'row',
                attrs: { gridLines: 'inherit' },
                content: [{ type: 'column', content: blocks }],
            },
        ],
    };
}

/**
 * Wrap a bare block stream (e.g. the markdown importer's flat output) into a
 * strict-grid doc: consecutive bare blocks collapse into 1-col stack rows,
 * `sectionBreak` markers pass through at the top level. The bridge for content
 * produced outside the strict editor until the importer itself emits the strict
 * tree (slice 2 / T8, which also maps a ```columns``` fence to a multi-col row).
 */
export function wrapBlocksStrict(blocks: JSONContent[]): JSONContent {
    const content: JSONContent[] = [];
    let pending: JSONContent[] = [];
    const flush = (): void => {
        if (pending.length === 0) return;
        content.push({
            type: 'row',
            attrs: { gridLines: 'inherit' },
            content: [{ type: 'column', content: pending }],
        });
        pending = [];
    };
    for (const node of blocks) {
        if (node.type === 'sectionBreak' || node.type === 'row') {
            flush();
            content.push(node);
        } else {
            pending.push(node);
        }
    }
    flush();
    // Never emit an empty doc — the schema requires ≥1 (sectionBreak | row).
    if (content.length === 0) return emptyDocJSON();
    return { type: 'doc', content };
}
