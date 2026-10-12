// The seed-expression evaluator (practice banks, BE-1). Every row here is a
// clause of the joint contract with the curriculum side's check_bank (B-162,
// C-127): if one changes, the letter changes with it.
import { describe, expect, it } from 'vitest';
import {
  compileSeedExpression,
  derivedNumber,
  nearlyEqual,
  SEED_EXPR_FUNCTIONS,
} from '../src/seed-expr';
import { compileFunction } from '../src/evaluate';

function run(src: string, scope: Record<string, number> = {}): unknown {
  const c = compileSeedExpression(src);
  if (!c.ok) throw new Error(`compile: ${c.error}`);
  return c.expr.evaluate(scope);
}

function refused(src: string): string {
  const c = compileSeedExpression(src);
  if (c.ok) throw new Error(`expected "${src}" to be refused`);
  return c.error;
}

describe('the predicate language compileFunction cannot run (BE-1, fact 1)', () => {
  it.each([
    ['7 == 7', true],
    ['3 != 4', true],
    ['3 < 4', true],
    ['4 <= 4', true],
    ['5 > 4', true],
    ['4 >= 5', false],
    ['3 < 4 and 4 < 3', false],
    ['3 < 4 or 4 < 3', true],
    ['not (3 < 4)', false],
    ['mod(10, 4) == 2', true],
    ['gcd(12, 8) == 4', true],
    ['lcm(4, 6) == 12', true],
  ])('%s → %s', (src, want) => {
    expect(run(src)).toBe(want);
  });

  it('the C-123 example predicate, over its own variables', () => {
    expect(run('cp / cn > 0.4 and cp > 2.5', { cp: 3, cn: 5 })).toBe(true);
    expect(run('cp / cn > 0.4 and cp > 2.5', { cp: 2, cn: 5 })).toBe(false);
  });
});

describe('semantics agreed with check_bank (B-162 1a/1b, C-127)', () => {
  it('round(x) = floor(x + 1/2): halves go up, including negatives', () => {
    expect(run('round(2.5)')).toBe(3);
    expect(run('round(-2.5)')).toBe(-2);
    expect(run('round(7/3)')).toBe(2);
    expect(run('round(-2.6)')).toBe(-3);
  });

  it('round takes ONE argument (their round is one-argument)', () => {
    expect(refused('round(2.345, 2)')).toMatch(/1 argument/);
  });

  it('equality is within mathjs tolerance, so float noise compares equal', () => {
    expect(0.1 * 3 === 0.3).toBe(false); // the trap
    expect(run('0.1 * 3 == 0.3')).toBe(true);
    expect(run('0.1 * 3 != 0.3')).toBe(false);
    expect(run('0.1 * 3 > 0.3')).toBe(false);
    expect(run('0.1 * 3 >= 0.3')).toBe(true);
    expect(nearlyEqual(1, 1 + 1e-9)).toBe(false);
  });

  it('mod is floored (takes the divisor sign), like Python %', () => {
    expect(run('mod(-7, 3)')).toBe(2);
    expect(run('mod(7, -3)')).toBe(-2);
    expect(run('mod(7.5, 2)')).toBe(1.5);
  });

  it('a zero divisor THROWS at that combination — never a silent number', () => {
    // mathjs's own mod(x, 0) returns x; the walk must not inherit that.
    expect(() => run('mod(a, b)', { a: 2, b: 0 })).toThrow(/mod by zero/);
    expect(() => run('a / b', { a: 2, b: 0 })).toThrow(/division by zero/);
    expect(() => run('gcd(0, 0)')).toThrow();
    expect(() => run('lcm(0, 3)')).toThrow();
  });

  it('gcd/lcm refuse non-integers (their _int raises)', () => {
    expect(() => run('gcd(2.5, 5)')).toThrow(/whole numbers/);
  });

  it('a non-finite intermediate throws', () => {
    expect(() => run('0 ^ -1')).toThrow(/finite/);
  });

  it('^ is power, min/max are variadic', () => {
    expect(run('2 ^ 10')).toBe(1024);
    expect(run('max(3, 9, 4) - min(3, 9, 4)')).toBe(6);
  });
});

describe('the closed grammar refuses by name', () => {
  it.each([
    ['2x', /implicit multiplication/],
    ['7 % 2', /operator/],
    ['3!', /operator|allowed/],
    ['true', /not a number/],
    ['sin(1)', /isn't allowed/],
    ['log(10)', /isn't allowed/],
    ['a = 3', /isn't allowed/],
    ['[1, 2]', /isn't allowed/],
    ['1:3', /isn't allowed/],
    ['a ? 1 : 2', /isn't allowed/],
    ['mod', /is a function/],
    ['', /empty/],
    ['3 +', /parse/],
  ])('%s', (src, why) => {
    expect(refused(src)).toMatch(why);
  });

  it('logic needs comparisons, arithmetic needs numbers', () => {
    expect(() => run('1 and 0')).toThrow(/comparison/);
    expect(() => run('(1 < 2) + 1')).toThrow(/number/);
  });

  it('reports free names in first-appearance order, not function names', () => {
    const c = compileSeedExpression('mod(vd, vh) + vd * k');
    expect(c.ok && c.expr.names).toEqual(['vd', 'vh', 'k']);
  });

  it('a name with no value throws rather than reading undefined', () => {
    expect(() => run('a + 1', {})).toThrow(/no value/);
  });

  it('allows exactly the C-123 function list', () => {
    expect([...SEED_EXPR_FUNCTIONS].sort()).toEqual(
      ['abs', 'ceil', 'floor', 'gcd', 'lcm', 'max', 'min', 'mod', 'round'],
    );
  });
});

describe('parity with the answer-key evaluator on the shared arithmetic', () => {
  // A derived value (seed-expr) and an answer key over it (compileFunction)
  // must mean the same arithmetic, or a template's answers drift from its
  // own variables. Grid over the operators and the functions both define.
  const exprs = ['a / b', 'a * b - 3', 'a ^ 2 + b', '-a + b', 'abs(a - b)', 'floor(a / b)', 'ceil(a / b)', 'mod(a, b)', 'min(a, b)', 'max(a, b)', 'round(a / b)'];
  const pairs = [[3, 4], [7, 2], [10, 3], [-5, 4], [2.5, 0.5], [1.75, 6]];
  it.each(exprs)('%s', (src) => {
    const answerKey = compileFunction(src)!;
    for (const [a, b] of pairs) {
      const seed = run(src, { a: a!, b: b! });
      expect(seed).toBeCloseTo(answerKey(0, { a: a!, b: b! }), 12);
    }
  });
});

describe('derivedNumber — what a table stores (BE-3)', () => {
  it('rounds to 12 significant figures, killing float noise', () => {
    expect(derivedNumber(0.1 * 3)).toBe(0.3);
    expect(derivedNumber(1 - 0.9)).toBe(0.1);
    expect(derivedNumber(200 / 3)).toBe(66.6666666667);
  });
  it('refuses booleans and non-finite values, and normalises -0', () => {
    expect(() => derivedNumber(true)).toThrow(/number/);
    expect(() => derivedNumber(Infinity)).toThrow(/finite/);
    expect(Object.is(derivedNumber(-0), 0)).toBe(true);
  });
});
