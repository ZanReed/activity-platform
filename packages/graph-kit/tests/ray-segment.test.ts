// =============================================================================
// ray-segment.test.ts — student shape-toggle model: scoring, parsing, classifiers
// -----------------------------------------------------------------------------
// The student plots TWO handles, then CHOOSES the shape (ray →/← or segment)
// and the visible endpoint styles. The shape is a graded part — never
// pre-drawn — so scorers take the LinearPieceStudentAnswer (canonical points +
// shape + styles).
// =============================================================================
import { describe, it, expect } from 'vitest';
import {
  scoreRay,
  scoreRayParts,
  scoreRayPartial,
  scoreSegment,
  scoreSegmentParts,
  rayKeyShape,
  canonicalPair,
  type RayAnswerKey,
  type SegmentAnswerKey,
  type LinearPieceStudentAnswer,
} from '../src/graph-score.js';
import { parseRaySegment, formatRay, formatSegment } from '../src/formula.js';
import { classifyRayMistake, classifySegmentMistake } from '../src/mistakes.js';

// Key: ray from (1,2) through (3,4) — extends toward +x, endpoint open.
const rayKey: RayAnswerKey = {
  from: [1, 2],
  through: [3, 4],
  fromStyle: 'open',
  tolerance: 0.25,
};

const ans = (
  points: [number, number][],
  shape: LinearPieceStudentAnswer['shape'],
  endpointStyles: ('open' | 'closed')[] = [],
): LinearPieceStudentAnswer => ({ points, shape, endpointStyles });

describe('rayKeyShape / canonicalPair', () => {
  it('derives the expected shape from the key direction (incl. vertical = up)', () => {
    expect(rayKeyShape(rayKey)).toBe('ray_positive');
    expect(rayKeyShape({ ...rayKey, through: [-1, 0] })).toBe('ray_negative');
    expect(rayKeyShape({ ...rayKey, from: [2, 1], through: [2, 5] })).toBe('ray_positive'); // up
    expect(rayKeyShape({ ...rayKey, from: [2, 5], through: [2, 1] })).toBe('ray_negative'); // down
  });

  it('orders pairs lesser-first by x then y', () => {
    expect(canonicalPair([3, 0], [-1, 2])).toEqual([[-1, 2], [3, 0]]);
    expect(canonicalPair([2, 5], [2, 1])).toEqual([[2, 1], [2, 5]]);
  });
});

describe('scoreRay (shape model)', () => {
  it('full marks: right line, right shape, right endpoint style', () => {
    // Canonical points [(1,2), (5,6)] — both on the key line; shape ray_positive
    // makes the LESSER handle (1,2) the endpoint, styled open.
    expect(scoreRay(rayKey, ans([[1, 2], [5, 6]], 'ray_positive', ['open']))).toBe(true);
  });

  it('parts are independent: wrong shape / wrong placement / wrong style', () => {
    const right: [number, number][] = [[1, 2], [5, 6]];
    expect(scoreRayParts(rayKey, ans(right, 'ray_negative', ['open'])))
      .toEqual({ shape: false, placement: true, style: false });
    // ray_negative styles the GREATER handle — the key's endpoint (1,2) shows
    // no style, so the style part is lost too. Segment with both styles open
    // keeps style while losing shape:
    expect(scoreRayParts(rayKey, ans(right, 'segment', ['open', 'closed'])))
      .toEqual({ shape: false, placement: true, style: true });
    expect(scoreRayParts(rayKey, ans([[0, 0], [4, 4]], 'ray_positive', ['open'])))
      .toEqual({ shape: true, placement: false, style: false });
    expect(scoreRayParts(rayKey, ans(right, 'ray_positive', ['closed'])))
      .toEqual({ shape: true, placement: true, style: false });
  });

  it('no shape chosen = unanswered shape/style parts, placement still earnable', () => {
    const parts = scoreRayParts(rayKey, ans([[1, 2], [5, 6]], null));
    expect(parts).toEqual({ shape: false, placement: true, style: false });
    expect(scoreRayPartial(rayKey, ans([[1, 2], [5, 6]], null))).toEqual({ earned: 1, total: 3 });
  });

  it('placement accepts the second handle on EITHER side (direction is the shape part)', () => {
    // Handles at (1,2) and (-1,0): same line, second handle on the negative
    // side — placement ok; the chosen shape supplies the direction.
    expect(scoreRayParts(rayKey, ans([[-1, 0], [1, 2]], 'ray_positive', ['open'])).placement).toBe(true);
  });

  it('rejects a nearby but distinct grid direction and degenerate handles', () => {
    expect(scoreRayParts(rayKey, ans([[1, 2], [3, 6]], 'ray_positive', ['open'])).placement).toBe(false);
    expect(scoreRayParts(rayKey, ans([[1, 2], [1, 2]], 'ray_positive', ['open'])).placement).toBe(false);
  });
});

describe('scoreSegment (shape model)', () => {
  const key: SegmentAnswerKey = {
    from: [-2, 0],
    to: [3, 2],
    endpoints: ['open', 'closed'],
    tolerance: 0.25,
  };

  it('full marks with canonical points + styles aligned', () => {
    expect(scoreSegment(key, ans([[-2, 0], [3, 2]], 'segment', ['open', 'closed']))).toBe(true);
  });

  it('shape is its own part; a ray choice loses shape AND styles (not shown)', () => {
    const p = scoreSegmentParts(key, ans([[-2, 0], [3, 2]], 'ray_positive', ['open']));
    expect(p.shape).toBe(false);
    expect(p.positions).toBe(2);
    expect(p.styles).toBe(0);
    expect(p).toMatchObject({ earned: 2, total: 5 });
  });

  it('unchosen shape earns positions only', () => {
    expect(scoreSegmentParts(key, ans([[-2, 0], [3, 2]], null))).toMatchObject({
      earned: 2,
      total: 5,
    });
  });

  it('one endpoint off costs one position part', () => {
    expect(
      scoreSegmentParts(key, ans([[-2, 0], [4, 2]], 'segment', ['open', 'closed'])).earned,
    ).toBe(4);
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

describe('ray/segment mistake classifiers (shape model)', () => {
  const right: [number, number][] = [[1, 2], [5, 6]];

  it('unchosen shape with a right line → choose-the-shape nudge', () => {
    expect(classifyRayMistake(rayKey, ans(right, null))).toMatch(/choose its shape/);
  });

  it('opposite ray direction → arrow nudge', () => {
    expect(classifyRayMistake(rayKey, ans(right, 'ray_negative', ['open'])))
      .toMatch(/which way the arrow/);
  });

  it('segment chosen on a ray question (styles right) → shape nudge', () => {
    expect(classifyRayMistake(rayKey, ans(right, 'segment', ['open', 'open'])))
      .toMatch(/shape you chose/);
  });

  it('style-only miss → endpoint style nudge, never teaching the convention', () => {
    const msg = classifyRayMistake(rayKey, ans(right, 'ray_positive', ['closed']))!;
    expect(msg).toMatch(/style of the endpoint/);
    expect(msg).not.toMatch(/includ|exclud|hollow|filled/);
  });

  it('segment: shape+styles right, endpoints off → position nudge; positions right, styles off → style nudge', () => {
    const key: SegmentAnswerKey = {
      from: [-2, 0], to: [3, 2], endpoints: ['open', 'closed'], tolerance: 0.25,
    };
    expect(classifySegmentMistake(key, ans([[-2, 1], [4, 2]], 'segment', ['open', 'closed'])))
      .toMatch(/where the segment starts/);
    expect(classifySegmentMistake(key, ans([[-2, 0], [3, 2]], 'segment', ['closed', 'closed'])))
      .toMatch(/endpoint styles/);
    expect(classifySegmentMistake(key, ans([[-2, 0], [3, 2]], null)))
      .toMatch(/choose the shape/);
  });
});
