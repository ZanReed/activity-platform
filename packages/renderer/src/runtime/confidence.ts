// =============================================================================
// runtime/confidence.ts — Per-block confidence rating capture
// -----------------------------------------------------------------------------
// Confidence is captured per fill_in_blank BLOCK (one fieldset per block,
// applied uniformly to every blank in that block at submission time).
// Distinct domain from per-blank concerns (scoring, hint), so it gets its
// own file matching the checkpoints.ts pattern.
//
// The fieldset HTML is emitted by the renderer only when the block has
// hasConfidenceRating=true. wireConfidence skips blocks without a
// fieldset, so the no-confidence-rating case is naturally inert.
//
// The radio value strings ('unsure' | 'think_so' | 'certain') must match
// SubmissionResponses.ConfidenceLevel from @activity/schema. The runtime
// doesn't import the schema (size budget); the values are duplicated
// here. If ConfidenceLevel ever gains or loses values, update both.
// =============================================================================

import type { Refs } from './refs.js';
import type { RuntimeState } from './state.js';

type Confidence = 'unsure' | 'think_so' | 'certain';

function isConfidence(value: unknown): value is Confidence {
    return value === 'unsure' || value === 'think_so' || value === 'certain';
}

/**
 * Attach change handlers to every confidence fieldset's radios. On
 * selection, write the value to state.blocks[blockId].confidence and
 * trigger onUpdate (which renders + persists). Skips blocks without a
 * fieldset or radios (renderer omits the fieldset when
 * hasConfidenceRating is false).
 *
 * Reads ref.confidenceRadios (built at init) — no DOM walk here.
 */
export function wireConfidence(
    state: RuntimeState,
    refs: Refs,
    onUpdate: () => void,
): void {
    for (const [blockId, ref] of refs.fillInBlanks) {
        if (!ref.hasConfidenceRating || ref.confidenceRadios.length === 0) {
            continue;
        }
        for (const radio of ref.confidenceRadios) {
            radio.addEventListener('change', () => {
                if (!radio.checked) return;
                if (!isConfidence(radio.value)) return;
                const blockState = state.blocks[blockId];
                if (!blockState) return;
                blockState.confidence = radio.value;
                onUpdate();
            });
        }
    }
}
