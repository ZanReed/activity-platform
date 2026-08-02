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
  useEffect,
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
import { DefinitionGlossary } from '../print/DefinitionGlossary.js';
import {
  ensureActivityFontLoaded,
  typographyVars,
} from '../typography/fonts.js';
import { collectDefinitions } from '../print/definitions.js';
import {
  PrintPageRule,
  PrintHeaderRow,
  PrintWorksheetHeading,
  printVars,
} from './PrintDocumentLayer.js';
import {
  rowStyle,
  columnStyle,
  blockStyle,
  blockAlign,
  isSized,
  type BlockLayout,
} from './layoutStyles.js';

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
    case 'pending':
      // Not an error and not a request to do anything — a promise the queue
      // keeps on its own (TV3-A). Same words as the block-level pill so the
      // student meets one vocabulary, not two.
      return 'Will check when you’re back online.';
    case 'checked':
      // Only when the answers moved during the outage: silence here would let
      // a student wonder whether the verdict covers what they typed after
      // pressing Check (ruling 2.2A).
      return status.answersChangedWhileQueued
        ? 'Checked your latest answers.'
        : 'Checked.';
    case 'error':
      // The failure KIND decides the sentence (S4 T8). "Try again" is the right
      // words only when trying again could work; telling a student to retry
      // against a stale tab or an expired session sends them into a loop that
      // cannot end, which is worse than a blunt instruction that does.
      switch (status.kind) {
        case 'stale_client':
          return 'This page is out of date — reload to keep checking.';
        case 'unauthenticated':
          return 'Your sign-in expired. Sign in again — your work is saved.';
        case 'rate_limited':
          return 'Checking too quickly — wait a moment and try again.';
        case 'offline':
          return 'You’re offline — we’ll check when you reconnect.';
        default:
          return 'Couldn’t check — try again.';
      }
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
  // meta.print survives sanitization untouched (it carries no answer key), so
  // the served document is a complete description of how it should print.
  const print = doc.meta.print;
  // Collected once per document, not per render: the walk visits every node in
  // the activity, and it only changes when the document does. Computed even
  // when the setting is off — the cost is one walk of data already in memory,
  // and branching here would make the memo dependent on a setting that can
  // change without the document changing.
  const glossaryEntries = useMemo(() => collectDefinitions(doc), [doc]);

  // The teacher's chosen worksheet font. Both halves are needed: naming the
  // family does nothing if the files were never fetched, it just falls back
  // silently. The font choice is usually an accessibility decision made for a
  // specific student, so dropping it is not cosmetic.
  const typography = doc.meta.typography;
  useEffect(() => {
    if (typography) void ensureActivityFontLoaded(typography.font);
  }, [typography]);
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
    <div
      className="viewer"
      data-viewer-mode={mode}
      data-activity-font={typography?.font ?? 'default'}
      style={{ ...printVars(print), ...typographyVars(typography) }}
    >
      {/* Document-level print surface (S5-OV1). Every piece of this already
          reaches students today through Ctrl+P on a published page, so leaving
          it out would have been a silent feature loss at cutover — and an
          invisible one, since none of it is a block and the per-block fixture
          roster could not have noticed. */}
      <PrintPageRule print={print} />
      <PrintHeaderRow header={print.header} />
      {/* Below the fill-in lines and above the work, matching the published
          page's order. On screen the top bar carries this; on paper the top
          bar is chrome and does not print. */}
      <PrintWorksheetHeading
        title={doc.meta.title}
        course={doc.meta.course}
        unit={doc.meta.unit}
      />

      {/* The teacher's reference material as a static box at the top of the
          sheet. On screen the panel is a summoned tool; on paper there is
          nothing to summon, so it prints inline — but only when the teacher
          left it on, because a reference sheet reprinted on every worksheet is
          wasted paper. Scaffold: never scored, outside every section, so the
          check path never sees it. */}
      {doc.referencePanel && print.printReferencePanel ? (
        <aside className="viewer-reference-print" data-block-category="scaffold">
          {doc.referencePanel.title ? (
            <h2 className="viewer-reference-print__title">
              {doc.referencePanel.title}
            </h2>
          ) : null}
          {doc.referencePanel.blocks.map((block) => (
            <BlockSlot
              key={(block as { id: string }).id}
              block={block as SanitizedBlock}
              mode={mode}
              {...(versionId === undefined ? {} : { resetKey: versionId })}
              resolveComponent={resolveComponent}
              onCrash={handleCrash}
            />
          ))}
        </aside>
      ) : null}

      {/* Passive stale-version notice (ruling S4-T5). Deliberately NOT a modal
          and deliberately not an auto-reload: the student's checks still work
          against the version they were served, and reloading for them would
          discard in-flight work. It matters most when a teacher republished to
          FIX a wrong answer key — without this the student would keep being
          graded by the broken one with no way to know. */}
      {state.newerVersionId ? (
        <div className="viewer-banner" role="status" data-banner="stale-version">
          <span>Your teacher updated this activity.</span>
          <button
            type="button"
            className="viewer-banner-action"
            onClick={() => globalThis.location?.reload()}
          >
            Reload to get the new version
          </button>
        </div>
      ) : null}
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
              <div
                key={row.id}
                className="viewer-row"
                data-row-id={row.id}
                data-column-count={row.columns.length}
                style={rowStyle(row.columns)}
              >
                {row.columns.map((column) => (
                  <div
                    key={column.id}
                    className="viewer-column"
                    data-column-id={column.id}
                    style={columnStyle(column)}
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

      {/* The paper surface for inline vocabulary definitions. On screen a
          definition is a disclosure opened over the word; on paper there is no
          opening, so without this the content simply would not exist — which
          was tolerable when a definition was a short gloss and stopped being
          tolerable once one could carry a display equation, a list, and a
          figure. Gated by the teacher's setting, appended at the very end, and
          hidden on screen (the disclosure is the screen surface). */}
      {print.printDefinitionGlossary ? (
        <DefinitionGlossary entries={glossaryEntries} />
      ) : null}
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
  // Authored footprint (width fraction + align). Structural, not block-type
  // specific — every block type carries the sizing fragment.
  const layout = block as BlockLayout;
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
        className={
          isSized(layout) ? 'viewer-block viewer-block--sized' : 'viewer-block'
        }
        data-block-id={id}
        data-block-type={type}
        data-block-category={entry.category}
        data-block-family={familyOf(block as never)}
        data-block-align={blockAlign(layout)}
        style={blockStyle(layout)}
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
