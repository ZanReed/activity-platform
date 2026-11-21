import { z } from 'zod';

// =============================================================================
// VideoBlock — a catch-up clip with pause points (D64, D73)
// -----------------------------------------------------------------------------
// docs/design/video-pause-points.md. The clip stops at each pause until the
// student answers the next faded block after this one, in order (VP-1), so a
// pause names a time and no item.
//
// `url`, `captions` and `recordedAgainst` are optional because the served copy
// has none of them: sanitize removes all three for everyone (VP-7), and a
// separate server read hands the URL to whoever may have it. A stored document
// always has a `url`; serialize drops a node without one.
//
// `stale` is computed on save (video-beat.ts), never authored. It defaults to
// true so a block that somehow lacks it fails closed.
// =============================================================================

export const VideoPause = z.object({
  // Seconds from the start of the clip.
  at: z.number().nonnegative(),
  // Where "Rewind" goes. Absent = the previous pause, or the start.
  rewindTo: z.number().nonnegative().optional(),
});
export type VideoPause = z.infer<typeof VideoPause>;

export const VideoBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('video'),
  title: z.string().min(1),
  url: z.string().optional(),
  captions: z.string().optional(),
  // The beat hash the clip was recorded against (VP-5). Absent counts as stale.
  recordedAgainst: z.string().optional(),
  pauses: z.array(VideoPause).min(1),
  stale: z.boolean().default(true),
  // How students first see it (author ruling 2026-11-21). 'open': a full-width
  // frame with the title and a play button. 'collapsed' (and absent, so every
  // catalogue clip): the "Missed this lesson?" card. Either way nothing is
  // fetched from the host until the student presses play (VP-6). Set only from
  // the editor's form; the ```video fence has no key for it.
  display: z.enum(['open', 'collapsed']).optional(),
});
export type VideoBlock = z.infer<typeof VideoBlock>;
