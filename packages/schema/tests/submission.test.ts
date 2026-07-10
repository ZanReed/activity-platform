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

describe('SubmissionResponses (v6 — current)', () => {
  it('parses valid responses keyed by uuid', () => {
    const id = crypto.randomUUID();
    const data = {
      schemaVersion: 6,
      blanks: {
        [id]: { answer: 'x+2', correct: true },
      },
    };
    const result = SubmissionResponses.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('parses empty responses (student submitted nothing)', () => {
    const data = { schemaVersion: 6, blanks: {} };
    expect(SubmissionResponses.safeParse(data).success).toBe(true);
  });

  it('parses responses with optional confidence and checkpointResults', () => {
    const blankId = crypto.randomUUID();
    const sectionId = crypto.randomUUID();
    const data = {
      schemaVersion: 6,
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
      schemaVersion: 6,
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
      schemaVersion: 6,
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
      schemaVersion: 6,
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
      schemaVersion: 6,
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
      schemaVersion: 6,
      blanks: {},
      graphResponses: {
        [graphId]: { type: 'plot_line', studentPoints: [[0, 0]], correct: true },
      },
    };
    expect(SubmissionResponses.safeParse(data).success).toBe(false);
  });

  it('rejects non-uuid blank keys', () => {
    const data = {
      schemaVersion: 6,
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
      schemaVersion: 6,
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
  it('migrates a v4 submission (incl. graphResponses) to v6', () => {
    const blankId = crypto.randomUUID();
    const graphId = crypto.randomUUID();
    const v4 = {
      schemaVersion: 4 as const,
      blanks: { [blankId]: { answer: 'x+2', correct: true } },
      graphResponses: {
        [graphId]: {
          type: 'plot_point' as const,
          studentPoints: [[3, 4] as [number, number]],
          correct: true,
        },
      },
    };
    const result = migrateSubmissionResponses(v4);
    expect(result.schemaVersion).toBe(6);
    expect(result.blanks).toEqual(v4.blanks);
    expect(result.graphResponses).toEqual(v4.graphResponses);
    expect(result.choices).toBeUndefined();
  });

  it('migrates a v2 submission to v6, preserving checkpointResults', () => {
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
    expect(result.schemaVersion).toBe(6);
    expect(result.blanks).toEqual(v2.blanks);
    expect(result.checkpointResults).toEqual(v2.checkpointResults);
    expect(result.graphResponses).toBeUndefined();
  });

  it('migrates a v1 submission to v6', () => {
    const id = crypto.randomUUID();
    const v1 = {
      schemaVersion: 1,
      blanks: { [id]: { answer: 'x+2', correct: true } },
    };
    const result = migrateSubmissionResponses(v1);
    expect(result.schemaVersion).toBe(6);
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

describe('v4 additions (Drop 4)', () => {
  it('parses a graph_inequality response with v4 extras', () => {
    const parsed = SubmissionResponses.safeParse({
      schemaVersion: 6,
      blanks: {},
      graphResponses: {
        '11111111-1111-4111-8111-111111111111': {
          type: 'graph_inequality',
          studentPoints: [[0, 1], [1, 3]],
          strict: true,
          side: 'above',
          correct: true,
          earned: 3,
          total: 3,
        },
      },
    });
    expect(parsed.success).toBe(true);
  });

  it('parses a no-solution plot_point response (empty points)', () => {
    const parsed = SubmissionResponses.safeParse({
      schemaVersion: 6,
      blanks: {},
      graphResponses: {
        '11111111-1111-4111-8111-111111111111': {
          type: 'plot_point',
          studentPoints: [],
          correct: true,
          noSolution: true,
        },
      },
    });
    expect(parsed.success).toBe(true);
  });

  it('migrates a v3 submission (graphResponses intact) to v6', () => {
    const out = migrateSubmissionResponses({
      schemaVersion: 3,
      blanks: {},
      graphResponses: {
        '11111111-1111-4111-8111-111111111111': {
          type: 'plot_point',
          studentPoints: [[1, 2]],
          correct: true,
        },
      },
    });
    expect(out.schemaVersion).toBe(6);
    expect(Object.keys(out.graphResponses ?? {})).toHaveLength(1);
  });

  it('accepts a fractional checkpoint score (partial credit)', () => {
    const parsed = SubmissionResponses.safeParse({
      schemaVersion: 6,
      blanks: {},
      checkpointResults: {
        '22222222-2222-4222-8222-222222222222': {
          checkedAt: new Date().toISOString(),
          score: 2.67,
          total: 3,
        },
      },
    });
    expect(parsed.success).toBe(true);
  });
});

describe('v5 additions (multiple choice)', () => {
  const mcId = '33333333-3333-4333-8333-333333333333';
  const choiceA = '44444444-4444-4444-8444-444444444444';
  const choiceB = '55555555-5555-4555-8555-555555555555';

  it('parses a single-select choices response', () => {
    const parsed = SubmissionResponses.safeParse({
      schemaVersion: 6,
      blanks: {},
      choices: {
        [mcId]: { selected: [choiceA], correct: true, confidence: 'certain' },
      },
    });
    expect(parsed.success).toBe(true);
  });

  it('parses a multi-select choices response (several ids)', () => {
    const parsed = SubmissionResponses.safeParse({
      schemaVersion: 6,
      blanks: {},
      choices: {
        [mcId]: { selected: [choiceA, choiceB], correct: false },
      },
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects an empty selected array (unanswered blocks are omitted, not empty)', () => {
    const parsed = SubmissionResponses.safeParse({
      schemaVersion: 6,
      blanks: {},
      choices: { [mcId]: { selected: [], correct: false } },
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects non-uuid selected ids', () => {
    const parsed = SubmissionResponses.safeParse({
      schemaVersion: 6,
      blanks: {},
      choices: { [mcId]: { selected: ['choice-1'], correct: true } },
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects schemaVersion 4 carrying a choices map (v4 had no such field... but zod strips)', () => {
    // v4 legacy schema silently strips unknown keys (Zod default), so a v4
    // post with a choices map migrates forward WITHOUT the choices data —
    // pin that this is the behavior (the v5 runtime always posts v5).
    const result = migrateSubmissionResponses({
      schemaVersion: 4,
      blanks: {},
      choices: { [mcId]: { selected: [choiceA], correct: true } },
    });
    expect(result.schemaVersion).toBe(6);
    expect(result.choices).toBeUndefined();
  });
});

describe('v6 additions (matching + ordering)', () => {
  const matchId = '66666666-6666-4666-8666-666666666666';
  const orderId = '77777777-7777-4777-8777-777777777777';
  const itemA = '88888888-8888-4888-8888-888888888888';
  const itemB = '99999999-9999-4999-8999-999999999999';
  const targetA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const targetB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  it('parses a matches response with per-pair earned/total', () => {
    const parsed = SubmissionResponses.safeParse({
      schemaVersion: 6,
      blanks: {},
      matches: {
        [matchId]: {
          pairs: { [itemA]: targetA, [itemB]: targetB },
          correct: false,
          earned: 1,
          total: 2,
          confidence: 'think_so',
        },
      },
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects an empty pairs record (unanswered blocks are omitted, not empty)', () => {
    const parsed = SubmissionResponses.safeParse({
      schemaVersion: 6,
      blanks: {},
      matches: {
        [matchId]: { pairs: {}, correct: false, earned: 0, total: 2 },
      },
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a matches response missing earned/total (always present for matching)', () => {
    const parsed = SubmissionResponses.safeParse({
      schemaVersion: 6,
      blanks: {},
      matches: {
        [matchId]: { pairs: { [itemA]: targetA }, correct: true },
      },
    });
    expect(parsed.success).toBe(false);
  });

  it('parses an orderings response (full arrangement)', () => {
    const parsed = SubmissionResponses.safeParse({
      schemaVersion: 6,
      blanks: {},
      orderings: {
        [orderId]: { order: [itemB, itemA], correct: false },
      },
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects a one-item order (blocks have 2+ items; the full arrangement is submitted)', () => {
    const parsed = SubmissionResponses.safeParse({
      schemaVersion: 6,
      blanks: {},
      orderings: { [orderId]: { order: [itemA], correct: true } },
    });
    expect(parsed.success).toBe(false);
  });

  it('migrates a v5 submission (choices intact) to v6', () => {
    const mcId = '33333333-3333-4333-8333-333333333333';
    const choiceA = '44444444-4444-4444-8444-444444444444';
    const result = migrateSubmissionResponses({
      schemaVersion: 5,
      blanks: {},
      choices: { [mcId]: { selected: [choiceA], correct: true } },
    });
    expect(result.schemaVersion).toBe(6);
    expect(Object.keys(result.choices ?? {})).toHaveLength(1);
    expect(result.matches).toBeUndefined();
    expect(result.orderings).toBeUndefined();
  });
});
