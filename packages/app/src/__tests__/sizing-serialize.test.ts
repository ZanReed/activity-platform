// =============================================================================
// sizing-serialize.test.ts — Sizing fields through the Tiptap bridge (Drop 1)
// -----------------------------------------------------------------------------
// width/align on image + mathBlock, minHeight on column. Both directions,
// plus the guard rails: out-of-bounds editor attrs must be dropped (never
// widen the schema), and unset fields must stay absent (round-trip equality).
// =============================================================================

import { describe, expect, it } from 'vitest';
import type { JSONContent } from '@tiptap/react';
import { ActivityMeta } from '@activity/schema';
import {
    activityToTiptapBare as activityToTiptap,
    tiptapToActivityBare as tiptapToActivity,
} from '../lib/serializeTestBridge';

const META = ActivityMeta.parse({ title: 'Sizing', course: 'Geometry' });

function doc(...content: JSONContent[]): JSONContent {
    return { type: 'doc', content };
}

function firstBlock(input: JSONContent) {
    return tiptapToActivity(input, META).sections[0]!.rows[0]!.columns[0]!.blocks[0]!;
}

describe('tiptapToActivity — sizing attrs', () => {
    it('carries width and align from an image node', () => {
        const block = firstBlock(
            doc({
                type: 'image',
                attrs: { src: 'https://example.com/a.png', alt: '', width: 0.5, align: 'left' },
            }),
        );
        expect(block).toMatchObject({ type: 'image', width: 0.5, align: 'left' });
    });

    it('carries width and align from a mathBlock node', () => {
        const block = firstBlock(
            doc({ type: 'mathBlock', attrs: { latex: 'x^2', width: 0.75, align: 'right' } }),
        );
        expect(block).toMatchObject({ type: 'math_block', width: 0.75, align: 'right' });
    });

    it('drops out-of-bounds widths and unknown aligns instead of widening the schema', () => {
        for (const width of [0, -1, 1.5, '0.5']) {
            const block = firstBlock(
                doc({
                    type: 'image',
                    attrs: { src: 'https://example.com/a.png', alt: '', width },
                }),
            );
            expect('width' in block).toBe(false);
        }
        const block = firstBlock(
            doc({
                type: 'image',
                attrs: { src: 'https://example.com/a.png', alt: '', width: 0.5, align: 'middle' },
            }),
        );
        expect('align' in block).toBe(false);
    });

    it('leaves width/align absent when unset (no nulls in the document)', () => {
        const block = firstBlock(
            doc({ type: 'image', attrs: { src: 'https://example.com/a.png', alt: '' } }),
        );
        expect('width' in block).toBe(false);
        expect('align' in block).toBe(false);
    });

    it('carries a positive minHeight on a column and drops non-positive ones', () => {
        const rowWith = (minHeight: unknown) =>
            doc({
                type: 'row',
                attrs: { gridLines: 'inherit' },
                content: [
                    { type: 'column', attrs: { minHeight }, content: [{ type: 'paragraph' }] },
                    { type: 'column', attrs: {}, content: [{ type: 'paragraph' }] },
                ],
            });
        // A multi-column row becomes a schema Row at section.rows[0].
        const firstRow = (input: JSONContent) =>
            tiptapToActivity(input, META).sections[0]!.rows[0]!;

        const ok = firstRow(rowWith(8));
        expect(ok.columns[0]!.minHeight).toBe(8);
        expect('minHeight' in ok.columns[1]!).toBe(false);

        const bad = firstRow(rowWith(0));
        expect('minHeight' in bad.columns[0]!).toBe(false);
    });
});

describe('round-trips (Tiptap side, strict deep-equal)', () => {
    function roundTrip(input: JSONContent): JSONContent {
        return activityToTiptap(tiptapToActivity(input, META));
    }

    it('round-trips a sized mathBlock', () => {
        const input = doc({
            type: 'mathBlock',
            attrs: { latex: '2x', width: 0.66, align: 'left' },
        });
        expect(roundTrip(input)).toEqual(input);
    });

    it('round-trips an unsized mathBlock without sprouting sizing attrs', () => {
        const input = doc({ type: 'mathBlock', attrs: { latex: '2x' } });
        expect(roundTrip(input)).toEqual(input);
    });

    it('round-trips a column minHeight beside a width weight', () => {
        // The columns node attrs carry an id that activityToTiptap mints
        // fresh, so assert on the column attrs rather than strict deep-equal.
        const out = roundTrip(
            doc({
                type: 'row',
                attrs: { gridLines: 'inherit' },
                content: [
                    {
                        type: 'column',
                        attrs: { width: 2, minHeight: 8 },
                        content: [{ type: 'paragraph', content: [] }],
                    },
                    {
                        type: 'column',
                        attrs: {},
                        content: [{ type: 'paragraph', content: [] }],
                    },
                ],
            }),
        );
        const cols = out.content?.[0];
        expect(cols?.content?.[0]?.attrs).toEqual({ width: 2, minHeight: 8 });
        expect(cols?.content?.[1]?.attrs).toEqual({});
    });

    // CR-M3 — crop + srcAspect round-trip, stored BOTH-OR-NEITHER.
    it('round-trips crop + srcAspect together; omits both when uncropped', () => {
        const make = (attrs: Record<string, unknown>) =>
            tiptapToActivity(
                doc({
                    type: 'image',
                    attrs: { src: 'https://example.com/a.png', alt: '', ...attrs },
                }),
                META,
            ).sections[0]!.rows[0]!.columns[0]!.blocks[0]!;

        // Valid crop + positive srcAspect → both carried.
        expect(
            make({ crop: { x: 0.1, y: 0.2, w: 0.5, h: 0.4 }, srcAspect: 1.5 }),
        ).toMatchObject({
            type: 'image',
            crop: { x: 0.1, y: 0.2, w: 0.5, h: 0.4 },
            srcAspect: 1.5,
        });

        // Both-or-neither: crop without srcAspect (or vice-versa) → neither.
        expect('crop' in make({ crop: { x: 0, y: 0, w: 0.5, h: 0.5 } })).toBe(false);
        expect('srcAspect' in make({ srcAspect: 1.5 })).toBe(false);
        // An out-of-bounds crop is dropped (with its srcAspect).
        expect(
            'crop' in make({ crop: { x: 0.8, y: 0, w: 0.5, h: 0.5 }, srcAspect: 1.5 }),
        ).toBe(false);
        // Uncropped image carries neither.
        const plain = make({});
        expect('crop' in plain).toBe(false);
        expect('srcAspect' in plain).toBe(false);

        // Reverse: crop+srcAspect come back out on the tiptap node.
        const out = activityToTiptap(
            tiptapToActivity(
                doc({
                    type: 'image',
                    attrs: {
                        src: 'https://example.com/a.png',
                        alt: '',
                        caption: '',
                        crop: { x: 0, y: 0, w: 0.5, h: 0.25 },
                        srcAspect: 2,
                    },
                }),
                META,
            ),
        );
        expect(out.content?.[0]?.attrs).toMatchObject({
            crop: { x: 0, y: 0, w: 0.5, h: 0.25 },
            srcAspect: 2,
        });
    });

    it('round-trips image sizing through the activity document', () => {
        // Image attrs carry an id that activityToTiptap mints fresh, so assert
        // on the sizing fields rather than strict deep-equal.
        const out = roundTrip(
            doc({
                type: 'image',
                attrs: {
                    src: 'https://example.com/a.png',
                    alt: 'a',
                    caption: '',
                    width: 0.25,
                    align: 'right',
                },
            }),
        );
        const img = out.content?.[0];
        expect(img?.attrs).toMatchObject({
            src: 'https://example.com/a.png',
            width: 0.25,
            align: 'right',
        });
    });
});
