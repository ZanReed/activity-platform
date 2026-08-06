// =============================================================================
// printRosterCrossCheck.test.ts — roster ids ↔ e2e titles, both directions (A10)
// -----------------------------------------------------------------------------
// The BLOCK print roster derives from the registry and cannot drift. The
// structural and document rosters are hand-written — and drifted in both
// directions within three days of birth (s5-retro finding 7): an entry no e2e
// asserted ('structure/section-confidence', since deleted — the feature never
// existed on the viewer surface) and a spec no entry declared
// ('structure/reserved-work-space', since declared). Policy P4: a roster is
// derived or cross-checked, never merely written. These rosters cannot be
// derived (they name layout/document behaviors, not registry entries), so
// this is the cross-check: every declared id has a spec, every spec'd id is
// declared.
//
// This lives in the APP package because the e2e specs are app files — the
// roster is imported from the viewer, the titles are parsed from the spec
// source the same way the CSS break-list guard parses CSS (the parse-back
// bond pattern, T1a). The floor-pin in the viewer's printExpectations.test.ts
// stays hardcoded DELIBERATELY: it is external memory of what must exist, and
// deriving it from the roster would make it assert the roster against itself.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  documentPrintRoster,
  structuralPrintRoster,
} from '@activity/viewer';

const e2eDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'e2e',
);

/** Every `test('<structure|document>/<id> — …')` title in the print e2e files. */
function speccedIds(): Set<string> {
  const ids = new Set<string>();
  const files = readdirSync(e2eDir).filter(
    (f) => f.startsWith('print-') && f.endsWith('.e2e.ts'),
  );
  expect(files.length, 'no print e2e files found — did the lane move?').toBeGreaterThan(0);
  for (const file of files) {
    const source = readFileSync(join(e2eDir, file), 'utf8');
    for (const match of source.matchAll(
      /test\(\s*['"`]((?:structure|document)\/[a-z-]+)/g,
    )) {
      ids.add(match[1]!);
    }
  }
  return ids;
}

describe('structural/document print rosters ↔ e2e coverage', () => {
  const rosterIds = [...structuralPrintRoster, ...documentPrintRoster].map(
    (entry) => entry.id,
  );

  it('every declared roster id has at least one e2e spec titled with it', () => {
    const specced = speccedIds();
    const unasserted = rosterIds.filter((id) => !specced.has(id));
    expect(
      unasserted,
      `Roster entries with NO e2e asserting them — the roster claims coverage ` +
        `that does not exist. Write the spec (title it '<id> — …' in a ` +
        `print-*.e2e.ts) or delete the entry: ${unasserted.join(', ')}`,
    ).toEqual([]);
  });

  it('every e2e spec titled with a roster id is declared in the roster', () => {
    const undeclared = [...speccedIds()].filter(
      (id) => !rosterIds.includes(id),
    );
    expect(
      undeclared,
      `Print e2e specs asserting ids the roster never declared — coverage ` +
        `that exists by luck, invisible to the roster's readers. Declare them ` +
        `in printExpectations.ts: ${undeclared.join(', ')}`,
    ).toEqual([]);
  });
});
