import {
    NodeViewWrapper,
    type NodeViewProps,
} from '@tiptap/react';
import PromptField from '../components/PromptField';

// ============================================================================
// SelfExplanationView — NodeView for the self_explanation block.
//
//   <div.self-explanation-block>
//     <NodeViewContent />    <- editable inline prompt (text + math)
//     <textarea disabled />  <- preview of the student's answer area
//   </div>
//
// The preview textarea is disabled (authoring chrome, not content); its
// placeholder text comes from the `placeholder` attr so the teacher sees what
// the student will. That placeholder (the "sentence starter") is edited in the
// block's Settings drawer (⚙ → AdvancedDrawer, descriptor-driven); the old
// inline "⚙ Sentence starter" footer was removed (2026-07-15,
// /plan-eng-review) — one settings home across all blocks.
// ============================================================================

export default function SelfExplanationView({ node, selected }: NodeViewProps) {
    const placeholder = (node.attrs.placeholder as string | undefined) ?? '';

    return (
        <NodeViewWrapper
            className={`self-explanation-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div
                className="self-explanation-block__header"
                contentEditable={false}
            >
                <span
                    className="self-explanation-block__icon"
                    aria-hidden="true"
                >
                    ❝
                </span>
                <span className="self-explanation-block__label">
                    Self-explanation
                </span>
            </div>
            <PromptField
                node={node}
                className="self-explanation-block__prompt"
                placeholder="Type the question…"
            />
            <textarea
                className="self-explanation-block__preview"
                rows={3}
                disabled
                placeholder={placeholder || 'Students type their explanation here…'}
                contentEditable={false}
                aria-hidden="true"
            />
        </NodeViewWrapper>
    );
}
