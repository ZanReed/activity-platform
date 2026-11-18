// =============================================================================
// PhotoStorageLine — "Students' photos of working: 12 photos, 4.2 MB stored."
// (media-submissions.md §6.8, MS-13; author ruling 2026-11-19: on My classes)
// -----------------------------------------------------------------------------
// The teacher's own figure from the cost meter (0098). Shows nothing until a
// photo exists, and nothing on a failed read: it is information, not a gate.
// Lazy (Classes.tsx), like TimezoneControl: the classes journey's budget is for
// the list.
// =============================================================================

import { useEffect, useState } from 'react';
import { fetchMyPhotoUsage, photoUsageText } from '../lib/photoUsage';

export default function PhotoStorageLine() {
    const [text, setText] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        fetchMyPhotoUsage().then(
            (u) => {
                if (!cancelled) setText(photoUsageText(u));
            },
            () => undefined,
        );
        return () => {
            cancelled = true;
        };
    }, []);
    if (!text) return null;
    return (
        <p className="mt-1 text-sm text-muted" data-testid="photo-storage-line">
            {text}
        </p>
    );
}
