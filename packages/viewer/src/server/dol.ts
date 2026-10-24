// =============================================================================
// server/dol.ts — the DoL on the two server paths (curriculum D65)
// -----------------------------------------------------------------------------
// docs/design/dol-retake.md DL-6/7/8/10, DE-1, DE-6, DE-7.
//
//   seedContextFor  the substituted document, the values and the shuffle key
//                   one section is graded (or restored) against. The DoL
//                   section gets ITS form's values and key; every other
//                   section gets the activity's. Check and restore both call
//                   it, so a restored attempt-2 row is rebuilt against form 2
//                   (DE-1d), never against form 1.
//   dolPrimary      the DoL's primary item — the first gradable block, the
//                   importer's own rule (DL-2) — and whether it is a rubric.
//   primaryCorrect  every auto-graded verdict in that block correct (C-151:
//                   all blanks right). A rubric primary is never auto-passed:
//                   the teacher's tick decides (DL-11).
// =============================================================================

import type { SeedVar } from '@activity/schema';
import { serveSeed } from '../sanitize/serveSeed.js';
import { deriveSeedValues, type SeedValues } from '../sanitize/seedValues.js';
import { substituteBySection } from '../sanitize/substitute.js';
import { deriveDolValues, dolSeedKey, findDolSection } from '../sanitize/dolForm.js';
import { inventorySection, type RawSection } from './grading/walk.js';
import type { SectionCheckResult } from '../check/wire.js';
import type { DolPrimary } from './dolPrimary.js';

export { dolPrimary } from './dolPrimary.js';

export interface SeedContext {
  /** The document with every section substituted for this student. */
  readonly doc: unknown;
  /** The values the requested section's answer keys resolve against. */
  readonly seedValues: SeedValues;
  /** The requested section's shuffle key (undefined = the serve seed). */
  readonly seedKey?: string;
}

/** See the file header. `form` matters only when `sectionId` is the DoL. */
export function seedContextFor(
  rawDoc: unknown,
  versionId: string,
  studentId: string,
  sectionId: string,
  form: number,
): SeedContext {
  const base = serveSeed(versionId, studentId);
  const seedVars = ((rawDoc as { meta?: { seedVars?: SeedVar[] } }).meta?.seedVars) ?? [];
  const activityValues = seedVars.length > 0 ? deriveSeedValues(seedVars, base) : {};
  const dol = findDolSection(rawDoc);
  if (!dol) {
    return { doc: substituteBySection(rawDoc, activityValues), seedValues: activityValues };
  }
  const isDol = dol.id === sectionId;
  const dolForm = isDol ? form : 1;
  const dolValues = deriveDolValues(dol.dol, base, dolForm);
  return {
    doc: substituteBySection(rawDoc, activityValues, { id: dol.id, values: dolValues }),
    seedValues: isDol ? dolValues : activityValues,
    ...(isDol ? { seedKey: dolSeedKey(base, dolForm) } : {}),
  };
}

/** Every auto-graded item of the primary block correct (DE-7). */
export function primaryCorrect(
  primary: DolPrimary | null,
  items: SectionCheckResult['items'],
): boolean {
  if (!primary || primary.rubric) return false;
  const inv = inventorySection({ rows: [{ columns: [{ blocks: [primary.block] }] }] } as unknown as RawSection);
  if (inv.freeText.length > 0) return false;
  const expected = [
    ...inv.blankGroupsByBlock.flatMap((g) => g.keys.map((k) => k.id)),
    ...inv.multipleChoice.map((m) => m.blockId),
    ...inv.matching.map((m) => m.blockId),
    ...inv.correspondence.map((c) => c.blockId),
    ...inv.ordering.map((o) => o.blockId),
    ...inv.graphs.map((g) => g.blockId),
  ];
  return expected.length > 0 && expected.every((id) => items[id]?.verdict === 'correct');
}
