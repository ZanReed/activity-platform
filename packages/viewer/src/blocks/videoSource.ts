// The clip block's read of the server's gate (D64 VP-7). The served document has
// no URL. The RPC's name lives here, and verify-0078 proves what it returns. A
// surface with no seam set, and any failure, reads as no, so nothing shows.
import {
  CHECK_WIRE_VERSION,
  type SectionResponses,
  type VideoPauseRequest,
  type VideoPauseResult,
} from '../check/wire.js';
import type { SanitizedInlineNode } from '../sanitize/sanitized-types.js';
import { videoLink } from './videoSourceSeam.js';

export interface VideoSource {
  url: string;
  captions: string | null;
}

export async function readVideoSource(
  activityId: string,
  versionId: string,
  blockId: string,
): Promise<VideoSource | null> {
  if (!videoLink) return null;
  try {
    const { data, error } = await videoLink.client.rpc('video_source', {
      p_activity_id: activityId,
      p_version_id: versionId,
      p_block_id: blockId,
    });
    const row = error ? null : (data as VideoSource[] | null)?.[0];
    return row ? { url: row.url, captions: row.captions } : null;
  } catch {
    return null;
  }
}

export type PauseOutcome =
  | { state: 'right' | 'empty' | 'already_checked' | 'failed' }
  | { state: 'wrong'; feedback: SanitizedInlineNode[][] };

/** One try at a pause (VP-3). Any failure reads as failed, and the student can go on.
 * A plain fetch, like every other call to this function: `functions.invoke` with a
 * region adds an `x-region` header the function's CORS allow-list refuses. */
export async function checkPause(
  activityId: string,
  versionId: string,
  blockId: string,
  responses: SectionResponses,
): Promise<PauseOutcome> {
  if (!videoLink) return { state: 'failed' };
  try {
    const { data } = await videoLink.client.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return { state: 'failed' };
    const request: VideoPauseRequest = {
      wireVersion: CHECK_WIRE_VERSION,
      mode: 'video-pause',
      activityId,
      versionId,
      blockId,
      responses,
    };
    const response = await fetch(videoLink.checkUrl(), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) return { state: 'failed' };
    const result = (await response.json()) as VideoPauseResult;
    if (result.state === 'wrong') return { state: 'wrong', feedback: result.feedback ?? [] };
    // Anything this version doesn't know reads as failed, so it can't hold anyone.
    if (result.state === 'right' || result.state === 'empty' || result.state === 'already_checked') {
      return { state: result.state };
    }
    return { state: 'failed' };
  } catch {
    return { state: 'failed' };
  }
}
