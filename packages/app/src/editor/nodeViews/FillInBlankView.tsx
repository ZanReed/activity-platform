import { useMemo } from 'react';
import {
    NodeViewWrapper,
    type NodeViewProps,
} from '@tiptap/react';
import PromptField from '../components/PromptField';
import type { InlineNodes } from '../../lib/serialize';
import { QuestionSettingsSummary } from '../components/QuestionSettings';
import { problemNumberAt, fadedStepContextAt } from '../problemNumbering';

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
//
// Block settings:
//   `solution` / `hasConfidenceRating` / `workSpace` live in the descriptor
//   drawer (blockControls.ts → questionAdvanced), reached via the quick-bar ⚙.
//   The block keeps only a display-only QuestionSettingsSummary — the old
//   inline "⚙ Settings" footer is gone (drawer = the single settings home).
//   `skills` has no control yet (Phase 2); the attr still round-trips through
//   serialize.
// ============================================================================

export default function FillInBlankView({
    node,
    editor,
    getPos,
    selected,
}: NodeViewProps) {
    const solution = (node.attrs.solution as InlineNodes | null) ?? [];
    const hasSolution = solution.length > 0;
    const hasConfidenceRating = Boolean(node.attrs.hasConfidenceRating);
    const workSpace =
        typeof node.attrs.workSpace === 'number'
            ? (node.attrs.workSpace as number)
            : null;

    // Blank-discoverability signifier (Form A ghost text, design-review 2026-07-19).
    // A teacher may not know that typing `__` (or `{{answer}}`) turns part of the
    // sentence into a blank. Empty body → the placeholder teaches it; once there's
    // text but still NO blank, a trailing faint hint teaches it; the hint fades
    // the moment a blank exists (show-when-no-blank, hide-once-present).
    const isEmpty = node.content.size === 0;
    let hasBlank = false;
    node.content.forEach((child) => {
        if (child.type.name === 'blank') hasBlank = true;
    });
    const showMakeBlankHint = !isEmpty && !hasBlank;

    // A fill_in_blank nested directly in a faded worked example is a "faded
    // step": it drops the problem-number gutter and shows a compact inline
    // letter — the box owns the one problem number. fadedStep is null for a
    // standalone problem, which keeps its numeric gutter.
    const { problemNumber, fadedStep } = useMemo(() => {
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        const step = fadedStepContextAt(editor, pos);
        return {
            problemNumber: step ? 0 : problemNumberAt(editor, pos),
            fadedStep: step,
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor.state, getPos]);

    return (
        <NodeViewWrapper
            className={`fill-in-blank-block${
                fadedStep ? ' is-faded-step' : ''
            }${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            {fadedStep ? (
                // Always rendered; the parent box hides these via a CSS
                // modifier when its showStepLabels toggle is off. (A NodeView
                // can't react to a parent attr change, so visibility lives with
                // the parent that re-renders, not here.)
                <span
                    className="fill-in-blank-block__step-label"
                    contentEditable={false}
                >
                    ({fadedStep.letter})
                </span>
            ) : (
                <div
                    className="fill-in-blank-block__number"
                    contentEditable={false}
                >
                    {problemNumber}.
                </div>
            )}
            <PromptField
                node={node}
                className="fill-in-blank-block__body"
                placeholder="Type the sentence…  ( __ makes a blank )"
            />
            {showMakeBlankHint && (
                <div
                    className="fill-in-blank-block__make-hint"
                    contentEditable={false}
                >
                    type <code>__</code> to make a blank
                </div>
            )}
            <QuestionSettingsSummary
                hasSolution={hasSolution}
                hasConfidenceRating={hasConfidenceRating}
                workSpace={workSpace}
            />
        </NodeViewWrapper>
    );
}
