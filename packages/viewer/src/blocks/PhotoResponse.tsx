// =============================================================================
// blocks/PhotoResponse.tsx — a photo of the student's handwritten working
// (media submissions slice 2; docs/design/media-submissions.md §3, §4, §6)
// -----------------------------------------------------------------------------
// The recorded family, so ShortAnswer's contract holds word for word: never a
// verdict, only "Recorded — your teacher will review", and released teacher
// feedback when there is some.
//
// What a student does: "Add a photo" opens the native file input
// (accept="image/*" capture="environment"): the rear camera on a tablet or a
// phone, the file picker on a Chromebook (MS-3). The picked file is re-encoded
// on the device (photoUpload.ts — the EXIF strip), reserved, uploaded with a
// progress bar, and its id joins the block's answer. Check hands the ids in.
//
// The states each photo shows (slice 2b): waiting (offline: saved on this
// device), uploading (progress), attached (a thumbnail with Remove), failed
// (the reason, and Retry), lost (the device copy is gone: add it again). A
// photo is in the answer from the moment it is taken, as a `local` ref; the
// page's uploader (photoUploader.ts) moves it to Storage, and a Check waits
// for it (store.checkSection queues the section until it lands).
//
// No seam (the teacher's draft preview): the controls render disabled with a
// line saying what students will see, and no request is made (§9).
// Switch off (photo_clearance): "Your teacher hasn't turned photo answers on
// yet." The rest of the section still checks (§6.6).
// Locked or frozen: the section's <fieldset disabled> disables Add, Remove and
// Retry with no code here.
// =============================================================================

import { Suspense, lazy, useEffect, useId, useMemo, useRef, useState } from 'react';
import './PhotoResponse.css';
import type { PhotoResponseBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import {
  useBlockFeedback,
  useBlockPhase,
  useBlockSolution,
  useItemResult,
  useResponse,
  useServedVersionId,
  useViewer,
} from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';
import { ReleasedFeedbackCard } from './ReleasedFeedbackCard.js';
import { FreeResponseAnswerKey } from './FreeResponseAnswerKey.js';
import { OPTIONAL_LABEL, REVIEWED_LABEL, feedbackCoversAnswer } from './ShortAnswer.js';
import { photoLink } from './photoLinkSeam.js';
import {
  PhotoError,
  discardPhoto,
  photoErrorText,
  photosEnabled,
  reencodePhoto,
  signPhotos,
} from './photoUpload.js';
import { deletePhoto, getPhoto, putPhoto, trackPut } from './photoStore.js';
import { startUploader } from './photoUploader.js';

// Its own chunk (slice 2c): the QR encoder loads only when a student asks.
const PhotoHandoffPanel = lazy(() => import('./PhotoHandoffPanel.js'));

/** Copy shared with the a11y story and the tests. */
export const ADD_PHOTO_LABEL = 'Add a photo';
export const USE_PHONE_LABEL = 'Use my phone';
export const PHOTOS_OFF_TEXT = 'Your teacher hasn’t turned photo answers on yet.';
export const PREVIEW_TEXT = 'Students add a photo of their working here.';
export const REMOVED_TEXT = 'This photo has been removed.';
export const WAITING_TEXT = 'Saved on this device. It will upload when you’re back online.';
export const LOST_TEXT = 'This photo didn’t stay on this device. Remove it and add it again.';
export const NOT_HANDED_IN_TEXT =
  'A photo here was no longer stored, so it wasn’t handed in. Add it again, then check again.';

/** A photo that never re-encoded: shown once with its reason, never stored. */
interface PickError {
  key: string;
  code: PhotoError['code'];
}

export default function PhotoResponse({ block, mode = 'screen' }: BlockComponentProps<PhotoResponseBlock>) {
  const { store, isOptionalMarking } = useViewer();
  const promptId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const refs = useResponse('photos', block.id) ?? [];
  const servedVersionId = useServedVersionId();
  const phase = useBlockPhase(block.id);
  const result = useItemResult(block.id);
  const feedback = useBlockFeedback(block.id);
  const solution = useBlockSolution(block.id);

  const max = block.maxPhotos ?? 1;
  const live = photoLink !== null && mode !== 'print';
  const [enabled, setEnabled] = useState<boolean | null>(live ? null : false);
  const [pickErrors, setPickErrors] = useState<PickError[]>([]);
  const [urls, setUrls] = useState<Record<string, string | null>>({});
  const [notHandedIn, setNotHandedIn] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);

  // The page's one uploader (slice 2b), started by the first photo block. It
  // owns every waiting photo; this block only reads each one's state.
  const uploader = useMemo(() => (live ? startUploader(store) : null), [live, store]);
  const [, bump] = useState(0);
  useEffect(() => uploader?.subscribe(() => bump((n) => n + 1)), [uploader]);

  // The switch, read once per mount (a display read; the server enforces it).
  useEffect(() => {
    if (!live) return;
    let alive = true;
    void photosEnabled().then((on) => alive && setEnabled(on));
    return () => {
      alive = false;
    };
  }, [live]);

  // Thumbnails. A server photo gets a signed URL; a waiting one is shown from
  // its device copy (an object URL, released on unmount).
  const objectUrls = useRef(new Map<string, string>());
  const idsKey = refs.map((r) => `${r.id}${r.local ? '*' : ''}`).join(',');
  useEffect(() => {
    if (!live) return;
    let alive = true;
    const { activityId, userId } = store.getState();
    // A photo that just uploaded keeps the device preview it was showing (same
    // `key`): no re-download, and no flash of "loading" at the swap.
    const carried: Record<string, string> = {};
    for (const r of refs) {
      const preview = r.key ? urls[r.key] : undefined;
      if (!r.local && r.key && r.key !== r.id && !(r.id in urls) && preview) carried[r.id] = preview;
    }
    if (Object.keys(carried).length > 0) setUrls((u) => ({ ...u, ...carried }));
    const missingServer = refs.filter((r) => !r.local && !(r.id in urls) && !(r.id in carried)).map((r) => r.id);
    if (missingServer.length > 0) {
      signPhotos(activityId, missingServer)
        .then((signed) => alive && setUrls((u) => ({ ...u, ...signed })))
        .catch(() => undefined);
    }
    for (const r of refs) {
      if (!r.local || r.id in urls) continue;
      void getPhoto(r.id, userId).then((photo) => {
        if (!alive || !photo) return;
        const url = URL.createObjectURL(photo.jpeg);
        objectUrls.current.set(r.id, url);
        setUrls((u) => ({ ...u, [r.id]: url }));
      });
    }
    return () => {
      alive = false;
    };
    // `urls` is read, not watched: re-signing on every URL change would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, live, store]);
  useEffect(() => {
    const made = objectUrls.current;
    return () => made.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  // A check that could not hand a photo in (retention had removed it, 0094)
  // says so, and the photo leaves the answer so the next check doesn't name
  // it again (slice 2b, clearance blocker 2).
  const removedKey = (result?.removedPhotos ?? []).join(',');
  useEffect(() => {
    const gone = new Set(result?.removedPhotos ?? []);
    if (gone.size === 0) return;
    setNotHandedIn(true);
    const current = store.getState().responses.photos?.[block.id] ?? [];
    if (current.some((r) => gone.has(r.id))) store.setPhotos(block.id, current.filter((r) => !gone.has(r.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [removedKey]);

  const room = max - refs.length;

  async function onPick(files: FileList | null) {
    const picked = Array.from(files ?? []).slice(0, Math.max(0, room));
    if (inputRef.current) inputRef.current.value = '';
    setNotHandedIn(false);
    const { userId, activityId, versionId } = store.getState();
    // Named in the answer AT ONCE, before the seconds a 12 MP re-encode takes
    // on a Chromebook (Fable review): a Check pressed meanwhile must wait for
    // this photo, not go without it. The write is tracked, so the uploader
    // waits for it too rather than calling the photo lost.
    // The writes are started and TRACKED before the refs are named: naming
    // them wakes the uploader synchronously, and it must find a write to wait
    // for, not an absent photo.
    const writes = picked.map((file) => {
      const localId = crypto.randomUUID();
      const write = (async () => {
        const jpeg = await reencodePhoto(file);
        await putPhoto({ localId, uid: userId, activityId, versionId, blockId: block.id, jpeg, createdAt: Date.now() });
      })();
      trackPut(localId, write);
      return { localId, write };
    });
    const current = store.getState().responses.photos?.[block.id] ?? [];
    store.setPhotos(block.id, [...current, ...writes.map(({ localId: id }) => ({ id, local: true, key: id }))]);
    for (const { localId, write } of writes) {
      try {
        await write;
      } catch (err) {
        // It never became a photo: out of the answer, with the reason.
        const code = err instanceof PhotoError ? err.code : 'not_an_image';
        setPickErrors((list) => [...list, { key: localId, code }]);
        const now = store.getState().responses.photos?.[block.id] ?? [];
        store.setPhotos(block.id, now.filter((r) => r.id !== localId));
      }
    }
  }

  function remove(id: string, local: boolean | undefined) {
    store.setPhotos(block.id, refs.filter((r) => r.id !== id));
    // A waiting photo leaves the device; a server one is discarded there.
    // Only a photo no check has handed in is deleted; a handed-in one stays
    // with the check it belongs to (0094's discard refuses it).
    if (local) void deletePhoto(id);
    else void discardPhoto(id);
  }

  const off = enabled === false && live;
  const addDisabled = !live || off || room <= 0 || enabled === null;

  return (
    <div
      className="viewer-photo-response"
      data-block-type="photo_response"
      data-block-id={block.id}
      data-phase={phase}
    >
      <div className="viewer-photo-response__prompt" id={promptId}>
        <InlineContent nodes={block.prompt} />
      </div>

      {/* On paper the paper is the work (§8): the box, and nothing to press.
          Always in the DOM and shown only by the print rules, like every
          writing box, so a browser print of the screen page gets it too. */}
      <div className="viewer-photo-response__box" aria-hidden="true" />

      {mode === 'print' ? null : (
        <div className="viewer-photo-response__controls">
          {refs.length > 0 ? (
            <ul className="viewer-photo-response__list" aria-labelledby={promptId}>
              {refs.map((ref, i) => {
                const url = urls[ref.id];
                const waiting = ref.local ? (uploader?.status(ref.id) ?? { state: 'uploading', progress: 0 }) : null;
                return (
                  <li
                    key={ref.key ?? ref.id}
                    className="viewer-photo-response__item"
                    data-photo-state={waiting ? waiting.state : 'attached'}
                  >
                    {url ? (
                      <img className="viewer-photo-response__thumb" src={url} alt={`Photo ${i + 1} of your working`} />
                    ) : url === null || ref.removed ? (
                      <p className="viewer-photo-response__removed">{REMOVED_TEXT}</p>
                    ) : (
                      <div className="viewer-photo-response__thumb viewer-photo-response__thumb--loading" aria-label="Loading photo" />
                    )}
                    {waiting?.state === 'uploading' ? (
                      <progress
                        className="viewer-photo-response__progress"
                        max={1}
                        value={waiting.progress}
                        aria-label="Uploading photo"
                      />
                    ) : null}
                    {waiting?.state === 'waiting' ? (
                      <p className="viewer-photo-response__note">{WAITING_TEXT}</p>
                    ) : null}
                    {waiting?.state === 'lost' ? (
                      <p className="viewer-photo-response__error" role="alert">{LOST_TEXT}</p>
                    ) : null}
                    {waiting?.state === 'failed' ? (
                      <>
                        <p className="viewer-photo-response__error" role="alert">
                          {photoErrorText(waiting.code)}
                        </p>
                        {waiting.code !== 'photos_off' ? (
                          <button type="button" onClick={() => uploader?.retry(ref.id)}>
                            Retry
                          </button>
                        ) : null}
                      </>
                    ) : null}
                    <button
                      type="button"
                      className="viewer-photo-response__remove"
                      aria-label={`Remove photo ${i + 1}`}
                      onClick={() => remove(ref.id, ref.local)}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {pickErrors.map((e) => (
            <p key={e.key} className="viewer-photo-response__error" role="alert">
              {photoErrorText(e.code)}{' '}
              <button type="button" onClick={() => setPickErrors((list) => list.filter((x) => x.key !== e.key))}>
                Dismiss
              </button>
            </p>
          ))}

          {notHandedIn ? <p className="viewer-photo-response__error" role="alert">{NOT_HANDED_IN_TEXT}</p> : null}

          {off ? <p className="viewer-photo-response__note">{PHOTOS_OFF_TEXT}</p> : null}
          {!live ? <p className="viewer-photo-response__note">{PREVIEW_TEXT}</p> : null}

          {room > 0 || !live ? (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="viewer-visually-hidden"
                tabIndex={-1}
                aria-hidden="true"
                disabled={addDisabled}
                onChange={(e) => void onPick(e.target.files)}
                {...(max > 1 ? { multiple: true } : {})}
              />
              <button
                type="button"
                className="viewer-photo-response__add"
                aria-describedby={promptId}
                disabled={addDisabled}
                onClick={() => inputRef.current?.click()}
              >
                {ADD_PHOTO_LABEL}
              </button>
              {/* The phone handoff (§4.1): for a Chromebook, whose file input
                  opens a file picker, not a camera. Offered wherever Add is,
                  online only; the server refuses it in a quiz or an exam. */}
              {live && !phoneOpen ? (
                <button
                  type="button"
                  className="viewer-photo-response__add"
                  aria-describedby={promptId}
                  disabled={addDisabled || (typeof navigator !== 'undefined' && navigator.onLine === false)}
                  onClick={() => setPhoneOpen(true)}
                >
                  {USE_PHONE_LABEL}
                </button>
              ) : null}
              {max > 1 ? (
                <span className="viewer-photo-response__count">
                  {refs.length} of {max}
                </span>
              ) : null}
            </>
          ) : null}

          {live && phoneOpen ? (
            <Suspense fallback={<p className="viewer-photo-response__note">Making a code…</p>}>
              <PhotoHandoffPanel store={store} blockId={block.id} maxPhotos={max} onClose={() => setPhoneOpen(false)} />
            </Suspense>
          ) : null}
        </div>
      )}

      {phase === 'checking' ? <StatePill state="pending" label="Saving…" /> : null}

      {/* The recorded family's one terminal state (ShortAnswer's contract). */}
      {result ? (
        <StatePill
          state="recorded"
          label={
            feedbackCoversAnswer(feedback, servedVersionId)
              ? REVIEWED_LABEL
              : isOptionalMarking(block.id)
                ? OPTIONAL_LABEL
                : undefined
          }
        />
      ) : null}

      {feedback ? (
        <ReleasedFeedbackCard feedback={feedback} fromAnotherVersion={feedback.activityVersionId !== servedVersionId} />
      ) : null}

      {solution ? (
        <details className="viewer-solution">
          <summary>Show solution</summary>
          <div className="viewer-solution__body">
            <InlineContent nodes={solution} />
          </div>
        </details>
      ) : null}

      <FreeResponseAnswerKey blockId={block.id} />
    </div>
  );
}
