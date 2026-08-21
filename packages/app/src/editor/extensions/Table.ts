import { mergeAttributes, Node } from '@tiptap/core';
import {
    Table as TiptapTable,
    TableCell as TiptapTableCell,
    TableRow as TiptapTableRow,
} from '@tiptap/extension-table';
import { labelNodeAttr } from '../labelNodeAttr';

// ============================================================================
// Table — the editor half of the table block.
// ----------------------------------------------------------------------------
// Plan + rulings: docs/design/table-block.md (R5, R6, D7.1).
//
// BUILT ON prosemirror-tables VIA @tiptap/extension-table (ruling R6, gated on a
// measurement that passed: +14.0 KiB gz against 26 KiB of headroom, so the cap
// did not move). What that buys is not markup — it is the fiddly, already-tested
// behaviour nobody should write twice: cell selection, Tab/Shift-Tab across
// cells, row/column commands, and the fixTables repair pass that keeps a table
// rectangular after any structural edit.
//
// THREE DELIBERATE DEPARTURES FROM THE STOCK KIT. Each one exists to make the
// editor able to express EXACTLY what the schema can express, and nothing more —
// the alternative is an editor that can author documents the schema rejects, or
// (worse) that renders one thing and saves another.
//
//  1. CELLS HOLD ONE RESTRICTED PARAGRAPH, NOT `block+` (ruling R5/1B).
//     The schema says a cell is `FillInBlankInline[]` — text, marks, inline
//     math, a hard break, a blank. Stock cells take any block content, which
//     would let a teacher drop a heading, a list, or a whole graph into a cell
//     and then lose it on save. So each cell holds exactly one `tableCellPara`,
//     whose content expression is byte-identical to FillInBlank's body.
//
//     WHY A WRAPPER NODE AT ALL, rather than putting the inline expression
//     straight on the cell: prosemirror-tables assumes cells contain BLOCK
//     content. Its selection, paste and repair paths are written against that,
//     and a bare-inline cell is off the paved path — which is precisely the
//     class of subtle editor bug this repo has paid for twice (the per-chip
//     popover attempt, the `defining: true` drag asymmetry). The wrapper is
//     invisible on the wire: serialize.ts flattens it away, so the stored shape
//     is exactly R1's `content: FillInBlankInline[]`.
//
//  2. THERE IS NO `tableHeader` NODE (ruling R1b).
//     Stock TableKit registers one, which would let a document express a header
//     cell in the MIDDLE of a table. The schema deliberately cannot say that:
//     header-ness is TWO BOOLEANS ON THE BLOCK (`headerRow` / `headerColumn`),
//     because a transposed algebra table needs an axis, not a scatter of flags.
//     Registering a node the schema has no home for is how an editor starts
//     authoring documents that do not round-trip. Pasted `<th>` cells parse into
//     ordinary cells instead (see parseHTML below), and the header STYLING is
//     driven from the block attrs in CSS.
//
//  3. COLSPAN / ROWSPAN ARE PINNED TO 1 (ruling D7.1 — paste hardening).
//     The attrs stay, because prosemirror-tables' TableMap reads them on every
//     structural operation and removing them breaks the plugin outright. What
//     changes is that they can never carry a value: parseHTML forces 1, so a
//     merged cell pasted from Sheets/Docs/Word arrives unmerged, and renderHTML
//     emits nothing, so nothing round-trips. Merged cells are out of scope and
//     not planned (docs/design/table-block.md §10) — and the failure this
//     prevents is the nasty one: a pasted table that RENDERS merged while
//     saving unmerged, so what the teacher sees and what the student gets are
//     different documents. fixTables then repairs the ragged row by filling in
//     the missing cells, which is the behaviour we want and did not write.
// ============================================================================

/**
 * The cell's content wrapper. One per cell, always — the cell's content
 * expression is `tableCellPara` (exactly one, not `+`), so it cannot be split
 * into two paragraphs by an Enter keystroke.
 *
 * Its content expression is copied from FillInBlank deliberately: a cell and a
 * fill-in-blank body hold the same alphabet, and if they ever diverge the
 * schema's single `FillInBlankInline` union has become two things.
 */
export const TableCellPara = Node.create({
    name: 'tableCellPara',
    content: '(text | mathInline | blank)*',
    // NOT draggable and NOT selectable as a block: it is an implementation
    // detail of the cell, not something an author manipulates. The drag handle
    // operates on the TABLE.
    draggable: false,
    selectable: false,
    parseHTML() {
        return [{ tag: 'p[data-cell-para]' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['p', mergeAttributes(HTMLAttributes, { 'data-cell-para': '' }), 0];
    },
});

/** colspan/rowspan, present for the plugin and pinned to 1 for us (§3 above). */
const pinnedToOne = {
    default: 1,
    parseHTML: () => 1,
    renderHTML: () => ({}),
    keepOnSplit: false,
};

export const TableCell = TiptapTableCell.extend({
    content: 'tableCellPara',
    addAttributes() {
        return {
            colspan: pinnedToOne,
            rowspan: pinnedToOne,
            // colwidth drives prosemirror-tables' column resizing, which this
            // slice does not surface; keep the attr (the plugin reads it) and
            // let it stay null.
            colwidth: { default: null },
        };
    },
    parseHTML() {
        // `th` lands here too — see §2. A pasted header row becomes ordinary
        // cells, and the author marks the axis with the block's own toggle.
        return [{ tag: 'td' }, { tag: 'th' }];
    },
});

// The stock row is `(tableCell | tableHeader)*`, which references the node §2
// deliberately does not register — an unregistered name in a content expression
// is a hard schema-build error, so this is not optional. `+` rather than `*`
// because an empty row cannot round-trip: the schema would store `cells: []`
// and re-opening would have to seed one back, quietly adding a cell the author
// never typed. Requiring one means ProseMirror's own createAndFill supplies it.
export const TableRow = TiptapTableRow.extend({
    content: 'tableCell+',
});

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        activityTable: {
            insertActivityTable: () => ReturnType;
        };
    }
}

export const Table = TiptapTable.extend({
    addAttributes() {
        return {
            // Stable UUID at insertion; serialize mints fresh ones per round
            // trip (the existing convention), so this only keeps NodeView
            // identity stable while editing.
            id: {
                default: null as string | null,
                parseHTML: (element) => element.getAttribute('data-id'),
                renderHTML: (attributes) =>
                    attributes.id ? { 'data-id': attributes.id as string } : {},
            },
            // Which axis carries the headers. BLOCK-level, not per cell (§2).
            headerRow: {
                default: true,
                parseHTML: (element) => element.getAttribute('data-header-row') !== 'false',
                renderHTML: (attributes) => ({
                    'data-header-row': String(attributes.headerRow !== false),
                }),
            },
            headerColumn: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-header-column') === 'true',
                renderHTML: (attributes) => ({
                    'data-header-column': String(attributes.headerColumn === true),
                }),
            },
            // The (a)/(b) markers on blank cells, mirroring
            // faded_worked_example's showStepLabels.
            showCellLabels: {
                default: true,
                parseHTML: (element) => element.getAttribute('data-cell-labels') !== 'false',
                renderHTML: (attributes) => ({
                    'data-cell-labels': String(attributes.showCellLabels !== false),
                }),
            },
            // Per-column alignment. NO UI sets this yet — it arrives from the
            // markdown importer's delimiter row (Slice 3) and is carried through
            // round-trips so an imported table's alignment survives editing.
            // Same posture as Column.width, and the same reason: losing authored
            // data because the editor has no control for it yet is a bug.
            columnAligns: {
                default: null as string[] | null,
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-column-aligns');
                    return raw ? raw.split(',') : null;
                },
                renderHTML: (attributes) =>
                    Array.isArray(attributes.columnAligns) && attributes.columnAligns.length > 0
                        ? { 'data-column-aligns': (attributes.columnAligns as string[]).join(',') }
                        : {},
            },
            ...labelNodeAttr,
        };
    },

    addCommands() {
        // The parent's commands (addRowAfter, deleteColumn, …) are inherited
        // wholesale; this adds the ONE the slash menu needs. mergeCells and
        // splitCell are inherited too but deliberately never surfaced in UI —
        // see §3 on why a merged cell must not exist here.
        const parent = this.parent?.();
        return {
            ...parent,
            insertActivityTable:
                () =>
                ({ commands }) =>
                    commands.insertTable({ rows: 3, cols: 2, withHeaderRow: false }),
        };
    },
});
