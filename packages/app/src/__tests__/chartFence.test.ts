// The ```chart fence (Y7 charts, T12): grammar, failure states (N2), the
// source round-trip the editor popover relies on, and the importer + serializer
// path a chart takes into a document.
import { beforeAll, describe, expect, it } from 'vitest';
import { ChartBlock } from '@activity/schema';
import { formatChartSource, parseChartFence } from '../lib/chartFence';
import { getMarkdownImporter } from '../lib/markdownToTiptap';
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';
import { wrapBlocksStrict } from '../lib/batchImportPipeline';

const FULL = [
    'type: clustered',
    'title: How we get to school',
    'xlabel: Day',
    'ylabel: Number of students',
    'alt: Walking beats the bus every day',
    'categories: Mon, Tue, Wed',
    'series: Walk = 12, 7, 15',
    'series: Bus = 4, 6, 3',
    'y: 0..20 step 5',
].join('\n');

describe('parseChartFence — the grammar (Q7)', () => {
    it('reads every line form', () => {
        const { attrs, problems } = parseChartFence(FULL);
        expect(problems).toEqual([]);
        expect(attrs).toEqual({
            chart: 'clustered',
            title: 'How we get to school',
            xLabel: 'Day',
            yLabel: 'Number of students',
            alt: 'Walking beats the bus every day',
            categories: ['Mon', 'Tue', 'Wed'],
            series: [
                { name: 'Walk', values: [12, 7, 15] },
                { name: 'Bus', values: [4, 6, 3] },
            ],
            yMax: 20,
            yStep: 5,
        });
    });

    it('type defaults to bar; a bar with several series is stored as clustered', () => {
        expect(parseChartFence('title: t\ncategories: a, b\nseries: 1, 2').attrs?.chart).toBe('bar');
        const two = parseChartFence('type: bar\ntitle: t\ncategories: a, b\nseries: X = 1, 2\nseries: Y = 3, 4');
        expect(two.attrs?.chart).toBe('clustered');
        expect(two.problems).toEqual([]);
    });

    it('lines may come in any order: a series above categories is still measured against it', () => {
        const { attrs, problems } = parseChartFence('series: 1, 2, 3\ntitle: t\ncategories: a, b, c');
        expect(problems).toEqual([]);
        expect(attrs?.series).toEqual([{ values: [1, 2, 3] }]);
    });

    it('accepts decimals and a y: with no step', () => {
        const { attrs } = parseChartFence('title: t\ncategories: a, b\nseries: 1.5, 2.25\ny: 0..4');
        expect(attrs?.series[0]?.values).toEqual([1.5, 2.25]);
        expect(attrs?.yMax).toBe(4);
        expect(attrs?.yStep).toBeUndefined();
    });
});

describe('parseChartFence — failure states, each naming its line (N2)', () => {
    const base = 'title: t\ncategories: a, b, c\n';
    const problemsOf = (src: string) => parseChartFence(src).problems;

    it('a series of the wrong length is skipped and the chart survives', () => {
        const { attrs, problems } = parseChartFence(base + 'series: X = 1, 2, 3\nseries: Y = 1, 2');
        expect(attrs?.series).toHaveLength(1);
        expect(problems).toEqual(['Chart: "series: Y = 1, 2" — it has 2 values for 3 categories; the line was skipped.']);
    });

    it('a non-number, a negative value and an unknown key are each reported', () => {
        expect(problemsOf(base + 'series: 1, two, 3\nseries: 1, 2, 3')[0]).toMatch(/every value must be a number/);
        expect(problemsOf(base + 'series: 1, -2, 3\nseries: 1, 2, 3')[0]).toMatch(/below 0.*refused/);
        expect(problemsOf(base + 'colour: red\nseries: 1, 2, 3')[0]).toMatch(/"colour" is not a chart line/);
        expect(problemsOf(base + 'type: pie\nseries: 1, 2, 3')[0]).toMatch(/type must be one of/);
    });

    it('more than 12 categories or 4 series is refused', () => {
        const many = Array.from({ length: 13 }, (_, i) => `c${i}`).join(', ');
        const r = parseChartFence(`title: t\ncategories: ${many}\nseries: 1`);
        expect(r.attrs).toBeNull();
        expect(r.problems[0]).toMatch(/at most 12 categories \(this has 13\)/);

        const five = parseChartFence(
            base + ['A', 'B', 'C', 'D', 'E'].map((n) => `series: ${n} = 1, 2, 3`).join('\n'),
        );
        expect(five.attrs?.series).toHaveLength(4);
        expect(five.problems[0]).toMatch(/"series: E = 1, 2, 3" — a chart takes at most 4 series/);
    });

    it('y: must start at 0 and reach the data', () => {
        expect(problemsOf(base + 'series: 1, 2, 3\ny: 5..20')[0]).toMatch(/always starts at 0/);
        expect(problemsOf(base + 'series: 1, 2, 30\ny: 0..20')[0]).toMatch(/the data reaches 30, above the axis top of 20/);
        // A stacked chart is measured by its totals.
        expect(
            problemsOf('type: stacked\n' + base + 'series: A = 10, 10, 10\nseries: B = 10, 10, 15\ny: 0..20')[0],
        ).toMatch(/the data reaches 25/);
        expect(parseChartFence(base + 'series: 1, 2, 30\ny: 0..20').attrs?.yMax).toBeUndefined();
    });

    it('a missing title, an unnamed series beside named ones and a long label are reported', () => {
        expect(problemsOf('categories: a, b\nseries: 1, 2')).toEqual([
            'Chart: it needs a title: line saying what the chart shows.',
        ]);
        expect(problemsOf(base + 'series: X = 1, 2, 3\nseries: 4, 5, 6')[0]).toMatch(/name each one/);
        expect(
            problemsOf('title: t\ncategories: a, An extremely long category name\nseries: 1, 2')[0],
        ).toMatch(/longer than 20 characters/);
    });

    it('no categories or no usable series: no block, and it says why', () => {
        const none = parseChartFence('title: t\nseries: 1, 2');
        expect(none.attrs).toBeNull();
        expect(none.problems.at(-1)).toBe('Chart: it has no categories: line, so it was not imported.');
        const empty = parseChartFence('title: t\ncategories: a, b\nseries: 1');
        expect(empty.attrs).toBeNull();
        expect(empty.problems.at(-1)).toBe('Chart: it has no usable series: line, so it was not imported.');
    });
});

describe('formatChartSource — the popover text is generated, and round-trips', () => {
    it('parse(format(attrs)) equals attrs, over every line form', () => {
        const attrs = parseChartFence(FULL).attrs!;
        const { text, lossy } = formatChartSource(attrs);
        expect(lossy).toEqual([]);
        expect(parseChartFence(text)).toEqual({ attrs, problems: [] });
    });

    it('round-trips each chart kind and an unnamed single series', () => {
        for (const type of ['bar', 'stacked', 'line'] as const) {
            const src =
                type === 'bar'
                    ? 'type: bar\ntitle: t\ncategories: a, b\nseries: 1, 2'
                    : `type: ${type}\ntitle: t\ncategories: a, b\nseries: X = 1, 2\nseries: Y = 3, 4`;
            const attrs = parseChartFence(src).attrs!;
            expect(parseChartFence(formatChartSource(attrs).text).attrs).toEqual(attrs);
        }
    });

    it('names what the grammar cannot spell', () => {
        const { lossy } = formatChartSource({
            chart: 'bar',
            categories: ['a, b', 'c'],
            series: [{ name: 'x = y', values: [1, 2] }],
            yStep: 5,
        });
        expect(lossy).toEqual([
            'a category name containing a comma',
            'a series name containing "="',
            'an axis step with no axis top',
        ]);
    });
});

describe('the importer and the serializer carry a chart into a document', () => {
    const md = ['Read the chart.', '', '```chart', FULL, '```', ''].join('\n');
    const META = { title: 'T' } as Parameters<typeof tiptapToActivity>[1];
    let importMd: Awaited<ReturnType<typeof getMarkdownImporter>>;
    beforeAll(async () => {
        importMd = await getMarkdownImporter();
    });
    const markdownToTiptap = (src: string) => {
        const result = importMd(src);
        // The batch pipeline's own wrap: the serializer reads a strict row grid.
        return { ...result, doc: wrapBlocksStrict(result.blocks) };
    };

    it('a ```chart fence imports to a chart node with no warnings', () => {
        const result = markdownToTiptap(md);
        expect(result.warnings).toEqual([]);
        expect(result.figureProblems).toBeUndefined();
        const nodes = JSON.stringify(result.doc);
        expect(nodes).toContain('"type":"chart"');
    });

    it('every field survives import → document → editor → document', () => {
        const first = tiptapToActivity(markdownToTiptap(md).doc, META);
        const chart = first.sections
            .flatMap((s) => s.rows.flatMap((r) => r.columns.flatMap((c) => c.blocks)))
            .find((b) => b.type === 'chart');
        expect(ChartBlock.safeParse(chart).success).toBe(true);
        const fields: Partial<ChartBlock> = { ...(chart as ChartBlock) };
        delete fields.id;
        expect(fields).toEqual({
            type: 'chart',
            chart: 'clustered',
            title: 'How we get to school',
            xLabel: 'Day',
            yLabel: 'Number of students',
            alt: 'Walking beats the bus every day',
            categories: ['Mon', 'Tue', 'Wed'],
            series: [
                { name: 'Walk', values: [12, 7, 15] },
                { name: 'Bus', values: [4, 6, 3] },
            ],
            yMax: 20,
            yStep: 5,
        });

        const again = tiptapToActivity(activityToTiptap(first), META);
        const chart2 = again.sections
            .flatMap((s) => s.rows.flatMap((r) => r.columns.flatMap((c) => c.blocks)))
            .find((b) => b.type === 'chart') as ChartBlock;
        const fields2: Partial<ChartBlock> = { ...chart2 };
        delete fields2.id;
        expect(fields2).toEqual(fields);
    });

    it('a chart problem warns AND rides the typed channel the batch importer skips on', () => {
        const bad = ['```chart', 'title: t', 'categories: a, b, c', 'series: 1, 2, 3', 'series: 1, 2', '```'].join('\n');
        const result = markdownToTiptap(bad);
        expect(result.figureProblems).toEqual([
            'Chart: "series: 1, 2" — it has 2 values for 3 categories; the line was skipped.',
        ]);
        expect(result.warnings).toEqual(expect.arrayContaining(result.figureProblems!));
    });

    it('a chart with nothing drawable adds no block and never the raw fence as text', () => {
        const result = markdownToTiptap(['Before.', '', '```chart', 'title: t', '```', '', 'After.'].join('\n'));
        const json = JSON.stringify(result.doc);
        expect(json).not.toContain('"type":"chart"');
        expect(json).not.toContain('title: t');
        expect(result.figureProblems).toEqual(['Chart: it has no categories: line, so it was not imported.']);
    });
});
