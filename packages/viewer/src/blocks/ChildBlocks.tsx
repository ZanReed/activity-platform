// =============================================================================
// blocks/ChildBlocks.tsx — render nested blocks inside a container (S3)
// -----------------------------------------------------------------------------
// worked_example and faded_worked_example hold real Blocks, so they need the
// same resolution the container does — registry binding, eager or lazy, and
// crucially their OWN error boundary per child.
//
// That last part is the reason this is a shared component rather than a map()
// inside each container: a crashing step inside a worked example must degrade
// to a placeholder like any other block, not take down the whole example (and
// with it the surrounding steps a student has already answered). Reusing
// BlockBoundary here means nested blocks inherit the D12 guarantee for free,
// including the crashed-gradable rule — a faded example's blanks are gradable,
// so a crash there IS a check shortfall.
// =============================================================================

import { lazy, Suspense, useMemo } from 'react';
import type { ComponentType } from 'react';
import { bindingFor } from '../registry/bindings.js';
import { familyOf } from '../registry/registry.js';
import type { BlockComponentProps, BlockType } from '../registry/types.js';
import { BlockBoundary, type BlockCrash } from '../container/BlockBoundary.js';

const lazyCache = new Map<BlockType, ComponentType<BlockComponentProps>>();

function resolve(type: BlockType): ComponentType<BlockComponentProps> | null {
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

export interface ChildBlocksProps {
  blocks: readonly unknown[];
  mode: 'screen' | 'print';
  onCrash?: (crash: BlockCrash) => void;
}

export function ChildBlocks({ blocks, mode, onCrash }: ChildBlocksProps) {
  const items = useMemo(
    () =>
      blocks.map((raw) => {
        const block = raw as { id: string; type: BlockType };
        return { block, Component: resolve(block.type) };
      }),
    [blocks],
  );

  return (
    <>
      {items.map(({ block, Component }) => (
        <BlockBoundary
          key={block.id}
          blockId={block.id}
          blockType={block.type}
          gradable={familyOf(block as never) !== 'static'}
          {...(onCrash ? { onCrash } : {})}
        >
          <div className="viewer-block viewer-block--nested" data-block-id={block.id} data-block-type={block.type}>
            {Component ? (
              <Suspense fallback={<span aria-hidden="true" />}>
                <Component block={block as never} mode={mode} />
              </Suspense>
            ) : (
              <p data-unbound="true">{block.type}</p>
            )}
          </div>
        </BlockBoundary>
      ))}
    </>
  );
}
