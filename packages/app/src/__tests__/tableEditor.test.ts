// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { Editor, getSchema } from '@tiptap/core';
import { Node as PMNode } from '@tiptap/pm/model';
import {
    ActivityMeta,
    ActivityDocument,
    createEmptyDocument,
    createTableBlock,
    createBlankToken,
    type Block,
    type TableBlock,
} from '@activity/schema';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { activityToTiptap } from '../lib/serialize';
import { toBare, tiptapToActivityBare } from '../lib/serializeTestBridge';

// =============================================================================
// tableEditor.test.ts — the editor half of the table block (Q14, Q15)
// -----------------------------------------------------------------------------
// Two properties that only exist at the seam between ProseMirror and the schema:
//
//   Q15 the tableCellPara WRAPPER is invisible on the wire. The editor needs a
//       block-content cell (prosemirror-tables' selection/paste/repair paths are
//       written against one); the schema stores an inline run. If the flatten
//       and the unflatten ever disagree, a stored cell grows a node the schema
//       has no name for — or loses its content entirely.
//
//   Q14 a blank's id is UNIQUE. It is the response key, so a duplicate makes two
//       gaps share one answer: typing in one fills the other, and the grader
//       marks a single value for what the teacher authored as two questions.
//       Nothing throws, which is why this is pinned rather than trusted.
// =============================================================================

const pmSchema = getSchema(buildEditorExtensions());
const META = ActivityMeta.parse({ title: 'Guard', course: 'Algebra I' });

/** A one-block document, the shape activityToTiptap emits. */
function docWith(block: Block): ActivityDocument {
    const doc = createEmptyDocument({ title: 'Guard' });
    doc.sections[0]!.rows = [
        {
            id: crypto.randomUUID(),
            gridLines: 'inherit',
            columns: [{ id: crypto.randomUUID(), blocks: [block] }],
        },
    ];
    return ActivityDocument.parse(doc);
}

/** A table whose cells carry the full inline alphabet. */
function richTable(): TableBlock {
    const block = createTableBlock();
    block.headerRow = true;
    block.headerColumn = true;
    block.columnAligns = ['left', 'right'];
    block.rows[0]!.cells[0]!.content = [
        { type: 'text', text: 'Kilograms', marks: [{ type: 'bold' }] },
    ];
    block.rows[0]!.cells[1]!.content = [
        { type: 'text', text: 'Cost ', marks: [] },
        { type: 'math_inline', latex: 'x^2' },
        { type: 'hard_break' },
        { type: 'text', text: 'in dollars', marks: [{ type: 'italic' }] },
    ];
    block.rows[1]!.cells[0]!.content = [{ type: 'text', text: '2', marks: [] }];
    block.rows[1]!.cells[1]!.content = [createBlankToken('9.00')];
    return block;
}

describe('Q15 — the cell wrapper is invisible on the wire', () => {
    it('a cell carrying text + marks + math + break + blank round-trips intact', () => {
        const before = richTable();
        const after = tiptapToActivityBare(
            toBare(activityToTiptap(docWith(before))),
            META,
        ).sections[0]!.rows[0]!.columns[0]!.blocks[0] as TableBlock;

        expect(after.type).toBe('table');
        // Structure survives.
        expect(after.rows.length).toBe(before.rows.length);
        expect(after.rows[0]!.cells.length).toBe(2);
        // Content survives, node for node. Ids are re-minted per round trip by
        // convention (block/row/cell ids), so compare the CONTENT.
        expect(after.rows[0]!.cells[1]!.content).toEqual(
            before.rows[0]!.cells[1]!.content,
        );
        expect(after.rows[0]!.cells[0]!.content).toEqual(
            before.rows[0]!.cells[0]!.content,
        );
    });

    it('a blank in a cell keeps its id and its answer key', () => {
        const before = richTable();
        const blankBefore = before.rows[1]!.cells[1]!.content[0] as {
            id: string;
            answer: string;
        };
        const after = tiptapToActivityBare(
            toBare(activityToTiptap(docWith(before))),
            META,
        ).sections[0]!.rows[0]!.columns[0]!.blocks[0] as TableBlock;
        const blankAfter = after.rows[1]!.cells[1]!.content[0] as {
            type: string;
            id: string;
            answer: string;
        };
        expect(blankAfter.type).toBe('blank');
        // The id is the RESPONSE KEY and must survive a save, or a student's
        // stored answers detach from the gap they belong to.
        expect(blankAfter.id).toBe(blankBefore.id);
        expect(blankAfter.answer).toBe('9.00');
    });

    it('header flags and column alignment survive', () => {
        const after = tiptapToActivityBare(
            toBare(activityToTiptap(docWith(richTable()))),
            META,
        ).sections[0]!.rows[0]!.columns[0]!.blocks[0] as TableBlock;
        expect(after.headerRow).toBe(true);
        expect(after.headerColumn).toBe(true);
        expect(after.columnAligns).toEqual(['left', 'right']);
    });

    it('no tableCellPara ever reaches the stored document', () => {
        const after = tiptapToActivityBare(
            toBare(activityToTiptap(docWith(richTable()))),
            META,
        );
        expect(JSON.stringify(after)).not.toContain('tableCellPara');
    });

    it('an EMPTY table opens as a valid editor document rather than throwing', () => {
        // The schema admits rows: [] (a teacher mid-edit); the editor's content
        // expressions do not. The seeding guard in serialize is what stands
        // between a stored empty table and a ProseMirror mount error.
        const empty = createTableBlock();
        empty.rows = [];
        const json = toBare(activityToTiptap(docWith(empty)));
        expect(() => PMNode.fromJSON(pmSchema, json)).not.toThrow();
    });
});

describe('Q14 — a blank id is unique, however the duplicate arrives', () => {
    /** A REAL headless editor, so the repair plugin runs exactly as it does in
     *  the app. Extracting plugins by hand does not work here: several of this
     *  editor's extensions build their plugin from a live `this.editor`. */
    const editorWith = (doc: ActivityDocument): Editor =>
        new Editor({
            element: document.createElement('div'),
            extensions: buildEditorExtensions(),
            // The FULL strict-grid JSON, not toBare's output: toBare unwraps
            // the row/column wrapper for round-trip COMPARISON, and the editor's
            // doc node is `(sectionBreak | row)+`, so mounting the unwrapped
            // shape builds an invalid document that fails on the first edit.
            content: activityToTiptap(doc),
        });

    const blankIds = (editor: Editor): string[] => {
        const ids: string[] = [];
        editor.state.doc.descendants((node) => {
            if (node.type.name === 'blank') ids.push(node.attrs.id as string);
            return true;
        });
        return ids;
    };

    it('duplicating a table ROW remints the copied blank, keeping the original', () => {
        const table = richTable();
        const editor = editorWith(docWith(table));
        const before = blankIds(editor);
        expect(before.length).toBe(1);

        // Copy the blank-bearing row and insert it after itself — what "add a
        // row like this one" does, and the gesture a table makes routine.
        let rowPos = -1;
        let rowNode: PMNode | null = null;
        editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'tableRow' && rowPos === -1) {
                let hasBlank = false;
                node.descendants((child) => {
                    if (child.type.name === 'blank') hasBlank = true;
                    return true;
                });
                if (hasBlank) {
                    rowPos = pos;
                    rowNode = node;
                }
            }
            return true;
        });
        expect(rowPos).toBeGreaterThan(-1);

        editor.view.dispatch(
            editor.state.tr.insert(rowPos + rowNode!.nodeSize, rowNode!),
        );

        const after = blankIds(editor);
        expect(after.length).toBe(2);
        // The pre-existing blank keeps its key (its stored answers stay
        // attached); the copy is the one that becomes a new question.
        expect(after[0]).toBe(before[0]);
        expect(after[1]).not.toBe(before[0]);
        expect(new Set(after).size).toBe(2);
    });

    it('the repair is general — it also fixes a duplicated fill_in_blank', () => {
        // The defect was never table-specific: Duplicate on any blank-bearing
        // block copied node JSON verbatim, ids included.
        const doc = createEmptyDocument({ title: 'Guard' });
        const fib = {
            id: crypto.randomUUID(),
            type: 'fill_in_blank' as const,
            content: [
                { type: 'text' as const, text: 'x = ', marks: [] },
                createBlankToken('4'),
            ],
            skills: [],
        };
        doc.sections[0]!.rows = [
            {
                id: crypto.randomUUID(),
                gridLines: 'inherit',
                columns: [{ id: crypto.randomUUID(), blocks: [fib as Block] }],
            },
        ];
        const editor = editorWith(ActivityDocument.parse(doc));
        const before = blankIds(editor);

        let pos = -1;
        let node: PMNode | null = null;
        editor.state.doc.descendants((n, p) => {
            if (n.type.name === 'fillInBlank' && pos === -1) {
                pos = p;
                node = n;
            }
            return true;
        });
        // Exactly what blockControls' Duplicate does — node JSON, verbatim.
        editor
            .chain()
            .insertContentAt(pos + node!.nodeSize, node!.toJSON())
            .run();

        const after = blankIds(editor);
        expect(after.length).toBe(2);
        expect(new Set(after).size).toBe(2);
        expect(after[0]).toBe(before[0]);
    });
});
