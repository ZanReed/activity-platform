// =============================================================================
// document.ts — Top-level ActivityDocument and Section schemas
// -----------------------------------------------------------------------------
// ActivityDocument is what gets stored in activities.draft_content and
// activity_versions.content. The shape lives in this package as the single
// source of truth — the renderer parses it, the editor produces it via the
// serialize layer, the database stores it as jsonb.
//
// schemaVersion is the migration anchor. When a future schema needs a
// non-trivial migration (e.g., changing how marks are represented), bump
// the version and write a migrate(N -> N+1) function. Old versions in
// activity_versions stay at their original schemaVersion forever; migrations
// happen on read, never by mutating stored versions.
// =============================================================================

import { z } from 'zod';
import { Block } from './blocks/index.js';

// Section: a collection of blocks with an optional title. Sections are
// organizational only — they don't constrain content or layout. Phase 2+
// may add per-section tinting (color background) but Phase 1 is plain.
export const Section = z.object({
  id: z.string().uuid(),
  title: z.string().optional(),
  blocks: z.array(Block),
});
export type Section = z.infer<typeof Section>;

// Meta: the activity's title, course, unit, etc. Not used in rendering of
// the body — drives the published HTML's <title> and header banner.
export const ActivityMeta = z.object({
  title: z.string().min(1),
  course: z.string().default('Algebra II'),
  unit: z.string().optional(),
});
export type ActivityMeta = z.infer<typeof ActivityMeta>;

// The top-level document. Always validate user-facing input through this
// before storing. The Edge Functions parse incoming drafts with this schema
// and reject malformed documents with a 400.
export const ActivityDocument = z.object({
  schemaVersion: z.literal(1),
  meta: ActivityMeta,
  sections: z.array(Section),
});
export type ActivityDocument = z.infer<typeof ActivityDocument>;
