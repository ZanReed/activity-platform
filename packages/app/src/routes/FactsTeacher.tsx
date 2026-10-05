// =============================================================================
// FactsTeacher.tsx — /classes/:classId/facts, the teacher's number-facts page
// -----------------------------------------------------------------------------
// D43 slice 1 (docs/design/practice-blocks.md; DR-17 to DR-23, CR-12, CR-13,
// S-4, S-5). Teachers see "Number facts snapshot"; "probe" never renders. One
// lazy, full-width page with three screens:
//
//   OPEN     what it is and how long; one line per year, NOTHING picked by
//            default (DR-18); Open, and "Try the demo first".
//   LIVE     the link, large (it is typed from the board); three counts with
//            fixed meanings, refreshed by POLLING every 5 s while the tab is
//            visible (the realtime client is stubbed and throws — CLAUDE.md);
//            a failed poll keeps the last numbers and says so. Names sit behind
//            "Show who has not started". The full-screen view shows ONLY the
//            link and the counts: this screen goes on a projector (DR-19).
//            Close asks first and defaults to "Keep it open" (DR-20).
//   RESULTS  the verdict as a sentence, the two numbers and who was left out,
//            the stopgap line; then "Who needs what" and each student, both
//            CLOSED on first view — a name is not in the DOM until its
//            disclosure is opened (DR-21, DR-22).
//
// Every number is the server's (fact_probe_results); this file formats it.
// =============================================================================

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { listClasses } from '../lib/classes';
import {
    closeProbe,
    factsLink,
    fetchOverview,
    fetchResults,
    openProbe,
    type ClassStat,
    type Group,
    type ProbeOverview,
    type ProbeResults,
    type StudentRow,
    type YearOption,
} from '../lib/factProbe';
import { aboutMinutes } from '../practice/minutes';
import '../practice/factsTeacher.css';

export const LIVE_POLL_MS = 5000;

const GROUPS: { key: Group; label: string; action: string }[] = [
    { key: 'fluent', label: 'Fluent', action: 'No action' },
    { key: 'slow', label: 'Slow', action: 'Right, but past the time: fluency practice' },
    { key: 'needs_strategy', label: 'Needs strategy', action: 'Strategy first' },
];

const FAMILY_WORD = { met: 'Met', not_met: 'Not met', not_judged: 'Not judged' } as const;

function day(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
}

/** One line saying what a year adds (DR-18); composed when the registry has none. */
export function yearLine(y: YearOption): string {
    if (y.description) return y.description;
    if (y.adds.length === 0) return 'adds nothing new: the same facts as the year before';
    return `adds ${y.adds.join(', ')}`;
}

export function verdictHead(c: ClassStat): string {
    if (c.verdict === 'not_enough') return 'Not enough results to judge the class.';
    if (c.verdict === 'below') return 'This class is below the fluency floor.';
    return 'This class is at or above the fluency floor.';
}

export default function FactsTeacher() {
    const { classId = '' } = useParams();
    const [params, setParams] = useSearchParams();
    const chosen = params.get('snapshot');
    const [overview, setOverview] = useState<ProbeOverview | null>(null);
    const [className, setClassName] = useState<string | null>(null);
    const [error, setError] = useState(false);

    const load = useCallback(async () => {
        try {
            setOverview(await fetchOverview(classId));
            setError(false);
        } catch {
            setError(true);
        }
    }, [classId]);

    useEffect(() => {
        void load();
        void listClasses()
            .then((all) => setClassName(all.find((c) => c.id === classId)?.name ?? null))
            .catch(() => setClassName(null));
    }, [load, classId]);

    const open = overview?.probes.find((p) => p.state === 'open') ?? null;
    const shownId = chosen ?? open?.id ?? null;

    let body: ReactNode;
    if (error && !overview) {
        body = (
            <div className="ft-panel">
                <p role="alert">Something went wrong loading this. Check your connection, then try again.</p>
                <button type="button" className="ft-btn" style={{ marginTop: 12 }} onClick={() => void load()}>
                    Try again
                </button>
            </div>
        );
    } else if (!overview) {
        body = (
            <div className="ft-panel" role="status">
                <p className="ft-muted">Loading…</p>
            </div>
        );
    } else if (shownId) {
        body = (
            <Snapshot
                key={shownId}
                probeId={shownId}
                // A snapshot that closes (by the teacher, or by the 7-day
                // rule) stays on screen as its RESULTS: select it, or the
                // refreshed overview would drop back to the open screen.
                onChanged={() => {
                    setParams({ snapshot: shownId });
                    void load();
                }}
                onBack={chosen ? () => setParams({}) : null}
            />
        );
    } else {
        body = (
            <>
                <OpenScreen
                    classId={classId}
                    overview={overview}
                    onOpened={() => {
                        setParams({});
                        void load();
                    }}
                />
                <Earlier overview={overview} onPick={(id) => setParams({ snapshot: id })} />
            </>
        );
    }

    return (
        <main className="ft-page">
            <div className="ft-wrap">
                <p className="ft-crumb">
                    <Link to="/classes">Classes</Link>
                    {className ? ` / ${className}` : ''}
                </p>
                <h1 className="ft-h1">Number facts snapshot</h1>
                {body}
            </div>
        </main>
    );
}

// ---- OPEN ------------------------------------------------------------------------

function OpenScreen({
    classId,
    overview,
    onOpened,
}: {
    classId: string;
    overview: ProbeOverview;
    onOpened: () => void;
}) {
    const [year, setYear] = useState<number | null>(null);
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState<string | null>(null);
    const picked = overview.years.find((y) => y.year === year) ?? null;

    const start = async () => {
        if (year === null) return;
        setBusy(true);
        setFailed(null);
        try {
            await openProbe(classId, year);
            onOpened();
        } catch (e) {
            const message = e instanceof Error ? e.message : '';
            setFailed(
                message.includes('probe_already_open')
                    ? 'A snapshot is already open for this class.'
                    : 'That did not start. Check your connection, then try again.',
            );
            setBusy(false);
        }
    };

    return (
        <div className="ft-panel">
            <h2>Run a snapshot with this class</h2>
            <p className="ft-muted">
                A short, timed check of number facts. Students answer on their own devices; it is
                not marked and they see no clock. You get a class reading against a fluency floor,
                and which students are fluent, slow or need strategy work.
            </p>
            {!overview.mirrored ? (
                <p className="ft-note" role="alert">
                    The fact lists have not been loaded yet, so a snapshot cannot be opened. They
                    are loaded by the platform&apos;s import run (pnpm import:batch with
                    --fact-registry).
                </p>
            ) : (
                <>
                    <fieldset style={{ border: 0, margin: '16px 0 0', padding: 0 }}>
                        <legend style={{ fontWeight: 600 }}>Which facts? Pick a year level.</legend>
                        {overview.years.map((y) => (
                            <label key={y.year} className="ft-year" {...(year === y.year ? { 'data-picked': '' } : {})}>
                                <input
                                    type="radio"
                                    name="facts-year"
                                    checked={year === y.year}
                                    onChange={() => setYear(y.year)}
                                />
                                <span>
                                    <strong>Facts up to Year {y.year}</strong>
                                    <span className="ft-muted ft-small" style={{ display: 'block' }}>
                                        {yearLine(y)}. {y.items} facts, {aboutMinutes(y.items).toLowerCase()}.
                                    </span>
                                </span>
                            </label>
                        ))}
                    </fieldset>
                    <p className="ft-muted ft-small" style={{ marginTop: 12 }}>
                        The year cannot be changed once the snapshot is open. It stays open for 7
                        days unless you close it.
                    </p>
                    {failed ? <p role="alert" style={{ marginTop: 8 }}>{failed}</p> : null}
                    <div className="ft-row" style={{ marginTop: 16 }}>
                        <button type="button" className="ft-btn-primary" disabled={picked === null || busy} onClick={() => void start()}>
                            {busy ? 'Opening…' : 'Open the snapshot'}
                        </button>
                        <Link to="/facts/demo" className="ft-btn" target="_blank" rel="noreferrer">
                            Try the demo first
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

function Earlier({ overview, onPick }: { overview: ProbeOverview; onPick: (id: string) => void }) {
    const closed = overview.probes.filter((p) => p.state === 'closed');
    return (
        <div className="ft-panel">
            <h2>Earlier snapshots</h2>
            {closed.length === 0 ? (
                <p className="ft-muted">No snapshot has been run with this class.</p>
            ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {closed.map((p) => (
                        <li key={p.id}>
                            <button type="button" className="ft-link" onClick={() => onPick(p.id)}>
                                {day(p.opened_at)} · Year {p.year_level} ·{' '}
                                {p.verdict === 'below'
                                    ? 'Below the floor'
                                    : p.verdict === 'at_or_above'
                                      ? 'At or above the floor'
                                      : 'Not enough results'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// ---- LIVE and RESULTS --------------------------------------------------------------

function Snapshot({
    probeId,
    onChanged,
    onBack,
}: {
    probeId: string;
    onChanged: () => void;
    onBack: (() => void) | null;
}) {
    const [data, setData] = useState<ProbeResults | null>(null);
    const [stale, setStale] = useState(false);
    const [failed, setFailed] = useState(false);
    const isOpen = data?.probe.state === 'open';
    const changedRef = useRef(onChanged);
    changedRef.current = onChanged;

    const read = useCallback(async () => {
        try {
            const next = await fetchResults(probeId);
            setData((prev) => {
                // It closed by itself (the 7-day rule): refresh the overview too.
                if (prev?.probe.state === 'open' && next.probe.state === 'closed') changedRef.current();
                return next;
            });
            setStale(false);
            setFailed(false);
        } catch {
            // Keep the last numbers and say so (DR-19).
            setStale(true);
            setFailed(true);
        }
    }, [probeId]);

    useEffect(() => {
        void read();
    }, [read]);

    // Poll while open and the tab is visible. Never while closed.
    useEffect(() => {
        if (!isOpen) return;
        const timer = window.setInterval(() => {
            if (document.visibilityState === 'visible') void read();
        }, LIVE_POLL_MS);
        return () => window.clearInterval(timer);
    }, [isOpen, read]);

    if (!data) {
        return (
            <div className="ft-panel" role={failed ? 'alert' : 'status'}>
                {failed ? (
                    <>
                        <p>Something went wrong loading this. Check your connection, then try again.</p>
                        <button type="button" className="ft-btn" style={{ marginTop: 12 }} onClick={() => void read()}>
                            Try again
                        </button>
                    </>
                ) : (
                    <p className="ft-muted">Loading…</p>
                )}
            </div>
        );
    }

    return isOpen ? (
        <Live
            data={data}
            stale={stale}
            onClosed={(next) => {
                setData((d) => (d ? { ...d, class: next, probe: { ...d.probe, state: 'closed', closed_at: new Date().toISOString() } } : d));
                void read();
                changedRef.current();
            }}
        />
    ) : (
        <Results data={data} onBack={onBack} />
    );
}

function Counts({ c, announce }: { c: ClassStat; announce?: boolean }) {
    return (
        <p className="ft-counts">
            In class {c.in_class} · Started {c.started} ·{' '}
            {/* Announced only when Finished changes, never on every poll. */}
            <span {...(announce ? { 'aria-live': 'polite' as const } : {})}>Finished {c.finished}</span>
        </p>
    );
}

function Live({
    data,
    stale,
    onClosed,
}: {
    data: ProbeResults;
    stale: boolean;
    onClosed: (c: ClassStat) => void;
}) {
    const [projector, setProjector] = useState(false);
    const [showNames, setShowNames] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [closing, setClosing] = useState(false);
    const [closeFailed, setCloseFailed] = useState(false);
    const link = factsLink(window.location.origin, data.probe.join_code).replace(/^https?:\/\//, '');
    const c = data.class;
    const working = c.started - c.finished;
    const notStarted = data.students.filter((s) => s.is_member && s.status === 'not_started');

    const close = async () => {
        setClosing(true);
        setCloseFailed(false);
        try {
            onClosed(await closeProbe(data.probe.id));
        } catch {
            setCloseFailed(true);
            setClosing(false);
        }
    };

    if (projector) {
        return (
            <div className="ft-projector">
                <p className="ft-muted">Go to this address and sign in with your school account</p>
                <p className="ft-linkbig">{link}</p>
                <Counts c={c} />
                <button type="button" className="ft-btn" onClick={() => setProjector(false)}>
                    Leave full screen
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="ft-panel">
                <h2>Open now · facts up to Year {data.probe.year_level}</h2>
                <p className="ft-muted ft-small">Students go to this address and sign in with their school account:</p>
                <p className="ft-linkbig">{link}</p>
                <div className="ft-row" style={{ marginTop: 12 }}>
                    <button type="button" className="ft-btn" onClick={() => setProjector(true)}>
                        Full screen for the board
                    </button>
                    <span className="ft-muted ft-small">
                        A student who is not in the class yet joins from this link.
                    </span>
                </div>
            </div>

            <div className="ft-panel">
                <h2>Progress</h2>
                <Counts c={c} announce />
                {stale ? (
                    <p className="ft-muted ft-small" role="status">
                        Couldn&apos;t refresh. Retrying.
                    </p>
                ) : null}
                {c.started === 0 ? (
                    <p className="ft-muted ft-small">
                        Nobody has started yet. Students join the class first if they are not in it.
                    </p>
                ) : null}
                <button
                    type="button"
                    className="ft-link"
                    aria-expanded={showNames}
                    onClick={() => setShowNames((v) => !v)}
                >
                    {showNames ? 'Hide who has not started' : 'Show who has not started'}
                </button>
                {showNames ? (
                    notStarted.length === 0 ? (
                        <p className="ft-small">Everyone in the class has started.</p>
                    ) : (
                        <ul className="ft-fams" aria-label="Not started">
                            {notStarted.map((s) => (
                                <li key={s.student_id}>{s.name}</li>
                            ))}
                        </ul>
                    )
                ) : null}
                <div className="ft-row" style={{ marginTop: 16 }}>
                    <button type="button" className="ft-btn" onClick={() => setConfirming(true)}>
                        Close the snapshot…
                    </button>
                    <span className="ft-muted ft-small">
                        It closes by itself on {day(data.probe.closes_at)}.
                    </span>
                </div>
            </div>

            {confirming ? (
                <div className="ft-dialog-backdrop">
                    <div className="ft-dialog" role="alertdialog" aria-modal="true" aria-labelledby="ft-close-title">
                        <h2 id="ft-close-title" style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
                            Close this snapshot?
                        </h2>
                        <p style={{ marginTop: 8 }}>
                            {working > 0
                                ? `${working} student${working === 1 ? ' is' : 's are'} still working. Their answers so far are kept.`
                                : 'Nobody is part-way through.'}{' '}
                            It cannot be reopened; you would open a new one.
                        </p>
                        {closeFailed ? <p role="alert">That did not close. Try again.</p> : null}
                        <div className="ft-row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
                            <button type="button" className="ft-btn" disabled={closing} onClick={() => void close()}>
                                {closing ? 'Closing…' : 'Close it'}
                            </button>
                            <button type="button" className="ft-btn-primary" autoFocus onClick={() => setConfirming(false)}>
                                Keep it open
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}

function runWord(s: StudentRow, total: number): string {
    if (s.status === 'not_started') return 'Did not start';
    if (!s.has_rate) return 'Too little to measure';
    if (s.status === 'finished') return 'Finished';
    return `Stopped at ${s.done} of ${total}`;
}

/** The results screen. Exported so the public demo can show it on invented
 *  data (DR-4): the SAME component a teacher sees, never a look-alike. */
export function Results({
    data,
    onBack,
    backLabel = '← All snapshots',
}: {
    data: ProbeResults;
    onBack: (() => void) | null;
    backLabel?: string;
}) {
    const c = data.class;
    const total = data.probe.item_count;
    const [showGroups, setShowGroups] = useState(false);
    const [showStudents, setShowStudents] = useState(false);
    const [slowestFirst, setSlowestFirst] = useState(false);
    const [openRow, setOpenRow] = useState<string | null>(null);
    const members = data.students.filter((s) => s.is_member || s.status !== 'not_started');
    const rows = slowestFirst
        ? [...members].sort((a, b) => (a.rate ?? Infinity) - (b.rate ?? Infinity))
        : members;

    return (
        <>
            {onBack ? (
                <button type="button" className="ft-link" onClick={onBack}>
                    {backLabel}
                </button>
            ) : null}
            <p className="ft-muted ft-small" style={{ marginTop: 8 }}>
                Facts up to Year {data.probe.year_level} · opened {day(data.probe.opened_at)} ·{' '}
                {data.probe.auto_closed
                    ? `closed automatically on ${day(data.probe.closed_at ?? data.probe.closes_at)}`
                    : `closed ${day(data.probe.closed_at ?? data.probe.closes_at)}`}
            </p>

            <div className="ft-verdict" data-verdict={c.verdict}>
                <p className="ft-verdict-head">
                    <span aria-hidden="true">{c.verdict === 'below' ? '▼ ' : c.verdict === 'at_or_above' ? '● ' : '○ '}</span>
                    {verdictHead(c)}
                </p>
                {c.started === 0 ? (
                    <p style={{ marginTop: 6 }}>No one started this snapshot.</p>
                ) : c.verdict === 'not_enough' ? (
                    <p style={{ marginTop: 6 }}>
                        {c.with_rate} student{c.with_rate === 1 ? ' has' : 's have'} a result;{' '}
                        {c.min_students} are needed.
                    </p>
                ) : (
                    <>
                        <p style={{ marginTop: 6 }}>
                            {c.verdict === 'below'
                                ? 'A daily 5-minute facts sprint is recommended.'
                                : 'No daily sprint is needed.'}
                        </p>
                        <p style={{ marginTop: 6 }}>
                            Class median: {c.median_rate} correct a minute. Floor: {c.floor}. Based on{' '}
                            {c.with_rate} of {c.in_class} students
                            {c.left_out > 0 ? `; ${c.left_out} had too little to measure` : ''}.
                        </p>
                        {c.verdict === 'below' ? (
                            <p className="ft-note">
                                The fluency sprint is not in this app yet. Until it is, use paper or
                                another fact-fluency tool for about 5 minutes a day.
                            </p>
                        ) : null}
                    </>
                )}
                <p className="ft-muted ft-small" style={{ marginTop: 10 }}>
                    Timing is not a fair reading for a student who uses a screen reader or switch
                    access: the clock starts before speech finishes.
                </p>
            </div>

            <div className="ft-panel">
                <h2>Who needs what</h2>
                <p className="ft-muted ft-small">
                    Fluent {c.groups.fluent} · Slow {c.groups.slow} · Needs strategy {c.groups.needs_strategy}
                </p>
                <button type="button" className="ft-link" aria-expanded={showGroups} onClick={() => setShowGroups((v) => !v)}>
                    {showGroups ? 'Hide names' : 'Show names'}
                </button>
                {showGroups ? (
                    <div className="ft-groups">
                        {GROUPS.map((g) => {
                            const inGroup = data.students.filter((s) => s.is_member && s.group === g.key);
                            return (
                                <section key={g.key} className="ft-group" aria-label={g.label}>
                                    <h3>
                                        {g.label} ({inGroup.length})
                                    </h3>
                                    <p className="ft-muted ft-small">{g.action}</p>
                                    <ul>
                                        {inGroup.map((s) => (
                                            <li key={s.student_id}>
                                                {s.name}
                                                {s.typing_flag ? (
                                                    <span className="ft-muted ft-small"> — typing speed could not be fully allowed for</span>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            );
                        })}
                    </div>
                ) : null}
            </div>

            <div className="ft-panel">
                <h2>Each student</h2>
                <div className="ft-row">
                    <button type="button" className="ft-link" aria-expanded={showStudents} onClick={() => setShowStudents((v) => !v)}>
                        {showStudents ? 'Hide students' : 'Show students'}
                    </button>
                    {showStudents ? (
                        <label className="ft-small">
                            <input type="checkbox" checked={slowestFirst} onChange={(e) => setSlowestFirst(e.target.checked)} />{' '}
                            Slowest first
                        </label>
                    ) : null}
                </div>
                {showStudents ? (
                    <div className="ft-tablewrap">
                        <table className="ft-table">
                            <thead>
                                <tr>
                                    <th scope="col">Student</th>
                                    <th scope="col" className="ft-num">Per minute</th>
                                    <th scope="col" className="ft-num">Right</th>
                                    <th scope="col" className="ft-num">Quick and right</th>
                                    <th scope="col" className="ft-num">Skipped</th>
                                    <th scope="col">Run</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((s) => (
                                    <StudentRows
                                        key={s.student_id}
                                        s={s}
                                        total={total}
                                        open={openRow === s.student_id}
                                        onToggle={() => setOpenRow((id) => (id === s.student_id ? null : s.student_id))}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </div>
        </>
    );
}

function StudentRows({
    s,
    total,
    open,
    onToggle,
}: {
    s: StudentRow;
    total: number;
    open: boolean;
    onToggle: () => void;
}) {
    const started = s.status !== 'not_started';
    return (
        <>
            <tr>
                <th scope="row" style={{ fontWeight: 500 }}>
                    {started ? (
                        <button type="button" className="ft-link" style={{ minHeight: 0, padding: 0 }} aria-expanded={open} onClick={onToggle}>
                            {s.name}
                        </button>
                    ) : (
                        s.name
                    )}
                    {!s.is_member ? <span className="ft-muted ft-small"> (left the class)</span> : null}
                </th>
                <td className="ft-num">{s.has_rate ? s.rate : '—'}</td>
                <td className="ft-num">{started ? s.right : '—'}</td>
                <td className="ft-num">{started ? s.met : '—'}</td>
                <td className="ft-num">{started ? s.skipped : '—'}</td>
                <td>
                    {runWord(s, total)}
                    {s.typing_flag ? (
                        <span className="ft-muted ft-small" style={{ display: 'block' }}>
                            Typing speed could not be fully allowed for
                        </span>
                    ) : null}
                </td>
            </tr>
            {open ? (
                <tr>
                    <td colSpan={6}>
                        <ul className="ft-fams">
                            {s.families.map((f) => (
                                <li key={f.family_id}>
                                    <strong>{f.name}:</strong> {FAMILY_WORD[f.status]}
                                    <span className="ft-muted">
                                        {' '}
                                        ({f.met} of {f.counted} quick and right)
                                    </span>
                                </li>
                            ))}
                        </ul>
                        {s.not_counted > 0 ? (
                            <p className="ft-muted ft-small" style={{ marginTop: 6 }}>
                                {s.not_counted} not counted (left the page).
                            </p>
                        ) : null}
                    </td>
                </tr>
            ) : null}
        </>
    );
}
