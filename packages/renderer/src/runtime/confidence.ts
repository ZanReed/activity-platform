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

    // Multiple-choice blocks carry the same per-block confidence fieldset;
    // wire it into state.mcs[id].confidence identically.
    for (const [blockId, ref] of refs.mcs) {
        if (!ref.hasConfidenceRating || ref.confidenceRadios.length === 0) {
            continue;
        }
        for (const radio of ref.confidenceRadios) {
            radio.addEventListener('change', () => {
                if (!radio.checked) return;
                if (!isConfidence(radio.value)) return;
                const mcState = state.mcs[blockId];
                if (!mcState) return;
                mcState.confidence = radio.value;
                onUpdate();
            });
        }
    }

    // Matching + ordering blocks carry the same per-block confidence
    // fieldset; wire them into their state maps identically.
    for (const [blockId, ref] of refs.matches) {
        if (!ref.hasConfidenceRating || ref.confidenceRadios.length === 0) {
            continue;
        }
        for (const radio of ref.confidenceRadios) {
            radio.addEventListener('change', () => {
                if (!radio.checked) return;
                if (!isConfidence(radio.value)) return;
                const matchState = state.matches[blockId];
                if (!matchState) return;
                matchState.confidence = radio.value;
                onUpdate();
            });
        }
    }
    for (const [blockId, ref] of refs.orderings) {
        if (!ref.hasConfidenceRating || ref.confidenceRadios.length === 0) {
            continue;
        }
        for (const radio of ref.confidenceRadios) {
            radio.addEventListener('change', () => {
                if (!radio.checked) return;
                if (!isConfidence(radio.value)) return;
                const orderState = state.orderings[blockId];
                if (!orderState) return;
                orderState.confidence = radio.value;
                onUpdate();
            });
        }
    }

    // Interactive-graph blocks carry the same per-block confidence fieldset;
    // wire it into state.graphs[id].confidence identically.
    for (const [blockId, ref] of refs.graphs) {
        if (!ref.hasConfidenceRating || ref.confidenceRadios.length === 0) {
            continue;
        }
        for (const radio of ref.confidenceRadios) {
            radio.addEventListener('change', () => {
                if (!radio.checked) return;
                if (!isConfidence(radio.value)) return;
                const graphState = state.graphs[blockId];
                if (!graphState) return;
                graphState.confidence = radio.value;
                onUpdate();
            });
        }
    }

    // Number-line blocks carry the same per-block confidence fieldset; wire it
    // into state.numberLines[id].confidence identically.
    for (const [blockId, ref] of refs.numberLines) {
        if (!ref.hasConfidenceRating || ref.confidenceRadios.length === 0) {
            continue;
        }
        for (const radio of ref.confidenceRadios) {
            radio.addEventListener('change', () => {
                if (!radio.checked) return;
                if (!isConfidence(radio.value)) return;
                const nlState = state.numberLines[blockId];
                if (!nlState) return;
                nlState.confidence = radio.value;
                onUpdate();
            });
        }
    }

    // Graded data-plot blocks carry the same per-block confidence fieldset; wire
    // it into state.dataPlots[id].confidence identically.
    for (const [blockId, ref] of refs.dataPlots) {
        if (!ref.hasConfidenceRating || ref.confidenceRadios.length === 0) {
            continue;
        }
        for (const radio of ref.confidenceRadios) {
            radio.addEventListener('change', () => {
                if (!radio.checked) return;
                if (!isConfidence(radio.value)) return;
                const dpState = state.dataPlots[blockId];
                if (!dpState) return;
                dpState.confidence = radio.value;
                onUpdate();
            });
        }
    }
}
