// The one piece of the clip's read the shell pays for (D64 VP-7): the app hands
// over a way to call the server's gate. videoSource.ts, in the clip's chunk, uses it.
export type VideoSourceRpc = (
  name: string,
  args: Record<string, string>,
) => PromiseLike<{ data: unknown; error: unknown }>;

export let videoSourceRpc: VideoSourceRpc | null = null;

export function setVideoSourceRpc(rpc: VideoSourceRpc | null): void {
  videoSourceRpc = rpc;
}
