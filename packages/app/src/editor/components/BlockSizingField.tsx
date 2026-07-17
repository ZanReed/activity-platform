import type { Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import { widthAttrLabel } from '../imageSizing';

// ============================================================================
// BlockSizingField — shared width/align drawer control for the figure blocks
// (interactive-graph, data-plot, number-line). D5: these blocks are sized from
// the descriptor drawer, NOT an edge drag-handle (a handle would crush their
// authoring UI — D6). ONE control embedded by all three settings panels, the
// drawer-side twin of the shared useBlockWidthResize hook.
//
//   • width chips — 25/33/50/66/75% (fractions of the container),
//   • "Full width" — CLEARS width + align back to the unsized identity (D5:
//     reset clears attrs; NOT width:1, which would break omit-when-default),
//   • align — left/center/right, shown only when a width is set (align without
//     width is a no-op; center = the attribute-free default).
// ============================================================================

// Fractions offered as chips. 1 ("full") is the cleared/unsized state, not a
// stored width — so a graph reset round-trips to identity (see BlockWidthFraction
// bounds + the renderer's omit-when-default emission).
const WIDTH_CHIPS = [0.25, 0.33, 0.5, 0.66, 0.75] as const;
const ALIGNS = [
    ['left', 'Left'],
    ['center', 'Center'],
    ['right', 'Right'],
] as const;

// Write a node attr at `pos` (same inlined helper the settings panels use, to
// avoid a circular import with blockControls).
function setNodeAttr(
    editor: Editor,
    pos: number,
    key: string,
    value: unknown,
): void {
    editor
        .chain()
        .command(({ tr }) => {
            tr.setNodeAttribute(pos, key, value);
            return true;
        })
        .run();
}

export function BlockSizingField({
    editor,
    node,
    pos,
}: {
    editor: Editor;
    node: PMNode;
    pos: number;
}) {
    const isEditable = editor.isEditable;
    const rawWidth = node.attrs.width;
    const width =
        typeof rawWidth === 'number' && rawWidth > 0 && rawWidth <= 1
            ? rawWidth
            : null;
    const align: 'left' | 'center' | 'right' =
        node.attrs.align === 'left' || node.attrs.align === 'right'
            ? node.attrs.align
            : 'center';
    const isFull = width === null;

    const setWidth = (w: number): void => setNodeAttr(editor, pos, 'width', w);

    // Reset-to-full clears BOTH width and align in one transaction (one undo
    // step) — the block returns to the unsized omit-when-default identity.
    const resetFull = (): void => {
        editor
            .chain()
            .command(({ tr }) => {
                tr.setNodeAttribute(pos, 'width', null);
                tr.setNodeAttribute(pos, 'align', null);
                return true;
            })
            .run();
    };

    const setAlign = (a: 'left' | 'center' | 'right'): void =>
        setNodeAttr(editor, pos, 'align', a === 'center' ? null : a);

    return (
        <div className="block-advanced-drawer__group">
            <div className="block-advanced-drawer__group-title">Size</div>
            <div
                className="block-sizing__chips"
                role="group"
                aria-label="Figure width"
            >
                <button
                    type="button"
                    className={`block-sizing__chip${isFull ? ' is-active' : ''}`}
                    aria-pressed={isFull}
                    disabled={!isEditable}
                    onClick={resetFull}
                >
                    Full
                </button>
                {WIDTH_CHIPS.map((w) => (
                    <button
                        key={w}
                        type="button"
                        className={`block-sizing__chip${
                            width === w ? ' is-active' : ''
                        }`}
                        aria-pressed={width === w}
                        disabled={!isEditable}
                        onClick={() => setWidth(w)}
                    >
                        {widthAttrLabel(w)}
                    </button>
                ))}
            </div>
            {!isFull && (
                <div
                    className="block-sizing__align"
                    role="group"
                    aria-label="Alignment"
                >
                    {ALIGNS.map(([a, label]) => (
                        <button
                            key={a}
                            type="button"
                            className={`block-sizing__chip${
                                align === a ? ' is-active' : ''
                            }`}
                            aria-pressed={align === a}
                            disabled={!isEditable}
                            onClick={() => setAlign(a)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
