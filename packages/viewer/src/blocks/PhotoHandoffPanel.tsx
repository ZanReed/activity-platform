// =============================================================================
// blocks/PhotoHandoffPanel.tsx — "Use my phone": the Chromebook's QR panel
// (media submissions slice 2c; docs/design/media-submissions.md §4.1, MS-3)
// -----------------------------------------------------------------------------
// Its own lazy chunk, loaded only when a student presses "Use my phone", so
// the QR encoder (uqr) is paid for by nobody else — not the shell, not a page
// whose student just picks a file.
//
//   open    → start_photo_handoff (the same gate as Add a photo, and refused
//             in a quiz or an exam) → a 43-character code
//   show    → a QR of {origin}/h#<code>: the code is in the FRAGMENT, so the
//             phone never sends it to a server as part of a URL
//   poll    → photo_handoff_status every 3 s; each photo that arrived joins
//             the block's answer as an ordinary server ref, exactly as a
//             device upload does once it lands (the thumbnail, Remove and the
//             check need nothing new)
//   close   → end_photo_handoff: the code stops working at once. Unmounting
//             (the page closes, the section locks) closes it too.
//
// Polling, not Realtime: the realtime client is stubbed out of the app
// (CLAUDE.md), and the help-request panel is the precedent.
// =============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { encode } from 'uqr';
import type { ViewerStore } from '../store/store.js';
import { PHOTO_HANDOFF_PATH, photoLink } from './photoLinkSeam.js';
import { discardPhoto } from './photoUpload.js';

export const POLL_MS = 3000;

export const HANDOFF_INTRO =
  'Scan this with your phone’s camera, then take the photo on your phone. Photograph only your working. Keep faces and names out of the picture.';
export const HANDOFF_EXPIRED_TEXT = 'This code has stopped working.';

type Refusal = 'photos_off' | 'handoff_not_here' | 'handoff_cap' | 'not_in_class' | 'not_available' | 'failed';

export function handoffRefusalText(code: Refusal): string {
  switch (code) {
    case 'photos_off':
      return 'Your teacher hasn’t turned photo answers on yet.';
    case 'handoff_not_here':
      return 'Phones aren’t used in a quiz or an exam. Use Add a photo instead.';
    case 'handoff_cap':
      return 'You’ve made a lot of phone codes today. Use Add a photo instead.';
    case 'not_in_class':
      return 'You can add a photo once you’re in a class that has this activity.';
    case 'not_available':
      return 'This question doesn’t take photos any more. Reload the page.';
    default:
      return 'The phone code didn’t start. Check your connection and try again.';
  }
}

/** Revoke a code. The supabase-js builder is LAZY: it sends only when
 *  something calls its `then`, so a bare `void client.rpc(…)` sends nothing
 *  (caught by the e2e: Done never revoked the code). Promise.resolve calls it. */
function endHandoff(id: string): void {
  if (!photoLink) return;
  void Promise.resolve(photoLink.client.rpc('end_photo_handoff', { p_handoff_id: id })).catch(() => undefined);
}

function refusalOf(error: unknown): Refusal {
  const message = String((error as { message?: unknown } | null)?.message ?? '');
  for (const code of ['photos_off', 'handoff_not_here', 'handoff_cap', 'not_in_class', 'not_available'] as const) {
    if (message.includes(code)) return code;
  }
  if (message.includes('not_a_student')) return 'not_in_class';
  return 'failed';
}

type State =
  | { kind: 'starting' }
  | { kind: 'showing'; id: string; code: string; expiresAt: number; slots: number }
  | { kind: 'refused'; code: Refusal };

/** After a code stops (expiry, or the server says it is no longer live), the
 *  poll keeps listening this long: an upload that started at minute 9 still
 *  arrives at minute 11 (handoff_confirm honours it), and the Chromebook must
 *  still be there to add it (Fable review 2026-11-18). */
export const GRACE_MS = 60_000;

/**
 * One poll. Adds every photo that ARRIVED and this panel has not seen before
 * to the block's answer, and returns how many have arrived. Plain (no React
 * state), so Done can run it once more after the panel is gone.
 *
 * `seen` is the panel's memory: a photo the student REMOVED stays in the
 * server's list of arrivals, and must never come back on the next poll as a
 * ref to a deleted row (Fable review). An arrival with no room left (a device
 * photo was added meanwhile) is discarded once, never kept invisibly.
 */
async function pollOnce(
  handoffId: string,
  store: ViewerStore,
  blockId: string,
  maxPhotos: number,
  seen: Set<string>,
): Promise<{ arrived: number; live: boolean } | null> {
  if (!photoLink) return null;
  const { data, error } = await Promise.resolve(
    photoLink.client.rpc('photo_handoff_status', { p_handoff_id: handoffId }),
  );
  if (error) return null;
  const status = data as { photos?: unknown; live?: unknown } | null;
  const ids = Array.isArray(status?.photos) ? status.photos.filter((x): x is string => typeof x === 'string') : [];
  const fresh = ids.filter((id) => !seen.has(id));
  fresh.forEach((id) => seen.add(id));
  if (fresh.length > 0) {
    const current = store.getState().responses.photos?.[blockId] ?? [];
    const have = new Set(current.map((r) => r.id));
    const add = fresh.filter((id) => !have.has(id));
    const room = Math.max(0, maxPhotos - current.length);
    add.slice(room).forEach((id) => void discardPhoto(id));
    const take = add.slice(0, room);
    if (take.length > 0) store.setPhotos(blockId, [...current, ...take.map((id) => ({ id }))]);
  }
  return { arrived: ids.length, live: status?.live !== false };
}

interface Props {
  store: ViewerStore;
  blockId: string;
  maxPhotos: number;
  onClose: () => void;
}

function QrCode({ text }: { text: string }) {
  const qr = useMemo(() => encode(text, { ecc: 'M', border: 4 }), [text]);
  const path = useMemo(() => {
    let d = '';
    qr.data.forEach((row, y) => row.forEach((dark, x) => {
      if (dark) d += `M${x} ${y}h1v1h-1z`;
    }));
    return d;
  }, [qr]);
  return (
    <svg
      className="viewer-photo-handoff__qr"
      viewBox={`0 0 ${qr.size} ${qr.size}`}
      role="img"
      aria-label="QR code to open on your phone"
      shapeRendering="crispEdges"
    >
      <rect width={qr.size} height={qr.size} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  );
}

function remaining(expiresAt: number, now: number): string {
  const s = Math.max(0, Math.round((expiresAt - now) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function PhotoHandoffPanel({ store, blockId, maxPhotos, onClose }: Props) {
  const [state, setState] = useState<State>({ kind: 'starting' });
  const [arrived, setArrived] = useState(0);
  const [serverLive, setServerLive] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [attempt, setAttempt] = useState(0);
  const liveId = useRef<string | null>(null);
  const seen = useRef(new Set<string>());

  // Start (and restart, on "Show a new code").
  useEffect(() => {
    const link = photoLink;
    if (!link) return;
    let alive = true;
    setState({ kind: 'starting' });
    setArrived(0);
    setServerLive(true);
    const { activityId, versionId, responses } = store.getState();
    const held = responses.photos?.[blockId]?.length ?? 0;
    void Promise.resolve(
      link.client.rpc('start_photo_handoff', {
        p_activity_id: activityId,
        p_version_id: versionId,
        p_block_id: blockId,
        p_slots: Math.max(1, maxPhotos - held),
      }),
    )
      .then(({ data, error }) => {
        const row = data as { id?: unknown; code?: unknown; expires_at?: unknown; slots?: unknown } | null;
        if (error || typeof row?.id !== 'string' || typeof row.code !== 'string') {
          if (alive) setState({ kind: 'refused', code: refusalOf(error) });
          return;
        }
        if (!alive) {
          // Superseded (a restart, StrictMode's second run) or unmounted while
          // starting: this code must not outlive the panel, and it must never
          // become the id Done revokes — a late answer here would otherwise
          // overwrite the live code's id and leave that code working.
          endHandoff(row.id);
          return;
        }
        liveId.current = row.id;
        const expiresAt = typeof row.expires_at === 'string' ? Date.parse(row.expires_at) : Date.now() + 600_000;
        const slots = typeof row.slots === 'number' ? row.slots : 1;
        setState({ kind: 'showing', id: row.id, code: row.code, expiresAt, slots });
      })
      .catch(() => alive && setState({ kind: 'refused', code: 'failed' }));
    return () => {
      alive = false;
    };
  }, [store, blockId, maxPhotos, attempt]);

  // Unmounting (the page closes, the section changes) revokes the code.
  useEffect(
    () => () => {
      const id = liveId.current;
      if (id) endHandoff(id);
    },
    [],
  );

  const showing = state.kind === 'showing' ? state : null;
  // FULL only once every slot's photo has ARRIVED. handoff_reserve takes a
  // slot before the bytes are stored, so "no slots left" alone is not the end:
  // a poll between reserve and confirm sees slots 0 and no photo yet (Fable).
  const full = showing !== null && arrived >= showing.slots;
  const expired = showing !== null && !full && (now >= showing.expiresAt || !serverLive);

  // The poll and the countdown: every 3 s until every photo has arrived, or
  // until GRACE_MS after the code stopped.
  useEffect(() => {
    if (!showing || !photoLink) return;
    let alive = true;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    let stoppedAt: number | null = null;
    const timer = setInterval(() => {
      void pollOnce(showing.id, store, blockId, maxPhotos, seen.current)
        .then((r) => {
          if (!alive || !r) return;
          setArrived(r.arrived);
          setServerLive(r.live);
          const stopped = !r.live || Date.now() >= showing.expiresAt;
          if (stopped && stoppedAt === null) stoppedAt = Date.now();
          if (r.arrived >= showing.slots || (stoppedAt !== null && Date.now() - stoppedAt >= GRACE_MS)) {
            clearInterval(timer);
          }
        })
        .catch(() => undefined); // a missed poll is caught up by the next
    }, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
      clearInterval(tick);
    };
  }, [showing, store, blockId, maxPhotos]);

  function close() {
    const id = liveId.current;
    liveId.current = null;
    if (id) {
      endHandoff(id);
      // A photo confirmed since the last poll, or one whose upload was already
      // under way, still arrives (Fable): listen once now and once more a poll
      // later, after the panel has gone.
      const once = () => void pollOnce(id, store, blockId, maxPhotos, seen.current).catch(() => undefined);
      once();
      setTimeout(once, POLL_MS);
    }
    onClose();
  }

  const url =
    showing && typeof window !== 'undefined' ? `${window.location.origin}${PHOTO_HANDOFF_PATH}#${showing.code}` : '';
  const arrivedText =
    arrived === 0 ? null : arrived === 1 ? 'Photo 1 arrived.' : `${arrived} photos arrived.`;

  return (
    <div
      className="viewer-photo-handoff"
      role="group"
      aria-label="Use my phone"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          close();
        }
      }}
    >
      {state.kind === 'starting' ? <p className="viewer-photo-response__note">Making a code…</p> : null}

      {state.kind === 'refused' ? (
        <p className="viewer-photo-response__error" role="alert">{handoffRefusalText(state.code)}</p>
      ) : null}

      {showing && !expired && !full ? (
        <>
          <p className="viewer-photo-handoff__intro">{HANDOFF_INTRO}</p>
          <QrCode text={url} />
          <p className="viewer-photo-response__note">Works for {remaining(showing.expiresAt, now)} more.</p>
        </>
      ) : null}

      {expired ? (
        <p className="viewer-photo-response__note">
          {HANDOFF_EXPIRED_TEXT}{' '}
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>Show a new code</button>
        </p>
      ) : null}
      {full ? (
        <p className="viewer-photo-response__note">All your photos have arrived.</p>
      ) : null}

      <p className="viewer-photo-handoff__arrived" aria-live="polite">{arrivedText}</p>

      <button type="button" className="viewer-photo-response__add" onClick={close}>
        Done with my phone
      </button>
    </div>
  );
}
