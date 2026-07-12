// =============================================================================
// runtime/self-explanations.ts — Ungraded free-text capture
// -----------------------------------------------------------------------------
// The whole runtime job for a self_explanation block: keep the textarea value
// persisted and include it in the submit payload. There is NO scoring, NO
// RuntimeState entry — the textarea is its own source of truth (like the name
// input). wireSelfExplanations attaches an `input` handler that just triggers
// onUpdate (which render+persists); persistence snapshots the value into the
// blob's `freeTexts` map (storage.ts) and restores it at bootstrap.
// =============================================================================

import type { Refs } from './refs.js';

/** Attach the persist-on-input handler to every self-explanation textarea. */
export function wireSelfExplanations(refs: Refs, onUpdate: () => void): void {
  for (const [, ref] of refs.selfExplanations) {
    ref.textarea.addEventListener('input', () => onUpdate());
  }
}

/** Mirrors schema FreeResponse — one self_explanation block's answer. */
export interface FreeResult {
  text: string;
}

/**
 * Gather the submit payload map: freeResponses[blockId] = { text }. Trimmed;
 * an empty / whitespace-only response is an omission (absent from the map),
 * the same omission rule the other response maps use. Returns undefined when
 * nothing was written, so the field stays out of the payload entirely.
 */
export function gatherFreeResponses(
  refs: Refs,
): Record<string, FreeResult> | undefined {
  let out: Record<string, FreeResult> | undefined;
  for (const [blockId, ref] of refs.selfExplanations) {
    const text = ref.textarea.value.trim();
    if (text.length === 0) continue;
    (out ??= {})[blockId] = { text };
  }
  return out;
}
