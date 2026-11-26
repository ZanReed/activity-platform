// =============================================================================
// lib/photoUsage.ts — the teacher's own photo storage (0098, MS-13)
// -----------------------------------------------------------------------------
// One RPC, read by the lazy line on My classes (components/PhotoStorageLine).
// Its own module on purpose: only that lazy chunk imports it, so the Classes
// route's budget never carries it.
// =============================================================================

import { rpc } from './db';

export interface PhotoUsage {
    photos: number;
    attached: number;
    bytes: number;
}

export async function fetchMyPhotoUsage(): Promise<PhotoUsage> {
    const { data, error } = await rpc('my_work_photo_usage');
    if (error) throw new Error(error.message);
    const row = (Array.isArray(data) ? data[0] : data) as Partial<Record<keyof PhotoUsage, number | string>> | null;
    const num = (v: number | string | undefined) => Number(v ?? 0) || 0;
    return { photos: num(row?.photos), attached: num(row?.attached), bytes: num(row?.bytes) };
}

/** "512 KB", "4.2 MB", "1.3 GB" (1024-based, one decimal from MB up). */
export function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(0, Math.round(bytes / 1024))} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

/** The line's words, or null when there is nothing stored (no line at all). */
export function photoUsageText(u: PhotoUsage): string | null {
    if (u.photos <= 0) return null;
    const n = u.photos === 1 ? '1 photo' : `${u.photos} photos`;
    return `Students' photos of working: ${n}, ${formatBytes(u.bytes)} stored. Kept until 30 days after a grade is released, and never past the end of the school year.`;
}
