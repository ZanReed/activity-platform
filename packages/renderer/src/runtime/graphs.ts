// =============================================================================
// runtime/graphs.ts — interactive-graph block sidecar
// -----------------------------------------------------------------------------
// The runtime half of the graded interactive-graph block. For each graph block
// it lazy-imports the graph kit (data-graph-kit-src, the same content-hashed R2
// bundle the calculator uses), mounts the answer widget, and bridges the widget
// back into runtime state: every student move writes state.graphs[id] and fires
// onUpdate (render + persist), so the graph participates in checkpoint scoring,
// the submit payload, and reload restore exactly like a blank.
//
// This is a SIDECAR: like calculator-summon / definitions / reference-panel it
// owns its own DOM subtree (the .graph-canvas) OUTSIDE render(). render() still
// owns the block-level regions it CAN drive synchronously (the feedback line,
// the solution slot, the confidence radios, and the widget lock) — see
// renderGraphs in render.ts. The widget board itself is the kit's to mutate.
//
// Defensive throughout: no kit URL, a failed import, or a missing canvas leaves
// the static "needs JavaScript" placeholder in place and the rest of the page
// working — the graph just can't be answered (it still submits as unanswered).
// =============================================================================

import type { Refs, GraphWidgetHandle, GraphResponseData } from './refs.js';
import type { RuntimeState } from './state.js';

// Structural view of the kit entry the sidecar dynamic-imports. The runtime and
// the kit are separate bundles joined only by this shape (mirrors how the wire
// payload is the contract with the Edge Function).
interface GraphKitModule {
  mountGraphQuestion(
    mount: HTMLElement,
    config: unknown,
    hooks: { onChange?: (resp: GraphResponseData) => void },
  ): Promise<GraphWidgetHandle>;
}

/**
 * Mount every graph block's widget and wire its moves into state. Called once
 * during bootstrap wiring (after the initial render). Each mount is async (the
 * kit is fetched on demand); state/refs are mutated as handles resolve.
 */
export function wireGraphs(
  state: RuntimeState,
  refs: Refs,
  onUpdate: () => void,
): void {
  for (const [blockId, ref] of refs.graphs) {
    if (!ref.kitSrc) continue; // no kit available → leave the placeholder

    const config = {
      interactionType: ref.interactionType,
      axisConfig: ref.config,
      answerKey: ref.answerKey,
    };

    // Dynamic import by URL. The `/* @vite-ignore */` keeps the app bundler from
    // trying to resolve the runtime-only R2 URL at build time; in the published
    // page this is just a native dynamic import.
    import(/* @vite-ignore */ ref.kitSrc)
      .then((mod: GraphKitModule) =>
        mod.mountGraphQuestion(ref.canvas, config, {
          onChange: (resp) => {
            const gs = state.graphs[blockId];
            if (!gs) return;
            gs.points = resp.studentPoints;
            gs.answered = resp.answered;
            // Unanswered → unscored (an omission), like an empty blank; once the
            // student has moved a handle, its correctness is live.
            gs.result = resp.answered ? resp.correct : null;
            onUpdate();
          },
        }),
      )
      .then((handle) => {
        ref.handle = handle;
        // Restore point(s) persisted on a prior load. Its onChange re-populates
        // state.graphs[blockId] (answered + result), so a checked-and-reloaded
        // graph comes back scored.
        const stored = state.graphs[blockId]?.points;
        if (stored && stored.length > 0) handle.restore(stored);
        // Reflect any restored lock (locked mode after a prior check).
        if (state.sections[ref.sectionId]?.locked) handle.setLocked(true);
      })
      .catch((err) => {
        console.error('[activity-runtime] graph kit failed to load', err);
      });
  }
}
