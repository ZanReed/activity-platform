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

import { mathEquivalent, tokenizeMath } from '@activity/graph-kit/scorers';
import { checkExpressionSafety, MAX_TOKENIZED_LENGTH } from './guards.js';
import {
  splitUnitEntry,
  normalizeUnit,
  canonicalUnit,
  foldSuperscriptGlyphs,
  unitAccepted,
  isReservedUnitMatch,
  UNIT_MISSING_MATCH,
  UNIT_WRONG_MATCH,
} from './units.js';
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
  /** Required unit for a numeric blank ({{=1.5 unit: km/h}}). Absent ⇒ the
   * blank grades on the value alone (every pre-existing numeric blank).
   * When present the student's entry is split (units.ts) and BOTH halves must
   * be right — a missing unit is wrong, which is the diagnostic. */
  unit?: string;
  acceptableUnits?: string[];
  /** Only consulted for answerType 'math'. Absent ⇒ 'value'. 'form' is
   * "equal AND in the key's form" (D60, docs/design/form-grading.md); the
   * retired 'exact-form' is projected to 'form' by the walk. */
  equivalence: 'value' | 'form';
  /** Per-wrong-answer feedback. MathPrompts never carry it. `misconceptionId`
   * is the entry's opaque `mis.*` tag, returned on the check verdict. */
  mistakeFeedback: Array<{
    match: string;
    feedback: unknown[];
    misconceptionId?: string;
  }>;
  /** Generic help, shown when no mistakeFeedback entry matched. */
  hint: unknown[] | undefined;
  /** True when this blank continues the previous blank's interchangeable run. */
  interchangeableWithPrevious: boolean;
}

/** null = unscored (empty input). Mirrors the runtime's tri-state exactly. */
export type BlankVerdict = boolean | null;

// ---- single-blank scoring ---------------------------------------------------

function scoreText(student: string, key: BlankKey): boolean {
  // `x²` ≡ `x^2` on both sides (ruling D7); case and spacing stay exact.
  const folded = foldSuperscriptGlyphs(student);
  for (const entry of key.answers) {
    if (foldSuperscriptGlyphs(prepareKeyValue(entry)) === folded) return true;
  }
  return false;
}

function scoreNumeric(student: string, key: BlankKey): boolean {
  // Unit-bearing blank: split the entry and require BOTH halves. The split
  // reuses parseNumericValue via its longest-leading-prefix (units.ts), so
  // every accepted numeric form still works with a unit after it. An entry
  // with no parseable leading number falls through to the string fallback
  // below — "no solution" stays scoreable on a unit-bearing blank too.
  if (key.unit !== undefined) {
    const split = splitUnitEntry(student);
    if (split !== null) {
      if (
        split.unit !== null &&
        unitAccepted(split.unit, key.unit, key.acceptableUnits) &&
        valueMatchesKey(split.value, key)
      ) {
        return true;
      }
      // A parsed-but-wrong quantity never string-matches a key entry;
      // continuing to the generic loop below would let the bare value "1.5"
      // string-equal a key entry "1.5" and bypass the unit requirement.
      return false;
    }
    for (const entry of key.answers) {
      if (prepareKeyValue(entry) === student) return true;
    }
    return false;
  }

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

/** Is the value within tolerance of any numeric key answer? (The unit-bearing
 * path's value half; non-numeric key entries are the string fallback's job.) */
function valueMatchesKey(value: number, key: BlankKey): boolean {
  const tolerance = coerceTolerance(key.tolerance);
  for (const entry of key.answers) {
    const entryValue = parseNumericValue(prepareKeyValue(entry));
    if (entryValue !== null && numericallyClose(value, entryValue, tolerance)) {
      return true;
    }
  }
  return false;
}

/**
 * The student's math value, read by form grading's tokenizer and BOUNDED, or
 * null when it trips a bound (FG-14, ruling S4-B3). Called ONCE per value, and
 * a null means no engine work of any kind follows — no sampling, no mistake
 * matching, no shape, no `!form-wrong`: the value is simply `incorrect`.
 *
 * The raw value is held to the ordinary caps first (so the tokenizer never
 * sees an unbounded string), then the TOKENIZED string is held to them again,
 * with its implicit products counted, because the tokenizer splits letters:
 * 256 letters are 255 multiplications, which the raw count never saw.
 */
function boundedMathValue(student: string): string | null {
  // `x²` ≡ `x^2` on both sides (Fable review P1, 2026-10-17): every blank
  // shows a ² key, and the math engine reads only `^2`. Same widening-only
  // fold as text blanks (D7); a bare `x2` is still never a superscript.
  const folded = foldSuperscriptGlyphs(student);
  // The RAW value is held to length and balance only: its shape caps (the
  // tower, operator and depth counts) are run on the tokenized string, where
  // `x^2y^3` reads as `x^2 y^3` — on the raw string `^2y^` looked like a
  // tower and refused a correct index-law answer (Fable review, step 2).
  if (!checkExpressionSafety(folded, { lengthAndBalanceOnly: true }).ok) return null;
  const tokenized = tokenizeMath(folded);
  if (!tokenized) return null;
  if (
    !checkExpressionSafety(tokenized, {
      maxLength: MAX_TOKENIZED_LENGTH,
      countImplicitProducts: true,
    }).ok
  ) {
    return null;
  }
  return tokenized;
}

/** A key or `!` entry, prepared the way scoring compares it. */
const prepareMathEntry = (entry: string): string =>
  foldSuperscriptGlyphs(prepareKeyValue(entry));

/** Is the (bounded, tokenized) value value-equal to any key entry? The FG-5
 * "right value" test behind `!form-wrong` and the built-in line. */
function valueMatchesMathKey(tokenized: string, key: BlankKey): boolean {
  const tolerance = coerceTolerance(key.tolerance);
  for (const entry of key.answers) {
    const prepared = prepareMathEntry(entry);
    if (prepared && mathEquivalent(tokenized, prepared, { tolerance })) return true;
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
  const tokenized = boundedMathValue(student);
  if (tokenized === null) return false;
  const tolerance = coerceTolerance(key.tolerance);
  const mode = key.equivalence === 'form' ? 'form' : 'value';
  for (const entry of key.answers) {
    const prepared = prepareMathEntry(entry);
    // Parity: falsy entries are skipped rather than compared.
    if (prepared && mathEquivalent(tokenized, prepared, { mode, tolerance })) {
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
  return matchMistakeEntry(raw, key)?.feedback ?? null;
}

/** The full matched mistakeFeedback entry (same matching rules), so the caller
 * can read the misconception id alongside the feedback. */
export function matchMistakeEntry(
  raw: string,
  key: BlankKey,
): BlankKey['mistakeFeedback'][number] | null {
  const prepared = prepareStudentValue(raw);
  const needle = prepared.toLowerCase();
  if (needle === '') return null;

  if (key.answerType === 'math') return matchMathMistake(prepared, key);

  // On a NUMERIC blank, compare as numbers within the blank's tolerance —
  // reusing the same parser and closeness test that scoring uses, never a
  // second implementation (policy P2). An author who anticipates "divided the
  // wrong way" writes `!0.5` once; the student who types `1/2` or `.50`
  // demonstrated the same misconception and must match, or the sensor
  // under-counts by an unknowable factor and the student loses the targeted
  // feedback they earned. A non-numeric match string (e.g. "no solution")
  // falls through to the string comparison below, exactly as scoreNumeric
  // falls back for non-numeric key entries.
  // Unit-bearing blank: the whole entry no longer parses as a number, so the
  // plain numeric fast path below would go dark on exactly these blanks and
  // the sensor would under-count (the failure the comment below warns about).
  // Split first; reserved matches bind the two unit OUTCOMES (value right,
  // unit missing / wrong — derived locally, no verdict threading); authored
  // numeric matches compare on the VALUE PART, and a match string carrying its
  // own unit requires the units to agree as well.
  if (key.answerType === 'numeric' && key.unit !== undefined) {
    const split = splitUnitEntry(prepared);
    if (split !== null) {
      const valueOk = valueMatchesKey(split.value, key);
      for (const entry of key.mistakeFeedback) {
        const m = entry.match.trim().toLowerCase();
        if (m === UNIT_MISSING_MATCH && valueOk && split.unit === null) {
          return entry;
        }
        if (
          m === UNIT_WRONG_MATCH &&
          valueOk &&
          split.unit !== null &&
          !unitAccepted(split.unit, key.unit, key.acceptableUnits)
        ) {
          return entry;
        }
      }
      // TWO PASSES (ruling SU-2): the spelling the student typed first, then
      // the exponent-folded form. An author who wrote `!125 cm2 :: … typed
      // cm3 …` beside `!125 cm² :: …` gets the message for the spelling the
      // student actually used; `!22 m²` still catches a typed `22 m2`, which
      // the exact pass alone never did.
      const tolerance = coerceTolerance(key.tolerance);
      for (const sameUnit of [normalizeUnit, canonicalUnit]) {
        for (const entry of key.mistakeFeedback) {
          if (isReservedUnitMatch(entry.match)) continue;
          const matchSplit = splitUnitEntry(prepareKeyValue(entry.match));
          if (matchSplit === null) continue;
          if (!numericallyClose(split.value, matchSplit.value, tolerance)) {
            continue;
          }
          if (
            matchSplit.unit !== null &&
            (split.unit === null ||
              sameUnit(split.unit) !== sameUnit(matchSplit.unit))
          ) {
            continue;
          }
          return entry;
        }
      }
    }
    // String fallback, minus the reserved tokens — a student who literally
    // types "unit-missing" must not summon the outcome-bound entry. Folds
    // ² ↔ ^2 like the text fallback below (Fable review P2).
    for (const entry of key.mistakeFeedback) {
      if (isReservedUnitMatch(entry.match)) continue;
      const match = trimValue(prepareKeyValue(entry.match)).toLowerCase();
      if (foldSuperscriptGlyphs(match) === foldSuperscriptGlyphs(needle)) {
        return entry;
      }
    }
    return null;
  }

  if (key.answerType === 'numeric') {
    const studentValue = parseNumericValue(prepared);
    if (studentValue !== null) {
      const tolerance = coerceTolerance(key.tolerance);
      for (const entry of key.mistakeFeedback) {
        const entryValue = parseNumericValue(prepareKeyValue(entry.match));
        if (
          entryValue !== null &&
          numericallyClose(studentValue, entryValue, tolerance)
        ) {
          return entry;
        }
      }
    }
  }

  // Same superscript fold as scoreText (ruling D7): `!x²` catches a typed `x^2`.
  const foldedNeedle = foldSuperscriptGlyphs(needle);
  for (const entry of key.mistakeFeedback) {
    const match = trimValue(prepareKeyValue(entry.match)).toLowerCase();
    if (foldSuperscriptGlyphs(match) === foldedNeedle) {
      return entry;
    }
  }
  return null;
}

/** The reserved `!form-wrong` match (FG-5): fires only when the answer IS
 * value-equal to a key entry but in none of the keys' forms. A reserved token,
 * like units.ts's `!unit-missing`, so a student who literally types
 * "form-wrong" never summons it (the string pass skips it). */
export const FORM_WRONG_MATCH = 'form-wrong';

/** FG-5 step 4, the built-in line a form blank shows when the value is right,
 * the form is not, and nothing more specific was authored. A deliberate,
 * form-blanks-only departure from ruling 2.1A's "hintless ✗ = mark-only": a
 * student with the right value and a bare ✗ concludes the grader is broken. */
export const FORM_WRONG_LINE =
  "That's equal to the answer, but it isn't in the form the question asks for.";

const isFormWrongMatch = (match: string): boolean =>
  match.trim().toLowerCase() === FORM_WRONG_MATCH;

/**
 * FG-4: a `!` entry on a MATH blank matches by MEANING, not spelling. On a
 * form blank it matches when the answer is value-equal to the entry AND has
 * its shape (`!2(9x-6)` catches `2(9x - 6)`, `(9x-6)*2`, `-2(6-9x)`); on a
 * value blank, value equivalence alone (the verdict is already false, so
 * anything equal to the mistake IS the mistake). Per entry, in order, the
 * plain string pass is the fallback — it keeps every match that worked before
 * (matching lowercases, the engine doesn't: `!X` must still catch `x`) and
 * catches a non-math entry (`!no solution`). First match wins, as before.
 * A value that trips the bound (FG-14) matches nothing.
 */
function matchMathMistake(
  prepared: string,
  key: BlankKey,
): BlankKey['mistakeFeedback'][number] | null {
  const tokenized = boundedMathValue(prepared);
  if (tokenized === null) return null;
  const mode = key.equivalence === 'form' ? 'form' : 'value';
  const tolerance = coerceTolerance(key.tolerance);
  const foldedNeedle = foldSuperscriptGlyphs(prepared.toLowerCase());
  for (const entry of key.mistakeFeedback) {
    if (isFormWrongMatch(entry.match)) continue;
    const match = prepareMathEntry(entry.match);
    if (match && mathEquivalent(tokenized, match, { mode, tolerance })) return entry;
    if (foldSuperscriptGlyphs(trimValue(prepareKeyValue(entry.match)).toLowerCase()) === foldedNeedle) {
      return entry;
    }
  }
  return null;
}

/** The outcome of a WRONG blank: what the student is told and which
 * misconception it reads as. Empty for a correct or unscored blank. */
export interface BlankOutcome {
  feedback?: unknown[];
  misconceptionId?: string;
}

/**
 * Feedback + misconception for one blank, by FG-5's precedence:
 *   1. a matching `!` entry (FG-4), with its message and `mis.*`;
 *   2. else, on a FORM blank whose value is right, the `!form-wrong` entry;
 *   3. else the `?hint`;
 *   4. else, on a form blank whose value is right, FORM_WRONG_LINE.
 * An entry with a binding and no prose still sends its `mis.*` but falls
 * through to the next step for the message (the `!21 :: mis.x` rule).
 *
 * `group` is the blank's `~` run (FG-4): `!form-wrong` and the built-in line
 * fire when the value is value-equal to ANY slot's key in it, so a student who
 * typed `x+1+1` into the `x+3` slot of a pair keyed `x+2`, `x+3` still learns
 * it is a form matter. Each slot's OWN `!` and `!form-wrong` entries are used.
 */
export function selectBlankOutcome(
  raw: string,
  key: BlankKey,
  verdict: BlankVerdict,
  group: readonly BlankKey[] = [key],
): BlankOutcome {
  if (verdict !== false) return {};
  const mistake = matchMistakeEntry(raw, key);
  let misconceptionId = mistake?.misconceptionId;
  if (mistake && mistake.feedback.length > 0) {
    return { feedback: mistake.feedback, ...(misconceptionId ? { misconceptionId } : {}) };
  }

  // The form outcome: right value, wrong form. Computed only for a form
  // blank, and only on a bounded value (a null skips all of it, FG-14).
  let wrongForm = false;
  if (key.answerType === 'math' && key.equivalence === 'form') {
    const tokenized = boundedMathValue(prepareStudentValue(raw));
    // …and in no slot's FORM: a `~` duplicate (`x+2` typed twice for a pair
    // keyed `x+2`, `x+3`) is a duplicate, not a form matter (Fable review).
    wrongForm =
      tokenized !== null &&
      group.some((slot) => slot.answerType === 'math' && valueMatchesMathKey(tokenized, slot)) &&
      !group.some(
        (slot) => slot.answerType === 'math' && slot.equivalence === 'form' && scoreMath(tokenized, slot),
      );
  }
  // A matched `!` entry outranks `!form-wrong` (step 1 before 2): its `mis.*`
  // is the reading. One with no prose falls through to the next step for the
  // MESSAGE, which is `!form-wrong`'s (ruled reading of FG-5, step 2 review).
  if (wrongForm) {
    const formWrong = key.mistakeFeedback.find((m) => isFormWrongMatch(m.match));
    if (formWrong) {
      misconceptionId ??= formWrong.misconceptionId;
      if (formWrong.feedback.length > 0) {
        return { feedback: formWrong.feedback, ...(misconceptionId ? { misconceptionId } : {}) };
      }
    }
  }
  const mis = misconceptionId ? { misconceptionId } : {};
  if (key.hint) return { feedback: key.hint, ...mis };
  if (wrongForm) {
    return { feedback: [{ type: 'text', text: FORM_WRONG_LINE }], ...mis };
  }
  return mis;
}

/** The matched entry's misconception id for a WRONG answer, or undefined.
 * Same gate and precedence as selectBlankOutcome (it is that function's id). */
export function selectBlankMisconception(
  raw: string,
  key: BlankKey,
  verdict: BlankVerdict,
  group?: readonly BlankKey[],
): string | undefined {
  return selectBlankOutcome(raw, key, verdict, group).misconceptionId;
}

/**
 * The feedback to return for one blank, following the runtime's precedence:
 * a matching mistakeFeedback entry wins; otherwise the generic hint; otherwise
 * nothing (mark-only, which ruling 2.1A names as the designed default) — and,
 * on a FORM blank only, FG-5's `!form-wrong` and built-in line (see
 * selectBlankOutcome, which this reads).
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
  group?: readonly BlankKey[],
): unknown[] | undefined {
  // An entry may carry a binding and NO prose (`!21 :: mis.x`) — the author
  // wanted the sensor, not a message. That is not targeted feedback, so it
  // falls through to the hint like any unmatched wrong answer, and the empty
  // array never reaches the wire as a feedback field with nothing in it.
  return selectBlankOutcome(raw, key, verdict, group).feedback;
}
