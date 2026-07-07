// =============================================================================
// submission.test.ts — Validates SubmissionResponses parsing & migration
// -----------------------------------------------------------------------------
// Public-API tests: imports from '@activity/schema' via the package's
// barrel export. If the public surface for submission responses breaks,
// these tests catch it. Related schema-default coverage (ActivityMeta flow
// fields, block feedback fields) lives in stage-9a.test.ts.
// =============================================================================
import { describe, it, expect } from 'vitest';
import {
  SubmissionResponses,
  SubmissionResponsesV1,
  SubmissionResponsesV2,
  migrateSubmissionResponses,
} from '../src/index.js';

describe('SubmissionResponses (v3 — current)', () => {
  it('parses valid responses keyed by uuid', () => {
    const id = crypto.randomUUID();
    const data = {
      schemaVersion: 3,
      blanks: {
        [id]: { answer: 'x+2', correct: true },
      },
    };
    const result = SubmissionResponses.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('parses empty responses (student submitted nothing)', () => {
    const data = { schemaVersion: 3, blanks: {} };
    expect(SubmissionResponses.safeParse(data).success).toBe(true);
  });

  it('parses responses with optional confidence and checkpointResults', () => {
    const blankId = crypto.randomUUID();
    const sectionId = crypto.randomUUID();
    const data = {
      schemaVersion: 3,
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

  it('parses a plot_point graphResponse', () => {
    const graphId = crypto.randomUUID();
    const data = {
      schemaVersion: 3,
      blanks: {},
      graphResponses: {
        [graphId]: {
          type: 'plot_point',
          studentPoints: [[3, 4]],
          correct: true,
          confidence: 'think_so',
        },
      },
    };
    expect(SubmissionResponses.safeParse(data).success).toBe(true);
  });

  it('parses a plot_function graphResponse', () => {
    const graphId = crypto.randomUUID();
    const data = {
      schemaVersion: 3,
      blanks: {},
      graphResponses: {
        [graphId]: {
          type: 'plot_function',
          studentPoints: [[0, 3], [1, 5]],
          correct: true,
        },
      },
    };
    expect(SubmissionResponses.safeParse(data).success).toBe(true);
  });

  it('parses a shade_region graphResponse', () => {
    const graphId = crypto.randomUUID();
    const data = {
      schemaVersion: 3,
      blanks: {},
      graphResponses: {
        [graphId]: {
          type: 'shade_region',
          studentPoints: [[0, 0], [4, 0], [2, 3]],
          correct: true,
        },
      },
    };
    expect(SubmissionResponses.safeParse(data).success).toBe(true);
  });

  it('rejects a graphResponse with a non-tuple point', () => {
    const graphId = crypto.randomUUID();
    const data = {
      schemaVersion: 3,
      blanks: {},
      graphResponses: {
        [graphId]: { type: 'plot_point', studentPoints: [[3]], correct: false },
      },
    };
    expect(SubmissionResponses.safeParse(data).success).toBe(false);
  });

  it('rejects an unknown graph interaction type', () => {
    const graphId = crypto.randomUUID();
    const data = {
      schemaVersion: 3,
      blanks: {},
      graphResponses: {
        [graphId]: { type: 'plot_line', studentPoints: [[0, 0]], correct: true },
      },
    };
    expect(SubmissionResponses.safeParse(data).success).toBe(false);
  });

  it('rejects non-uuid blank keys', () => {
    const data = {
      schemaVersion: 3,
      blanks: { 'not-a-uuid': { answer: 'x', correct: false } },
    };
    expect(SubmissionResponses.safeParse(data).success).toBe(false);
  });

  it('rejects missing schemaVersion', () => {
    const data = { blanks: {} };
    expect(SubmissionResponses.safeParse(data).success).toBe(false);
  });

  it('rejects schemaVersion: 2 directly (must use migrateSubmissionResponses)', () => {
    const data = { schemaVersion: 2, blanks: {} };
    expect(SubmissionResponses.safeParse(data).success).toBe(false);
  });

  it('rejects schemaVersion: 1 directly (must use migrateSubmissionResponses)', () => {
    const data = { schemaVersion: 1, blanks: {} };
    expect(SubmissionResponses.safeParse(data).success).toBe(false);
  });

  it('rejects an invalid confidence value', () => {
    const id = crypto.randomUUID();
    const data = {
      schemaVersion: 3,
      blanks: { [id]: { answer: 'x+2', correct: true, confidence: 'maybe' } },
    };
    expect(SubmissionResponses.safeParse(data).success).toBe(false);
  });
});

describe('legacy shapes (for migration only)', () => {
  it('parses old v1 shape', () => {
    const id = crypto.randomUUID();
    const data = {
      schemaVersion: 1,
      blanks: { [id]: { answer: 'x+2', correct: true } },
    };
    expect(SubmissionResponsesV1.safeParse(data).success).toBe(true);
  });

  it('parses old v2 shape', () => {
    const id = crypto.randomUUID();
    const data = {
      schemaVersion: 2,
      blanks: { [id]: { answer: 'x+2', correct: true, confidence: 'certain' } },
    };
    expect(SubmissionResponsesV2.safeParse(data).success).toBe(true);
  });
});

describe('migrateSubmissionResponses', () => {
  it('reads a v3 submission unchanged (incl. graphResponses)', () => {
    const blankId = crypto.randomUUID();
    const graphId = crypto.randomUUID();
    const v3 = {
      schemaVersion: 3 as const,
      blanks: { [blankId]: { answer: 'x+2', correct: true } },
      graphResponses: {
        [graphId]: {
          type: 'plot_point' as const,
          studentPoints: [[3, 4] as [number, number]],
          correct: true,
        },
      },
    };
    const result = migrateSubmissionResponses(v3);
    expect(result.schemaVersion).toBe(3);
    expect(result.blanks).toEqual(v3.blanks);
    expect(result.graphResponses).toEqual(v3.graphResponses);
  });

  it('migrates a v2 submission to v3, preserving checkpointResults', () => {
    const blankId = crypto.randomUUID();
    const sectionId = crypto.randomUUID();
    const v2 = {
      schemaVersion: 2,
      blanks: { [blankId]: { answer: 'x+2', correct: true } },
      checkpointResults: {
        [sectionId]: { checkedAt: '2024-01-15T10:30:00.000Z', score: 4, total: 5 },
      },
    };
    const result = migrateSubmissionResponses(v2);
    expect(result.schemaVersion).toBe(3);
    expect(result.blanks).toEqual(v2.blanks);
    expect(result.checkpointResults).toEqual(v2.checkpointResults);
    expect(result.graphResponses).toBeUndefined();
  });

  it('migrates a v1 submission to v3', () => {
    const id = crypto.randomUUID();
    const v1 = {
      schemaVersion: 1,
      blanks: { [id]: { answer: 'x+2', correct: true } },
    };
    const result = migrateSubmissionResponses(v1);
    expect(result.schemaVersion).toBe(3);
    expect(result.blanks).toEqual(v1.blanks);
    expect(result.checkpointResults).toBeUndefined();
    expect(result.graphResponses).toBeUndefined();
  });

  it('throws on a malformed input', () => {
    expect(() => migrateSubmissionResponses({ garbage: true })).toThrow();
  });

  it('throws on an unknown schemaVersion', () => {
    expect(() => migrateSubmissionResponses({ schemaVersion: 99, blanks: {} })).toThrow();
  });
});
