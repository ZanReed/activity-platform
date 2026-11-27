// =============================================================================
// lib/useLoad.ts — the teacher screens' one way to load data (review C5)
// -----------------------------------------------------------------------------
// docs/design/shared-data-loading.md, slices 1 and 2 (ruled 2026-11-27).
//
//   const loaded = useLoad(['classProgress', classId], () => fetchClassProgress(classId));
//   if (!loaded.data) return <LoadStatus state={loaded} what="progress" />;
//
// Promoted from progress/common.tsx's useProgressLoad (CP-8, DR-4). What it
// does once, so a screen does not have to:
//   - latest-wins: an answer for an older key, an older reload, or a screen
//     already left never lands (the hand-written `let cancelled` flags);
//   - first-load failure vs REFUSAL (not your class / activity) vs a failed
//     REFRESH, which keeps the last good data (DR-4);
//   - `slow` after the shared SLOW_LOAD_MS, so hung wifi says so (decision 4);
//   - every failure goes through reportLoadFailure() (slice 4 sends it on).
//
// ONE COPY PER KEY (slice 2). Every screen showing a key shares one answer
// and one request: two screens asking at once make one read. `reloadKey(key)`
// re-reads it for every screen showing it, and `updateLoaded(key, change)`
// writes a local edit into all of them (and drops a read already in flight,
// whose older answer would otherwise undo the edit). The copy is dropped when
// the last screen showing it leaves, unless the screen asked to `remember` it
// (decision 5: the lists), in which case coming back shows it at once and
// re-reads behind it. `refreshOnReturn` re-reads when the teacher comes back
// to the tab, at most once per RETURN_REFRESH_MS and never while the page is
// busy (decision 6: a dialog is open, or focus is in something you type in).
// Every copy is forgotten when the signed-in user changes.
//
// The call shape is SWR's ON PURPOSE (decision 2; the library question was
// re-asked at slice 2 and the author kept our own, 2026-11-27). A `null` key
// loads nothing. The loader is read from a ref, so it may close over
// anything; ONLY the key decides what is loaded — put every input the loader
// reads into the key, because two screens with the same key share an answer.
//
// TEACHER SCREENS ONLY. The student shell keeps its own loaders (decision 3);
// perf-budgets.mjs → SHELL_EVICTED holds this file out of it by the `[load] `
// console prefix below, and LoadStatus by its `data-load-status` attribute.
// =============================================================================

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useSessionUserId } from './sessionContextObject';
import { SLOW_LOAD_MS } from './slowLoad';

export type LoadKey = readonly (string | number | boolean | null | undefined)[];

export interface LoadState<T> {
    data: T | null;
    /** The first load failed and there is nothing to show. */
    failed: boolean;
    /** The first load was REFUSED (not the caller's class / activity), as
     * opposed to a network failure: different advice. */
    refused: boolean;
    /** A refresh failed; `data` is the last good load. */
    refreshFailed: boolean;
    /** The last failure's message, for the "Details" line. Never the main copy. */
    errorMessage: string | null;
    loading: boolean;
    /** A load with nothing yet on screen has run for SLOW_LOAD_MS. */
    slow: boolean;
    loadedAt: Date | null;
    reload: () => void;
}

/** The database's refusals (42501): not the caller's class, activity, or
 *  student — or not a teacher at all (the Bank's reads, 0054). */
export function isRefusal(e: unknown): boolean {
    const m = e instanceof Error ? e.message : '';
    return /not_class_teacher|not_your_activity|not_in_scope|The Activity Bank is for teachers/.test(m);
}

export type LoadFailureKind = 'load_failed' | 'refresh_failed' | 'refused';

export interface LoadFailure {
    /** The key's first part: names the data, never carries an id. */
    what: string;
    kind: LoadFailureKind;
    error: unknown;
}

/** Where every failed load is reported: the console, and the teacher-only
 *  error log (slice 4, lib/clientErrors.ts — which checks the role itself).
 *  Loaded on demand: the teacher journeys' size caps (perf-budgets.mjs →
 *  TEACHER_JOURNEYS) count static imports, and the log never blocks a page. */
export function reportLoadFailure(failure: LoadFailure): void {
    console.warn(`[load] ${failure.what}: ${failure.kind}`, failure.error);
    void import('./clientErrors').then(
        (m) => m.reportClientError({ kind: failure.kind, source: failure.what || null, error: failure.error }),
        () => undefined,
    );
}

function messageOf(e: unknown): string {
    if (e instanceof Error) return e.message;
    return typeof e === 'string' ? e : 'Unknown error';
}

/** A tab return re-reads a key at most this often (decision 6). */
export const RETURN_REFRESH_MS = 30_000;

export interface LoadOptions {
    /** Keep the last answer for the rest of the visit (decision 5). */
    remember?: boolean;
    /** Re-read when the teacher comes back to the tab (decision 6). */
    refreshOnReturn?: boolean;
}

/** True while a re-read would move things under the teacher: a dialog or a
 *  menu (a row's ⋯ menu) is open, or focus is in a field, a dropdown or an
 *  editor (decision 6). Read from
 *  the page, so no screen has to wire it. */
export function pageIsBusy(): boolean {
    if (typeof document === 'undefined') return false;
    if (document.querySelector('dialog[open], [role="dialog"], [role="alertdialog"], [aria-modal="true"], [role="menu"]'))
        return true;
    const a = document.activeElement;
    if (!(a instanceof HTMLElement)) return false;
    return a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
}

interface Snap {
    /** The answer (named `value`, not `data`: db-rpc.test's cast counter reads
     *  `data as` as a database cast). */
    value: unknown;
    failed: boolean;
    refused: boolean;
    refreshFailed: boolean;
    errorMessage: string | null;
    loading: boolean;
    loadedAt: Date | null;
    /** The newest read's number: the slow timer restarts on each. */
    attempt: number;
}

const BASE: Snap = {
    value: null,
    failed: false,
    refused: false,
    refreshFailed: false,
    errorMessage: null,
    loading: false,
    loadedAt: null,
    attempt: 0,
};
const IDLE: Snap = BASE;
const FIRST: Snap = { ...BASE, loading: true };

interface Entry {
    snap: Snap;
    /** Bumped by every read and by anything that outranks one in flight. */
    seq: number;
    inflight: boolean;
    lastStart: number;
    listeners: Set<() => void>;
    remember: boolean;
    what: string;
    loader: (() => Promise<unknown>) | null;
}

const store = new Map<string, Entry>();
let storeUser: string | null | undefined;

function entryFor(id: string, what: string, remember: boolean): Entry {
    let e = store.get(id);
    if (!e) {
        e = { snap: FIRST, seq: 0, inflight: false, lastStart: 0, listeners: new Set(), remember, what, loader: null };
        store.set(id, e);
    }
    if (remember) e.remember = true;
    return e;
}

function publish(e: Entry, snap: Snap): void {
    e.snap = snap;
    for (const l of [...e.listeners]) l();
}

function start(id: string, e: Entry): void {
    const load = e.loader;
    if (!load) return;
    const mine = ++e.seq;
    e.inflight = true;
    e.lastStart = Date.now();
    publish(e, { ...e.snap, loading: true, attempt: mine });
    let pending: Promise<unknown>;
    try {
        pending = load();
    } catch (err) {
        pending = Promise.reject(err);
    }
    const current = () => mine === e.seq && store.get(id) === e;
    pending.then(
        (data) => {
            if (!current()) return;
            e.inflight = false;
            publish(e, { ...BASE, value: data, loadedAt: new Date(), attempt: mine });
        },
        (err: unknown) => {
            if (!current()) return;
            e.inflight = false;
            const had = e.snap.loadedAt !== null;
            const refusedNow = isRefusal(err);
            publish(e, {
                ...e.snap,
                loading: false,
                errorMessage: messageOf(err),
                refreshFailed: had || e.snap.refreshFailed,
                failed: had ? e.snap.failed : true,
                refused: had ? e.snap.refused : refusedNow,
            });
            reportLoadFailure({
                what: e.what,
                // What the teacher SAW: a refresh failure keeps the data
                // whatever the cause, so it is logged as one.
                kind: had ? 'refresh_failed' : refusedNow ? 'refused' : 'load_failed',
                error: err,
            });
        },
    );
}

/** Re-read `key` for every screen showing it (after a save that changed it).
 *  With no screen showing it, the remembered copy is kept, and the next
 *  screen to show it re-reads anyway. */
export function reloadKey(key: LoadKey): void {
    const id = JSON.stringify(key);
    const e = store.get(id);
    if (!e) return;
    if (e.listeners.size > 0) start(id, e);
    else {
        e.seq += 1; // a read started before the save must not land
        e.inflight = false;
    }
}

/** Write a local edit into every screen showing `key`. Nothing happens if
 *  the key has no data yet. A read already in flight is dropped (it started
 *  before the edit, so its answer would undo it) and started again: callers
 *  edit only after the server confirmed, so the new read already holds the
 *  edit — and whatever else the dropped read was fetching is not lost. */
export function updateLoaded<T>(key: LoadKey, change: (prev: T) => T): void {
    const id = JSON.stringify(key);
    const e = store.get(id);
    if (!e || e.snap.loadedAt === null) return;
    const wasReading = e.inflight;
    e.seq += 1;
    e.inflight = false;
    publish(e, { ...e.snap, value: change(e.snap.value as T), loading: false });
    if (wasReading && e.listeners.size > 0) start(id, e);
}

/** A read still in flight after this long is treated as abandoned (a dead
 *  socket, a captive portal): the next arrival or tab return starts a new one
 *  instead of joining it. Latest-wins makes the old one harmless. */
function joinable(e: Entry): boolean {
    return e.inflight && Date.now() - e.lastStart < SLOW_LOAD_MS;
}

/** Forget every copy (a user switch; tests). Screens re-read only through
 *  useLoad's user-change path, which re-subscribes them; a direct call (tests)
 *  starts nothing. */
export function forgetLoads(): void {
    for (const e of store.values()) e.seq += 1;
    store.clear();
}

export function useLoad<T>(key: LoadKey | null, loader: () => Promise<T>, options: LoadOptions = {}): LoadState<T> {
    // A different account must never see the last one's copies. Cleared
    // during render (no one is notified — every effect below re-runs on
    // `user`, so each screen subscribes to a fresh copy and re-reads).
    const user = useSessionUserId();
    if (storeUser !== user) {
        forgetLoads();
        storeUser = user;
    }

    const loaderRef = useRef(loader);
    loaderRef.current = loader;
    const keyId = key === null ? null : JSON.stringify(key);
    const what = key === null ? '' : String(key[0] ?? '');
    const remember = options.remember === true;
    const onReturn = options.refreshOnReturn === true;

    const subscribe = useCallback(
        (onChange: () => void) => {
            if (keyId === null) return () => undefined;
            const e = entryFor(keyId, what, remember);
            e.listeners.add(onChange);
            return () => {
                e.listeners.delete(onChange);
                if (e.listeners.size > 0 || store.get(keyId) !== e) return;
                if (!e.remember) {
                    e.seq += 1;
                    store.delete(keyId);
                } else if (e.snap.loadedAt === null) {
                    // A remembered FAILURE is not kept: the next arrival's
                    // first frame is "Loading…", never a stale alert.
                    e.snap = FIRST;
                }
            };
        },
        // `user` re-subscribes after a user switch cleared the store.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [keyId, what, remember, user],
    );
    const getSnap = useCallback(
        () => (keyId === null ? IDLE : (store.get(keyId)?.snap ?? FIRST)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [keyId, user],
    );
    const snap = useSyncExternalStore(subscribe, getSnap, getSnap);

    const attach = useCallback((): Entry | null => {
        if (keyId === null) return null;
        const e = entryFor(keyId, what, remember);
        e.loader = () => loaderRef.current();
        return e;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyId, what, remember, user]);

    // Every screen that shows a key re-reads it on arrival — unless a read is
    // already in flight, which it joins. A remembered copy is on screen
    // meanwhile; a remembered FAILURE is not kept (a new arrival starts clean).
    useEffect(() => {
        const e = attach();
        if (!e || joinable(e)) return;
        start(keyId as string, e);
    }, [attach, keyId]);

    const reload = useCallback(() => {
        const e = attach();
        if (e) start(keyId as string, e);
    }, [attach, keyId]);

    useEffect(() => {
        if (!onReturn || keyId === null) return;
        const back = () => {
            if (document.visibilityState !== 'visible') return;
            const e = store.get(keyId);
            if (!e || joinable(e) || e.snap.loadedAt === null) return;
            if (Date.now() - e.lastStart < RETURN_REFRESH_MS || pageIsBusy()) return;
            start(keyId, e);
        };
        document.addEventListener('visibilitychange', back);
        window.addEventListener('focus', back);
        return () => {
            document.removeEventListener('visibilitychange', back);
            window.removeEventListener('focus', back);
        };
    }, [onReturn, keyId, user]);

    // "Taking longer than usual" after SLOW_LOAD_MS with nothing on screen
    // (lib/slowLoad.ts's rule), timed per ATTEMPT: Try again restarts the
    // wait, so the click visibly does something (back to "Loading…").
    const [slow, setSlow] = useState(false);
    const waiting = snap.loading && snap.loadedAt === null;
    useEffect(() => {
        setSlow(false);
        if (!waiting) return;
        const timer = setTimeout(() => setSlow(true), SLOW_LOAD_MS);
        return () => clearTimeout(timer);
    }, [waiting, snap.attempt]);

    return {
        data: snap.value as T | null,
        failed: snap.failed,
        refused: snap.refused,
        refreshFailed: snap.refreshFailed,
        errorMessage: snap.errorMessage,
        loading: snap.loading,
        slow,
        loadedAt: snap.loadedAt,
        reload,
    };
}
