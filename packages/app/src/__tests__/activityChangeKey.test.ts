import { describe, it, expect } from 'vitest';
import { createEmptyDocument } from '@activity/schema';
import {
    activityChangeKey,
    type ActivityChangeKeyInputs,
} from '../lib/activityChangeKey';

// The autosave dirtiness contract. The rule being pinned: every field
// ActivityEditor's save() persists must move this key, or editing that field
// alone silently never saves. The taxonomy eng review (2026-08-18) caught
// `tags` violating this before it shipped — these tests are why it cannot
// regress quietly.

const base: ActivityChangeKeyInputs = {
    tiptapJson: { type: 'doc', content: [{ type: 'paragraph' }] },
    meta: createEmptyDocument({ title: 'T' }).meta,
    panelTitle: '',
    panelJson: { type: 'doc', content: [{ type: 'paragraph' }] },
    calculator: undefined,
    tags: [],
    pedagogicalRole: null,
};

/** Every input, and the smallest edit to it that a user could make. */
const MUTATIONS: [string, Partial<ActivityChangeKeyInputs>][] = [
    ['body', { tiptapJson: { type: 'doc', content: [{ type: 'heading' }] } }],
    ['meta', { meta: { ...base.meta!, title: 'Renamed' } }],
    ['meta.course', { meta: { ...base.meta!, course: 'Geometry' } }],
    ['meta.unit', { meta: { ...base.meta!, unit: 'Quadratics' } }],
    ['reference panel title', { panelTitle: 'Formulas' }],
    ['reference panel body', { panelJson: { type: 'doc', content: [] } }],
    ['calculator', { calculator: { enabled: true } as never }],
    ['tags', { tags: ['factoring'] }],
    ['pedagogicalRole', { pedagogicalRole: 'review' }],
];

describe('activityChangeKey', () => {
    it('is null until both editors have reported', () => {
        expect(activityChangeKey({ ...base, tiptapJson: null })).toBeNull();
        expect(activityChangeKey({ ...base, panelJson: null })).toBeNull();
        expect(activityChangeKey({ ...base, meta: null })).toBeNull();
    });

    it('is non-null once the document has loaded', () => {
        expect(activityChangeKey(base)).not.toBeNull();
    });

    it('is stable for unchanged inputs', () => {
        expect(activityChangeKey(base)).toBe(activityChangeKey(base));
    });

    // The contract, one row per savable field.
    describe('every field save() writes moves the key', () => {
        for (const [name, patch] of MUTATIONS) {
            it(`${name} changes the fingerprint`, () => {
                expect(activityChangeKey({ ...base, ...patch })).not.toBe(
                    activityChangeKey(base),
                );
            });
        }
    });

    // The specific regression: a tags-only edit, with nothing else touched,
    // must be enough to mark the document dirty.
    it('a tags-only edit dirties the key (the caught regression)', () => {
        const before = activityChangeKey(base);
        const after = activityChangeKey({ ...base, tags: ['word problems'] });
        expect(after).not.toBe(before);
    });

    it('distinguishes tag ORDER, so a reorder still saves', () => {
        const a = activityChangeKey({ ...base, tags: ['a', 'b'] });
        const b = activityChangeKey({ ...base, tags: ['b', 'a'] });
        expect(a).not.toBe(b);
    });

    it('treats clearing the role as a change', () => {
        const withRole = activityChangeKey({
            ...base,
            pedagogicalRole: 'lesson',
        });
        expect(activityChangeKey(base)).not.toBe(withRole);
    });
});
