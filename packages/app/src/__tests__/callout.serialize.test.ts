// =============================================================================
// callout.serialize.test.ts — callout block round-trips (editor ↔ schema)
// -----------------------------------------------------------------------------
// The callout block was a schema+renderer ORPHAN — serialize returned null for
// it, so it couldn't be authored. These tests pin the new editor mapping: a
// callout node survives tiptap → schema → tiptap with its variant + inline body,
// an unknown variant coerces to 'info' (never fails the whole-doc parse), and
// the intermediate ActivityDocument carries a real schema callout block.
// =============================================================================

import { describe, it, expect } from 'vitest';
import type { JSONContent } from '@tiptap/core';
import { ActivityMeta } from '@activity/schema';
import {
    activityToTiptapBare as activityToTiptap,
    tiptapToActivityBare as tiptapToActivity,
} from '../lib/serializeTestBridge';

const META = ActivityMeta.parse({ title: 'T', course: 'Algebra II' });

const calloutNode = (variant: unknown, text = 'Heads up'): JSONContent => ({
    type: 'callout',
    attrs: { id: 'regenerated', variant },
    content: [{ type: 'text', text }],
});

const flatten = (n: JSONContent): JSONContent[] => [
    n,
    ...(n.content ?? []).flatMap(flatten),
];

const roundTrip = (input: JSONContent): JSONContent =>
    activityToTiptap(tiptapToActivity({ type: 'doc', content: [input] }, META));

const firstCallout = (doc: JSONContent): JSONContent =>
    (doc.content ?? []).flatMap(flatten).find((n) => n.type === 'callout')!;

describe('callout serialize round-trip', () => {
    it.each(['info', 'warning', 'success', 'note'])(
        'preserves the %s variant and body through tiptap → schema → tiptap',
        (variant) => {
            const cal = firstCallout(roundTrip(calloutNode(variant)));
            expect(cal.attrs!.variant).toBe(variant);
            expect(cal.content).toEqual([{ type: 'text', text: 'Heads up' }]);
        },
    );

    it('coerces an unknown/missing variant to info', () => {
        expect(firstCallout(roundTrip(calloutNode('bogus'))).attrs!.variant).toBe(
            'info',
        );
        expect(
            firstCallout(roundTrip(calloutNode(undefined))).attrs!.variant,
        ).toBe('info');
    });

    it('reaches a valid schema callout block (tiptap → ActivityDocument)', () => {
        const activity = tiptapToActivity(
            { type: 'doc', content: [calloutNode('warning')] },
            META,
        );
        const block = activity.sections
            .flatMap((s) => s.rows)
            .flatMap((r) => r.columns)
            .flatMap((c) => c.blocks)
            .find(
                (b): b is Extract<typeof b, { type: 'callout' }> =>
                    b.type === 'callout',
            );
        expect(block).toMatchObject({ type: 'callout', variant: 'warning' });
        expect(block!.content).toEqual([
            { type: 'text', text: 'Heads up', marks: [] },
        ]);
    });

    it('carries inline math in the body', () => {
        const node = calloutNode('note');
        node.content = [
            { type: 'text', text: 'recall ' },
            { type: 'mathInline', attrs: { latex: 'x^2' } },
        ];
        expect(firstCallout(roundTrip(node)).content).toEqual([
            { type: 'text', text: 'recall ' },
            { type: 'mathInline', attrs: { latex: 'x^2' } },
        ]);
    });
});
