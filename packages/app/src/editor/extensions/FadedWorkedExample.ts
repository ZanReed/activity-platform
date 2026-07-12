import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FadedWorkedExampleView from '../nodeViews/FadedWorkedExampleView';

// ============================================================================
// FadedWorkedExample — Tiptap block node for the faded_worked_example scaffold.
// Same framed shape as WorkedExample, but the content expression ALSO admits
// `fillInBlank` — the faded steps. A shown step is a paragraph / block math /
// list / image; a faded step is a fill_in_blank block (which brings its own
// blanks, scoring, numbering, solution — the runtime scores it wherever it
// sits, so this frame needs no runtime wiring). Enumerated content (not
// `block+`) keeps questions other than fill_in_blank, plus columns / worked
// examples, out.
//
// The block-level `title` is an editable attribute surfaced by the NodeView.
// definingForContent keeps the node alive when content is replaced into it.
// ============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fadedWorkedExample: {
            insertFadedWorkedExample: () => ReturnType;
        };
    }
}

export const FadedWorkedExample = Node.create({
    name: 'fadedWorkedExample',
    group: 'block',
    content:
        '(paragraph | heading | mathBlock | bulletList | orderedList | image | fillInBlank)+',
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
                default: 'Guided practice',
                parseHTML: (element) =>
                    element.getAttribute('data-title') ?? 'Guided practice',
                renderHTML: (attributes) => ({
                    'data-title': (attributes.title as string) ?? '',
                }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'section[data-faded-worked-example]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'section',
            mergeAttributes({ 'data-faded-worked-example': '' }, HTMLAttributes),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(FadedWorkedExampleView);
    },

    addCommands() {
        return {
            insertFadedWorkedExample:
                () =>
                ({ chain }) =>
                    chain()
                        .focus()
                        .insertContent({
                            type: this.name,
                            attrs: { id: crypto.randomUUID() },
                            // Seed a shown step + a faded (fill_in_blank) step so
                            // the scaffold reads as intended the moment it lands.
                            // The fill_in_blank seeds empty (its normal insert
                            // state); the teacher types the faded step + blanks.
                            content: [
                                { type: 'paragraph' },
                                {
                                    type: 'fillInBlank',
                                    attrs: { id: crypto.randomUUID() },
                                },
                            ],
                        })
                        .run(),
        };
    },
});
