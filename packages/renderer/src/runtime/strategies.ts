// =============================================================================
// runtime/strategies.ts — Answer evaluation strategies
// -----------------------------------------------------------------------------
// Each strategy answers one question: "given a trimmed, non-empty typed value
// and the blank element's metadata, is the answer correct?" Strategies are
// pure boolean checks — they read only data-* attributes off the blank, never
// touch the wider DOM, and never handle empty input (the caller does that).
//
// Phase 1 ships only 'list'. Phase 2.5 (parameterized problems) will add
// 'expression' (math.js-style equivalence) and possibly 'computed' (a
// variant-aware answer key). Adding a strategy is one entry in `strategies`
// plus the renderer emitting data-blank-strategy="<name>" on the input — no
// changes to gatherResponses or checkBlank.
//
// `evaluateAnswer` is exported (beyond the runtime's own use) so the pure-
// function test suite can exercise the dispatch + fallback without a DOM.
// =============================================================================

type Strategy = (input: Element, typed: string) => boolean;

// `list` is named separately so the fallback path can reference it directly,
// without an index lookup into `strategies` that TypeScript (correctly, under
// noUncheckedIndexedAccess) types as possibly undefined.
const listStrategy: Strategy = (input, typed) => {
  const answers = (input.getAttribute('data-blank-answers') || '').split('|');
  return answers.indexOf(typed) !== -1;
};

const strategies: Record<string, Strategy> = {
  list: listStrategy,
};

export function evaluateAnswer(input: Element, typed: string): boolean {
  const name = input.getAttribute('data-blank-strategy') || 'list';
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
