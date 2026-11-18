// =============================================================================
// WorkPhotoViewer.tsx — the grade panel's photos and the full-size view
// (media submissions slice 3; docs/design/media-submissions.md §7)
// -----------------------------------------------------------------------------
// Lazy (WorkPhotos.tsx → WorkPhotoStrip): only a teacher who opens a photo
// answer downloads it. Full size, zoom, and a VIEW-ONLY rotate (phone photos
// arrive sideways often enough; rotating never rewrites the stored photo).
// Rare styles are inline on purpose: a utility class nothing else uses would
// grow the app's one stylesheet, which the student shell pays for.
// =============================================================================

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { GradingQueueRow } from '../lib/grading';
// Imports NOTHING the Responses route imports at runtime: a module the two
// shared would make Rollup fold the route into a shared chunk, and the perf
// budget's "responses" journey measures that route by its own entry.
import { fetchPhotoStates, signWorkPhotos, type PhotoKey, type PhotoState } from '../lib/workPhotos';

function idsOf(row: GradingQueueRow): string[] {
  return (row.response_photos ?? []).map((p) => p.id).filter((id): id is string => typeof id === 'string');
}

/** The words for a photo the teacher cannot see (§6.5, G18). `released` is
 *  the grade's release time; `removedAtHandIn` is the check's own `removed`
 *  flag (retention had already removed it when the check was made). A photo
 *  whose state the server confirmed as `ok` but whose URL did not come back
 *  gets a neutral line, never a reason that may be untrue (Fable review). */
export function unavailablePhotoText(
  state: PhotoState | undefined,
  released: string | null,
  removedAtHandIn = false,
): string {
  if (state === 'changed') return 'This photo was changed after it was handed in, so it can’t be shown.';
  if (removedAtHandIn) return 'This photo was no longer stored when it was handed in.';
  if (state === 'removed') {
    return released
      ? 'Photo removed 30 days after the grade was released.'
      : 'Photo removed at the end of the school year.';
  }
  return 'This photo can’t be shown right now. Refresh to try again.';
}

/** Re-sign a little before the URLs' 10 minutes are up. */
export const RESIGN_MS = 9 * 60 * 1000;

export interface WorkPhotoMaps {
  urls: Record<string, string | null>;
  states: Record<string, PhotoState>;
  /** The read failed: the queue says so once rather than per photo. */
  failed: boolean;
}

const EMPTY: WorkPhotoMaps = { urls: {}, states: {}, failed: false };

/** The open answer's photos, signed in one call (10-minute URLs, §6.3) and
 *  re-signed before they lapse; only what the teacher opens is signed. */
export function useWorkPhotos(activityId: string, rows: readonly GradingQueueRow[] | null): WorkPhotoMaps {
  const keys = useMemo(() => {
    const out: PhotoKey[] = [];
    const seen = new Set<string>();
    for (const row of rows ?? []) {
      if (row.block_type !== 'photo_response') continue;
      for (const id of idsOf(row)) {
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({ activityId, studentId: row.student_id, photoId: id });
      }
    }
    return out;
  }, [activityId, rows]);
  const signature = keys.map((k) => k.photoId).join(',');
  const [maps, setMaps] = useState<WorkPhotoMaps>(EMPTY);

  useEffect(() => {
    if (keys.length === 0) {
      setMaps(EMPTY);
      return;
    }
    let alive = true;
    const load = async () => {
      try {
        const [urls, states] = await Promise.all([
          signWorkPhotos(keys),
          fetchPhotoStates(activityId, keys.map((k) => k.photoId)),
        ]);
        if (alive) setMaps({ urls, states, failed: false });
      } catch {
        if (alive) setMaps((m) => ({ ...m, failed: true }));
      }
    };
    void load();
    const timer = setInterval(() => void load(), RESIGN_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
    // `signature` stands for `keys`: re-sign when the set of photos changes,
    // not on every new array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, signature]);

  return maps;
}


const THUMB: CSSProperties = { width: '10rem', height: '8rem', objectFit: 'contain' };

/** The grade panel's photos: thumbnails that open full size. */
export default function WorkPhotoStrip({ row, activityId }: { row: GradingQueueRow; activityId: string }) {
  const rows = useMemo(() => [row], [row]);
  const photos = useWorkPhotos(activityId, rows);
  const ids = idsOf(row);
  const [open, setOpen] = useState<number | null>(null);
  if (ids.length === 0) return null;
  if (photos.failed && Object.keys(photos.urls).length === 0) {
    return <p className="text-sm text-muted">The photos couldn’t be loaded. Refresh to try again.</p>;
  }
  const viewable = ids.filter((id) => photos.urls[id]);
  return (
    <>
      {photos.failed ? (
        <p className="mb-1 text-xs text-muted">The photo links couldn’t be refreshed. Refresh the page if a photo won’t open.</p>
      ) : null}
      <ul className="flex flex-wrap gap-2" aria-label="Photos of the student’s working" data-work-photos>
        {ids.map((id, i) => {
          const url = photos.urls[id];
          const known = id in photos.urls;
          return (
            <li key={id}>
              {url ? (
                <button
                  type="button"
                  onClick={() => setOpen(viewable.indexOf(id))}
                  className="block rounded-md border border-line bg-canvas p-0.5"
                  aria-label={`Open photo ${i + 1} full size`}
                  data-photo-state="ok"
                >
                  <img src={url} alt={`Photo ${i + 1} of the student’s working`} className="rounded" style={THUMB} />
                </button>
              ) : known ? (
                <p
                  className="flex items-center rounded-md border border-dashed border-line px-2 text-center text-xs text-muted"
                  style={{ ...THUMB, objectFit: undefined }}
                  data-photo-state={photos.states[id] ?? 'removed'}
                >
                  {unavailablePhotoText(
                    photos.states[id],
                    row.released_at,
                    (row.response_photos ?? []).some((p) => p.id === id && p.removed),
                  )}
                </p>
              ) : (
                <div className="rounded-md bg-surface-2" style={THUMB} aria-label="Loading photo" />
              )}
            </li>
          );
        })}
      </ul>
      {open !== null && viewable.length > 0 ? (
        <WorkPhotoViewer
          urls={viewable.map((id) => photos.urls[id]!)}
          start={Math.max(0, open)}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}

const ZOOMS = [1, 1.5, 2, 3];
/** Room the photo may fill: the viewport less the toolbar and padding. */
const TOOLBAR_PX = 72;
const PAD_PX = 32;

/**
 * The size the photo is drawn at, and the size of the box it is laid out in.
 * Zoom 1 fits the photo to the room; each step enlarges from there (a small
 * photo grows too). A quarter-turned photo's box swaps its sides, so the
 * scroll area matches what is seen rather than the unrotated image.
 */
export function viewerGeometry(
  natural: { w: number; h: number },
  room: { w: number; h: number },
  turns: number,
  scale: number,
): { img: { w: number; h: number }; box: { w: number; h: number } } {
  const sideways = Math.abs(turns) % 2 === 1;
  const seenW = sideways ? natural.h : natural.w;
  const seenH = sideways ? natural.w : natural.h;
  const fit = Math.min(room.w / seenW, room.h / seenH);
  const k = fit * scale;
  const img = { w: natural.w * k, h: natural.h * k };
  return { img, box: sideways ? { w: img.h, h: img.w } : img };
}

/** Full size, zoom, and a rotate that only turns the view. */
export function WorkPhotoViewer({ urls, start, onClose }: { urls: string[]; start: number; onClose: () => void }) {
  const [index, setIndex] = useState(start);
  const [turns, setTurns] = useState(0);
  const [zoom, setZoom] = useState(0);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    opener.current = document.activeElement;
    closeRef.current?.focus();
    return () => {
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
  }, []);

  // A re-sign can shorten the list while the view is open: never past its end.
  const last = urls.length - 1;
  const at = Math.min(index, Math.max(0, last));

  const show = (i: number) => {
    setIndex(i);
    setTurns(0);
    setZoom(0);
    setNatural(null);
  };

  // Keys on the DOCUMENT, not the dialog element: a button that disables
  // under focus (Next on the last photo) drops focus to <body>, and an
  // element-level handler would then never hear Escape (caught by the e2e).
  // Tab stays inside the dialog (it is aria-modal).
  const atRef = useRef(at);
  atRef.current = at;
  const showRef = useRef(show);
  showRef.current = show;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = atRef.current;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowRight' && i < last) showRef.current(i + 1);
      else if (e.key === 'ArrowLeft' && i > 0) showRef.current(i - 1);
      else if (e.key === 'Tab' && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled])')];
        if (focusable.length === 0) return;
        const first = focusable[0]!;
        const end = focusable[focusable.length - 1]!;
        const inside = dialogRef.current.contains(document.activeElement);
        if (e.shiftKey && (document.activeElement === first || !inside)) {
          e.preventDefault();
          end.focus();
        } else if (!e.shiftKey && (document.activeElement === end || !inside)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [last, onClose]);

  const scale = ZOOMS[zoom] ?? 1;
  const room =
    typeof window === 'undefined'
      ? { w: 800, h: 600 }
      : { w: Math.max(100, window.innerWidth - PAD_PX), h: Math.max(100, window.innerHeight - TOOLBAR_PX - PAD_PX) };
  const geometry = natural ? viewerGeometry(natural, room, turns, scale) : null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${at + 1} of ${urls.length}`}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
      data-photo-viewer
    >
      <div className="flex flex-wrap items-center gap-2 p-3 text-sm text-white">
        <span style={{ marginRight: 'auto' }}>
          Photo {at + 1} of {urls.length}
        </span>
        <ViewerButton label="Rotate left" onClick={() => setTurns((t) => t - 1)}>⟲</ViewerButton>
        <ViewerButton label="Rotate right" onClick={() => setTurns((t) => t + 1)}>⟳</ViewerButton>
        <ViewerButton label="Zoom out" disabled={zoom === 0} onClick={() => setZoom((z) => Math.max(0, z - 1))}>−</ViewerButton>
        <ViewerButton label="Zoom in" disabled={zoom === ZOOMS.length - 1} onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))}>+</ViewerButton>
        {urls.length > 1 ? (
          <>
            <ViewerButton label="Previous photo" disabled={at === 0} onClick={() => { show(at - 1); if (at - 1 === 0) closeRef.current?.focus(); }}>‹</ViewerButton>
            <ViewerButton label="Next photo" disabled={at === last} onClick={() => { show(at + 1); if (at + 1 === last) closeRef.current?.focus(); }}>›</ViewerButton>
          </>
        ) : null}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-md bg-white px-3 font-medium text-ink"
        >
          Close
        </button>
      </div>
      <div className="flex-1 overflow-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="flex items-center justify-center p-4" style={{ minHeight: '100%', minWidth: '100%' }}>
          <div
            className="relative shrink-0"
            style={geometry ? { width: geometry.box.w, height: geometry.box.h } : undefined}
          >
            <img
              src={urls[at]}
              alt={`Photo ${at + 1} of the student’s working`}
              data-turns={((turns % 4) + 4) % 4}
              data-zoom={scale}
              onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth || 1, h: e.currentTarget.naturalHeight || 1 })}
              style={
                geometry
                  ? {
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: geometry.img.w,
                      height: geometry.img.h,
                      maxWidth: 'none',
                      transform: `translate(-50%, -50%) rotate(${turns * 90}deg)`,
                    }
                  : { maxWidth: '100%', maxHeight: `calc(100vh - ${TOOLBAR_PX + PAD_PX}px)`, transform: `rotate(${turns * 90}deg)` }
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewerButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="min-h-11 rounded-md border px-2 text-lg text-white disabled:opacity-60"
      style={{ minWidth: '2.75rem', borderColor: 'rgba(255, 255, 255, 0.4)' }}
    >
      {children}
    </button>
  );
}
