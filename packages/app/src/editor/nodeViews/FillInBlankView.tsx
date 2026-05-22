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
//     <div.fill-in-blank-block__body>
//       <NodeViewContent />   <- editable inline content (text, math, blanks)
//     </div>
//   </div>
//
// Problem numbering:
//   Computed from document position — we walk the doc and count how many
//   fillInBlank nodes precede this one, then add 1. Tiptap re-renders the
//   NodeView when the doc changes (via the React renderer's reactivity hooked
//   to editor transactions), so reordering blocks updates the displayed
//   number automatically.
//
//   Why not store the number on attrs? Two reasons:
//   - The schema treats `number` as optional with renderer auto-numbering as
//     the default. Storing it would create churn whenever a teacher reorders
//     problems.
//   - The renderer computes the same thing at HTML emission time. Author sees
//     what students see.
//
// Why useMemo on the position walk?
//   The doc walk is O(blocks). Doing it on every keystroke in a 50-block doc
//   is cheap but not free. The memo keys on editor.state — recomputes only
//   when document state changes, not on every NodeView render. Tiptap's
//   internal reactivity ensures we re-render on doc changes, so the memo
//   key changes appropriately.
//
// Selection state:
//   Mirrors .math-block-wrapper.is-selected — blue outline + tinted bg.
//   Click on the block boundary (not on the editable content) selects it
//   as a node; clicking inside content puts cursor into the body.
// ============================================================================

export default function FillInBlankView({
    node,
    editor,
    getPos,
    selected,
}: NodeViewProps) {
    // Compute position-based problem number. The walk runs whenever editor
    // state changes (Tiptap's React renderer re-renders on transactions);
    // useMemo de-duplicates within a single render pass.
    const problemNumber = useMemo(() => {
        // getPos can be undefined transiently during node creation; guard for it.
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        if (pos === undefined) return 1;

        let count = 1;
        editor.state.doc.descendants((descendant, descendantPos) => {
            // Only count fillInBlank blocks that appear BEFORE this one.
            // Returning false from descendants skips into the subtree; we
            // don't need to descend into other fill_in_blank bodies looking
            // for nested ones — they aren't allowed by the content spec.
            if (descendantPos >= pos) return false;
            if (descendant.type.name === 'fillInBlank') {
                count++;
            }
            return true;
        });
        return count;
        // editor.state is the dependency that captures doc changes; getPos
        // is stable per NodeView mount but included for completeness.
    }, [editor.state, getPos]);

    return (
        <NodeViewWrapper
            as="div"
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
