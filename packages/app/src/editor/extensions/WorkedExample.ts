import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import WorkedExampleView from '../nodeViews/WorkedExampleView';

// ============================================================================
// WorkedExample — Tiptap block node for the worked_example content block. A
// titled, boxed frame whose body holds NESTED content blocks (paragraphs,
// block math, lists, images). The content expression enumerates exactly the
// editor-mappable children in the schema's WorkedExampleChild union — it does
// NOT use `block+`, so questions/columns/nested worked-examples can't be pasted
// in (the same containment discipline the `column` node uses).
//
// The block-level `title` is an editable attribute surfaced by the NodeView.
// Pure content: no runtime wiring. definingForContent keeps the node alive when
// content is replaced into it.
// ============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        workedExample: {
            insertWorkedExample: () => ReturnType;
        };
    }
}

export const WorkedExample = Node.create({
    name: 'workedExample',
    group: 'block',
    content: '(paragraph | heading | mathBlock | bulletList | orderedList | image)+',
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
                default: 'Worked example',
                parseHTML: (element) =>
                    element.getAttribute('data-title') ?? 'Worked example',
                renderHTML: (attributes) => ({
                    'data-title': (attributes.title as string) ?? '',
                }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'section[data-worked-example]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'section',
            mergeAttributes({ 'data-worked-example': '' }, HTMLAttributes),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(WorkedExampleView);
    },

    addCommands() {
        return {
            insertWorkedExample:
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
