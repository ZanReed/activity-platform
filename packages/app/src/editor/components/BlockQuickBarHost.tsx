import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Editor } from '@tiptap/react';
import { NodeSelection, TextSelection } from 'prosemirror-state';
import { Trash2, Copy, Settings } from 'lucide-react';

// ============================================================================
// BlockQuickBarHost — the always-discoverable block affordance (slice 6).
// ----------------------------------------------------------------------------
// Dogfooding showed the four-state model hid block actions too well: select was
// only reachable via grip-click or Esc, which a real teacher never found. This
// host fixes that: a small quiet row of icon buttons that appears top-right of
// a block whenever it's HOVERED or has the CARET in it — no gesture to
// discover, and "while editing" visibility is what makes it work on touch
// (iPad: tap to edit → it shows). Each button has a text tooltip on hover.
//
//   • Delete (trash)      — remove the block in one click.
//   • Duplicate (copy)    — clone the block below.
//   • Settings (gear)     — select the block → the full command bar (its
//                           block-specific primary + the Advanced drawer).
//
// Single root host, one anchor (mirrors BlockCommandBarHost) — never per-block.
// Hides the moment a block is node-selected (the full bar owns that state).
//
// STAY-ALIVE: the bar is anchored just OUTSIDE the ProseMirror content, so the
// gutter DragHandle reports "left the block" as the pointer travels toward the
// buttons, which would unmount the bar before the click lands. We keep it alive
// while the pointer is on the bar, and clear on a short grace timer otherwise,
// so you can reach the buttons on pure hover (no need to click into the editor
// first).
// ============================================================================

const CLEAR_GRACE_MS = 160;

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
    // Pointer is over the bar itself — freeze the target so it can't move or
    // clear out from under the click.
    const onBarRef = useRef(false);
    const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Phase 1 — the active block is the hovered one, else the caret's block.
    // Suppressed while a block is node-selected (the full command bar owns it).
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
                if (!onBarRef.current) setActivePos(null);
            }, CLEAR_GRACE_MS);
        };

        const update = () => {
            // While the pointer is on the bar, hold the current target steady.
            if (onBarRef.current) {
                cancelClear();
                return;
            }
            if (editor.state.selection instanceof NodeSelection) {
                cancelClear();
                setActivePos((prev) => (prev === null ? prev : null));
                return;
            }
            const next = hoveredPos ?? caretBlockPos(editor);
            if (next !== null) {
                cancelClear();
                setActivePos((prev) => (prev === next ? prev : next));
            } else {
                // Grace period so the pointer can travel from the block to the
                // bar (which sits just outside the block) without it vanishing.
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

    const duplicateBlock = () => {
        const node = editor.state.doc.nodeAt(activePos);
        if (!node) return;
        editor
            .chain()
            .insertContentAt(activePos + node.nodeSize, node.toJSON())
            .run();
    };

    const openSettings = () => {
        editor.chain().setNodeSelection(activePos).run();
    };

    return (
        <div
            className="block-quickbar"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            // Don't steal the caret / move the selection when clicking.
            onMouseDown={(e) => e.preventDefault()}
            // Freeze the target while the pointer is on the bar so it stays
            // clickable even on pure hover (no click-into-editor-first needed).
            onMouseEnter={() => {
                onBarRef.current = true;
            }}
            onMouseLeave={() => {
                onBarRef.current = false;
                clearTimer.current = setTimeout(() => {
                    clearTimer.current = null;
                    if (!onBarRef.current) setActivePos(null);
                }, CLEAR_GRACE_MS);
            }}
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
                title="Duplicate block"
                aria-label="Duplicate block"
                onClick={duplicateBlock}
            >
                <Copy size={14} aria-hidden="true" />
            </button>
            <button
                type="button"
                className="block-quickbar__btn"
                title="Block settings"
                aria-label="Block settings"
                onClick={openSettings}
            >
                <Settings size={14} aria-hidden="true" />
            </button>
        </div>
    );
}
