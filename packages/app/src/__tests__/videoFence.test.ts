// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from 'vitest';
import { getSchema } from '@tiptap/core';
import { DOMSerializer, Node as PMNode } from '@tiptap/pm/model';
import { videoBeats, type ActivityDocument, type VideoBlock } from '@activity/schema';
import { parseVideoFence } from '../lib/videoFence';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { buildEditorExtensions } from '../editor/editorExtensions';

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

const video = (...lines: string[]) => ['```video', ...lines, '```'].join('\n');
const CLIP = video('title: Decimals', 'url: https://youtu.be/abc123', 'pause: 3:20');
const FADED = ['```faded', 'title: One', 'x = {{4}}', '```'].join('\n');
const WORKED = ['```worked', 'title: Example', 'Line up the points.', '```'].join('\n');
const lesson = (...parts: string[]) => ['## Lesson {checkpoint}', ...parts].join('\n\n');
const catalogue = (md: string) => convert(md, { catalogue: true });
const hasVideo = (md: string) => catalogue(md).blocks.some((b) => b.type === 'video');

describe('parseVideoFence', () => {
    it('reads every key, with times in seconds', () => {
        const { attrs, problems } = parseVideoFence(
            'title: Decimals\nurl: https://example.org/a.mp4\ncaptions: https://example.org/a.vtt\nrecorded_against: 3fa9c1d2\npause: 3:20\npause: 5:05 | rewind 3:40\npause: 1:00:00',
        );
        expect(problems).toEqual([]);
        expect(attrs).toEqual({
            title: 'Decimals',
            url: 'https://example.org/a.mp4',
            captions: 'https://example.org/a.vtt',
            recordedAgainst: '3fa9c1d2',
            pauses: [{ at: 200 }, { at: 305, rewindTo: 220 }, { at: 3600 }],
        });
    });

    it.each([
        ['no title', 'url: https://youtu.be/abc123\npause: 1:00', /title/],
        ['no url', 'title: A\npause: 1:00', /url/],
        ['another host', 'title: A\nurl: https://vimeo.com/1\npause: 1:00', /isn't a host/],
        ['no pause (C-176)', 'title: A\nurl: https://youtu.be/abc123', /at least one/],
        ['times that do not ascend', 'title: A\nurl: https://youtu.be/abc123\npause: 2:00\npause: 1:00', /ascend/],
        ['equal times', 'title: A\nurl: https://youtu.be/abc123\npause: 2:00\npause: 2:00', /ascend/],
        ['a bad time', 'title: A\nurl: https://youtu.be/abc123\npause: 2:75', /can't read/],
        ['a forward rewind', 'title: A\nurl: https://youtu.be/abc123\npause: 2:00 | rewind 3:00', /earlier/],
        ['a file with no captions', 'title: A\nurl: https://example.org/a.mp4\npause: 1:00', /captions/],
        ['captions on YouTube', 'title: A\nurl: https://youtu.be/abc123\ncaptions: https://example.org/a.vtt\npause: 1:00', /captions/],
        ['a hash that is not one', 'title: A\nurl: https://youtu.be/abc123\nrecorded_against: nope\npause: 1:00', /isn't a hash/],
        ['an unknown line', 'title: A\nurl: https://youtu.be/abc123\npause: 1:00\nautoplay: yes', /can't read the line/],
    ])('refuses %s, with no block', (_name, source, pattern) => {
        const { attrs, problems } = parseVideoFence(source);
        expect(attrs).toBeNull();
        expect(problems.join(' ')).toMatch(pattern);
    });
});

describe('where a clip may sit (VP-1)', () => {
    it('a lesson section with one pause per faded block imports', () => {
        const result = catalogue(lesson(CLIP, WORKED, FADED));
        expect(result.figureProblems).toBeUndefined();
        expect(result.blocks.some((b) => b.type === 'video')).toBe(true);
    });

    it.each([
        ['a pause count that differs', lesson(CLIP, FADED, FADED), /1 pause, but 2 faded/],
        ['a faded block above the fence only', lesson(FADED, CLIP), /1 pause, but 0 faded/],
        ['the faded block in the next section', [lesson(CLIP), '## More {checkpoint}', FADED].join('\n\n'), /1 pause, but 0 faded/],
        ['another section title', ['## Review {checkpoint}', CLIP, FADED].join('\n\n'), /## Lesson/],
        ['no section at all', [CLIP, FADED].join('\n\n'), /## Lesson/],
        ['a DoL section', ['## Lesson {checkpoint dol}', CLIP, FADED].join('\n\n'), /DoL/],
        ['two clips in one section', lesson(CLIP, CLIP, FADED), /only one clip/],
    ])('refuses %s', (_name, md, pattern) => {
        const result = catalogue(md);
        expect(result.figureProblems?.join(' ')).toMatch(pattern);
        expect(result.blocks.some((b) => b.type === 'video')).toBe(false);
    });

    it.each(['quiz', 'exam'])('refuses a %s', (type) => {
        const md = ['```meta', `type: ${type}`, '```', '', lesson(CLIP, FADED)].join('\n');
        expect(catalogue(md).figureProblems?.join(' ')).toMatch(new RegExp(`a ${type} can't have a clip`));
        expect(hasVideo(md)).toBe(false);
    });

    it('refuses a locked activity', () => {
        const md = ['```meta', 'submission: locked', '```', '', lesson(CLIP, FADED)].join('\n');
        expect(catalogue(md).figureProblems?.join(' ')).toMatch(/locked activity/);
        expect(hasVideo(md)).toBe(false);
    });

    it('refuses a clip inside columns', () => {
        const md = lesson(['```columns', CLIP.replace(/```video\n|\n```/g, ''), '```'].join('\n'), FADED);
        expect(hasVideo(md)).toBe(false);
    });

    it('refuses a clip inside a reference panel', () => {
        const result = catalogue(['```reference', CLIP, '```'].join('\n'));
        expect(JSON.stringify(result.referencePanel ?? {})).not.toContain('"video"');
    });

    it("a teacher's paste leaves it out and says so (VP-10, kept by V-6)", () => {
        const result = convert(lesson(CLIP, FADED));
        expect(result.blocks.some((b) => b.type === 'video')).toBe(false);
        expect(result.warnings.join(' ')).toMatch(/catalogue importer/);
    });
});

const META = { title: 'T' } as ActivityDocument['meta'];
function save(md: string): ActivityDocument {
    const { blocks, figureProblems } = catalogue(md);
    expect(figureProblems).toBeUndefined();
    return tiptapToActivity(wrapBlocksStrict(blocks), META);
}
function clipOf(doc: ActivityDocument): VideoBlock {
    for (const section of doc.sections) {
        for (const row of section.rows) {
            for (const column of row.columns) {
                for (const block of column.blocks) if (block.type === 'video') return block;
            }
        }
    }
    throw new Error('no clip');
}
const stamped = (hash: string, ...parts: string[]) =>
    lesson(video('title: Decimals', 'url: https://youtu.be/abc123', `recorded_against: ${hash}`, 'pause: 3:20'), ...parts);

describe('staleness on save (VP-5)', () => {
    const hashOf = (...parts: string[]) => videoBeats(save(lesson(CLIP, ...parts)).sections)[0]!.hash;

    it('no recorded_against is stale, the matching hash is current', () => {
        expect(clipOf(save(lesson(CLIP, WORKED, FADED))).stale).toBe(true);
        expect(clipOf(save(stamped(hashOf(WORKED, FADED), WORKED, FADED))).stale).toBe(false);
    });

    it('a changed answer or worked example makes a stamped clip stale; a prompt typo does not', () => {
        const hash = hashOf(WORKED, FADED);
        expect(clipOf(save(stamped(hash, WORKED, FADED.replace('{{4}}', '{{5}}')))).stale).toBe(true);
        expect(clipOf(save(stamped(hash, WORKED.replace('points', 'dots'), FADED))).stale).toBe(true);
        expect(clipOf(save(stamped(hash, WORKED, FADED.replace('x = ', 'y = ')))).stale).toBe(false);
    });

    it('load then save keeps everything, and the same hash (the editor path)', () => {
        const hash = hashOf(WORKED, FADED);
        const first = save(stamped(hash, WORKED, FADED));
        const again = tiptapToActivity(activityToTiptap(first), first.meta);
        expect({ ...clipOf(again), id: '' }).toEqual({ ...clipOf(first), id: '' });
        expect(clipOf(again).stale).toBe(false);
    });

    it('editing a faded block in the editor marks the stored clip stale', () => {
        const first = save(stamped(hashOf(WORKED, FADED), WORKED, FADED));
        const tiptap = JSON.parse(JSON.stringify(activityToTiptap(first)).replace('"answer":"4"', '"answer":"5"'));
        expect(clipOf(tiptapToActivity(tiptap, first.meta)).stale).toBe(true);
    });
});

describe("the editor card's static HTML (copy-paste and the DOM serializer)", () => {
    function card(data: Record<string, unknown>): HTMLElement {
        const schema = getSchema(buildEditorExtensions());
        const node = PMNode.fromJSON(schema, { type: 'video', attrs: { id: 'x', data } });
        return DOMSerializer.fromSchema(schema).serializeNode(node, { document }) as HTMLElement;
    }
    const data = { title: 'Decimals', url: 'https://youtu.be/abc123', pauses: [{ at: 1 }, { at: 2 }] };

    it('shows the title, URL and pause count', () => {
        const text = card({ ...data, stale: false }).textContent;
        expect(text).toContain('Decimals');
        expect(text).toContain('https://youtu.be/abc123');
        expect(text).toContain('2 pauses');
        expect(text).not.toContain('out of date');
    });

    it('says when the clip is out of date', () => {
        expect(card({ ...data, stale: true }).textContent).toContain('Video is out of date');
    });

    // Replaced 2026-11-12: the old test imported `SLASH_MENU_ITEMS`, a name the
    // module never exported, so `?? []` made it pass whatever the menu held (P9).
    it('is offered as "Video", and inserts an empty card that a save drops (amendment V-1)', async () => {
        const { slashMenuItems } = await import('../editor/slashMenuItems');
        const item = slashMenuItems.find((i) => i.title === 'Video');
        expect(item?.subgroup).toBe('Media & figures');
        const { Editor } = await import('@tiptap/core');
        const editor = new Editor({ extensions: buildEditorExtensions() });
        item!.command({ editor });
        const json = editor.getJSON();
        expect(JSON.stringify(json)).toContain('"type":"video"');
        // data: null — not a clip yet, so nothing is stored (the card says "Not saved yet").
        expect(JSON.stringify(tiptapToActivity(json, META))).not.toContain('"video"');
        editor.destroy();
    });
});
