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
// to the section status, and hands it to `onCheckShortfall` so the app can
// record it. (An `unsupported` half used to ride along for gradable types the
// wire couldn't carry — wire v2 gave the graph family its category, the roster
// was TEST-PINNED empty, and eng review D13 deleted the dead wire shape;
// blockIndex still DETECTS unsupported ids, so a future type ahead of its wire
// bump surfaces there first, and the field returns with the wire that can
// populate it.)
//
// Component resolution goes through `resolveComponent`, defaulting to the
// registry's `component` binding. In V4 no entry has one, so every block
// renders the honest placeholder; V5's exemplars fill entries and V5/D16 adds
// the eager-vs-lazy split (statics eager, heavies lazy) at this seam.
// =============================================================================

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { ComponentType, ReactNode } from 'react';
import { blockRegistry, familyOf } from '../registry/registry.js';
import { buildNumbering, type ResolvedLabel } from '../numbering/numbering.js';
import { resolveBlockComponent } from '../registry/resolveComponent.js';
import { ReferencePanelTool } from './ReferencePanelTool.js';
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
import {
  checkGroups,
  groupStatus,
  isSectionFrozen,
  sectionsInGroup,
  type CheckGroup,
  type GroupStatus,
  type SubmissionMode,
} from './checkGroups.js';
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
  resolveGridLines,
  type BlockLayout,
} from './layoutStyles.js';

/** What a section check could not cover — never silently empty. */
export interface CheckShortfall {
  sectionId: string;
  /** Gradable blocks that crashed and therefore sent no response. */
  crashedBlockIds: string[];
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
  /**
   * Which printed arrangement this is (1-based), when a teacher asked for more
   * than one to discourage copying. Renders a label on the sheet so a stack can
   * be matched to its answer key later; absent means the single default sheet
   * and nothing is labelled.
   */
  printVersion?: number;
  /**
   * This activity is open and editable in another tab (ruling 2.3A/S6-4).
   * The worksheet still RENDERS — the student can read their work — but
   * nothing here accepts input until they take over.
   */
  readOnly?: boolean;
  /** The "Use it here" action. Absent ⇒ the takeover affordance is hidden. */
  onTakeOver?: () => void;
}

/** Registry-driven resolution honoring the D16 eager/lazy split — the SHARED
 * cache (registry/resolveComponent.ts), so a type rendered both top-level and
 * nested gets one React.lazy identity, not two (A14). */
const defaultResolve = resolveBlockComponent;

/**
 * What the group's status line says (D2). Extends `statusLabel`'s doctrine
 * rather than starting a second vocabulary: THE FAILURE KIND DECIDES THE
 * SENTENCE, and a student is never told to try again when retrying cannot
 * work. The five new sentences are the flow-mode slice's whole copy surface
 * and are pinned one-per-assertion in the component suite (F9b), so the
 * vocabulary cannot fracture across the two call sites that render it.
 */
function groupStatusLabel(status: GroupStatus, locked: boolean): string {
  // 'locked' is checked before the phase in the two places it can appear
  // (a wholly-refused group reads 'error', a partly-refused one reads
  // 'partial'). It is the one kind that must never inherit retry copy: there
  // is no unlock in v1, not for the student and not for the teacher.
  if (status.kind === 'locked' && status.phase !== 'checked') {
    return 'Already checked and locked.';
  }
  switch (status.phase) {
    case 'checking':
      return 'Checking…';
    case 'pending':
      // The freeze already happened (at press), so a locked group says so
      // first — otherwise the student reads "we'll check later" while their
      // inputs are inert and concludes something broke.
      return locked
        ? 'Locked. Will check when you’re back online.'
        : 'Will check when you’re back online.';
    case 'checked':
      // Locked outranks the 2.2A notice, which cannot co-occur anyway: a
      // locked group freezes at press, so its answers cannot move while
      // queued. Stated once, at the moment it becomes true.
      if (locked) return 'Checked and locked. You can’t change these answers.';
      return status.answersChangedWhileQueued
        ? 'Checked your latest answers.'
        : 'Checked.';
    case 'partial': {
      const total = status.landed.length + status.unlanded.length;
      const missing = status.unlanded.length;
      return `Checked ${status.landed.length} of ${total} — ${
        missing === 1 ? 'one part' : `${missing} parts`
      } didn’t send.`;
    }
    case 'error':
      // The section-level taxonomy, unchanged (S4 T8). Every sentence here
      // predates this slice; only the reachability is new.
      switch (status.kind) {
        case 'stale_client':
          return 'This page is out of date — reload to keep checking.';
        case 'unauthenticated':
          return 'Your sign-in expired. Sign in again — your work is saved.';
        case 'rate_limited':
          return 'Checking too quickly — wait a moment and try again.';
        case 'offline':
          return 'You’re offline — we’ll check when you reconnect.';
        case 'unavailable':
          // Deliberately NOT "try again" (A15): this activity is gone or not
          // theirs — the taxonomy's whole point is never inviting a retry
          // that cannot work.
          return 'This activity isn’t available to check anymore. Ask your teacher.';
        case 'malformed_document':
          // Same no-retry rule (B8/D10): the STORED activity is broken, and
          // no retry or reload fixes data. Non-blaming — it is our defect,
          // never the student's work — and it names the one person with a
          // path to fixing it.
          return 'Something is wrong with this activity itself — not your work. Ask your teacher to take a look.';
        default:
          return 'Couldn’t check — try again.';
      }
    default:
      return '';
  }
}

/** The button's words. It NAMES ITS SCOPE (D1) so the visible region and the
 * label agree — a student who sees three sections inside one rule and a button
 * that says only "Check" has to guess which of the three it covers. */
function checkButtonLabel(sectionCount: number, locked: boolean): string {
  const verb = locked ? 'Check and lock' : 'Check';
  return sectionCount > 1 ? `${verb} these ${sectionCount} sections` : verb;
}

export function ViewerContainer({
  document: doc,
  store,
  versionId,
  resolveComponent = defaultResolve,
  onCrash,
  onCheckShortfall,
  mode = 'screen',
  printVersion,
  readOnly = false,
  onTakeOver,
}: ViewerContainerProps) {
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);
  const index = useMemo(() => indexDocument(doc), [doc]);
  // The page numbers, computed ONCE per document rather than counted during
  // render (ruling N1 — see numbering.ts for why a render-order counter is
  // unsafe under Suspense/concurrent rendering). Third instance of the
  // memo-a-pure-walk-over-doc pattern in this component.
  const numbering = useMemo(() => buildNumbering(doc), [doc]);
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

  const crashedGradableIn = useCallback(
    (section: SectionIndex): string[] =>
      section.blockIds.filter((id) => crashed[id]?.gradable === true),
    [crashed],
  );

  const shortfallFor = useCallback(
    (section: SectionIndex): CheckShortfall => ({
      sectionId: section.sectionId,
      crashedBlockIds: crashedGradableIn(section),
    }),
    [crashedGradableIn],
  );

  /**
   * Fire a check group: `sections` is what the button covers, `only` narrows it
   * to the Retry set (3A — a partial group re-fires just its unlanded members;
   * a deliberate `free` re-check passes them all and re-scores everything).
   *
   * The shortfall roster is taken BEFORE the await, per member, exactly as the
   * per-section path did — the crash roster describes this render, and reading
   * it after N round-trips would report a different one.
   */
  const handleCheckGroup = useCallback(
    async (sections: readonly SectionIndex[], only?: readonly string[]) => {
      const firing = only
        ? sections.filter((s) => only.includes(s.sectionId))
        : sections;
      const shortfalls = firing.map((s) => shortfallFor(s));
      await store.checkGroup(
        firing.map((s) => s.sectionId),
        Object.fromEntries(firing.map((s) => [s.sectionId, s.items])),
      );
      for (const shortfall of shortfalls) {
        if (shortfall.crashedBlockIds.length > 0) onCheckShortfall?.(shortfall);
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

  // THE FLOW MODE (R1/R2). `submissionMode` survives sanitization untouched,
  // so the served document is a complete description of how it flows —
  // exactly like meta.print above. `locked` is derived from the SAME field the
  // server derives its refusal from (T1), which is why nothing here sends a
  // flag the student's browser could omit.
  const submissionMode: SubmissionMode = doc.meta.submissionMode ?? 'free';
  const locked = submissionMode === 'locked';
  const groups = useMemo(
    () => checkGroups(index, submissionMode),
    [index, submissionMode],
  );
  // sectionId → every section its group's Check covers. Solutions are revealed
  // per GROUP, not per section (OV#14): under 3A a half-landed group would
  // otherwise show section 1's worked solutions while section 2 is still
  // editable — an answer key for work not yet committed.
  // The served sections by id — the groups carry INDEXES (ids + item ids), and
  // the render needs the document's own rows.
  const sectionById = useMemo(
    () => Object.fromEntries(doc.sections.map((section) => [section.id, section])),
    [doc],
  );
  const groupSections = useMemo(() => sectionsInGroup(groups), [groups]);

  return (
    <ViewerProvider
      store={store}
      sectionByBlock={sectionByBlock}
      groupSections={groupSections}
    >
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
        activityType={doc.meta.activityType}
        version={printVersion}
      />

      {/* The teacher's reference material as a static box at the top of the
          sheet. On screen the panel is a summoned tool (ReferencePanelTool,
          just below — a claim this comment made for nine days before it was
          true again); on paper there is nothing to summon, so it prints inline
          — but only when the teacher left it on, because a reference sheet
          reprinted on every worksheet is wasted paper. Scaffold: never scored,
          outside every section, so the check path never sees it. */}
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

      {/* The SCREEN half of the same panel, and the sixth S9 orphan closed.
          Gated on screen mode (C16's second option) rather than mounted from
          the route the way the calculator is: this renders React blocks, so it
          needs the resolver and the per-block boundary that live HERE — and the
          gate is what keeps a floating panel out of ActivityPrint's on-screen
          print preview and out of DevViewer.

          It is independent of `printReferencePanel`. That flag has always
          described PRINT, and until this slice print was the panel's only
          surface, so turning it off made authored content invisible everywhere
          — a trap the schema comment had to document. Now the flag means what
          it says. */}
      {mode === 'screen' && doc.referencePanel ? (
        <ReferencePanelTool
          panel={doc.referencePanel}
          renderBlock={(block) => (
            <BlockSlot
              block={block as SanitizedBlock}
              mode={mode}
              {...(versionId === undefined ? {} : { resetKey: versionId })}
              resolveComponent={resolveComponent}
              onCrash={handleCrash}
            />
          )}
        />
      ) : null}

      {/* The stale-version advisory used to render HERE, independently of the
          route's banner chain — which is how a pinned student got "your unsent
          work is safe here" and "Reload to get the new version" stacked with
          opposite advice (s4-retro finding 8). Lifted into the route's single
          dedup chain (eng review D9, 2026-08-07): one owner, one enumerated
          priority, and pinned suppressing stale falls out of ordering. */}
      {/* The other-tab notice (2.3A). Passive and non-blocking, like every
          other banner here: the student can still READ their work, which is
          the common reason a second tab exists at all. Taking over is an
          explicit choice, never automatic — two tabs silently trading the
          lock back and forth would be worse than either one being stale. */}
      {readOnly && mode === 'screen' ? (
        <div className="viewer-banner" role="status" data-banner="other-tab">
          <span>This activity is open in another tab.</span>
          {onTakeOver ? (
            <button
              type="button"
              className="viewer-banner-action"
              onClick={onTakeOver}
            >
              Use it here
            </button>
          ) : null}
        </div>
      ) : null}
      {/* ONE `disabled` fieldset rather than a readOnly prop threaded through
          every block component: the browser already disables every form
          control inside a disabled fieldset, including ones added later by a
          block type that does not exist yet. Blocks cannot forget to honor it.
          Canvas-based surfaces (graphs) are not form controls, so the CSS
          companion rule handles those. */}
      <fieldset className="viewer-worksheet" disabled={readOnly}>
      {/* CHECK GROUPS, not sections (R1). One region per group, each holding
          every section since the previous checkpoint plus the single Check
          that covers them. Extracted into its own component so each region
          owns its own hooks (the freeze-focus effect, the confirm state) —
          rendering them from a loop in here would need one ref array and one
          state map keyed by group id, which is the same thing wearing a
          disguise. */}
      {groups.map((group) => (
        <CheckGroupRegion
          key={group.id}
          group={group}
          mode={mode}
          locked={locked}
          sections={state.sections}
          crashedIn={crashedGradableIn}
          onCheck={handleCheckGroup}
        >
          {group.sections.map((sectionIndex) => {
            const section = sectionById[sectionIndex.sectionId];
            if (!section) return null;
            const status = state.sections[section.id];
            const frozen = locked && isSectionFrozen(status);
            return (
              <section
                key={section.id}
                className="viewer-section"
                data-section-id={section.id}
                data-section-phase={status?.phase ?? 'unchecked'}
                {...(frozen ? { 'data-section-frozen': 'true' } : {})}
                aria-label={section.title ?? undefined}
              >
                {section.title ? (
                  <h2 className="viewer-section__title">{section.title}</h2>
                ) : null}

                {/* THE FREEZE IS PER SECTION, not per group — and that is the
                    honest granularity, not a shortcut. A group whose members
                    half-landed is a PARTIAL LOCK (OV#15): the sections that
                    recorded a row are locked server-side and must stop
                    accepting input, while the one that 429'd wrote nothing and
                    must stay editable so Retry can work. Freezing the whole
                    group would strand that member; freezing none would leave
                    committed work editable. Same `<fieldset disabled>` idiom
                    the readOnly wrapper uses, so a block type that does not
                    exist yet cannot forget to honour it. */}
                <fieldset className="viewer-section__inputs" disabled={frozen}>
                  {section.rows.map((row) => (
                    <div
                      key={row.id}
                      className="viewer-row"
                      data-row-id={row.id}
                      data-column-count={row.columns.length}
                      // RULED GRID (2026-08-21). `Row.gridLines` shipped in the
                      // schema, was honoured by the editor toolbar and round-tripped
                      // by serialize — and no surface a STUDENT or a PRINTER sees
                      // ever read it, because the implementation was the renderer's
                      // and died with it at S9 Drop 4. Attribute name and CSS are
                      // ported from that renderer (`data-grid-lines="true"`), so a
                      // document authored before the deletion rules exactly as it
                      // used to. Emitted only when the resolved tri-state is on, so
                      // an unruled row's DOM is byte-identical to before.
                      {...(resolveGridLines(row.gridLines, print.gridLines)
                        ? { 'data-grid-lines': 'true' }
                        : {})}
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
                              label={numbering[(block as { id: string }).id]}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </fieldset>
              </section>
            );
          })}
        </CheckGroupRegion>
      ))}
      </fieldset>

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

// =============================================================================
// CheckGroupRegion — the visible check group (D1/D3/D5/D6/D7)
// -----------------------------------------------------------------------------
// R1 removes the Check button from most sections. Without a visible boundary a
// student scrolls past two buttonless sections and reasonably concludes the
// work there is not counted — so the group is a REGION, not an inference
// (D1). A rule plus a grouped background, deliberately NOT a card: the
// worksheet's surface hierarchy is already sections-as-paper on a page field,
// and a second card around them would read as a third level of nesting for
// something that is really just a bracket.
// =============================================================================

interface CheckGroupRegionProps {
  group: CheckGroup;
  mode: 'screen' | 'print';
  locked: boolean;
  sections: Record<string, SectionStatus>;
  crashedIn: (section: SectionIndex) => string[];
  onCheck: (
    sections: readonly SectionIndex[],
    only?: readonly string[],
  ) => Promise<void>;
  children: ReactNode;
}

function CheckGroupRegion({
  group,
  mode,
  locked,
  sections,
  crashedIn,
  onCheck,
  children,
}: CheckGroupRegionProps) {
  const ids = group.sections.map((s) => s.sectionId);
  const status = groupStatus(ids, sections);
  const frozen = locked && group.sections.every((s) => isSectionFrozen(sections[s.sectionId]));
  // The confirm step is INLINE rather than window.confirm (D3): a native
  // dialog is unstyleable, untestable without stubbing a global, and on a
  // Chromebook it steals focus to a surface the a11y lane cannot scan.
  const [confirming, setConfirming] = useState(false);

  // D6 — DISABLING THE FIELDSET THE STUDENT IS STANDING IN DROPS FOCUS TO THE
  // BODY. Without this the keyboard user's place in the document is simply
  // gone at the exact moment they committed their work. The status region
  // takes it instead, and being an aria-live region it also says what
  // happened.
  const statusRef = useRef<HTMLParagraphElement>(null);
  const wasFrozen = useRef(frozen);
  useEffect(() => {
    if (frozen && !wasFrozen.current) statusRef.current?.focus();
    wasFrozen.current = frozen;
  }, [frozen]);

  const crashed = group.sections.flatMap((s) => crashedIn(s));
  // T4 — in `locked` a group containing a crashed gradable block DOES NOT
  // FIRE. `free`/`single` keep the existing fire-then-report path
  // (fire unconditionally, then report the shortfall beside the status),
  // because there the student can check again once the block recovers.
  // Freezing around an ungraded block would trap an answer with no way back.
  const blockedByCrash = locked && crashed.length > 0;
  const uncovered = crashed.length;

  // Retry re-fires only what did not land (3A); every other press covers the
  // whole group.
  const retrying = status.phase === 'partial';
  const label = retrying
    ? 'Retry'
    : checkButtonLabel(group.sections.length, locked);

  const fire = () => {
    setConfirming(false);
    void onCheck(group.sections, retrying ? status.unlanded : undefined);
  };

  // Once a locked group is frozen there is nothing left to press — and no
  // unlock exists to offer. The status line carries the whole story.
  const showButton = !frozen;

  return (
    <div
      className="viewer-check-group"
      data-check-group={group.id}
      data-group-phase={status.phase}
      data-group-sections={group.sections.length}
      {...(frozen ? { 'data-group-frozen': 'true' } : {})}
    >
      {children}
      {mode === 'screen' ? (
        <div className="viewer-section__footer viewer-check-group__footer">
          {showButton && !confirming ? (
            <button
              type="button"
              className="viewer-section__check"
              disabled={status.phase === 'checking' || blockedByCrash}
              onClick={() => {
                // D3 — THE ONE PLACE Q4's "Check everywhere" IS BROKEN, and
                // deliberately. The same word cannot serve a safe repeatable
                // action and a one-way door: there is no unlock in v1, not for
                // the student and not for the teacher, and a republish is the
                // only one there is — which resets every student.
                if (locked && !retrying) setConfirming(true);
                else fire();
              }}
            >
              {label}
            </button>
          ) : null}
          {confirming ? (
            <div className="viewer-check-group__confirm" role="group">
              <p className="viewer-check-group__confirm-text">
                {group.sections.length > 1
                  ? `Check and lock these ${group.sections.length} sections? You won’t be able to change your answers after this.`
                  : 'Check and lock this section? You won’t be able to change your answers after this.'}
              </p>
              <button
                type="button"
                className="viewer-check-group__cancel"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </button>
              {/* The confirm's own fire button. It carries the primary
                  button's class for appearance and a second class for
                  IDENTITY — a guard asking "how many Check buttons are in this
                  document?" must not count a confirmation step as one. */}
              <button
                type="button"
                className="viewer-section__check viewer-check-group__confirm-fire"
                onClick={fire}
              >
                Check and lock
              </button>
            </div>
          ) : null}
          <p
            className="viewer-section__status"
            ref={statusRef}
            tabIndex={-1}
            aria-live="polite"
          >
            {blockedByCrash
              ? 'One question can’t be checked yet.'
              : groupStatusLabel(status, locked)}
          </p>
          {uncovered > 0 && !blockedByCrash ? (
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
    </div>
  );
}

interface BlockSlotProps {
  block: SanitizedBlock;
  mode: 'screen' | 'print';
  resetKey?: string;
  resolveComponent: (type: BlockType) => ComponentType<BlockComponentProps> | null;
  onCrash: (crash: BlockCrash) => void;
  /**
   * What this block shows in its number slot, or undefined for "nothing".
   * The REFERENCE-PANEL slot below never passes it, which is the whole of the
   * exclusion (ruling N3): a formula sheet cannot be numbered because its
   * blocks are not in the numbering map and this prop is not threaded there.
   */
  label?: ResolvedLabel;
}

function BlockSlot({
  block,
  mode,
  resetKey,
  resolveComponent,
  onCrash,
  label,
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
  // Stable per block id — aria-labelledby needs a document-unique target, and
  // useId would change identity across a remount the resetKey forces.
  const numberId = `blocknum-${id}`;

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
        // THE NUMBER LIVES ON THE WRAPPER, ONCE (ruling N2). The retired
        // renderer put its gutter inside each block renderer and the
        // two-column grid in each block type's CSS rule — and its own comment
        // records number_line and data_plot shipping without that grid, so the
        // number rendered 760px wide on its own line. A rule that says "any new
        // numbered type must remember to join this list" WILL be forgotten. The
        // grid is declared once here instead, and every numbered type inherits
        // it, including types that do not exist yet.
        {...(label ? { 'data-block-number': label.kind } : {})}
        // ANNOUNCED ONCE, FROM HERE (ruling D3). Per-component accessible names
        // would need ~10 component edits, have no answer for a numbered block
        // with no focusable control, and would make a ten-radio multiple choice
        // say "problem 3" ten times. A labelled group says it once on entry,
        // for every type. Controls keep their own within-block detail.
        {...(label ? { role: 'group', 'aria-labelledby': numberId } : {})}
      >
        {label ? (
          // aria-hidden: the group's accessible name already carries this text,
          // so exposing the span too would announce the number twice.
          <span
            className="viewer-block__number"
            id={numberId}
            data-label-kind={label.kind}
            aria-hidden="true"
          >
            {label.kind === 'number' ? `${label.n}.` : label.text}
          </span>
        ) : null}
        {Component ? (
          // Suspense only matters for lazy bindings; eager ones never suspend,
          // which is exactly why D16 keeps the common blocks eager.
          <Suspense
            fallback={<span className="viewer-block__loading" aria-hidden="true" />}
          >
            <Component block={block as never} mode={mode} label={label} />
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
