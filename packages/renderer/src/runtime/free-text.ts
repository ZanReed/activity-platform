// =============================================================================
// runtime/free-text.ts — free-text capture (self_explanation / short_answer /
// essay)
// -----------------------------------------------------------------------------
// One runtime for all three free-text block types. The whole job: keep each
// textarea value persisted and include it in the submit payload. There is NO
// scoring and NO RuntimeState entry — the textarea is its own source of truth
// (like the name input). wireFreeText attaches an `input` handler that triggers
// onUpdate (render+persist) and, for an essay, refreshes its live word counter;
// persistence snapshots the value into the blob's `freeTexts` map (storage.ts)
// and restores it at bootstrap.
// =============================================================================

import type { Refs, FreeTextRef } from './refs.js';

// Count words the way a student expects — whitespace-separated runs. Empty /
// whitespace-only → 0. The dashboard's compute-on-read count uses the identical
// rule (the count is never stored in the wire).
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

// Refresh an essay's word counter: "N words" (+ " · aim for min–max" when a
// target is set) and an in-range / out-of-range class the stylesheet colours.
function updateWordCount(ref: FreeTextRef): void {
  if (!ref.wordCountEl) return;
  const n = countWords(ref.textarea.value);
  const noun = n === 1 ? 'word' : 'words';
  const { wordMin, wordMax } = ref;
  let label = n + ' ' + noun;
  ref.wordCountEl.classList.remove('in-range', 'out-of-range');
  if (wordMin !== null || wordMax !== null) {
    const target =
      wordMin !== null && wordMax !== null
        ? wordMin + '–' + wordMax
        : wordMin !== null
          ? '≥ ' + wordMin
          : '≤ ' + wordMax;
    label += ' · aim for ' + target;
    // Only judge range once the student has started writing.
    if (n > 0) {
      const belowMin = wordMin !== null && n < wordMin;
      const aboveMax = wordMax !== null && n > wordMax;
      ref.wordCountEl.classList.add(
        belowMin || aboveMax ? 'out-of-range' : 'in-range',
      );
    }
  }
  ref.wordCountEl.textContent = label;
}

/** Attach the persist-on-input handler to every free-text textarea; seed the
 *  essay counters from any restored value. */
export function wireFreeText(refs: Refs, onUpdate: () => void): void {
  for (const [, ref] of refs.freeText) {
    updateWordCount(ref); // reflect a restored value on load
    ref.textarea.addEventListener('input', () => {
      updateWordCount(ref);
      onUpdate();
    });
  }
}

/** Mirrors schema FreeResponse — one free-text block's answer. */
export interface FreeResult {
  text: string;
}

/**
 * Gather the submit payload map: freeResponses[blockId] = { text }. Trimmed;
 * an empty / whitespace-only response is an omission (absent from the map), the
 * same omission rule the other response maps use. Returns undefined when
 * nothing was written, so the field stays out of the payload entirely.
 */
export function gatherFreeResponses(
  refs: Refs,
): Record<string, FreeResult> | undefined {
  let out: Record<string, FreeResult> | undefined;
  for (const [blockId, ref] of refs.freeText) {
    const text = ref.textarea.value.trim();
    if (text.length === 0) continue;
    (out ??= {})[blockId] = { text };
  }
  return out;
}
