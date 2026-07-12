import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import LearningObjectivesView from '../nodeViews/LearningObjectivesView';

// ============================================================================
// LearningObjectives — Tiptap block node for the learning_objectives content
// block. A titled list of objectives; each objective is one editable paragraph
// (content: 'paragraph+'), so the standard text alphabet (marks + inline math)
// works inside it for free. The block-level `title` is an editable attribute
// surfaced by the NodeView; `id` follows the same stable-in-session /
// fresh-on-serialize convention as the other block nodes.
//
// Pure content: no runtime wiring. definingForContent keeps the node alive when
// content is replaced into it (same reason FillInBlank carries the flag).
// ============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        learningObjectives: {
            insertLearningObjectives: () => ReturnType;
        };
    }
}

export const LearningObjectives = Node.create({
    name: 'learningObjectives',
    group: 'block',
    content: 'paragraph+',
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
            title: {
                default: 'Learning objectives',
                parseHTML: (element) =>
                    element.getAttribute('data-title') ?? 'Learning objectives',
                renderHTML: (attributes) => ({
                    'data-title': (attributes.title as string) ?? '',
                }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'section[data-learning-objectives]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'section',
            mergeAttributes({ 'data-learning-objectives': '' }, HTMLAttributes),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(LearningObjectivesView);
    },

    addCommands() {
        return {
            insertLearningObjectives:
                () =>
                ({ chain }) =>
                    chain()
                        .focus()
                        .insertContent({
                            type: this.name,
                            attrs: { id: crypto.randomUUID() },
                            content: [{ type: 'paragraph' }],
                        })
                        .run(),
        };
    },
});
