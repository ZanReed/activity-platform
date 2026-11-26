// The one piece of the clip's calls the shell pays for (D64): the app hands over
// its client and the check function's URL. The clip's chunk does the rest.
import type { TypedRpc } from '@activity/db-types/rpc';

export interface VideoClient {
  /** Typed by the generated schema (review C1 slice 5): the name must be a
   *  live function and the arguments its parameters. Types only. */
  rpc: TypedRpc['rpc'];
  auth: {
    getSession(): Promise<{ data: { session: { access_token: string } | null } }>;
  };
}

export interface VideoLink {
  client: VideoClient;
  checkUrl: () => string;
}

export let videoLink: VideoLink | null = null;

export function setVideoLink(link: VideoLink | null): void {
  videoLink = link;
}
