import { Extension, type Editor } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import type { ResolvedPos } from '@tiptap/pm/model';

// =============================================================================
// RowSeamCaret — the strict grid's explicit seam caret (slice 2 / A3).
// -----------------------------------------------------------------------------
// Rows are `isolating`, so native Enter/Backspace live inside a column and can't
// silently merge across the row↔row seam (transparent cross-row merge is
// deferred to the Notion-hybrid paradigm — TENSION-1). This keeps the seam from
// reading as a FROZEN editor:
//
//   • Boundary Backspace — at the very start of a stack row's first block,
//     Backspace can't join into the previous row (the isolating boundary). A
//     bare no-op reads as "the editor is broken" (outside-voice #7). Instead we
//     SELECT the previous top-level node (row / sectionBreak) — visible feedback,
//     and a second Backspace deletes it. At the doc's first row we fall through.
//   • Cross-seam arrow nav — Down at a row's end / Up at a row's start steps the
//     caret into the neighbouring row's nearest text (a sectionBreak seam is
//     selected), so the caret never sticks at a seam.
//
// (The in-app Browser pane delivers key events unreliably to the editor, so the
// behaviour here is verified by Playwright, not manual dogfooding.)
// =============================================================================

// The caret sits at the very START of a top-level stack row (first char of the
// first block of the first column of a depth-1 row).
function atRowStart($from: ResolvedPos): boolean {
    return (
        $from.depth === 3 &&
        $from.node(2).type.name === 'column' &&
        $from.node(1).type.name === 'row' &&
        $from.parentOffset === 0 &&
        $from.index(2) === 0 &&
        $from.index(1) === 0
    );
}

// The caret sits at the very END of a top-level stack row (last char of the last
// block of the last column of a depth-1 row).
function atRowEnd($from: ResolvedPos): boolean {
    if (
        $from.depth !== 3 ||
        $from.node(2).type.name !== 'column' ||
        $from.node(1).type.name !== 'row'
    ) {
        return false;
    }
    const column = $from.node(2);
    const row = $from.node(1);
    return (
        $from.parentOffset === $from.parent.content.size &&
        $from.index(2) === column.childCount - 1 &&
        $from.index(1) === row.childCount - 1
    );
}

// Place a collapsed text caret at the nearest valid text position to `pos`,
// searching in `bias` direction so it dives into the neighbouring row's
// paragraph rather than resting at the row/column boundary.
function caretNear(editor: Editor, pos: number, bias: 1 | -1): boolean {
    return editor.commands.command(({ tr, dispatch }) => {
        const sel = TextSelection.near(tr.doc.resolve(pos), bias);
        if (dispatch) dispatch(tr.setSelection(sel).scrollIntoView());
        return true;
    });
}

export const RowSeamCaret = Extension.create({
    name: 'rowSeamCaret',

    addKeyboardShortcuts() {
        return {
            Backspace: ({ editor }) => {
                const { selection } = editor.state;
                if (!(selection instanceof TextSelection) || !selection.empty) {
                    return false;
                }
                if (!atRowStart(selection.$from)) return false;
                const rowPos = selection.$from.before(1);
                const before = editor.state.doc.resolve(rowPos).nodeBefore;
                if (!before) return false; // first row — let default no-op
                // Visible feedback instead of a frozen no-op: select the seam
                // node the caret is pressing against.
                return editor.commands.setNodeSelection(rowPos - before.nodeSize);
            },

            ArrowDown: ({ editor }) => {
                const { selection } = editor.state;
                if (!(selection instanceof TextSelection) || !selection.empty) {
                    return false;
                }
                if (!atRowEnd(selection.$from)) return false;
                const rowPos = selection.$from.before(1);
                const rowNode = editor.state.doc.nodeAt(rowPos);
                if (!rowNode) return false;
                const afterRow = rowPos + rowNode.nodeSize;
                const next = editor.state.doc.resolve(afterRow).nodeAfter;
                if (!next) return false; // last node — let default handle
                if (next.type.name === 'sectionBreak') {
                    return editor.commands.setNodeSelection(afterRow);
                }
                return caretNear(editor, afterRow, 1);
            },

            ArrowUp: ({ editor }) => {
                const { selection } = editor.state;
                if (!(selection instanceof TextSelection) || !selection.empty) {
                    return false;
                }
                if (!atRowStart(selection.$from)) return false;
                const rowPos = selection.$from.before(1);
                const before = editor.state.doc.resolve(rowPos).nodeBefore;
                if (!before) return false; // first node — let default handle
                const prevPos = rowPos - before.nodeSize;
                if (before.type.name === 'sectionBreak') {
                    return editor.commands.setNodeSelection(prevPos);
                }
                return caretNear(editor, rowPos, -1);
            },
        };
    },
});
