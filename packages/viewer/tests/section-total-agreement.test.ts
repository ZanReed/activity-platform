// =============================================================================
// section-total-agreement.test.ts — one definition of "done" (eng finding 6)
// -----------------------------------------------------------------------------
// Two places count a version's sections (student-experience review S1/S5):
// check-activity writes section_total from the RAW document (0059), and the
// student's page counts the SERVED document's indexed sections for "k of n
// sections checked" and the completion panel. If they ever disagree, Home says
// "Done" while the activity says "3 of 4". Both count every section, because
// every section sits in a check group and every member of a pressed group is
// recorded; this pins that the sanitizer never adds or drops one on the way out.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { indexDocument } from '../src/container/blockIndex.js';
import { authoredFixtureDocument, servedFixtureDocument } from '../src/fixtures/index.js';
import { checkGroups } from '../src/container/checkGroups.js';
import { sanitizeActivityDocument } from '../src/sanitize/sanitize.js';

/** The fixture with its one section cloned twice under fresh ids, so the count
 * comparison has something to disagree about. */
function multiSectionRaw(): { sections: Array<{ id: string }> } {
  const raw = authoredFixtureDocument() as unknown as { sections: Array<{ id: string }> };
  const first = raw.sections[0]!;
  const clone = (n: number) => ({ ...structuredClone(first), id: `aaaaaaaa-0000-4000-8000-00000000000${n}` });
  return { ...raw, sections: [first, clone(1), clone(2)] };
}

describe('the served section count equals the raw section count', () => {
  it('on the authored/served fixture pair', () => {
    const raw = authoredFixtureDocument() as unknown as { sections: unknown[] };
    const served = indexDocument(servedFixtureDocument() as never);
    expect(served.sections.length).toBe(raw.sections.length);
  });

  it('on a three-section document through the real sanitizer', () => {
    const raw = multiSectionRaw();
    const served = indexDocument(sanitizeActivityDocument(raw as never) as never);
    expect(raw.sections.length).toBe(3);
    expect(served.sections.map((s) => s.sectionId)).toEqual(raw.sections.map((s) => s.id));
  });

  it('every indexed section is covered by exactly one check group, in every mode', () => {
    const index = indexDocument(servedFixtureDocument() as never);
    for (const mode of ['single', 'free', 'locked'] as const) {
      const covered = checkGroups(index, mode).flatMap((g) => g.sections.map((s) => s.sectionId));
      expect(covered).toEqual(index.sections.map((s) => s.sectionId));
    }
  });
});
