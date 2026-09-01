// =============================================================================
// model-format.ts — FunctionModel → canonical display string (a LEAF module)
// -----------------------------------------------------------------------------
// Split out of formula.ts so "format a model" costs no parser: formula.ts
// imports evaluate.ts and therefore mathjs, and the viewer's answer-key
// extract (student shell, entry chunk) needs only these pure string helpers.
// The strings stay deliberately REPARSEABLE by parseGraphFormula (ASCII
// operators), so the round trip is type → parse → format → parse, no drift.
// The type import is type-only on purpose — it erases at build, keeping this
// module dependency-free at runtime.
// =============================================================================

import type { FunctionModel } from './graph-score.js';

export const fmt = (n: number): string => String(Number.parseFloat(n.toPrecision(6)));

// A signed continuation term: `+ 3` / `- 3` (with a leading space).
export function term(n: number, suffix = ''): string {
  if (n === 0) return '';
  const sign = n < 0 ? ' - ' : ' + ';
  return `${sign}${fmt(Math.abs(n))}${suffix}`;
}

// A leading coefficient: `2x`, `x`, `-x`, `0` handled by callers.
export function coeff(n: number, suffix: string): string {
  if (n === 1) return suffix;
  if (n === -1) return `-${suffix}`;
  return `${fmt(n)}${suffix}`;
}

// A signed middle term with an x-power suffix, eliding a magnitude of 1
// (` + x^2`, ` - 3x`); empty when the coefficient is 0.
export function midTerm(n: number, suffix: string): string {
  if (n === 0) return '';
  const sign = n < 0 ? ' - ' : ' + ';
  const mag = Math.abs(n);
  return `${sign}${mag === 1 ? suffix : `${fmt(mag)}${suffix}`}`;
}

export function formatModel(model: FunctionModel): string {
  switch (model.family) {
    case 'linear':
      if (model.slope === 0) return `y = ${fmt(model.intercept)}`;
      return `y = ${coeff(model.slope, 'x')}${term(model.intercept)}`;
    case 'quadratic': {
      let s = `y = ${coeff(model.a, 'x^2')}`;
      if (model.b !== 0) {
        const sign = model.b < 0 ? ' - ' : ' + ';
        const mag = Math.abs(model.b);
        s += `${sign}${mag === 1 ? 'x' : `${fmt(mag)}x`}`;
      }
      if (model.c !== 0) s += term(model.c);
      return s;
    }
    case 'cubic':
      return `y = ${coeff(model.a, 'x^3')}${midTerm(model.b, 'x^2')}${midTerm(model.c, 'x')}${term(model.d)}`;
    case 'quartic':
      return `y = ${coeff(model.a, 'x^4')}${midTerm(model.b, 'x^3')}${midTerm(model.c, 'x^2')}${midTerm(model.d, 'x')}${term(model.e)}`;
    case 'absolute': {
      const inner =
        model.h === 0
          ? 'x'
          : model.h > 0
            ? `x - ${fmt(model.h)}`
            : `x + ${fmt(-model.h)}`;
      return `y = ${coeff(model.a, `|${inner}|`)}${term(model.k)}`;
    }
    case 'sqrt': {
      const inner =
        model.h === 0
          ? 'x'
          : model.h > 0
            ? `x - ${fmt(model.h)}`
            : `x + ${fmt(-model.h)}`;
      const lead =
        model.a === 1
          ? `sqrt(${inner})`
          : model.a === -1
            ? `-sqrt(${inner})`
            : `${fmt(model.a)}*sqrt(${inner})`;
      return `y = ${lead}${term(model.k)}`;
    }
    case 'exponential':
      return `y = ${fmt(model.a)}*${fmt(model.b)}^x`;
    case 'logarithmic':
      if (model.a === 0) return `y = ${coeff(model.b, 'ln(x)')}`;
      return `y = ${fmt(model.a)}${term(model.b, 'ln(x)')}`;
    case 'vertical':
      return `x = ${fmt(model.x)}`;
  }
}

