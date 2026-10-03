// =============================================================================
// figureFence.test.ts — the ```figure grammar (y7-figures-and-charts.md Q3,
// N2, ER-3, ER-11, ER-12b, ER-13; curriculum B-36's three answers)
// =============================================================================

import { beforeAll, describe, expect, it } from 'vitest';
import { parseFigureFence } from '../lib/figureFence';
import { getMarkdownImporter } from '../lib/markdownToTiptap';

const fig = (...lines: string[]) => parseFigureFence(lines.join('\n'));
const POINTS = ['point (0,0) "A"', 'point (8,0) "B"', 'point (2,5) "C"'];
const ALT = 'alt: Triangle ABC';
const kinds = (r: ReturnType<typeof parseFigureFence>) => r.attrs?.drawables.map((d) => d.kind);

describe('every Q3 line form', () => {
    it('reads the design doc example whole, with no problems', () => {
        const r = fig(
            'alt: Triangle ABC with AB = 8 cm, AC = 6 cm and angle A = 68°',
            ...POINTS,
            'point (8,5) "D"',
            'polygon A B C',
            'side AB "8 cm"',
            'side AC "6 cm"',
            'angle BAC 68°',
            'angle ABC "x"',
            'angle ACB right',
            'ticks BC 2',
            'parallel AB DC',
            'segment A C dashed',
            'text (4,-1.5) "base"',
        );
        expect(r.problems).toEqual([]);
        expect(r.attrs?.plane).toBe(false);
        expect(r.attrs?.toScale).toBe(false);
        expect(kinds(r)).toEqual([
            'point', 'point', 'point', 'point', 'polygon', 'side_label', 'side_label',
            'angle_mark', 'angle_mark', 'angle_mark', 'tick_mark', 'parallel_mark', 'parallel_mark',
            'segment', 'text',
        ]);
    });

    it('polygon is an OUTLINE; region keeps the filled meaning', () => {
        const r = fig(ALT, ...POINTS, 'polygon A B C', 'region A B C');
        expect(r.attrs?.drawables[3]).toMatchObject({ kind: 'polygon', filled: false });
        expect(r.attrs?.drawables[4]).toMatchObject({ kind: 'polygon', filled: true });
    });

    it('angle BAC is the angle AT A, from AB to AC; degree, quoted, right and reflex', () => {
        const r = fig(ALT, ...POINTS, 'angle BAC 68°', 'angle ABC "x"', 'angle ACB right', 'angle BAC reflex');
        const [deg, txt, right, reflex] = r.attrs!.drawables.slice(3);
        expect(deg).toEqual({ kind: 'angle_mark', at: [0, 0], from: [8, 0], to: [2, 5], label: '68°' });
        expect(txt).toMatchObject({ at: [8, 0], label: 'x' });
        expect(right).toMatchObject({ at: [2, 5], style: 'right' });
        expect(right).not.toHaveProperty('label');
        expect(reflex).toMatchObject({ reflex: true });
    });

    it('names CONCATENATE or SPACE, and coordinates stand in for names anywhere', () => {
        const r = fig(ALT, ...POINTS, 'side A B "8"', 'side (0,0) (8,0) "8"', 'ticks B C', 'segment A (8,5)');
        expect(r.problems).toEqual([]);
        expect(r.attrs?.drawables[3]).toMatchObject({ from: [0, 0], to: [8, 0] });
        expect(r.attrs?.drawables[4]).toMatchObject({ from: [0, 0], to: [8, 0] });
        expect(r.attrs?.drawables[5]).toMatchObject({ kind: 'tick_mark', count: 1 });
        expect(r.attrs?.drawables[6]).toMatchObject({ to: [8, 5] });
    });

    it('multi-character names resolve longest first', () => {
        const r = fig(ALT, 'point (0,0) "A"', "point (1,0) \"A'\"", 'point (0,1) "B"', "segment A'B");
        expect(r.problems).toEqual([]);
        expect(r.attrs?.drawables[3]).toMatchObject({ from: [1, 0], to: [0, 1] });
    });

    it('names resolve in a SECOND pass — marks may come before their points', () => {
        const r = fig(ALT, 'polygon A B C', 'angle BAC 68°', ...POINTS);
        expect(r.problems).toEqual([]);
        expect(kinds(r)).toEqual(['polygon', 'angle_mark', 'point', 'point', 'point']);
    });

    it('blank lines never split the figure (the reference-fence rule must not leak)', () => {
        const r = parseFigureFence([ALT, POINTS[0], '', POINTS[1], '', '', POINTS[2], 'polygon A B C'].join('\n'));
        expect(kinds(r)).toHaveLength(4);
    });

    it('`line`, `curve` and `ray` go to the shared show-spec parser', () => {
        const fallback = (line: string) => ({ ok: true as const, drawable: { kind: 'curve', from: line } });
        const r = parseFigureFence([ALT, 'line y = 2x'].join('\n'), fallback);
        expect(r.attrs?.drawables).toEqual([{ kind: 'curve', from: 'line y = 2x' }]);
    });
});

describe("curriculum B-36's three answers", () => {
    it('side GH "7 cm" is a side label', () => {
        const r = fig(ALT, 'point (0,0) "G"', 'point (7,0) "H"', 'side GH "7 cm"');
        expect(r.attrs?.drawables[2]).toEqual({ kind: 'side_label', from: [0, 0], to: [7, 0], text: '7 cm' });
    });

    it('a bare `angle ABC` draws the arc alone — no label, no problem', () => {
        const r = fig(ALT, ...POINTS, 'angle ABC');
        expect(r.problems).toEqual([]);
        expect(r.attrs?.drawables[3]).toEqual({ kind: 'angle_mark', at: [8, 0], from: [0, 0], to: [2, 5] });
    });

    it('`angle ABC ""` is refused, so a batch run skips the file', () => {
        const r = fig(ALT, ...POINTS, 'angle ABC ""');
        expect(r.problems).toHaveLength(1);
        expect(r.problems[0]).toContain('angle ABC ""');
        expect(kinds(r)).not.toContain('angle_mark');
    });

    it('`to scale` drops only the caption: the figure stays plane-less (one scale)', () => {
        const r = fig(ALT, ...POINTS, 'segment B A', 'segment B C', 'angle ABC', 'to scale');
        expect(r.attrs).toMatchObject({ plane: false, toScale: true });
    });
});

describe('window, plane and alt', () => {
    it('no axes: line → auto-fit covering every coordinate (ER-3)', () => {
        const r = fig(ALT, ...POINTS, 'text (4,-1.5) "base"');
        const a = r.attrs!.axis;
        expect(a.xMin).toBeLessThan(0);
        expect(a.xMax).toBeGreaterThan(8);
        expect(a.yMin).toBeLessThan(-1.5);
        expect(a.yMax).toBeGreaterThan(5);
        // TIGHT, not merely covering: the ±10 default also covers the shape,
        // so without these bounds a dropped fit stayed green (found by
        // mutation, 2026-10-03). Fit = 12 % + the 24-unit label margin.
        expect(a.xMin).toBeCloseTo(-1.637, 2);
        expect(a.xMax).toBeCloseTo(9.637, 2);
        expect(a.yMax).toBeLessThan(7);
    });

    it('an explicit axes: line wins; an empty window is skipped with a problem', () => {
        expect(fig(ALT, ...POINTS, 'axes: -1..9, -1..6').attrs!.axis).toMatchObject({ xMin: -1, xMax: 9, yMin: -1, yMax: 6 });
        const bad = fig(ALT, ...POINTS, 'axes: 5..5, -1..6');
        expect(bad.problems[0]).toMatch(/axes window is empty/);
        expect(bad.attrs!.axis.xMin).toBeLessThan(0); // fell back to the fit
    });

    it('plane: on opts back into the grid', () => {
        expect(fig(ALT, ...POINTS, 'plane: on').attrs!.plane).toBe(true);
    });

    it('a figure with no alt: still renders but reports a problem (D11, ER-13)', () => {
        const r = fig(...POINTS, 'polygon A B C');
        expect(r.attrs).not.toBeNull();
        expect(r.problems).toEqual([expect.stringMatching(/alt:/)]);
    });
});

describe('bad lines are skipped, degenerate geometry refused — each naming its line (N2)', () => {
    it.each([
        ['unknown name', 'ticks AX 1', /not a named point/],
        ['unquoted angle label', 'angle ABC x', /must be quoted/],
        ['two labels', 'angle ABC 40° "x"', /ONE label/],
        ['right + reflex', 'angle ABC right reflex', /cannot be reflex/],
        ['tick count 4', 'ticks AB 4', /1, 2 or 3/],
        ['parallel count 3', 'parallel AB BC 3', /1 or 2/],
        ['side without label', 'side AB', /quoted label/],
        ['expression', 'expression sin(x)', /calculator/],
        ['unknown kind', 'circle A 3', /not a figure line/],
        ['duplicate name', 'point (1,1) "A"', /already used/],
        ['zero-area polygon', 'polygon (0,0) (1,1) (2,2)', /straight line/],
        ['coincident angle points', 'angle AAB', /coincide/],
        ['180° angle', 'angle (0,0) (1,0) (2,0)', /180°/],
        ['zero-length segment', 'segment A A', /same point/],
    ])('%s', (_name, line, why) => {
        const r = fig(ALT, ...POINTS, line);
        expect(r.problems).toHaveLength(1);
        expect(r.problems[0]).toContain(`"${line}"`);
        expect(r.problems[0]).toMatch(why);
        expect(r.attrs?.drawables).toHaveLength(3); // the figure survives
    });
});

describe('importer integration', () => {
    let importMd: Awaited<ReturnType<typeof getMarkdownImporter>>;
    beforeAll(async () => {
        importMd = await getMarkdownImporter();
    });

    it('a figure fence becomes ONE body graphFigure node and reports nothing', () => {
        const res = importMd(['```figure', ALT, ...POINTS, 'polygon A B C', '```'].join('\n'));
        const nodes = res.blocks.filter((b) => b.type === 'graphFigure');
        expect(nodes).toHaveLength(1);
        expect(nodes[0]!.attrs).toMatchObject({ plane: false, alt: 'Triangle ABC' });
        expect(res.figureProblems).toBeUndefined();
        expect(res.warnings).toEqual([]);
    });

    it('problems reach BOTH channels: warnings (paste dialog) and figureProblems (batch)', () => {
        const res = importMd(['```figure', ...POINTS, 'ticks AX 1', '```'].join('\n'));
        expect(res.figureProblems).toHaveLength(2); // the bad line + the missing alt
        for (const p of res.figureProblems!) expect(res.warnings).toContain(p);
        // The paste path still imports the figure.
        expect(res.blocks.some((b) => b.type === 'graphFigure')).toBe(true);
    });

    it('a fence with nothing drawable produces NO block and never the raw fence as text (ER-12b)', () => {
        const res = importMd(['```figure', ALT, 'circle A 3', '```'].join('\n'));
        expect(res.blocks.some((b) => b.type === 'graphFigure')).toBe(false);
        expect(JSON.stringify(res.blocks)).not.toContain('circle A 3');
        expect(res.figureProblems?.some((p) => /not imported/.test(p))).toBe(true);
    });
});
