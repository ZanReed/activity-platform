// The one piece of the clip's calls the shell pays for (D64): the app hands over
// its client and the check function's URL. The clip's chunk does the rest.
export interface VideoClient {
  rpc(name: string, args: Record<string, string>): PromiseLike<{ data: unknown; error: unknown }>;
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
