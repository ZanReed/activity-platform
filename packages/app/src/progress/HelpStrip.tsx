// =============================================================================
// progress/HelpStrip.tsx — "Asking for you" on Class Progress (S9, ST-5/6/7)
// -----------------------------------------------------------------------------
// The class's open help requests, longest-waiting first, each with Done.
// There is no push (supabase.channel() is stubbed), so the strip POLLS:
// every 15 s, only while the tab is visible and only while it can matter —
// the switch is on, a request is still open, or nothing has loaded yet (a
// failed first read is retried by the next tick, never given up on). Hide
// names reaches the strip through `nameOf`, so a projected page stays
// nameless. Nothing shows when nobody is asking.
//
// Every read and every Done carries a sequence number, and only the newest
// one may land: a poll that left before Done must not put the hand back up,
// and a late reply for the previous class must not paint this one.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { endHelp, fetchClassHelp, waitedWords, type ClassHelp } from '../lib/classHelp';

export const HELP_POLL_MS = 15_000;

export function useClassHelp(classId: string): {
    help: ClassHelp | null;
    done: (requestId: string) => Promise<void>;
} {
    const [help, setHelp] = useState<ClassHelp | null>(null);
    const seq = useRef(0);
    const landed = useRef(0);
    const land = useCallback((mine: number, h: ClassHelp) => {
        if (mine < landed.current) return;
        landed.current = mine;
        setHelp(h);
    }, []);

    const load = useCallback(() => {
        const mine = ++seq.current;
        fetchClassHelp(classId).then(
            (h) => land(mine, h),
            () => undefined,
        );
    }, [classId, land]);

    // A new class starts from nothing, and anything still in flight for the
    // old one is outranked by the next number.
    useEffect(() => {
        setHelp(null);
        landed.current = ++seq.current;
        load();
        return () => {
            landed.current = ++seq.current;
        };
    }, [load]);

    const polling = help === null || help.on || help.requests.length > 0;
    useEffect(() => {
        if (!polling) return;
        let timer: ReturnType<typeof setInterval> | null = null;
        const start = () => {
            if (timer === null) timer = setInterval(load, HELP_POLL_MS);
        };
        const stop = () => {
            if (timer !== null) clearInterval(timer);
            timer = null;
        };
        const onVisibility = () => {
            if (document.visibilityState === 'visible') {
                load();
                start();
            } else stop();
        };
        if (document.visibilityState === 'visible') start();
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            stop();
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [polling, load]);

    const done = useCallback(
        async (requestId: string) => {
            const mine = ++seq.current;
            land(mine, await endHelp(requestId));
        },
        [land],
    );

    return { help, done };
}

export function HelpStrip({
    help,
    onDone,
    nameOf,
}: {
    help: ClassHelp | null;
    onDone: (requestId: string) => Promise<void>;
    nameOf: (studentId: string, name: string) => string;
}) {
    const [busy, setBusy] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);
    const listRef = useRef<HTMLUListElement>(null);
    const n = help?.requests.length ?? 0;
    // After Done the row (or the whole strip) unmounts; focus goes to the next
    // Done button, else the heading, else the page's main heading — never the
    // body (Fable review).
    const pendingFocus = useRef(false);
    useEffect(() => {
        if (!pendingFocus.current) return;
        pendingFocus.current = false;
        const next = listRef.current?.querySelector<HTMLButtonElement>('.cp-help__done');
        if (next) next.focus();
        else document.querySelector<HTMLElement>('main h1')?.focus();
    }, [n]);
    return (
        <>
            {/* New hands are said aloud, politely, by count. */}
            <p className="sr-only" aria-live="polite" data-help-live>
                {n > 0 ? `${n} asking for you` : ''}
            </p>
            {help && n > 0 ? (
                <section className="cp-help" aria-labelledby="cp-help-title" data-help-strip>
                    <h2 id="cp-help-title" className="cp-help__title">
                        Asking for you ({n})
                    </h2>
                    <ul className="cp-help__list" ref={listRef}>
                        {help.requests.map((r) => {
                            const name = nameOf(r.studentId, r.name);
                            return (
                                <li key={r.id} className="cp-help__item" data-help-request={r.id}>
                                    <span className="cp-help__name">{name}</span>
                                    <span className="cp-help__where">
                                        {r.activityTitle} · {r.sectionLabel}
                                    </span>
                                    <time className="cp-help__waited" dateTime={r.createdAt}>
                                        {waitedWords(r.createdAt)}
                                    </time>
                                    <button
                                        type="button"
                                        className="cp-help__done"
                                        aria-disabled={busy === r.id || undefined}
                                        aria-label={`Done: ${name}, ${r.activityTitle}`}
                                        onClick={() => {
                                            if (busy === r.id) return;
                                            setBusy(r.id);
                                            setFailed(false);
                                            pendingFocus.current = true;
                                            onDone(r.id).then(
                                                () => setBusy(null),
                                                () => {
                                                    pendingFocus.current = false;
                                                    setBusy(null);
                                                    setFailed(true);
                                                },
                                            );
                                        }}
                                    >
                                        Done
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    {failed ? (
                        <p className="cp-help__error" role="alert">
                            That didn’t save. Try Done again.
                        </p>
                    ) : null}
                </section>
            ) : null}
        </>
    );
}
