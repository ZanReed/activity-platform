// =============================================================================
// seed-expr.ts — the seed-expression evaluator (practice banks, BE-1)
// -----------------------------------------------------------------------------
// Evaluates the two expression forms a BANK's ```seed fence may hold
// (docs/design/practice-banks.md PB-6, C-123, ruled BE-1 2026-10-12):
//
//   k: = vd / vh                       a DERIVED variable → a finite number
//   where t6: cp / cn > 0.4 and cp > 2  a template PREDICATE → a boolean
//
// WHY NOT compileFunction (evaluate.ts). That is the calculator's instance:
// arithmetic only, so `==`, `<`, `and`, `or`, `not` do not parse and gcd/lcm
// return NaN (measured 2026-10-12 — the agreed predicate language simply does
// not run there). Widening it would change the calculator and the GRADING
// bundle, which carries evaluate.ts; this module is imported by neither
// server bundle, so banks change no Edge Function (BE-2).
//
// HOW. mathjs's PARSER (the same syntax authors already write in answer keys)
// plus an explicit tree walk over a CLOSED grammar. The walk, not a mathjs
// evaluate(), owns the semantics, because these exact semantics are a JOINT
// CONTRACT with the curriculum side's check_bank (B-162 / C-127):
//
//   numbers      + - * / ^, unary -, parentheses, decimal literals
//   comparisons  == != < <= > >=, equality within mathjs's own tolerance
//                (relative 1e-12, absolute 1e-15 — nearlyEqual below)
//   logic        and, or, not — operands must be comparisons (booleans)
//   functions    mod gcd lcm abs round floor ceil min max — nothing else
//   round(x)     = floor(x + 1/2): 2.5 → 3, −2.5 → −2 (one argument only)
//
// Everything else is REFUSED at compile time by name: implicit multiplication
// (`2x`), `%`, `!`, xor, ranges, matrices, assignment, units, unknown
// functions. A zero divisor (`/`, mod, gcd, lcm), a non-integer gcd/lcm
// argument, or a non-finite result THROWS at that combination — the
// enumerator reports it; it is never silently a number (mathjs's own
// mod(x, 0) returns x, which is why the walk does not delegate).
//
// Node-safe on purpose (CLAUDE.md's barrel rule): imports only mathjs/number's
// parser. Reached through the `./seed-expr` subpath, never the barrel.
// =============================================================================

import { create, parseDependencies } from 'mathjs/number';

// The parser alone: no evaluation functions are registered, so nothing here
// can be reached by a string the walk does not handle.
const math = create({ parseDependencies } as Parameters<typeof create>[0]);

/** The functions a seed expression may call — the C-123 list, exactly. */
export const SEED_EXPR_FUNCTIONS: readonly string[] = [
  'mod', 'gcd', 'lcm', 'abs', 'round', 'floor', 'ceil', 'min', 'max',
];

/** Words that are operators in this grammar and so can never be a name. */
export const SEED_EXPR_KEYWORDS: readonly string[] = ['and', 'or', 'not'];

/** mathjs's default tolerances (config.relTol / config.absTol, mathjs 15). */
const REL_TOL = 1e-12;
const ABS_TOL = 1e-15;

export function nearlyEqual(a: number, b: number): boolean {
  if (a === b) return true;
  return Math.abs(a - b) <= Math.max(REL_TOL * Math.max(Math.abs(a), Math.abs(b)), ABS_TOL);
}

export class SeedExprError extends Error {}

type Value = number | boolean;
type Scope = Readonly<Record<string, number>>;

interface MathNode {
  type: string;
  op?: string;
  fn?: string | MathNode;
  args?: MathNode[];
  implicit?: boolean;
  content?: MathNode;
  value?: unknown;
  name?: string;
}

const BINARY_ARITH: Record<string, (a: number, b: number) => number> = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) throw new SeedExprError('division by zero');
    return a / b;
  },
  pow: (a, b) => Math.pow(a, b),
};

const COMPARE: Record<string, (a: number, b: number) => boolean> = {
  equal: (a, b) => nearlyEqual(a, b),
  unequal: (a, b) => !nearlyEqual(a, b),
  smaller: (a, b) => a < b && !nearlyEqual(a, b),
  smallerEq: (a, b) => a < b || nearlyEqual(a, b),
  larger: (a, b) => a > b && !nearlyEqual(a, b),
  largerEq: (a, b) => a > b || nearlyEqual(a, b),
};

function wholeNumber(fn: string, v: number): number {
  if (!Number.isInteger(v)) throw new SeedExprError(`${fn} needs whole numbers, got ${v}`);
  return v;
}

function gcd2(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

const FUNCTIONS: Record<string, { arity: number | 'variadic'; call: (xs: number[]) => number }> = {
  // Floored modulo (the result takes the divisor's sign) — Python's % and
  // mathjs's mod agree on this; only mod-by-zero differs, and it throws here.
  mod: {
    arity: 2,
    call: ([a, b]) => {
      if (b === 0) throw new SeedExprError('mod by zero');
      return a! - b! * Math.floor(a! / b!);
    },
  },
  gcd: {
    arity: 2,
    call: ([a, b]) => {
      const x = wholeNumber('gcd', a!);
      const y = wholeNumber('gcd', b!);
      if (x === 0 && y === 0) throw new SeedExprError('gcd(0, 0)');
      return gcd2(x, y);
    },
  },
  lcm: {
    arity: 2,
    call: ([a, b]) => {
      const x = wholeNumber('lcm', a!);
      const y = wholeNumber('lcm', b!);
      if (x === 0 || y === 0) throw new SeedExprError('lcm of zero');
      return Math.abs(x * y) / gcd2(x, y);
    },
  },
  abs: { arity: 1, call: ([a]) => Math.abs(a!) },
  round: { arity: 1, call: ([a]) => Math.floor(a! + 0.5) },
  floor: { arity: 1, call: ([a]) => Math.floor(a!) },
  ceil: { arity: 1, call: ([a]) => Math.ceil(a!) },
  min: { arity: 'variadic', call: (xs) => Math.min(...xs) },
  max: { arity: 'variadic', call: (xs) => Math.max(...xs) },
};

function num(v: Value, where: string): number {
  if (typeof v !== 'number') throw new SeedExprError(`${where} needs a number, not a true/false`);
  return v;
}

function bool(v: Value, where: string): boolean {
  if (typeof v !== 'boolean') throw new SeedExprError(`${where} needs a comparison (true/false), not a number`);
  return v;
}

/** Refuse anything outside the closed grammar, naming it. Returns the free
 *  variable names in first-appearance order. */
function check(node: MathNode, names: string[]): void {
  switch (node.type) {
    case 'ConstantNode':
      if (typeof node.value !== 'number') throw new SeedExprError(`"${String(node.value)}" is not a number`);
      return;
    case 'SymbolNode': {
      const name = node.name ?? '';
      if (SEED_EXPR_FUNCTIONS.includes(name)) throw new SeedExprError(`${name} is a function — call it: ${name}(…)`);
      if (!names.includes(name)) names.push(name);
      return;
    }
    case 'ParenthesisNode':
      check(node.content!, names);
      return;
    case 'OperatorNode': {
      const fn = String(node.fn);
      if (node.implicit) throw new SeedExprError('write multiplication with * (no implicit multiplication like 2x)');
      const known =
        fn in BINARY_ARITH || fn in COMPARE ||
        ['unaryMinus', 'unaryPlus', 'and', 'or', 'not'].includes(fn);
      if (!known) throw new SeedExprError(`the operator "${node.op ?? fn}" isn't allowed in a seed expression`);
      for (const a of node.args ?? []) check(a, names);
      return;
    }
    case 'FunctionNode': {
      const name = typeof node.fn === 'object' ? node.fn?.name ?? '' : String(node.fn);
      const spec = FUNCTIONS[name];
      if (!spec) {
        throw new SeedExprError(`${name}() isn't allowed — seed expressions may call ${SEED_EXPR_FUNCTIONS.join(', ')}`);
      }
      const n = node.args?.length ?? 0;
      if (spec.arity === 'variadic' ? n === 0 : n !== spec.arity) {
        throw new SeedExprError(`${name} takes ${spec.arity === 'variadic' ? 'at least one argument' : `${spec.arity} argument${spec.arity === 1 ? '' : 's'}`}`);
      }
      for (const a of node.args ?? []) check(a, names);
      return;
    }
    default:
      throw new SeedExprError(`"${node.type.replace(/Node$/, '').toLowerCase()}" syntax isn't allowed in a seed expression`);
  }
}

function walk(node: MathNode, scope: Scope): Value {
  switch (node.type) {
    case 'ConstantNode':
      return node.value as number;
    case 'SymbolNode': {
      const v = scope[node.name ?? ''];
      if (v === undefined) throw new SeedExprError(`${node.name} has no value here`);
      return v;
    }
    case 'ParenthesisNode':
      return walk(node.content!, scope);
    case 'OperatorNode': {
      const fn = String(node.fn);
      const args = node.args ?? [];
      if (fn === 'unaryMinus') return -num(walk(args[0]!, scope), '-');
      if (fn === 'unaryPlus') return num(walk(args[0]!, scope), '+');
      if (fn === 'not') return !bool(walk(args[0]!, scope), 'not');
      if (fn === 'and') return bool(walk(args[0]!, scope), 'and') && bool(walk(args[1]!, scope), 'and');
      if (fn === 'or') return bool(walk(args[0]!, scope), 'or') || bool(walk(args[1]!, scope), 'or');
      const a = num(walk(args[0]!, scope), node.op ?? fn);
      const b = num(walk(args[1]!, scope), node.op ?? fn);
      const cmp = COMPARE[fn];
      if (cmp) return cmp(a, b);
      const r = BINARY_ARITH[fn]!(a, b);
      if (!Number.isFinite(r)) throw new SeedExprError(`${a} ${node.op ?? fn} ${b} is not a finite number`);
      return r;
    }
    case 'FunctionNode': {
      const name = typeof node.fn === 'object' ? node.fn?.name ?? '' : String(node.fn);
      const xs = (node.args ?? []).map((a) => num(walk(a, scope), name));
      return FUNCTIONS[name]!.call(xs);
    }
    default:
      throw new SeedExprError(`unexpected ${node.type}`);
  }
}

export interface SeedExpression {
  /** The source as authored, trimmed. */
  readonly source: string;
  /** Free variable names, first appearance first. */
  readonly names: readonly string[];
  /** Throws SeedExprError on a zero divisor, a type error, or a missing name. */
  evaluate(scope: Scope): Value;
}

export type CompileResult =
  | { ok: true; expr: SeedExpression }
  | { ok: false; error: string };

/** Parse + grammar-check once; evaluate many times (the enumerator's loop). */
export function compileSeedExpression(source: string): CompileResult {
  const src = source.trim();
  if (src === '') return { ok: false, error: 'empty expression' };
  let tree: MathNode;
  try {
    tree = math.parse(src) as unknown as MathNode;
  } catch (err) {
    return { ok: false, error: `doesn't parse: ${(err as Error).message}` };
  }
  const names: string[] = [];
  try {
    check(tree, names);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  return {
    ok: true,
    expr: { source: src, names, evaluate: (scope) => walk(tree, scope) },
  };
}

/** A derived value as STORED: 12 significant figures, so float noise like
 *  0.30000000000000004 never reaches a table, a page or a comparison (BE-3).
 *  Throws on a boolean or a non-finite result. */
export function derivedNumber(v: Value): number {
  if (typeof v !== 'number') throw new SeedExprError('a derived variable must be a number, not a comparison');
  if (!Number.isFinite(v)) throw new SeedExprError('not a finite number');
  const r = Number(v.toPrecision(12));
  return Object.is(r, -0) ? 0 : r;
}
