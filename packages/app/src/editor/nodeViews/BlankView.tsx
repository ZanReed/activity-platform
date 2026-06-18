import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

// ============================================================================
// BlankView — NodeView for the inline blank atom.
// ----------------------------------------------------------------------------
// Visual: a small pill showing the canonical answer, with an underline beneath
// sized to roughly match what the student will see on the published page
// (auto-derived from answer length per the Stage 13.5 width formula).
//
// On hover: acceptable answers shown via the native title attribute. A richer
// popover for editing comes in Drop 2b (floating-ui based, at editor root).
//
// Selection state: when the user clicks the blank, ProseMirror sets selected
// on the node. We mirror MathInline's pattern — blue background + outline on
// the chip element when selected. NodeViewWrapper handles the inline tag
// automatically based on the node's `inline: true` flag in Blank.ts; we no
// longer pass an explicit `as` prop (it was leaking to the DOM as a literal
// attribute).
//
// Why no React state, no useLayoutEffect, no refs?
// The blank is a pure display of its attrs — no KaTeX render, no edit-mode
// textarea, no async work. Tiptap re-renders the NodeView whenever attrs
// change (via the React renderer's built-in reactivity). So this NodeView
// can be a pure functional component reading directly from node.attrs.
// ============================================================================

// Width formula: same as the renderer-side formula in inline.ts.
// Keep these in sync — both editor and renderer derive width from answer
// length when no explicit width is set. The +1 prevents very short answers
// from looking cramped; the Math.max floor of 4 keeps single-character
// answers from showing as a 2ch sliver; the Math.min ceiling of
// MAX_BLANK_WIDTH stops a long canonical answer from blowing out the line
// (and, on the published page, a multi-column print column).
const MAX_BLANK_WIDTH = 24;
function deriveBlankWidth(answer: string): number {
    return Math.min(Math.max(answer.length + 1, 4), MAX_BLANK_WIDTH);
}

export default function BlankView({ node, selected }: NodeViewProps) {
    const answer = (node.attrs.answer as string) ?? '';
    const acceptableAnswers = (node.attrs.acceptableAnswers as string[]) ?? [];
    // Order-independent grouping: this blank is interchangeable with the one
    // before it. A leading ⇄ marker makes the link visible between the chips.
    const grouped = node.attrs.interchangeableWithPrevious === true;
    const width = deriveBlankWidth(answer);

    // Hover tooltip: grouping note takes priority (it's the less obvious fact);
    // otherwise show acceptable answers when present.
    const tooltip = grouped
        ? 'Interchangeable with the previous blank — answers count in any order'
        : acceptableAnswers.length > 0
            ? `Also accepts: ${acceptableAnswers.join(', ')}`
            : undefined;

    return (
        <NodeViewWrapper
            className={`blank-chip${selected ? ' is-selected' : ''}${
                grouped ? ' is-grouped' : ''
            }`}
            data-blank-id={node.attrs.id ?? ''}
            title={tooltip}
        >
            <span className="blank-chip__answer">{answer}</span>
            <span
                className="blank-chip__underline"
                style={{ width: `${width}ch` }}
                aria-hidden="true"
            />
        </NodeViewWrapper>
    );
}
