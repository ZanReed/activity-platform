// =============================================================================
// vector.test.ts — free vectors (arrowhead Drop 2): the `vector dx, dy` parser,
// the displacement scorer, and the authored-mistake matcher. The three share
// one notion of "the same vector", so they are pinned together.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { formatVector, parseVector } from '../src/formula.js';
import { scoreVector } from '../src/graph-score.js';
import { compileMistakeMatchers, matchAuthoredMistake } from '../src/mistakes.js';

describe('parseVector', () => {
  it('reads components, negatives and decimals', () => {
    expect(parseVector('vector 3, 2')).toEqual({ kind: 'vector', dx: 3, dy: 2 });
    expect(parseVector('vector -3, -2')).toEqual({ kind: 'vector', dx: -3, dy: -2 });
    expect(parseVector('Vector 0, -1.5')).toEqual({ kind: 'vector', dx: 0, dy: -1.5 });
    expect(parseVector('vector −4, 1')).toEqual({ kind: 'vector', dx: -4, dy: 1 }); // unicode minus
  });

  it('refuses the zero vector (author ruling 2026-10-09)', () => {
    expect(parseVector('vector 0, 0').kind).toBe('error');
  });

  it('refuses brackets — a bracketed pair is a POINT, which a free vector is not', () => {
    expect(parseVector('vector (3, 2)').kind).toBe('error');
  });

  it('refuses anything that is not exactly two components', () => {
    for (const bad of ['vector 3', 'vector 3, 2, 1', 'vector', 'vector a, b', '3, 2']) {
      expect(parseVector(bad).kind, bad).toBe('error');
    }
  });

  it('round-trips through formatVector', () => {
    expect(parseVector(formatVector({ dx: -2.5, dy: 4 }))).toEqual({ kind: 'vector', dx: -2.5, dy: 4 });
  });
});

describe('scoreVector — displacement only, in drawn order', () => {
  const key = { dx: 3, dy: 2, tolerance: 0.1 };
  it('is right wherever it is drawn', () => {
    expect(scoreVector(key, [[0, 0], [3, 2]])).toBe(true);
    expect(scoreVector(key, [[-8, 5], [-5, 7]])).toBe(true);
  });
  it('is wrong reversed, swapped, or off by more than the tolerance', () => {
    expect(scoreVector(key, [[3, 2], [0, 0]])).toBe(false);
    expect(scoreVector(key, [[0, 0], [2, 3]])).toBe(false);
    expect(scoreVector(key, [[0, 0], [3.2, 2]])).toBe(false);
  });
  it('accepts a difference inside the tolerance', () => {
    expect(scoreVector(key, [[0, 0], [3.05, 1.95]])).toBe(true);
  });
  it('needs exactly two points', () => {
    expect(scoreVector(key, [[0, 0]])).toBe(false);
    expect(scoreVector(key, [[0, 0], [3, 2], [6, 4]])).toBe(false);
  });
});

describe('vector mistakes match exactly what the scorer would', () => {
  const matchers = compileMistakeMatchers(['vector -3, -2', 'vector 2, 3', 'y = x', 'vector 0, 0'], {
    interactionType: 'plot_vector',
    pointTolerance: 0.1,
  });
  const hit = (pts: [number, number][]) => matchAuthoredMistake(matchers, { points: pts });
  it('a reversed vector matches the reversed mistake, drawn anywhere', () => {
    expect(hit([[5, 5], [2, 3]])).toBe(0);
  });
  it('swapped components match the swap', () => {
    expect(hit([[0, 0], [2, 3]])).toBe(1);
  });
  it('non-vector and zero-vector match strings never match', () => {
    expect(hit([[0, 0], [1, 1]])).toBeNull();
    expect(hit([[1, 1], [1, 1]])).toBeNull();
  });
});
