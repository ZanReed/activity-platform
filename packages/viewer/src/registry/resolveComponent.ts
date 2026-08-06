// =============================================================================
// resolveComponent.ts — the ONE lazy-component identity per block type (A14)
// -----------------------------------------------------------------------------
// React.lazy must be called once per type, module-wide: a fresh lazy() per
// render remounts the subtree and loses state — and so does a SECOND cache.
// Until 2026-08-06 ViewerContainer and ChildBlocks each held a module-level
// cache with byte-equivalent resolve bodies (s0-audit / s3-retro finding 7),
// so a lazy type rendered both top-level and nested got TWO React.lazy
// identities: a nested math_block mounted a different wrapper than a top-level
// one — the exact remount/state-loss case each cache's comment claimed to
// prevent. One cache, one identity, both render paths.
// =============================================================================

import { lazy } from 'react';
import type { ComponentType } from 'react';
import { bindingFor } from './bindings.js';
import type { BlockComponentProps, BlockType } from './types.js';

const lazyCache = new Map<BlockType, ComponentType<BlockComponentProps>>();

/** Registry-driven resolution honoring the D16 eager/lazy split. Unbound types
 * return null and render the placeholder. */
export function resolveBlockComponent(
  type: BlockType,
): ComponentType<BlockComponentProps> | null {
  // The one cast: bindings are typed against their OWN block, the slot renders
  // the union. The registry guard proves each binding sits on its own entry.
  const binding = bindingFor(type);
  if (!binding) return null;
  if (binding.loading === 'eager') {
    return binding.component as ComponentType<BlockComponentProps>;
  }
  let component = lazyCache.get(type);
  if (!component) {
    component = lazy(binding.load) as unknown as ComponentType<BlockComponentProps>;
    lazyCache.set(type, component);
  }
  return component;
}
