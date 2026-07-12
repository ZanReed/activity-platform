import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import SelfExplanationView from '../nodeViews/SelfExplanationView';

// ============================================================================
// SelfExplanation — Tiptap block node for the self_explanation block. An
// editable inline PROMPT (text + inline math, same alphabet as a fill-in-blank
// body minus blanks) plus an optional `placeholder` attribute (a sentence-
// starter shown in the student's empty textarea). Ungraded — no answer key.
// The NodeView shows the prompt editable over a disabled preview textarea.
// ============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        selfExplanation: {
            insertSelfExplanation: () => ReturnType;
        };
    }
}

export const SelfExplanation = Node.create({
    name: 'selfExplanation',
    group: 'block',
    content: '(text | mathInline)*',
    draggable: true,
    selectable: true,
    definingForContent: true,

    addAttributes() {
        return {
            id: {
                default: '',
                parseHTML: (element) => element.getAttribute('data-block-id') ?? '',
                renderHTML: (attributes) =>
                    attributes.id ? { 'data-block-id': attributes.id } : {},
            },
            placeholder: {
                default: '',
                parseHTML: (element) =>
                    element.getAttribute('data-placeholder') ?? '',
                renderHTML: (attributes) =>
                    attributes.placeholder
                        ? { 'data-placeholder': attributes.placeholder as string }
                        : {},
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-self-explanation]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes({ 'data-self-explanation': '' }, HTMLAttributes),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(SelfExplanationView);
    },

    addCommands() {
        return {
            insertSelfExplanation:
                () =>
                ({ chain }) =>
                    chain()
                        .focus()
                        .insertContent({
                            type: this.name,
                            attrs: { id: crypto.randomUUID() },
                        })
                        .run(),
        };
    },
});
