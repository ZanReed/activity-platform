// =============================================================================
// container/dolOptional.ts — which DoL answers are optional to mark (D77)
// -----------------------------------------------------------------------------
// Not in @activity/schema on purpose: the barrel is in both Edge Function
// bundles, and the servers have no use for this. Moving it there would change
// the deployed bundles' bytes for nothing.
// =============================================================================

import { isGradeable, type Block } from '@activity/schema';

/** The blocks of a document's DoL section that are OPTIONAL to mark (curriculum
 *  D77): every short answer or essay after the primary item, the section's first
 *  gradable block (DL-2). Mirrors dol_optional_block (0075), which decides
 *  "to grade" on the server. */
export function dolOptionalBlockIds(doc: {
  sections?: ReadonlyArray<{
    dol?: unknown;
    rows?: ReadonlyArray<{ columns?: ReadonlyArray<{ blocks?: ReadonlyArray<unknown> }> }>;
  }>;
}): ReadonlySet<string> {
  const section = doc.sections?.find((s) => s.dol !== undefined && s.dol !== null);
  const gradable = (section?.rows ?? [])
    .flatMap((r) => r.columns ?? [])
    .flatMap((c) => c.blocks ?? [])
    .filter((b) => isGradeable(b as Block)) as Array<{ id: string; type: string }>;
  return new Set(
    gradable.slice(1).filter((b) => b.type === 'short_answer' || b.type === 'essay').map((b) => b.id),
  );
}
