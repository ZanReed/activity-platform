// packages/app/src/editor/extensions/BlockReorderShortcuts.ts
import { Editor, Extension } from '@tiptap/core';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { activeBlockAt } from '../strictGrid';

/**
 * Keyboard shortcuts for reordering blocks within their column stack. The
 * keyboard-equivalent of the drag handle, since dragging is a mouse-only gesture.
 *
 *   Mod-Shift-ArrowUp:   move current block up
 *   Mod-Shift-ArrowDown: move current block down
 *
 * Mod = Cmd on macOS, Ctrl elsewhere. Matches Tiptap's move-node-button
 * convention for cross-tool muscle-memory consistency.
 *
 * Strict grid: every block lives inside a `column`, so this reorders the block
 * among its siblings WITHIN that column (a section's stack, or a multi-col
 * cell). At a column edge it no-ops — crossing rows/columns is a future
 * enhancement. Inside a list or other nested structure it also no-ops.
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

    // The block the caret is in (its parent is a column). null when the caret
    // isn't inside a column cell.
    const active = activeBlockAt(state);
    if (!active) return false;

    const blockStart = active.pos;
    const blockNode = active.node;
    const blockEnd = blockStart + blockNode.nodeSize;

    // Preserve the caret's offset within the block (clamped for node selections
    // resolving before the block).
    const offsetInBlock = Math.max(0, $from.pos - blockStart);
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

/** Can the block at `pos` move that way within its column? (D-5: the command
 *  bar greys Move up on the first block and Move down on the last.) */
export function canMoveBlockAt(editor: Editor, pos: number, direction: 'up' | 'down'): boolean {
    const node = editor.state.doc.nodeAt(pos);
    if (!node) return false;
    const $pos = editor.state.doc.resolve(pos);
    if ($pos.parent.type.name !== 'column') return false;
    return direction === 'up'
        ? $pos.nodeBefore !== null
        : editor.state.doc.resolve(pos + node.nodeSize).nodeAfter !== null;
}

/**
 * Move the block at `pos` one place within its column and keep it SELECTED
 * (D-5, ui-review-group-d.md): the command bar's Move up / Move down, the
 * on-screen twin of ⌘⇧↑ / ⌘⇧↓. The shortcut puts the caret back in the
 * block; this keeps the node selection so the bar stays and a second press
 * moves it again.
 */
export function moveBlockAt(editor: Editor, pos: number, direction: 'up' | 'down'): boolean {
    if (!canMoveBlockAt(editor, pos, direction)) return false;
    const { state, view } = editor;
    const node = state.doc.nodeAt(pos)!;
    const end = pos + node.nodeSize;
    const tr = state.tr;
    let insertAt: number;
    if (direction === 'up') {
        const prev = state.doc.resolve(pos).nodeBefore!;
        insertAt = pos - prev.nodeSize;
        tr.delete(pos, end);
        tr.insert(insertAt, node);
    } else {
        const next = state.doc.resolve(end).nodeAfter!;
        tr.delete(pos, end);
        insertAt = pos + next.nodeSize;
        tr.insert(insertAt, node);
    }
    tr.setSelection(NodeSelection.create(tr.doc, insertAt));
    view.dispatch(tr);
    return true;
}
