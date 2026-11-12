// =============================================================================
// tableAt.ts — the table the caret is in, and which of its columns are
// selected (tables GUI amendment 2026-11-12). Kept apart from tableCommands so
// the editor's eager chunk carries only this check; the toolbar and its
// commands load the first time a teacher works in a table.
// =============================================================================

import type { EditorState } from '@tiptap/pm/state';
import { isInTable, selectedRect } from '@tiptap/pm/tables';
import type { Align } from '../lib/tableAligns';

export interface TableAt {
    pos: number;
    /** The caret's columns, [left, right). */
    left: number;
    right: number;
    /** The selection covers every row / every column (a delete would empty
     *  the table; prosemirror-tables refuses it only at dispatch, so `can()`
     *  can't tell). */
    allRows: boolean;
    allColumns: boolean;
    aligns: Align[] | null;
}

export function tableAt(state: EditorState): TableAt | null {
    if (!isInTable(state)) return null;
    try {
        const rect = selectedRect(state);
        const pos = rect.tableStart - 1;
        const aligns = (state.doc.nodeAt(pos)?.attrs.columnAligns as Align[] | null | undefined) ?? null;
        return {
            pos,
            left: rect.left,
            right: rect.right,
            allRows: rect.top === 0 && rect.bottom === rect.map.height,
            allColumns: rect.left === 0 && rect.right === rect.map.width,
            aligns,
        };
    } catch {
        return null;
    }
}
