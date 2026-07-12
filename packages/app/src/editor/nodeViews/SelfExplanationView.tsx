import { useState } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';

// ============================================================================
// SelfExplanationView — NodeView for the self_explanation block.
//
//   <div.self-explanation-block>
//     <NodeViewContent />   <- editable inline prompt (text + math)
//     <textarea disabled />  <- preview of the student's answer area
//     <footer> optional sentence-starter (placeholder attr) input </footer>
//   </div>
//
// The preview textarea is disabled (it's authoring chrome, not content); the
// placeholder attribute drives its placeholder text so the teacher sees what
// the student will. The footer only appears while editing (or when a
// placeholder is already set), mirroring FillInBlankView's settings footer.
// ============================================================================

export default function SelfExplanationView({
    node,
    editor,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const placeholder = (node.attrs.placeholder as string | undefined) ?? '';
    const isEditable = editor.isEditable;
    const [footerOpen, setFooterOpen] = useState(false);
    const showFooter = isEditable || placeholder.length > 0;

    return (
        <NodeViewWrapper
            className={`self-explanation-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <NodeViewContent className="self-explanation-block__prompt" />
            <textarea
                className="self-explanation-block__preview"
                rows={3}
                disabled
                placeholder={placeholder || 'Students type their explanation here…'}
                contentEditable={false}
                aria-hidden="true"
            />
            {showFooter && (
                <div
                    className="self-explanation-block__footer"
                    contentEditable={false}
                >
                    <button
                        type="button"
                        className="self-explanation-block__footer-toggle"
                        onClick={() => setFooterOpen((open) => !open)}
                        aria-expanded={footerOpen}
                        disabled={!isEditable}
                    >
                        <span aria-hidden="true">⚙</span> Sentence starter
                        {!footerOpen && placeholder.length > 0 && (
                            <span className="self-explanation-block__footer-badge">
                                “{placeholder}”
                            </span>
                        )}
                    </button>
                    {footerOpen && (
                        <input
                            type="text"
                            className="self-explanation-block__starter-input"
                            value={placeholder}
                            placeholder="e.g. I know this because…"
                            aria-label="Sentence starter (placeholder)"
                            disabled={!isEditable}
                            onChange={(e) =>
                                updateAttributes({ placeholder: e.target.value })
                            }
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    )}
                </div>
            )}
        </NodeViewWrapper>
    );
}
