import { Extension } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

// ============================================================================
// SelectBlock — Esc lifts a text caret to a block NodeSelection (slice-6
// stage 2). The four-state model makes Select the SECONDARY state, reached
// deliberately: click stays edit (caret), and Esc from text selects the block
// the caret sits in, revealing its docked command bar (BlockCommandBarHost).
//
// Safe against the other Escape handlers in the editor: the math field, image
// resize, and every popover own Escape only while THEY hold focus — at which
// point ProseMirror does not, so this keymap shortcut never runs. The slash
// menu consumes Escape from its own suggestion plugin while open. So this fires
// only for a plain collapsed caret in ordinary text, exactly when "exit editing
// → select this block" is the natural meaning.
// ============================================================================

export const SelectBlock = Extension.create({
    name: 'selectBlock',

    addKeyboardShortcuts() {
        return {
            Escape: ({ editor }) => {
                const { selection } = editor.state;
                // Only a collapsed text caret becomes a block selection; a range
                // selection or an existing NodeSelection falls through.
                if (!(selection instanceof TextSelection) || !selection.empty) {
                    return false;
                }
                const { $from } = selection;
                // Select the top-level block — or the inner block when the caret
                // is inside a column cell (mirrors the gutter/insert targeting).
                let d = $from.depth;
                while (d > 1 && $from.node(d - 1).type.name !== 'column') d--;
                if (d < 1) return false;
                const pos = $from.before(d);
                if (!editor.state.doc.nodeAt(pos)) return false;
                return editor.commands.setNodeSelection(pos);
            },
        };
    },
});
