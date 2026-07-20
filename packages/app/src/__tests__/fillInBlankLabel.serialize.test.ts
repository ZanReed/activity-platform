// =============================================================================
// fillInBlankLabel.serialize.test.ts — label round-trips (numbering/label, T4)
// -----------------------------------------------------------------------------
// The per-block `label` must survive activityToTiptap(tiptapToActivity(x)):
// none and custom persist; auto/absent stays absent (null); an empty custom
// text degrades to auto so the schema's min-1 constraint is never violated and
// round-trip equality holds for the default numbered case.
// =============================================================================

import { describe, it, expect } from 'vitest';
import type { JSONContent } from '@tiptap/core';
import { ActivityMeta } from '@activity/schema';
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';

const META = ActivityMeta.parse({ title: 'T', course: 'Algebra II' });

const roundTrip = (input: JSONContent): JSONContent =>
    activityToTiptap(tiptapToActivity(input, META));

const fibNode = (label: unknown): JSONContent => ({
    type: 'fillInBlank',
    attrs: {
        id: 'regenerated',
        solution: null,
        hasConfidenceRating: false,
        skills: [],
        workSpace: null,
        label,
    },
    content: [{ type: 'text', text: 'The base is ' }],
});

const labelAfterRoundTrip = (label: unknown): unknown => {
    const out = roundTrip({ type: 'doc', content: [fibNode(label)] });
    const fib = out.content!.find((n) => n.type === 'fillInBlank')!;
    return fib.attrs!.label;
};

describe('fill_in_blank label round-trip', () => {
    it('none survives', () => {
        expect(labelAfterRoundTrip({ mode: 'none' })).toEqual({ mode: 'none' });
    });

    it('custom survives with its text', () => {
        expect(labelAfterRoundTrip({ mode: 'custom', text: 'Warm-up' })).toEqual({
            mode: 'custom',
            text: 'Warm-up',
        });
    });

    it('auto (null) stays absent', () => {
        expect(labelAfterRoundTrip(null)).toBeNull();
    });

    it('explicit {mode:auto} collapses to absent (default)', () => {
        expect(labelAfterRoundTrip({ mode: 'auto' })).toBeNull();
    });

    it('empty custom text degrades to auto (absent)', () => {
        expect(labelAfterRoundTrip({ mode: 'custom', text: '   ' })).toBeNull();
    });
});
