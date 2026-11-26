// The one piece of the photo block's calls the shell pays for (the D64 video
// seam's pattern): the app hands over its client and where Storage lives. The
// photo block's lazy chunk (photoUpload.ts) does the rest. A surface with no
// seam set — the teacher's draft preview, a fixture page — gets a block that
// shows what a student would see and makes no request at all.
import type { TypedRpc } from '@activity/db-types/rpc';

export interface PhotoClient {
  /** Typed by the generated schema (review C1 slice 5): the name must be a
   *  live function and the arguments its parameters. Types only. */
  rpc: TypedRpc['rpc'];
  auth: {
    getSession(): Promise<{
      data: { session: { access_token: string; user: { id: string } } | null };
    }>;
  };
}

export interface PhotoLink {
  client: PhotoClient;
  /** `${SUPABASE_URL}/storage/v1` */
  storageBase: () => string;
  /** The anon key: the API gateway wants `apikey` on a hand-built request. */
  anonKey: () => string;
}

export let photoLink: PhotoLink | null = null;

export function setPhotoLink(link: PhotoLink | null): void {
  photoLink = link;
}

// ---- The route's hold on the lazy uploader (slice 2b, Fable review) ---------
// The uploader lives in the photo chunk, but its LIFETIME belongs to the route
// that owns the store: a route that unmounts must stop it, or it keeps
// uploading into a store nobody saves, and deletes the device copies as it
// goes. And only the tab holding the activity's tab lock may upload: two tabs
// on one activity would otherwise both upload the same waiting photo.

const stops = new WeakMap<object, () => void>();

/** The uploader registers its stop for its store (photoUploader.ts). */
export function onStopPhotoUploads(store: object, stop: () => void): void {
  stops.set(store, stop);
}

/** The route's cleanup: stop this store's uploader, if one started. */
export function stopPhotoUploads(store: object): void {
  stops.get(store)?.();
  stops.delete(store);
}

let uploadGate: (() => boolean) | null = null;

/** The route sets this to its tab lock (`() => lock.isHeld()`); null = allowed. */
export function setPhotoUploadGate(gate: (() => boolean) | null): void {
  uploadGate = gate;
}

export function photoUploadAllowed(): boolean {
  return uploadGate ? uploadGate() : true;
}

/** Where the phone handoff's page lives in the app (slice 2c, §4.1): the QR
 *  panel builds `{origin}${PHOTO_HANDOFF_PATH}#<code>` and the app routes it.
 *  Here, in the shell seam, so the app's router can name it without pulling
 *  the panel's QR encoder into the shell. */
export const PHOTO_HANDOFF_PATH = '/h';
