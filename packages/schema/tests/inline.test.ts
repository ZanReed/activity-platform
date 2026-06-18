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
