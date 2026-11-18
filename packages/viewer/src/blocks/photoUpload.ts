// =============================================================================
// blocks/photoUpload.ts — the photo block's capture-to-Storage path (media
// submissions slice 2; docs/design/media-submissions.md §5, §6.2, §6.3)
// -----------------------------------------------------------------------------
// Lazy: only PhotoResponse imports it. Four steps, in this order, and the order
// is the design (§6.2 "the row comes first and the upload second"):
//
//   1. reencodePhoto — decode (orientation applied), cap the long edge at
//      2000 px, encode JPEG 0.8 on a canvas. The canvas is the PRIVACY step:
//      it writes pixels only, so GPS position, device identity and every other
//      EXIF field are gone before a byte leaves the device (e2e: photo-exif).
//   2. reserve_work_photo — the server's gate (0093): photos on, a student in
//      a class the activity is assigned to, a photo block of this version,
//      under the cap. It returns the photo's id.
//   3. upload — a raw POST to Storage (storage-js is stubbed out of the app,
//      CLAUDE.md), under 0093's INSERT policy, which admits only an open
//      reservation. XHR rather than fetch, for upload progress.
//   4. the id goes into the store; the CHECK hands it in (0094's trigger).
//
// Reading is a short-lived signed URL (10 minutes, §6.3), one call for all of
// a block's photos. Remove before a check calls discard_work_photo, which
// deletes the student's own unattached row; the sweep removes the bytes.
// =============================================================================

import { photoLink } from './photoLinkSeam.js';

export const PHOTO_BUCKET = 'student-work';
/** The input a student may pick (MS-5). Bigger is refused before decoding. */
export const MAX_INPUT_BYTES = 25 * 1024 * 1024;
/** 0093's bucket file_size_limit. */
export const MAX_UPLOAD_BYTES = 1_572_864;
export const LONG_EDGE_PX = 2000;
export const JPEG_QUALITY = 0.8;
const SIGN_SECONDS = 600;

export class PhotoError extends Error {
  constructor(
    /** A contract string the block maps to copy. */
    readonly code:
      | 'too_big'
      | 'not_an_image'
      | 'photos_off'
      | 'not_in_class'
      | 'photo_cap'
      | 'not_available'
      | 'signed_out'
      | 'upload_failed'
      | 'offline',
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'PhotoError';
  }
}

/** Copy for each failure. Plain and non-blaming; every one says what to do. */
export function photoErrorText(code: PhotoError['code']): string {
  switch (code) {
    case 'too_big':
      return 'That file is too big. Take the photo again, or pick a smaller one.';
    case 'not_an_image':
      return 'That isn’t a photo this page can read. Try a JPEG or PNG.';
    case 'photos_off':
      return 'Your teacher hasn’t turned photo answers on yet.';
    case 'not_in_class':
      return 'You can add a photo once you’re in a class that has this activity.';
    case 'photo_cap':
      return 'You’ve added a lot of photos here. Remove one, or try again tomorrow.';
    case 'not_available':
      return 'This question doesn’t take photos any more. Reload the page.';
    case 'signed_out':
      return 'You’ve been signed out. Sign in again, then add the photo.';
    case 'offline':
      return 'You’re offline. Add the photo again when you’re back online.';
    default:
      return 'The photo didn’t upload. Try again.';
  }
}

// ---- 1. Re-encode -----------------------------------------------------------

async function decode(file: Blob): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      // 'from-image' applies the EXIF orientation (the default in current
      // browsers, stated so an older one does not hand back a sideways page).
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      // Fall through: some browsers refuse the options bag or the format.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => undefined };
  } catch {
    throw new PhotoError('not_an_image');
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new PhotoError('not_an_image'))),
      'image/jpeg',
      quality,
    );
  });
}

/** A metadata-free JPEG of at most LONG_EDGE_PX on its long edge and at most
 *  MAX_UPLOAD_BYTES. Steps down quality, then size, if a busy page is still
 *  over the bucket limit. */
export async function reencodePhoto(file: Blob): Promise<Blob> {
  if (file.size > MAX_INPUT_BYTES) throw new PhotoError('too_big');
  if (file.type && !file.type.startsWith('image/')) throw new PhotoError('not_an_image');
  const image = await decode(file);
  try {
    if (!image.width || !image.height) throw new PhotoError('not_an_image');
    const attempts: Array<[number, number]> = [
      [LONG_EDGE_PX, JPEG_QUALITY],
      [LONG_EDGE_PX, 0.6],
      [1600, 0.6],
      [1200, 0.6],
    ];
    for (const [edge, quality] of attempts) {
      const scale = Math.min(1, edge / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new PhotoError('not_an_image');
      ctx.drawImage(image.source, 0, 0, canvas.width, canvas.height);
      const blob = await toJpeg(canvas, quality);
      if (blob.size <= MAX_UPLOAD_BYTES) return blob;
    }
    throw new PhotoError('too_big');
  } finally {
    image.close();
  }
}

// ---- 2–3. Reserve and upload -------------------------------------------------

async function session(): Promise<{ token: string; uid: string }> {
  if (!photoLink) throw new PhotoError('upload_failed');
  const { data } = await photoLink.client.auth.getSession();
  const s = data.session;
  if (!s) throw new PhotoError('signed_out');
  return { token: s.access_token, uid: s.user.id };
}

const RESERVE_REFUSALS = ['photos_off', 'not_in_class', 'photo_cap', 'not_available', 'not_a_student'] as const;

function reserveError(error: unknown): PhotoError {
  const message = String((error as { message?: unknown } | null)?.message ?? '');
  for (const code of RESERVE_REFUSALS) {
    if (message.includes(code)) {
      // A teacher's own account reads as "not in a class" — the same advice.
      return new PhotoError(code === 'not_a_student' ? 'not_in_class' : code);
    }
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return new PhotoError('offline');
  return new PhotoError('upload_failed', message);
}

export function objectName(activityId: string, uid: string, photoId: string): string {
  return `${activityId}/${uid}/${photoId}.jpg`;
}

/** Reserve, then upload. Resolves with the photo id once the bytes are in
 *  Storage; the caller puts the id in the store. */
export async function addPhoto(
  ids: { activityId: string; versionId: string; blockId: string },
  jpeg: Blob,
  onProgress: (fraction: number) => void,
): Promise<string> {
  if (!photoLink) throw new PhotoError('upload_failed');
  const { token, uid } = await session();
  const { data, error } = await photoLink.client.rpc('reserve_work_photo', {
    p_activity_id: ids.activityId,
    p_version_id: ids.versionId,
    p_block_id: ids.blockId,
  });
  if (error || typeof data !== 'string') throw reserveError(error);
  const photoId = data;
  try {
    await upload(`${photoLink.storageBase()}/object/${PHOTO_BUCKET}/${objectName(ids.activityId, uid, photoId)}`,
      token, photoLink.anonKey(), jpeg, onProgress);
  } catch (err) {
    // Give the reservation back (Fable review 2026-11-18): the per-block cap
    // counts unattached reservations, so three failed uploads on flaky school
    // Wi-Fi would otherwise lock the question for the 7 days they live.
    await discardPhoto(photoId);
    throw err;
  }
  return photoId;
}

function upload(url: string, token: string, apikey: string, body: Blob, onProgress: (f: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('apikey', apikey);
    xhr.setRequestHeader('Content-Type', 'image/jpeg');
    // Never overwrite: an upsert needs UPDATE, which no policy grants, and a
    // photo's bytes are fixed once a check has handed it in.
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(1);
        resolve();
      } else if (xhr.status === 401) {
        reject(new PhotoError('signed_out'));
      } else if (xhr.status === 413) {
        reject(new PhotoError('too_big'));
      } else {
        reject(new PhotoError('upload_failed', `HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () =>
      reject(new PhotoError(navigator.onLine === false ? 'offline' : 'upload_failed'));
    xhr.send(body);
  });
}

// ---- Read and remove ----------------------------------------------------------

/** Photo id → a 10-minute signed URL, or null for a photo that can't be read
 *  (retention removed it, or it never uploaded). One request for the lot. */
export async function signPhotos(activityId: string, photoIds: readonly string[]): Promise<Record<string, string | null>> {
  const out: Record<string, string | null> = {};
  if (!photoLink || photoIds.length === 0) return out;
  const { token, uid } = await session();
  const names = photoIds.map((id) => objectName(activityId, uid, id));
  const base = photoLink.storageBase();
  const res = await fetch(`${base}/object/sign/${PHOTO_BUCKET}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: photoLink.anonKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn: SIGN_SECONDS, paths: names }),
  });
  if (!res.ok) throw new PhotoError(res.status === 401 ? 'signed_out' : 'upload_failed');
  const rows = (await res.json()) as Array<{ path?: string; signedURL?: string | null; error?: string | null }>;
  const byName = new Map(rows.map((r) => [r.path, r]));
  photoIds.forEach((id, i) => {
    const row = byName.get(names[i]) ?? rows[i];
    out[id] = row?.signedURL && !row.error ? `${base}${row.signedURL}` : null;
  });
  return out;
}

/** Remove before a check. Best effort: a photo the server keeps (already
 *  handed in, or the call failed) still leaves the answer, and an unattached
 *  one the call missed is swept after 7 days. */
export async function discardPhoto(photoId: string): Promise<void> {
  if (!photoLink) return;
  try {
    await photoLink.client.rpc('discard_work_photo', { p_id: photoId });
  } catch {
    // The 7-day clock is the backstop.
  }
}

/** Whether photo answers are on (photo_answers_on, 0094). A failure reads as
 *  on: the reserve call is the real gate and names the refusal itself. */
export async function photosEnabled(): Promise<boolean> {
  if (!photoLink) return false;
  try {
    const { data, error } = await photoLink.client.rpc('photo_answers_on', {});
    return error ? true : data !== false;
  } catch {
    return true;
  }
}
