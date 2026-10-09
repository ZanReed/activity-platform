// =============================================================================
// figureSource.test.ts — parse(format(block)) equals block (ER-10)
// =============================================================================

import { describe, expect, it } from 'vitest';
import { formatFigureSource, parseFigureSource, type FigureSourceAttrs } from '../lib/figureSource';

const AXIS = { xMin: -2, xMax: 10, yMin: -3, yMax: 7, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true };

// Every line form the grammar has, in one figure.
const EVERY: FigureSourceAttrs = {
    axis: AXIS,
    alt: 'Triangle ABC with everything on it',
    plane: false,
    toScale: true,
    drawables: [
        { kind: 'point', at: [0, 0], label: 'A' },
        { kind: 'point', at: [8, 0], label: 'B' },
        { kind: 'point', at: [2, 5], label: 'C' },
        { kind: 'point', at: [8, 5], label: "D'" },
        { kind: 'point', at: [5, 6], style: 'open' },
        { kind: 'polygon', vertices: [[0, 0], [8, 0], [2, 5]], filled: false },
        { kind: 'polygon', vertices: [[8, 0], [8, 5], [2, 5]], filled: true },
        { kind: 'segment', from: [2, 5], to: [2, 0], style: 'dashed' },
        { kind: 'segment', from: [0, 0], to: [1, 1] },
        { kind: 'segment', from: [0, 0], to: [8, 5], arrow: true },
        { kind: 'segment', from: [8, 0], to: [8, 5], style: 'dashed', arrow: true },
        { kind: 'side_label', from: [0, 0], to: [8, 0], text: '8 cm' },
        { kind: 'angle_mark', at: [0, 0], from: [8, 0], to: [2, 5], label: '68°' },
        { kind: 'angle_mark', at: [8, 0], from: [0, 0], to: [2, 5], label: 'x' },
        { kind: 'angle_mark', at: [2, 5], from: [0, 0], to: [8, 0], style: 'right' },
        { kind: 'angle_mark', at: [2, 5], from: [8, 0], to: [0, 0] },
        { kind: 'angle_mark', at: [0, 0], from: [8, 0], to: [2, 5], reflex: true },
        { kind: 'tick_mark', from: [8, 0], to: [2, 5], count: 2 },
        { kind: 'parallel_mark', from: [0, 0], to: [8, 0], count: 1 },
        { kind: 'parallel_mark', from: [2, 5], to: [8, 5], count: 1 },
        { kind: 'text', at: [4, -1.5], text: 'base' },
        { kind: 'cuboid', length: 4, width: 2, height: 3, unit: 'cm', units: true },
    ],
};

const roundTrip = (a: FigureSourceAttrs) => {
    const { text, lossy } = formatFigureSource(a);
    const parsed = parseFigureSource(text);
    return { text, lossy, parsed };
};

describe('format → parse is the identity (ER-10)', () => {
    it('writes NAMES where labelled points sit, not coordinates (a coordinate round-trips too, so the identity alone cannot see this)', () => {
        const { text } = formatFigureSource(EVERY);
        expect(text).toContain('polygon A B C');
        expect(text).toContain('angle B A C 68°');
        expect(text).toContain("parallel A B C D'");
        expect(text).not.toContain('polygon (0, 0)');
    });

    it('over every line form at once', () => {
        const { lossy, parsed } = roundTrip(EVERY);
        expect(lossy).toEqual([]);
        expect(parsed.problems).toEqual([]);
        expect(parsed.attrs?.drawables).toEqual(EVERY.drawables);
        expect(parsed.attrs).toMatchObject({ alt: EVERY.alt, plane: false, toScale: true, axis: AXIS });
    });

    it('a plane-on figure keeps its plane, and a coordinate nobody names stays a coordinate', () => {
        const a: FigureSourceAttrs = {
            axis: AXIS,
            plane: true,
            drawables: [
                { kind: 'segment', from: [1.5, 2], to: [3, -1] },
                { kind: 'text', at: [0.25, 0.75], text: 'here' },
            ],
        };
        const { text, parsed } = roundTrip(a);
        expect(text).toContain('plane: on');
        expect(text).toContain('(1.5, 2)');
        expect(parsed.attrs?.plane).toBe(true);
        expect(parsed.attrs?.drawables).toEqual(a.drawables);
    });

    it('hidden: off round-trips when every cuboid hides its edges', () => {
        const a: FigureSourceAttrs = { axis: AXIS, drawables: [{ kind: 'cuboid', length: 3, width: 3, height: 3, hidden: false }] };
        expect(roundTrip(a).parsed.attrs?.drawables).toEqual(a.drawables);
    });

    it('a curve and a ray go through the editor parser and come back', () => {
        const a: FigureSourceAttrs = {
            axis: AXIS,
            plane: true,
            alt: 'A line and a ray',
            drawables: [
                { kind: 'curve', model: { family: 'linear', slope: 2, intercept: 1, slopeTolerance: 0.1, interceptTolerance: 0.1 } },
                { kind: 'ray', from: [0, 0], through: [2, 1] },
            ],
        };
        const { parsed } = roundTrip(a);
        expect(parsed.problems).toEqual([]);
        expect(parsed.attrs?.drawables.map((d) => d.kind)).toEqual(['curve', 'ray']);
        expect(parsed.attrs?.drawables[0]).toMatchObject({ model: { family: 'linear', slope: 2, intercept: 1 } });
    });
});

describe('features the grammar cannot spell are REPORTED, never silently dropped', () => {
    it.each<[string, FigureSourceAttrs['drawables'][number], RegExp]>([
        ['a double arc', { kind: 'angle_mark', at: [0, 0], from: [1, 0], to: [0, 1], style: 'double' }, /double/],
        ['a lone parallel mark', { kind: 'parallel_mark', from: [0, 0], to: [1, 0], count: 1 }, /single side/],
        ['segment endpoint dots', { kind: 'segment', from: [0, 0], to: [1, 0], endpoints: ['open', 'closed'] }, /endpoint/],
        ['a cuboid off the origin', { kind: 'cuboid', at: [1, 1], length: 1, width: 1, height: 1 }, /origin/],
        ['an authored colour', { kind: 'segment', from: [0, 0], to: [1, 0], color: 'red' }, /colour/],
    ])('%s', (_n, d, why) => {
        const { lossy } = formatFigureSource({ axis: AXIS, drawables: [d] });
        expect(lossy.join(' ')).toMatch(why);
    });

    it('a non-default grid step is reported too', () => {
        expect(formatFigureSource({ axis: { ...AXIS, xGridStep: 2 }, drawables: [] }).lossy.join(' ')).toMatch(/grid step/);
    });
});
