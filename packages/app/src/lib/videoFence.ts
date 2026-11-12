// =============================================================================
// videoFence.ts — the ```video fence grammar (D64)
// -----------------------------------------------------------------------------
// docs/design/video-pause-points.md VP-1, VP-6.
//
//   ```video
//   title: Comparing decimals                  ← required
//   url: https://youtu.be/abc123               ← required: YouTube, or https .mp4/.webm
//   captions: https://example.org/clip.vtt     ← required on a file, refused on YouTube
//   recorded_against: 3fa9c1d2                 ← the hash a dry run prints
//   pause: 3:20                                ← at least one, ascending
//   pause: 5:05 | rewind 3:40
//   ```
//
// Unlike a chart, nothing here is skipped and survived: any problem means no
// block, because a wrong pause map stops a student at the wrong moment. Where
// the fence may sit is videoImport.ts's job, since this file sees only its text.
// =============================================================================

import { videoHostOf, type VideoPause } from '@activity/schema';

/** The Tiptap `video` node's data attr. `stale` is added on the way back from a
 * stored document, so the editor's card can show it. */
export interface VideoAttrs {
    title: string;
    url: string;
    captions?: string;
    recordedAgainst?: string;
    pauses: VideoPause[];
    stale?: boolean;
}

export interface VideoParse {
    attrs: VideoAttrs | null;
    problems: string[];
}

const TIME = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/;

/** `m:ss` or `h:mm:ss` → seconds, or null. The fence and the editor form both read times with this. */
export function seconds(text: string): number | null {
    const match = TIME.exec(text.trim());
    if (!match) return null;
    const [, hours, minutes, secs] = match;
    if (Number(secs) > 59 || (hours !== undefined && Number(minutes) > 59)) return null;
    return Number(hours ?? 0) * 3600 + Number(minutes) * 60 + Number(secs);
}

function parsePause(value: string, problems: string[]): VideoPause | null {
    const [time, rewind, ...rest] = value.split('|').map((part) => part.trim());
    const at = seconds(time ?? '');
    if (at === null || rest.length > 0) {
        problems.push(`Video: can't read \`pause: ${value}\`. Write \`pause: m:ss\` or \`pause: m:ss | rewind m:ss\`.`);
        return null;
    }
    if (rewind === undefined) return { at };
    const target = /^rewind\s+(.+)$/i.exec(rewind);
    const rewindTo = target ? seconds(target[1]!) : null;
    if (rewindTo === null) {
        problems.push(`Video: can't read \`pause: ${value}\`. Write \`pause: m:ss | rewind m:ss\`.`);
        return null;
    }
    if (rewindTo >= at) {
        problems.push(`Video: \`pause: ${value}\` rewinds forward. A rewind must go to an earlier time.`);
        return null;
    }
    return { at, rewindTo };
}

export function parseVideoFence(source: string): VideoParse {
    const problems: string[] = [];
    let title = '';
    let url = '';
    let captions = '';
    let recordedAgainst = '';
    const pauses: VideoPause[] = [];

    for (const raw of source.split('\n')) {
        const line = raw.trim();
        if (line === '') continue;
        const match = /^([a-z_]+):\s*(.*)$/i.exec(line);
        const key = match?.[1]?.toLowerCase();
        const value = match?.[2]?.trim() ?? '';
        if (key === 'title') title = value;
        else if (key === 'url') url = value;
        else if (key === 'captions') captions = value;
        else if (key === 'recorded_against') recordedAgainst = value;
        else if (key === 'pause') {
            const pause = parsePause(value, problems);
            if (pause) pauses.push(pause);
        } else problems.push(`Video: can't read the line \`${line}\`.`);
    }

    // A pause line that failed to parse already said so; "needs at least one"
    // on top of it would be noise.
    const pauseLineFailed = problems.some((p) => p.includes('pause:'));
    const shared = videoProblems({ title, url, captions, pauses }, FENCE_WORDS).filter(
        (problem) => !(pauseLineFailed && problem.field === 'pauses' && pauses.length === 0),
    );
    problems.push(...shared.map((problem) => `Video: ${problem.message}`));
    if (recordedAgainst && !/^[0-9a-f]{8}$/.test(recordedAgainst)) {
        problems.push(`Video: \`recorded_against: ${recordedAgainst}\` isn't a hash. Paste the 8 characters a dry run prints.`);
    }
    if (problems.length > 0) return { attrs: null, problems };
    return {
        attrs: {
            title,
            url,
            ...(captions ? { captions } : {}),
            ...(recordedAgainst ? { recordedAgainst } : {}),
            pauses,
        },
        problems,
    };
}

// ---- the rules every writer of a clip shares ---------------------------------
// The fence parser and the editor's form (VideoForm) check the same things with
// this one function, so the two can't disagree about what a valid clip is. Only
// the words differ: the fence names its keys, the form names its fields.

export type VideoField = 'title' | 'url' | 'captions' | 'pauses';

export interface VideoProblem {
    field: VideoField;
    message: string;
}

interface VideoWords {
    title: string;
    url: string;
    captions: string;
    pause: string;
    quote: (text: string) => string;
}

export const FENCE_WORDS: VideoWords = {
    title: 'a `title:`',
    url: 'a `url:`',
    captions: '`captions:`',
    pause: '`pause:`',
    quote: (text) => `\`${text}\``,
};

export const FORM_WORDS: VideoWords = {
    title: 'a title',
    url: 'a video link',
    captions: 'a captions link',
    pause: 'pause',
    quote: (text) => `“${text}”`,
};

const VTT = /^https:\/\/\S+\.vtt(\?\S*)?$/i;

/** Everything wrong with a clip's own fields (where it sits is videoPlacement's job). */
export function videoProblems(
    clip: { title: string; url: string; captions?: string; pauses: readonly VideoPause[] },
    words: VideoWords,
): VideoProblem[] {
    const problems: VideoProblem[] = [];
    const { title, url, pauses } = clip;
    const captions = clip.captions ?? '';
    if (!title.trim()) problems.push({ field: 'title', message: `a clip needs ${words.title}.` });
    const host = url ? videoHostOf(url) : null;
    if (!url) problems.push({ field: 'url', message: `a clip needs ${words.url}.` });
    else if (!host) {
        problems.push({
            field: 'url',
            message: `${words.quote(url)} isn't a host the player supports. Use YouTube, or an https .mp4 or .webm file.`,
        });
    }
    if (host === 'youtube' && captions) {
        problems.push({ field: 'captions', message: `${words.captions} is for a video file. A YouTube clip uses its own captions.` });
    }
    if (host === 'file' && !captions) {
        problems.push({ field: 'captions', message: `a video file needs ${words.captions} with an https .vtt file.` });
    }
    if (captions && !VTT.test(captions)) {
        const shown = words === FENCE_WORDS ? `captions: ${captions}` : captions;
        problems.push({ field: 'captions', message: `${words.quote(shown)} isn't an https .vtt file.` });
    }
    if (pauses.length === 0) problems.push({ field: 'pauses', message: `a clip needs at least one ${words.pause}.` });
    for (let i = 1; i < pauses.length; i++) {
        if (pauses[i]!.at <= pauses[i - 1]!.at) {
            problems.push({ field: 'pauses', message: 'pause times must ascend.' });
            break;
        }
    }
    // The fence refuses a forward rewind line by line (parsePause), so this only
    // ever fires from the form, which holds pauses as numbers.
    pauses.forEach((pause, i) => {
        if (pause.rewindTo !== undefined && pause.rewindTo >= pause.at) {
            problems.push({ field: 'pauses', message: `pause ${i + 1} rewinds forward. A rewind must go to an earlier time.` });
        }
    });
    return problems;
}

/** What serialize needs to keep a node: without these it drops it (no stored clip). */
export function videoAttrsComplete(data: Partial<VideoAttrs> | null | undefined): data is VideoAttrs {
    return Boolean(data?.title && data.url && data.pauses?.length);
}

/** Seconds → `m:ss` (or `h:mm:ss`), the form the fence and the form both write. */
export function formatTime(total: number): string {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = String(Math.floor(total % 60)).padStart(2, '0');
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}
