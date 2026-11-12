// =============================================================================
// prePublishCheck.test.ts — an empty blank is kept, and refused at publish
// (UI review G-2, docs/design/ui-review-group-a.md)
// -----------------------------------------------------------------------------
// Before G-2 the serializer dropped a blank whose answer was empty: the chip
// stayed on screen and vanished on reload. Now the draft keeps it (the schema
// allows '' in a draft), and the pre-publish check finds it wherever it sits.
// =============================================================================

import { describe, expect, it } from 'vitest';
import type { JSONContent } from '@tiptap/react';
import { ActivityDocument, ActivityMeta } from '@activity/schema';
import { activityToTiptap } from '../lib/serialize';
import { tiptapToActivityBare as tiptapToActivity } from '../lib/serializeTestBridge';
import { findPublishProblems, publishProblemsSentence } from '../lib/prePublishCheck';

const META = ActivityMeta.parse({ title: 'G-2' });

const blank = (id: string, answer: string): JSONContent => ({
    type: 'blank',
    attrs: { id, answer, acceptableAnswers: [] },
});
const fib = (...inline: JSONContent[]): JSONContent => ({
    type: 'fillInBlank',
    attrs: { id: 'fib' },
    content: [{ type: 'text', text: 'x = ' }, ...inline],
});

const EMPTY = '11111111-1111-4111-8111-111111111111';
const FULL = '22222222-2222-4222-8222-222222222222';
const SPACES = '33333333-3333-4333-8333-333333333333';

describe('an empty blank survives a save (G-2)', () => {
    it('is kept by the serializer, valid as a draft, and comes back on load', () => {
        const doc = tiptapToActivity({ type: 'doc', content: [fib(blank(EMPTY, ''), blank(FULL, '4'))] }, META);
        expect(ActivityDocument.safeParse(doc).success).toBe(true);
        const back = JSON.stringify(activityToTiptap(doc));
        expect(back).toContain(EMPTY);
        expect(back).toContain(FULL);
    });
});

describe('findPublishProblems', () => {
    it('names every empty (or blank-space) answer, and only those', () => {
        const doc = tiptapToActivity(
            { type: 'doc', content: [fib(blank(EMPTY, ''), blank(FULL, '4'), blank(SPACES, '   '))] },
            META,
        );
        expect(findPublishProblems(doc)).toEqual([
            { kind: 'empty-blank', blankId: EMPTY },
            { kind: 'empty-blank', blankId: SPACES },
        ]);
    });

    it('finds a blank nested anywhere in the document', () => {
        const nested = { blocks: [{ rows: [{ cells: [{ content: [{ type: 'blank', id: EMPTY, answer: '' }] }] }] }] };
        expect(findPublishProblems(nested)).toEqual([{ kind: 'empty-blank', blankId: EMPTY }]);
    });

    it('says how many, in a sentence', () => {
        expect(publishProblemsSentence([{ kind: 'empty-blank', blankId: EMPTY }])).toBe(
            'A blank has no answer yet, so nothing was published.',
        );
        expect(
            publishProblemsSentence([
                { kind: 'empty-blank', blankId: EMPTY },
                { kind: 'empty-blank', blankId: SPACES },
            ]),
        ).toBe('2 blanks have no answer yet, so nothing was published.');
    });
});
