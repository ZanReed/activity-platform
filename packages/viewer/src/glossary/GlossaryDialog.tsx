// =============================================================================
// glossary/GlossaryDialog.tsx — the glossary a student looks words up in
// -----------------------------------------------------------------------------
// ONE surface, two doors (D1): a tapped term opens it on that term; the
// "Glossary" button opens it at the list. Lazy — only a student who opens it
// pays for it (and for the GraphFigure a definition may carry).
//
// The rulings this file implements (docs/design/glossary.md §5b/§5d):
//
//   PLACEMENT (GD-1)   ≥768px: a dialog ANCHORED to its opener — under a
//                      tapped term, flipped above when there is no room, so the
//                      term's own line stays visible — with no scrim. Under
//                      768px: a bottom sheet with a scrim, opening at HALF
//                      height on a term.
//   ONE STACK (GD-2)   The list is the root. Every detail navigation pushes —
//                      a list pick, a search pick, a cross-link. Back is a
//                      visible button (no keyboard chord: Alt+← is the
//                      browser's Back on Chromebooks, EN-6). Escape ALWAYS
//                      closes. Typing never touches the stack.
//   OPENING (GD-3)     From a term: search empty, its row selected and in view,
//                      focus on the detail heading. From the tool: focus in
//                      search, A→Z list, "Pick a word, or search."
//   LATE MERGE (GD-5)  Store rows arriving while open never move the selection
//                      or the scroll anchor.
//   MODALITY (T1-A)    aria-modal with a focus trap and light dismiss; focus
//                      returns to the ORIGINAL opener however long the chain
//                      (the host restores it). The calculator and reference
//                      panel are non-modal and stay open underneath (EN-7).
// =============================================================================

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, KeyboardEvent, ReactElement, ReactNode } from 'react';
import {
  GLOSSARY_LOCALES,
  linkify,
  localeLabel,
  searchGlossary,
  suggestTerm,
  type GlossaryIndex,
  type GlossaryIndexEntry,
  type GlossarySearchResult,
  type MatchRange,
} from '@activity/schema';
import { DefinitionBlocks } from '../print/DefinitionGlossary.js';
import { GlossaryNavContext } from './context.js';

/** Per-page memory the host keeps across opens (GD-17). */
export interface GlossaryMemory {
  query: string;
  scrollTop: number;
}

export interface GlossaryDialogProps {
  readonly index: GlossaryIndex;
  /** Entry ids this activity's marks point at — the "In this activity" group. */
  readonly referencedIds: readonly string[];
  /** The entry a tapped term opened on; undefined when opened from the tool. */
  readonly initialEntryId?: string | undefined;
  readonly opener: HTMLElement;
  /** The store read is still in flight (GD-5 footer). */
  readonly loading: boolean;
  readonly memory: GlossaryMemory;
  readonly onClose: () => void;
}

const SHEET_QUERY = '(max-width: 767.98px)';
const EDGE = 16;
const GAP = 8;

function useSheetLayout(): boolean {
  const [sheet, setSheet] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.(SHEET_QUERY).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia?.(SHEET_QUERY);
    if (!mq) return undefined;
    const update = () => setSheet(mq.matches);
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return sheet;
}

function Highlighted({ text, range }: { text: string; range?: MatchRange | undefined }) {
  if (!range) return <>{text}</>;
  const [start, end] = range;
  return (
    <>
      {text.slice(0, start)}
      <mark className="glossary-mark">{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  );
}

function variantLines(
  entry: GlossaryIndexEntry,
  hit?: GlossarySearchResult,
): ReactNode {
  const lines = GLOSSARY_LOCALES.flatMap((locale) => {
    const v = entry.variants[locale];
    if (!v) return [];
    const range = hit?.name?.locale === locale ? hit.nameRange : undefined;
    return [
      <span key={locale} className="glossary-row__variant">
        {localeLabel(locale)}: <Highlighted text={v} range={range} />
      </span>,
    ];
  });
  return lines.length > 0 ? lines : null;
}

/** Attribute-selector escaping without assuming `CSS.escape` exists. */
function escapeId(id: string): string {
  const css = (globalThis as { CSS?: { escape?: (v: string) => string } }).CSS;
  return css?.escape ? css.escape(id) : id.replace(/["\\]/g, '\\$&');
}

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export default function GlossaryDialog({
  index,
  referencedIds,
  initialEntryId,
  opener,
  loading,
  memory,
  onClose,
}: GlossaryDialogProps): ReactElement {
  const sheet = useSheetLayout();
  const fromTerm = initialEntryId !== undefined;
  const [query, setQuery] = useState(fromTerm ? '' : memory.query);
  const [stack, setStack] = useState<string[]>(() =>
    initialEntryId ? [initialEntryId] : [],
  );
  const [sheetView, setSheetView] = useState<'list' | 'detail'>(
    fromTerm ? 'detail' : 'list',
  );
  const [sheetHeight, setSheetHeight] = useState<'half' | 'full'>(
    fromTerm ? 'half' : 'full',
  );
  const [announce, setAnnounce] = useState('');
  const [position, setPosition] = useState<CSSProperties>({});

  const dialogRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const searchId = useId();

  const currentId = stack[stack.length - 1];
  const current = currentId ? index.byId.get(currentId) : undefined;
  const results = useMemo(() => searchGlossary(index, query), [index, query]);
  const trimmed = query.trim();

  // "In this activity" (T2): the entries this worksheet's marks open, pinned
  // ABOVE the full list — which stays complete below it (hides nothing).
  const inActivity = useMemo(() => {
    const out: GlossaryIndexEntry[] = [];
    const seen = new Set<string>();
    const visible = new Set(index.visible.map((e) => e.id));
    for (const id of referencedIds) {
      const resolved = index.hiddenBy.get(id) ?? id;
      if (seen.has(resolved) || !visible.has(resolved)) continue;
      seen.add(resolved);
      const entry = index.byId.get(resolved);
      if (entry) out.push(entry);
    }
    return out;
  }, [index, referencedIds]);

  // The group earns its place only when the full list holds more than this
  // activity's own words; otherwise it would just print the list twice.
  const showGroup = inActivity.length > 0 && inActivity.length < index.visible.length;

  // ---- placement (GD-1) ------------------------------------------------------
  const place = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || sheet) {
      setPosition({});
      return;
    }
    const anchor = opener.getBoundingClientRect();
    const box = dialog.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = anchor.bottom + GAP;
    if (top + box.height > vh - EDGE) {
      const above = anchor.top - GAP - box.height;
      top = above >= EDGE ? above : Math.max(EDGE, vh - EDGE - box.height);
    }
    const left = Math.min(Math.max(EDGE, anchor.left), Math.max(EDGE, vw - EDGE - box.width));
    setPosition({ top, left });
  }, [opener, sheet]);

  useLayoutEffect(() => {
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [place]);

  // ---- opening state (GD-3) ----------------------------------------------------
  useEffect(() => {
    // Under 768px the half sheet covers the lower half of the screen; if the
    // tapped word sits there, bring it up into view so the sentence the student
    // was reading stays visible above the definition (GD-1's whole point).
    if (fromTerm && sheet) {
      const rect = opener.getBoundingClientRect();
      if (rect.bottom > window.innerHeight * 0.45) {
        window.scrollBy?.({ top: rect.top - window.innerHeight * 0.2 });
      }
    }
    if (fromTerm) {
      headingRef.current?.focus();
      if (initialEntryId) {
        listRef.current
          ?.querySelector<HTMLElement>(`[data-entry-id="${escapeId(initialEntryId)}"]`)
          ?.scrollIntoView?.({ block: 'nearest' });
      }
    } else {
      searchRef.current?.focus();
      if (listRef.current) listRef.current.scrollTop = memory.scrollTop;
    }
    // Deliberately once, on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A new detail (push or pop) moves focus to its heading, so a screen reader
  // reads the term and then its definition.
  const lastFocused = useRef(currentId);
  useEffect(() => {
    if (currentId && currentId !== lastFocused.current) headingRef.current?.focus();
    lastFocused.current = currentId;
  }, [currentId]);

  // ---- late merge keeps the scroll anchor (GD-5) --------------------------------
  const anchorRef = useRef<{ id: string; offset: number } | null>(null);
  const recordAnchor = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    memory.scrollTop = list.scrollTop;
    const top = list.getBoundingClientRect().top;
    for (const row of Array.from(list.querySelectorAll<HTMLElement>('[data-entry-id]'))) {
      const rect = row.getBoundingClientRect();
      if (rect.bottom > top) {
        anchorRef.current = { id: row.dataset.entryId ?? '', offset: rect.top - top };
        return;
      }
    }
  }, [memory]);
  useLayoutEffect(() => {
    const list = listRef.current;
    const anchor = anchorRef.current;
    if (!list || !anchor) return;
    const row = list.querySelector<HTMLElement>(`[data-entry-id="${escapeId(anchor.id)}"]`);
    if (!row) return;
    const delta = row.getBoundingClientRect().top - list.getBoundingClientRect().top - anchor.offset;
    if (delta !== 0) list.scrollTop += delta;
  }, [index]);

  // ---- live result count (GD-6) ------------------------------------------------
  useEffect(() => {
    memory.query = query;
    if (!trimmed) {
      setAnnounce('');
      return undefined;
    }
    const n = results.length;
    const t = setTimeout(() => setAnnounce(`${n} ${n === 1 ? 'word' : 'words'}`), 300);
    return () => clearTimeout(t);
  }, [memory, query, trimmed, results.length]);

  // ---- light dismiss ------------------------------------------------------------
  useEffect(() => {
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && dialogRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [onClose]);

  // ---- navigation (GD-2) --------------------------------------------------------
  const push = useCallback((id: string) => {
    setStack((s) => (s[s.length - 1] === id ? s : [...s, id]));
    setSheetView('detail');
  }, []);
  const nav = useMemo(() => ({ go: push }), [push]);

  const canGoBack = sheet ? sheetView === 'detail' : stack.length > 1;
  const back = () => {
    if (sheet && stack.length <= 1) {
      setStack([]);
      setSheetView('list');
      setSheetHeight('full');
      return;
    }
    setStack((s) => s.slice(0, -1));
  };
  const browse = () => {
    setSheetHeight('full');
    setSheetView('list');
  };

  // ---- keyboard: Escape closes, Tab is trapped, ↑/↓ move through rows -----------
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.tabIndex >= 0 && !el.closest('[hidden]'),
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const rows = Array.from(listRef.current?.querySelectorAll<HTMLElement>('.glossary-row') ?? []);
    if (rows.length === 0) return;
    event.preventDefault();
    const at = rows.indexOf(document.activeElement as HTMLElement);
    let next = at;
    if (event.key === 'ArrowDown') next = Math.min(rows.length - 1, at + 1);
    if (event.key === 'ArrowUp') next = Math.max(0, at - 1);
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = rows.length - 1;
    rows[next]?.focus();
  };

  // ---- rendering ----------------------------------------------------------------
  // Roving tabindex (GD-7): exactly one row is in the Tab order — the selected
  // one if it is on screen, else the first — and ↑/↓/Home/End move within.
  const renderedIds = trimmed
    ? results.map((r) => r.entry.id)
    : [...(showGroup ? inActivity.map((e) => e.id) : []), ...index.visible.map((e) => e.id)];
  const tabbableId =
    currentId && renderedIds.includes(currentId) ? currentId : renderedIds[0];
  let tabAssigned = false;
  const row = (entry: GlossaryIndexEntry, hit?: GlossarySearchResult, keyPrefix = '') => {
    const termRange = hit?.name && !hit.name.locale ? hit.nameRange : undefined;
    const selected = entry.id === currentId;
    const tabbable = !tabAssigned && entry.id === tabbableId;
    if (tabbable) tabAssigned = true;
    return (
      <li key={`${keyPrefix}${entry.id}`}>
        <button
          type="button"
          className="glossary-row"
          data-entry-id={entry.id}
          tabIndex={tabbable ? 0 : -1}
          aria-current={selected ? 'true' : undefined}
          onClick={() => push(entry.id)}
        >
          <span className="glossary-row__term">
            <Highlighted text={entry.term} range={termRange} />
          </span>
          {variantLines(entry, hit)}
          {hit?.snippet ? (
            <span className="glossary-row__snippet">
              <Highlighted text={hit.snippet.text} range={hit.snippet.range} />
            </span>
          ) : null}
        </button>
      </li>
    );
  };

  const suggestion =
    trimmed && results.length === 0
      ? suggestTerm(
          trimmed,
          index.visible.flatMap((e) => e.names.map((n) => n.text)),
        )
      : null;

  const listBody = trimmed ? (
    results.length > 0 ? (
      <ul className="glossary-list">{results.map((hit) => row(hit.entry, hit))}</ul>
    ) : (
      <div className="glossary-empty">
        <p>No words match “{trimmed}”.</p>
        {suggestion ? (
          <button type="button" className="glossary-suggest" onClick={() => setQuery(suggestion)}>
            Did you mean {suggestion}?
          </button>
        ) : null}
      </div>
    )
  ) : (
    <>
      {showGroup ? (
        <>
          <h3 className="glossary-group">In this activity</h3>
          <ul className="glossary-list">{inActivity.map((e) => row(e, undefined, 'here:'))}</ul>
          <h3 className="glossary-group">All words</h3>
        </>
      ) : null}
      <ul className="glossary-list">{index.visible.map((e) => row(e))}</ul>
    </>
  );

  const detail = current ? (
    <article className="glossary-detail">
      <h2 className="glossary-detail__term" ref={headingRef} tabIndex={-1}>
        {current.term}
      </h2>
      {variantLines(current)}
      <div className="glossary-detail__body">
        {current.body.length > 0 ? (
          <GlossaryNavContext.Provider value={nav}>
            <DefinitionBlocks blocks={linkify(current.body, index, current.id)} />
          </GlossaryNavContext.Provider>
        ) : (
          <p>This definition isn’t available right now.</p>
        )}
      </div>
    </article>
  ) : (
    <p className="glossary-detail__prompt">Pick a word, or search.</p>
  );

  const showList = !sheet || sheetView === 'list';
  const showDetail = !sheet || sheetView === 'detail';

  return (
    <div className="glossary-layer" data-layout={sheet ? 'sheet' : 'popover'}>
      {sheet ? <div className="glossary-scrim" aria-hidden="true" /> : null}
      <div
        ref={dialogRef}
        className="glossary-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-height={sheet ? sheetHeight : undefined}
        style={position}
        onKeyDown={onKeyDown}
      >
        <div className="glossary-dialog__header">
          {canGoBack ? (
            <button type="button" className="glossary-back" onClick={back}>
              ‹ Back
            </button>
          ) : null}
          <h2 className="glossary-dialog__title" id={titleId}>
            Glossary
          </h2>
          <button
            type="button"
            className="glossary-close"
            aria-label="Close glossary"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="glossary-dialog__panes">
          <div className="glossary-list-pane" hidden={!showList}>
            <label className="glossary-search__label" htmlFor={searchId}>
              Search
            </label>
            <input
              ref={searchRef}
              id={searchId}
              className="glossary-search"
              type="search"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => {
                if (sheet) setSheetHeight('full');
              }}
            />
            <div className="glossary-live" aria-live="polite" role="status">
              {announce}
            </div>
            <div
              className="glossary-list-scroll"
              ref={listRef}
              onScroll={recordAnchor}
              onKeyDown={onListKeyDown}
            >
              {listBody}
              {loading ? (
                <p className="glossary-loading">Loading course glossary…</p>
              ) : null}
            </div>
          </div>
          <div className="glossary-detail-pane" hidden={!showDetail}>
            {detail}
            {sheet && sheetHeight === 'half' ? (
              <button type="button" className="glossary-browse" onClick={browse}>
                Browse glossary
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
