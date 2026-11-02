// =============================================================================
// videoImport.ts — where a ```video fence may sit (D64, VP-1)
// -----------------------------------------------------------------------------
// Runs over the importer's flat block list, once the whole file is mapped,
// because each rule needs the section around the fence. A refused fence comes
// out of the list and its problem skips the file in a batch run, the figure rule:
// a wrong pause map stops a student at the wrong moment.
//
// "Lesson" means the heading's title, because the importer has no section kinds.
// All 55 faded blocks in the catalogue sit under `## Lesson {checkpoint}`.
// =============================================================================

import type { JSONContent } from '@tiptap/react';
import type { VideoAttrs } from './videoFence';

function contains(node: JSONContent, type: string): number {
    const own = node.type === type ? 1 : 0;
    return own + (node.content ?? []).reduce((sum, child) => sum + contains(child, type), 0);
}

// A clip inside columns or a side channel has no section of its own to pause in.
function stripNested(nodes: JSONContent[], problems: string[]): void {
    for (const node of nodes) {
        if (!node.content) continue;
        const kept = node.content.filter((child) => child.type !== 'video');
        if (kept.length !== node.content.length) {
            problems.push('Video: a clip must sit on its own in the section, not inside another block.');
            node.content = kept;
        }
        stripNested(node.content, problems);
    }
}

export function finalizeVideos(
    blocks: JSONContent[],
    activityType: string | undefined,
    sideChannels: JSONContent[][],
): string[] {
    const problems: string[] = [];
    stripNested(blocks, problems);
    for (const channel of sideChannels) {
        const kept = channel.filter((node) => node.type !== 'video');
        if (kept.length !== channel.length) {
            problems.push('Video: a clip must sit in the lesson section, not in a reference panel or teacher guide.');
            channel.splice(0, channel.length, ...kept);
        }
        stripNested(channel, problems);
    }

    const refused = new Set<JSONContent>();
    for (let i = 0; i < blocks.length; i++) {
        const node = blocks[i]!;
        if (node.type !== 'video') continue;
        const pauses = (node.attrs?.data as VideoAttrs).pauses.length;
        let start = i;
        while (start >= 0 && blocks[start]!.type !== 'sectionBreak') start--;
        const heading = start >= 0 ? blocks[start]! : null;
        let end = i + 1;
        while (end < blocks.length && blocks[end]!.type !== 'sectionBreak') end++;
        const after = blocks.slice(i + 1, end);
        const clipsInSection = blocks.slice(start + 1, end).filter((b) => b.type === 'video').length;
        const faded = after.reduce((sum, b) => sum + contains(b, 'fadedWorkedExample'), 0);

        let problem: string | null = null;
        if (activityType === 'quiz' || activityType === 'exam') {
            problem = `Video: a ${activityType} can't have a clip, because a pause gives a verdict before the check.`;
        } else if (heading?.attrs?.dol != null) {
            problem = "Video: a DoL section can't have a clip, because a pause gives a verdict before the check.";
        } else if (String(heading?.attrs?.title ?? '').trim().toLowerCase() !== 'lesson') {
            problem = 'Video: a clip must sit in a section headed `## Lesson`.';
        } else if (clipsInSection > 1) {
            problem = 'Video: a section can have only one clip.';
        } else if (pauses !== faded) {
            problem = `Video: ${pauses} pause${pauses === 1 ? '' : 's'}, but ${faded} faded block${faded === 1 ? '' : 's'} after the clip in this section. Each pause maps to the next faded block, so the counts must match.`;
        }
        if (problem) {
            problems.push(problem);
            refused.add(node);
        }
    }
    if (refused.size > 0) {
        const kept = blocks.filter((node) => !refused.has(node));
        blocks.splice(0, blocks.length, ...kept);
    }
    return problems;
}
