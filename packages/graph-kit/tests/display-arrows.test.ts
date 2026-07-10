// =============================================================================
// display-arrows.test.ts — continuation-arrow geometry (pure)
// =============================================================================
import { describe, it, expect } from 'vitest';
import {
  curveEndArrows,
  rayArrowSpec,
  verticalArrowSpecs,
  arrowLength,
} from '../src/display-arrows.js';

const win = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
// Tips sit a small inset (1.5% of the window span = 0.3 units here) inside the
// exact boundary so the marker head isn't clipped by the viewport.
const near = (a: number, b: number, eps = 0.45): void => {
  expect(Math.abs(a - b)).toBeLessThanOrEqual(eps);
};

describe('curveEndArrows', () => {
  it('shallow line exits through the window SIDES', () => {
    // y = 0.5x: inside everywhere → tips at x = ±10.
    const specs = curveEndArrows((x) => 0.5 * x, -10, 10, win, { first: true, last: true });
    expect(specs).toHaveLength(2);
    const [last, first] = specs;
    near(last!.tip[0], 10);
    near(last!.tip[1], 5);
    near(first!.tip[0], -10);
    near(first!.tip[1], -5);
  });

  it('steep line exits through the TOP/BOTTOM, not at the x-edges', () => {
    // y = 2x + 3 leaves a ±10 window at y = ±10 (x = 3.5 / −6.5) — an arrow
    // parked at x = ±10 would be off-screen.
    const specs = curveEndArrows((x) => 2 * x + 3, -10, 10, win, { first: true, last: true });
    expect(specs).toHaveLength(2);
    const [last, first] = specs;
    near(last!.tip[1], 10);
    near(last!.tip[0], 3.5);
    near(first!.tip[1], -10);
    near(first!.tip[0], -6.5);
  });

  it('parabola exits through the top on both ends', () => {
    const specs = curveEndArrows((x) => x * x - 4, -10, 10, win, { first: true, last: true });
    expect(specs).toHaveLength(2);
    for (const s of specs) {
      near(s.tip[1], 10);
      // Arrow heads outward (tail below tip on a rising exit).
      expect(s.tail[1]).toBeLessThan(s.tip[1]);
    }
  });

  it('a bounded end is suppressed (dot territory, not arrow)', () => {
    // y = x² − 4 for x ≥ 0: closed dot at (0, −4) → only the last end arrows.
    const specs = curveEndArrows((x) => x * x - 4, 0, 10, win, { first: false, last: true });
    expect(specs).toHaveLength(1);
    near(specs[0]!.tip[1], 10);
  });

  it('log curve: the first-end arrow rides the plunge to the window bottom', () => {
    // Drawn across the full window: x ≤ 0 → NaN/−∞. refineTip subsamples
    // toward the asymptote, so the arrow sits where the curve exits the
    // bottom (y = −10 at x = e⁻¹⁰ ≈ 4.5e−5), hugging the y-axis.
    const specs = curveEndArrows((x) => Math.log(x), -10, 10, win, { first: true, last: true });
    expect(specs).toHaveLength(2);
    const first = specs[1]!;
    expect(first.tip[0]).toBeGreaterThan(0);
    expect(first.tip[0]).toBeLessThan(0.35);
    near(first.tip[1], -10);
  });

  it('a curve entirely outside the window yields no arrows', () => {
    const specs = curveEndArrows((x) => x + 100, -10, 10, win, { first: true, last: true });
    expect(specs).toHaveLength(0);
  });
});

describe('rayArrowSpec', () => {
  it('arrowhead sits where the ray exits the window', () => {
    const s = rayArrowSpec([0, 0], [2, 1], win)!;
    near(s.tip[0], 10);
    near(s.tip[1], 5);
    // Tail backs off along the ray direction.
    expect(s.tail[0]).toBeLessThan(s.tip[0]);
  });

  it('steep ray exits the top', () => {
    const s = rayArrowSpec([0, 0], [1, 3], win)!;
    near(s.tip[1], 10);
  });

  it('degenerate and never-visible rays yield null', () => {
    expect(rayArrowSpec([1, 1], [1, 1], win)).toBeNull();
    expect(rayArrowSpec([20, 20], [30, 30], win)).toBeNull();
  });
});

describe('verticalArrowSpecs', () => {
  it('arrows at both y-edges (inset) when the line is visible', () => {
    const specs = verticalArrowSpecs(3, win);
    expect(specs).toHaveLength(2);
    near(specs[0]!.tip[1], 10);
    near(specs[1]!.tip[1], -10);
    expect(specs[0]!.tip[0]).toBe(3);
  });
  it('off-window line yields none', () => {
    expect(verticalArrowSpecs(99, win)).toHaveLength(0);
  });
});

describe('arrowLength', () => {
  it('scales with the window', () => {
    expect(arrowLength(win)).toBeCloseTo(0.8);
    expect(arrowLength({ xMin: 0, xMax: 5, yMin: 0, yMax: 100 })).toBeCloseTo(0.2);
  });
});
