// =============================================================================
// tableCommands.ts — the table toolbar's commands (tables GUI amendment
// 2026-11-12, T-1/T-2): prosemirror-tables' row/column commands, with the
// block's `columnAligns` shifted in the same transaction (lib/tableAligns).
// =============================================================================

import type { Editor } from '@tiptap/core';
import {
    insertColumnAligns,
    removeColumnAligns,
    setColumnAligns,
    type Align,
} from '../lib/tableAligns';
import { tableAt } from './tableAt';

/** Run a table command and write the shifted alignments in one transaction. */
export function runWithAligns(
    editor: Editor,
    command: 'addRowBefore' | 'addRowAfter' | 'addColumnBefore' | 'addColumnAfter' | 'deleteRow' | 'deleteColumn',
): void {
    const at = tableAt(editor.state);
    if (!at) return;
    const next =
        command === 'addColumnBefore'
            ? insertColumnAligns(at.aligns, at.left)
            : command === 'addColumnAfter'
              ? insertColumnAligns(at.aligns, at.right)
              : command === 'deleteColumn'
                ? removeColumnAligns(at.aligns, at.left, at.right)
                : undefined;
    const widthBefore = editor.state.doc.nodeAt(at.pos)?.firstChild?.childCount ?? 0;
    const chain = editor.chain()[command]();
    if (next !== undefined) {
        chain.command(({ tr }) => {
            // Only when the column really went in or out: a chain dispatches
            // even if the table command refused (Fable review), and the
            // alignments must not shift under an unchanged table.
            const table = tr.doc.nodeAt(at.pos);
            if (table?.type.name !== 'table') return true;
            if ((table.firstChild?.childCount ?? 0) === widthBefore) return true;
            tr.setNodeAttribute(at.pos, 'columnAligns', next);
            return true;
        });
    }
    chain.run();
}

export function setAlign(editor: Editor, align: Align): void {
    const at = tableAt(editor.state);
    if (!at) return;
    const next = setColumnAligns(at.aligns, at.left, at.right, align);
    editor
        .chain()
        .command(({ tr }) => {
            tr.setNodeAttribute(at.pos, 'columnAligns', next);
            return true;
        })
        .run();
}
