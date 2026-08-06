// =============================================================================
// grading/guards.ts — bounds on student-supplied math expressions (ruling S4-B3)
// -----------------------------------------------------------------------------
// A NEW THREAT CLASS, created by moving grading to the server. On a published
// page, `mathEquivalent` compiled and numerically sampled the STUDENT'S OWN
// expression in the student's own browser tab: a hostile input like `9^9^9^9`
// or a deeply nested product burned their CPU and nobody else's. Server-side,
// the same input burns shared Edge compute for every student in the class.
//
// The request size cap does not help here — the dangerous inputs are TINY. A
// thirty-byte expression can ask for an astronomically large computation, and
// `mathEquivalent` evaluates each expression up to ~56 times (12 target samples
// with retries) across its sampling grid, multiplying whatever it costs.
//
// The bounds below are deliberately far above anything a student types in an
// algebra class and far below anything that hurts. They are a backstop for the
// pathological case, not a correctness rule: a legitimate answer must never hit
// them, which is why a rejected expression is scored WRONG rather than raising
// — a student who somehow trips a bound gets a normal incorrect mark, not a
// failed check for their whole section.
// =============================================================================

/** Longest expression we will hand to the math engine. A real answer is a
 * handful of characters; 256 leaves room for a genuinely long polynomial while
 * bounding parse cost. */
const MAX_EXPRESSION_LENGTH = 256;

/** Cap on exponentiation operators overall. Generous: a long polynomial is a
 * legitimate answer and every term may carry a power, so this bounds total
 * parse work without penalizing ordinary algebra.
 *
 * NOTE this is deliberately NOT the tower defense — counting powers would
 * reject `x^2 + y^2 + z^2 + …`, which is exactly what a student writes. The
 * shape that actually costs is a right-associative CHAIN (`9^9^9^9`), caught
 * separately below. */
const MAX_EXPONENT_OPERATORS = 24;

/** Two `^` with no separating operator between them — `9^9^9`, `x^2^3`. This is
 * the tower shape. Under the engine's float arithmetic a tower saturates to
 * Infinity rather than allocating a bignum, so this is defense in depth rather
 * than the primary bound; it costs one regex and removes the question. */
const EXPONENT_TOWER_RE = /\^[^+\-*/(),\s]*\^/;

/** Cap on total operators, a crude proxy for parse-tree size. Well above any
 * authored answer; well below anything that stalls a sampling loop. */
const MAX_OPERATORS = 64;

/** Cap on nesting depth. Deep parenthesization is another way to make a short
 * string expensive to parse and evaluate repeatedly. */
const MAX_NESTING_DEPTH = 16;

export interface ExpressionRejection {
  ok: false;
  reason:
    | 'too_long'
    | 'exponent_tower'
    | 'too_many_exponents'
    | 'too_many_operators'
    | 'too_deeply_nested'
    | 'unbalanced';
}

export type ExpressionCheck = { ok: true } | ExpressionRejection;

/**
 * Is this expression safe to hand to the math engine?
 *
 * Purely syntactic and allocation-free: it must be much cheaper than the
 * evaluation it guards, or it becomes the bottleneck it was meant to prevent.
 */
export function checkExpressionSafety(expression: string): ExpressionCheck {
  if (expression.length > MAX_EXPRESSION_LENGTH) {
    return { ok: false, reason: 'too_long' };
  }
  if (EXPONENT_TOWER_RE.test(expression)) {
    return { ok: false, reason: 'exponent_tower' };
  }

  let exponents = 0;
  let operators = 0;
  let depth = 0;
  let maxDepth = 0;

  for (let i = 0; i < expression.length; i++) {
    const ch = expression[i];
    switch (ch) {
      case '^':
        exponents += 1;
        operators += 1;
        break;
      case '*':
      case '/':
      case '+':
      case '-':
        operators += 1;
        break;
      case '(':
      case '[':
      case '{':
        depth += 1;
        if (depth > maxDepth) maxDepth = depth;
        break;
      case ')':
      case ']':
      case '}':
        depth -= 1;
        // More closers than openers: malformed. Cheaper to refuse here than to
        // let the parser discover it 56 times.
        if (depth < 0) return { ok: false, reason: 'unbalanced' };
        break;
      default:
        break;
    }
  }

  if (depth !== 0) return { ok: false, reason: 'unbalanced' };
  if (exponents > MAX_EXPONENT_OPERATORS) {
    return { ok: false, reason: 'too_many_exponents' };
  }
  if (operators > MAX_OPERATORS) {
    return { ok: false, reason: 'too_many_operators' };
  }
  if (maxDepth > MAX_NESTING_DEPTH) {
    return { ok: false, reason: 'too_deeply_nested' };
  }
  return { ok: true };
}

// (An aggregate EXPRESSION_LIMITS export used to re-bundle the four constants
// above; zero consumers anywhere — deleted 2026-08-06, A17. The individual
// constants are the working values; import those.)
