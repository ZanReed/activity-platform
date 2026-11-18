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
// The states each photo shows: uploading (progress), attached (a thumbnail
// with Remove), failed (Retry, with the reason). Offline photos are slice 2b;
// until then a photo taken offline fails with the offline copy and keeps its
// Retry.
//
// No seam (the teacher's draft preview): the controls render disabled with a
// line saying what students will see, and no request is made (§9).
// Switch off (photo_clearance): "Your teacher hasn't turned photo answers on
// yet." The rest of the section still checks (§6.6).
// Locked or frozen: the section's <fieldset disabled> disables Add, Remove and
// Retry with no code here.
// =============================================================================

import { useEffect, useId, useRef, useState } from 'react';
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
  addPhoto,
  discardPhoto,
  photoErrorText,
  photosEnabled,
  reencodePhoto,
  signPhotos,
} from './photoUpload.js';

/** Copy shared with the a11y story and the tests. */
export const ADD_PHOTO_LABEL = 'Add a photo';
export const PHOTOS_OFF_TEXT = 'Your teacher hasn’t turned photo answers on yet.';
export const PREVIEW_TEXT = 'Students add a photo of their working here.';
export const REMOVED_TEXT = 'This photo has been removed.';

interface Pending {
  key: string;
  file: Blob;
  previewUrl: string;
  progress: number;
  error: PhotoError['code'] | null;
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
  const [pending, setPending] = useState<Pending[]>([]);
  const [urls, setUrls] = useState<Record<string, string | null>>({});

  // The switch, read once per mount (a display read; the server enforces it).
  useEffect(() => {
    if (!live) return;
    let alive = true;
    void photosEnabled().then((on) => alive && setEnabled(on));
    return () => {
      alive = false;
    };
  }, [live]);

  // Thumbnails for every id in the answer that has no URL yet — the ones added
  // on another device, restored from the server, or just uploaded.
  const idsKey = refs.map((r) => r.id).join(',');
  useEffect(() => {
    if (!live) return;
    const missing = refs.map((r) => r.id).filter((id) => !(id in urls));
    if (missing.length === 0) return;
    let alive = true;
    const { activityId } = store.getState();
    signPhotos(activityId, missing)
      .then((signed) => alive && setUrls((u) => ({ ...u, ...signed })))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
    // `urls` is read, not watched: re-signing on every URL change would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, live, store]);

  // Object URLs for local previews are released on unmount. Read through a ref:
  // a cleanup closing over `pending` would see only the first render's list.
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  useEffect(
    () => () => pendingRef.current.forEach((p) => p.previewUrl && URL.revokeObjectURL(p.previewUrl)),
    [],
  );

  const room = max - refs.length - pending.length;

  async function send(item: Pending) {
    const { activityId, versionId } = store.getState();
    try {
      const id = await addPhoto({ activityId, versionId, blockId: block.id }, item.file, (progress) =>
        setPending((list) => list.map((p) => (p.key === item.key ? { ...p, progress } : p))),
      );
      // The local preview becomes the thumbnail until a signed URL replaces it.
      setUrls((u) => ({ ...u, [id]: item.previewUrl }));
      setPending((list) => list.filter((p) => p.key !== item.key));
      const current = store.getState().responses.photos?.[block.id] ?? [];
      store.setPhotos(block.id, [...current, { id }]);
    } catch (err) {
      const code = err instanceof PhotoError ? err.code : 'upload_failed';
      if (code === 'photos_off') setEnabled(false);
      setPending((list) => list.map((p) => (p.key === item.key ? { ...p, error: code, progress: 0 } : p)));
    }
  }

  async function onPick(files: FileList | null) {
    const picked = Array.from(files ?? []).slice(0, Math.max(0, room));
    if (inputRef.current) inputRef.current.value = '';
    for (const file of picked) {
      const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      let jpeg: Blob;
      try {
        jpeg = await reencodePhoto(file);
      } catch (err) {
        const code = err instanceof PhotoError ? err.code : 'not_an_image';
        setPending((list) => [...list, { key, file, previewUrl: '', progress: 0, error: code }]);
        continue;
      }
      const item: Pending = { key, file: jpeg, previewUrl: URL.createObjectURL(jpeg), progress: 0, error: null };
      setPending((list) => [...list, item]);
      void send(item);
    }
  }

  function retry(item: Pending) {
    if (!item.previewUrl) {
      // It never re-encoded: nothing to resend. Drop it so the student picks again.
      setPending((list) => list.filter((p) => p.key !== item.key));
      return;
    }
    const again = { ...item, error: null, progress: 0 };
    setPending((list) => list.map((p) => (p.key === item.key ? again : p)));
    void send(again);
  }

  function dropPending(item: Pending) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    setPending((list) => list.filter((p) => p.key !== item.key));
  }

  function remove(id: string) {
    store.setPhotos(block.id, refs.filter((r) => r.id !== id));
    // Only a photo no check has handed in is deleted; a handed-in one stays
    // with the check it belongs to (0094's discard refuses it).
    void discardPhoto(id);
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
          {refs.length + pending.length > 0 ? (
            <ul className="viewer-photo-response__list" aria-labelledby={promptId}>
              {refs.map((ref, i) => {
                const url = urls[ref.id];
                return (
                  <li key={ref.id} className="viewer-photo-response__item" data-photo-state="attached">
                    {url ? (
                      <img className="viewer-photo-response__thumb" src={url} alt={`Photo ${i + 1} of your working`} />
                    ) : url === null || ref.removed ? (
                      <p className="viewer-photo-response__removed">{REMOVED_TEXT}</p>
                    ) : (
                      <div className="viewer-photo-response__thumb viewer-photo-response__thumb--loading" aria-label="Loading photo" />
                    )}
                    <button
                      type="button"
                      className="viewer-photo-response__remove"
                      aria-label={`Remove photo ${i + 1}`}
                      onClick={() => remove(ref.id)}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
              {pending.map((item) => (
                <li
                  key={item.key}
                  className="viewer-photo-response__item"
                  data-photo-state={item.error ? 'failed' : 'uploading'}
                >
                  {item.previewUrl ? (
                    <img className="viewer-photo-response__thumb" src={item.previewUrl} alt="Photo being added" />
                  ) : null}
                  {item.error ? (
                    <>
                      <p className="viewer-photo-response__error" role="alert">
                        {photoErrorText(item.error)}
                      </p>
                      {item.error !== 'photos_off' ? (
                        <button type="button" onClick={() => retry(item)}>
                          {item.previewUrl ? 'Retry' : 'Dismiss'}
                        </button>
                      ) : null}
                      {item.previewUrl ? (
                        <button type="button" onClick={() => dropPending(item)}>
                          Remove
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <progress
                      className="viewer-photo-response__progress"
                      max={1}
                      value={item.progress}
                      aria-label="Uploading photo"
                    />
                  )}
                </li>
              ))}
            </ul>
          ) : null}

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
              {max > 1 ? (
                <span className="viewer-photo-response__count">
                  {refs.length} of {max}
                </span>
              ) : null}
            </>
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
