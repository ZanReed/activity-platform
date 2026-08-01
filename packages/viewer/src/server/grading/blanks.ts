// =============================================================================
// grading/blanks.ts — blank + math-gap scoring (parity port)
// -----------------------------------------------------------------------------
// Ports runtime/blanks.ts + runtime/strategies.ts to schema fields. The runtime
// reads its key off `data-*` attributes the renderer emitted; the server reads
// the same values straight off the raw document. Semantics are pinned by the
// golden corpus, which runs BOTH engines over one case list.
//
// Field-name traps this file exists to absorb (all verified against
// schema/src/inline.ts, all of them things a reasonable person guesses wrong):
//
//   * There is NO `strategy` field. The discriminator is `answerType`, and it
//     is optional with NO default — absent means 'text'.
//   * There is NO `groupId` / `group` field. An order-independent group is a
//     MAXIMAL RUN OF ADJACENT blanks flagged `interchangeableWithPrevious`,
//     in document order, within one block. The first blank of a block ignores
//     the flag (it can only ever start a run).
//   * The answer key is `answer` (a single required string) PLUS
//     `acceptableAnswers` (an array, default []). Not one field.
//   * `equivalence` only means anything when answerType === 'math'.
//
// THE TWO RULES MOST LIKELY TO BE "TIDIED" INTO A GRADING BUG:
//
//   1. An empty (after trim) value scores `null` — UNSCORED, never `false`.
//      A student who skipped a blank has not answered it wrong. The wire drops
//      null items entirely, so the viewer shows no mark at all.
//   2. Key entries are NOT trimmed; the student's value IS. Parity: the runtime
//      splits the key on `|` and compares raw entries, so a key authored with a
//      stray trailing space has never matched. Silently fixing that here would
//      change marks on activities that are already live.
// =============================================================================

import { mathEquivalent } from '@activity/graph-kit';
import { checkExpressionSafety } from './guards.js';
import {
  prepareKeyValue,
  prepareStudentValue,
  trimValue,
} from './normalize.js';
import {
  coerceTolerance,
  numericallyClose,
  parseNumericValue,
} from './numeric.js';

/** The grading-relevant projection of a BlankToken or a MathPrompt. Both key
 * into the same `responses.blanks` map (a math gap's id is not a uuid, but it
 * is still a key in that map), so both project to one shape here. */
export interface BlankKey {
  id: string;
  /** `answer` followed by `acceptableAnswers`, in that order. */
  answers: string[];
  /** Absent ⇒ 'text'. A MathPrompt is always 'math'. */
  answerType: 'text' | 'numeric' | 'math';
  tolerance: number;
  /** Only consulted for answerType 'math'. Absent ⇒ 'value'. */
  equivalence: 'value' | 'exact-form';
  /** Per-wrong-answer feedback. MathPrompts never carry it. */
  mistakeFeedback: Array<{ match: string; feedback: unknown[] }>;
  /** Generic help, shown when no mistakeFeedback entry matched. */
  hint: unknown[] | undefined;
  /** True when this blank continues the previous blank's interchangeable run. */
  interchangeableWithPrevious: boolean;
}

/** null = unscored (empty input). Mirrors the runtime's tri-state exactly. */
export type BlankVerdict = boolean | null;

// ---- single-blank scoring ---------------------------------------------------

function scoreText(student: string, key: BlankKey): boolean {
  for (const entry of key.answers) {
    if (prepareKeyValue(entry) === student) return true;
  }
  return false;
}

function scoreNumeric(student: string, key: BlankKey): boolean {
  const studentValue = parseNumericValue(student);
  const tolerance = coerceTolerance(key.tolerance);
  for (const entry of key.answers) {
    const prepared = prepareKeyValue(entry);
    const entryValue = parseNumericValue(prepared);
    if (entryValue !== null && studentValue !== null) {
      if (numericallyClose(studentValue, entryValue, tolerance)) return true;
    } else if (prepared === student) {
      // Either side isn't a number: fall back to exact string equality, which
      // is what lets a key entry like "no solution" score on a numeric blank.
      return true;
    }
  }
  return false;
}

function scoreMath(student: string, key: BlankKey): boolean {
  // Bound the student's expression before the engine compiles and samples it
  // ~56 times (ruling S4-B3). Server-side this is shared compute, and the
  // dangerous inputs are tiny — a size cap on the REQUEST cannot catch
  // `9^9^9^9`. A rejected expression scores wrong rather than raising: a
  // student who trips a bound gets an ordinary incorrect mark, not a failed
  // check for their whole section.
  if (!checkExpressionSafety(student).ok) return false;

  const tolerance = coerceTolerance(key.tolerance);
  const mode = key.equivalence === 'exact-form' ? 'exact-form' : 'value';
  for (const entry of key.answers) {
    const prepared = prepareKeyValue(entry);
    // Parity: falsy entries are skipped rather than compared.
    if (prepared && mathEquivalent(student, prepared, { mode, tolerance })) {
      return true;
    }
  }
  return false;
}

/**
 * Score one blank's raw typed value. Returns null for empty-after-trim.
 *
 * NOTE the server has no equivalent of the runtime's third null case ("the
 * math engine hasn't lazy-loaded yet"). Server-side the engine is always
 * present, so a math blank always produces a real verdict — strictly better
 * than the client, and not a parity break: the runtime's null there is a
 * loading state, not a grading rule.
 */
export function scoreBlank(raw: string, key: BlankKey): BlankVerdict {
  const student = prepareStudentValue(raw);
  if (student === '') return null;
  switch (key.answerType) {
    case 'numeric':
      return scoreNumeric(student, key);
    case 'math':
      return scoreMath(student, key);
    default:
      return scoreText(student, key);
  }
}

// ---- interchangeable groups -------------------------------------------------

/**
 * Partition a block's blanks into scoring groups, in document order.
 *
 * A run continues while `interchangeableWithPrevious` is true; the first blank
 * always starts a new run regardless of its flag. Solo blanks come back as
 * one-element groups so the caller has a single uniform path.
 */
export function groupBlanks(keys: BlankKey[]): BlankKey[][] {
  const groups: BlankKey[][] = [];
  for (const key of keys) {
    const current = groups[groups.length - 1];
    if (current && key.interchangeableWithPrevious) {
      current.push(key);
    } else {
      groups.push([key]);
    }
  }
  return groups;
}

/**
 * Score one interchangeable group with CONSUME-ONCE semantics: each typed value
 * may satisfy at most one blank, and each blank may be satisfied by at most one
 * value. "2, 3" and "3, 2" both score fully when the two blanks accept 2 and 3
 * respectively; "2, 2" scores exactly one.
 *
 * This is a maximum bipartite matching (Kuhn's augmenting path), NOT a greedy
 * left-to-right pass. Greedy is wrong here and the failure is subtle: with
 * blank A accepting {2} and blank B accepting {2, 3}, the input ("2", "3")
 * greedily gives A←2, then B←3 — correct by luck. Reverse the input to
 * ("3", "2") and greedy assigns 3→B, then 2→A — still fine. But with A
 * accepting {2,3} and B accepting {3}, input ("3","2") greedily puts 3 into A
 * and then 2 has nowhere to go, scoring the student wrong on an answer that
 * has a perfect assignment (3→B, 2→... no). The real cases arise with three or
 * more blanks and overlapping key sets, where only augmentation finds the
 * complete assignment. The runtime already does this; a greedy server would
 * silently mark correct work wrong.
 *
 * Each blank keeps its OWN answer list and answerType — the group is a
 * matching over per-slot predicates, never a flattened pool of strings.
 *
 * Ties break by document order: values are offered in order, so when a
 * duplicate cannot be placed it is the LATER one that goes unmatched.
 */
export function scoreBlankGroup(
  group: BlankKey[],
  rawValues: Array<string | undefined>,
): BlankVerdict[] {
  const n = group.length;
  const students = group.map((_, i) =>
    prepareStudentValue(rawValues[i] ?? ''),
  );

  // slotToValue[s] = index of the value currently occupying slot s, or -1.
  const slotToValue: number[] = new Array<number>(n).fill(-1);

  const canFill = (valueIndex: number, slotIndex: number): boolean => {
    const value = students[valueIndex];
    const slot = group[slotIndex];
    if (!value || !slot) return false; // an empty value never fills a slot
    return scoreBlank(value, slot) === true;
  };

  const augment = (valueIndex: number, seen: boolean[]): boolean => {
    for (let s = 0; s < n; s++) {
      if (seen[s] || !canFill(valueIndex, s)) continue;
      seen[s] = true;
      const occupant = slotToValue[s];
      if (occupant === undefined) continue;
      if (occupant === -1 || augment(occupant, seen)) {
        slotToValue[s] = valueIndex;
        return true;
      }
    }
    return false;
  };

  for (let v = 0; v < n; v++) {
    if (!students[v]) continue; // empties never enter the matching
    augment(v, new Array<boolean>(n).fill(false));
  }

  const matched = new Array<boolean>(n).fill(false);
  for (const valueIndex of slotToValue) {
    if (valueIndex >= 0) matched[valueIndex] = true;
  }

  return group.map((_, i) => {
    const value = students[i] ?? '';
    // An empty group member is unscored, never wrong — same rule as a solo
    // blank, and the reason `matched` is not consulted for it.
    return value === '' ? null : matched[i] === true;
  });
}

// ---- feedback selection -----------------------------------------------------

/**
 * Pick the mistakeFeedback entry for a wrong answer, or null.
 *
 * Matching is trim + lowercase on BOTH sides, first match wins. Deliberately
 * LOOSER than scoring (which is case-sensitive): a student shouldn't lose
 * targeted help over capitalization, even though they can lose the mark for it.
 * That asymmetry is intentional in the runtime and is preserved here.
 *
 * The caller must only invoke this when the verdict is `false`. A correct or
 * unscored answer clears feedback — a stale "you probably forgot to
 * distribute" after the student fixes their answer is worse than silence.
 */
export function matchMistakeFeedback(
  raw: string,
  key: BlankKey,
): unknown[] | null {
  const needle = prepareStudentValue(raw).toLowerCase();
  if (needle === '') return null;
  for (const entry of key.mistakeFeedback) {
    if (trimValue(prepareKeyValue(entry.match)).toLowerCase() === needle) {
      return entry.feedback;
    }
  }
  return null;
}

/**
 * The feedback to return for one blank, following the runtime's precedence:
 * a matching mistakeFeedback entry wins; otherwise the generic hint; otherwise
 * nothing (mark-only, which ruling 2.1A names as the designed default).
 *
 * The hint fallback is RULED, not invented: 2.1A specifies the check response
 * as "{verdict, optional feedback} sourced from existing authored hint /
 * mistakeFeedback fields; hintless ✗ = mark-only". It does differ from the
 * published page, where the hint sits behind a separate always-available "?"
 * button — the viewer has no such button at check time, so a hint that never
 * surfaced would be authored help the student never receives. The corpus pins
 * this as an intentional difference rather than a parity break.
 */
export function selectBlankFeedback(
  raw: string,
  key: BlankKey,
  verdict: BlankVerdict,
): unknown[] | undefined {
  if (verdict !== false) return undefined;
  const mistake = matchMistakeFeedback(raw, key);
  if (mistake) return mistake;
  return key.hint ?? undefined;
}
