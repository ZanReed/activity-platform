// =============================================================================
// glossary/GlossaryHost.tsx — the glossary's place in a screen worksheet
// -----------------------------------------------------------------------------
// Owns everything between the worksheet and the dialog:
//
//   - THE MERGED INDEX (R15): the activity's own definitions ∪ the course
//     glossary. Until the store read lands (or when it fails, or when no store
//     is wired at all), keyed marks stand in with their BAKED bodies (L3); the
//     live rows replace them as soon as they arrive (EN-4).
//   - THE DEFERRED READ (R16/EN-10): never on the worksheet's critical path —
//     issued when the browser is idle after first paint (a timer where there is
//     no requestIdleCallback: Safari/iPadOS), or at once on the first open,
//     whichever comes first. A failed read is retried once, on the next open.
//   - THE SUMMON (R5, GD-8): a "Glossary" text button in the bottom-LEFT corner,
//     stacked above the reference summon when there is one; rendered only when
//     the merged index has something ACTIVE to show.
//   - FOCUS RETURN (GD-7): to the ORIGINAL opener on close, however long the
//     cross-link chain — a request plus an effect, the ToolCluster lesson: the
//     opener may be a summon that is not in the DOM again until after the render
//     that closes the dialog.
// =============================================================================

import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactElement, ReactNode } from 'react';
import {
  buildGlossaryIndex,
  entryForMark,
  type GlossarySourceEntry,
} from '@activity/schema';
import { GlossaryOpenContext, type GlossaryOpenRequest } from './context.js';
import { collectDocumentGlossary } from './documentEntries.js';
import type { GlossaryCache, GlossaryReadStatus } from './service.js';
import type { GlossaryMemory } from './GlossaryDialog.js';

const loadDialog = () => import('./GlossaryDialog.js');
const GlossaryDialog = lazy(loadDialog);

/** The course glossary for this worksheet, when the route wires one. */
export interface GlossarySource {
  readonly activityId: string;
  readonly cache: GlossaryCache;
}

export interface GlossaryHostProps {
  readonly document: unknown;
  readonly source?: GlossarySource | undefined;
  /** A reference panel shares the left corner; the summon stacks above it. */
  readonly stackAboveReference?: boolean;
  readonly children: ReactNode;
}

const IDLE_FALLBACK_MS = 1500;

function whenIdle(run: () => void): () => void {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(run);
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(run, IDLE_FALLBACK_MS);
  return () => window.clearTimeout(id);
}

interface OpenState {
  readonly entryId?: string | undefined;
  readonly opener: HTMLElement;
}

export function GlossaryHost({
  document: doc,
  source,
  stackAboveReference = false,
  children,
}: GlossaryHostProps): ReactElement {
  const docGlossary = useMemo(() => collectDocumentGlossary(doc), [doc]);
  const [storeRows, setStoreRows] = useState<GlossarySourceEntry[] | null>(null);
  const [status, setStatus] = useState<GlossaryReadStatus>('idle');
  const liveRef = useRef(true);

  useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
    };
  }, []);

  const read = useCallback(() => {
    if (!source) return;
    // The cache joins a read already in flight and owns the one-retry rule;
    // this only mirrors its outcome into render state.
    setStatus((s) => (s === 'ready' ? s : 'loading'));
    void source.cache.read(source.activityId).then((rows) => {
      if (!liveRef.current) return;
      if (rows === null) {
        setStatus('failed');
        return;
      }
      setStoreRows(rows);
      setStatus('ready');
    });
  }, [source]);

  // The deferred first read, plus a warm-up of the dialog chunk.
  useEffect(() => {
    if (!source) return undefined;
    return whenIdle(() => {
      read();
      void loadDialog();
    });
  }, [source, read]);

  const index = useMemo(() => {
    let store: readonly GlossarySourceEntry[] = docGlossary.baked;
    if (storeRows) {
      const live = new Set(storeRows.map((r) => r.id));
      store = [...storeRows, ...docGlossary.baked.filter((b) => !live.has(b.id))];
    }
    return buildGlossaryIndex(store, docGlossary.local);
  }, [docGlossary, storeRows]);

  const [openState, setOpenState] = useState<OpenState | null>(null);
  const memory = useRef<GlossaryMemory>({ query: '', scrollTop: 0 }).current;
  const summonRef = useRef<HTMLButtonElement>(null);

  const open = useCallback(
    (request: GlossaryOpenRequest) => {
      const entry = entryForMark(index, request);
      setOpenState({ entryId: entry?.id, opener: request.opener });
      if (status !== 'ready' && status !== 'loading') read();
    },
    [index, read, status],
  );

  const openFromTool = useCallback(() => {
    if (!summonRef.current) return;
    setOpenState({ opener: summonRef.current });
    if (status !== 'ready' && status !== 'loading') read();
  }, [read, status]);

  // Focus return: a request that survives the render (GD-7).
  const returnTo = useRef<HTMLElement | null>(null);
  const close = useCallback(() => {
    setOpenState((state) => {
      if (state) returnTo.current = state.opener;
      return null;
    });
  }, []);
  useEffect(() => {
    if (openState || !returnTo.current) return;
    const target = returnTo.current;
    returnTo.current = null;
    if (target.isConnected) target.focus();
    else summonRef.current?.focus();
  }, [openState]);

  const openValue = useMemo(
    () => ({ open, activeOpener: openState?.opener ?? null }),
    [open, openState],
  );

  const showSummon = index.visible.length > 0 && openState === null;

  return (
    <GlossaryOpenContext.Provider value={openValue}>
      {children}
      {showSummon ? (
        <div
          className={`tool-corner tool-corner--left${
            stackAboveReference ? ' tool-corner--stacked' : ''
          }`}
        >
          <button
            ref={summonRef}
            type="button"
            className="tool-summon"
            data-tool="glossary"
            aria-haspopup="dialog"
            onClick={openFromTool}
          >
            Glossary
          </button>
        </div>
      ) : null}
      {openState ? (
        <Suspense fallback={null}>
          <GlossaryDialog
            index={index}
            referencedIds={docGlossary.referencedIds}
            initialEntryId={openState.entryId}
            opener={openState.opener}
            loading={status === 'loading'}
            memory={memory}
            onClose={close}
          />
        </Suspense>
      ) : null}
    </GlossaryOpenContext.Provider>
  );
}
