import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FreeResponseView from '../nodeViews/FreeResponseView';

// ============================================================================
// ShortAnswer — Tiptap block node for the short_answer block (manually graded
// brief free text). Editable inline PROMPT (text + inline math) + an optional
// `placeholder` attribute. No answer key. Shares FreeResponseView with Essay.
// ============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        shortAnswer: {
            insertShortAnswer: () => ReturnType;
        };
    }
}

export const ShortAnswer = Node.create({
    name: 'shortAnswer',
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
        return [{ tag: 'div[data-short-answer]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes({ 'data-short-answer': '' }, HTMLAttributes),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(FreeResponseView);
    },

    addCommands() {
        return {
            insertShortAnswer:
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
