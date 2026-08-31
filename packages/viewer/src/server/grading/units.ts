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

/** Is the student's unit one of the accepted forms (canonical + alternates)? */
export function unitAccepted(
  studentUnit: string,
  unit: string,
  acceptableUnits: readonly string[] | undefined,
): boolean {
  const needle = normalizeUnit(studentUnit);
  if (needle === normalizeUnit(unit)) return true;
  for (const alt of acceptableUnits ?? []) {
    if (needle === normalizeUnit(alt)) return true;
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
