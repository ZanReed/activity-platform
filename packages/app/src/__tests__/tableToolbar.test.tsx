// @vitest-environment jsdom
// =============================================================================
// tableToolbar.test.tsx — tables edited in the editor (GUI amendment
// 2026-11-12, T-1…T-7): the toolbar's rows, columns and alignment, alignment
// kept in step with columns, and the drawer's headers / cell labels, all read
// back through the save path.
// =============================================================================

import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { ActivityMeta, type TableBlock } from '@activity/schema';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { tiptapToActivity } from '../lib/serialize';
import { buildEditorExtensions } from '../editor/editorExtensions';
import TableToolbarHost from '../editor/components/TableToolbarHost';
import { runWithAligns } from '../editor/tableCommands';
import { selectedBlock } from '../editor/selectedBlock';
import { NodeSelection } from '@tiptap/pm/state';
import { CellSelection } from '@tiptap/pm/tables';
import { controlsFor, hasConfigurableControls } from '../editor/blockControls';
import {
    headerAttrsOf,
    headerChoiceOf,
    insertColumnAligns,
    normalizeAligns,
    removeColumnAligns,
    setColumnAligns,
} from '../lib/tableAligns';

afterEach(cleanup);

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
    // The bar is a lazy chunk. Load (and transform) it once up front, so a
    // test's wait for it is never racing a cold module load (a flake seen
    // under load, 2026-11-12).
    await import('../editor/components/TableToolbar');
    // jsdom has no layout: Range lacks the rect methods ProseMirror's
    // scroll-into-view calls (deleteTable scrolls). Stub them for this file.
    const empty = () => ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}) });
    Range.prototype.getClientRects ??= (() => []) as unknown as Range['getClientRects'];
    Range.prototype.getBoundingClientRect ??= empty as unknown as Range['getBoundingClientRect'];
});
const META = ActivityMeta.parse({ title: 'T', course: 'Y9' });

describe('tableAligns', () => {
    it('keeps alignment with its column through inserts and deletes', async () => {
        expect(insertColumnAligns(['left', 'right'], 1)).toEqual(['left', 'left', 'right']);
        expect(insertColumnAligns(['left', 'right'], 2)).toEqual(['left', 'right']);
        expect(removeColumnAligns(['left', 'right', 'center'], 1, 2)).toEqual(['left', 'center']);
        expect(removeColumnAligns(['right'], 0, 1)).toBeNull();
        expect(setColumnAligns(null, 2, 3, 'right')).toEqual(['left', 'left', 'right']);
        expect(setColumnAligns(['right'], 0, 1, 'left')).toBeNull();
        expect(insertColumnAligns(null, 0)).toBeNull();
        expect(normalizeAligns(['left', 'left'])).toBeNull();
    });

    it('maps the header choice to the two booleans and back', async () => {
        for (const c of ['row', 'column', 'both', 'none'] as const) {
            const a = headerAttrsOf(c);
            expect(headerChoiceOf(a.headerRow, a.headerColumn)).toBe(c);
        }
    });
});

const TABLE = ['| x | cost |', '|---|---:|', '| 1 | {{=3}} |', '| 2 | 6 |'].join('\n');

function setup(md = TABLE) {
    const element = document.createElement('div');
    document.body.appendChild(element);
    const editor = new Editor({ element, extensions: buildEditorExtensions(), content: wrapBlocksStrict(convert(md).blocks) });
    return editor;
}
/** Put the caret in the cell at (row, col). */
async function caretIn(editor: Editor, row: number, col: number) {
    let target = -1;
    editor.state.doc.descendants((node, pos) => {
        if (target >= 0) return false;
        if (node.type.name !== 'table') return true;
        const rowNode = node.child(row);
        let offset = pos + 1;
        for (let r = 0; r < row; r++) offset += node.child(r).nodeSize;
        offset += 1;
        for (let c = 0; c < col; c++) offset += rowNode.child(c).nodeSize;
        target = offset + 2; // into the cell's paragraph
        return false;
    });
    act(() => {
        editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, target)));
        editor.view.focus();
    });
    // The bar is a lazy chunk: let React resolve it (the module is preloaded
    // above). Callers that need the bar wait for it with findByRole.
    await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
    });
}
function savedTable(editor: Editor): TableBlock {
    const doc = tiptapToActivity(editor.getJSON(), META);
    for (const s of doc.sections)
        for (const r of s.rows) for (const c of r.columns) for (const b of c.blocks) if (b.type === 'table') return b;
    throw new Error('no table');
}
/** Press a toolbar button, waiting for the (lazy) bar to be there first. */
async function press(name: string) {
    const button = await screen.findByRole('button', { name });
    act(() => void fireEvent.mouseDown(button));
}

describe('the table toolbar (T-1, T-2)', () => {
    it('shows only while the caret is in a table', async () => {
        const editor = setup(['Before.', '', TABLE].join('\n'));
        render(<TableToolbarHost editor={editor} />);
        expect(screen.queryByRole('toolbar', { name: 'Table' })).toBeNull();
        await caretIn(editor, 0, 0);
        expect(await screen.findByRole('toolbar', { name: 'Table' })).toBeTruthy();
        editor.destroy();
    });

    it('adds and deletes rows', async () => {
        const editor = setup();
        render(<TableToolbarHost editor={editor} />);
        await caretIn(editor, 1, 0);
        await press('Add a row below');
        expect(savedTable(editor).rows).toHaveLength(4);
        await press('Delete this row');
        expect(savedTable(editor).rows).toHaveLength(3);
        editor.destroy();
    });

    it('a column added left of the right-aligned column keeps that column right-aligned', async () => {
        const editor = setup();
        render(<TableToolbarHost editor={editor} />);
        expect(savedTable(editor).columnAligns).toEqual(['left', 'right']);
        await caretIn(editor, 0, 1);
        await press('Add a column to the left');
        const t = savedTable(editor);
        expect(t.rows[0]!.cells).toHaveLength(3);
        expect(t.columnAligns).toEqual(['left', 'left', 'right']);
        editor.destroy();
    });

    it('deleting the aligned column takes its alignment with it', async () => {
        const editor = setup();
        render(<TableToolbarHost editor={editor} />);
        await caretIn(editor, 0, 1);
        await press('Delete this column');
        const t = savedTable(editor);
        expect(t.rows[0]!.cells).toHaveLength(1);
        expect(t.columnAligns).toBeUndefined();
        editor.destroy();
    });

    it('sets the caret column’s alignment, and the editor shows it', async () => {
        const editor = setup();
        render(<TableToolbarHost editor={editor} />);
        await caretIn(editor, 0, 0);
        await press('Centre this column');
        expect(savedTable(editor).columnAligns).toEqual(['center', 'right']);
        const firstCell = editor.view.dom.querySelector('td') as HTMLElement;
        expect(firstCell.style.textAlign).toBe('center');
        editor.destroy();
    });

    it('never deletes the last row', async () => {
        const editor = setup(['| a | b |', '|---|---|', '| 1 | 2 |'].join('\n'));
        render(<TableToolbarHost editor={editor} />);
        await caretIn(editor, 0, 0);
        await press('Delete this row');
        expect(savedTable(editor).rows).toHaveLength(1);
        // One row left: the button is off.
        expect((screen.getByRole('button', { name: 'Delete this row' }) as HTMLButtonElement).disabled).toBe(true);
        editor.destroy();
    });

    it('deletes the table and leaves a document that still saves', async () => {
        const editor = setup(['Before.', '', TABLE].join('\n'));
        render(<TableToolbarHost editor={editor} />);
        await caretIn(editor, 0, 0);
        await press('Delete the table');
        expect(() => savedTable(editor)).toThrow('no table');
        expect(JSON.stringify(tiptapToActivity(editor.getJSON(), META))).toContain('Before.');
        editor.destroy();
    });
});

describe('the table settings (T-3, T-4)', () => {
    function tablePos(editor: Editor): number {
        let at = -1;
        editor.state.doc.descendants((n, p) => {
            if (at < 0 && n.type.name === 'table') at = p;
            return at < 0;
        });
        return at;
    }

    it('the table has settings, and the header choice reaches the save', async () => {
        expect(hasConfigurableControls('table')).toBe(true);
        const editor = setup();
        const headers = controlsFor('table')!.simple!.find((f) => f.label === 'Headers')!;
        if (headers.kind !== 'select') throw new Error('select');
        headers.set(editor, tablePos(editor), 'both');
        expect(savedTable(editor)).toMatchObject({ headerRow: true, headerColumn: true });
        headers.set(editor, tablePos(editor), 'none');
        expect(savedTable(editor)).toMatchObject({ headerRow: false, headerColumn: false });
        expect(headers.get(editor.state.doc.nodeAt(tablePos(editor))!)).toBe('none');
        // The editor shows it: the <table> carries the attrs editor.css styles.
        headers.set(editor, tablePos(editor), 'column');
        const table = editor.view.dom.querySelector('table')!;
        expect(table.getAttribute('data-header-column')).toBe('true');
        expect(table.getAttribute('data-header-row')).toBe('false');
        editor.destroy();
    });

    it('the cell-label toggle reaches the save', async () => {
        const editor = setup();
        const toggle = controlsFor('table')!.simple!.find((f) => f.label === 'Label blank cells')!;
        if (toggle.kind !== 'toggle') throw new Error('toggle');
        toggle.set(editor, tablePos(editor), false);
        expect(savedTable(editor).showCellLabels).toBe(false);
        editor.destroy();
    });

    it('offers the numbering control', async () => {
        expect(controlsFor('table')!.advanced!.some((g) => g.group === 'Numbering')).toBe(true);
    });
});

describe('Fable review 2026-11-12', () => {
    function tableNodePos(editor: Editor): number {
        let at = -1;
        editor.state.doc.descendants((n, p) => {
            if (at < 0 && n.type.name === 'table') at = p;
            return at < 0;
        });
        return at;
    }
    /** The cell positions (for CellSelection) of row 0's cells. */
    function cellPos(editor: Editor, row: number, col: number): number {
        const t = tableNodePos(editor);
        const table = editor.state.doc.nodeAt(t)!;
        let pos = t + 1;
        for (let r = 0; r < row; r++) pos += table.child(r).nodeSize;
        pos += 1;
        for (let c = 0; c < col; c++) pos += table.child(row).child(c).nodeSize;
        return pos;
    }

    it('P1: no bar while the editor is unfocused, even with the caret in a table', async () => {
        const editor = setup();
        render(<TableToolbarHost editor={editor} />);
        expect(editor.isFocused).toBe(false);
        expect(screen.queryByRole('toolbar', { name: 'Table' })).toBeNull();
        editor.destroy();
    });

    it('P1: only a whole-table cell selection names the table for the command bar', async () => {
        const editor = setup();
        const t = tableNodePos(editor);
        const all = CellSelection.create(editor.state.doc, cellPos(editor, 0, 0), cellPos(editor, 2, 1));
        expect(selectedBlock(all)?.pos).toBe(t);
        const some = CellSelection.create(editor.state.doc, cellPos(editor, 0, 0), cellPos(editor, 0, 1));
        expect(selectedBlock(some)).toBeNull();
        const node = NodeSelection.create(editor.state.doc, t);
        expect(selectedBlock(node)?.node.type.name).toBe('table');
        expect(selectedBlock(editor.state.selection)).toBeNull();
        editor.destroy();
    });

    it('P2: a multi-column selection aligns every selected column; mixed shows none pressed', async () => {
        const editor = setup();
        render(<TableToolbarHost editor={editor} />);
        act(() => {
            editor.view.dispatch(
                editor.state.tr.setSelection(CellSelection.create(editor.state.doc, cellPos(editor, 0, 0), cellPos(editor, 0, 1))),
            );
            editor.view.focus();
        });
        await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
        });
        // Columns are left + right: neither alignment is pressed.
        for (const name of ['Align this column left', 'Centre this column', 'Align this column right']) {
            expect(screen.getByRole('button', { name }).getAttribute('aria-pressed')).toBe('false');
        }
        await press('Centre this column');
        expect(savedTable(editor).columnAligns).toEqual(['center', 'center']);
        editor.destroy();
    });

    it('P2: a refused column delete leaves the alignments alone', async () => {
        const editor = setup(['| a |', '|--:|', '| 1 |'].join('\n'));
        await caretIn(editor, 0, 0);
        expect(savedTable(editor).columnAligns).toEqual(['right']);
        act(() => runWithAligns(editor, 'deleteColumn'));
        expect(savedTable(editor).rows[0]!.cells).toHaveLength(1);
        expect(savedTable(editor).columnAligns).toEqual(['right']);
        editor.destroy();
    });

    it('P2: Alt+F10 reaches the bar; arrows move along it; Escape goes back', async () => {
        const editor = setup();
        render(<TableToolbarHost editor={editor} />);
        await caretIn(editor, 0, 0);
        act(() => void fireEvent.keyDown(editor.view.dom, { key: 'F10', altKey: true }));
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Add a row above' }));
        act(() => void fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' }));
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Add a row below' }));
        act(() => void fireEvent.keyDown(document.activeElement!, { key: 'Escape' }));
        expect(editor.isFocused).toBe(true);
        editor.destroy();
    });
});
