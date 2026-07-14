// =============================================================================
// stage-9a.test.ts — Stage 9a schema additions (checkpoint / feedback fields)
// -----------------------------------------------------------------------------
// Public-API tests (import from '@activity/schema' via ../src/index.js). Covers
// the schema-default surface that the document/submission/inline files don't:
//   - ActivityMeta flow + feedback fields (submissionMode, revisionMode,
//     activityType, answerFeedback, skills)
//   - Section.isCheckpoint
//   - ProblemBlock optional solution + skills default
//   - FillInBlankBlock optional solution + hasConfidenceRating + skills default
//   - Factory defaults / partial-meta overrides
// v2 SubmissionResponses + migration coverage lives in submission.test.ts;
// per-blank hint / mistakeFeedback lives in inline.test.ts.
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  ActivityDocument,
  ActivityMeta,
  Section,
  ProblemBlock,
  FillInBlankBlock,
  BlankToken,
  createEmptyDocument,
  createSection,
  createProblemBlock,
  createFillInBlankBlock,
  createBlankToken,
} from '../src/index.js';

// Stable UUIDs so failures show recognizable values.
const BLOCK_ID = '550e8400-e29b-41d4-a716-446655440000';
const SECTION_ID = '650e8400-e29b-41d4-a716-446655440000';

describe('ActivityMeta — flow + feedback fields', () => {
  it('applies defaults for the flow fields when only title is provided', () => {
    const parsed = ActivityMeta.parse({ title: 'Test Activity' });
    expect(parsed.submissionMode).toBe('free');
    expect(parsed.revisionMode).toBe('free');
    expect(parsed.activityType).toBe('worksheet');
    expect(parsed.skills).toEqual([]);
    // New activities hide correctness until a section check / submit.
    expect(parsed.answerFeedback).toBe('on_check');
  });

  it('accepts explicit values for all flow fields', () => {
    const parsed = ActivityMeta.parse({
      title: 'Exit Ticket: Rational Expressions',
      submissionMode: 'locked',
      revisionMode: 'locked',
      activityType: 'exit_ticket',
      answerFeedback: 'immediate',
      skills: ['simplifying rational expressions', 'polynomial division'],
    });
    expect(parsed.submissionMode).toBe('locked');
    expect(parsed.revisionMode).toBe('locked');
    expect(parsed.activityType).toBe('exit_ticket');
    expect(parsed.answerFeedback).toBe('immediate');
    expect(parsed.skills).toHaveLength(2);
  });

  it('rejects an invalid answerFeedback value', () => {
    expect(() => ActivityMeta.parse({ title: 'T', answerFeedback: 'bogus' })).toThrow();
  });

  it('rejects an invalid submissionMode value', () => {
    expect(() => ActivityMeta.parse({ title: 'T', submissionMode: 'bogus' })).toThrow();
  });
});

describe('Section — isCheckpoint', () => {
  it('defaults isCheckpoint to false', () => {
    const parsed = Section.parse({ id: SECTION_ID, rows: [] });
    expect(parsed.isCheckpoint).toBe(false);
  });

  it('accepts isCheckpoint: true', () => {
    const parsed = Section.parse({ id: SECTION_ID, isCheckpoint: true, rows: [] });
    expect(parsed.isCheckpoint).toBe(true);
  });

  it('factory createSection defaults isCheckpoint to false', () => {
    const section = createSection();
    expect(section.isCheckpoint).toBe(false);
    expect(() => Section.parse(section)).not.toThrow();
  });
});

describe('ProblemBlock — optional solution + skills', () => {
  it('factory defaults skills to an empty array', () => {
    const parsed = ProblemBlock.parse(createProblemBlock());
    expect(parsed.skills).toEqual([]);
  });

  it('solution is optional', () => {
    const parsed = ProblemBlock.parse({ id: BLOCK_ID, type: 'problem', content: [] });
    expect(parsed.solution).toBeUndefined();
  });

  it('accepts solution and skills together', () => {
    const parsed = ProblemBlock.parse({
      id: BLOCK_ID,
      type: 'problem',
      content: [],
      solution: [{ type: 'text', text: 'First, distribute the 2 across (x + 3) to get 2x + 6.' }],
      skills: ['distributive property'],
    });
    expect(parsed.solution?.[0]).toMatchObject({
      type: 'text',
      text: expect.stringContaining('distribute'),
    });
    expect(parsed.skills).toEqual(['distributive property']);
  });
});

describe('FillInBlankBlock — optional solution + confidence + skills', () => {
  it('factory produces a schema-valid block with the new-field defaults', () => {
    const parsed = FillInBlankBlock.parse(createFillInBlankBlock());
    expect(parsed.hasConfidenceRating).toBe(false);
    expect(parsed.skills).toEqual([]);
    expect(parsed.solution).toBeUndefined();
  });

  it('accepts hasConfidenceRating: true', () => {
    const parsed = FillInBlankBlock.parse({
      ...createFillInBlankBlock(),
      hasConfidenceRating: true,
    });
    expect(parsed.hasConfidenceRating).toBe(true);
  });
});

describe('BlankToken — optional hint + mistakeFeedback', () => {
  it('hint and mistakeFeedback are optional', () => {
    const parsed = BlankToken.parse(createBlankToken('x+2'));
    expect(parsed.hint).toBeUndefined();
    expect(parsed.mistakeFeedback).toBeUndefined();
  });

  it('accepts hint and mistakeFeedback together', () => {
    const parsed = BlankToken.parse({
      type: 'blank',
      id: BLOCK_ID,
      answer: 'x+2',
      acceptableAnswers: [],
      hint: [{ type: 'text', text: 'Combine the like terms.' }],
      mistakeFeedback: [
        { match: '2x', feedback: [{ type: 'text', text: 'You multiplied — add the like terms instead.' }] },
        { match: 'x', feedback: [{ type: 'text', text: "Don't forget the constant term." }] },
      ],
    });
    expect(parsed.hint?.[0]).toMatchObject({ type: 'text', text: 'Combine the like terms.' });
    expect(parsed.mistakeFeedback).toHaveLength(2);
    expect(parsed.mistakeFeedback?.[0]?.match).toBe('2x');
  });
});

describe('Factories — schema-valid output for the new fields', () => {
  it('createEmptyDocument honors partial meta overrides while preserving defaults', () => {
    const doc = createEmptyDocument({
      title: 'My Activity',
      submissionMode: 'locked',
      activityType: 'exit_ticket',
    });
    expect(doc.meta.title).toBe('My Activity');
    expect(doc.meta.submissionMode).toBe('locked');
    expect(doc.meta.activityType).toBe('exit_ticket');
    expect(doc.meta.revisionMode).toBe('free'); // default preserved
    expect(doc.meta.skills).toEqual([]); // default preserved
    expect(() => ActivityDocument.parse(doc)).not.toThrow();
  });

  it('block factories touching the new fields all produce schema-valid output', () => {
    expect(() => ProblemBlock.parse(createProblemBlock())).not.toThrow();
    expect(() => FillInBlankBlock.parse(createFillInBlankBlock())).not.toThrow();
  });
});
