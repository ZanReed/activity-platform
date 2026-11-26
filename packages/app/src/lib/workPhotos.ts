// =============================================================================
// lib/workPhotos.ts — the teacher's view of students' photos of working
// (media submissions slice 3; docs/design/media-submissions.md §6.3, §7)
// -----------------------------------------------------------------------------
// Two reads, both behind the gates the server already holds:
//
//   signWorkPhotos — ONE `POST /object/sign` for every photo on the queue page,
//     10-minute URLs (§6.3). Storage's SELECT policy decides: the activity's
//     editor may read a photo only once a check handed it in, and only while
//     its bytes are the ones the check recorded (0094, the G18 rule). A photo
//     that fails either test comes back null.
//   fetchPhotoStates — work_photo_states (0096): WHY a null came back, so the
//     queue says "removed" or "changed after it was handed in" instead of
//     showing a blank. One call for the page.
//
// Raw fetch, as lib/uploadImage.ts: storage-js is stubbed out of the app
// (CLAUDE.md). Both headers, for the same reason as there.
// =============================================================================

import { supabase, storageBase, supabaseAnonKey } from './supabase';
import { rpc } from './db';

export const WORK_PHOTO_BUCKET = 'student-work';
const SIGN_SECONDS = 600;

export type PhotoState = 'ok' | 'changed' | 'removed';

/** One photo the queue wants to show: whose, which activity, which id. */
export interface PhotoKey {
  activityId: string;
  studentId: string;
  photoId: string;
}

/** The Storage key (0093's generated object_name). */
export function workPhotoObjectName(k: PhotoKey): string {
  return `${k.activityId}/${k.studentId}/${k.photoId}.jpg`;
}

/** Photo id → a 10-minute URL, or null when the teacher may not read it. */
export async function signWorkPhotos(keys: readonly PhotoKey[]): Promise<Record<string, string | null>> {
  const out: Record<string, string | null> = {};
  if (keys.length === 0) return out;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sign in again to see photos.');
  const base = storageBase();
  const names = keys.map(workPhotoObjectName);
  const res = await fetch(`${base}/object/sign/${WORK_PHOTO_BUCKET}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, apikey: supabaseAnonKey(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: SIGN_SECONDS, paths: names }),
  });
  if (!res.ok) throw new Error(`Photos could not be loaded (HTTP ${res.status}).`);
  const rows = (await res.json()) as Array<{ path?: string; signedURL?: string | null; error?: string | null }>;
  const byName = new Map(rows.map((r) => [r.path, r]));
  keys.forEach((k, i) => {
    const row = byName.get(names[i]) ?? rows[i];
    out[k.photoId] = row?.signedURL && !row.error ? `${base}${row.signedURL}` : null;
  });
  return out;
}

/** Ids per work_photo_states call. The RPC returns one row per id it is
 *  given, and PostgREST cuts a row set at max_rows (1,000) with no error, so a
 *  queue with more photos than that lost the rest's states (review A5). Must
 *  stay at or under max_rows. */
export const PHOTO_STATES_CHUNK = 500;

/** Photo id → why it can or cannot be shown, for one activity. */
export async function fetchPhotoStates(activityId: string, photoIds: readonly string[]): Promise<Record<string, PhotoState>> {
  const out: Record<string, PhotoState> = {};
  for (let i = 0; i < photoIds.length; i += PHOTO_STATES_CHUNK) {
    const { data, error } = await rpc('work_photo_states', {
      p_activity_id: activityId,
      p_photo_ids: photoIds.slice(i, i + PHOTO_STATES_CHUNK),
    });
    if (error) throw new Error(error.message);
    for (const row of (data ?? []) as Array<{ photo_id: string; state: string }>) {
      if (row.state === 'ok' || row.state === 'changed' || row.state === 'removed') out[row.photo_id] = row.state;
    }
  }
  return out;
}
