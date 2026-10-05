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
//            The class's school-year end is asked here the first time
//            (0048, RP-1/RP-2): prefilled from a guess, confirmed by the teacher.
//   RESULTS  the verdict as a sentence, the two numbers and who was left out,
//            the stopgap line; then "Who needs what" — a table of fact
//            families by label (per-family grouping, ruled 2026-10-05) — and
//            each student, with names CLOSED on first view: a name is not in
//            the DOM until its disclosure is opened (DR-21, DR-22). Under the
//            verdict: until when students' answers are kept, or, once the
//            prune has run, that they were removed, and NO student panels
//            (0048, RP-6).
//
// Every number is the server's (fact_probe_results); this file formats it.
// =============================================================================

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { listClasses } from '../lib/classes';
import {
    closeProbe,
    factsLink,
    familyLabel,
    fetchOverview,
    fetchResults,
    openProbe,
    setClassYearEnd,
    type ClassStat,
    type FamilyLabel,
    type ProbeOverview,
    type ProbeResults,
    type StudentRow,
    type YearOption,
} from '../lib/factProbe';
import { aboutMinutes } from '../practice/minutes';
import '../practice/factsTeacher.css';

export const LIVE_POLL_MS = 5000;

/** The per-family labels (the author's ruling of 2026-10-05; migration 0046).
 *  Each fact family is judged on its own questions; there is no single label
 *  for a student. */
const LABELS: { key: FamilyLabel; label: string; action: string }[] = [
    { key: 'needs_strategy', label: 'Needs strategy', action: 'Too many wrong: strategy first' },
    { key: 'slow', label: 'Slow', action: 'Right, but past the time: fluency practice' },
    { key: 'fluent', label: 'Fluent', action: 'No action' },
];

const LABEL_WORD: Record<FamilyLabel, string> = {
    fluent: 'Fluent',
    slow: 'Slow',
    needs_strategy: 'Needs strategy',
    not_met: 'Not met',
    not_judged: 'Not judged',
};

/** Whole percent, rounded DOWN, so 58 of 65 reads 89% and never a flattering 90%. */
const pct = (part: number, whole: number) => (whole > 0 ? Math.floor((part / whole) * 100) : 0);

/** "9 fluent · 2 slow · 1 needs strategy · 1 not judged", zero counts left out. */
export function familySummary(s: StudentRow): string {
    const counts = new Map<FamilyLabel, number>();
    for (const f of s.families) counts.set(familyLabel(f), (counts.get(familyLabel(f)) ?? 0) + 1);
    const order: FamilyLabel[] = ['fluent', 'slow', 'needs_strategy', 'not_met', 'not_judged'];
    return order
        .filter((k) => (counts.get(k) ?? 0) > 0)
        .map((k) => `${counts.get(k)} ${LABEL_WORD[k].toLowerCase()}`)
        .join(' · ');
}

function day(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
}

/** A DATE (yyyy-mm-dd) as a local calendar day. `new Date('2027-12-17')` is
 *  UTC midnight, which reads as the 16th west of Greenwich. */
function localDay(date: string): Date {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** "17 December 2027": a date the year matters for. A timestamp is read as
 *  the local day it falls on. */
export function longDay(dateOrIso: string): string {
    const when = dateOrIso.length > 10 ? new Date(dateOrIso) : localDay(dateOrIso);
    return when.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

function isoDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** The furthest end date the server accepts (set_class_year_end, RP-8). */
export const YEAR_END_MAX_DAYS = 400;

/** A FIRST GUESS at the school-year end, for the teacher to confirm (RP-2):
 *  NZ and Australia end in mid-December, most northern-hemisphere schools in
 *  late June. Only ever a prefill; the stored date is the teacher's. */
export function guessYearEnd(today: Date, timeZone: string): string {
    const south = /^(Pacific\/(Auckland|Chatham)|Australia\/|Antarctica\/McMurdo)/.test(timeZone);
    const [month, dayOfMonth] = south ? [11, 18] : [5, 30];
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const guess = new Date(today.getFullYear(), month, dayOfMonth);
    return isoDate(guess < start ? new Date(today.getFullYear() + 1, month, dayOfMonth) : guess);
}

/** Today and today + 400 days, the date input's bounds. */
function yearEndBounds(today: Date): { min: string; max: string } {
    const max = new Date(today.getFullYear(), today.getMonth(), today.getDate() + YEAR_END_MAX_DAYS);
    return { min: isoDate(today), max: isoDate(max) };
}

/** One line saying what a year adds (DR-18); composed when the registry has none. */
export function yearLine(y: YearOption): string {
    if (y.description) return y.description;
    if (y.adds.length === 0) return 'adds nothing new: the same facts as the year before';
    return `adds ${y.adds.join(', ')}`;
}

/** "40 facts, about 7 minutes" or "82 facts in two parts (42 + 40), each
 *  about 7 minutes, with a break between" (a long check, migration 0047). */
export function yearLength(y: YearOption): string {
    const parts = y.parts ?? [];
    if (parts.length < 2) return `${y.items} facts, ${aboutMinutes(y.items).toLowerCase()}`;
    const longest = Math.max(...parts);
    return (
        `${y.items} facts in two parts (${parts.join(' + ')}), each ` +
        `${aboutMinutes(longest).toLowerCase()} or less, with a break between`
    );
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
    const bounds = yearEndBounds(new Date());
    const stored = overview.school_year_ends_on;
    const storedUsable = stored !== null && stored >= bounds.min;
    // The field shows when there is no usable date or the teacher asks to
    // change it; it starts at the stored date or a guess (RP-2).
    const [editingEnd, setEditingEnd] = useState(!storedUsable);
    const [endsOn, setEndsOn] = useState(() =>
        storedUsable ? stored : guessYearEnd(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone),
    );
    const endValid = endsOn >= bounds.min && endsOn <= bounds.max;

    const start = async () => {
        if (year === null || (editingEnd && !endValid)) return;
        setBusy(true);
        setFailed(null);
        try {
            if (editingEnd) await setClassYearEnd(classId, endsOn);
            await openProbe(classId, year);
            onOpened();
        } catch (e) {
            const message = e instanceof Error ? e.message : '';
            setFailed(
                message.includes('probe_already_open')
                    ? 'A snapshot is already open for this class.'
                    : message.includes('year_end_out_of_range')
                      ? `Pick an end date between today and ${longDay(bounds.max)}.`
                      : message.includes('school_year_end')
                        ? 'Give the date this class’s school year ends, then open the snapshot.'
                        : 'That did not start. Check your connection, then try again.',
            );
            if (message.includes('school_year_end')) setEditingEnd(true);
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
                                        {yearLine(y)}. {yearLength(y)}.
                                    </span>
                                </span>
                            </label>
                        ))}
                    </fieldset>
                    <p className="ft-muted ft-small" style={{ marginTop: 12 }}>
                        The year cannot be changed once the snapshot is open. It stays open for 7
                        days unless you close it.
                    </p>
                    <div className="ft-yearend" data-testid="ft-year-end">
                        {editingEnd ? (
                            <label>
                                <strong style={{ display: 'block' }}>When does this class’s school year end?</strong>
                                <input
                                    type="date"
                                    className="ft-date"
                                    value={endsOn}
                                    min={bounds.min}
                                    max={bounds.max}
                                    required
                                    aria-invalid={!endValid}
                                    onChange={(e) => setEndsOn(e.target.value)}
                                />
                            </label>
                        ) : (
                            <p>
                                This class’s school year ends on <strong>{longDay(endsOn)}</strong>.{' '}
                                <button type="button" className="ft-link" onClick={() => setEditingEnd(true)}>
                                    Change
                                </button>
                            </p>
                        )}
                        <p className="ft-muted ft-small">
                            Students’ answers and timings are removed 30 days after the school year
                            ends. The class result is kept.
                        </p>
                    </div>
                    {failed ? <p role="alert" style={{ marginTop: 8 }}>{failed}</p> : null}
                    <div className="ft-row" style={{ marginTop: 16 }}>
                        <button type="button" className="ft-btn-primary" disabled={picked === null || busy || (editingEnd && !endValid)} onClick={() => void start()}>
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
                                {p.pruned_at ? ' · student results removed' : ''}
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
    // Students who started, per family and label (members only, like the class numbers).
    const started = data.students.filter((s) => s.is_member && s.status !== 'not_started');
    const familyNames = started[0]?.families.map((f) => ({ id: f.family_id, name: f.name })) ?? [];
    const inCell = (familyId: string, label: FamilyLabel) =>
        started.filter((s) => {
            const f = s.families.find((x) => x.family_id === familyId);
            return f !== undefined && familyLabel(f) === label;
        });
    const [showStudents, setShowStudents] = useState(false);
    const [slowestFirst, setSlowestFirst] = useState(false);
    const [openRow, setOpenRow] = useState<string | null>(null);
    const members = data.students.filter((s) => s.is_member || s.status !== 'not_started');
    const pruned = data.probe.pruned_at ?? null;
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
                {data.probe.state === 'closed' && !pruned && data.probe.keep_until ? (
                    <p className="ft-muted ft-small" style={{ marginTop: 6 }} data-testid="ft-keep-until">
                        Students’ answers and timings are kept until {longDay(data.probe.keep_until)},
                        then removed. This class result is kept.
                    </p>
                ) : null}
            </div>

            {pruned ? (
                <div className="ft-panel" data-testid="ft-pruned">
                    <h2>Student results removed</h2>
                    <p>
                        Students’ answers and timings from this snapshot were removed on{' '}
                        {longDay(pruned)}, when the time for keeping them ended. The class result
                        above is kept.
                    </p>
                </div>
            ) : (
                <>
                    <div className="ft-panel">
                        <h2>Who needs what</h2>
                        <p className="ft-muted ft-small">
                            Each fact family is judged on its own questions. Accuracy comes first: too
                            many wrong in a family is &quot;needs strategy&quot; however quick the
                            student is. Otherwise it is how many they got quick and right.
                        </p>
                        {familyNames.length === 0 ? (
                            <p className="ft-small" style={{ marginTop: 8 }}>No one has answered yet.</p>
                        ) : (
                            <>
                                <button type="button" className="ft-link" aria-expanded={showGroups} onClick={() => setShowGroups((v) => !v)}>
                                    {showGroups ? 'Hide names' : 'Show names'}
                                </button>
                                <div className="ft-tablewrap">
                                    <table className="ft-table">
                                        <thead>
                                            <tr>
                                                <th scope="col">Fact family</th>
                                                {LABELS.map((l) => (
                                                    <th scope="col" key={l.key}>
                                                        {l.label}
                                                        <span className="ft-muted ft-small" style={{ display: 'block', fontWeight: 400 }}>
                                                            {l.action}
                                                        </span>
                                                    </th>
                                                ))}
                                                <th scope="col">Not judged</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {familyNames.map((fam) => (
                                                <tr key={fam.id}>
                                                    <th scope="row" style={{ fontWeight: 500 }}>{fam.name}</th>
                                                    {[...LABELS.map((l) => l.key), 'not_judged' as const].map((label) => {
                                                        // A database without 0046 cannot split "not met":
                                                        // those students are shown under Slow's column
                                                        // header as "not met" rather than guessed.
                                                        const here = [
                                                            ...inCell(fam.id, label),
                                                            ...(label === 'slow' ? inCell(fam.id, 'not_met') : []),
                                                        ];
                                                        return (
                                                            <td key={label}>
                                                                {here.length}
                                                                {showGroups && here.length > 0 ? (
                                                                    <ul className="ft-names">
                                                                        {here.map((s) => {
                                                                            const f = s.families.find((x) => x.family_id === fam.id)!;
                                                                            return (
                                                                                <li key={s.student_id}>
                                                                                    {s.name}
                                                                                    {f.right !== undefined ? (
                                                                                        <span className="ft-muted ft-small">
                                                                                            {' '}
                                                                                            ({f.right} of {f.counted} right, {f.met} quick)
                                                                                        </span>
                                                                                    ) : null}
                                                                                </li>
                                                                            );
                                                                        })}
                                                                    </ul>
                                                                ) : null}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
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
                                            <th scope="col">Fact families</th>
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
            )}
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
                <td>{started ? familySummary(s) : '—'}</td>
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
                    <td colSpan={7}>
                        <ul className="ft-fams">
                            {s.families.map((f) => (
                                <li key={f.family_id}>
                                    <strong>{f.name}:</strong> {LABEL_WORD[familyLabel(f)]}
                                    <span className="ft-muted">
                                        {' '}
                                        ({f.right !== undefined ? `${f.right} of ${f.counted} right, ` : ''}
                                        {f.met}
                                        {f.right !== undefined ? '' : ` of ${f.counted}`} quick and right)
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="ft-muted ft-small" style={{ marginTop: 6 }}>
                            {s.right} of {s.counted} right ({pct(s.right, s.counted)}%);{' '}
                            {s.counted - s.right - s.skipped} wrong or too slow to count; {s.skipped}{' '}
                            skipped.
                            {s.not_counted > 0 ? ` ${s.not_counted} not counted (left the page).` : ''}
                        </p>
                    </td>
                </tr>
            ) : null}
        </>
    );
}
