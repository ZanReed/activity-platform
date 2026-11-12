// =============================================================================
// videoDraft.ts — the video form's draft, and whether it is a clip yet
// -----------------------------------------------------------------------------
// D64 amendment 2026-11-12, V-2. VideoForm holds text; this turns it into a
// clip by the fence's own rules (videoProblems), or says what stops it.
// =============================================================================

import { videoHostOf, type VideoPause } from '@activity/schema';
import { FORM_WORDS, formatTime, seconds, videoProblems, type VideoAttrs } from './videoFence';

export interface PauseDraft {
    at: string;
    rewind: string;
}

export interface Draft {
    title: string;
    url: string;
    captions: string;
    pauses: PauseDraft[];
}

export function toDraft(data: VideoAttrs | null): Draft {
    return {
        title: data?.title ?? '',
        url: data?.url ?? '',
        captions: data?.captions ?? '',
        pauses: data?.pauses.length
            ? data.pauses.map((p) => ({ at: formatTime(p.at), rewind: p.rewindTo === undefined ? '' : formatTime(p.rewindTo) }))
            : [{ at: '', rewind: '' }],
    };
}

const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** The draft as a clip, or the problems that stop it being one. */
export function readDraft(draft: Draft, stored: VideoAttrs | null): { attrs: VideoAttrs | null; problems: string[] } {
    const problems: string[] = [];
    const pauses: VideoPause[] = [];
    draft.pauses.forEach((row, i) => {
        const at = seconds(row.at);
        if (at === null) {
            problems.push(`Pause ${i + 1}: can't read “${row.at}” as a time. Write m:ss, like 3:20.`);
            return;
        }
        if (!row.rewind.trim()) {
            pauses.push({ at });
            return;
        }
        const rewindTo = seconds(row.rewind);
        if (rewindTo === null) {
            problems.push(`Pause ${i + 1}: can't read “${row.rewind}” as a rewind time. Write m:ss, or leave it empty.`);
            return;
        }
        pauses.push({ at, rewindTo });
    });
    const clip = {
        title: draft.title.trim(),
        url: draft.url.trim(),
        // A YouTube link takes no captions field, so a leftover one is not kept.
        captions: videoHostOf(draft.url.trim()) === 'youtube' ? '' : draft.captions.trim(),
        pauses,
    };
    if (problems.length === 0) {
        problems.push(...videoProblems(clip, FORM_WORDS).map((p) => capital(p.message)));
    }
    if (problems.length > 0) return { attrs: null, problems };
    return {
        attrs: {
            title: clip.title,
            url: clip.url,
            ...(clip.captions ? { captions: clip.captions } : {}),
            // The confirmation is about THIS recording: a new link must be confirmed again
            // (Fable review 2026-11-12 — the beat hash doesn't cover the URL).
            ...(stored?.recordedAgainst && stored.url === clip.url ? { recordedAgainst: stored.recordedAgainst } : {}),
            pauses,
            ...(stored?.stale !== undefined ? { stale: stored.stale } : {}),
        },
        problems: [],
    };
}

