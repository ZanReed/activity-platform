import { describe, it, expect } from 'vitest';
import { SubmissionResponses } from '../src/index.js';

describe('SubmissionResponses', () => {
  it('parses valid responses keyed by uuid', () => {
    const id = crypto.randomUUID();
    const data = {
      schemaVersion: 1,
      blanks: {
        [id]: { answer: 'x+2', correct: true },
      },
    };
    const result = SubmissionResponses.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('parses empty responses (student submitted nothing)', () => {
    const data = { schemaVersion: 1, blanks: {} };
    expect(SubmissionResponses.safeParse(data).success).toBe(true);
  });

  it('rejects non-uuid blank keys', () => {
    const data = {
      schemaVersion: 1,
      blanks: {
        'not-a-uuid': { answer: 'x', correct: false },
      },
    };
    expect(SubmissionResponses.safeParse(data).success).toBe(false);
  });

  it('rejects missing schemaVersion', () => {
    const data = { blanks: {} };
    expect(SubmissionResponses.safeParse(data).success).toBe(false);
  });
});
