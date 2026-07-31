// =============================================================================
// registry/bindings.ts — block type → React component (CLIENT ONLY)
// -----------------------------------------------------------------------------
// Deliberately SEPARATE from registry.ts, and the separation is load-bearing.
//
// The registry is imported by both sides: the client needs families and
// components, and the SERVER needs the sanitize specs (the read API's
// answer-key stripping runs off them). When the component bindings lived on
// the registry entries, importing the registry server-side dragged the whole
// component tree — React, then graph-kit, then JSXGraph and MathLive — into
// the get-activity Edge Function bundle. Measured: 888 KiB before any
// bindings, 2.8 MB once the eager exemplars were bound, 21 MB once the graph
// binding landed. A read API that never renders anything was about to ship
// with a graphing engine inside it.
//
// So: registry.ts stays pure DATA (families, numbering, sanitize specs, a11y
// stories) and is safe on both sides. Components bind HERE, and only client
// code imports this file. The guard suite proves every key here is a real
// registry type, and scripts/bundle-viewer-server.mjs is what proves the
// server never reaches it — its output size is the canary.
// =============================================================================

import type { BlockComponentBinding, BlockType } from './types.js';
import Paragraph from '../blocks/Paragraph.js';
import MultipleChoice from '../blocks/MultipleChoice.js';
import ShortAnswer from '../blocks/ShortAnswer.js';

/**
 * How each built block reaches the page. Unlisted types have no component yet
 * (the container renders an honest placeholder).
 *
 * Loading tier per ruling D16: 'eager' for light, near-universal blocks;
 * 'lazy' only where real weight hides behind the import.
 */
export const blockBindings: Partial<
  Record<BlockType, BlockComponentBinding<BlockType>>
> = {
  paragraph: { loading: 'eager', component: Paragraph as never },
  multiple_choice: { loading: 'eager', component: MultipleChoice as never },
  short_answer: { loading: 'eager', component: ShortAnswer as never },
  // The lazy tier: every canvas block pulls graph-kit (and JSXGraph) behind
  // it, which is exactly the weight that tier exists for.
  interactive_graph: {
    loading: 'lazy',
    load: () => import('../blocks/InteractiveGraph.js') as never,
  },
  number_line: {
    loading: 'lazy',
    load: () => import('../blocks/NumberLine.js') as never,
  },
  data_plot: {
    loading: 'lazy',
    load: () => import('../blocks/DataPlot.js') as never,
  },
};

/** Types with a component today. */
export function boundBlockTypes(): BlockType[] {
  return Object.keys(blockBindings) as BlockType[];
}

export function bindingFor(
  type: BlockType,
): BlockComponentBinding<BlockType> | undefined {
  return blockBindings[type];
}
