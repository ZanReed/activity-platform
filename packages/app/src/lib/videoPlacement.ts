// =============================================================================
// videoPlacement.ts — why a clip in the editor won't reach students, in words
// -----------------------------------------------------------------------------
// docs/design/video-pause-points.md → "Amendment 2026-11-12" (V-3, V-4).
//
// The save rule is the schema's `clipIsPlaced` + the beat hash
// (stampVideoStaleness). This file says the same rule as REASONS a teacher can
// act on, for the card. It does not replace clipIsPlaced — that function also
// runs in the grading bundle, and rewriting it here would change a deployed
// artifact for no behaviour change. Instead videoPlacement.test.ts holds the two
// to each other over every case: no reasons ⇔ placed.
//
// `locateClip` finds the editor node's clip in a serialized document. Block ids
// are minted fresh on every serialize, so it counts: the Nth clip serialize
// KEEPS (videoAttrsComplete) before the node is the Nth clip in the document.
// =============================================================================

import {
    videoBeatHash,
    videoPauseTargets,
    type ActivityDocument,
    type Block,
    type VideoBlock,
} from '@activity/schema';
import type { Node as PMNode } from '@tiptap/pm/model';
import { videoAttrsComplete, type VideoAttrs } from './videoFence';

type Section = ActivityDocument['sections'][number];

export interface ClipMeta {
    activityType?: string;
    submissionMode?: string;
}

export interface ClipState {
    /** Where it sits: each is something the teacher must change. Empty = placed. */
    reasons: string[];
    /** The beat hash now. Pasting it into recordedAgainst re-stamps the clip. */
    hash: string;
    /** recordedAgainst matches the beat as it is now. */
    matches: boolean;
}

function blocksOf(section: Section): Block[] {
    return section.rows.flatMap((row) => row.columns.flatMap((column) => column.blocks));
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The same conditions as the schema's clipIsPlaced, one reason each. */
export function clipReasons(section: Section, video: VideoBlock, meta: ClipMeta): string[] {
    const reasons: string[] = [];
    if (meta.activityType === 'quiz' || meta.activityType === 'exam') {
        reasons.push(`A ${meta.activityType} can't have a video: a pause would tell students an answer before the check.`);
    }
    if (meta.submissionMode === 'locked') {
        reasons.push("A locked activity can't have a video: its check can't be redone, so a pause mustn't answer first.");
    }
    if (section.dol != null) reasons.push("A DoL section can't have a video.");
    if (section.title?.trim().toLowerCase() !== 'lesson') {
        reasons.push('Move the video into the section titled “Lesson”.');
    }
    if (blocksOf(section).filter((block) => block.type === 'video').length !== 1) {
        reasons.push('This section has another video. A section can have only one.');
    }
    const faded = videoPauseTargets(section, video).length;
    if (faded !== video.pauses.length) {
        reasons.push(
            `The video has ${plural(video.pauses.length, 'pause', 'pauses')}, but ${plural(faded, 'faded example comes', 'faded examples come')} after it in this section. Each pause stops at the next faded example, so the numbers must match.`,
        );
    }
    return reasons;
}

/** The `index`th kept clip in document order, with its section. */
export function locateClip(doc: ActivityDocument, index: number): { section: Section; video: VideoBlock } | null {
    let seen = 0;
    for (const section of doc.sections) {
        for (const block of blocksOf(section)) {
            if (block.type !== 'video') continue;
            if (seen === index) return { section, video: block };
            seen++;
        }
    }
    return null;
}

export function clipState(section: Section, video: VideoBlock, meta: ClipMeta): ClipState {
    const hash = videoBeatHash(section, video);
    return { reasons: clipReasons(section, video, meta), hash, matches: video.recordedAgainst === hash };
}

/** How many clips serialize will KEEP before `pos` in the editor doc: the index
 * locateClip takes for the card at `pos`. An unfinished card is dropped by
 * serialize, so it is not counted. */
export function keptClipsBefore(doc: PMNode, pos: number): number {
    let index = 0;
    doc.descendants((node, at) => {
        if (at >= pos) return false;
        if (node.type.name === 'video' && videoAttrsComplete(node.attrs.data as VideoAttrs | null)) index++;
        return true;
    });
    return index;
}
