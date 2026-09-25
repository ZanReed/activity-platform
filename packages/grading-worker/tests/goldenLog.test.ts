// The W-7 start gate, mutation-tested the day it was written (house rule:
// guards bound to output): the refusal path is exercised directly, not
// assumed — a gate that cannot be seen refusing is not a gate.
import { describe, expect, it } from 'vitest';
import {
  parseGoldenLog,
  isValidatedTuple,
  assertValidatedTuple,
  type GoldenEntry,
} from '../src/goldenLog.ts';
import { parseCheckIds } from '../src/checkIds.ts';

const logged: GoldenEntry[] = [
  { promptRev: 1, schemaRev: 1, modelId: 'qwen3-32b', ranAt: '2026-09-25', fixtures: 8 },
];

describe('golden-log gate (W-7)', () => {
  it('REFUSES an unlogged tuple with the runbook pointer', () => {
    expect(() =>
      assertValidatedTuple(logged, { promptRev: 2, schemaRev: 1, modelId: 'qwen3-32b' }, false),
    ).toThrow(/REFUSING TO RUN[\s\S]*golden/);
    expect(() =>
      assertValidatedTuple(logged, { promptRev: 1, schemaRev: 1, modelId: 'other-model' }, false),
    ).toThrow(/REFUSING TO RUN/);
  });

  it('passes a logged tuple silently', () => {
    expect(
      assertValidatedTuple(logged, { promptRev: 1, schemaRev: 1, modelId: 'qwen3-32b' }, false),
    ).toBeNull();
  });

  it('--allow-unvalidated returns a MANDATORY warning, never silence', () => {
    const warning = assertValidatedTuple(
      logged,
      { promptRev: 9, schemaRev: 9, modelId: 'experiment' },
      true,
    );
    expect(warning).toMatch(/UNVALIDATED TUPLE/);
    expect(warning).toMatch(/model experiment/);
  });

  it('tuple matching is exact on all three keys', () => {
    expect(isValidatedTuple(logged, { promptRev: 1, schemaRev: 1, modelId: 'qwen3-32b' })).toBe(
      true,
    );
    expect(isValidatedTuple(logged, { promptRev: 1, schemaRev: 2, modelId: 'qwen3-32b' })).toBe(
      false,
    );
  });

  it('parseGoldenLog refuses a non-array', () => {
    expect(() => parseGoldenLog('{}')).toThrow(/array/);
    expect(parseGoldenLog('[]')).toEqual([]);
  });
});

describe('parseCheckIds (study input)', () => {
  it('accepts newline and JSON forms, dedupes, skips comments', () => {
    const id = '33333333-3333-4333-8333-333333333333';
    expect(parseCheckIds(`# batch one\n${id}\n${id}\n`)).toEqual([id]);
    expect(parseCheckIds(`["${id}"]`)).toEqual([id]);
  });

  it('refuses non-uuid lines loudly (a typo is not a "dropped" id)', () => {
    expect(() => parseCheckIds('not-a-uuid')).toThrow(/not check ids/);
  });
});
