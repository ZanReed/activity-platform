// =============================================================================
// sanitize/dolForm.ts — the DoL's parallel forms (curriculum D65)
// -----------------------------------------------------------------------------
// docs/design/dol-retake.md DL-3, DL-6, DE-1, DE-6, DE-13.
//
// A `{checkpoint dol}` section carries its OWN seed: one valid-row table per
// group of linked variables, enumerated at import (Section.dol.seed). A form
// is one row per group. Form 1 draws from the ordinary serve seed, so a
// student's first attempt is exactly what they would have been served before
// the retake existed; form n ≥ 2 draws from `${seed}:dol:${n}`, and DE-13
// forbids it from landing on form 1's row in any group that has a choice.
//
// The DoL section's shuffles use the same per-form seed key (dolSeedKey), so
// a retake re-orders its choices too, and the grader recomputes that order.
//
// ONE seam, both sides — the read path serves with it, the grader grades with
// it, and the print twin prints with it (the two-spellings rule that
// serveSeed exists for). Leaf discipline, like seedValues.ts: the prng leaf and
// types only; both server bundles and the app import this.
// =============================================================================

import { mulberry32, seedFrom } from './prng.js';
import type { SeedValues } from './seedValues.js';

/** The stored table shape (BankValueTable), structurally — this leaf imports
 *  no zod. */
export interface DolTable {
  readonly columns: readonly string[];
  readonly rows: readonly (readonly number[])[];
}

/** Section.dol, structurally. */
export interface DolSpec {
  readonly skills?: readonly string[];
  readonly seed?: { readonly tables: readonly DolTable[] };
  readonly retake?: boolean;
}

/** The DoL section of a document (raw or sanitized), or null. */
export function findDolSection(doc: unknown): { id: string; dol: DolSpec } | null {
  const sections = (doc as { sections?: unknown } | null)?.sections;
  if (!Array.isArray(sections)) return null;
  for (const s of sections as Array<Record<string, unknown>>) {
    if (s && typeof s === 'object' && s.dol && typeof s.dol === 'object' && typeof s.id === 'string') {
      return { id: s.id, dol: s.dol as DolSpec };
    }
  }
  return null;
}

/** The seed key a form's shuffles and draws use. */
export function dolSeedKey(baseSeed: string, form: number): string {
  return form <= 1 ? baseSeed : `${baseSeed}:dol:${form}`;
}

function rowIndex(key: string, rows: number): number {
  return Math.floor(mulberry32(seedFrom(key))() * rows);
}

/** Group g's row for a form (DE-13: form ≥ 2 never repeats form 1's row when
 *  the group has more than one). */
export function dolRowIndex(baseSeed: string, group: number, rows: number, form: number): number {
  if (rows <= 1) return 0;
  const first = rowIndex(`${baseSeed}:dol:g${group}`, rows);
  if (form <= 1) return first;
  const drawn = rowIndex(`${dolSeedKey(baseSeed, form)}:g${group}`, rows);
  return drawn === first ? (drawn + 1) % rows : drawn;
}

/** name → value for one form of the DoL (empty when the DoL is unseeded). */
export function deriveDolValues(dol: DolSpec, baseSeed: string, form: number): SeedValues {
  const out: SeedValues = {};
  (dol.seed?.tables ?? []).forEach((table, g) => {
    const row = table.rows[dolRowIndex(baseSeed, g, table.rows.length, form)] ?? table.rows[0] ?? [];
    table.columns.forEach((name, i) => {
      const v = row[i];
      if (typeof v === 'number') out[name] = v;
    });
  });
  return out;
}

/** How many attempts the DoL allows (DL-5, DL-7). */
export function dolAllowance(dol: DolSpec): 1 | 2 {
  return dol.retake === true ? 2 : 1;
}

/** Strip the answer-bearing / teacher-side fields from a served DoL (DE-6):
 *  the seed table (it holds every answer value) and the skill ids (skill ids
 *  stay off the student wire, as `skill:` does). The viewer reads only the
 *  allowance; the per-student state rides beside it. */
export function servedDol<T extends { dol?: unknown }>(
  section: T,
  state: DolServedState,
): T {
  return { ...section, dol: state };
}

/** What a student's DoL section carries on the wire. */
export interface DolServedState {
  /** 1 or 2 (DL-7). */
  readonly allowance: 1 | 2;
  /** Attempts already recorded on this version. */
  readonly attempts: number;
  /** The form these values are (1 or 2). */
  readonly form: number;
  /** A retake could be started now (next practice day reached, and a rubric
   *  primary marked). */
  readonly retakeOpen: boolean;
  /** The student holds the pass for this DoL's skill. */
  readonly passed: boolean;
}

/** The form to serve (DE-1): form 1 until attempt 1; still form 1 — frozen —
 *  until the retake opens; then form 2; after the last attempt, that attempt's
 *  form. */
export function formToServe(allowance: 1 | 2, attempts: number, retakeOpen: boolean): number {
  if (attempts <= 0) return 1;
  if (attempts >= allowance) return Math.min(attempts, allowance);
  return retakeOpen ? attempts + 1 : attempts;
}
