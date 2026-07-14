import { useState } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';
import type { Rubric, RubricCriterion } from '@activity/schema';

// ============================================================================
// FreeResponseView — shared NodeView for short_answer + essay.
//
//   <div.free-response-block>
//     <NodeViewContent />   <- editable inline prompt (text + math)
//     <textarea disabled />  <- preview of the student's answer area
//     <footer> placeholder input (+ essay word-count target) </footer>
//   </div>
//
// Same shape as SelfExplanationView. The word-guidance fields (wordMin/wordMax)
// show only for `essay` nodes. The preview textarea rows track the block type
// (short = 3, essay = 10) so authoring previews the student's box size.
// ============================================================================

export default function FreeResponseView({
    node,
    editor,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const isEssay = node.type.name === 'essay';
    const placeholder = (node.attrs.placeholder as string | undefined) ?? '';
    const wordMin = (node.attrs.wordMin as number | null) ?? null;
    const wordMax = (node.attrs.wordMax as number | null) ?? null;
    const rubric = (node.attrs.rubric as Rubric | null) ?? null;
    const isEditable = editor.isEditable;
    const [footerOpen, setFooterOpen] = useState(false);
    const configured =
        placeholder.length > 0 || wordMin !== null || wordMax !== null || rubric !== null;
    const showFooter = isEditable || configured;

    const setNum = (key: 'wordMin' | 'wordMax', raw: string) => {
        if (raw.trim() === '') return updateAttributes({ [key]: null });
        const n = Number(raw);
        if (Number.isInteger(n) && n > 0) updateAttributes({ [key]: n });
    };

    // Rubric edits write straight to the node attr (document concern). New
    // criteria are seeded VALID (non-empty label, positive points) so a fresh
    // rubric survives an immediate autosave — serialize drops invalid criteria.
    const setRubric = (next: Rubric | null) => updateAttributes({ rubric: next });
    const addCriterion = () => {
        const n = (rubric?.criteria.length ?? 0) + 1;
        const fresh: RubricCriterion = {
            id: crypto.randomUUID(),
            label: `Criterion ${n}`,
            maxPoints: 4,
        };
        setRubric({ criteria: [...(rubric?.criteria ?? []), fresh] });
    };
    const updateCriterion = (id: string, patch: Partial<RubricCriterion>) => {
        if (!rubric) return;
        setRubric({
            criteria: rubric.criteria.map((c) =>
                c.id === id ? { ...c, ...patch } : c,
            ),
        });
    };
    const removeCriterion = (id: string) => {
        if (!rubric) return;
        const remaining = rubric.criteria.filter((c) => c.id !== id);
        setRubric(remaining.length > 0 ? { criteria: remaining } : null);
    };
    const totalPoints = rubric?.criteria.reduce((sum, c) => sum + c.maxPoints, 0) ?? 0;

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
            <NodeViewContent className="free-response-block__prompt" />
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
            {showFooter && (
                <div className="free-response-block__footer" contentEditable={false}>
                    <button
                        type="button"
                        className="free-response-block__footer-toggle"
                        onClick={() => setFooterOpen((open) => !open)}
                        aria-expanded={footerOpen}
                        disabled={!isEditable}
                    >
                        <span aria-hidden="true">⚙</span> Options
                        {!footerOpen && rubric && (
                            <span className="free-response-block__footer-badge">
                                Rubric: {rubric.criteria.length}{' '}
                                {rubric.criteria.length === 1
                                    ? 'criterion'
                                    : 'criteria'}{' '}
                                · {totalPoints} pts
                            </span>
                        )}
                    </button>
                    {footerOpen && (
                        <div className="free-response-block__options">
                            <label className="free-response-block__option">
                                <span>Placeholder</span>
                                <input
                                    type="text"
                                    value={placeholder}
                                    placeholder="e.g. Write 2–3 sentences…"
                                    disabled={!isEditable}
                                    onChange={(e) =>
                                        updateAttributes({ placeholder: e.target.value })
                                    }
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                            </label>
                            {isEssay && (
                                <div className="free-response-block__word-targets">
                                    <label className="free-response-block__option">
                                        <span>Min words</span>
                                        <input
                                            type="number"
                                            min={1}
                                            value={wordMin ?? ''}
                                            placeholder="—"
                                            disabled={!isEditable}
                                            onChange={(e) => setNum('wordMin', e.target.value)}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                    </label>
                                    <label className="free-response-block__option">
                                        <span>Max words</span>
                                        <input
                                            type="number"
                                            min={1}
                                            value={wordMax ?? ''}
                                            placeholder="—"
                                            disabled={!isEditable}
                                            onChange={(e) => setNum('wordMax', e.target.value)}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                    </label>
                                </div>
                            )}
                            <div className="free-response-block__rubric">
                                <div className="free-response-block__rubric-head">
                                    <span>Rubric</span>
                                    {rubric && (
                                        <span className="free-response-block__rubric-total">
                                            {totalPoints} pts total
                                        </span>
                                    )}
                                </div>
                                {rubric?.criteria.map((c) => (
                                    <div
                                        key={c.id}
                                        className="free-response-block__criterion"
                                    >
                                        <input
                                            type="text"
                                            className="free-response-block__criterion-label"
                                            value={c.label}
                                            placeholder="Criterion"
                                            aria-label="Criterion label"
                                            disabled={!isEditable}
                                            onChange={(e) =>
                                                updateCriterion(c.id, {
                                                    label: e.target.value,
                                                })
                                            }
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        <input
                                            type="number"
                                            className="free-response-block__criterion-points"
                                            min={0.5}
                                            step={0.5}
                                            value={c.maxPoints}
                                            aria-label="Points"
                                            disabled={!isEditable}
                                            onChange={(e) => {
                                                const n = Number(e.target.value);
                                                if (Number.isFinite(n) && n > 0)
                                                    updateCriterion(c.id, {
                                                        maxPoints: n,
                                                    });
                                            }}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        <input
                                            type="text"
                                            className="free-response-block__criterion-desc"
                                            value={c.description ?? ''}
                                            placeholder="What does full credit look like? (optional)"
                                            aria-label="Criterion description"
                                            disabled={!isEditable}
                                            onChange={(e) =>
                                                updateCriterion(c.id, {
                                                    description:
                                                        e.target.value || undefined,
                                                })
                                            }
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        <button
                                            type="button"
                                            className="free-response-block__criterion-remove"
                                            aria-label="Remove criterion"
                                            disabled={!isEditable}
                                            onClick={() => removeCriterion(c.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="free-response-block__rubric-add"
                                    disabled={!isEditable}
                                    onClick={addCriterion}
                                >
                                    {rubric ? '+ Add criterion' : '+ Add rubric'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </NodeViewWrapper>
    );
}
