// =============================================================================
// scope-calculation.test.ts — cross-row definitions, the MINIMUM ruled scope
// -----------------------------------------------------------------------------
// `a = 10` on one row, `a*2` on the next, and the second row reads "= 20".
// Before this it plotted a horizontal line at y = 20 with no readout at all —
// the row failed the classifier's scope-less calculation test and fell through
// to a curve. So the feature is also a bug fix, and the two halves are tested
// together: the value APPEARS, and the curve DOES NOT.
//
// Every case here goes through the real classifier and the real freeVariables()
// parse, so what is pinned is the behaviour a student gets, not the helper's
// signature. The DOM half — that the row's note element renders the text and
// that the board is handed no curve item — belongs to the browser lane, because
// the expression list cannot be constructed outside a browser (MathfieldElement
// does not exist in mathlive's node build; verified, not assumed).
//
// The NEGATIVE cases are the point of this file. Each one is a feature that was
// explicitly ruled OUT of scope, and each would be a plausible "while we're
// here" extension — a dependency graph the ruling says we are not building.
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  classifyExpression,
  freeVariables,
  scopeCalculation,
} from '../src/evaluate.js';

/** Drive a row exactly as the expression list does: classify it, take the free
 * variables of the RAW text, and ask whether it resolves against the sliders
 * defined by other rows. Returns the readout value, or null when the row stays
 * a curve. */
function rowValue(text: string, scope: Record<string, number>): number | null {
  const classified = classifyExpression(text);
  if (classified.kind !== 'function') return null;
  const fn = classified.fn;
  return scopeCalculation(freeVariables(text), scope, (vars) => fn(0, vars));
}

/** The scope the list builds from `a = 10`-shaped rows. */
const withA = { a: 10 };

describe('a row whose variables are all defined sliders is a calculation', () => {
  it('resolves the ruled example: a = 10, then a*2 reads 20', () => {
    // The whole feature, in one line.
    expect(rowValue('a*2', withA)).toBe(20);
  });

  it('resolves an expression over several sliders', () => {
    expect(rowValue('a+b', { a: 10, b: 5 })).toBe(15);
  });

  it('resolves through functions and constants', () => {
    expect(rowValue('sqrt(a)', { a: 16 })).toBe(4);
    expect(rowValue('a*pi', { a: 0 })).toBe(0);
  });

  it('tracks the slider: the same row reads differently as a changes', () => {
    // The value must be recomputed per rebuild, never cached with the text —
    // the row's text is unchanged when the slider it references is retyped.
    expect(rowValue('a*2', { a: 10 })).toBe(20);
    expect(rowValue('a*2', { a: 3 })).toBe(6);
  });

  it('returns null rather than a readout when the value is not finite', () => {
    // 1/0 is a number in JS. A row that says "= Infinity" is worse than a row
    // that plots nothing.
    expect(rowValue('1/(a-a)', withA)).toBeNull();
  });
});

describe('rows that stay curves — the boundary of the ruled scope', () => {
  it('keeps y = a as a horizontal LINE, not a number', () => {
    // The single most important negative case. `y = a` and `a` differ only in
    // the `y =`, and the rule that separates them is that free variables come
    // from the RAW text: `y` survives the parse and is never a slider name, so
    // the row fails the test and plots. This matches the existing convention
    // that `y = 5` is a function and a bare `5` is a calculation — a student
    // who types `y = a` wants to SEE the line move as they drag a.
    expect(rowValue('y=a', withA)).toBeNull();
  });

  it('keeps a row that still mentions x', () => {
    expect(rowValue('a*x', withA)).toBeNull();
    expect(rowValue('x^(2)', withA)).toBeNull();
  });

  it('keeps a row naming a variable nothing defined', () => {
    // `b*2` with no b: a blank curve, exactly as before. Reporting "b is
    // undefined" would be a nicer product, and it is NOT this slice.
    expect(rowValue('b*2', withA)).toBeNull();
    expect(rowValue('a+b', withA)).toBeNull();
  });

  it('does not resolve a definition that depends on another definition', () => {
    // `b = a + 1` is a row ERROR from the classifier (a slider's right-hand
    // side must be constant), so it never becomes a slider and never enters
    // the scope. Pinned here because "make b = a+1 work" is the obvious next
    // step and it is the dependency-graph feature the ruling deferred.
    const b = classifyExpression('b=a+1');
    expect(b.kind).toBe('error');
    expect(rowValue('b*2', withA)).toBeNull();
  });

  it('leaves an already-variable-free row to the classifier', () => {
    // `2+3` never reaches this path — it is a `calculation` before scope
    // exists. Guarded so a future refactor cannot route it here and change
    // which code owns the readout.
    expect(classifyExpression('2+3').kind).toBe('calculation');
    expect(rowValue('2+3', withA)).toBeNull();
  });
});

describe('scopeCalculation — the decision in isolation', () => {
  it('refuses x even if something bound it', () => {
    // Defence in depth: today x cannot be a slider name, so this is
    // unreachable through the list. It is pinned so that a future scope entry
    // named x cannot silently turn every curve on the board into a number.
    expect(scopeCalculation(['x'], { x: 2 }, () => 4)).toBeNull();
  });

  it('refuses an empty variable list', () => {
    expect(scopeCalculation([], { a: 1 }, () => 7)).toBeNull();
  });

  it('passes a COPY of the scope to the evaluator', () => {
    // The list's compiled functions reuse one scratch scope object across
    // samples; handing them the live scope invites a mutation that outlives
    // the call.
    const scope = { a: 1 };
    scopeCalculation(['a'], scope, (vars) => {
      (vars as Record<string, number>).a = 99;
      return vars.a ?? 0;
    });
    expect(scope.a).toBe(1);
  });
});
