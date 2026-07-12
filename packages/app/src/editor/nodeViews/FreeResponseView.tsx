import { useState } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';

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
    const isEditable = editor.isEditable;
    const [footerOpen, setFooterOpen] = useState(false);
    const configured = placeholder.length > 0 || wordMin !== null || wordMax !== null;
    const showFooter = isEditable || configured;

    const setNum = (key: 'wordMin' | 'wordMax', raw: string) => {
        if (raw.trim() === '') return updateAttributes({ [key]: null });
        const n = Number(raw);
        if (Number.isInteger(n) && n > 0) updateAttributes({ [key]: n });
    };

    return (
        <NodeViewWrapper
            className={`free-response-block${isEssay ? ' is-essay' : ''}${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
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
                        </div>
                    )}
                </div>
            )}
        </NodeViewWrapper>
    );
}
