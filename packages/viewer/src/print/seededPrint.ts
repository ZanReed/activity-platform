// =============================================================================
// print/seededPrint.ts — seeded values on the teacher print surface (R9/D6)
// -----------------------------------------------------------------------------
// Print is the THIRD substitution surface and the only CLIENT-side one: the
// route holds the RAW document (draft-first — versionId may not exist), seeds
// with printSeed(activityId, version) — so the existing "Version 2, 3, …"
// selector IS the A/B mechanism (D6) — and derives with the same leaf module
// the two servers bundle. The student path never accepts a seed parameter;
// this module is only ever fed the teacher route's own seed.
//
// substituteSeededAnswers is the piece the prose walk deliberately lacks: the
// ANSWER-KEY surfaces (blank answers, math-gap prompt answers, mistake
// matches), resolved to each printing's literals so the key sheet reads
// "10.5", never "a*p". Runs on the AUTHORED document before extractAnswerKey.
// =============================================================================

import type { SeedValues } from '../sanitize/seedValues.js';
import { resolveSeededEntry } from '../seeded/resolveEntry.js';

type AnswerType = 'text' | 'numeric' | 'math';

function resolveList(list: unknown, answerType: AnswerType, values: SeedValues): unknown {
  if (!Array.isArray(list)) return list;
  return list.map((e) => (typeof e === 'string' ? resolveSeededEntry(e, answerType, values) : e));
}

/** Pure walk over the RAW document: blank tokens and math-gap prompts get
 * their key strings resolved. Everything else passes through untouched (the
 * prose/data walk is substituteSeedValues' job). */
export function substituteSeededAnswers<T>(doc: T, values: SeedValues): T {
  if (Object.keys(values).length === 0) return doc;
  return walk(doc, values) as T;
}

function walk(node: unknown, values: SeedValues): unknown {
  if (Array.isArray(node)) return node.map((n) => walk(n, values));
  if (node === null || typeof node !== 'object') return node;
  const obj = node as Record<string, unknown>;

  if (obj.type === 'blank' && typeof obj.answer === 'string') {
    const answerType: AnswerType =
      obj.answerType === 'numeric' || obj.answerType === 'math'
        ? obj.answerType
        : 'text';
    return {
      ...obj,
      answer: resolveSeededEntry(obj.answer, answerType, values),
      ...(obj.acceptableAnswers !== undefined
        ? { acceptableAnswers: resolveList(obj.acceptableAnswers, answerType, values) }
        : {}),
      ...(Array.isArray(obj.mistakeFeedback)
        ? {
            mistakeFeedback: (obj.mistakeFeedback as Array<Record<string, unknown>>).map(
              (m) =>
                typeof m.match === 'string'
                  ? { ...m, match: resolveSeededEntry(m.match, answerType, values) }
                  : m,
            ),
          }
        : {}),
    };
  }

  // Math-gap prompts (Model A): { id, answer, acceptableAnswers } riding on a
  // math_inline node — always math-typed (their comparison is equivalence).
  if (Array.isArray(obj.prompts) && typeof obj.latex === 'string') {
    return {
      ...obj,
      prompts: (obj.prompts as Array<Record<string, unknown>>).map((p) => ({
        ...p,
        ...(typeof p.answer === 'string'
          ? { answer: resolveSeededEntry(p.answer, 'math', values) }
          : {}),
        ...(p.acceptableAnswers !== undefined
          ? { acceptableAnswers: resolveList(p.acceptableAnswers, 'math', values) }
          : {}),
      })),
    };
  }

  let changed = false;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const w = walk(v, values);
    if (w !== v) changed = true;
    out[k] = w;
  }
  return changed ? out : obj;
}
