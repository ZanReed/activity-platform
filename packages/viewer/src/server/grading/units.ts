// =============================================================================
// units.ts — value/unit splitting for unit-bearing numeric blanks
// -----------------------------------------------------------------------------
// A unit-bearing blank ({{=1.5 unit: km/h}}) takes ONE input: the student
// types value and unit together, and grading splits them here. This module is
// deliberately SEPARATE from numeric.ts — that file is parity-frozen (its
// header pins the regexes character-for-character against the runtime corpus),
// so the split REUSES parseNumericValue rather than widening it: the numeric
// part of an entry is its LONGEST LEADING PREFIX that parseNumericValue
// accepts, and the trimmed remainder is the unit candidate. Reusing the parser
// wholesale is what makes "1 1/2 km/h" (interior space), "1.5km/h" (no
// space), "$3.50 per lb", "1,234 km" and "1.5e3 m" all split correctly with
// zero new numeric grammar.
// =============================================================================

import { parseNumericValue } from './numeric.js';

/** Longest-prefix guard: entries are student-typed strings; a hostile length
 * would turn the prefix scan quadratic. Far above any real quantity. */
const MAX_SPLIT_LENGTH = 200;

export interface SplitEntry {
  value: number;
  /** The trimmed text after the numeric part, or null when there was none. */
  unit: string | null;
}

/**
 * Split a raw entry into numeric value + trailing unit text. Returns null when
 * no leading prefix parses as a number (the caller falls back to whole-string
 * comparison, the "no solution" path).
 */
export function splitUnitEntry(raw: string): SplitEntry | null {
  const s = raw.trim();
  if (s.length === 0 || s.length > MAX_SPLIT_LENGTH) return null;
  for (let i = s.length; i >= 1; i--) {
    const value = parseNumericValue(s.slice(0, i));
    if (value !== null) {
      const unit = s.slice(i).trim();
      return { value, unit: unit.length > 0 ? unit : null };
    }
  }
  return null;
}

/**
 * Canonical form for unit comparison: case-insensitive, whitespace collapsed,
 * spaces around the operator characters removed, `·` unified to `*` — so
 * "KM / h" ≡ "km/h" and "N·m" ≡ "N * m". No dimensional analysis: "m/s" and
 * "meters per second" are DIFFERENT strings; the author lists alternates.
 */
export function normalizeUnit(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/·/g, '*')
    .replace(/\s+/g, ' ')
    .replace(/\s*([/*^])\s*/g, '$1');
}

/**
 * `²` → `^2` and `³` → `^3`, nothing else: the two spellings of ONE notation.
 * Shared by unit matching (canonicalUnit) and TEXT blanks (ruling D7), where a
 * typed `x²` must match a key of `x^2` now that every blank has a ² key. A
 * bare digit is never touched here: on a text blank `x2` can mean 2x or a
 * subscript, which is why normalize.ts refuses NFKC (it folds `x²` → `x2`).
 */
export function foldSuperscriptGlyphs(value: string): string {
  return value.replace(/²/g, '^2').replace(/³/g, '^3');
}

/**
 * normalizeUnit, plus the exponent spellings folded together (ruling SU-1,
 * docs/design/superscript-units.md): `m²` ≡ `m^2` ≡ `m2`, `cm³` ≡ `cm^3` ≡
 * `cm3`, `m/s²` ≡ `m/s2`. A student on a phone or Chromebook cannot easily
 * type `²`, so before this an authored `m²` with no alternates marked the
 * typed `m2` wrong.
 *
 * Applied to BOTH sides, so anything normalizeUnit already equated stays
 * equal: the fold only ever widens a match. ORDER MATTERS: the glyphs become
 * `^n` BEFORE the operator-space collapse, so `m ²` → `m ^2` → `m^2`. Only 2
 * and 3, and only a digit right after a LETTER at a token end: `100g`, `m4`
 * and `m 2` are left alone (a digit after a digit is part of a number; a
 * spaced digit is not an exponent anyone writes).
 */
export function canonicalUnit(raw: string): string {
  return normalizeUnit(foldSuperscriptGlyphs(raw)).replace(
    /([a-z])([23])(?![0-9a-z])/g,
    '$1^$2',
  );
}

/** Is the student's unit one of the accepted forms (canonical + alternates)? */
export function unitAccepted(
  studentUnit: string,
  unit: string,
  acceptableUnits: readonly string[] | undefined,
): boolean {
  const needle = canonicalUnit(studentUnit);
  if (needle === canonicalUnit(unit)) return true;
  for (const alt of acceptableUnits ?? []) {
    if (needle === canonicalUnit(alt)) return true;
  }
  return false;
}

/** The reserved mistakeFeedback match tokens for unit-bearing blanks. */
export const UNIT_MISSING_MATCH = 'unit-missing';
export const UNIT_WRONG_MATCH = 'unit-wrong';

export function isReservedUnitMatch(match: string): boolean {
  const m = match.trim().toLowerCase();
  return m === UNIT_MISSING_MATCH || m === UNIT_WRONG_MATCH;
}
