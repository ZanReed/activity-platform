import { Node, mergeAttributes } from '@tiptap/core';
import type { VideoAttrs } from '../../lib/videoFence';

// ============================================================================
// Video — the catch-up clip's editor node (D64, VP-10). It survives a save and
// nothing more: a read-only card with no slash entry and no form. A teacher
// can't add or change a clip in v1, so its data rides as ONE attr. No NodeView:
// a static card has no reason to add React to the editor chunk.
//
// `stale` is what the last save computed, so an edit in this session shows on
// the card after the next open.
// ============================================================================

const pauseCount = (n: number): string => `${n} pause${n === 1 ? '' : 's'}`;

export const Video = Node.create({
    name: 'video',
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
        return {
            id: {
                default: '',
                parseHTML: (el) => el.getAttribute('data-block-id') ?? '',
                renderHTML: (attrs) => (attrs.id ? { 'data-block-id': attrs.id } : {}),
            },
            data: {
                default: null,
                parseHTML: (el) => {
                    try {
                        return JSON.parse(el.getAttribute('data-video') ?? '') as VideoAttrs;
                    } catch {
                        return null;
                    }
                },
                renderHTML: (attrs) => ({ 'data-video': JSON.stringify(attrs.data) }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-block-type="video"]' }];
    },

    renderHTML({ node, HTMLAttributes }) {
        const data = node.attrs.data as VideoAttrs | null;
        return [
            'div',
            mergeAttributes({ 'data-block-type': 'video', class: 'block-video' }, HTMLAttributes),
            ['p', { class: 'block-video__title' }, data?.title ?? 'Video'],
            ['p', { class: 'block-video__url' }, data?.url ?? ''],
            ['p', { class: 'block-video__pauses' }, pauseCount(data?.pauses.length ?? 0)],
            ...(data?.stale ? [['p', { class: 'block-video__stale' }, 'Video is out of date']] : []),
        ];
    },
});
