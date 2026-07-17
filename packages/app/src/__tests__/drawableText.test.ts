import { describe, expect, it } from 'vitest';
import { formatDrawable, updateDrawableFromText } from '../editor/components/drawableText';
import { ALL_DRAWABLE_KINDS } from '../editor/components/DrawableListEditor';
import type { DrawableAttr } from '../editor/extensions/InteractiveGraph';

// ============================================================================
// drawableText — the round-trip spine of the uniform expression list.
// Guards: every kind formats to editable text; an edit re-parses while
// preserving affordance extras (label/open/dashed/arrows) and ALWAYS color; a
// curve's domain survives (OV#1); the kinds gate + one-shape-per-row rule + the
// no-op identity guard all hold.
// ============================================================================

const KINDS = ALL_DRAWABLE_KINDS;

const linear = (slope: number, intercept: number) => ({
    family: 'linear' as const,
    slope,
    intercept,
    slopeTolerance: 0.1,
    interceptTolerance: 0.1,
});

describe('formatDrawable', () => {
    it('point → coordinate text', () => {
        expect(formatDrawable({ kind: 'point', at: [2, 3] })).toBe('(2, 3)');
    });
    it('curve (equation) → y = …', () => {
        expect(formatDrawable({ kind: 'curve', model: linear(2, 0) })).toBe('y = 2x');
    });
    it('curve (inequality) → shaded/strict text', () => {
        const d: DrawableAttr = { kind: 'curve', model: linear(2, 1), shade: 'above', style: 'dashed' };
        expect(formatDrawable(d)).toContain('>');
    });
    it('curve WITH domain emits the `for …` clause (OV#1 — else the edit wipes it)', () => {
        const d: DrawableAttr = { kind: 'curve', model: linear(2, 0), domain: { min: 0, minStyle: 'closed' } };
        expect(formatDrawable(d)).toMatch(/for/);
    });
    it('expression → raw', () => {
        expect(formatDrawable({ kind: 'expression', expression: 'sin(x)' })).toBe('sin(x)');
    });
    it('ray / segment → command text', () => {
        expect(formatDrawable({ kind: 'ray', from: [0, 0], through: [2, 1] })).toMatch(/^ray /);
        expect(formatDrawable({ kind: 'segment', from: [1, 1], to: [4, 3] })).toMatch(/^segment /);
    });
    it('polygon → read-only summary', () => {
        expect(
            formatDrawable({ kind: 'polygon', vertices: [[0, 0], [3, 0], [1, 3]], filled: true }),
        ).toBe('polygon (0, 0) (3, 0) (1, 3)');
    });
});

describe('updateDrawableFromText — no-op identity guard', () => {
    it('unchanged text returns the same drawable (no autosave churn)', () => {
        const d: DrawableAttr = { kind: 'point', at: [2, 3], style: 'open' };
        const res = updateDrawableFromText(d, formatDrawable(d), KINDS);
        expect(res).toEqual({ ok: true, drawable: d });
    });
    it('polygon is never text-editable (no-op)', () => {
        const d: DrawableAttr = { kind: 'polygon', vertices: [[0, 0], [3, 0], [1, 3]], filled: true };
        expect(updateDrawableFromText(d, 'anything', KINDS)).toEqual({ ok: true, drawable: d });
    });
});

describe('updateDrawableFromText — merge-preserve', () => {
    it('editing a point’s coords keeps its label + open style', () => {
        const d: DrawableAttr = { kind: 'point', at: [2, 3], label: 'A', style: 'open' };
        const res = updateDrawableFromText(d, '(5, 7)', KINDS);
        expect(res).toEqual({
            ok: true,
            drawable: { kind: 'point', at: [5, 7], label: 'A', style: 'open' },
        });
    });
    it('editing a curve’s equation keeps arrows off', () => {
        const d: DrawableAttr = { kind: 'curve', model: linear(2, 0), arrows: false };
        const res = updateDrawableFromText(d, 'y = 3x', KINDS);
        expect(res.ok && res.drawable.kind === 'curve' && res.drawable.arrows).toBe(false);
    });
    it('editing a curve keeps its domain when the clause stays in the text (OV#1)', () => {
        const d: DrawableAttr = { kind: 'curve', model: linear(2, 0), domain: { min: 0, minStyle: 'closed' } };
        const edited = formatDrawable(d).replace('2x', '3x');
        const res = updateDrawableFromText(d, edited, KINDS);
        expect(res.ok && res.drawable.kind === 'curve' && res.drawable.domain?.min).toBe(0);
    });
});

describe('updateDrawableFromText — color always survives', () => {
    it('color persists across a coord edit', () => {
        const d: DrawableAttr = { kind: 'point', at: [2, 3], color: 'red' };
        const res = updateDrawableFromText(d, '(5, 7)', KINDS);
        expect(res.ok && res.drawable.color).toBe('red');
    });
    it('color persists even when the edit changes the kind (point → curve)', () => {
        const d: DrawableAttr = { kind: 'point', at: [2, 3], color: 'teal' };
        const res = updateDrawableFromText(d, 'y = 2x', KINDS);
        expect(res.ok && res.drawable.kind).toBe('curve');
        expect(res.ok && res.drawable.color).toBe('teal');
    });
});

describe('updateDrawableFromText — gates', () => {
    it('rejects an expression when kinds excludes it (MC choice figure)', () => {
        const d: DrawableAttr = { kind: 'curve', model: linear(1, 0) };
        const res = updateDrawableFromText(d, 'sin(x)', ['point', 'curve']);
        expect(res.ok).toBe(false);
    });
    it('rejects multi-drawable input (one shape per row)', () => {
        const d: DrawableAttr = { kind: 'point', at: [0, 0] };
        const res = updateDrawableFromText(d, '(1, 2), (3, 4)', KINDS);
        expect(res.ok).toBe(false);
    });
    it('rejects unparseable text', () => {
        const d: DrawableAttr = { kind: 'point', at: [0, 0] };
        const res = updateDrawableFromText(d, '???', KINDS);
        expect(res.ok).toBe(false);
    });
});
