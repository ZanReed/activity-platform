// =============================================================================
// store/restore.ts — bring a student's earlier checked work back on open
// -----------------------------------------------------------------------------
// The walkthrough finding (2026-10-14): a student who checked a section, signed
// out (which wipes the device, by design for shared Chromebooks) and reopened
// the activity saw a blank worksheet. Their checks were on the server the whole
// time; nothing read them back. docs/design/student-experience-review.md, S3,
// eng review D4–D7:
//
//   open ─► sections still UNTOUCHED on this device (isSectionUntouched)
//            │ none ─► done
//            ▼
//          the student's own checked section ids on this version (a cheap,
//          RLS-scoped database read, D5) ∩ untouched
//            │ none ─► done (no call to the check function, no banner)
//            ▼
//          store.restoreSections ─► check-activity restore mode ─► merge into
//          sections still untouched AT MERGE TIME (D4)
//
// It runs on EVERY open (D7), because a device that kept an older copy is the
// same problem as a device that kept none, section by section.
// =============================================================================

import type { DocumentIndex } from '../container/blockIndex.js';
import { isSectionUntouched, type RestoreOutcome, type ViewerStore } from './store.js';

export interface RestoreEarlierWorkOptions {
  store: ViewerStore;
  index: DocumentIndex;
  /** The signed-in student's checked section ids on the served version. */
  checkedSectionIds: () => Promise<string[]>;
}

/** Never throws: a failure is the 'failed' outcome, which the route shows as a
 * banner with Retry. */
export async function restoreEarlierWork(
  options: RestoreEarlierWorkOptions,
): Promise<RestoreOutcome> {
  const { store, index } = options;
  const state = store.getState();
  const untouched = index.sections
    .filter((section) => isSectionUntouched(state, section.sectionId, section.items))
    .map((section) => section.sectionId);
  if (untouched.length === 0) return 'nothing';

  let checked: string[];
  try {
    checked = await options.checkedSectionIds();
  } catch {
    return 'failed';
  }
  const onServer = new Set(checked);
  const needed = untouched.filter((id) => onServer.has(id));
  if (needed.length === 0) return 'nothing';

  return store.restoreSections(
    needed,
    Object.fromEntries(index.sections.map((section) => [section.sectionId, section.items])),
  );
}
