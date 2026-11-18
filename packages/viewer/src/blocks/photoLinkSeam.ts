// The one piece of the photo block's calls the shell pays for (the D64 video
// seam's pattern): the app hands over its client and where Storage lives. The
// photo block's lazy chunk (photoUpload.ts) does the rest. A surface with no
// seam set — the teacher's draft preview, a fixture page — gets a block that
// shows what a student would see and makes no request at all.
export interface PhotoClient {
  rpc(name: string, args: Record<string, string>): PromiseLike<{ data: unknown; error: unknown }>;
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
