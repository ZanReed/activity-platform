// =============================================================================
// RecentlyDeleted.tsx — a closed-by-default list of what the teacher deleted,
// each with Restore (UI review G-5 / G-6). Shared by My classes and My
// activities. Absent when there is nothing to show; a failed restore says so
// on its row and leaves the row in place.
// =============================================================================

import { useState } from 'react';
import type { DeletedItem } from '../lib/recentlyDeleted';

function day(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export default function RecentlyDeleted({
    items,
    onRestore,
    noun,
}: {
    items: readonly DeletedItem[];
    onRestore: (id: string) => Promise<void>;
    /** "class" or "activity", for the row's accessible name. */
    noun: string;
}) {
    const [busy, setBusy] = useState<string | null>(null);
    const [failed, setFailed] = useState<Record<string, string>>({});
    if (items.length === 0) return null;
    return (
        <details className="mt-8 rounded-lg border border-line bg-canvas p-4" data-recently-deleted>
            <summary className="cursor-pointer text-sm font-medium text-strong">
                Recently deleted ({items.length})
            </summary>
            <ul className="mt-3 divide-y divide-line">
                {items.map((it) => (
                    <li key={it.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                        <span className="min-w-0">
                            <span className="block truncate text-sm text-ink">{it.label}</span>
                            <span className="block text-xs text-muted">
                                Deleted {day(it.deletedAt)}
                                {it.purgeAfter ? ` · removed for good on ${day(it.purgeAfter)}` : ''}
                            </span>
                            {failed[it.id] && (
                                <span className="block text-xs text-danger" role="alert">
                                    Couldn’t restore: {failed[it.id]}
                                </span>
                            )}
                        </span>
                        <button
                            type="button"
                            disabled={busy !== null}
                            aria-label={`Restore ${noun} ${it.label}`}
                            onClick={async () => {
                                setBusy(it.id);
                                try {
                                    await onRestore(it.id);
                                } catch (err) {
                                    setFailed((f) => ({ ...f, [it.id]: err instanceof Error ? err.message : String(err) }));
                                } finally {
                                    setBusy(null);
                                }
                            }}
                            className="min-h-11 rounded-md border border-line-strong bg-canvas px-3 text-sm font-medium text-strong hover:bg-surface disabled:opacity-50"
                        >
                            {busy === it.id ? 'Restoring…' : 'Restore'}
                        </button>
                    </li>
                ))}
            </ul>
        </details>
    );
}
