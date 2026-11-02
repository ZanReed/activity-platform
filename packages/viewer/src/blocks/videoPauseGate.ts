// What a clip should do at this moment (D64 VP-6). Pure, so every seek and skip
// is testable without a player. A time past the pause by more than a tick's slop
// means the student skipped ahead, and the clip goes back to it.
import type { VideoPause } from '@activity/schema';

const SLOP_SECONDS = 1;

export function pauseStep(
  pauses: readonly VideoPause[],
  nextPause: number,
  time: number,
): { stop: false } | { stop: true; seekTo: number | null } {
  const pause = pauses[nextPause];
  if (!pause || time < pause.at) return { stop: false };
  return { stop: true, seekTo: time > pause.at + SLOP_SECONDS ? pause.at : null };
}

export function formatClipTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${secs}` : `${minutes}:${secs}`;
}
