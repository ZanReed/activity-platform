// =============================================================================
// math-form.ts — "equivalent AND in the stated form" (form grading, D60)
// -----------------------------------------------------------------------------
// Design: docs/design/form-grading.md (FG-1..FG-14, amendments A1..A5, ruled
// 2026-11-14). Four pure pieces, in the order a grader calls them:
//
//   1. tokenizeMath  — FG-3 + A4. Reads a run of letters as a product of single
//      letters (`12ab` → `12*a*b`), a letter before a bracket as a product
//      (`x(x+2)` → `x*(x+2)`), a letter before digits as a product (`x2` →
//      `x*2`), MathLive's fraction coefficient as ONE factor (`(2)/(3)x` →
//      `((2)/(3))*x`) and three mixed-number spellings as their improper
//      fraction (`1 1/3`, `1⅓`, MathLive's `1(1)/(3)` → `(4/3)`). Run in EVERY
//      math blank, value mode included (each rewrite fixes a live defect: a
//      parse failure or a misreading that marked a right answer wrong). It is
//      idempotent, so a caller may tokenize once and hand the result on.
//      The vulgar-fraction glyphs (½ ⅓ …) are read HERE and nowhere else —
//      normalize.ts's NFKC exclusion stands (A4).
//   2. the bound — FG-14. The grader runs its expression-safety check on the
//      TOKENIZED string (so 256 letters count as 255 multiplications), and this
//      file caps the shape tree's size and depth on top (MAX_SHAPE_NODES,
//      MAX_SHAPE_DEPTH): every shape is built from a bounded tree or not at all.
//   3. the shape — FG-2 (+ A2, A3). A canonical string for an expression's
//      parsed tree up to a CLOSED list of harmless rewrites (FORM_REWRITES
//      below — every addition is a reviewed line, the normalize.ts discipline).
//      Key-side folding (FG-6) runs first on a key: constant folding of
//      all-number +, ×, negation subtrees (never `/`) and a short clean-up list.
//   4. the predicate — formEquivalent: value-equivalent (math-equivalent.ts's
//      sampling) AND the same shape. Form-match ⇒ value-match by construction.
//
// Pure: no DOM, no I/O, `mathjs/number` only (through evaluate.ts). Exported
// through the `@activity/graph-kit/scorers` subpath, NEVER the barrel.
// =============================================================================

import { normalizeAsciiMath, PROVIDED_NAMES, parseNormalized } from './evaluate.js';

/** Bumped whenever FORM_REWRITES or the tokenizer changes meaning. Also the
 * deploy marker: grep the downloaded function source for it (form-grading.md
 * → "Bundles and deploys"). */
export const FORM_REWRITES_REV = 1;

/** The closed list (FG-2 rules 1–10 as amended by A2–A4), as data so a test can
 * pin that the code and the doc name the same rules. */
export const FORM_REWRITES: readonly string[] = Object.freeze([
  '1 parentheses, spacing and multiplication spelling are not shape',
  '2 + and × are flattened and their operands sorted',
  '3 subtraction is adding a negative; a sign on a number is the number’s sign',
  '4 number leaves compare by value and are never folded together (student side)',
  '5 division stays division; one sign moves to the front, two signs stay',
  '6 powers are not products',
  '7 precedence is math.js’s: -2^2 is -(2^2)',
  '8 a MathLive fraction coefficient is one factor; a mixed number is its improper fraction (A4)',
  '9 a product over a NUMERIC denominator is that fraction as a coefficient (A2)',
  '10 negating two factors of a product is the same shape: canonical sign per bracket (A3)',
]);

/** Cap on shape-tree nodes (FG-14). Far above any authored answer (`6(3x-2)` is
 * 7 nodes); the student side is already bounded to 64 operators by the grader. */
export const MAX_SHAPE_NODES = 256;
/** Cap on shape-tree depth (FG-14). A left-associated chain counts as depth,
 * so this sits above the grader's 64-operator cap on a student value. */
export const MAX_SHAPE_DEPTH = 96;

// ---- 1. the tokenizer --------------------------------------------------------

/** Vulgar-fraction glyphs → MathLive's own fraction spelling, so a glyph after
 * an integer is a mixed number by the same rule as `2(1)/(3)` (A4). */
const VULGAR: ReadonlyMap<string, string> = new Map([
  ['½', '(1)/(2)'], ['⅓', '(1)/(3)'], ['⅔', '(2)/(3)'], ['¼', '(1)/(4)'],
  ['¾', '(3)/(4)'], ['⅕', '(1)/(5)'], ['⅖', '(2)/(5)'], ['⅗', '(3)/(5)'],
  ['⅘', '(4)/(5)'], ['⅙', '(1)/(6)'], ['⅚', '(5)/(6)'], ['⅐', '(1)/(7)'],
  ['⅛', '(1)/(8)'], ['⅜', '(3)/(8)'], ['⅝', '(5)/(8)'], ['⅞', '(7)/(8)'],
  ['⅑', '(1)/(9)'], ['⅒', '(1)/(10)'],
]);
const VULGAR_RE = new RegExp(`[${[...VULGAR.keys()].join('')}]`, 'g');

/** Multiplication / division glyphs a keyboard can send (they fail to parse
 * today, so mapping them is widening-only). */
const OPERATOR_GLYPHS: ReadonlyMap<string, string> = new Map([
  // U+2212 is normalize.ts's job on every blank; repeated here so a direct
  // caller (a gap, a test, the importer) reads it the same way.
  ['−', '-'],
  ['×', '*'], ['·', '*'], ['⋅', '*'], ['∙', '*'], ['÷', '/'],
]);
const OPERATOR_GLYPH_RE = new RegExp(`[${[...OPERATOR_GLYPHS.keys()].join('')}]`, 'g');

/** Names that are a function when called (`sin(`), from the engine's own
 * provided set (derived, P4) plus the two names normalizeAsciiMath emits. */
const FUNCTION_NAMES: readonly string[] = [
  ...PROVIDED_NAMES.filter((n) => n !== 'pi' && n !== 'e'),
  'logBase',
  'nthRoot',
]
  .filter((n, i, all) => all.indexOf(n) === i)
  .sort((a, b) => b.length - a.length); // longest first
const FUNCTION_SET = new Set(FUNCTION_NAMES);

/** Largest whole part / numerator / denominator a mixed number is rewritten
 * for; beyond it the spelling is left alone (and fails to parse, as today). */
const MIXED_LIMIT = 1_000_000;

function improper(whole: string, num: string, den: string): string | null {
  const w = Number(whole);
  const n = Number(num);
  const d = Number(den);
  if (!(d > 0) || w > MIXED_LIMIT || n > MIXED_LIMIT || d > MIXED_LIMIT) return null;
  return `(${w * d + n}/${d})`;
}

// Mixed numbers. The whole part must stand alone: not after a letter, digit,
// point, closing bracket, `^` or `/` (so `x^2 1/2` and `6/2 1/3` are left to
// fail as today rather than guessed at).
const ALONE = String.raw`(?<![A-Za-z0-9.)^/_])`;
// (a) typed: integer, whitespace, n/m — `1 1/3`.
const MIXED_TYPED_RE = new RegExp(
  ALONE + String.raw`(\d+)\s+(\d+)\s*\/\s*(\d+)(?![\d.^(])`,
  'g',
);
// (b) MathLive / glyph: integer directly followed by `(n)/(m)` — `2(1)/(3)`.
const MIXED_MATHLIVE_RE = new RegExp(
  ALONE + String.raw`(\d+)\s*\((\d+)\)\/\((\d+)\)`,
  'g',
);

/** MathLive writes `\frac{2}{3}x` as `(2)/(3)x`, which math.js reads as
 * `2/(3x)`. Group a `(A)/(n)` with a NUMERIC denominator that is followed by a
 * letter, digit or bracket into one factor. The opening bracket must not belong
 * to a call (`sqrt(2)/(3)x` is left alone). */
function groupMathLiveFractions(s: string): string {
  const re = /\)\s*\/\s*\((\d+(?:\.\d+)?)\)(?=\s*[A-Za-z0-9(])/g;
  let out = s;
  let guard = 0;
  for (;;) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    let changed = false;
    while ((m = re.exec(out)) !== null) {
      const close = m.index; // the `)` that ends the numerator group
      let depth = 0;
      let open = -1;
      for (let i = close; i >= 0; i--) {
        const ch = out[i];
        if (ch === ')') depth++;
        else if (ch === '(') {
          depth--;
          if (depth === 0) {
            open = i;
            break;
          }
        }
      }
      if (open < 0) continue;
      // A bracket that belongs to a call is left alone (`sqrt(2)/(3)x`); one
      // after a coefficient or a letter is MathLive's `2\frac{x}{3}y` and is
      // grouped too (Fable review, step 1), as is one after a bracket.
      const head = out.slice(0, open);
      if (/[_.]$/.test(head)) continue;
      const word = /[A-Za-z]+$/.exec(head)?.[0];
      if (word !== undefined && FUNCTION_NAMES.some((f) => word.endsWith(f))) continue;
      // Already grouped by an earlier pass: `((A)/(n))`.
      if (head.endsWith('(') && out.slice(m.index + m[0].length).startsWith(')')) continue;
      const end = m.index + m[0].length;
      const group = out.slice(open, end);
      out = `${out.slice(0, open)}(${group})*${out.slice(end)}`;
      changed = true;
      break; // indices moved; rescan
    }
    if (!changed || ++guard > 32) return out;
  }
}

/** Split one letter run into single letters, keeping `pi` whole. */
function splitLetters(run: string): string[] {
  const parts: string[] = [];
  for (let i = 0; i < run.length; ) {
    if (run.startsWith('pi', i)) {
      parts.push('pi');
      i += 2;
    } else {
      parts.push(run[i] ?? '');
      i += 1;
    }
  }
  return parts;
}

/** The letters step: every identifier run becomes a product of single letters,
 * except a provided function name that is called (`sin(`, `sin x`), `pi`, the
 * infix `mod`, and an identifier with an underscore (`x_1`, left whole). A
 * non-function letter before `(` or before a digit multiplies. */
function splitIdentifiers(s: string): string {
  let out = '';
  let i = 0;
  while (i < s.length) {
    const ch = s[i] ?? '';
    // A number literal is consumed whole, so scientific notation (`1e3`) keeps
    // its `e`.
    if (/[0-9.]/.test(ch)) {
      const m = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(s.slice(i));
      const lit = m ? m[0] : ch;
      out += lit;
      i += lit.length;
      continue;
    }
    if (!/[A-Za-z]/.test(ch)) {
      out += ch;
      i += 1;
      continue;
    }
    const m = /^[A-Za-z0-9_]*/.exec(s.slice(i));
    const ident = m ? m[0] : ch;
    // Letters only (digits after a letter are their own factor).
    const letters = /^[A-Za-z]+/.exec(ident)?.[0] ?? ch;
    if (ident.includes('_')) {
      out += ident;
      i += ident.length;
      continue;
    }
    i += letters.length;
    const rest = s.slice(i);
    const callNext = /^\s*\(/.test(rest);
    const immediateCall = rest.startsWith('(');
    const spaceNext = /^\s+\S/.test(rest);
    // Letters are joined by a SPACE (math.js's implicit multiplication), never
    // by `*`: implicit multiplication binds tighter than `/`, so `1/ab` must
    // stay 1/(ab) — an explicit `*` would read it as b/a (Fable review of step
    // 1, the one major finding). After `^` the whole run is bracketed, so
    // `x^ab` stays x^(ab), as when `ab` was one symbol.
    let emitted: string[];
    let starAfter = false;
    if (letters === 'mod') {
      emitted = ['mod'];
    } else if (FUNCTION_SET.has(letters) && spaceNext && !callNext) {
      emitted = [letters]; // `sin x` — the engine's own reading, kept
    } else if (immediateCall && FUNCTION_NAMES.some((f) => letters.endsWith(f))) {
      const fn = FUNCTION_NAMES.find((f) => letters.endsWith(f)) ?? letters;
      emitted = [...splitLetters(letters.slice(0, letters.length - fn.length)), fn];
    } else {
      emitted = splitLetters(letters);
      // A letter before a bracket multiplies (`x(x+2)`, spaced or not) —
      // math.js reads `x(` as a CALL. An explicit `*` is used here: what it
      // replaces was always a broken call, so no reading that worked before
      // can move, and `x*(` is stable under a second pass.
      starAfter = callNext;
    }
    let run = emitted.join(' ');
    if (emitted.length > 1 && /\^\s*$/.test(out)) run = `(${run})`;
    if (starAfter) run += '*';
    // Space-separate from a neighbouring word or number so nothing re-merges
    // (`2 x`, `x 2`): a letter before digits multiplies (`x2` → `x 2`).
    if (/[A-Za-z0-9)]$/.test(out)) out += ' ';
    out += run;
    if (/^[0-9.]/.test(rest)) out += ' ';
  }
  return out;
}

/**
 * Read a math answer the way a Year 7–10 student writes it (FG-3, A4). Applied
 * to both sides of every math blank and gap. Idempotent. Empty in → empty out.
 */
export function tokenizeMath(input: string): string {
  let s = input.replace(OPERATOR_GLYPH_RE, (g) => OPERATOR_GLYPHS.get(g) ?? g);
  s = s.replace(VULGAR_RE, (g) => VULGAR.get(g) ?? g);
  s = normalizeAsciiMath(s);
  // normalizeAsciiMath re-pads `mod` on every pass; collapse it so the
  // tokenizer is idempotent (FG-14 length counts run on the tokenized string).
  s = s.replace(/\s*\bmod\b\s*/g, ' mod ');
  if (!s) return '';
  s = s.replace(MIXED_TYPED_RE, (all, w: string, n: string, d: string) => improper(w, n, d) ?? all);
  s = s.replace(MIXED_MATHLIVE_RE, (all, w: string, n: string, d: string) => improper(w, n, d) ?? all);
  s = groupMathLiveFractions(s);
  s = splitIdentifiers(s);
  return s.trim();
}

// ---- 2/3. the raw tree, the bound, key-side folding --------------------------

/** Our own small AST, converted from math.js's at once (bounded). */
type Raw =
  /** `s`: a SEED literal — a bracketed number, which is how bindSeedNames
   * writes every bound value (`(6)`), or the fold of one. Only these fold. */
  | { k: 'num'; v: number; s?: true }
  | { k: 'sym'; name: string }
  | { k: 'add' | 'sub' | 'mul' | 'div' | 'pow' | 'mod'; a: Raw; b: Raw }
  | { k: 'neg' | 'paren'; a: Raw }
  | { k: 'fn'; name: string; args: Raw[] };

interface MjNode {
  type?: string;
  value?: unknown;
  name?: string;
  fn?: unknown;
  op?: string;
  args?: MjNode[];
  content?: MjNode;
}

const BINARY: Record<string, 'add' | 'sub' | 'mul' | 'div' | 'pow' | 'mod'> = {
  add: 'add',
  subtract: 'sub',
  multiply: 'mul',
  divide: 'div',
  pow: 'pow',
  mod: 'mod',
};

function toRaw(node: MjNode, budget: { n: number }, depth: number): Raw | null {
  if (--budget.n < 0 || depth > MAX_SHAPE_DEPTH) return null;
  switch (node.type) {
    case 'ConstantNode':
      return typeof node.value === 'number' && Number.isFinite(node.value)
        ? { k: 'num', v: node.value }
        : null;
    case 'SymbolNode':
      return typeof node.name === 'string' ? { k: 'sym', name: node.name } : null;
    case 'ParenthesisNode': {
      const a = node.content ? toRaw(node.content, budget, depth + 1) : null;
      return a ? { k: 'paren', a } : null;
    }
    case 'FunctionNode': {
      const fn = node.fn as MjNode | undefined;
      if (!fn || fn.type !== 'SymbolNode' || typeof fn.name !== 'string') return null;
      const args: Raw[] = [];
      for (const arg of node.args ?? []) {
        const r = toRaw(arg, budget, depth + 1);
        if (!r) return null;
        args.push(r);
      }
      return { k: 'fn', name: fn.name, args };
    }
    case 'OperatorNode': {
      const fn = typeof node.fn === 'string' ? node.fn : '';
      const args = node.args ?? [];
      if (fn === 'unaryMinus' || fn === 'unaryPlus' || fn === 'factorial') {
        const a = args[0] ? toRaw(args[0], budget, depth + 1) : null;
        if (!a) return null;
        if (fn === 'unaryMinus') return { k: 'neg', a };
        if (fn === 'unaryPlus') return a;
        return { k: 'fn', name: 'factorial', args: [a] };
      }
      const kind = BINARY[fn];
      if (!kind || args.length !== 2 || !args[0] || !args[1]) return null;
      const a = toRaw(args[0], budget, depth + 1);
      const b = a ? toRaw(args[1], budget, depth + 1) : null;
      return a && b ? { k: kind, a, b } : null;
    }
    default:
      return null; // arrays, relations, assignments, accessors: never a form
  }
}

/** Parse an already-tokenized expression into the bounded raw tree. */
function parseRaw(tokenized: string): Raw | null {
  const node = parseNormalized(tokenized) as MjNode | null;
  if (!node || typeof node !== 'object') return null;
  return toRaw(node, { n: MAX_SHAPE_NODES }, 0);
}

const unparen = (r: Raw): Raw => (r.k === 'paren' ? unparen(r.a) : r);
const constOf = (r: Raw): number | null => {
  const u = unparen(r);
  return u.k === 'num' ? u.v : null;
};

/**
 * Key-side folding and clean-up (FG-6), bottom-up on the raw tree:
 * - every all-number `+`, `−`, `×` and negation subtree folds to one number
 *   (`((4)*(3))ab` → `12ab`), never `/` (a seeded `p/q` stays a fraction) and
 *   never `^`;
 * - `1*t` → `t`, `(-1)*t` → `-t`, `t^1` → `t`, `t^0` → `1`, `t+0`/`0+t` → `t`,
 *   `t-0` → `t`, `0-t` → `-t`, a `0*t` term → `0`, `-(-k)` → `k`;
 * - brackets around a lone number or letter go (`(6)` → `6`).
 * Each fold and clean-up needs a SEED number in it — a bracketed number, the
 * spelling bindSeedNames gives every bound value — so an authored literal key
 * (`3*4`, `1x`) keeps its form exactly as written.
 * The STUDENT side gets none of this: a student who writes `1x` or `4*3ab` has
 * not finished simplifying.
 */
function foldKey(r: Raw): Raw {
  const seed = (v: number): Raw => ({ k: 'num', v, s: true });
  /** The value of a SEED number (bracketed, or folded from one), else null. */
  const seedOf = (x: Raw): number | null => {
    const u = unparen(x);
    return u.k === 'num' && u.s ? u.v : null;
  };
  switch (r.k) {
    case 'num':
    case 'sym':
      return r;
    case 'paren': {
      const a = foldKey(r.a);
      const u = unparen(a);
      // A bracketed number is a seed literal (bindSeedNames writes `(6)`), and
      // its brackets are not shape (rule 1); so are a letter's. The printer
      // re-brackets a negative number where it needs to.
      if (u.k === 'num') return seed(u.v);
      if (u.k === 'sym') return u;
      return { k: 'paren', a };
    }
    case 'fn':
      return { k: 'fn', name: r.name, args: r.args.map(foldKey) };
    case 'neg': {
      const a = foldKey(r.a);
      const u = unparen(a);
      if (u.k === 'num') return u.s ? seed(-u.v) : { k: 'num', v: -u.v };
      if (u.k === 'neg') return u.a; // -(-k) → k
      return { k: 'neg', a };
    }
    default: {
      const a = foldKey(r.a);
      const b = foldKey(r.b);
      // Fold only where a SEED is involved: an author's literal `3*4` in a
      // form key IS the form wanted (Fable review of step 1, finding 4).
      const ca = constOf(a);
      const cb = constOf(b);
      const sa = seedOf(a);
      const sb = seedOf(b);
      if (ca !== null && cb !== null && (sa !== null || sb !== null)) {
        if (r.k === 'add') return seed(ca + cb);
        if (r.k === 'sub') return seed(ca - cb);
        if (r.k === 'mul') return seed(ca * cb);
      }
      switch (r.k) {
        case 'mul':
          if (sa === 0 || sb === 0) return seed(0);
          if (sa === 1) return b;
          if (sb === 1) return a;
          if (sa === -1) return foldKey({ k: 'neg', a: b });
          if (sb === -1) return foldKey({ k: 'neg', a });
          break;
        case 'add':
          if (sa === 0) return b;
          if (sb === 0) return a;
          break;
        case 'sub':
          if (sb === 0) return a;
          if (sa === 0) return foldKey({ k: 'neg', a: b });
          break;
        case 'pow':
          if (sb === 1) return a;
          if (sb === 0) return seed(1);
          break;
        default:
          break;
      }
      return { k: r.k, a, b };
    }
  }
}

// ---- 3. the canonical shape --------------------------------------------------

type Shape =
  | { t: 'num'; v: number } // v ≥ 0 always; a sign lives on a prod
  | { t: 'sym'; name: string }
  | { t: 'sum'; terms: Shape[] }
  | { t: 'prod'; neg: boolean; fs: Shape[] } // fs unsigned; !neg ⇒ fs.length ≥ 2
  | { t: 'div'; n: Shape; d: Shape }
  | { t: 'pow'; b: Shape; e: Shape }
  | { t: 'mod'; a: Shape; b: Shape }
  | { t: 'fn'; name: string; args: Shape[] };

/** Number leaves compare by value (rule 4): `0.5` ≡ `.50`; float noise from a
 * folded key (`0.1+0.2`) is absorbed at 12 significant digits. */
const fmt = (v: number): string => String(Number(v.toPrecision(12)));

function keyOf(s: Shape): string {
  switch (s.t) {
    case 'num':
      return `n${fmt(s.v)}`;
    case 'sym':
      return `s${s.name}`;
    case 'sum':
      return `+(${s.terms.map(keyOf).join(',')})`;
    case 'prod':
      return `${s.neg ? '-' : ''}*(${s.fs.map(keyOf).join(',')})`;
    case 'div':
      return `/(${keyOf(s.n)},${keyOf(s.d)})`;
    case 'pow':
      return `^(${keyOf(s.b)},${keyOf(s.e)})`;
    case 'mod':
      return `%(${keyOf(s.a)},${keyOf(s.b)})`;
    case 'fn':
      return `f${s.name}(${s.args.map(keyOf).join(',')})`;
  }
}

const isNeg = (s: Shape): boolean => s.t === 'prod' && s.neg;

/** The shape without its sign (a negative prod's factors). */
function absShape(s: Shape): Shape {
  if (s.t !== 'prod' || !s.neg) return s;
  return s.fs.length === 1 ? (s.fs[0] as Shape) : { t: 'prod', neg: false, fs: s.fs };
}

function negate(s: Shape): Shape {
  if (s.t === 'num' && s.v === 0) return s;
  if (s.t === 'prod') {
    if (s.neg) return absShape(s);
    return { t: 'prod', neg: true, fs: s.fs };
  }
  return { t: 'prod', neg: true, fs: [s] };
}

const byKey = (a: Shape, b: Shape): number => {
  const ka = keyOf(a);
  const kb = keyOf(b);
  return ka < kb ? -1 : ka > kb ? 1 : 0;
};

/** Sum terms sort by their UNSIGNED shape first, so negating every term of a
 * bracket never reorders it (A3 needs a stable "leading term"). */
const bySignFree = (a: Shape, b: Shape): number =>
  byKey(absShape(a), absShape(b)) || Number(isNeg(a)) - Number(isNeg(b));

function mkSum(terms: Shape[]): Shape {
  const flat: Shape[] = [];
  for (const t of terms) {
    if (t.t === 'sum') flat.push(...t.terms);
    else flat.push(t);
  }
  if (flat.length === 1) return flat[0] as Shape;
  flat.sort(bySignFree);
  return { t: 'sum', terms: flat };
}

function mkProd(factors: Shape[], negIn: boolean): Shape {
  let neg = negIn;
  const fs: Shape[] = [];
  for (const f of factors) {
    if (f.t === 'prod') {
      if (f.neg) neg = !neg;
      fs.push(...f.fs);
    } else if (f.t === 'num' && f.v === 0) {
      fs.push(f); // a zero factor keeps its place; nothing folds (rule 4)
    } else {
      fs.push(f);
    }
  }
  // Rule 10 (A3): with two or more factors, each bracket takes a canonical
  // sign — its leading term positive — and the sign moves to the product's
  // front, parity kept. `−6(2−3x)` ≡ `6(3x−2)`. A lone `-(3x−2)` is NOT a
  // product of two factors, so its minus stays (rule 3: brackets aren't
  // expanded).
  if (fs.length >= 2) {
    for (let i = 0; i < fs.length; i++) {
      const f = fs[i] as Shape;
      if (f.t !== 'sum') continue;
      const lead = f.terms[0];
      if (lead && isNeg(lead)) {
        fs[i] = mkSum(f.terms.map(negate));
        neg = !neg;
      }
    }
  }
  fs.sort(byKey);
  if (fs.length === 1 && !neg) return fs[0] as Shape;
  return { t: 'prod', neg, fs };
}

function mkDiv(n: Shape, d: Shape): Shape {
  const nNeg = isNeg(n);
  const dNeg = isNeg(d);
  // Rule 5: two signs are not simplest, so they stay where they are.
  if (nNeg && dNeg) return { t: 'div', n, d };
  if (nNeg || dNeg) return negate(mkDiv(absShape(n), absShape(d)));
  // Rule 9 (A2): over a NUMERIC denominator, a product is that fraction as a
  // coefficient: `x/2` ≡ `(1/2)x`, `2x/3` ≡ `(2/3)x`. Leaves never fold, so
  // `4x/6` is `(4/6)x`. A letter denominator (`4b/a`) is untouched.
  if (d.t === 'num') {
    const fs = n.t === 'prod' ? n.fs : [n];
    const nums = fs.filter((f) => f.t === 'num');
    const rest = fs.filter((f) => f.t !== 'num');
    if (rest.length > 0) {
      const coef: Shape =
        nums.length === 0
          ? { t: 'num', v: 1 }
          : nums.length === 1
            ? (nums[0] as Shape)
            : { t: 'prod', neg: false, fs: nums };
      return mkProd([{ t: 'div', n: coef, d }, ...rest], false);
    }
  }
  return { t: 'div', n, d };
}

function shapeOf(r: Raw): Shape {
  switch (r.k) {
    case 'num':
      return r.v < 0 ? negate({ t: 'num', v: -r.v }) : { t: 'num', v: r.v };
    case 'sym':
      return { t: 'sym', name: r.name };
    case 'paren':
      return shapeOf(r.a);
    case 'neg':
      return negate(shapeOf(r.a));
    case 'fn':
      return { t: 'fn', name: r.name, args: r.args.map(shapeOf) };
    case 'add':
      return mkSum([shapeOf(r.a), shapeOf(r.b)]);
    case 'sub':
      return mkSum([shapeOf(r.a), negate(shapeOf(r.b))]);
    case 'mul':
      return mkProd([shapeOf(r.a), shapeOf(r.b)], false);
    case 'div':
      return mkDiv(shapeOf(r.a), shapeOf(r.b));
    case 'pow':
      return { t: 'pow', b: shapeOf(r.a), e: shapeOf(r.b) };
    case 'mod':
      return { t: 'mod', a: shapeOf(r.a), b: shapeOf(r.b) };
  }
}

export type FormSide = 'key' | 'student';

/**
 * The canonical shape of a math answer, as a string, or null when it does not
 * parse or exceeds the bound. `side: 'key'` applies FG-6's folding first (an
 * answer key or a `!` mistake entry); `'student'` applies none.
 * The input may be raw or already tokenized (tokenizing is idempotent).
 */
export function mathShape(expr: string, side: FormSide): string | null {
  const tokenized = tokenizeMath(expr);
  if (!tokenized) return null;
  const raw = parseRaw(tokenized);
  if (!raw) return null;
  return keyOf(shapeOf(side === 'key' ? foldKey(raw) : raw));
}

// ---- display: the folded key as a student would write it ---------------------

function atomic(r: Raw): boolean {
  return r.k === 'num' ? r.v >= 0 : r.k === 'sym' || r.k === 'paren' || r.k === 'fn';
}

function print(r: Raw): string {
  switch (r.k) {
    case 'num':
      return fmt(r.v);
    case 'sym':
      return r.name;
    case 'paren':
      return `(${print(r.a)})`;
    case 'fn':
      return r.name === 'factorial' && r.args[0]
        ? `${atomic(r.args[0]) ? print(r.args[0]) : `(${print(r.args[0])})`}!`
        : `${r.name}(${r.args.map(print).join(', ')})`;
    case 'neg': {
      const inner = print(r.a);
      return r.a.k === 'add' || r.a.k === 'sub' ? `-(${inner})` : `-${inner}`;
    }
    case 'add': {
      const b = unparen(r.b);
      if (b.k === 'neg') return `${print(r.a)} - ${printSubRight(b.a)}`;
      if (b.k === 'num' && b.v < 0) return `${print(r.a)} - ${fmt(-b.v)}`;
      return `${print(r.a)} + ${print(r.b)}`;
    }
    case 'sub':
      return `${print(r.a)} - ${printSubRight(r.b)}`;
    case 'mul': {
      const left = r.a.k === 'add' || r.a.k === 'sub' || r.a.k === 'div' ? `(${print(r.a)})` : print(r.a);
      const rb = r.b;
      const right =
        rb.k === 'add' || rb.k === 'sub' || rb.k === 'div' || rb.k === 'neg' || (rb.k === 'num' && rb.v < 0)
          ? `(${print(rb)})`
          : print(rb);
      // Juxtapose like a worksheet (`12ab`, `6(3x - 2)`) unless the right
      // factor starts with a digit (it would merge into the left one) or the
      // letters either side would spell a name (`a` + `sin(x)` is `asin(x)`,
      // `m`+`a`+`x` is `max`, `p`+`i` is `pi`: Fable review of step 1).
      if (/^[0-9.]/.test(right) || spellsName(left, right)) return `${left} × ${right}`;
      return `${left}${right}`;
    }
    case 'div': {
      const wrap = (x: Raw): string => (atomic(x) ? print(x) : `(${print(x)})`);
      return `${wrap(r.a)}/${wrap(r.b)}`;
    }
    case 'pow': {
      const base = atomic(r.a) && !(r.a.k === 'num' && r.a.v < 0) ? print(r.a) : `(${print(r.a)})`;
      const exp = atomic(r.b) ? print(r.b) : `(${print(r.b)})`;
      return `${base}^${exp}`;
    }
    case 'mod':
      return `${print(r.a)} mod ${print(r.b)}`;
  }
}

/** Would writing `left` and `right` side by side join letters into a
 * protected name (`pi`, a function) that neither side meant? */
function spellsName(left: string, right: string): boolean {
  const tail = /[A-Za-z]+$/.exec(left)?.[0] ?? '';
  const head = /^[A-Za-z]+/.exec(right)?.[0] ?? '';
  if (!tail || !head) return false;
  const joined = tail + head;
  // `xx` is AsciiMath's times sign (normalizeAsciiMath reads `x x` joined as
  // `*`), so it is a name for this purpose too.
  const names = ['pi', 'xx', 'mod', ...FUNCTION_NAMES];
  // A name inside one side alone was already there; only one that straddles
  // the join is new.
  for (const n of names) {
    for (let at = joined.indexOf(n); at !== -1; at = joined.indexOf(n, at + 1)) {
      if (at < tail.length && at + n.length > tail.length) return true;
    }
  }
  return false;
}

function printSubRight(r: Raw): string {
  return r.k === 'add' || r.k === 'sub' || r.k === 'neg' || (r.k === 'num' && r.v < 0)
    ? `(${print(r)})`
    : print(r);
}

/**
 * A key as it should be SHOWN (print answer key, editor preview, practice's
 * released answer): FG-6's folding applied, then printed the way a worksheet
 * writes it — `((4)*(3))ab` → `12ab`, `(6)*((3)*x-(2))` → `6(3x - 2)`. One
 * function, shared, so the surfaces cannot differ. Null when it won't parse.
 */
export function displayFormKey(expr: string): string | null {
  const tokenized = tokenizeMath(expr);
  if (!tokenized) return null;
  const raw = parseRaw(tokenized);
  return raw ? print(foldKey(raw)) : null;
}

/** Does the key-side clean-up remove a whole bracket's worth of structure?
 * True when a bracket in the BOUND key holds a sum and the same bracket after
 * folding no longer does (`6(3x - 0)` → `6(3x)`). The importer warns on it
 * (FG-6): the seed row has collapsed the form the item asks for. */
export function foldCollapsesBracket(expr: string): boolean {
  const tokenized = tokenizeMath(expr);
  const raw = tokenized ? parseRaw(tokenized) : null;
  if (!raw) return false;
  const count = (r: Raw): number => {
    switch (r.k) {
      case 'num':
      case 'sym':
        return 0;
      case 'paren': {
        const u = unparen(r.a);
        return (u.k === 'add' || u.k === 'sub' ? 1 : 0) + count(r.a);
      }
      case 'neg':
        return count(r.a);
      case 'fn':
        return r.args.reduce((n, a) => n + count(a), 0);
      default:
        return count(r.a) + count(r.b);
    }
  };
  return count(foldKey(raw)) < count(raw);
}

// ---- 4. the predicate --------------------------------------------------------

/**
 * Same shape? `student` is read with no folding; `key` (an answer entry or a
 * `!` entry) with FG-6's. Null-safe: anything that won't shape is never a
 * shape match.
 */
export function sameShape(student: string, key: string): boolean {
  const s = mathShape(student, 'student');
  if (s === null) return false;
  const k = mathShape(key, 'key');
  return k !== null && s === k;
}
