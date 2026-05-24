import { useMemo } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';

// ============================================================================
// FillInBlankView — NodeView for the fill_in_blank block.
// ----------------------------------------------------------------------------
// Visual structure:
//   <div.fill-in-blank-block>
//     <div.fill-in-blank-block__number>1.</div>
//     <NodeViewContent />   <- editable inline content (text, math, blanks)
//   </div>
//
// NodeViewWrapper handles the block-level tag automatically based on the
// node's content spec in FillInBlank.ts; we no longer pass an explicit
// `as` prop (it was leaking to the DOM as a literal attribute).
//
// Problem numbering:
//   Computed from document position — we walk the doc and count how many
//   fillInBlank nodes precede this one, then add 1. Tiptap re-renders the
//   NodeView when the doc changes, so reordering blocks updates the
//   displayed number automatically.
//
// Why useMemo on the position walk?
//   The doc walk is O(blocks). Doing it on every keystroke in a 50-block doc
//   is cheap but not free. The memo keys on editor.state — recomputes only
//   when document state changes, not on every NodeView render.
//
// Selection state:
//   Mirrors .math-block-wrapper.is-selected — blue outline + tinted bg.
// ============================================================================

export default function FillInBlankView({
    node,
    editor,
    getPos,
    selected,
}: NodeViewProps) {
    const problemNumber = useMemo(() => {
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        if (pos === undefined) return 1;

        let count = 1;
        editor.state.doc.descendants((descendant, descendantPos) => {
            if (descendantPos >= pos) return false;
            if (descendant.type.name === 'fillInBlank') {
                count++;
            }
            return true;
        });
        return count;
    }, [editor.state, getPos]);

    return (
        <NodeViewWrapper
            className={`fill-in-blank-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div className="fill-in-blank-block__number" contentEditable={false}>
                {problemNumber}.
            </div>
            <NodeViewContent className="fill-in-blank-block__body" />
        </NodeViewWrapper>
    );
}
