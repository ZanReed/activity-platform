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

function seconds(text: string): number | null {
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

    if (!title) problems.push('Video: a clip needs a `title:`.');
    const host = url ? videoHostOf(url) : null;
    if (!url) problems.push('Video: a clip needs a `url:`.');
    else if (!host) problems.push(`Video: \`${url}\` isn't a host the player supports. Use YouTube, or an https .mp4 or .webm file.`);
    if (host === 'youtube' && captions) problems.push('Video: `captions:` is for a video file. A YouTube clip uses its own captions.');
    if (host === 'file' && !captions) problems.push('Video: a video file needs `captions:` with an https .vtt file.');
    if (captions && !/^https:\/\/\S+\.vtt(\?\S*)?$/i.test(captions)) problems.push(`Video: \`captions: ${captions}\` isn't an https .vtt file.`);
    if (recordedAgainst && !/^[0-9a-f]{8}$/.test(recordedAgainst)) {
        problems.push(`Video: \`recorded_against: ${recordedAgainst}\` isn't a hash. Paste the 8 characters a dry run prints.`);
    }
    if (pauses.length === 0 && problems.every((p) => !p.includes('pause:'))) {
        problems.push('Video: a clip needs at least one `pause:`.');
    }
    for (let i = 1; i < pauses.length; i++) {
        if (pauses[i]!.at <= pauses[i - 1]!.at) {
            problems.push('Video: pause times must ascend.');
            break;
        }
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
