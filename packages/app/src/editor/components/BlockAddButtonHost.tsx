import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Editor } from '@tiptap/react';
import { NodeSelection } from 'prosemirror-state';
import { Plus } from 'lucide-react';

// ============================================================================
// BlockAddButtonHost — the "insert a block" affordance, docked at the hovered
// block's BOTTOM-LEFT corner.
// ----------------------------------------------------------------------------
// Split out of the DragHandle's gutter cluster (which now carries only the drag
// grip, top-left). Separating the two affordances declutters the gutter and —
// more importantly — moves the "+" to where the new block actually lands: BELOW
// the block you're pointing at (the Notion convention). A "+" pinned top-left
// implied "above", which fought the insert direction.
//
// Single root host, canvas-relative, fed the hovered block by the gutter
// DragHandle (same `hoveredPos` the quick-bar consumes) — never per-block. It
// mirrors BlockQuickBarHost's measure-in-rAF anchoring and, crucially, its
// STAY-ALIVE grace: the button sits just outside the ProseMirror content, so the
// DragHandle reports "left the block" as the pointer travels down to it. We hold
// the target while the pointer is on the button and clear on a short timer
// otherwise, so it stays reachable on pure hover.
// ============================================================================

const CLEAR_GRACE_MS = 160;

interface BlockAddButtonHostProps {
    editor: Editor | null;
    canvasRef: RefObject<HTMLDivElement | null>;
    /** The block under the pointer, reported by the gutter DragHandle. */
    hoveredPos: number | null;
    /** Open the block picker to insert AT this doc position (below the block). */
    onAdd: (pos: number) => void;
}

export default function BlockAddButtonHost({
    editor,
    canvasRef,
    hoveredPos,
    onAdd,
}: BlockAddButtonHostProps) {
    const [activePos, setActivePos] = useState<number | null>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(
        null,
    );
    // Pointer is over the button itself — freeze the target so it can't move or
    // clear out from under the click.
    const onBtnRef = useRef(false);
    const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Phase 1 — the active block is the hovered one. Suppressed while a block is
    // node-selected (the command bar owns that state). Grace timer lets the
    // pointer travel from the block to the button (just outside it) without it
    // vanishing.
    useEffect(() => {
        if (!editor) return;

        const cancelClear = () => {
            if (clearTimer.current) {
                clearTimeout(clearTimer.current);
                clearTimer.current = null;
            }
        };
        const scheduleClear = () => {
            if (clearTimer.current) return;
            clearTimer.current = setTimeout(() => {
                clearTimer.current = null;
                if (!onBtnRef.current) setActivePos(null);
            }, CLEAR_GRACE_MS);
        };

        const update = () => {
            if (onBtnRef.current) {
                cancelClear();
                return;
            }
            if (editor.state.selection instanceof NodeSelection) {
                cancelClear();
                setActivePos((prev) => (prev === null ? prev : null));
                return;
            }
            if (hoveredPos !== null) {
                cancelClear();
                setActivePos((prev) => (prev === hoveredPos ? prev : hoveredPos));
            } else {
                scheduleClear();
            }
        };

        editor.on('selectionUpdate', update);
        editor.on('transaction', update);
        update();
        return () => {
            editor.off('selectionUpdate', update);
            editor.off('transaction', update);
            cancelClear();
        };
    }, [editor, hoveredPos]);

    // Phase 2 — measure the anchor (rAF, after paint): the block's bottom-left
    // corner, canvas-relative. The CSS pulls the button left into the gutter and
    // straddles the bottom edge.
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
            setPosition({ top: br.bottom - cr.top, left: br.left - cr.left });
        });
        return () => cancelAnimationFrame(raf);
    }, [editor, activePos, canvasRef]);

    if (!editor || activePos === null || !position) return null;

    const handleAdd = () => {
        const node = editor.state.doc.nodeAt(activePos);
        if (!node) return;
        // Insert AFTER the block (its start pos + its size) — i.e. below it.
        onAdd(activePos + node.nodeSize);
    };

    return (
        <button
            type="button"
            className="block-gutter-add block-gutter-add--floating"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            aria-label="Insert a block below"
            title="Insert a block below"
            // Don't steal the caret / move the selection when clicking.
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => {
                onBtnRef.current = true;
            }}
            onMouseLeave={() => {
                onBtnRef.current = false;
                clearTimer.current = setTimeout(() => {
                    clearTimer.current = null;
                    if (!onBtnRef.current) setActivePos(null);
                }, CLEAR_GRACE_MS);
            }}
            onClick={handleAdd}
        >
            <Plus size={14} aria-hidden="true" />
        </button>
    );
}
