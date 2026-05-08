// packages/app/src/editor/extensions/BlockReorderShortcuts.ts
import { Editor, Extension } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

/**
 * Keyboard shortcuts for reordering top-level blocks. The keyboard-equivalent
 * of the drag handle, since dragging is a mouse-only gesture.
 *
 *   Mod-Shift-ArrowUp:   move current block up
 *   Mod-Shift-ArrowDown: move current block down
 *
 * Mod = Cmd on macOS, Ctrl elsewhere. Matches Tiptap's move-node-button
 * convention for cross-tool muscle-memory consistency.
 *
 * Operates on top-level blocks (immediate children of the document). Inside
 * a list or other nested structure the shortcut no-ops; nested reordering
 * is a future enhancement.
 *
 * Within the editor this overrides macOS's "extend selection to start of
 * document." Users who need that can still use Mod-Shift-Home.
 */
export const BlockReorderShortcuts = Extension.create({
    name: 'blockReorderShortcuts',

    addKeyboardShortcuts() {
        return {
            'Mod-Shift-ArrowUp': () => moveBlock(this.editor, 'up'),
                                                      'Mod-Shift-ArrowDown': () => moveBlock(this.editor, 'down'),
        };
    },
});

function moveBlock(editor: Editor, direction: 'up' | 'down'): boolean {
    const { state, view } = editor;
    const { $from } = state.selection;

    // Top-level blocks only. depth < 1 would mean the cursor is at the doc
    // root itself (shouldn't happen normally); depth > 1 means nested.
    if ($from.depth !== 1) return false;

    const blockStart = $from.before(1);
    const blockEnd = $from.after(1);
    const blockNode = state.doc.nodeAt(blockStart);
    if (!blockNode) return false;

    const offsetInBlock = $from.pos - blockStart;
    const tr = state.tr;
    let cursorTarget: number;

    if (direction === 'up') {
        const prev = state.doc.resolve(blockStart).nodeBefore;
        if (!prev) return false; // already at top

        const insertAt = blockStart - prev.nodeSize;
        tr.delete(blockStart, blockEnd);
        tr.insert(insertAt, blockNode);
        cursorTarget = insertAt + offsetInBlock;
    } else {
        const next = state.doc.resolve(blockEnd).nodeAfter;
        if (!next) return false; // already at bottom

        // After deletion, the next block shifts left to occupy [blockStart,
        // blockStart + next.nodeSize). Insert the moved block immediately
        // after that range.
        tr.delete(blockStart, blockEnd);
        const insertAt = blockStart + next.nodeSize;
        tr.insert(insertAt, blockNode);
        cursorTarget = insertAt + offsetInBlock;
    }

    tr.setSelection(TextSelection.near(tr.doc.resolve(cursorTarget)));
    view.dispatch(tr);
    return true;
}
