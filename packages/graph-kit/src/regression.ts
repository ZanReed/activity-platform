// =============================================================================
// regression.ts — the least-squares engine (Stage 3)
// -----------------------------------------------------------------------------
// Pure math, no DOM: (x, y) points in, fitted coefficients + r² out. Standalone
// by design — the calculator's data panel consumes it today; the future graded
// "line of best fit" block scores with the SAME engine (the pre-emptive move in
// docs/design/calculator-tool.md). All three fits are closed-form; the full
// math.js with matrices is deliberately NOT pulled in.
//
// Conventions match the TI-84 / Desmos a student has next to them (the design
// doc's "feel at home" requirement):
//   linear       y = ax + b          r² = 1 − SSres/SStot on the data
//   quadratic    y = ax² + bx + c    R² = 1 − SSres/SStot on the data
//   cubic        y = ax³ + … + d     R², same convention (TI-84 CubicReg)
//   quartic      y = ax⁴ + … + e     R², same convention (TI-84 QuartReg)
//   exponential  y = a·bˣ            fitted log-linearly (ln y = ln a + x·ln b);
//                                    r² reported on the LOG-TRANSFORMED fit —
//                                    what TI-84 ExpReg and Desmos both report. A
//                                    different r² than the handheld breaks the
//                                    at-home feeling instantly.
//
// Errors are student-safe strings (shown verbatim in the panel); the y > 0
// requirement for exponential is the first edge a student hits, so it gets a
// clear message instead of NaN.
// =============================================================================

export type RegressionModel =
  | 'linear'
  | 'quadratic'
  | 'exponential'
  | 'logarithmic';

export interface DataPoint {
  x: number;
  y: number;
}

export type Fit =
  | { model: 'linear'; a: number; b: number; r2: number }
  | { model: 'quadratic'; a: number; b: number; c: number; r2: number }
  | { model: 'cubic'; a: number; b: number; c: number; d: number; r2: number }
  | { model: 'quartic'; a: number; b: number; c: number; d: number; e: number; r2: number }
  | { model: 'exponential'; a: number; b: number; r2: number }
  | { model: 'logarithmic'; a: number; b: number; r2: number };

export type FitOutcome =
  | { ok: true; fit: Fit; predict: (x: number) => number }
  | { ok: false; error: string };

const fail = (error: string): FitOutcome => ({ ok: false, error });

function distinctXCount(points: DataPoint[]): number {
  return new Set(points.map((p) => p.x)).size;
}

// 1 − SSres/SStot. When SStot is 0 (all y identical) the ratio is undefined:
// a perfect fit reports 1, anything else 0 — the TI behavior for degenerate data.
function rSquared(residualSS: number, totalSS: number): number {
  if (totalSS === 0) return residualSS < 1e-12 ? 1 : 0;
  return 1 - residualSS / totalSS;
}

function linearLeastSquares(
  pts: DataPoint[],
): { slope: number; intercept: number; r2: number } | null {
  const n = pts.length;
  let sx = 0,
    sy = 0,
    sxx = 0,
    sxy = 0;
  for (const p of pts) {
    sx += p.x;
    sy += p.y;
    sxx += p.x * p.x;
    sxy += p.x * p.y;
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return null; // all x equal — a vertical line has no y = ax + b
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  const meanY = sy / n;
  let ssRes = 0,
    ssTot = 0;
  for (const p of pts) {
    ssRes += (p.y - (slope * p.x + intercept)) ** 2;
    ssTot += (p.y - meanY) ** 2;
  }
  return { slope, intercept, r2: rSquared(ssRes, ssTot) };
}

// Solve the symmetric 3×3 normal equations by Gaussian elimination with partial
// pivoting. Returns null when the system is singular (fewer than 3 distinct x).
function solve3x3(m: number[][], rhs: number[]): number[] | null {
  const a = m.map((row, i) => [...row, rhs[i] ?? 0]);
  for (let col = 0; col < 3; col++) {
    let pivot = col;
    for (let r = col + 1; r < 3; r++) {
      if (Math.abs(a[r]?.[col] ?? 0) > Math.abs(a[pivot]?.[col] ?? 0)) pivot = r;
    }
    const pivotRow = a[pivot];
    const colRow = a[col];
    if (!pivotRow || !colRow) return null;
    if (Math.abs(pivotRow[col] ?? 0) < 1e-12) return null;
    if (pivot !== col) {
      a[pivot] = colRow;
      a[col] = pivotRow;
    }
    const base = a[col];
    if (!base) return null;
    for (let r = col + 1; r < 3; r++) {
      const row = a[r];
      if (!row) return null;
      const factor = (row[col] ?? 0) / (base[col] ?? 1);
      for (let c = col; c < 4; c++) row[c] = (row[c] ?? 0) - factor * (base[c] ?? 0);
    }
  }
  const out = [0, 0, 0];
  for (let r = 2; r >= 0; r--) {
    const row = a[r];
    if (!row) return null;
    let sum = row[3] ?? 0;
    for (let c = r + 1; c < 3; c++) sum -= (row[c] ?? 0) * (out[c] ?? 0);
    out[r] = sum / (row[r] ?? 1);
  }
  return out;
}

// Solve an n×n system by Gaussian elimination with partial pivoting — the same
// algorithm as solve3x3, sized for the polynomial normal equations (solve3x3
// stays as-is: fitQuadratic is long-settled code and keeps its own path).
// Returns null when the system is singular.
function solveN(m: number[][], rhs: number[]): number[] | null {
  const n = rhs.length;
  const a = m.map((row, i) => [...row, rhs[i] ?? 0]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(a[r]?.[col] ?? 0) > Math.abs(a[pivot]?.[col] ?? 0)) pivot = r;
    }
    const pivotRow = a[pivot];
    const colRow = a[col];
    if (!pivotRow || !colRow) return null;
    if (Math.abs(pivotRow[col] ?? 0) < 1e-12) return null;
    if (pivot !== col) {
      a[pivot] = colRow;
      a[col] = pivotRow;
    }
    const base = a[col];
    if (!base) return null;
    for (let r = col + 1; r < n; r++) {
      const row = a[r];
      if (!row) return null;
      const factor = (row[col] ?? 0) / (base[col] ?? 1);
      for (let c = col; c <= n; c++) row[c] = (row[c] ?? 0) - factor * (base[c] ?? 0);
    }
  }
  const out = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    const row = a[r];
    if (!row) return null;
    let sum = row[n] ?? 0;
    for (let c = r + 1; c < n; c++) sum -= (row[c] ?? 0) * (out[c] ?? 0);
    out[r] = sum / (row[r] ?? 1);
  }
  return out;
}

// Degree-general polynomial least squares (normal equations over power sums).
// Coefficients HIGHEST power first: p(x) = c[0]·x^degree + … + c[degree].
// Needs degree+1 distinct x-values; null when the system is singular. The
// graded families expose cubic and quartic; the engine is general so a future
// family is one wrapper, not new math.
function polynomialLeastSquares(
  points: DataPoint[],
  degree: number,
): number[] | null {
  const n = degree + 1;
  // Power sums S_k = Σ xᵏ (k = 0 … 2·degree) and moments T_r = Σ xʳ·y.
  const S = new Array<number>(2 * degree + 1).fill(0);
  const T = new Array<number>(n).fill(0);
  for (const p of points) {
    let xp = 1;
    for (let k = 0; k <= 2 * degree; k++) {
      S[k] = (S[k] ?? 0) + xp;
      if (k <= degree) T[k] = (T[k] ?? 0) + xp * p.y;
      xp *= p.x;
    }
  }
  // Row r (for the coefficient of x^(degree−r)): Σ_j c_j·S[2·degree−r−j] = T[degree−r].
  const m: number[][] = [];
  const rhs: number[] = [];
  for (let r = 0; r < n; r++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) row.push(S[2 * degree - r - j] ?? 0);
    m.push(row);
    rhs.push(T[degree - r] ?? 0);
  }
  return solveN(m, rhs);
}

function fitPolynomial(
  points: DataPoint[],
  degree: number,
): { coeffs: number[]; r2: number; predict: (x: number) => number } | null {
  const coeffs = polynomialLeastSquares(points, degree);
  if (!coeffs) return null;
  const predict = (x: number): number => {
    let y = 0;
    for (const c of coeffs) y = y * x + c;
    return y;
  };
  let sy = 0;
  for (const p of points) sy += p.y;
  const meanY = sy / points.length;
  let ssRes = 0,
    ssTot = 0;
  for (const p of points) {
    ssRes += (p.y - predict(p.x)) ** 2;
    ssTot += (p.y - meanY) ** 2;
  }
  return { coeffs, r2: rSquared(ssRes, ssTot), predict };
}

export function fitLinear(points: DataPoint[]): FitOutcome {
  if (points.length < 2) return fail('Add at least 2 points');
  if (distinctXCount(points) < 2)
    return fail('Points need at least 2 different x-values');
  const ls = linearLeastSquares(points);
  if (!ls) return fail('Points need at least 2 different x-values');
  const { slope: a, intercept: b, r2 } = ls;
  return {
    ok: true,
    fit: { model: 'linear', a, b, r2 },
    predict: (x) => a * x + b,
  };
}

export function fitQuadratic(points: DataPoint[]): FitOutcome {
  if (points.length < 3) return fail('Add at least 3 points');
  if (distinctXCount(points) < 3)
    return fail('Points need at least 3 different x-values');
  let sx = 0, sx2 = 0, sx3 = 0, sx4 = 0, sy = 0, sxy = 0, sx2y = 0;
  const n = points.length;
  for (const p of points) {
    const x2 = p.x * p.x;
    sx += p.x;
    sx2 += x2;
    sx3 += x2 * p.x;
    sx4 += x2 * x2;
    sy += p.y;
    sxy += p.x * p.y;
    sx2y += x2 * p.y;
  }
  const solved = solve3x3(
    [
      [sx4, sx3, sx2],
      [sx3, sx2, sx],
      [sx2, sx, n],
    ],
    [sx2y, sxy, sy],
  );
  if (!solved) return fail('Points need at least 3 different x-values');
  const [a = 0, b = 0, c = 0] = solved;
  const meanY = sy / n;
  let ssRes = 0,
    ssTot = 0;
  for (const p of points) {
    ssRes += (p.y - (a * p.x * p.x + b * p.x + c)) ** 2;
    ssTot += (p.y - meanY) ** 2;
  }
  return {
    ok: true,
    fit: { model: 'quadratic', a, b, c, r2: rSquared(ssRes, ssTot) },
    predict: (x) => a * x * x + b * x + c,
  };
}

export function fitCubic(points: DataPoint[]): FitOutcome {
  if (points.length < 4) return fail('Add at least 4 points');
  if (distinctXCount(points) < 4)
    return fail('Points need at least 4 different x-values');
  const out = fitPolynomial(points, 3);
  if (!out) return fail('Points need at least 4 different x-values');
  const [a = 0, b = 0, c = 0, d = 0] = out.coeffs;
  return {
    ok: true,
    fit: { model: 'cubic', a, b, c, d, r2: out.r2 },
    predict: out.predict,
  };
}

export function fitQuartic(points: DataPoint[]): FitOutcome {
  if (points.length < 5) return fail('Add at least 5 points');
  if (distinctXCount(points) < 5)
    return fail('Points need at least 5 different x-values');
  const out = fitPolynomial(points, 4);
  if (!out) return fail('Points need at least 5 different x-values');
  const [a = 0, b = 0, c = 0, d = 0, e = 0] = out.coeffs;
  return {
    ok: true,
    fit: { model: 'quartic', a, b, c, d, e, r2: out.r2 },
    predict: out.predict,
  };
}

export function fitExponential(points: DataPoint[]): FitOutcome {
  if (points.length < 2) return fail('Add at least 2 points');
  if (points.some((p) => p.y <= 0))
    return fail('Exponential fit needs every y-value above 0');
  if (distinctXCount(points) < 2)
    return fail('Points need at least 2 different x-values');
  // Log-linear: ln y = ln a + (ln b)·x. r² comes from THIS linear fit (the
  // TI-84/Desmos convention), not from residuals in y-space.
  const logPts = points.map((p) => ({ x: p.x, y: Math.log(p.y) }));
  const ls = linearLeastSquares(logPts);
  if (!ls) return fail('Points need at least 2 different x-values');
  const a = Math.exp(ls.intercept);
  const b = Math.exp(ls.slope);
  return {
    ok: true,
    fit: { model: 'exponential', a, b, r2: ls.r2 },
    predict: (x) => a * Math.pow(b, x),
  };
}

export function fitLogarithmic(points: DataPoint[]): FitOutcome {
  if (points.length < 2) return fail('Add at least 2 points');
  if (points.some((p) => p.x <= 0))
    return fail('Logarithmic fit needs every x-value above 0');
  if (distinctXCount(points) < 2)
    return fail('Points need at least 2 different x-values');
  // y = a + b·ln(x) is linear in u = ln(x): fit y = intercept + slope·u, then
  // a = intercept, b = slope. r² comes from this linear fit (same convention as
  // the other transformed fit, exponential).
  const logPts = points.map((p) => ({ x: Math.log(p.x), y: p.y }));
  const ls = linearLeastSquares(logPts);
  if (!ls) return fail('Points need at least 2 different x-values');
  const a = ls.intercept;
  const b = ls.slope;
  return {
    ok: true,
    fit: { model: 'logarithmic', a, b, r2: ls.r2 },
    predict: (x) => a + b * Math.log(x),
  };
}

/** Dispatch by model — the one entry point the data panel (and the future
 * graded block) calls. */
export function fitModel(model: RegressionModel, points: DataPoint[]): FitOutcome {
  switch (model) {
    case 'linear':
      return fitLinear(points);
    case 'quadratic':
      return fitQuadratic(points);
    case 'exponential':
      return fitExponential(points);
    case 'logarithmic':
      return fitLogarithmic(points);
  }
}
