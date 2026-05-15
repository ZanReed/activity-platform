import { describe, it, expect } from 'vitest';
import { ActivityDocument } from '../src/index.js';

describe('Stage 9e — schema additions', () => {
    describe('ActivityMeta.gradingMode', () => {
        it('defaults to "auto" when omitted', () => {
            const doc = ActivityDocument.parse({
                schemaVersion: 1,
                meta: { title: 'Test' },
                sections: [],
            });
            expect(doc.meta.gradingMode).toBe('auto');
        });

        it('accepts each valid value', () => {
            for (const value of ['auto', 'manual', 'mixed'] as const) {
                const doc = ActivityDocument.parse({
                    schemaVersion: 1,
                    meta: { title: 'Test', gradingMode: value },
                    sections: [],
                });
                expect(doc.meta.gradingMode).toBe(value);
            }
        });

        it('rejects unknown values', () => {
            expect(() => ActivityDocument.parse({
                schemaVersion: 1,
                meta: { title: 'Test', gradingMode: 'partial' },
                sections: [],
            })).toThrow();
        });
    });

    describe('ActivityDocument.referencePanel', () => {
        it('is absent on documents that do not provide it', () => {
            const doc = ActivityDocument.parse({
                schemaVersion: 1,
                meta: { title: 'Test' },
                sections: [],
            });
            expect(doc.referencePanel).toBeUndefined();
        });

        it('accepts a panel with title and empty blocks', () => {
            const doc = ActivityDocument.parse({
                schemaVersion: 1,
                meta: { title: 'Test' },
                sections: [],
                referencePanel: {
                    title: 'Formula reference',
                    blocks: [],
                },
            });
            expect(doc.referencePanel?.title).toBe('Formula reference');
            expect(doc.referencePanel?.blocks).toEqual([]);
        });

        it('accepts a panel without a title', () => {
            const doc = ActivityDocument.parse({
                schemaVersion: 1,
                meta: { title: 'Test' },
                sections: [],
                referencePanel: { blocks: [] },
            });
            expect(doc.referencePanel?.title).toBeUndefined();
        });

        it('round-trips through JSON without data loss', () => {
            const parsed = ActivityDocument.parse({
                schemaVersion: 1,
                meta: { title: 'Test' },
                sections: [],
                referencePanel: {
                    title: 'Formula reference',
                    blocks: [],
                },
            });
            const reparsed = ActivityDocument.parse(JSON.parse(JSON.stringify(parsed)));
            expect(reparsed.referencePanel).toEqual(parsed.referencePanel);
        });
    });
    describe('Mark — subscript and superscript', () => {
        it('accepts subscript and superscript on text nodes', () => {
            expect(() => ActivityDocument.parse({
                schemaVersion: 1,
                meta: { title: 'Test' },
                sections: [{
                    id: '11111111-1111-1111-1111-111111111111',
                    isCheckpoint: false,
                    blocks: [{
                        id: '22222222-2222-2222-2222-222222222222',
                        type: 'paragraph',
                        content: [
                            { type: 'text', text: 'H' },
                            { type: 'text', text: '2', marks: ['subscript'] },
                            { type: 'text', text: 'O' },
                            { type: 'text', text: 'x' },
                            { type: 'text', text: '2', marks: ['superscript'] },
                        ],
                    }],
                }],
            })).not.toThrow();
        });

        it('accepts both marks together on the same text run', () => {
            expect(() => ActivityDocument.parse({
                schemaVersion: 1,
                meta: { title: 'Test' },
                sections: [{
                    id: '11111111-1111-1111-1111-111111111111',
                    isCheckpoint: false,
                    blocks: [{
                        id: '22222222-2222-2222-2222-222222222222',
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'x', marks: ['bold', 'superscript'] }],
                    }],
                }],
            })).not.toThrow();
        });

        it('rejects unknown mark values', () => {
            expect(() => ActivityDocument.parse({
                schemaVersion: 1,
                meta: { title: 'Test' },
                sections: [{
                    id: '11111111-1111-1111-1111-111111111111',
                    isCheckpoint: false,
                    blocks: [{
                        id: '22222222-2222-2222-2222-222222222222',
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'x', marks: ['strikethrough'] }],
                    }],
                }],
            })).toThrow();
        });
    });
});
