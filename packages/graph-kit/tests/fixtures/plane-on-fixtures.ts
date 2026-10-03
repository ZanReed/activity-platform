// Fixtures for the plane-on byte-identity regression (y7-figures §8,
// "Regression rule"): every figure that exists today renders with the plane
// ON, and must keep rendering byte-identically after the geometry slice.
// `plane-on-golden.json` was captured from the engine at 9ea2e84, BEFORE the
// slice touched it — never regenerate it to make a red test green.
const AXIS = { xMin: -5, xMax: 5, yMin: -5, yMax: 5, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true };
const line = (slope: number, intercept: number) => ({
  kind: 'curve',
  model: { family: 'linear', slope, intercept, slopeTolerance: 0.1, interceptTolerance: 0.1 },
});
export const PLANE_ON_FIXTURES: Array<{ name: string; axis: Record<string, unknown>; drawables: unknown[]; color?: string }> = [
  { name: 'empty', axis: AXIS, drawables: [] },
  { name: 'parallel-lines', axis: AXIS, drawables: [line(2, 1), line(2, -3)] },
  { name: 'parabola', axis: { ...AXIS, yMin: -1, yMax: 9 }, drawables: [{ kind: 'curve', model: { family: 'quadratic', a: 1, b: 0, c: 0 } }] },
  { name: 'ray', axis: AXIS, drawables: [{ kind: 'ray', from: [1, -3], through: [3, -1] }] },
  { name: 'segment-open', axis: AXIS, drawables: [{ kind: 'segment', from: [-4, -2], to: [0, 2], endpoints: ['open', 'closed'], color: 'red' }] },
  { name: 'point-label', axis: AXIS, drawables: [{ kind: 'point', at: [2, 3], style: 'closed', label: 'A' }] },
  { name: 'polygon-filled', axis: AXIS, drawables: [{ kind: 'polygon', vertices: [[0, 0], [3, 0], [1, 3]], filled: true, color: 'green' }] },
  { name: 'polygon-outline', axis: AXIS, drawables: [{ kind: 'polygon', vertices: [[0, 0], [3, 0], [1, 3]], filled: false }] },
  { name: 'vertical-shaded', axis: AXIS, drawables: [{ kind: 'curve', model: { family: 'vertical', x: 1 }, shade: 'left', style: 'dashed' }] },
  { name: 'inequality', axis: AXIS, drawables: [{ ...line(1, 1), shade: 'above', style: 'dashed' }] },
  { name: 'domain', axis: AXIS, drawables: [{ ...line(-1, 0), domain: { min: -2, minStyle: 'open', max: 3 } }] },
  { name: 'wide-window', axis: { ...AXIS, xMin: -20, xMax: 20, yMin: -2, yMax: 6, xGridStep: 0.1 }, drawables: [line(0.5, 1)] },
  { name: 'no-axis-in-window', axis: { ...AXIS, xMin: 2, xMax: 12, yMin: 3, yMax: 9, showGrid: false }, drawables: [{ kind: 'point', at: [5, 5] }] },
  { name: 'ink-default', axis: AXIS, drawables: [line(1, 0), { kind: 'expression', expression: 'sin(x)' }], color: '#000000' },
];
