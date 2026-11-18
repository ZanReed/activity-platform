import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FreeResponseView from '../nodeViews/FreeResponseView';
import { answerFieldAttrs, answerSpaceAttr } from './freeResponseAttrs';
import { labelNodeAttr } from '../labelNodeAttr';

// ============================================================================
// PhotoResponse — Tiptap block node for photo_response (media submissions
// slice 2; docs/design/media-submissions.md §9). A student answers with a photo
// of their handwritten working; the teacher grades it against the rubric.
//
// The third sibling on FreeResponseView: an editable inline PROMPT and the same
// teacher-only attrs as short_answer (rubric, answer, solution, workSpace,
// label), edited in the same Settings drawer groups. What is its own:
// `maxPhotos` (1, 2 or 3; absent = 1), and the canvas preview shows a disabled
// "Add a photo" button rather than a textarea, so the teacher sees what the
// student will see.
// ============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        photoResponse: {
            insertPhotoResponse: () => ReturnType;
        };
    }
}

export const PhotoResponse = Node.create({
    name: 'photoResponse',
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
            // 1, 2 or 3. null = the default (1), so a block the teacher never
            // changed serializes without the field.
            maxPhotos: {
                default: null as number | null,
                parseHTML: (element) => {
                    const n = Number(element.getAttribute('data-max-photos'));
                    return n === 2 || n === 3 ? n : null;
                },
                renderHTML: (attributes) =>
                    attributes.maxPhotos
                        ? { 'data-max-photos': String(attributes.maxPhotos) }
                        : {},
            },
            rubric: {
                default: null as unknown,
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-rubric');
                    if (!raw) return null;
                    try {
                        return JSON.parse(raw);
                    } catch {
                        return null;
                    }
                },
                renderHTML: (attributes) =>
                    attributes.rubric
                        ? { 'data-rubric': JSON.stringify(attributes.rubric) }
                        : {},
            },
            ...answerFieldAttrs(),
            ...answerSpaceAttr(),
            ...labelNodeAttr,
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-photo-response]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes({ 'data-photo-response': '' }, HTMLAttributes),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(FreeResponseView);
    },

    addCommands() {
        return {
            insertPhotoResponse:
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
