// =============================================================================
// video-beat.ts — what a pause-point clip is bound to, and whether it still is
// -----------------------------------------------------------------------------
// docs/design/video-pause-points.md VP-1, VP-5, VP-6. Zod-free, like
// chart-limits.ts: the importer, the editor's save path and the viewer read it.
//
// The hash covers the section's worked blocks' text and, for each faded block
// the clip pauses at, its blank count and answer keys (revised by C-176). A typo
// in a faded block leaves it alone; changed answers don't. Block ids, marks and
// whitespace aren't in it, so a save, a bold or a re-spacing doesn't move it.
//
// It is computed on the raw document only: the served copy has no answer keys.
// =============================================================================

import type { Block } from './blocks/index.js';
import type { VideoBlock } from './blocks/video.js';

interface SectionLike {
  title?: string;
  dol?: unknown;
  rows: readonly { columns: readonly { blocks: readonly Block[] }[] }[];
}

function blocksOf(section: SectionLike): Block[] {
  return section.rows.flatMap((row) => row.columns.flatMap((column) => column.blocks));
}

/** The faded blocks a clip pauses at: those after it in its section, in order. */
export function videoPauseTargets(section: SectionLike, video: VideoBlock): Block[] {
  const blocks = blocksOf(section);
  const from = blocks.findIndex((block) => block.id === video.id);
  return blocks.slice(from + 1).filter((block) => block.type === 'faded_worked_example');
}

function textOf(value: unknown): string {
  if (Array.isArray(value)) return value.map(textOf).join('');
  if (value === null || typeof value !== 'object') return '';
  const node = value as Record<string, unknown>;
  let out = '';
  for (const key of ['title', 'text', 'latex']) {
    if (typeof node[key] === 'string') out += node[key];
  }
  for (const key of ['content', 'items']) out += textOf(node[key]);
  return out;
}

// Every gradeable gap in a faded block, in order: a blank, or an in-equation
// prompt on a math node (which carries the same answer fields).
function answerKeysOf(value: unknown, into: unknown[]): void {
  if (Array.isArray(value)) {
    for (const el of value) answerKeysOf(el, into);
    return;
  }
  if (value === null || typeof value !== 'object') return;
  const node = value as Record<string, unknown>;
  if (node.type === 'blank' || (typeof node.answer === 'string' && 'acceptableAnswers' in node)) {
    into.push([
      node.answer,
      node.acceptableAnswers ?? [],
      node.answerType ?? null,
      node.tolerance ?? null,
      node.unit ?? null,
      node.acceptableUnits ?? [],
      node.equivalence ?? null,
    ]);
    return;
  }
  for (const key of ['content', 'prompts', 'items']) answerKeysOf(node[key], into);
}

function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/** The hash `recorded_against` must equal for this clip to be current. */
export function videoBeatHash(section: SectionLike, video: VideoBlock): string {
  const worked = blocksOf(section)
    .filter((block) => block.type === 'worked_example')
    .map((block) => textOf(block).replace(/\s+/g, ''));
  const faded = videoPauseTargets(section, video).map((block) => {
    const keys: unknown[] = [];
    answerKeysOf(block, keys);
    return { blanks: keys.length, keys };
  });
  return fnv1a(JSON.stringify({ worked, faded }));
}

// The importer refuses a clip that breaks these (videoImport.ts), but the editor
// can copy, paste or drag its card anywhere. So the save rule is the same, and it
// fails closed: a clip in the wrong place is stale, and students don't get it.
function clipIsPlaced(section: SectionLike, video: VideoBlock, activityType: string | undefined): boolean {
  return (
    activityType !== 'quiz' &&
    activityType !== 'exam' &&
    section.dol == null &&
    section.title?.trim().toLowerCase() === 'lesson' &&
    blocksOf(section).filter((block) => block.type === 'video').length === 1 &&
    videoPauseTargets(section, video).length === video.pauses.length
  );
}

function clipIsCurrent(section: SectionLike, video: VideoBlock, activityType: string | undefined): boolean {
  return clipIsPlaced(section, video, activityType) && video.recordedAgainst === videoBeatHash(section, video);
}

/** Set `stale` on every clip in these sections. Called on every save. */
export function stampVideoStaleness(sections: readonly SectionLike[], activityType?: string): void {
  for (const section of sections) {
    for (const block of blocksOf(section)) {
      if (block.type === 'video') block.stale = !clipIsCurrent(section, block, activityType);
    }
  }
}

/** Each clip's state, for the importer's report: a dry run prints the hash. */
export function videoBeats(
  sections: readonly SectionLike[],
  activityType?: string,
): { title: string; hash: string; recordedAgainst: string | null; stale: boolean }[] {
  return sections.flatMap((section) =>
    blocksOf(section).flatMap((block) => {
      if (block.type !== 'video') return [];
      const hash = videoBeatHash(section, block);
      const recordedAgainst = block.recordedAgainst ?? null;
      return [{ title: block.title, hash, recordedAgainst, stale: !clipIsCurrent(section, block, activityType) }];
    }),
  );
}

export type VideoHost = 'youtube' | 'file';

const YOUTUBE_ID = /^[\w-]{6,}$/;

/** Which player a URL needs, or null for a host the platform refuses (VP-6). */
export function videoHostOf(url: string): VideoHost | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:') return null;
  const host = parsed.hostname.replace(/^(www|m)\./, '');
  const path = parsed.pathname;
  if (host === 'youtu.be') return YOUTUBE_ID.test(path.slice(1)) ? 'youtube' : null;
  if (host === 'youtube.com' && path === '/watch') {
    return YOUTUBE_ID.test(parsed.searchParams.get('v') ?? '') ? 'youtube' : null;
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const embed = /^\/embed\/([^/]+)$/.exec(path);
    return embed && YOUTUBE_ID.test(embed[1]!) ? 'youtube' : null;
  }
  return /\.(mp4|webm)$/i.test(path) ? 'file' : null;
}
