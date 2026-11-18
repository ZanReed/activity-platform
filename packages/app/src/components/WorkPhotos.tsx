// =============================================================================
// WorkPhotos.tsx — students' photos of working in the Responses queue
// (media submissions slice 3; docs/design/media-submissions.md §7, §6.3)
// -----------------------------------------------------------------------------
//   WorkPhotoCount  — the queue row's label, "2 photos".
//   WorkPhotoStrip  — LAZY (WorkPhotoViewer.tsx): the grade panel's thumbnails,
//                     their signing, and the full-size view, loaded only when a
//                     photo answer is open — the Responses route has a size
//                     budget, and only the photos a teacher opens are signed.
// A photo the teacher cannot see says why, never a blank (§6.5): removed by
// retention, or changed after it was handed in (G18).
// =============================================================================

import { lazy } from 'react';
import type { GradingQueueRow } from '../lib/grading';

/** The photo ids a queue row's check handed in, in order. */
export function photoIdsOf(row: GradingQueueRow): string[] {
  return (row.response_photos ?? []).map((p) => p.id).filter((id): id is string => typeof id === 'string');
}

/** The queue row's label for a photo answer: words only (the thumbnails are
 *  in the grade panel's lazy chunk; the route has a size budget). */
export function WorkPhotoCount({ row }: { row: GradingQueueRow }) {
  const n = photoIdsOf(row).length;
  if (n === 0) return null;
  return <span data-photo-count={n}>{n === 1 ? '1 photo' : `${n} photos`}</span>;
}

/** The grade panel's photos and the full-size view: their own chunk. */
export const WorkPhotoStrip = lazy(() => import('./WorkPhotoViewer'));
