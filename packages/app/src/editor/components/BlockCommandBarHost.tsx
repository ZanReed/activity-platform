import { useEffect, useState, type RefObject } from 'react';
import type { Editor } from '@tiptap/react';
import { NodeSelection } from 'prosemirror-state';
import { ChevronDown } from 'lucide-react';
import { controlsFor, type BlockControls } from '../blockControls';

// ============================================================================
// BlockCommandBarHost — root-level docked command bar for the selected block.
// ----------------------------------------------------------------------------
// The slice-6 generalization of BlankPopoverHost: ONE instance at the editor
// root watches the selection and, when a block whose type has a control
// descriptor is NodeSelected, renders the descriptor's command bar anchored to
// that block. Single host, mount-on-selection — never per-block (that is the
// Stage-13.5 reconciliation hazard the whole design is built to avoid).
//
// ANCHORED, not floating (design decision): the bar is positioned absolutely
// inside the canvas (which is `position: relative`), at the selected block's
// top-right. Because it lives in the canvas coordinate space it scrolls WITH
// its block for free — no scroll listener, no floating-ui, no chasing the
// selection. It only recomputes when the selection changes.
//
// STAGE 0: renders `primary` actions + a stub `⌄ Advanced` disclosure (the
// drawer is stage 4). Proven on paragraph/heading (generic) + math_block
// (real primary). The move grip is the gutter cluster (stage 1), not here yet.
// ============================================================================

interface BlockCommandBarHostProps {
    editor: Editor | null;
    /** The `position: relative` canvas the bar is positioned within. */
    canvasRef: RefObject<HTMLDivElement | null>;
}

interface SelectedBlock {
    pos: number;
    typeName: string;
    controls: BlockControls;
}

export default function BlockCommandBarHost({
    editor,
    canvasRef,
}: BlockCommandBarHostProps) {
    const [selected, setSelected] = useState<SelectedBlock | null>(null);
    // Bar position in canvas-relative px, measured in a rAF AFTER selection
    // commits (see below). null until measured — the bar renders only then.
    const [position, setPosition] = useState<{ top: number; left: number } | null>(
        null,
    );

    // Phase 1 — detect the selected block. Only pos/type/controls here; NO DOM
    // measurement (measuring inside the transaction handler reads pre-layout
    // geometry and mis-anchors the bar). Keep the state object identity stable
    // across transactions on the same block so phase 2 doesn't thrash.
    useEffect(() => {
        if (!editor) return;

        const update = () => {
            const { selection } = editor.state;
            const node =
                selection instanceof NodeSelection ? selection.node : null;
            const controls = node ? controlsFor(node.type.name) : null;
            if (!node || !controls) {
                setSelected((prev) => (prev === null ? prev : null));
                return;
            }
            const pos = selection.from;
            const typeName = node.type.name;
            setSelected((prev) =>
                prev && prev.pos === pos && prev.typeName === typeName
                    ? prev
                    : { pos, typeName, controls },
            );
        };

        editor.on('selectionUpdate', update);
        editor.on('transaction', update);
        update();
        return () => {
            editor.off('selectionUpdate', update);
            editor.off('transaction', update);
        };
    }, [editor, canvasRef]);

    // Phase 2 — measure the anchor in a rAF, after the selected-node class and
    // any NodeView re-render have painted. Same deferral BlankPopoverHost uses
    // to resolve its chip element. Canvas is the bar's offset parent, so we
    // store canvas-relative px; the bar then scrolls with the block for free.
    useEffect(() => {
        if (!editor || !selected) {
            setPosition(null);
            return;
        }
        const raf = requestAnimationFrame(() => {
            const canvas = canvasRef.current;
            const dom = editor.view.nodeDOM(selected.pos);
            if (!canvas || !(dom instanceof HTMLElement)) {
                setPosition(null);
                return;
            }
            const cr = canvas.getBoundingClientRect();
            const br = dom.getBoundingClientRect();
            setPosition({ top: br.top - cr.top, left: br.right - cr.left });
        });
        return () => cancelAnimationFrame(raf);
    }, [editor, selected, canvasRef]);

    if (!editor || !selected || !position) return null;

    const hasAdvanced = (selected.controls.advanced?.length ?? 0) > 0;

    return (
        <div
            className="block-command-bar"
            // Right-align the bar to the block's right edge (translateX(-100%))
            // and nudge it just inside the top-right corner.
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            role="toolbar"
            aria-label="Block controls"
            data-block-type={selected.typeName}
            // Keep clicks on the bar from bubbling into the canvas mousedown,
            // which would move the selection and unmount the bar mid-click.
            onMouseDown={(e) => e.preventDefault()}
        >
            {selected.controls.primary.map((entry) => {
                const Icon = entry.icon;
                return (
                    <button
                        key={entry.label}
                        type="button"
                        className="block-command-bar__action"
                        onClick={() => entry.onActivate(editor, selected.pos)}
                    >
                        <Icon size={14} aria-hidden="true" />
                        <span>{entry.label}</span>
                    </button>
                );
            })}
            {hasAdvanced ? (
                <button
                    type="button"
                    className="block-command-bar__advanced"
                    // Stage 0 stub — the grouped drawer is stage 4.
                    aria-label="Advanced (coming soon)"
                    disabled
                >
                    <ChevronDown size={14} aria-hidden="true" />
                    <span>Advanced</span>
                </button>
            ) : null}
        </div>
    );
}
