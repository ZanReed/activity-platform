import type { ReactNode } from 'react';
import type { Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import InlineRichTextEditor from './InlineRichTextEditor';
import type { InlineNodes } from '../../lib/serialize';

// ============================================================================
// QuestionSettings — the shared block-level settings of the four classic
// question blocks (multiple_choice, fill_in_blank, matching, ordering).
// ----------------------------------------------------------------------------
// All four carry the identical trio: `solution` (a worked explanation revealed
// post-check), `hasConfidenceRating`, and `workSpace` (print rem). They used
// to live in a per-NodeView "⚙ Settings" footer; the MC-coherence pass moved
// them into the descriptor drawer (blockControls.ts), leaving only a
// display-only summary line in the block. This module holds the drawer's
// custom solution field (rich text — the simple field kinds can't express it)
// and that summary.
// ============================================================================

/** The drawer's Worked-solution field (custom kind, like renderRubricField). */
export function renderSolutionField({
    editor,
    node,
    pos,
}: {
    editor: Editor;
    node: PMNode;
    pos: number;
}): ReactNode {
    const solution = (node.attrs.solution as InlineNodes | null) ?? [];
    const onChange = (nodes: InlineNodes) => {
        editor
            .chain()
            .command(({ tr }) => {
                tr.setNodeAttribute(pos, 'solution', nodes.length > 0 ? nodes : null);
                return true;
            })
            .run();
    };
    return (
        // Renders inside the drawer's custom slot, which delegates the heading
        // to the field itself (same contract as the rubric builder).
        <div className="question-solution-field">
            <span className="block-advanced-drawer__label">
                Worked solution
            </span>
            <span className="question-solution-field__help">
                Shown to students after the section is checked. Supports bold,
                italic, and inline math.
            </span>
            <InlineRichTextEditor
                value={solution}
                onChange={onChange}
                ariaLabel="Worked solution"
            />
        </div>
    );
}

/**
 * The display-only summary a question block keeps in place of its removed
 * settings footer — a quiet "what's configured" line (same discipline as the
 * free-text blocks' word-target/rubric readouts). Renders nothing when no
 * setting is on.
 */
export function QuestionSettingsSummary({
    hasSolution,
    hasConfidenceRating,
    workSpace,
}: {
    hasSolution: boolean;
    hasConfidenceRating: boolean;
    workSpace: number | null;
}) {
    const parts = [
        hasSolution && 'solution',
        hasConfidenceRating && 'confidence',
        workSpace !== null && `work space ${workSpace}rem`,
    ].filter(Boolean);
    if (parts.length === 0) return null;
    return (
        <div className="question-settings-summary" contentEditable={false}>
            {parts.join(' · ')}
        </div>
    );
}
