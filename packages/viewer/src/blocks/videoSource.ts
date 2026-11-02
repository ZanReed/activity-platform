// The clip block's read of the server's gate (D64 VP-7). The served document has
// no URL. The RPC's name lives here, and verify-0078 proves what it returns. A
// surface with no seam set, and any failure, reads as no, so nothing shows.
import { videoSourceRpc } from './videoSourceSeam.js';

export interface VideoSource {
  url: string;
  captions: string | null;
}

export async function readVideoSource(
  activityId: string,
  versionId: string,
  blockId: string,
): Promise<VideoSource | null> {
  if (!videoSourceRpc) return null;
  try {
    const { data, error } = await videoSourceRpc('video_source', {
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
