// @vitest-environment jsdom
// =============================================================================
// videoPlacement.test.ts — the card's reasons ARE the save rule, and the form
// writes only what the fence would accept (D64 amendment 2026-11-12, V-2…V-4).
// =============================================================================

import { beforeAll, describe, expect, it } from 'vitest';
import { clipIsPlaced, stampVideoStaleness, type ActivityDocument, type VideoBlock } from '@activity/schema';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { tiptapToActivity } from '../lib/serialize';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { Editor } from '@tiptap/core';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { clipReasons, clipState, keptClipsBefore, locateClip } from '../lib/videoPlacement';
import { readDraft } from '../lib/videoDraft';

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

const CLIP = ['```video', 'title: Decimals', 'url: https://youtu.be/abc123', 'pause: 3:20', '```'].join('\n');
const FADED = ['```faded', 'title: One', 'x = {{4}}', '```'].join('\n');
const META = { title: 'T' } as ActivityDocument['meta'];

function placedDoc(): ActivityDocument {
    const { blocks, figureProblems } = convert(['## Lesson {checkpoint}', CLIP, FADED].join('\n\n'), { catalogue: true });
    expect(figureProblems).toBeUndefined();
    return tiptapToActivity(wrapBlocksStrict(blocks), META);
}

type Section = ActivityDocument['sections'][number];
const clipOf = (section: Section) =>
    section.rows.flatMap((r) => r.columns.flatMap((c) => c.blocks)).find((b) => b.type === 'video') as VideoBlock;
const firstColumn = (section: Section) => section.rows[0]!.columns[0]!.blocks;

// Each case breaks the placed clip in one way the save rule refuses.
const CASES: [string, (section: Section) => Record<string, string>][] = [
    ['placed as imported', () => ({})],
    ['a quiz', () => ({ activityType: 'quiz' })],
    ['an exam', () => ({ activityType: 'exam' })],
    ['a locked activity', () => ({ submissionMode: 'locked' })],
    ['a DoL section', (s) => ((s as { dol?: unknown }).dol = { skills: [] }, {})],
    ['another section title', (s) => ((s.title = 'Review'), {})],
    ['no section title', (s) => ((s.title = undefined as unknown as string), {})],
    ['a second clip', (s) => (firstColumn(s).push({ ...clipOf(s), id: crypto.randomUUID() }), {})],
    ['an extra faded block', (s) => (firstColumn(s).push({ ...firstColumn(s).at(-1)!, id: crypto.randomUUID() }), {})],
    ['a second pause', (s) => (clipOf(s).pauses.push({ at: 900 }), {})],
];

describe('clipReasons ⇔ clipIsPlaced (one rule, two voices)', () => {
    it.each(CASES)('%s', (_name, breakIt) => {
        const section = placedDoc().sections[0]!;
        const meta = breakIt(section);
        const reasons = clipReasons(section, clipOf(section), meta);
        expect(reasons.length === 0).toBe(clipIsPlaced(section, clipOf(section), meta));
        if (_name === 'placed as imported') expect(clipIsPlaced(section, clipOf(section), meta)).toBe(true);
        else expect(reasons.length).toBeGreaterThan(0);
    });

    it('names the counts when pauses and faded examples differ', () => {
        const section = placedDoc().sections[0]!;
        clipOf(section).pauses.push({ at: 900 });
        expect(clipReasons(section, clipOf(section), {}).join(' ')).toMatch(/2 pauses, but 1 faded example comes after it/);
    });
});

describe('the confirm button stamps the hash a save checks (V-4)', () => {
    it('an unstamped clip does not match; stamping its hash makes the next save current', () => {
        const doc = placedDoc();
        const found = locateClip(doc, 0)!;
        const state = clipState(found.section, found.video, {});
        expect(state.reasons).toEqual([]);
        expect(state.matches).toBe(false);
        expect(found.video.stale).toBe(true);
        found.video.recordedAgainst = state.hash;
        stampVideoStaleness(doc.sections, {});
        expect(found.video.stale).toBe(false);
        expect(clipState(found.section, found.video, {}).matches).toBe(true);
    });

    it('each editor card resolves to its own clip: incomplete cards are skipped, columns and sections counted in order', () => {
        // The card's mapping (VideoViewBody): count COMPLETE clips before it in
        // the editor doc, then take that index in the serialized doc.
        const clip = (title: string) => ({ type: 'video', attrs: { id: '', data: { title, url: 'https://youtu.be/abc123', pauses: [{ at: 1 }] } } });
        const empty = { type: 'video', attrs: { id: '', data: null } };
        const row = (...columns: object[][]) => ({
            type: 'row',
            attrs: { id: crypto.randomUUID(), gridLines: 'inherit' },
            content: columns.map((content) => ({ type: 'column', attrs: { width: null, minHeight: null }, content })),
        });
        const json = {
            type: 'doc',
            content: [
                { type: 'sectionBreak', attrs: { title: 'Lesson', dol: null, isCheckpoint: false } },
                row([empty, clip('A')], [clip('B')]),
                { type: 'sectionBreak', attrs: { title: 'More', dol: null, isCheckpoint: false } },
                row([empty, clip('C')]),
            ],
        };
        const doc = tiptapToActivity(json as never, META);
        // The card's own function, over a real editor doc.
        const editor = new Editor({ extensions: buildEditorExtensions(), content: json });
        const editorOrder: (string | null)[] = [];
        editor.state.doc.descendants((node, pos) => {
            if (node.type.name !== 'video') return true;
            editorOrder.push(node.attrs.data ? locateClip(doc, keptClipsBefore(editor.state.doc, pos))?.video.title ?? 'MISSING' : null);
            return false;
        });
        editor.destroy();
        expect(editorOrder).toEqual([null, 'A', 'B', null, 'C']);
    });

    it('locateClip counts clips in document order', () => {
        expect(locateClip(placedDoc(), 0)?.video.title).toBe('Decimals');
        expect(locateClip(placedDoc(), 1)).toBeNull();
    });
});

describe('the form writes only a clip the fence would accept (V-2)', () => {
    const draft = (over: Partial<Parameters<typeof readDraft>[0]> = {}) => ({
        title: 'Decimals',
        url: 'https://youtu.be/abc123',
        captions: '',
        pauses: [{ at: '3:20', rewind: '' }],
        ...over,
    });

    it('a valid draft becomes the clip, keeping the stored stamp', () => {
        const stored = { title: 'Old', url: 'https://youtu.be/abc123', recordedAgainst: '3fa9c1d2', pauses: [{ at: 1 }] };
        expect(readDraft(draft({ pauses: [{ at: '3:20', rewind: '' }, { at: '5:05', rewind: '3:40' }] }), stored)).toEqual({
            attrs: {
                title: 'Decimals',
                url: 'https://youtu.be/abc123',
                recordedAgainst: '3fa9c1d2',
                pauses: [{ at: 200 }, { at: 305, rewindTo: 220 }],
            },
            problems: [],
        });
    });

    it.each([
        ['no title', { title: ' ' }, /needs a title/],
        ['no link', { url: '' }, /needs a video link/],
        ['another host', { url: 'https://vimeo.com/1' }, /isn't a host/],
        ['a file with no captions', { url: 'https://example.org/a.mp4' }, /captions link/],
        ['bad captions', { url: 'https://example.org/a.mp4', captions: 'https://example.org/a.srt' }, /isn't an https \.vtt/],
        ['an unreadable time', { pauses: [{ at: '3:75', rewind: '' }] }, /can't read “3:75”/],
        ['an unreadable rewind', { pauses: [{ at: '3:20', rewind: 'soon' }] }, /can't read “soon”/],
        ['a forward rewind', { pauses: [{ at: '3:20', rewind: '4:00' }] }, /rewinds forward/],
        ['times out of order', { pauses: [{ at: '3:20', rewind: '' }, { at: '1:00', rewind: '' }] }, /ascend/],
    ])('refuses %s, writing nothing', (_name, over, pattern) => {
        const read = readDraft(draft(over), null);
        expect(read.attrs).toBeNull();
        expect(read.problems.join(' ')).toMatch(pattern);
    });

    it('drops a leftover captions link once the link is YouTube', () => {
        expect(readDraft(draft({ captions: 'https://example.org/a.vtt' }), null).attrs?.captions).toBeUndefined();
    });
});

describe('Fable review fixes (2026-11-12)', () => {
    it('a new link drops the confirmation; the same link keeps it', () => {
        const stored = { title: 'A', url: 'https://youtu.be/abc123', recordedAgainst: '3fa9c1d2', pauses: [{ at: 1 }] };
        const base = { title: 'A', url: 'https://youtu.be/abc123', captions: '', pauses: [{ at: '0:01', rewind: '' }] };
        expect(readDraft(base, stored).attrs?.recordedAgainst).toBe('3fa9c1d2');
        expect(readDraft({ ...base, url: 'https://youtu.be/xyz789' }, stored).attrs?.recordedAgainst).toBeUndefined();
    });

    it('a pasted card the fence would refuse arrives empty (not saved)', () => {
        const editor = new Editor({ extensions: buildEditorExtensions() });
        const card = (data: object) => `<div data-block-type="video" data-video='${JSON.stringify(data)}'></div>`;
        editor.commands.setContent(card({ title: 'A', url: 'https://vimeo.com/1', pauses: [{ at: 1 }] }));
        const bad = editor.getJSON();
        editor.commands.setContent(card({ title: 'A', url: 'https://youtu.be/abc123', pauses: [{ at: 1 }] }));
        const good = editor.getJSON();
        editor.destroy();
        expect(JSON.stringify(bad)).toContain('"data":null');
        expect(JSON.stringify(good)).toContain('"url":"https://youtu.be/abc123"');
    });
});
