// =============================================================================
// submission.test.ts — Validates SubmissionResponses parsing & migration
// -----------------------------------------------------------------------------
// Public-API tests: imports from '@activity/schema' via the package's
// barrel export. If the public surface for submission responses breaks,
// these tests catch it. Unit-level coverage of v2 fields lives in
// src/__tests__/stage-9a.test.ts.
// =============================================================================
import { describe, it, expect } from 'vitest';
import {
  SubmissionResponses,
  SubmissionResponsesV1,
  migrateSubmissionResponses,
} from '../src/index.js';

describe('SubmissionResponses (v2 — current)', () => {
  it('parses valid responses keyed by uuid', () => {
    const id = crypto.randomUUID();
    const data = {
      schemaVersion: 2,
      blanks: {
        [id]: { answer: 'x+2', correct: true },
      },
    };
    const result = SubmissionResponses.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('parses empty responses (student submitted nothing)', () => {
    const data = { schemaVersion: 2, blanks: {} };
    expect(SubmissionResponses.safeParse(data).success).toBe(true);
  });

  it('parses responses with optional confidence and checkpointResults', () => {
    const blankId = crypto.randomUUID();
    const sectionId = crypto.randomUUID();
    const data = {
      schemaVersion: 2,
      blanks: {
        [blankId]: { answer: 'x+2', correct: true, confidence: 'certain' },
      },
      checkpointResults: {
        [sectionId]: {
          checkedAt: '2024-01-15T10:30:00.000Z',
          score: 4,
          total: 5,
        },
      },
    };
    expect(SubmissionResponses.safeParse(data).success).toBe(true);
  });

  it('rejects non-uuid blank keys', () => {
    const data = {
      schemaVersion: 2,
      blanks: { 'not-a-uuid': { answer: 'x', correct: false } },
    };
    expect(SubmissionResponses.safeParse(data).success).toBe(false);
  });

  it('rejects missing schemaVersion', () => {
    const data = { blanks: {} };
    expect(SubmissionResponses.safeParse(data).success).toBe(false);
  });

  it('rejects schemaVersion: 1 directly (must use migrateSubmissionResponses)', () => {
    const data = { schemaVersion: 1, blanks: {} };
    expect(SubmissionResponses.safeParse(data).success).toBe(false);
  });
});

describe('SubmissionResponsesV1 (legacy — for migration only)', () => {
  it('parses old v1 shape', () => {
    const id = crypto.randomUUID();
    const data = {
      schemaVersion: 1,
      blanks: { [id]: { answer: 'x+2', correct: true } },
    };
    expect(SubmissionResponsesV1.safeParse(data).success).toBe(true);
  });
});

describe('migrateSubmissionResponses', () => {
  it('reads a v2 submission unchanged', () => {
    const id = crypto.randomUUID();
    const v2 = {
      schemaVersion: 2 as const,
      blanks: { [id]: { answer: 'x+2', correct: true } },
    };
    const result = migrateSubmissionResponses(v2);
    expect(result.schemaVersion).toBe(2);
    expect(result.blanks).toEqual(v2.blanks);
  });

  it('migrates a v1 submission to v2', () => {
    const id = crypto.randomUUID();
    const v1 = {
      schemaVersion: 1,
      blanks: { [id]: { answer: 'x+2', correct: true } },
    };
    const result = migrateSubmissionResponses(v1);
    expect(result.schemaVersion).toBe(2);
    expect(result.blanks).toEqual(v1.blanks);
    expect(result.checkpointResults).toBeUndefined();
  });

  it('throws on a malformed input', () => {
    expect(() => migrateSubmissionResponses({ garbage: true })).toThrow();
  });
});
