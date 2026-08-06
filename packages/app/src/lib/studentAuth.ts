// =============================================================================
// studentAuth.ts — shared-device auth primitives (S1 ruling 2.4A; S6 ruling S6-6)
// -----------------------------------------------------------------------------
// School Chromebooks are shared hardware: the next student at the keyboard
// must not inherit the last one's session OR their locally buffered work.
//
// THE HOLE THIS FILE EXISTS TO CLOSE (found by the S6 review, verified against
// the installed @supabase/auth-js): `signOut()` gives up on a network failure
// WITHOUT clearing the local session. So the student taps "Sign out" on dying
// school Wi-Fi, sees an error, walks away — and the next student opens the app
// already signed in as them. Every per-user guard downstream (buffer keys,
// cache names, queued checks) is correct and irrelevant, because the session
// itself now says the wrong person.
//
//   purge storage + caches ──► signOut() ──► network dies
//                                  │
//                                  └──► signOut({scope:'local'}) ──► token gone
//
// Purge runs FIRST either way: the on-device work is ours to remove, and a
// failed network call must never be what decides whether it survives.
// =============================================================================

import { VIEWER_STORAGE_PREFIX, purgeStudentCaches } from '@activity/viewer';
import { supabase } from './supabase';

// Namespace prefix for everything the viewer persists on-device. IMPORTED, not
// restated: the viewer owns the key scheme (it writes the keys), and this
// purge is only complete if both sides mean the same string. A second literal
// here would let the two drift silently — a buffer written under a prefix
// sign-out doesn't scan is work left on a shared machine.
// (A redundant `export { VIEWER_STORAGE_PREFIX }` re-export lived here —
// deleted 2026-08-06, A17. The viewer OWNS the prefix (S6-V1 flipped
// ownership precisely so two literals could not drift); import it from
// '@activity/viewer' like this module does.)

// Ruling 2.4A: prompt after ~30 minutes of inactivity. Unexported (A17):
// consumed only as the default parameter below; the S9 idle-chrome wiring
// (cutover checklist C2) configures through the parameter, not the constant.
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * How long the idle prompt waits for an answer before signing out on its own
 * (ruling S6-6). A prompt alone assumes someone is still there to read it,
 * which is exactly the assumption that fails on a shared cart at the end of a
 * period. Long enough that a student who stepped away mid-problem can come
 * back to it; short enough to beat the next class.
 */
const IDLE_GRACE_MS = 2 * 60 * 1000; // unexported (A17): default param only

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
 * and session storage AND every cache holding student content, then end the
 * Supabase session — falling back to a local-only sign-out if the network call
 * fails, so the token cannot outlive the purge.
 *
 * Still throws on a failed network sign-out, because the caller should be able
 * to say "we couldn't reach the server" — but by then the device is already
 * clean, which is the part that matters to the next student.
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
    // The SW's per-student document caches. The shell survives on purpose: it
    // is application code with no student data, and re-downloading it would
    // punish the next student for the previous one signing out.
    try {
        if (typeof caches !== 'undefined') await purgeStudentCaches(caches);
    } catch {
        // No CacheStorage — nothing cached to purge.
    }

    const { error } = await supabase.auth.signOut();
    if (!error) return;

    // THE LOCAL FALLBACK. auth-js returns early on a network failure without
    // removing the stored session, so without this the device stays signed in
    // as a student who believes they signed out.
    try {
        await supabase.auth.signOut({ scope: 'local' });
    } catch {
        // Even the local path failed; the throw below still tells the caller.
    }
    throw new Error(error.message);
}

/**
 * Subscribe to "a human is doing something". Shared by the idle watcher and
 * the escalation grace period so both agree on what activity means — two
 * definitions would drift, and the one that drifted would be the one deciding
 * whether to sign a student out.
 */
function onUserActivity(handler: () => void): () => void {
    const EVENTS = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'] as const;
    const onVisibility = () => {
        if (!document.hidden) handler();
    };
    for (const e of EVENTS) {
        window.addEventListener(e, handler, { passive: true });
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
        for (const e of EVENTS) window.removeEventListener(e, handler);
        document.removeEventListener('visibilitychange', onVisibility);
    };
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

    const detach = onUserActivity(arm);
    arm();

    return {
        stop: () => {
            clearTimeout(timer);
            detach();
        },
    };
}

export interface IdleSignOutOptions {
    /** Show the "still there?" banner. */
    onPrompt: () => void;
    /** Called when the prompt went unanswered — sign out for them. */
    onEscalate: () => void | Promise<void>;
    /** Dismiss the banner because activity resumed. */
    onDismiss?: () => void;
    idleMs?: number;
    graceMs?: number;
}

/**
 * The 2.4A idle prompt WITH the S6-6 escalation: prompt after a quiet stretch,
 * and if nothing answers it, sign out locally rather than leaving a live
 * session on a shared machine indefinitely.
 *
 *   [activity] ──idleMs quiet──► onPrompt ──graceMs more quiet──► onEscalate
 *        ▲                           │
 *        └───── any activity ────────┘ (onDismiss, back to watching)
 */
export function watchIdleSignOut(options: IdleSignOutOptions): IdleWatcher {
    const {
        onPrompt,
        onEscalate,
        onDismiss,
        idleMs = IDLE_TIMEOUT_MS,
        graceMs = IDLE_GRACE_MS,
    } = options;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let prompted = false;
    let stopped = false;

    const armIdle = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            prompted = true;
            onPrompt();
            armGrace();
        }, idleMs);
    };

    const armGrace = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (stopped) return;
            void onEscalate();
        }, graceMs);
    };

    const onActivity = () => {
        if (stopped) return;
        if (prompted) {
            // They came back before the grace ran out: take the banner down
            // and go back to the long watch.
            prompted = false;
            onDismiss?.();
        }
        armIdle();
    };

    const detach = onUserActivity(onActivity);
    armIdle();

    return {
        stop: () => {
            stopped = true;
            clearTimeout(timer);
            detach();
        },
    };
}
