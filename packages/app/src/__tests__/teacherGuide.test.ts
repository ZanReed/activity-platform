// =============================================================================
// teacherGuide.test.ts — the ```teacher-guide fence and its serialize path
// -----------------------------------------------------------------------------
// curriculum D50; docs/design/teacher-guides.md (TG-1, TG-2, TG-8). The fence
// body is ordinary markdown written by the curriculum side, so the fixture
// below is shaped like their real guides: wrapped lines, bold rubric-line
// names, backticked misconception ids, a currency dollar.
// =============================================================================

import { beforeAll, describe, expect, it } from 'vitest';
import type { JSONContent } from '@tiptap/react';
import { ActivityDocument, createEmptyDocument } from '@activity/schema';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import {
    activityToTiptap,
    teacherGuideToTiptap,
    tiptapToActivity,
    tiptapToTeacherGuide,
} from '../lib/serialize';
import { wrapBlocksStrict } from '../editor/strictGrid';

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

const GUIDE = [
    '```teacher-guide',
    '## The sequence',
    '',
    'One idea: a unit rate is the amount for exactly one, found by dividing the',
    'total by how many. Say the unit out loud every time.',
    '',
    '## Watch for',
    '',
    '- Dividing the wrong way round (`mis.rate.ratio-inverted`). Ask, "What do we want',
    '  one of?"',
    '- **Origin test (M):** says y = 8x gives $0 at 0 GB and y = 8x + 5 gives $5.',
    '- A student writing {{4}} in the margin is fine.',
    '',
    '## If time runs short',
    '',
    'Cut practice item 3, then item 4. The slope is $m = 2$.',
    '```',
].join('\n');

const BODY = 'What is $3 \\times 4$? {{12}}';

const texts = (node: JSONContent): string[] =>
    node.type === 'text'
        ? [node.text ?? '']
        : (node.content ?? []).flatMap(texts);

const hasMark = (node: JSONContent, mark: string): boolean =>
    (node.marks ?? []).some((m) => m.type === mark) ||
    (node.content ?? []).some((c) => hasMark(c, mark));

describe('```teacher-guide fence (importer)', () => {
    it('is a side channel: the guide lands in result.teacherGuide, the body is untouched', () => {
        const withGuide = convert(`${BODY}\n\n${GUIDE}`);
        const without = convert(BODY);
        expect(withGuide.teacherGuide).toBeDefined();
        expect(without.teacherGuide).toBeUndefined();
        // Same body either way (ids aside).
        const strip = (b: JSONContent[]) => JSON.stringify(b).replace(/"id":"[^"]+"/g, '');
        expect(strip(withGuide.blocks)).toEqual(strip(without.blocks));
        // And no guide text leaks into the body as a degraded paragraph.
        expect(JSON.stringify(withGuide.blocks)).not.toContain('Watch for');
    });

    it('position does not matter (pre-pass, like ```meta)', () => {
        expect(convert(`${GUIDE}\n\n${BODY}`).teacherGuide).toBeDefined();
    });

    it('parses ordinary markdown: wrapped lines stay one paragraph, headings and lists survive', () => {
        const { teacherGuide, warnings } = convert(GUIDE);
        expect(warnings).toEqual([]);
        const types = teacherGuide!.blocks.map((b) => b.type);
        expect(types).toEqual([
            'heading', 'paragraph', 'heading', 'bulletList', 'heading', 'paragraph',
        ]);
        const firstPara = texts(teacherGuide!.blocks[1]!).join('');
        expect(firstPara).toContain('dividing the');
        expect(firstPara).toContain('total by how many');
    });

    it('keeps bold and inline code (C-82), keeps currency as text, and lifts real maths', () => {
        const { teacherGuide } = convert(GUIDE);
        const list = teacherGuide!.blocks[3]!;
        expect(hasMark(list, 'bold')).toBe(true);
        expect(hasMark(list, 'code')).toBe(true);
        expect(texts(list).join('')).toContain('mis.rate.ratio-inverted');
        expect(texts(list).join('')).toContain('$0 at 0 GB');
        const last = teacherGuide!.blocks[5]!;
        expect(JSON.stringify(last)).toContain('mathInline');
    });

    it('a {{…}} stays literal text: a guide is never gradeable', () => {
        const json = JSON.stringify(convert(GUIDE).teacherGuide);
        expect(json).not.toContain('"blank"');
        expect(json).not.toContain('fillInBlank');
        expect(json).toContain('{{4}}');
    });

    it('drops non-prose content with a warning naming it', () => {
        const { teacherGuide, warnings } = convert(
            '```teacher-guide\n## Watch for\n\nText.\n\n| a | b |\n|---|---|\n| 1 | 2 |\n```',
        );
        expect(teacherGuide!.blocks.map((b) => b.type)).toEqual(['heading', 'paragraph']);
        expect(warnings.some((w) => /Teacher guide: .*dropped: table/.test(w))).toBe(true);
    });

    it('one fence per activity: the first wins, the second warns', () => {
        const { teacherGuide, warnings } = convert(
            '```teacher-guide\nFirst.\n```\n\n```teacher-guide\nSecond.\n```',
        );
        expect(texts({ content: teacherGuide!.blocks }).join('')).toBe('First.');
        expect(warnings.some((w) => /only one ```teacher-guide/.test(w))).toBe(true);
    });

    it('an empty fence yields no guide, with a warning', () => {
        const { teacherGuide, warnings } = convert('```teacher-guide\n\n```');
        expect(teacherGuide).toBeUndefined();
        expect(warnings.some((w) => /no text to keep/.test(w))).toBe(true);
    });
});

describe('teacher guide serialize path', () => {
    it('import → schema field → stored document validates', () => {
        const guide = tiptapToTeacherGuide({ type: 'doc', content: convert(GUIDE).teacherGuide!.blocks });
        expect(guide).toBeDefined();
        const meta = createEmptyDocument({ title: 'T' }).meta;
        const doc = tiptapToActivity(wrapBlocksStrict(convert(BODY).blocks), meta, undefined, undefined, guide);
        const parsed = ActivityDocument.safeParse(doc);
        expect(parsed.success).toBe(true);
        expect(parsed.success && parsed.data.teacherGuide?.blocks.length).toBe(6);
    });

    it('round-trips: field → editor doc → field is stable', () => {
        const guide = tiptapToTeacherGuide({ type: 'doc', content: convert(GUIDE).teacherGuide!.blocks })!;
        const again = tiptapToTeacherGuide(teacherGuideToTiptap(guide))!;
        const strip = (v: unknown) => JSON.stringify(v).replace(/"id":"[^"]+"/g, '');
        expect(strip(again)).toEqual(strip(guide));
    });

    it('an editor holding only an empty paragraph is NO guide (field absent, never empty)', () => {
        expect(tiptapToTeacherGuide({ type: 'doc', content: [{ type: 'paragraph' }] })).toBeUndefined();
        const meta = createEmptyDocument({ title: 'T' }).meta;
        const doc = tiptapToActivity(activityToTiptap(createEmptyDocument({ title: 'T' })), meta);
        expect('teacherGuide' in doc).toBe(false);
    });

    it('non-prose blocks never reach the field, whatever the editor held', () => {
        const guide = tiptapToTeacherGuide({
            type: 'doc',
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'keep' }] },
                { type: 'callout', attrs: { variant: 'info' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'drop' }] }] },
            ],
        });
        expect(guide?.blocks.map((b) => b.type)).toEqual(['paragraph']);
    });
});
