// =============================================================================
// ChainHooks.tsx — a unit's hook pool, for the teacher (docs/design/chain-hooks-view.md)
// -----------------------------------------------------------------------------
// Ruled CH-1..CH-12; design review 1A–7.2A; eng re-run D1–D3. The page is the
// pool (prompt, "Opens: <skill>", teacher notes — all LITERAL text, C-97 (d))
// followed by the chain's activities in teaching order, with optional per-class
// "used" marks.
//
// What is deliberately NOT here:
//   * no markdown/math rendering of hook text — "$4" is money (the guard test
//     routes a "$4" note through this page and expects "$4");
//   * no opacity "dimming" — a used hook's prompt goes to the muted token and
//     says "Used <date>" with an icon (5.1A, DR-21);
//   * no aria-pressed on the mark control — the label itself changes (RT1);
//   * no student surface of any kind.
// =============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { supabase } from '../lib/supabase';
import { useSession } from '../lib/SessionContext';
import { listClasses, type ClassInfo } from '../lib/classes';
import { sortForOutline, unitOf } from '../lib/activityGrouping';
import {
    fetchMyChainHooks,
    formatUsedOn,
    hookShortName,
    listHookMarks,
    localToday,
    markHookUsed,
    unmarkHook,
    type ChainHook,
    type MyChainHooks,
} from '../lib/chainHooks';
import './chainHooks.css';

const CLASS_KEY = 'chainHooks.classId';

interface ChainActivity {
    id: string;
    title: string;
    status: string;
    updated_at: string;
    unit: string | null;
    draft_unit: string | null;
    source_path: string | null;
}

/** Per-viewer convenience only (the artifact rule): storage can throw. */
function readStoredClass(): string | null {
    try {
        return window.localStorage.getItem(CLASS_KEY);
    } catch {
        return null;
    }
}
function storeClass(id: string): void {
    try {
        window.localStorage.setItem(CLASS_KEY, id);
    } catch {
        /* a private window: the choice just is not remembered */
    }
}

export default function ChainHooks() {
    const { chainId: rawChain } = useParams();
    const chainId = rawChain ? decodeURIComponent(rawChain) : '';
    const { session } = useSession();
    const teacherId = session?.user.id ?? null;

    const [hooks, setHooks] = useState<MyChainHooks | null>(null);
    const [hooksFailed, setHooksFailed] = useState(false);
    const [activities, setActivities] = useState<ChainActivity[]>([]);
    const [classes, setClasses] = useState<ClassInfo[] | null>(null);
    const [classesFailed, setClassesFailed] = useState(false);
    const [classId, setClassId] = useState<string>('');
    const [marks, setMarks] = useState<Record<string, string>>({});
    const [pending, setPending] = useState<Set<string>>(new Set());
    const [failed, setFailed] = useState<Record<string, () => void>>({});
    const [editing, setEditing] = useState<string | null>(null);
    const [announce, setAnnounce] = useState('');
    const changeRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const loadHooks = useCallback(async () => {
        setHooksFailed(false);
        setHooks(null);
        try {
            const data = await fetchMyChainHooks();
            setHooks(data);
            const ids = Object.entries(data.activityChains)
                .filter(([, c]) => c === chainId)
                .map(([id]) => id);
            if (ids.length === 0) {
                setActivities([]);
                return;
            }
            const { data: rows, error } = await supabase
                .from('activities')
                .select('id, title, status, updated_at, unit, source_path, draft_unit:draft_content->meta->>unit')
                .in('id', ids)
                .is('deleted_at', null);
            if (error) throw new Error(error.message);
            // The `as unknown as` mirrors Activities.tsx: supabase-js cannot parse
            // the `->` json path in the select string.
            setActivities(sortForOutline(rows as unknown as ChainActivity[]));
        } catch {
            setHooksFailed(true);
        }
    }, [chainId]);

    useEffect(() => {
        void loadHooks();
    }, [loadHooks]);

    useEffect(() => {
        let cancelled = false;
        listClasses()
            .then((list) => {
                if (cancelled) return;
                setClasses(list);
                const stored = readStoredClass();
                if (stored && list.some((c) => c.id === stored)) setClassId(stored);
            })
            .catch(() => {
                if (!cancelled) setClassesFailed(true);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        setMarks({});
        setFailed({});
        setEditing(null);
        if (!classId) return;
        let cancelled = false;
        listHookMarks(classId)
            .then((rows) => {
                if (!cancelled) setMarks(Object.fromEntries(rows.map((r) => [r.hook_id, r.used_on])));
            })
            .catch(() => {
                /* marks stay empty; the pool itself still reads */
            });
        return () => {
            cancelled = true;
        };
    }, [classId]);

    const pool: ChainHook[] = hooks?.chains[chainId] ?? [];
    const unitTitle = useMemo(() => {
        for (const a of activities) {
            const u = unitOf(a);
            if (u) return u;
        }
        return chainId;
    }, [activities, chainId]);
    const className = classes?.find((c) => c.id === classId)?.name ?? '';

    useEffect(() => {
        document.title = `${unitTitle} — Hooks`;
    }, [unitTitle]);

    // One write per hook at a time (2.3A); optimistic, reverting on failure with
    // "Couldn't save · Try again". RT2: "Change date" stays disabled until the
    // in-flight write lands, so no date edit can be silently dropped.
    const write = (hookId: string, next: string | undefined, label: string) => {
        if (!classId || !teacherId || pending.has(hookId)) return;
        const prev = marks[hookId];
        setMarks((m) => {
            const copy = { ...m };
            if (next === undefined) delete copy[hookId];
            else copy[hookId] = next;
            return copy;
        });
        setFailed((f) => {
            const copy = { ...f };
            delete copy[hookId];
            return copy;
        });
        setPending((p) => new Set(p).add(hookId));
        const op = next === undefined
            ? unmarkHook(classId, hookId)
            : markHookUsed(classId, hookId, next, teacherId);
        op.then(() => setAnnounce(label))
            .catch(() => {
                setMarks((m) => {
                    const copy = { ...m };
                    if (prev === undefined) delete copy[hookId];
                    else copy[hookId] = prev;
                    return copy;
                });
                setFailed((f) => ({ ...f, [hookId]: () => write(hookId, next, label) }));
            })
            .finally(() =>
                setPending((p) => {
                    const copy = new Set(p);
                    copy.delete(hookId);
                    return copy;
                }),
            );
    };

    const closeEditor = (hookId: string) => {
        setEditing(null);
        // Focus returns to "Change date" (7.2A) once it is back in the DOM.
        requestAnimationFrame(() => changeRefs.current[hookId]?.focus());
    };

    let poolBody: React.ReactNode;
    if (hooksFailed) {
        poolBody = (
            <div className="ch-panel" role="alert">
                <p>Couldn't load hooks. Check your connection, then try again.</p>
                <button type="button" className="ch-btn ch-noprint" onClick={() => void loadHooks()}>
                    Retry
                </button>
            </div>
        );
    } else if (hooks === null) {
        poolBody = <p className="ch-muted" role="status">Loading…</p>;
    } else if (pool.length === 0) {
        poolBody = (
            <div className="ch-panel">
                <p>No hooks for this unit yet.</p>
                <p className="ch-muted">
                    Hooks come with the curriculum import. This unit's activities are listed below.
                </p>
            </div>
        );
    } else {
        poolBody = (
            <div className="ch-list">
                {pool.map((hook, i) => {
                    const used = marks[hook.id];
                    const busy = pending.has(hook.id);
                    const retry = failed[hook.id];
                    const short = hookShortName(hook.prompt);
                    const headingId = `hook-${i}`;
                    return (
                        <article key={hook.id} className="ch-hook" aria-labelledby={headingId}>
                            <h3 id={headingId} className={used ? 'ch-prompt ch-prompt--used' : 'ch-prompt'}>
                                {hook.prompt}
                            </h3>
                            {hook.connects_to.length > 0 && (
                                <p className="ch-opens">
                                    Opens: {hook.connects_to.map((c) => c.label).join('; ')}
                                </p>
                            )}
                            <p className="ch-notes-label">Teacher notes</p>
                            <p className="ch-note">{hook.note}</p>
                            {classId && (
                                <div className="ch-controls ch-noprint">
                                    {used === undefined ? (
                                        <button
                                            type="button"
                                            className="ch-btn"
                                            aria-label={`Mark used: ${short}`}
                                            onClick={() => write(hook.id, localToday(), `Marked used for ${className}`)}
                                        >
                                            Mark used
                                        </button>
                                    ) : (
                                        <>
                                            {editing === hook.id ? (
                                                <label className="ch-date-edit">
                                                    Used on{' '}
                                                    <input
                                                        type="date"
                                                        autoFocus
                                                        defaultValue={used}
                                                        max={localToday()}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            if (v && v !== used) {
                                                                write(hook.id, v, `Date changed for ${className}`);
                                                                closeEditor(hook.id);
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Escape') {
                                                                e.preventDefault();
                                                                closeEditor(hook.id);
                                                            }
                                                        }}
                                                        onBlur={() => closeEditor(hook.id)}
                                                    />
                                                </label>
                                            ) : (
                                                <span className="ch-status">
                                                    <span aria-hidden="true">✓</span> Used {formatUsedOn(used)}
                                                    {' '}
                                                    <button
                                                        type="button"
                                                        ref={(el) => {
                                                            changeRefs.current[hook.id] = el;
                                                        }}
                                                        className="ch-link"
                                                        aria-disabled={busy || undefined}
                                                        onClick={() => {
                                                            if (!busy) setEditing(hook.id);
                                                        }}
                                                    >
                                                        Change date
                                                    </button>
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                className="ch-btn"
                                                aria-label={`Unmark: ${short}`}
                                                onClick={() => write(hook.id, undefined, `Unmarked for ${className}`)}
                                            >
                                                Unmark
                                            </button>
                                        </>
                                    )}
                                    {retry && (
                                        <span className="ch-error" role="status">
                                            Couldn't save ·{' '}
                                            <button type="button" className="ch-link" onClick={retry}>
                                                Try again
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        );
    }

    let picker: React.ReactNode = null;
    if (classes !== null && !classesFailed) {
        picker = classes.length === 0 ? (
            <p className="ch-muted ch-noprint">
                Track which hooks a class has used: create a class in <Link to="/classes">My classes</Link>.
            </p>
        ) : (
            <label className="ch-picker ch-noprint">
                Class:{' '}
                <select
                    value={classId}
                    onChange={(e) => {
                        setClassId(e.target.value);
                        if (e.target.value) storeClass(e.target.value);
                    }}
                >
                    <option value="">Choose a class</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </label>
        );
    }

    return (
        <main className="ch-page">
            <div className="ch-wrap">
                <p className="ch-crumb ch-noprint">
                    <Link to="/activities">Activities</Link> / {unitTitle}
                </p>
                <h1 className="ch-h1">{unitTitle}</h1>
                <p className="ch-print-only">Hooks — teacher copy, not for students</p>
                <p className="ch-muted ch-noprint">
                    Questions to open a lesson. Pick one when your class's day begins.
                </p>
                {picker}

                <section aria-labelledby="ch-hooks-h" className="ch-section">
                    <h2 id="ch-hooks-h" className="ch-h2">
                        Hooks{pool.length > 0 ? ` · ${pool.length}` : ''}
                    </h2>
                    {poolBody}
                </section>

                <section aria-labelledby="ch-acts-h" className="ch-section">
                    <h2 id="ch-acts-h" className="ch-h2">Activities in this unit</h2>
                    {hooks !== null && activities.length === 0 ? (
                        <p className="ch-muted">No activities in this unit are in your library.</p>
                    ) : (
                        <ul className="ch-acts">
                            {activities.map((a) => (
                                <li key={a.id}>
                                    <Link to={`/activity/${a.id}`}>{a.title}</Link>
                                    <span className="ch-muted"> {a.status === 'published' ? 'Published' : 'Draft'}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <p className="sr-only" role="status" aria-live="polite">
                    {announce}
                </p>
            </div>
        </main>
    );
}
