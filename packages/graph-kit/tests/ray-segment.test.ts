// =============================================================================
// ray-segment.test.ts — plot_ray / plot_segment scoring, parsing, classifiers
// =============================================================================
import { describe, it, expect } from 'vitest';
import {
  scoreRay,
  scoreRayParts,
  scoreRayPartial,
  scoreSegment,
  scoreSegmentParts,
  type RayAnswerKey,
  type SegmentAnswerKey,
} from '../src/graph-score.js';
import { parseRaySegment, formatRay, formatSegment } from '../src/formula.js';
import { classifyRayMistake, classifySegmentMistake } from '../src/mistakes.js';

const rayKey: RayAnswerKey = {
  from: [1, 2],
  through: [3, 4],
  fromStyle: 'closed',
  tolerance: 0.25,
};

describe('scoreRay', () => {
  it('accepts the exact ray and any through-point along it', () => {
    expect(scoreRay(rayKey, { from: [1, 2], through: [3, 4], fromStyle: 'closed' })).toBe(true);
    // Farther along the same direction (slope 1).
    expect(scoreRay(rayKey, { from: [1, 2], through: [7, 8], fromStyle: 'closed' })).toBe(true);
  });

  it('rejects the opposite direction, wrong start, and wrong style — as parts', () => {
    expect(
      scoreRayParts(rayKey, { from: [1, 2], through: [-1, 0], fromStyle: 'closed' }),
    ).toEqual({ from: true, direction: false, style: true });
    expect(
      scoreRayParts(rayKey, { from: [0, 0], through: [2, 2], fromStyle: 'closed' }),
    ).toEqual({ from: false, direction: true, style: true });
    expect(
      scoreRayParts(rayKey, { from: [1, 2], through: [3, 4], fromStyle: 'open' }),
    ).toEqual({ from: true, direction: true, style: false });
  });

  it('rejects a nearby but distinct grid direction', () => {
    // Slope 1 vs slope 2 from the same start.
    expect(
      scoreRayParts(rayKey, { from: [1, 2], through: [3, 6], fromStyle: 'closed' }).direction,
    ).toBe(false);
  });

  it('degenerate (coincident handles) is never a correct direction', () => {
    expect(
      scoreRayParts(rayKey, { from: [1, 2], through: [1, 2], fromStyle: 'closed' }).direction,
    ).toBe(false);
  });

  it('partial credit: 3 parts', () => {
    expect(
      scoreRayPartial(rayKey, { from: [1, 2], through: [-1, 0], fromStyle: 'open' }),
    ).toEqual({ earned: 1, total: 3 });
  });
});

describe('scoreSegment', () => {
  const key: SegmentAnswerKey = {
    from: [-2, 0],
    to: [3, 2],
    endpoints: ['open', 'closed'],
    tolerance: 0.25,
  };

  it('accepts the segment drawn in either direction (styles travel with endpoints)', () => {
    expect(
      scoreSegment(key, { from: [-2, 0], to: [3, 2], endpoints: ['open', 'closed'] }),
    ).toBe(true);
    // Reversed: from/to swapped AND the styles swapped with them.
    expect(
      scoreSegment(key, { from: [3, 2], to: [-2, 0], endpoints: ['closed', 'open'] }),
    ).toBe(true);
  });

  it('reversed positions with unswapped styles lose the style parts', () => {
    expect(
      scoreSegmentParts(key, { from: [3, 2], to: [-2, 0], endpoints: ['open', 'closed'] }),
    ).toEqual({ earned: 2, total: 4 });
  });

  it('one endpoint off costs one position part', () => {
    expect(
      scoreSegmentParts(key, { from: [-2, 0], to: [4, 2], endpoints: ['open', 'closed'] }),
    ).toEqual({ earned: 3, total: 4 });
  });
});

describe('parseRaySegment / formatters', () => {
  it('parses rays with optional style and filler words', () => {
    expect(parseRaySegment('ray (1, 2) through (3, 4)')).toEqual({
      kind: 'ray', from: [1, 2], through: [3, 4], fromStyle: 'closed',
    });
    expect(parseRaySegment('ray (1,2) (3,4) open')).toEqual({
      kind: 'ray', from: [1, 2], through: [3, 4], fromStyle: 'open',
    });
  });

  it('parses segments with per-endpoint styles', () => {
    expect(parseRaySegment('segment (1, 2) to (3, 4) open closed')).toEqual({
      kind: 'segment', from: [1, 2], to: [3, 4], endpoints: ['open', 'closed'],
    });
    expect(parseRaySegment('segment (-2, 0) (3, 2)')).toEqual({
      kind: 'segment', from: [-2, 0], to: [3, 2], endpoints: ['closed', 'closed'],
    });
  });

  it('rejects missing points, coincident points, and unknown shapes', () => {
    expect(parseRaySegment('ray (1, 2)').kind).toBe('error');
    expect(parseRaySegment('ray (1, 2) through (1, 2)').kind).toBe('error');
    expect(parseRaySegment('line (1, 2) (3, 4)').kind).toBe('error');
  });

  it('formatRay / formatSegment round-trip through the parser', () => {
    const ray = { from: [1, 2] as [number, number], through: [3, 4] as [number, number], fromStyle: 'open' as const };
    expect(parseRaySegment(formatRay(ray))).toEqual({ kind: 'ray', ...ray });
    const seg = {
      from: [-2, 0] as [number, number],
      to: [3, 2] as [number, number],
      endpoints: ['open', 'closed'] as ['open', 'closed'],
    };
    expect(parseRaySegment(formatSegment(seg))).toEqual({ kind: 'segment', ...seg });
  });
});

describe('ray/segment mistake classifiers', () => {
  it('names the reversed-direction mistake', () => {
    expect(
      classifyRayMistake(rayKey, { from: [1, 2], through: [-1, 0], fromStyle: 'closed' }),
    ).toMatch(/opposite way/);
  });

  it('nudges the endpoint style without teaching the convention', () => {
    const msg = classifyRayMistake(rayKey, { from: [1, 2], through: [3, 4], fromStyle: 'open' })!;
    expect(msg).toMatch(/style/);
    expect(msg).not.toMatch(/includ|exclud|hollow|filled/);
  });

  it('segment: right place wrong styles → style nudge; right styles wrong place → position nudge', () => {
    const key: SegmentAnswerKey = {
      from: [-2, 0], to: [3, 2], endpoints: ['open', 'closed'], tolerance: 0.25,
    };
    expect(
      classifySegmentMistake(key, { from: [-2, 0], to: [3, 2], endpoints: ['closed', 'closed'] }),
    ).toMatch(/endpoint styles/);
    expect(
      classifySegmentMistake(key, { from: [-2, 1], to: [4, 2], endpoints: ['open', 'closed'] }),
    ).toMatch(/where the segment starts/);
  });
});
