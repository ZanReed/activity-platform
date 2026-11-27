// =============================================================================
// lib/photoPilot.ts — is this teacher a photo-answers pilot? (0099)
// -----------------------------------------------------------------------------
// Author ruling 2026-11-19: photo answers open first to pilot teachers only,
// hidden from everyone else. The server enforces it (photos_allowed_for, every
// gate); this read only decides what the editor OFFERS: the "Photo of working"
// menu item and the paste importer's ```photo fence.
//
// Read in the editor route (lazy), never in the shell's session load: a
// failure here must hide one feature, not break sign-in. Off until read, and
// off on any failure.
// =============================================================================

import { useEffect, useState } from 'react';
import { leaveOut } from './loadFailure';
import { supabase } from './supabase';
import { setPhotoPilotOffered } from '../editor/slashMenuItems';

export async function fetchPhotoPilot(userId: string): Promise<boolean> {
    const { data, error } = await supabase.from('users').select('photo_pilot').eq('id', userId).maybeSingle();
    if (error || !data) return false;
    return (data as { photo_pilot?: unknown }).photo_pilot === true;
}

/** The teacher's pilot flag; also sets what the block menus offer. */
export function usePhotoPilot(userId: string | null | undefined): boolean {
    const [pilot, setPilot] = useState(false);
    useEffect(() => {
        setPhotoPilotOffered(false);
        setPilot(false);
        if (!userId) return;
        let alive = true;
        fetchPhotoPilot(userId).then(
            (on) => {
                if (!alive) return;
                setPhotoPilotOffered(on);
                setPilot(on);
            },
            leaveOut('photoPilot'), // no pilot controls, as for a non-pilot teacher
        );
        return () => {
            alive = false;
        };
    }, [userId]);
    return pilot;
}
