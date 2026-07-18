import {
    NodeViewWrapper,
    type NodeViewProps,
} from '@tiptap/react';
import PromptField from '../components/PromptField';
import type { Rubric } from '@activity/schema';

// ============================================================================
// FreeResponseView — shared NodeView for short_answer + essay.
//
//   <div.free-response-block>
//     <NodeViewContent />    <- editable inline prompt (text + math)
//     <textarea disabled />  <- preview of the student's answer area
//     <div .wordhint />       <- display-only word target (essay)
//     <div .rubric-summary /> <- display-only "Rubric: N · X pts" when set
//   </div>
//
// Settings (placeholder, word-count, rubric) live in the block's Settings
// drawer (⚙ on the command bar / quick-bar → AdvancedDrawer, descriptor-driven
// via blockControls.ts). The old inline "⚙ Options" footer was removed
// (2026-07-15, /plan-eng-review): one settings home across all blocks, no
// per-NodeView options UI. What stays here is display-only — the readouts that
// show the teacher what the student sees.
// ============================================================================

export default function FreeResponseView({ node, selected }: NodeViewProps) {
    const isEssay = node.type.name === 'essay';
    const placeholder = (node.attrs.placeholder as string | undefined) ?? '';
    const wordMin = (node.attrs.wordMin as number | null) ?? null;
    const wordMax = (node.attrs.wordMax as number | null) ?? null;
    const rubric = (node.attrs.rubric as Rubric | null) ?? null;
    const totalPoints =
        rubric?.criteria.reduce((sum, c) => sum + c.maxPoints, 0) ?? 0;

    return (
        <NodeViewWrapper
            className={`free-response-block${isEssay ? ' is-essay' : ''}${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div
                className="free-response-block__header"
                contentEditable={false}
            >
                <span
                    className="free-response-block__icon"
                    aria-hidden="true"
                >
                    ¶
                </span>
                <span className="free-response-block__label">
                    {isEssay ? 'Essay' : 'Short answer'}
                </span>
            </div>
            <PromptField
                node={node}
                className="free-response-block__prompt"
                placeholder="Type the question…"
            />
            <textarea
                className="free-response-block__preview"
                rows={isEssay ? 8 : 3}
                disabled
                placeholder={placeholder || 'Students type their answer here…'}
                contentEditable={false}
                aria-hidden="true"
            />
            {isEssay && (wordMin !== null || wordMax !== null) && (
                <div className="free-response-block__wordhint" contentEditable={false}>
                    Target:{' '}
                    {wordMin !== null && wordMax !== null
                        ? `${wordMin}–${wordMax}`
                        : wordMin !== null
                          ? `≥ ${wordMin}`
                          : `≤ ${wordMax}`}{' '}
                    words
                </div>
            )}
            {rubric && (
                <div
                    className="free-response-block__rubric-summary"
                    contentEditable={false}
                >
                    Rubric: {rubric.criteria.length}{' '}
                    {rubric.criteria.length === 1 ? 'criterion' : 'criteria'} ·{' '}
                    {totalPoints} pts
                </div>
            )}
        </NodeViewWrapper>
    );
}
