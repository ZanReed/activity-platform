// =============================================================================
// preview/draftPreview.ts — a teacher's draft, as a student would get it
// (schema-shortlist.md S8, author ruling 2026-11-15: "really check, nothing
// saved")
// -----------------------------------------------------------------------------
// The editor's "Preview as student" runs the same steps the read path and the
// check path run, in the browser, on the DRAFT, and keeps nothing:
//   serve:  seeded numbers drawn (as for one preview student) → sanitize (the
//           answer keys, hints and solutions leave) → the seed specs leave the
//           meta → ordering lists shuffled, so a list is not served in its
//           answer order;
//   check:  gradeSection on the same seeded document with the served
//           orderings — the real grader, so ✓ / ✗, feedback, hints and the
//           solution unlock are what a student would see.
// Nothing is recorded: no request leaves the browser. Released teacher
// feedback is always "not graded" — there is no teacher grade on a draft.
//
// NOT covered, and said so in the preview's banner: a DoL section's own forms
// and retake (it is checked as an ordinary section here).
//
// Loaded only when a teacher opens the preview (the editor imports it
// lazily), so the grading engine never rides any student page.
// =============================================================================

import type { ActivityDocument, SeedVar } from '@activity/schema';
import { sanitizeActivityDocument } from '../sanitize/sanitize.js';
import { deriveSeedValues } from '../sanitize/seedValues.js';
import { substituteSeedValues } from '../sanitize/substitute.js';
import { applyServeShuffles } from '../sanitize/shuffle.js';
import type { SanitizedActivityDocument } from '../sanitize/sanitized-types.js';
import { gradeSection } from '../server/grading/index.js';
import { CHECK_WIRE_VERSION, type CheckService } from '../check/wire.js';

export interface DraftPreview {
  served: SanitizedActivityDocument;
  checkService: CheckService;
  /** True when the draft has a DoL section, which the preview checks plainly. */
  hasDol: boolean;
}

type Walkable = { sections: Array<{ dol?: unknown; rows: Array<{ columns: Array<{ blocks: unknown[] }> }> }> };

/** Each ordering block's item ids, in the order they were SERVED. */
function servedOrderingsOf(doc: Walkable): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const visit = (block: Record<string, unknown>) => {
    if (block.type === 'ordering' && Array.isArray(block.items)) {
      out[String(block.id)] = (block.items as { id: string }[]).map((i) => i.id);
    }
    for (const v of Object.values(block)) {
      if (Array.isArray(v)) for (const c of v) if (c && typeof c === 'object' && 'type' in c) visit(c as Record<string, unknown>);
    }
  };
  for (const s of doc.sections) for (const r of s.rows) for (const c of r.columns) for (const b of c.blocks) visit(b as Record<string, unknown>);
  return out;
}

/**
 * Build the preview of `draft`. `seed` names the preview student, so the
 * teacher can draw again ("another student") and see other numbers.
 */
export function buildDraftPreview(draft: ActivityDocument, seed: string): DraftPreview {
  const seedVars = (draft.meta as { seedVars?: SeedVar[] }).seedVars ?? [];
  const values = seedVars.length > 0 ? deriveSeedValues(seedVars, seed) : {};
  const seeded = seedVars.length > 0 ? substituteSeedValues(draft, values) : draft;

  let served = sanitizeActivityDocument(seeded as ActivityDocument);
  const meta = { ...(served.meta as Record<string, unknown>) };
  delete meta.seedVars;
  served = applyServeShuffles({ ...served, meta } as SanitizedActivityDocument, `preview:${seed}`);
  const servedOrderings = servedOrderingsOf(served as unknown as Walkable);

  const checkService: CheckService = {
    async checkSection(request) {
      return gradeSection({
        document: seeded as never,
        sectionId: request.sectionId,
        responses: request.responses,
        servedOrderings,
        seedValues: values,
      });
    },
    async fetchReleasedFeedback() {
      return { graded: false, blocks: {} };
    },
  };

  return {
    served,
    checkService,
    hasDol: (draft.sections as Array<{ dol?: unknown }>).some((s) => s.dol !== undefined),
  };
}

export { CHECK_WIRE_VERSION };
