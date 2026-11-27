// =============================================================================
// lib/useLoad.ts — the teacher screens' one way to load data (review C5)
// -----------------------------------------------------------------------------
// docs/design/shared-data-loading.md, slice 1 (ruled 2026-11-27, decision 1a).
//
//   const loaded = useLoad(['classProgress', classId], () => fetchClassProgress(classId));
//   if (!loaded.data) return <LoadStatus state={loaded} what="progress" />;
//
// Promoted from progress/common.tsx's useProgressLoad (CP-8, DR-4), which the
// two progress pages used. What it does once, so a screen does not have to:
//   - latest-wins: an answer for an older key, an older reload, or a screen
//     already left never lands (the hand-written `let cancelled` flags);
//   - first-load failure vs REFUSAL (not your class / activity) vs a failed
//     REFRESH, which keeps the last good data (DR-4);
//   - `slow` after the shared SLOW_LOAD_MS, so hung wifi says so (decision 4);
//   - every failure goes through reportLoadFailure() (slice 4 sends it on).
//
// The call shape is SWR's ON PURPOSE (decision 2): a key that names the data,
// and a loader. A `null` key loads nothing. If slice 2 swaps in SWR, the
// screens keep their calls. The loader is read from a ref, so it may close
// over anything; ONLY the key decides when to load again — put every input
// the loader reads into the key.
//
// TEACHER SCREENS ONLY. The student shell keeps its own loaders (decision 3);
// perf-budgets.mjs → SHELL_EVICTED holds this file out of it by the `[load] `
// console prefix below, and LoadStatus by its `data-load-status` attribute.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
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

/** The database's refusals (42501): not the caller's class, activity, or student. */
export function isRefusal(e: unknown): boolean {
    const m = e instanceof Error ? e.message : '';
    return /not_class_teacher|not_your_activity|not_in_scope/.test(m);
}

export type LoadFailureKind = 'load_failed' | 'refresh_failed' | 'refused';

export interface LoadFailure {
    /** The key's first part: names the data, never carries an id. */
    what: string;
    kind: LoadFailureKind;
    error: unknown;
}

/** Where every failed load is reported. Slice 1: the console only. */
export function reportLoadFailure(failure: LoadFailure): void {
    console.warn(`[load] ${failure.what}: ${failure.kind}`, failure.error);
}

function messageOf(e: unknown): string {
    if (e instanceof Error) return e.message;
    return typeof e === 'string' ? e : 'Unknown error';
}

export function useLoad<T>(key: LoadKey | null, loader: () => Promise<T>): LoadState<T> {
    const [data, setData] = useState<T | null>(null);
    const [failed, setFailed] = useState(false);
    const [refused, setRefused] = useState(false);
    const [refreshFailed, setRefreshFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(key !== null);
    const [loadedAt, setLoadedAt] = useState<Date | null>(null);
    const [attempt, setAttempt] = useState(0);

    const loaderRef = useRef(loader);
    loaderRef.current = loader;
    const hasData = useRef(false);
    // Bumped by every load AND by every key change or unmount, so only the
    // newest load for the current key may land.
    const generation = useRef(0);

    const keyId = key === null ? null : JSON.stringify(key);
    const what = key === null ? '' : String(key[0] ?? '');

    const run = useCallback(() => {
        if (keyId === null) return;
        const mine = ++generation.current;
        setLoading(true);
        setAttempt(mine);
        let pending: Promise<T>;
        try {
            pending = loaderRef.current();
        } catch (e) {
            pending = Promise.reject(e);
        }
        pending.then(
            (d) => {
                if (mine !== generation.current) return;
                hasData.current = true;
                setData(d);
                setFailed(false);
                setRefused(false);
                setRefreshFailed(false);
                setErrorMessage(null);
                setLoadedAt(new Date());
                setLoading(false);
            },
            (e: unknown) => {
                if (mine !== generation.current) return;
                const refusedNow = isRefusal(e);
                setErrorMessage(messageOf(e));
                if (hasData.current) setRefreshFailed(true);
                else {
                    setFailed(true);
                    setRefused(refusedNow);
                }
                setLoading(false);
                reportLoadFailure({
                    what,
                    // What the teacher SAW: a refresh failure keeps the data
                    // whatever the cause, so it is logged as one.
                    kind: hasData.current ? 'refresh_failed' : refusedNow ? 'refused' : 'load_failed',
                    error: e,
                });
            },
        );
    }, [keyId, what]);

    useEffect(() => {
        hasData.current = false;
        setData(null);
        setFailed(false);
        setRefused(false);
        setRefreshFailed(false);
        setErrorMessage(null);
        setLoadedAt(null);
        setLoading(keyId !== null);
        run();
        return () => {
            // A key change or unmount outranks anything still in flight.
            generation.current += 1;
        };
    }, [keyId, run]);

    // "Taking longer than usual" after SLOW_LOAD_MS with nothing on screen
    // (lib/slowLoad.ts's rule), timed per ATTEMPT: Try again restarts the
    // wait, so the click visibly does something (back to "Loading…").
    const [slow, setSlow] = useState(false);
    const waiting = loading && data === null;
    useEffect(() => {
        setSlow(false);
        if (!waiting) return;
        const timer = setTimeout(() => setSlow(true), SLOW_LOAD_MS);
        return () => clearTimeout(timer);
    }, [waiting, attempt]);

    return { data, failed, refused, refreshFailed, errorMessage, loading, slow, loadedAt, reload: run };
}
