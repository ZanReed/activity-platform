import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, type Transaction } from '@tiptap/pm/state';
import { Fragment, Slice } from '@tiptap/pm/model';
import type { Node as PMNode, NodeType } from '@tiptap/pm/model';

// =============================================================================
// StrictGridNormalize — the strict grid's normalizing appendTransaction.
// -----------------------------------------------------------------------------
// Three jobs, all keeping the doc in the canonical strict shape after any edit:
//
//   1. EMPTY-STATE backfill — the grammar (sectionBreak | row)+ permits a doc
//      that is all breaks (cursor-homeless). Guarantee at least one stack row
//      with a paragraph, and a stack row after a trailing/adjacent sectionBreak.
//   2. TRAILING paragraph — replaces StarterKit's (doc-level) TrailingNode,
//      which we disable because at the strict-grid doc level its fallback is a
//      bare sectionBreak. Ensure the doc ends with a 1-col stack row whose last
//      block is a paragraph, so there is always a caret home below the last
//      block (click-below-to-type; focus('end') lands in text, not on an atom).
//   3. RE-COALESCE — merge adjacent 1-col stack rows within a section back into
//      ONE (A1: a section is normally one stack row). Splitting a run into
//      before|multi|after and later dissolving the multi row leaves fragments;
//      this recombines them so the next edit sees one stack, not N.
//
// Undo safety (failure-mode table): the fix is RETURNED from appendTransaction,
// so it merges into the triggering edit's history entry — undoing the user
// action also undoes the normalization (no "undo does nothing" loop). It runs
// only when the doc actually changed and never on a history (undo/redo)
// transaction, and every rule is idempotent (a normalized doc yields no fix).
// =============================================================================

const key = new PluginKey('strictGridNormalize');

// Paste guard (T5, CRITICAL — silent data loss otherwise). The caret always
// sits inside a `column`, so a pasted slice that carries structural nodes
// (`row` / `sectionBreak`, e.g. copied across rows in the strict editor) can't
// be fitted there and ProseMirror would drop or mis-split it. Flatten such a
// slice to its column-legal leaf blocks in document order: unwrap every row to
// its columns' blocks and drop section breaks. Slices with no structural nodes
// (plain text, a single block's inline content, external HTML) pass through
// untouched so normal paste behaviour is unchanged. (Preserving a pasted
// multi-col region AS columns by splitting the host row is deferred to slice 2.)
function flattenPastedSlice(slice: Slice): Slice {
    let hasStructural = false;
    slice.content.descendants((node) => {
        if (node.type.name === 'row' || node.type.name === 'sectionBreak') {
            hasStructural = true;
            return false;
        }
        return true;
    });
    if (!hasStructural) return slice;

    const blocks: PMNode[] = [];
    slice.content.forEach((node) => {
        const name = node.type.name;
        if (name === 'sectionBreak') return; // drop — invalid in a column
        if (name === 'row') {
            node.forEach((col) => col.forEach((b) => blocks.push(b)));
        } else if (name === 'column') {
            node.forEach((b) => blocks.push(b));
        } else {
            blocks.push(node); // already a column-legal block
        }
    });
    // openStart/openEnd 0: the flattened blocks paste as whole nodes.
    return new Slice(Fragment.fromArray(blocks), 0, 0);
}

function isTextblock(node: PMNode): boolean {
    return node.isTextblock;
}

function isEmptyStackRow(node: PMNode): boolean {
    if (node.type.name !== 'row' || node.childCount !== 1) return false;
    const col = node.firstChild!;
    return (
        col.childCount === 1 &&
        col.firstChild!.type.name === 'paragraph' &&
        col.firstChild!.content.size === 0
    );
}

/** Build a fresh 1-col stack row holding one empty paragraph. */
function emptyStackRow(
    rowType: NodeType,
    columnType: NodeType,
    paragraphType: NodeType,
): PMNode | null {
    const para = paragraphType.createAndFill();
    if (!para) return null;
    const column = columnType.create(null, para);
    return rowType.create({ id: crypto.randomUUID() }, column);
}

// Compute and apply the normalization onto `tr`; returns true if it changed tr.
function normalize(tr: Transaction): boolean {
    const rowType = tr.doc.type.schema.nodes.row;
    const columnType = tr.doc.type.schema.nodes.column;
    const paragraphType = tr.doc.type.schema.nodes.paragraph;
    if (!rowType || !columnType || !paragraphType) return false;

    let changed = false;

    // --- 1. Empty-state / cursor-home for a trailing or leading sectionBreak.
    // A doc with no `row` at all, or ending in a sectionBreak, has no place for
    // the caret in its last section — backfill a stack row at the end.
    const lastTop = tr.doc.lastChild;
    if (!lastTop || lastTop.type.name === 'sectionBreak') {
        const row = emptyStackRow(rowType, columnType, paragraphType);
        if (row) {
            tr.insert(tr.doc.content.size, row);
            changed = true;
        }
    }

    // --- 2. Trailing paragraph: the doc must end in a 1-col stack row whose
    // last block is a paragraph (a caret home below the last block). Append a
    // trailing stack row when the last row is multi-col or ends in a non-text
    // block (image / graph / …).
    const tail = tr.doc.lastChild;
    if (tail && tail.type.name === 'row') {
        const isStack = tail.childCount === 1;
        const lastBlock = isStack ? tail.firstChild!.lastChild : null;
        const endsInText = !!lastBlock && isTextblock(lastBlock);
        if (!isStack || !endsInText) {
            const row = emptyStackRow(rowType, columnType, paragraphType);
            if (row) {
                tr.insert(tr.doc.content.size, row);
                changed = true;
            }
        }
    }

    // --- 3. Re-coalesce adjacent 1-col stack rows (sectionBreaks are barriers).
    // Merge each stack row into its stack predecessor, right-to-left so an
    // already-processed tail can't shift the pair we're about to merge. A
    // multi-col row or a sectionBreak breaks the run. Recompute positions from
    // the live tr.doc each step (a merge removes a row). The empty TRAILING line
    // is left alone so this never fights the trailing-paragraph rule.
    let i = tr.doc.childCount - 1;
    while (i >= 1) {
        const cur = tr.doc.child(i);
        const prev = tr.doc.child(i - 1);
        const mergeable =
            cur.type.name === 'row' &&
            cur.childCount === 1 &&
            prev.type.name === 'row' &&
            prev.childCount === 1 &&
            !isEmptyStackRow(cur) &&
            !isEmptyStackRow(prev);
        if (mergeable) {
            // cur's start = sum of the sizes of the rows before it.
            let curStart = 0;
            for (let j = 0; j < i; j++) curStart += tr.doc.child(j).nodeSize;
            const prevStart = curStart - prev.nodeSize;
            // End of prev's (sole) column content = just inside its closing token.
            const prevColEnd = prevStart + prev.nodeSize - 2;
            const curCol = cur.firstChild!;
            const blocks: PMNode[] = [];
            for (let k = 0; k < curCol.childCount; k++) blocks.push(curCol.child(k));
            tr.delete(curStart, curStart + cur.nodeSize);
            tr.insert(prevColEnd, blocks);
            changed = true;
        }
        i -= 1;
    }

    return changed;
}

export const StrictGridNormalize = Extension.create({
    name: 'strictGridNormalize',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key,
                props: {
                    // Flatten structural nodes out of a pasted slice so blocks
                    // land in the target column instead of being dropped (T5).
                    transformPasted: (slice) => flattenPastedSlice(slice),
                },
                appendTransaction: (transactions, _oldState, newState) => {
                    if (!transactions.some((t) => t.docChanged)) return null;
                    // Never fight history: undo/redo restores an already-valid
                    // (previously-normalized) doc, so re-normalizing would strand
                    // a fix outside the history entry.
                    if (transactions.some((t) => t.getMeta('history$'))) return null;
                    const tr = newState.tr;
                    // NOT addToHistory:false — the fix MERGES into the triggering
                    // edit's history entry, so undo reverts the edit AND its
                    // normalization together (no "undo does nothing" loop).
                    const changed = normalize(tr);
                    return changed ? tr : null;
                },
            }),
        ];
    },
});
