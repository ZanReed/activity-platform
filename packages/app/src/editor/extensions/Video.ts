import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FENCE_WORDS, videoAttrsComplete, videoProblems, type VideoAttrs } from '../../lib/videoFence';
import type { ClipMeta } from '../../lib/videoPlacement';
import VideoView from '../nodeViews/VideoView';

// ============================================================================
// Video — the catch-up clip's editor node (D64). Since the 2026-11-12
// amendment (docs/design/video-pause-points.md, V-1…V-7, lifting VP-10) a
// teacher inserts one from the slash / Insert menu and edits it on the card
// (VideoViewBody + VideoForm): title, link, captions, pauses, and "This video
// matches the lesson as it is now". The card says live why a clip won't reach
// students (lib/videoPlacement.ts), by the same rule a save applies.
//
// Its data still rides as ONE attr. A freshly inserted card has `data: null`,
// which serialize drops (videoAttrsComplete), so the card says "Not saved yet"
// until it has a title, a link and a pause.
//
// `storage.meta` is the activity's type and submission mode, written by
// Editor.tsx: a quiz, exam or locked activity can't have a clip, and a NodeView
// has no other way to see the activity's settings.
//
// renderHTML stays the plain card: it is what copy-paste and the DOM
// serializer produce, and what the round-trip tests read.
// ============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        video: {
            /** Insert an empty catch-up video card, opened for editing. */
            insertVideo: () => ReturnType;
        };
    }
}

export interface VideoStorage {
    meta: ClipMeta;
    /** Cards re-check when the activity's settings change (no transaction fires). */
    listeners: Set<() => void>;
}

const pauseCount = (n: number): string => `${n} pause${n === 1 ? '' : 's'}`;

export const Video = Node.create<Record<string, never>, VideoStorage>({
    name: 'video',
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    addStorage() {
        return { meta: {}, listeners: new Set() };
    },

    addAttributes() {
        return {
            id: {
                default: '',
                parseHTML: (el) => el.getAttribute('data-block-id') ?? '',
                renderHTML: (attrs) => (attrs.id ? { 'data-block-id': attrs.id } : {}),
            },
            data: {
                default: null,
                // A pasted card is held to the form's rules (Fable review 2026-11-12):
                // a clip the fence would refuse becomes an empty card, which the
                // card shows as "Not saved yet" and a save drops.
                parseHTML: (el) => {
                    try {
                        const data = JSON.parse(el.getAttribute('data-video') ?? '') as VideoAttrs;
                        return videoAttrsComplete(data) && videoProblems(data, FENCE_WORDS).length === 0 ? data : null;
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

    addNodeView() {
        return ReactNodeViewRenderer(VideoView);
    },

    addCommands() {
        return {
            insertVideo:
                () =>
                ({ chain }) =>
                    chain().insertContent({ type: this.name, attrs: { data: null } }).run(),
        };
    },
});
