import { useMemo } from 'react';
import {
    NodeViewWrapper,
    type NodeViewProps,
} from '@tiptap/react';
import PromptField from '../components/PromptField';
import { problemNumberAt } from '../problemNumbering';
import type { InlineNode, Rubric } from '@activity/schema';

// ============================================================================
// FreeResponseView — shared NodeView for short_answer + essay.
//
//   <div.free-response-block>
//     <NodeViewContent />    <- editable inline prompt (text + math)
//     <textarea disabled />  <- preview of the student's answer area
//     <div .wordhint />       <- display-only word target (essay)
//     <div .rubric-summary /> <- display-only "Rubric: N · X pts" when set
//     <details .key />        <- display-only answer + solution (READ-ONLY)
//   </div>
//
// THE ANSWER KEY IS READ-ONLY HERE, BY RULING (E10, 2026-08-19). The block may
// carry `answer` (the teacher's canonical answer) and `solution` (the
// post-check explanation), and this NodeView shows both — collapsed, in
// teacher-only styling — but offers no way to edit them. That is a decision,
// not an unfinished edge: these fields are authored in the .md file, and the
// batch importer's file-keyed re-import-updates flow is the editing surface.
// Showing them anyway matters because a teacher opening an imported activity
// needs to SEE that the key came across; an invisible field is one nobody
// notices is missing. A full editing UI is a recorded TODO.
//
// Settings (placeholder, word-count, rubric) live in the block's Settings
// drawer (⚙ on the command bar / quick-bar → AdvancedDrawer, descriptor-driven
// via blockControls.ts). The old inline "⚙ Options" footer was removed
// (2026-07-15, /plan-eng-review): one settings home across all blocks, no
// per-NodeView options UI. What stays here is display-only — the readouts that
// show the teacher what the student sees.
// ============================================================================

// InlineNode[] → display lines, splitting on hard breaks. A worked answer is
// routinely multi-line (the importer joins continuation lines with hardBreaks),
// so this deliberately does NOT truncate the way MatchingView's one-line target
// preview does — a key a teacher can only read the first 40 characters of is
// not a key they can check the activity against.
function inlineLines(nodes: InlineNode[] | null): string[] {
    if (!nodes || nodes.length === 0) return [];
    const lines: string[] = [];
    let current = '';
    for (const node of nodes) {
        if (node.type === 'hard_break') {
            lines.push(current);
            current = '';
        } else if (node.type === 'text') {
            current += node.text;
        } else if (node.type === 'math_inline') {
            current += node.latex;
        }
    }
    lines.push(current);
    return lines.filter((line) => line.trim().length > 0);
}

export default function FreeResponseView({
    node,
    editor,
    getPos,
    selected,
}: NodeViewProps) {
    const isEssay = node.type.name === 'essay';
    const placeholder = (node.attrs.placeholder as string | undefined) ?? '';
    const wordMin = (node.attrs.wordMin as number | null) ?? null;
    const wordMax = (node.attrs.wordMax as number | null) ?? null;
    const rubric = (node.attrs.rubric as Rubric | null) ?? null;
    const totalPoints =
        rubric?.criteria.reduce((sum, c) => sum + c.maxPoints, 0) ?? 0;
    const answerLines = inlineLines(node.attrs.answer as InlineNode[] | null);
    const solutionLines = inlineLines(node.attrs.solution as InlineNode[] | null);
    // Both blocks are page-numbered since ruling E7, so the header carries the
    // number the printed sheet will show — the same walk every other question
    // NodeView uses, not a second count that could disagree with it.
    const problemNumber = useMemo(
        () =>
            problemNumberAt(
                editor,
                typeof getPos === 'function' ? getPos() : undefined,
            ),
        // editor.state (not editor) is the real dependency — same as MatchingView.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editor.state, getPos],
    );

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
                    {problemNumber}. {isEssay ? 'Essay' : 'Short answer'}
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
            {(answerLines.length > 0 || solutionLines.length > 0) && (
                <details
                    className="free-response-block__key"
                    contentEditable={false}
                >
                    <summary className="free-response-block__key-summary">
                        Answer key — students never see this
                    </summary>
                    {answerLines.length > 0 && (
                        <div
                            className="free-response-block__key-field"
                            data-field="answer"
                        >
                            <span className="free-response-block__key-label">
                                Answer
                            </span>
                            {answerLines.map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    )}
                    {solutionLines.length > 0 && (
                        <div
                            className="free-response-block__key-field"
                            data-field="solution"
                        >
                            <span className="free-response-block__key-label">
                                Solution (shown after the section is checked)
                            </span>
                            {solutionLines.map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    )}
                </details>
            )}
        </NodeViewWrapper>
    );
}
