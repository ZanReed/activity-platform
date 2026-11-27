// =============================================================================
// lib/clientErrors.ts — the teacher-only error log, client half (review C5 slice 4)
// -----------------------------------------------------------------------------
// docs/design/shared-data-loading.md, decision 8; the table and its one writer
// are migration 0107 (`client_errors`, `report_client_error`).
//
// What reaches the log, and from where:
//   load_failed / refresh_failed / refused — lib/useLoad.ts's reportLoadFailure
//   render_threw — AppErrorBoundary (in the shell) dispatches RENDER_THREW_EVENT;
//                  the boundary itself carries no reporting code
//   unhandled    — window `error` and `unhandledrejection`
//
// TEACHERS ONLY, TWICE OVER. This module is imported only by teacher route
// modules and useLoad (never by the student shell — perf-budgets.mjs →
// SHELL_EVICTED), so a student's page never even installs the listeners. And
// before anything is sent it checks the signed-in account's role (one read,
// cached per user), because a shared route module (UnitTracker holds both
// trackers) can load it on a student's page. The RPC refuses students too
// (`not_teacher`); that is the third line, not the first.
//
// BEST EFFORT. A failed report is dropped, never retried and never reported:
// the log must not become a source of errors itself.
// =============================================================================

import { rpc } from './db';
import { signedInUserId } from './currentUser';
import { supabase } from './supabase';

export type ClientErrorKind = 'load_failed' | 'refresh_failed' | 'refused' | 'render_threw' | 'unhandled';

/** The event AppErrorBoundary dispatches on window: `detail` is the error. */
export const RENDER_THREW_EVENT = 'app-render-threw';

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** The route PATTERN, never the instance: no query, no hash, ids as :id.
 *  (The RPC strips them again, in case a caller forgets.) */
export function routePattern(pathname: string): string {
    return (pathname || '/').replace(UUID, ':id').replace(/\d{4,}/g, ':id').slice(0, 200);
}

function messageOf(e: unknown): string {
    if (e instanceof Error) return e.message;
    if (typeof e === 'string') return e;
    return 'Unknown error';
}

let roleFor: { user: string; teacher: boolean } | null = null;

/** The server's rule (current_user_is_teacher, 0013): teacher or admin. A
 *  role read that FAILS is not remembered — it says "don't send" this time
 *  and asks again next time, so a network blip at the first error does not
 *  silence a teacher's page until reload. */
async function signedInTeacher(): Promise<boolean> {
    const user = await signedInUserId();
    if (!user) return false;
    if (roleFor?.user === user) return roleFor.teacher;
    try {
        const { data, error } = await supabase.from('users').select('role').eq('id', user).maybeSingle();
        if (error) return false;
        const role = data?.role;
        roleFor = { user, teacher: role === 'teacher' || role === 'admin' };
        return roleFor.teacher;
    } catch {
        return false;
    }
}

/** Per page load: at most MAX_SENDS reports, and the same failure at most
 *  once a minute. The server caps ROWS; this caps REQUESTS, so a page throwing
 *  in a loop (an interval, an animation frame) cannot spam the network. */
export const MAX_SENDS = 30;
const REPEAT_MS = 60_000;
let sends = 0;
const lastSent = new Map<string, number>();

function admit(signature: string): boolean {
    const now = Date.now();
    const last = lastSent.get(signature);
    if (last !== undefined && now - last < REPEAT_MS) return false;
    if (sends >= MAX_SENDS) return false;
    sends += 1;
    lastSent.set(signature, now);
    return true;
}

/** Test seam: forget the page's send count. */
export function resetClientErrorThrottle(): void {
    sends = 0;
    lastSent.clear();
    roleFor = null;
}

/** Browser noise that is not a broken screen: the benign ResizeObserver
 *  warning, and a cross-origin script's opaque "Script error." */
function isNoise(message: string): boolean {
    return /^ResizeObserver loop/.test(message) || message === 'Script error.';
}

export async function reportClientError(report: {
    kind: ClientErrorKind;
    /** Which load (useLoad's key name) or RPC, when there is one. */
    source?: string | null;
    error: unknown;
}): Promise<void> {
    try {
        const message = messageOf(report.error).slice(0, 300);
        if (isNoise(message)) return;
        if (!(await signedInTeacher())) return;
        if (!admit(`${report.kind}|${report.source ?? ''}|${message}`)) return;
        await rpc('report_client_error', {
            p_kind: report.kind,
            p_route: routePattern(typeof location === 'undefined' ? '/' : location.pathname),
            p_build: typeof __APP_BUILD__ === 'string' ? __APP_BUILD__ : 'unknown',
            p_source: report.source ?? null,
            p_message: message,
        });
    } catch {
        // Best effort (header): a report that fails is dropped, never re-reported.
    }
}

let installed = false;

/** Listen for render throws and unhandled errors, once per page. */
export function installClientErrorReporting(): void {
    if (installed || typeof window === 'undefined') return;
    installed = true;
    window.addEventListener('error', (e) => void reportClientError({ kind: 'unhandled', error: e.error ?? e.message }));
    window.addEventListener(
        'unhandledrejection',
        (e) => void reportClientError({ kind: 'unhandled', error: e.reason }),
    );
    window.addEventListener(
        RENDER_THREW_EVENT,
        (e) => void reportClientError({ kind: 'render_threw', error: (e as CustomEvent<unknown>).detail }),
    );
}

installClientErrorReporting();
