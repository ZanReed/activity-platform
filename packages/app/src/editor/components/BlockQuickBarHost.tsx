import { useEffect, useState, type RefObject } from 'react';
import type { Editor } from '@tiptap/react';
import { NodeSelection, TextSelection } from 'prosemirror-state';
import { Trash2, MoreVertical } from 'lucide-react';

// ============================================================================
// BlockQuickBarHost — the always-discoverable block affordance (slice 6).
// ----------------------------------------------------------------------------
// Dogfooding showed the four-state model hid block actions too well: select
// (which reveals the docked command bar) was only reachable via grip-click or
// Esc, which a real teacher never found. This host fixes that: a small quiet
// [Delete][More] control that appears top-right of a block whenever it's
// HOVERED or has the CARET in it — no gesture to discover, and "while editing"
// visibility is what makes it work on touch (iPad: tap to edit → it shows).
//
//   • Delete (trash) removes the block in one click.
//   • More (⋮) selects the block → the full command bar takes over (its ⋮
//     path also sidesteps the grip's 2-click select bug).
//
// Single root host, one anchor (mirrors BlockCommandBarHost) — never per-block.
// Mutually exclusive with the full command bar: it hides the moment a block is
// node-selected, so the full bar owns that state and the two never stack.
// ============================================================================

interface BlockQuickBarHostProps {
    editor: Editor | null;
    canvasRef: RefObject<HTMLDivElement | null>;
    /** The block under the pointer, reported by the gutter DragHandle. */
    hoveredPos: number | null;
}

/** The top-level (or column-cell) block containing a caret, or null. */
function caretBlockPos(editor: Editor): number | null {
    const { selection } = editor.state;
    if (!(selection instanceof TextSelection)) return null;
    const { $from } = selection;
    let d = $from.depth;
    while (d > 1 && $from.node(d - 1).type.name !== 'column') d--;
    return d >= 1 ? $from.before(d) : null;
}

export default function BlockQuickBarHost({
    editor,
    canvasRef,
    hoveredPos,
}: BlockQuickBarHostProps) {
    const [activePos, setActivePos] = useState<number | null>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(
        null,
    );

    // Phase 1 — the active block is the hovered one, else the caret's block.
    // Suppressed while a block is node-selected: the full command bar owns that.
    useEffect(() => {
        if (!editor) return;
        const update = () => {
            if (editor.state.selection instanceof NodeSelection) {
                setActivePos((prev) => (prev === null ? prev : null));
                return;
            }
            const next = hoveredPos ?? caretBlockPos(editor);
            setActivePos((prev) => (prev === next ? prev : next));
        };
        editor.on('selectionUpdate', update);
        editor.on('transaction', update);
        update();
        return () => {
            editor.off('selectionUpdate', update);
            editor.off('transaction', update);
        };
    }, [editor, hoveredPos]);

    // Phase 2 — measure the anchor (rAF, after paint), top-right, canvas-relative.
    useEffect(() => {
        if (!editor || activePos === null) {
            setPosition(null);
            return;
        }
        const raf = requestAnimationFrame(() => {
            const canvas = canvasRef.current;
            const dom = editor.view.nodeDOM(activePos);
            if (!canvas || !(dom instanceof HTMLElement)) {
                setPosition(null);
                return;
            }
            const cr = canvas.getBoundingClientRect();
            const br = dom.getBoundingClientRect();
            setPosition({ top: br.top - cr.top, left: br.right - cr.left });
        });
        return () => cancelAnimationFrame(raf);
    }, [editor, activePos, canvasRef]);

    if (!editor || activePos === null || !position) return null;

    const deleteBlock = () => {
        const node = editor.state.doc.nodeAt(activePos);
        if (!node) return;
        editor
            .chain()
            .deleteRange({ from: activePos, to: activePos + node.nodeSize })
            .run();
    };

    const selectBlock = () => {
        editor.chain().setNodeSelection(activePos).run();
    };

    return (
        <div
            className="block-quickbar"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            // Don't steal the caret / move the selection when clicking — the
            // buttons' onClick drives the action explicitly.
            onMouseDown={(e) => e.preventDefault()}
        >
            <button
                type="button"
                className="block-quickbar__btn block-quickbar__btn--danger"
                title="Delete block"
                aria-label="Delete block"
                onClick={deleteBlock}
            >
                <Trash2 size={14} aria-hidden="true" />
            </button>
            <button
                type="button"
                className="block-quickbar__btn"
                title="More actions"
                aria-label="More actions"
                onClick={selectBlock}
            >
                <MoreVertical size={14} aria-hidden="true" />
            </button>
        </div>
    );
}
