// =============================================================================
// studentAuth.ts — shared-device auth primitives (S1, ruling 2.4A)
// -----------------------------------------------------------------------------
// School Chromebooks are shared hardware: the next student at the keyboard
// must not inherit the last one's session OR their locally buffered work.
// These are the primitives; the UI wiring (chip menu sign-out, completion-
// panel sign-out, ~30-min idle prompt banner) lands with the viewer (T6/T7).
// =============================================================================

import { VIEWER_STORAGE_PREFIX } from '@activity/viewer';
import { supabase } from './supabase';

// Namespace prefix for everything the viewer persists on-device. IMPORTED, not
// restated: the viewer owns the key scheme (it writes the keys), and this
// purge is only complete if both sides mean the same string. A second literal
// here would let the two drift silently — a buffer written under a prefix
// sign-out doesn't scan is work left on a shared machine.
export { VIEWER_STORAGE_PREFIX };

// Ruling 2.4A: prompt after ~30 minutes of inactivity.
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

function purgePrefixed(storage: Storage): void {
    // Collect first — removing while iterating shifts key() indices.
    const doomed: string[] = [];
    for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key !== null && key.startsWith(VIEWER_STORAGE_PREFIX)) doomed.push(key);
    }
    for (const key of doomed) storage.removeItem(key);
}

/**
 * Full shared-device sign-out: purge every viewer-namespaced key from local
 * and session storage, then end the Supabase session. Purge happens FIRST so
 * a failed network signOut can't leave the next student the previous
 * student's buffered answers (the session token expiring is Supabase's
 * problem; the on-device work is ours).
 *
 * Storage access is best-effort: a locked-down browser profile that throws on
 * storage access must not block the signOut itself.
 */
export async function signOutEverything(): Promise<void> {
    try {
        purgePrefixed(window.localStorage);
        purgePrefixed(window.sessionStorage);
    } catch {
        // Storage unavailable (private mode / policy) — nothing buffered there.
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
}

export interface IdleWatcher {
    stop: () => void;
}

/**
 * Fire `onIdle` once after `timeoutMs` with no user activity (pointer, key,
 * scroll, touch, visibility-return). Plain function, not a hook — the viewer
 * package (S3) and this app can both consume it; wrap in useEffect at the
 * call site:
 *
 *   useEffect(() => watchIdle(handleIdle).stop, [handleIdle]);
 *
 * After firing it keeps watching and fires again after the next quiet
 * stretch (the idle PROMPT is dismissable; re-idling re-prompts).
 */
export function watchIdle(
    onIdle: () => void,
    timeoutMs: number = IDLE_TIMEOUT_MS,
): IdleWatcher {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const arm = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            onIdle();
            arm(); // keep watching; see doc comment
        }, timeoutMs);
    };

    const onActivity = () => arm();
    const onVisibility = () => {
        if (!document.hidden) arm();
    };

    const EVENTS = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'] as const;
    for (const e of EVENTS) {
        window.addEventListener(e, onActivity, { passive: true });
    }
    document.addEventListener('visibilitychange', onVisibility);
    arm();

    return {
        stop: () => {
            clearTimeout(timer);
            for (const e of EVENTS) window.removeEventListener(e, onActivity);
            document.removeEventListener('visibilitychange', onVisibility);
        },
    };
}
