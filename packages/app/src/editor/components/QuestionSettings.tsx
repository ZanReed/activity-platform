import type { ReactNode } from 'react';
import type { Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import InlineRichTextEditor from './InlineRichTextEditor';
import type { InlineNodes } from '../../lib/serialize';

// ============================================================================
// QuestionSettings — the shared block-level settings of the four classic
// question blocks (multiple_choice, fill_in_blank, matching, ordering).
// ----------------------------------------------------------------------------
// All four carry the identical pair: `solution` (a worked explanation revealed
// post-check) and `workSpace` (print rem). They used
// to live in a per-NodeView "⚙ Settings" footer; the MC-coherence pass moved
// them into the descriptor drawer (blockControls.ts), leaving only a
// display-only summary line in the block. This module holds the drawer's
// custom solution field (rich text — the simple field kinds can't express it)
// and that summary.
// ============================================================================

/**
 * A drawer toggle row (checkbox + label + optional help), matching the typed
 * AdvancedDrawer fields' formatting. Shared by the custom settings panels
 * (GraphSettings / DataPlotSettings / NumberLineSettings).
 */
export function ToggleRow({
    checked,
    disabled,
    onChange,
    label,
    help,
    indent,
}: {
    checked: boolean;
    disabled: boolean;
    onChange: (v: boolean) => void;
    label: string;
    help?: string;
    indent?: boolean;
}) {
    return (
        <label
            className="block-advanced-drawer__field block-advanced-drawer__field--toggle"
            style={indent ? { marginLeft: '1.2rem' } : undefined}
        >
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="block-advanced-drawer__field-text">
                <span className="block-advanced-drawer__label">{label}</span>
                {help ? (
                    <span className="block-advanced-drawer__help">{help}</span>
                ) : null}
            </span>
        </label>
    );
}

/**
 * A drawer field editing one rich-text (InlineNode[]) attribute — the Worked
 * solution on the question blocks, and the model answer + worked solution on
 * short answer / essay (GUI sweep item 3, 2026-11-13). An empty editor clears
 * the attribute (null), so "removed" round-trips as absent.
 */
export function inlineAttrField(attr: string, label: string, help: string) {
    return function InlineAttrField({
        editor,
        node,
        pos,
    }: {
        editor: Editor;
        node: PMNode;
        pos: number;
    }): ReactNode {
        const value = (node.attrs[attr] as InlineNodes | null) ?? [];
        const onChange = (nodes: InlineNodes) => {
            editor
                .chain()
                .command(({ tr }) => {
                    tr.setNodeAttribute(pos, attr, nodes.length > 0 ? nodes : null);
                    return true;
                })
                .run();
        };
        return (
            // Renders inside the drawer's custom slot, which delegates the heading
            // to the field itself (same contract as the rubric builder).
            <div className="question-solution-field">
                <span className="block-advanced-drawer__label">{label}</span>
                <span className="question-solution-field__help">{help}</span>
                <InlineRichTextEditor value={value} onChange={onChange} ariaLabel={label} />
            </div>
        );
    };
}

/** The drawer's Worked-solution field (custom kind, like renderRubricField). */
export const renderSolutionField = inlineAttrField(
    'solution',
    'Worked solution',
    'Shown to students after the section is checked. Supports bold, italic, and inline math.',
);

/** Short answer / essay: the teacher's model answer (GUI sweep item 3). */
export const renderModelAnswerField = inlineAttrField(
    'answer',
    'Model answer',
    'What a full-marks answer says. Teacher-only: students never see it; it prints on the answer key.',
);

/**
 * The display-only summary a question block keeps in place of its removed
 * settings footer — a quiet "what's configured" line (same discipline as the
 * free-text blocks' word-target/rubric readouts). Renders nothing when no
 * setting is on.
 */
export function QuestionSettingsSummary({
    hasSolution,
    workSpace,
}: {
    hasSolution: boolean;
    workSpace: number | null;
}) {
    const parts = [
        hasSolution && 'solution',
        workSpace !== null && `work space ${workSpace}rem`,
    ].filter(Boolean);
    if (parts.length === 0) return null;
    return (
        <div className="question-settings-summary" contentEditable={false}>
            {parts.join(' · ')}
        </div>
    );
}
