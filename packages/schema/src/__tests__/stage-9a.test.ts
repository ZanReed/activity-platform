// Tests for Stage 9a schema additions. Covers:
//   - ActivityMeta defaults for new fields (submissionMode, revisionMode,
//     activityType, skills) and accepting explicit values
//   - Section.isCheckpoint default
//   - ProblemBlock optional solution + skills default
//   - FillInBlankBlock optional solution + hasConfidenceRating default + skills default
//   - BlankToken optional hint + mistakeFeedback
//   - SubmissionResponses v2 parse (with and without checkpointResults)
//   - BlankResponse optional confidence
//   - migrateSubmissionResponses v1 → v2 and v2 passthrough
//   - Factories produce schema-valid objects

import { describe, it, expect } from 'vitest';
import { ActivityDocument, ActivityMeta, Section } from '../document.js';
import { ProblemBlock } from '../blocks/problem.js';
import { FillInBlankBlock } from '../blocks/fill-in-blank.js';
import { BlankToken } from '../inline.js';
import {
    SubmissionResponses,
    SubmissionResponsesV1,
    migrateSubmissionResponses,
    ConfidenceLevel,
} from '../submission.js';
import {
    createEmptyDocument,
    createSection,
    createProblemBlock,
    createFillInBlankBlock,
    createBlankToken,
} from '../factories.js';

// Stable UUIDs for tests so failures show recognizable values.
const BLANK_ID = '550e8400-e29b-41d4-a716-446655440000';
const SECTION_ID = '650e8400-e29b-41d4-a716-446655440000';

describe('ActivityMeta — Stage 9a additions', () => {
    it('applies defaults for new fields when only title is provided', () => {
        const parsed = ActivityMeta.parse({ title: 'Test Activity' });
        expect(parsed.submissionMode).toBe('free');
        expect(parsed.revisionMode).toBe('free');
        expect(parsed.activityType).toBe('worksheet');
        expect(parsed.skills).toEqual([]);
    });

    it('accepts explicit values for all new fields', () => {
        const parsed = ActivityMeta.parse({
            title: 'Exit Ticket: Rational Expressions',
            submissionMode: 'locked',
            revisionMode: 'locked',
            activityType: 'exit_ticket',
            skills: ['simplifying rational expressions', 'polynomial division'],
        });
        expect(parsed.submissionMode).toBe('locked');
        expect(parsed.revisionMode).toBe('locked');
        expect(parsed.activityType).toBe('exit_ticket');
        expect(parsed.skills).toHaveLength(2);
    });

    it('rejects invalid enum values', () => {
        expect(() =>
        ActivityMeta.parse({ title: 'T', submissionMode: 'bogus' }),
        ).toThrow();
    });
});

describe('Section — Stage 9a additions', () => {
    it('defaults isCheckpoint to false', () => {
        const parsed = Section.parse({
            id: SECTION_ID,
            blocks: [],
        });
        expect(parsed.isCheckpoint).toBe(false);
    });

    it('accepts isCheckpoint: true', () => {
        const parsed = Section.parse({
            id: SECTION_ID,
            isCheckpoint: true,
            blocks: [],
        });
        expect(parsed.isCheckpoint).toBe(true);
    });
});

describe('ProblemBlock — Stage 9a additions', () => {
    it('defaults skills to empty array', () => {
        const block = createProblemBlock();
        const parsed = ProblemBlock.parse(block);
        expect(parsed.skills).toEqual([]);
    });

    it('solution is optional', () => {
        const parsed = ProblemBlock.parse({
            id: BLANK_ID,
            type: 'problem',
            content: [],
        });
        expect(parsed.solution).toBeUndefined();
    });

    it('accepts solution and skills together', () => {
        const parsed = ProblemBlock.parse({
            id: BLANK_ID,
            type: 'problem',
            content: [],
            solution: 'First, distribute the 2 across (x + 3) to get 2x + 6.',
                                          skills: ['distributive property'],
        });
        expect(parsed.solution).toContain('distribute');
        expect(parsed.skills).toEqual(['distributive property']);
    });
});

describe('FillInBlankBlock — Stage 9a additions', () => {
    it('factory produces schema-valid block with new field defaults', () => {
        const block = createFillInBlankBlock();
        const parsed = FillInBlankBlock.parse(block);
        expect(parsed.hasConfidenceRating).toBe(false);
        expect(parsed.skills).toEqual([]);
        expect(parsed.solution).toBeUndefined();
    });

    it('accepts hasConfidenceRating: true', () => {
        const block = createFillInBlankBlock();
        const withRating = { ...block, hasConfidenceRating: true };
        const parsed = FillInBlankBlock.parse(withRating);
        expect(parsed.hasConfidenceRating).toBe(true);
    });
});

describe('BlankToken — Stage 9a additions', () => {
    it('hint and mistakeFeedback are optional', () => {
        const token = createBlankToken('x+2');
        const parsed = BlankToken.parse(token);
        expect(parsed.hint).toBeUndefined();
        expect(parsed.mistakeFeedback).toBeUndefined();
    });

    it('accepts hint and mistakeFeedback together', () => {
        const parsed = BlankToken.parse({
            type: 'blank',
            id: BLANK_ID,
            answer: 'x+2',
            acceptableAnswers: [],
            hint: 'Combine the like terms.',
            mistakeFeedback: [
                { match: '2x', feedback: 'You multiplied — add the like terms instead.' },
                { match: 'x', feedback: "Don't forget the constant term." },
            ],
        });
        expect(parsed.hint).toBe('Combine the like terms.');
        expect(parsed.mistakeFeedback).toHaveLength(2);
        expect(parsed.mistakeFeedback?.[0].match).toBe('2x');
    });
});

describe('SubmissionResponses v2 — Stage 9a additions', () => {
    it('parses a minimal v2 submission', () => {
        const parsed = SubmissionResponses.parse({
            schemaVersion: 2,
            blanks: {
                [BLANK_ID]: { answer: 'x+2', correct: true },
            },
        });
        expect(parsed.schemaVersion).toBe(2);
        expect(parsed.checkpointResults).toBeUndefined();
    });

    it('parses v2 with checkpointResults and confidence', () => {
        const parsed = SubmissionResponses.parse({
            schemaVersion: 2,
            blanks: {
                [BLANK_ID]: {
                    answer: 'x+2',
                    correct: true,
                    confidence: 'certain',
                },
            },
            checkpointResults: {
                [SECTION_ID]: {
                    checkedAt: '2024-01-15T10:30:00.000Z',
                    score: 4,
                    total: 5,
                },
            },
        });
        expect(parsed.blanks[BLANK_ID].confidence).toBe('certain');
        expect(parsed.checkpointResults?.[SECTION_ID].score).toBe(4);
    });

    it('rejects invalid confidence value', () => {
        expect(() =>
        SubmissionResponses.parse({
            schemaVersion: 2,
            blanks: { [BLANK_ID]: { answer: 'x+2', correct: true, confidence: 'maybe' } },
        }),
        ).toThrow();
    });
});

describe('migrateSubmissionResponses', () => {
    it('passes v2 through unchanged', () => {
        const v2 = {
            schemaVersion: 2 as const,
            blanks: { [BLANK_ID]: { answer: 'x+2', correct: true } },
        };
        const result = migrateSubmissionResponses(v2);
        expect(result.schemaVersion).toBe(2);
        expect(result.blanks).toEqual(v2.blanks);
    });

    it('migrates v1 to v2 by bumping schemaVersion and preserving blanks', () => {
        const v1 = {
            schemaVersion: 1 as const,
            blanks: {
                [BLANK_ID]: { answer: 'x+2', correct: true },
            },
        };
        const result = migrateSubmissionResponses(v1);
        expect(result.schemaVersion).toBe(2);
        expect(result.blanks).toEqual(v1.blanks);
        expect(result.checkpointResults).toBeUndefined();
    });

    it('throws on unknown version', () => {
        expect(() => migrateSubmissionResponses({ schemaVersion: 99, blanks: {} })).toThrow();
    });

    it('throws on completely malformed input', () => {
        expect(() => migrateSubmissionResponses({ random: 'garbage' })).toThrow();
    });
});

describe('Factories produce schema-valid output', () => {
    it('createEmptyDocument validates against ActivityDocument', () => {
        const doc = createEmptyDocument();
        expect(() => ActivityDocument.parse(doc)).not.toThrow();
    });

    it('createEmptyDocument honors partial meta overrides', () => {
        const doc = createEmptyDocument({
            title: 'My Activity',
            submissionMode: 'locked',
            activityType: 'exit_ticket',
        });
        expect(doc.meta.title).toBe('My Activity');
        expect(doc.meta.submissionMode).toBe('locked');
        expect(doc.meta.activityType).toBe('exit_ticket');
        expect(doc.meta.revisionMode).toBe('free');   // default preserved
        expect(doc.meta.skills).toEqual([]);          // default preserved
    });

    it('createSection includes isCheckpoint: false default', () => {
        const section = createSection();
        expect(section.isCheckpoint).toBe(false);
        expect(() => Section.parse(section)).not.toThrow();
    });

    it('factories that touch new fields all produce schema-valid output', () => {
        expect(() => ProblemBlock.parse(createProblemBlock())).not.toThrow();
        expect(() => FillInBlankBlock.parse(createFillInBlankBlock())).not.toThrow();
        expect(() => BlankToken.parse(createBlankToken('x+2'))).not.toThrow();
    });
});
