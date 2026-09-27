// =============================================================================
// glossary/parsePayload.ts — validating what glossary_for_activity returns
// -----------------------------------------------------------------------------
// A separate module so the store read can import it LAZILY: validation needs
// zod (via the schema's DefinitionBlock), and zod must stay out of the student
// shell. Rows are validated one by one — a bad row is dropped and counted,
// never fatal — because the RPC's bodies skip the server sanitize (EN-8).
// =============================================================================

import {
  GLOSSARY_MAX_ENTRIES,
  parseGlossaryBody,
  parseGlossaryVariants,
  type GlossarySourceEntry,
} from '@activity/schema';

export interface ParsedGlossaryPayload {
  readonly entries: GlossarySourceEntry[];
  /** Rows dropped because their body failed validation (EN-8). */
  readonly dropped: number;
  readonly capped: boolean;
  readonly published: boolean;
}

/** Validate an RPC payload row by row; a bad row is dropped, never fatal.
 * null ⇒ not a published activity this user can open (R1). */
export function parseGlossaryPayload(raw: unknown): ParsedGlossaryPayload {
  if (raw === null || raw === undefined) {
    return { entries: [], dropped: 0, capped: false, published: false };
  }
  const obj = raw as { entries?: unknown; capped?: unknown };
  const rows = Array.isArray(obj.entries) ? obj.entries : [];
  const entries: GlossarySourceEntry[] = [];
  let dropped = 0;
  for (const row of rows.slice(0, GLOSSARY_MAX_ENTRIES)) {
    const r = row as Record<string, unknown>;
    const body = parseGlossaryBody(r.body);
    if (
      typeof r.term_id !== 'string' ||
      !r.term_id ||
      typeof r.term !== 'string' ||
      !r.term.trim() ||
      body === null
    ) {
      dropped += 1;
      continue;
    }
    entries.push({
      id: r.term_id,
      term: r.term.trim(),
      variants: parseGlossaryVariants(r.variants),
      body,
      retired: r.retired === true,
      source: 'store',
    });
  }
  return { entries, dropped, capped: obj.capped === true, published: true };
}

