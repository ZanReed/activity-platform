import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

// ============================================================================
// BlankView — NodeView for the inline blank atom.
// ----------------------------------------------------------------------------
// Visual: a small pill showing the canonical answer, with an underline beneath
// sized to roughly match what the student will see on the published page
// (auto-derived from answer length per the Stage 13.5 width formula).
//
// On hover: acceptable answers shown via the native title attribute. A richer
// popover for editing comes in Session 2 (floating-ui based).
//
// Selection state: when the user clicks the blank, ProseMirror sets selected
// on the node. We mirror MathInline's pattern — blue background + outline on
// the chip element when selected. NodeViewWrapper's `as="span"` keeps the
// blank inline within surrounding prose.
//
// Why no React state, no useLayoutEffect, no refs?
// The blank is a pure display of its attrs — no KaTeX render, no edit-mode
// textarea, no async work. Tiptap re-renders the NodeView whenever attrs
// change (via the React renderer's built-in reactivity). So this NodeView
// can be a pure functional component reading directly from node.attrs.
// The math NodeView lifecycle pattern (useLayoutEffect for KaTeX, stable
// refs as render targets) applies when there's external rendering work to
// orchestrate; here there isn't.
// ============================================================================

// Width formula: same as the renderer-side formula in inline.ts (Drop 4).
// Keep these in sync — both editor and renderer derive width from answer
// length when no explicit width is set. The +1 prevents very short answers
// from looking cramped; the Math.max floor of 4 keeps single-character
// answers from showing as a 2ch sliver.
function deriveBlankWidth(answer: string): number {
    return Math.max(answer.length + 1, 4);
}

export default function BlankView({ node, selected }: NodeViewProps) {
    const answer = (node.attrs.answer as string) ?? '';
    const acceptableAnswers = (node.attrs.acceptableAnswers as string[]) ?? [];
    const width = deriveBlankWidth(answer);

    // Hover tooltip: show acceptable answers when present. Native title attr
    // is sufficient for Stage 13.5; Session 2 replaces this with a floating-ui
    // popover that doubles as an editing surface.
    const tooltip =
        acceptableAnswers.length > 0
            ? `Also accepts: ${acceptableAnswers.join(', ')}`
            : undefined;

    return (
        <NodeViewWrapper
            as="span"
            className={`blank-chip${selected ? ' is-selected' : ''}`}
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
