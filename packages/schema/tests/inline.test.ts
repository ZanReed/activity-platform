// Inline-node schema coverage. Lives in tests/ (the active suite — the schema
// vitest config only globs tests/**, so src/__tests__/* does NOT run; see the
// flagged orphaned-test-files cleanup). Imports the public API from src/index.
import { describe, it, expect } from 'vitest';
import { BlankToken, createBlankToken } from '../src/index.js';

const BLANK_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('BlankToken — order-independent grouping', () => {
  it('defaults interchangeableWithPrevious to false', () => {
    const parsed = BlankToken.parse({
      type: 'blank',
      id: BLANK_ID,
      answer: '2',
      acceptableAnswers: [],
    });
    expect(parsed.interchangeableWithPrevious).toBe(false);
  });

  it('accepts interchangeableWithPrevious: true', () => {
    const parsed = BlankToken.parse({
      type: 'blank',
      id: BLANK_ID,
      answer: '3',
      acceptableAnswers: [],
      interchangeableWithPrevious: true,
    });
    expect(parsed.interchangeableWithPrevious).toBe(true);
  });

  it('factory produces a schema-valid token with the flag defaulted off', () => {
    const token = createBlankToken('x+2');
    expect(token.interchangeableWithPrevious).toBe(false);
    expect(() => BlankToken.parse(token)).not.toThrow();
  });
});

describe('BlankToken — numeric answer mode', () => {
  it('answerType and tolerance are absent by default (old docs re-serialize unchanged)', () => {
    const parsed = BlankToken.parse({
      type: 'blank',
      id: BLANK_ID,
      answer: '12',
      acceptableAnswers: [],
    });
    expect(parsed.answerType).toBeUndefined();
    expect(parsed.tolerance).toBeUndefined();
    expect('answerType' in parsed).toBe(false);
  });

  it('accepts answerType numeric with a tolerance', () => {
    const parsed = BlankToken.parse({
      type: 'blank',
      id: BLANK_ID,
      answer: '3.14',
      acceptableAnswers: [],
      answerType: 'numeric',
      tolerance: 0.01,
    });
    expect(parsed.answerType).toBe('numeric');
    expect(parsed.tolerance).toBe(0.01);
  });

  it('rejects a negative tolerance and unknown answer types', () => {
    const base = {
      type: 'blank',
      id: BLANK_ID,
      answer: '3',
      acceptableAnswers: [],
    };
    expect(() =>
      BlankToken.parse({ ...base, answerType: 'numeric', tolerance: -1 }),
    ).toThrow();
    expect(() =>
      BlankToken.parse({ ...base, answerType: 'expression' }),
    ).toThrow();
  });
});

describe('BlankToken — math answer mode (Model B)', () => {
  it('accepts answerType math with an equivalence mode and tolerance', () => {
    const parsed = BlankToken.parse({
      type: 'blank',
      id: BLANK_ID,
      answer: '2a',
      acceptableAnswers: [],
      answerType: 'math',
      equivalence: 'exact-form',
      tolerance: 0.001,
    });
    expect(parsed.answerType).toBe('math');
    expect(parsed.equivalence).toBe('exact-form');
    expect(parsed.tolerance).toBe(0.001);
  });

  it('equivalence defaults to absent (= value) and rejects unknown modes', () => {
    const parsed = BlankToken.parse({
      type: 'blank',
      id: BLANK_ID,
      answer: '2a',
      acceptableAnswers: [],
      answerType: 'math',
    });
    expect(parsed.equivalence).toBeUndefined();
    expect(() =>
      BlankToken.parse({
        type: 'blank',
        id: BLANK_ID,
        answer: '2a',
        acceptableAnswers: [],
        answerType: 'math',
        equivalence: 'symbolic',
      }),
    ).toThrow();
  });

  // REGRESSION PIN (math-blanks.md A1): adding 'math' + equivalence must leave
  // text/numeric blanks byte-identical on re-parse — the new fields stay ABSENT.
  it('text and numeric blanks re-serialize byte-identically (no math fields leak in)', () => {
    const textBlank = {
      type: 'blank',
      id: BLANK_ID,
      answer: 'Paris',
      acceptableAnswers: ['paris'],
      interchangeableWithPrevious: false,
    };
    const numericBlank = {
      type: 'blank',
      id: BLANK_ID,
      answer: '3.14',
      acceptableAnswers: [],
      interchangeableWithPrevious: false,
      answerType: 'numeric' as const,
      tolerance: 0.01,
    };
    for (const input of [textBlank, numericBlank]) {
      const parsed = BlankToken.parse(input);
      expect('equivalence' in parsed).toBe(false);
      expect(JSON.parse(JSON.stringify(parsed))).toEqual(input);
    }
  });
});
