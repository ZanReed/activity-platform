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
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';

const META = ActivityMeta.parse({ title: 'Sizing', course: 'Geometry' });

function doc(...content: JSONContent[]): JSONContent {
    return { type: 'doc', content };
}

function firstBlock(input: JSONContent) {
    return tiptapToActivity(input, META).sections[0]!.blocks[0]!;
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
        const columns = (minHeight: unknown) =>
            doc({
                type: 'columns',
                attrs: { gridLines: 'inherit' },
                content: [
                    { type: 'column', attrs: { minHeight }, content: [{ type: 'paragraph' }] },
                    { type: 'column', attrs: {}, content: [{ type: 'paragraph' }] },
                ],
            });

        const ok = firstBlock(columns(8));
        if (ok.type !== 'columns') throw new Error('expected columns');
        expect(ok.columns[0]!.minHeight).toBe(8);
        expect('minHeight' in ok.columns[1]!).toBe(false);

        const bad = firstBlock(columns(0));
        if (bad.type !== 'columns') throw new Error('expected columns');
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
                type: 'columns',
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

    it('round-trips a fixed image height (and drops non-positive ones)', () => {
        const make = (height: unknown) =>
            tiptapToActivity(
                doc({
                    type: 'image',
                    attrs: { src: 'https://example.com/a.png', alt: '', height },
                }),
                META,
            ).sections[0]!.blocks[0]!;

        expect(make(12)).toMatchObject({ type: 'image', height: 12 });
        expect('height' in make(0)).toBe(false);
        expect('height' in make(-3)).toBe(false);
        expect('height' in make('12')).toBe(false);

        // Reverse: the attr comes back out, and absent stays absent.
        const out = activityToTiptap(
            tiptapToActivity(
                doc({
                    type: 'image',
                    attrs: {
                        src: 'https://example.com/a.png',
                        alt: '',
                        caption: '',
                        height: 7.5,
                    },
                }),
                META,
            ),
        );
        expect(out.content?.[0]?.attrs).toMatchObject({ height: 7.5 });
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
