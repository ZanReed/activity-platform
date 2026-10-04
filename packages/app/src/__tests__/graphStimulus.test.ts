// Graded stimuli in the importer and the serializer (2026-10-04): `show:` lines
// beside `answer:` in a ```graph fence become the block's `stimulus`, read by
// the figure grammar when they need it (ER-11), and survive the round trip.
import { beforeAll, describe, expect, it } from 'vitest';
import { InteractiveGraphBlock } from '@activity/schema';
import { getMarkdownImporter } from '../lib/markdownToTiptap';
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';
import { wrapBlocksStrict } from '../lib/batchImportPipeline';

let importMd: Awaited<ReturnType<typeof getMarkdownImporter>>;
beforeAll(async () => {
    importMd = await getMarkdownImporter();
});

const graph = (...lines: string[]) => importMd(['```graph', ...lines, '```'].join('\n'));
const attrsOf = (r: ReturnType<typeof graph>) => r.blocks[0]!.attrs as Record<string, unknown>;
const kinds = (r: ReturnType<typeof graph>) => (attrsOf(r).stimulus as { kind: string }[]).map((d) => d.kind);

const REFLECTION = [
    'axes: -6..6, -6..6',
    'alt: Triangle ABC and a vertical mirror line',
    'show: point (1,1) "A"',
    'show: point (4,1) "B"',
    'show: point (2,4) "C"',
    'show: polygon A B C',
    'show: line x = 0 dashed',
    'answer: (-1,1), (-4,1), (-2,4)',
];

describe('show: beside answer: becomes the stimulus', () => {
    it('the confirmed reflection fence imports with no warnings', () => {
        const r = graph(...REFLECTION);
        expect(r.warnings).toEqual([]);
        expect(r.figureProblems).toBeUndefined();
        expect(r.blocks[0]!.type).toBe('interactiveGraph');
        expect(kinds(r)).toEqual(['point', 'point', 'point', 'polygon', 'curve']);
        const a = attrsOf(r);
        expect((a.interaction as { type: string }).type).toBe('plot_point');
        expect(a.stimulusAlt).toBe('Triangle ABC and a vertical mirror line');
    });

    it('names resolve across the show: lines, in any order', () => {
        const r = graph('show: polygon A B C', 'show: point (1,1) "A"', 'show: point (4,1) "B"', 'show: point (2,4) "C"', 'answer: (0,0)');
        const polygon = (attrsOf(r).stimulus as { kind: string; vertices?: number[][] }[])[0]!;
        expect(polygon.vertices).toEqual([[1, 1], [4, 1], [2, 4]]);
        expect(r.warnings).toEqual([]);
    });

    it('a mirror line is an infinite dashed line: vertical, horizontal and diagonal', () => {
        for (const line of ['x = 2', 'y = -1', 'y = x', 'y = -x']) {
            const r = graph(`show: line ${line} dashed`, 'answer: (0,0)');
            expect(r.warnings, line).toEqual([]);
            const d = (attrsOf(r).stimulus as { kind: string; style?: string }[])[0]!;
            expect(d.kind, line).toBe('curve');
            expect(d.style, line).toBe('dashed');
        }
    });

    it('marks import beside an answer (the figure grammar)', () => {
        const r = graph(
            'show: point (0,0) "A"', 'show: point (4,0) "B"', 'show: point (0,3) "C"',
            'show: polygon A B C', 'show: angle BAC right', 'show: side AB "4"', 'show: ticks AC 1',
            'answer: (1,1)',
        );
        expect(r.warnings).toEqual([]);
        expect(kinds(r)).toEqual(['point', 'point', 'point', 'polygon', 'angle_mark', 'side_label', 'tick_mark']);
    });

    it('works beside a line answer, not only points', () => {
        const r = graph('show: point (0,1)', 'show: point (2,5)', 'answer: y = 2x + 1');
        expect((attrsOf(r).interaction as { type: string }).type).toBe('plot_function');
        expect(kinds(r)).toEqual(['point', 'point']);
    });
});

describe('failure rules', () => {
    it('a show: line that cannot be read is skipped, reported, and rides the batch-skip channel', () => {
        const r = graph('show: point (1,1) "A"', 'show: ticks AX 1', 'answer: (3,1)');
        expect(r.blocks[0]!.type).toBe('interactiveGraph'); // the question survives
        expect(kinds(r)).toEqual(['point']);
        expect(r.figureProblems).toHaveLength(1);
        expect(r.figureProblems![0]).toMatch(/^Graph block show: "ticks AX 1"/);
        expect(r.warnings).toEqual(r.figureProblems);
    });

    it('an expression or a cuboid cannot be shown beside an answer', () => {
        const e = graph('show: expression x^2', 'answer: (3,1)');
        expect(attrsOf(e).stimulus).toEqual([]);
        expect(e.figureProblems![0]).toMatch(/shown expression can’t sit beside an answer/);
        const c = graph('show: point (0,0) "A"', 'show: cuboid 2 2 2', 'show: polygon A A A', 'answer: (3,1)');
        expect(c.figureProblems!.some((p) => /shown cuboid/.test(p))).toBe(true);
    });

    it('alt: on a graph with no answer is ignored with a warning', () => {
        const r = graph('alt: a line', 'show: line y = x');
        expect(attrsOf(r).stimulusAlt).toBeUndefined();
        expect(r.warnings[0]).toMatch(/this graph has no answer/);
    });
});

describe('nothing that imported before has changed', () => {
    it('a display graph keeps its drawables on the interaction, with an empty stimulus', () => {
        const r = graph('show: line y = 2x + 1', 'show: point (2, 3) closed "P"');
        const a = attrsOf(r);
        expect((a.interaction as { type: string; drawables: unknown[] }).type).toBe('display');
        expect((a.interaction as { drawables: unknown[] }).drawables).toHaveLength(2);
        expect(a.stimulus).toEqual([]);
        expect(r.warnings).toEqual([]);
    });

    it('a graded graph with no show: lines has an empty stimulus', () => {
        expect(attrsOf(graph('answer: (2, 3)')).stimulus).toEqual([]);
    });
});

describe('the stimulus survives import → document → editor → document', () => {
    it('both fields round-trip and the block is schema-valid', () => {
        const meta = { title: 'T' } as Parameters<typeof tiptapToActivity>[1];
        const find = (doc: ReturnType<typeof tiptapToActivity>) =>
            doc.sections
                .flatMap((s) => s.rows.flatMap((row) => row.columns.flatMap((c) => c.blocks)))
                .find((b) => b.type === 'interactive_graph') as InteractiveGraphBlock;
        const first = find(tiptapToActivity(wrapBlocksStrict(graph(...REFLECTION).blocks), meta));
        expect(InteractiveGraphBlock.safeParse(first).success).toBe(true);
        expect(first.stimulus.map((d) => d.kind)).toEqual(['point', 'point', 'point', 'polygon', 'curve']);
        expect(first.stimulusAlt).toBe('Triangle ABC and a vertical mirror line');

        const again = find(
            tiptapToActivity(
                activityToTiptap({ ...tiptapToActivity(wrapBlocksStrict(graph(...REFLECTION).blocks), meta) }),
                meta,
            ),
        );
        expect(again.stimulus).toEqual(first.stimulus);
        expect(again.stimulusAlt).toBe(first.stimulusAlt);
    });
});
