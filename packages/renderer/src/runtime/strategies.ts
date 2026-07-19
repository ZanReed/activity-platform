// =============================================================================
// runtime/strategies.ts — Answer evaluation strategies
// -----------------------------------------------------------------------------
// Each strategy answers one question: "given a trimmed, non-empty typed value
// and the blank element's metadata, is the answer correct?" Strategies are
// pure boolean checks — they read only data-* attributes off the blank, never
// touch the wider DOM, and never handle empty input (the caller does that).
//
// Phase 1 shipped only 'list'. 'numeric' (this file) landed with numeric
// blanks: parse both sides as numbers (decimals, fractions, mixed numbers,
// commas, leading $) and compare within data-blank-tolerance. Phase 2.5
// (parameterized problems) may add 'expression' (math.js-style equivalence)
// and possibly 'computed' (a variant-aware answer key). Adding a strategy is
// one entry in `strategies` plus the renderer emitting
// data-blank-strategy="<name>" on the input — no changes to gatherResponses
// or checkBlank.
//
// `evaluateAnswer` is exported (beyond the runtime's own use) so the pure-
// function test suite can exercise the dispatch + fallback without a DOM.
// =============================================================================

type Strategy = (input: Element, typed: string) => boolean;

// ---- math (Model B math blanks) — the HELD SYNC REFERENCE -------------------
// A 'math' blank is graded by expression equivalence (2a ≡ a+a), which needs the
// math.js engine that lives ONLY in the lazy graph-kit. We do NOT make scoring
// async (the whole check/gather path is sync and re-scores at submit — see
// docs/design/math-blanks.md A1). Instead the runtime eager-loads the kit and
// hands the pure, synchronous mathEquivalent function here via setMathEquivalent.
// Until it arrives, a math blank scores `null` (unscored) rather than guessing.
export type MathEquivalentFn = (
  student: string,
  key: string,
  opts: { mode?: 'value' | 'exact-form'; tolerance?: number },
) => boolean;

let mathEquivalentRef: MathEquivalentFn | null = null;

/** Called by the math-blank preloader once the graph-kit resolves. */
export function setMathEquivalent(fn: MathEquivalentFn): void {
  mathEquivalentRef = fn;
}

/** Whether the kit's mathEquivalent is loaded (so 'math' blanks can be graded). */
export function isMathReady(): boolean {
  return mathEquivalentRef !== null;
}

// Tri-state: true/false once the kit is loaded, `null` while it isn't (unscored,
// not wrong — the value still submits; see A2). Not part of the sync `strategies`
// record because it needs the held reference and the null case.
function scoreMath(input: Element, typed: string): boolean | null {
  if (!mathEquivalentRef) return null; // kit not loaded yet — unscored
  const mode =
    input.getAttribute('data-blank-equivalence') === 'exact-form'
      ? 'exact-form'
      : 'value';
  const tolRaw = input.getAttribute('data-blank-tolerance');
  const tolParsed = tolRaw === null ? 0 : Number(tolRaw);
  const tolerance = isFinite(tolParsed) && tolParsed >= 0 ? tolParsed : 0;
  const answers = (input.getAttribute('data-blank-answers') || '').split('|');
  for (let i = 0; i < answers.length; i++) {
    const key = answers[i];
    if (key && mathEquivalentRef(typed, key, { mode, tolerance })) return true;
  }
  return false;
}

// `list` is named separately so the fallback path can reference it directly,
// without an index lookup into `strategies` that TypeScript (correctly, under
// noUncheckedIndexedAccess) types as possibly undefined.
const listStrategy: Strategy = (input, typed) => {
  const answers = (input.getAttribute('data-blank-answers') || '').split('|');
  return answers.indexOf(typed) !== -1;
};

// ---- numeric ---------------------------------------------------------------
// Parses a student-typed value (or an answer-key entry) into a number.
// Accepted forms, chosen for what students actually type in math class:
//   "3", "-2.5", ".75", "+4"      plain decimals (optional sign, bare dot ok)
//   "1e3", "2.5E-2"               scientific notation
//   "3/4", "-3/4", "1.5/3"        fractions (numerator/denominator)
//   "1 1/2", "-2 3/4"             mixed numbers (whole part + fraction)
//   "1,234.5"                     comma thousands separators (stripped)
//   "$3.50"                       a single leading dollar sign (stripped)
// Returns null for anything else — the caller treats null as "not a number"
// and falls back to exact string comparison so a non-numeric key entry
// (e.g. "no solution") still scores. Exported for the pure test suite.
const DECIMAL_RE = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
const FRACTION_RE = /^([+-]?(?:\d+\.?\d*|\.\d+))\/((?:\d+\.?\d*|\.\d+))$/;
const MIXED_RE = /^([+-]?)(\d+) +(\d+)\/(\d+)$/;

export function parseNumericValue(raw: string): number | null {
  let s = raw.trim();
  if (s.charAt(0) === '$') s = s.slice(1).trim();
  // Commas are treated as thousands separators and stripped. (US convention;
  // the platform's number formatting is US-style throughout.)
  s = s.replace(/,/g, '');
  if (s.length === 0) return null;

  const mixed = MIXED_RE.exec(s);
  if (mixed) {
    const sign = mixed[1] === '-' ? -1 : 1;
    const whole = Number(mixed[2]);
    const num = Number(mixed[3]);
    const den = Number(mixed[4]);
    if (den === 0) return null;
    return sign * (whole + num / den);
  }

  const frac = FRACTION_RE.exec(s);
  if (frac) {
    const num = Number(frac[1]);
    const den = Number(frac[2]);
    if (den === 0) return null;
    return num / den;
  }

  if (DECIMAL_RE.test(s)) {
    const n = Number(s);
    return isFinite(n) ? n : null;
  }

  return null;
}

// Compares numerically when both sides parse; falls back to exact string
// equality per key entry otherwise. Tolerance is absolute (|typed - key| <=
// tolerance), default 0; the 1e-9 epsilon absorbs float noise so an exact-
// tolerance answer like 0.3 vs 0.1+0.2 doesn't fail on representation error.
const numericStrategy: Strategy = (input, typed) => {
  const typedValue = parseNumericValue(typed);
  const tolRaw = input.getAttribute('data-blank-tolerance');
  const tolParsed = tolRaw === null ? 0 : Number(tolRaw);
  const tolerance = isFinite(tolParsed) && tolParsed >= 0 ? tolParsed : 0;
  const answers = (input.getAttribute('data-blank-answers') || '').split('|');
  for (let i = 0; i < answers.length; i++) {
    const entry = answers[i];
    if (entry === undefined) continue;
    const entryValue = parseNumericValue(entry);
    if (entryValue !== null && typedValue !== null) {
      if (Math.abs(typedValue - entryValue) <= tolerance + 1e-9) return true;
    } else if (entry === typed) {
      return true;
    }
  }
  return false;
};

const strategies: Record<string, Strategy> = {
  list: listStrategy,
  numeric: numericStrategy,
};

export function evaluateAnswer(input: Element, typed: string): boolean | null {
  const name = input.getAttribute('data-blank-strategy') || 'list';
  // 'math' is tri-state (null while the kit loads); handled before the sync
  // strategy record.
  if (name === 'math') {
    return scoreMath(input, typed);
  }
  const strategy = strategies[name];
  if (strategy) {
    return strategy(input, typed);
  }
  // Misconfigured activity. Don't break submission for students — warn
  // (visible in DevTools) and fall back to list comparison so existing
  // data-blank-answers still scores something.
  if (typeof console !== 'undefined') {
    console.warn('Unknown blank strategy "' + name + '", falling back to list');
  }
  return listStrategy(input, typed);
}
