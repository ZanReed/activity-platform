// =============================================================================
// glossary-body.ts — validating a definition body the server did not sanitize
// -----------------------------------------------------------------------------
// Split from glossary.ts so the pure core stays zod-free: the student viewer
// imports glossary.ts eagerly and loads THIS module only inside its store read,
// which keeps zod out of the student shell (perf budget, ruling D16).
//
// Why it exists (docs/design/glossary.md EN-8): activity content reaches a
// student through get-activity's sanitize; glossary rows arrive through an RPC
// and do not. That is safe only while a definition body can carry nothing
// gradeable. DefinitionContentInline CAN hold a prompted math_inline (a
// gradeable gap whose answer would ship to the browser), so a body carrying
// one is REJECTED here rather than trusted to the writer. Widening
// DefinitionBlock means re-reading this file.
// =============================================================================

import { z } from 'zod';
import { DefinitionBlock } from './inline.js';

const BodySchema = z.array(DefinitionBlock);

function carriesPrompts(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(carriesPrompts);
  if (value === null || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  if (Array.isArray(obj.prompts) && obj.prompts.length > 0) return true;
  return Object.values(obj).some(carriesPrompts);
}

/**
 * A definition body from a source the server did not sanitize (the glossary
 * file, the read RPC). Null when it is not a DefinitionBlock array, or when it
 * carries a prompted math_inline.
 */
export function parseGlossaryBody(raw: unknown): DefinitionBlock[] | null {
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return null;
  if (carriesPrompts(parsed.data)) return null;
  return parsed.data;
}
