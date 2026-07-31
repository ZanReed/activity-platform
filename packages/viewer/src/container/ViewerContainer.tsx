// =============================================================================
// container/ViewerContainer.tsx — the worksheet shell (S3 V4)
// -----------------------------------------------------------------------------
// Renders a SERVED (sanitized) document: sections → rows → columns → blocks,
// each block in its own BlockBoundary, and owns the one thing the store cannot
// know on its own — WHICH ids belong to the section being checked (blockIndex).
//
// Check granularity is the SECTION (ruling P2A: one batched, atomic RPC per
// section check), so the check control lives here, not on the block. Re-check
// is allowed and re-scores the whole section (parity bundle, ruling 7.1A) —
// the store handles that; the container just never disables the control after
// a first check.
//
// The crashed-gradable rule (ruling D12, second half): if a gradable block in
// a section crashed, checking that section CANNOT honestly report "all
// checked". The container keeps the crash roster, renders the shortfall next
// to the section status, and hands it to `onCheckShortfall` so the app can log
// it. Same treatment for `unsupported` ids (graph-family blocks, which
// CHECK_WIRE_VERSION 1 has no category for): both are ways a student's work can
// go ungraded, and both are said out loud rather than swallowed.
//
// Component resolution goes through `resolveComponent`, defaulting to the
// registry's `component` binding. In V4 no entry has one, so every block
// renders the honest placeholder; V5's exemplars fill entries and V5/D16 adds
// the eager-vs-lazy split (statics eager, heavies lazy) at this seam.
// =============================================================================

import {
  lazy,
  Suspense,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import type { ComponentType } from 'react';
import { blockRegistry, familyOf } from '../registry/registry.js';
import { bindingFor } from '../registry/bindings.js';
import type { BlockComponentProps, BlockType } from '../registry/types.js';
import type {
  SanitizedActivityDocument,
  SanitizedBlock,
} from '../sanitize/sanitized-types.js';
import type { ViewerStore } from '../store/store.js';
import type { SectionStatus } from '../store/persistence.js';
import { BlockBoundary, type BlockCrash } from './BlockBoundary.js';
import { ViewerProvider } from './context.js';
import { indexDocument, type SectionIndex } from './blockIndex.js';

/** What a section check could not cover — never silently empty. */
export interface CheckShortfall {
  sectionId: string;
  /** Gradable blocks that crashed and therefore sent no response. */
  crashedBlockIds: string[];
  /** Gradable blocks with no wire-v1 response category (graph family). */
  unsupportedBlockIds: string[];
}

export interface ViewerContainerProps {
  document: SanitizedActivityDocument;
  store: ViewerStore;
  /** Version id of the served document — doubles as the boundary reset key. */
  versionId?: string;
  /** Test/V5 seam. Returns null when a type has no component yet. */
  resolveComponent?: (type: BlockType) => ComponentType<BlockComponentProps> | null;
  onCrash?: (crash: BlockCrash) => void;
  /** Fires after every check whose coverage was incomplete. */
  onCheckShortfall?: (shortfall: CheckShortfall) => void;
  mode?: 'screen' | 'print';
}

/** Memo so a lazy binding produces ONE React.lazy per type, not one per
 * render (a fresh lazy() each render remounts the subtree and loses state). */
const lazyCache = new Map<BlockType, ComponentType<BlockComponentProps>>();

/** Registry-driven resolution honoring the D16 eager/lazy split. Unbound types
 * return null and render the placeholder. */
function defaultResolve(
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

function statusLabel(status: SectionStatus | undefined): string {
  switch (status?.phase) {
    case 'checking':
      return 'Checking…';
    case 'checked':
      return 'Checked.';
    case 'error':
      return 'Couldn’t check — try again.';
    default:
      return '';
  }
}

export function ViewerContainer({
  document: doc,
  store,
  versionId,
  resolveComponent = defaultResolve,
  onCrash,
  onCheckShortfall,
  mode = 'screen',
}: ViewerContainerProps) {
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);
  const index = useMemo(() => indexDocument(doc), [doc]);
  const [crashed, setCrashed] = useState<Record<string, BlockCrash>>({});

  const handleCrash = useCallback(
    (crash: BlockCrash) => {
      setCrashed((prev) =>
        prev[crash.blockId] ? prev : { ...prev, [crash.blockId]: crash },
      );
      onCrash?.(crash);
    },
    [onCrash],
  );

  const shortfallFor = useCallback(
    (section: SectionIndex): CheckShortfall => ({
      sectionId: section.sectionId,
      crashedBlockIds: section.blockIds.filter(
        (id) => crashed[id]?.gradable === true,
      ),
      unsupportedBlockIds: [...section.unsupported],
    }),
    [crashed],
  );

  const handleCheck = useCallback(
    async (section: SectionIndex) => {
      const shortfall = shortfallFor(section);
      await store.checkSection(section.sectionId, section.items);
      if (
        shortfall.crashedBlockIds.length > 0 ||
        shortfall.unsupportedBlockIds.length > 0
      ) {
        onCheckShortfall?.(shortfall);
      }
    },
    [shortfallFor, store, onCheckShortfall],
  );

  // blockId → sectionId, so a component can find its own section's phase
  // without knowing the document shape.
  const sectionByBlock = useMemo(() => {
    const map: Record<string, string> = {};
    for (const section of index.sections) {
      for (const blockId of section.blockIds) map[blockId] = section.sectionId;
    }
    return map;
  }, [index]);

  return (
    <ViewerProvider store={store} sectionByBlock={sectionByBlock}>
    <div className="viewer" data-viewer-mode={mode}>
      {doc.sections.map((section) => {
        const sectionIndex = index.bySection[section.id];
        const status = state.sections[section.id];
        const shortfall = sectionIndex
          ? shortfallFor(sectionIndex)
          : { sectionId: section.id, crashedBlockIds: [], unsupportedBlockIds: [] };
        const uncovered =
          shortfall.crashedBlockIds.length + shortfall.unsupportedBlockIds.length;

        return (
          <section
            key={section.id}
            className="viewer-section"
            data-section-id={section.id}
            data-section-phase={status?.phase ?? 'unchecked'}
            aria-label={section.title ?? undefined}
          >
            {section.title ? (
              <h2 className="viewer-section__title">{section.title}</h2>
            ) : null}

            {section.rows.map((row) => (
              <div key={row.id} className="viewer-row" data-row-id={row.id}>
                {row.columns.map((column) => (
                  <div
                    key={column.id}
                    className="viewer-column"
                    data-column-id={column.id}
                  >
                    {column.blocks.map((block) => (
                      <BlockSlot
                        key={(block as { id: string }).id}
                        block={block}
                        mode={mode}
                        resetKey={versionId}
                        resolveComponent={resolveComponent}
                        onCrash={handleCrash}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {mode === 'screen' ? (
              <div className="viewer-section__footer">
                <button
                  type="button"
                  className="viewer-section__check"
                  disabled={status?.phase === 'checking'}
                  onClick={() => {
                    if (sectionIndex) void handleCheck(sectionIndex);
                  }}
                >
                  Check
                </button>
                <p className="viewer-section__status" aria-live="polite">
                  {statusLabel(status)}
                </p>
                {uncovered > 0 ? (
                  <p
                    className="viewer-section__shortfall"
                    data-shortfall-count={uncovered}
                  >
                    {uncovered === 1
                      ? '1 question in this section couldn’t be checked.'
                      : `${uncovered} questions in this section couldn’t be checked.`}
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
    </ViewerProvider>
  );
}

interface BlockSlotProps {
  block: SanitizedBlock;
  mode: 'screen' | 'print';
  resetKey?: string;
  resolveComponent: (type: BlockType) => ComponentType<BlockComponentProps> | null;
  onCrash: (crash: BlockCrash) => void;
}

function BlockSlot({
  block,
  mode,
  resetKey,
  resolveComponent,
  onCrash,
}: BlockSlotProps) {
  const type = (block as { type: string }).type as BlockType;
  const id = (block as { id: string }).id;
  const entry = blockRegistry[type];
  const Component = resolveComponent(type);
  // familyOf resolves display-mode instances to static — a display graph is
  // not gradable, so a crash there is not a grading shortfall.
  const gradable = familyOf(block as never) !== 'static';

  return (
    <BlockBoundary
      blockId={id}
      blockType={type}
      gradable={gradable}
      {...(resetKey === undefined ? {} : { resetKey })}
      onCrash={onCrash}
    >
      <div
        className="viewer-block"
        data-block-id={id}
        data-block-type={type}
        data-block-category={entry.category}
        data-block-family={familyOf(block as never)}
      >
        {Component ? (
          // Suspense only matters for lazy bindings; eager ones never suspend,
          // which is exactly why D16 keeps the common blocks eager.
          <Suspense
            fallback={<span className="viewer-block__loading" aria-hidden="true" />}
          >
            <Component block={block as never} mode={mode} />
          </Suspense>
        ) : (
          <p className="viewer-block__unbound" data-unbound="true">
            {type}
          </p>
        )}
      </div>
    </BlockBoundary>
  );
}
