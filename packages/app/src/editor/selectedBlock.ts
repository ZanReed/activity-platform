// =============================================================================
// selectedBlock.ts — which block a selection hands to the block command bar
// (tables GUI amendment 2026-11-12; Fable review)
// -----------------------------------------------------------------------------
// A block is "selected" by a NodeSelection — except a table, which is never
// node-selected: prosemirror-tables turns selecting a table into a
// CellSelection over ALL its cells. That whole-table CellSelection names the
// table (it is what the quick-bar's ⚙ produces). A drag over SOME cells is
// cell editing, not a block selection, so it names nothing.
//
// Both bars read this one predicate, so they can't disagree about whether a
// block is selected (they never show together).
// =============================================================================

import type { Node as PMNode } from '@tiptap/pm/model';
import { NodeSelection, type Selection } from '@tiptap/pm/state';
import { CellSelection, TableMap } from '@tiptap/pm/tables';

export function selectedBlock(selection: Selection): { node: PMNode; pos: number } | null {
    if (selection instanceof NodeSelection) return { node: selection.node, pos: selection.from };
    if (!(selection instanceof CellSelection)) return null;
    const $cell = selection.$anchorCell;
    for (let d = $cell.depth; d > 0; d--) {
        const table = $cell.node(d);
        if (table.type.name !== 'table') continue;
        const map = TableMap.get(table);
        let count = 0;
        selection.forEachCell(() => {
            count += 1;
        });
        return count === map.width * map.height ? { node: table, pos: $cell.before(d) } : null;
    }
    return null;
}
