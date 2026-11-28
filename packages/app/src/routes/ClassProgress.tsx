// =============================================================================
// ClassProgress.tsx — /classes/:classId/progress, the class grid (CP-1, CP-2)
// -----------------------------------------------------------------------------
// docs/design/class-progress-view.md. Rows = the class's LIVE roster, by name
// (or Least done first, DR-7); columns = its assigned activities, newest first.
// Three Stat cards, then the controls line, then the grid: each column header
// carries "N done · N started · N not started" and each row ends "done N of M"
// (DR-1). Cells are glyph + words (DR-9): — not started · ◐ 2/5 · ● Done 80% ·
// Started · ? (checked before totals were recorded) · an "older" tag (CP-6) ·
// an amber "N to grade" chip to Responses (CP-7, DR-8). Common misconceptions
// sit BELOW the grid (DR-3). A cell with work opens the answer panel, a child
// route (DR-5). Hide names takes names out of the DOM entirely (CP-5, DR-10).
//
// Every scope rule is 0061's (verify-0061); this file formats.
// =============================================================================

void import('../lib/clientErrors'); // the teacher-only error log, loaded beside the page (review C5 slice 4)
import { fullDateTime } from '../lib/dates';
import { dueWords, fetchClassDue, isPastDue, type ClassDue } from '../lib/dueDates';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { leaveOut } from '../lib/loadFailure';
import { gradebookCsv, gradebookFileName } from '../lib/progressCsv';
import { fetchClassGradebook } from '../lib/gradebook';
import { Link, Outlet, useLocation, useParams } from 'react-router';
import {
    cellStatus,
    cellWords,
    fetchClassProgress,
    fetchMisconceptions,
    leastDoneFirst,
    lastCheckAgo,
    pseudonyms,
    responsesHref,
    tally,
    studentLastCheck,
    tallyWords,
    type CellStatus,
    type ClassMisconceptions,
    type ClassProgress as ClassProgressData,
    type ProgressCell,
} from '../lib/classProgress';
import {
    Controls,
    PROGRESS_REFUSED,
    RefreshLine,
    Stat,
    lastCheckWords,
    useHideNames,
    useLeastDoneFirst,
    type ProgressOutletContext,
} from '../progress/common';
import LoadStatus from '../components/LoadStatus';
import { useLoad, type LoadState } from '../lib/useLoad';
import MisconceptionPanel from '../progress/MisconceptionPanel';
import { HelpStrip, useClassHelp } from '../progress/HelpStrip';
import '../styles/teacherTable.css';
import '../progress/progress.css';

interface Loaded {
    grid: ClassProgressData;
    /** null when the misconception read failed: the grid still shows. */
    mis: ClassMisconceptions | null;
}

export default function ClassProgress() {
    const { classId = '', studentId, activityId } = useParams();
    const location = useLocation();
    const base = `/classes/${classId}/progress`;
    const loaded = useLoad<Loaded>(['classProgress', classId], async () => {
        const [grid, mis] = await Promise.all([
            fetchClassProgress(classId),
            fetchMisconceptions(classId).catch(leaveOut('misconceptions')), // the grid shows without it
        ]);
        return { grid, mis };
    });
    // DD-4: the class's due dates load BESIDE the grid, never in its way — a
    // slow or failed read only means the labels arrive late or not at all.
    const [due, setDue] = useState<ClassDue | null>(null);
    const gridLoadedAt = loaded.data?.grid;
    useEffect(() => {
        if (!gridLoadedAt) return;
        let live = true;
        fetchClassDue(classId).then(
            (d) => {
                if (live) setDue(d);
            },
            leaveOut('classDue'), // no due line
        );
        return () => {
            live = false;
        };
    }, [classId, gridLoadedAt]);
    const [hideNames, setHideNames] = useHideNames();
    const [leastDone, setLeastDone] = useLeastDoneFirst();
    // S9: who is asking for help right now (polled; HelpStrip.tsx).
    const { help, done: endHelpRequest } = useClassHelp(classId);
    const asking = useMemo(
        () => new Set((help?.requests ?? []).map((r) => `${r.studentId}:${r.activityId}`)),
        [help],
    );

    const data = loaded.data?.grid ?? null;
    const alias = useMemo(() => pseudonyms(data?.students ?? []), [data]);
    const nameOf = useCallback(
        (sid: string, name: string) => (hideNames ? (alias.get(sid) ?? 'Student') : name),
        [hideNames, alias],
    );

    // Focus returns to the cell that opened the panel (DR-5).
    const lastOpened = useRef<string | null>(null);
    const panelOpen = Boolean(studentId && activityId);
    useEffect(() => {
        if (panelOpen) {
            lastOpened.current = `${studentId}:${activityId}`;
        } else if (lastOpened.current) {
            const key = lastOpened.current;
            lastOpened.current = null;
            document.querySelector<HTMLElement>(`[data-cell="${CSS.escape(key)}"]`)?.focus();
        }
    }, [panelOpen, studentId, activityId]);

    const outlet: ProgressOutletContext = { hideNames, nameOf, classId, closeTo: base };

    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            <p className="text-sm text-muted">
                <Link to="/classes" className="underline underline-offset-2 hover:text-strong">
                    Classes
                </Link>
                {data ? ` / ${data.class.name}` : ''}
            </p>
            <h1 className="mb-4 text-xl font-semibold text-ink" tabIndex={-1}>Class progress</h1>
            <HelpStrip help={help} onDone={endHelpRequest} nameOf={nameOf} />
            <Body
                asking={asking}
                loaded={loaded}
                due={due}
                hideNames={hideNames}
                setHideNames={setHideNames}
                leastDone={leastDone}
                setLeastDone={setLeastDone}
                nameOf={nameOf}
                base={base}
                selected={panelOpen ? `${studentId}:${activityId}` : null}
                here={location.pathname}
            />
            <Outlet context={outlet} />
        </main>
    );
}

function Body({
    asking,
    loaded,
    due,
    hideNames,
    setHideNames,
    leastDone,
    setLeastDone,
    nameOf,
    base,
    selected,
    here,
}: {
    /** S9: `student:activity` keys with an open help request. */
    asking: ReadonlySet<string>;
    loaded: LoadState<Loaded>;
    /** DD-4: null until (or unless) the due read lands. */
    due: ClassDue | null;
    hideNames: boolean;
    setHideNames: (on: boolean) => void;
    leastDone: boolean;
    setLeastDone: (on: boolean) => void;
    nameOf: (sid: string, name: string) => string;
    base: string;
    selected: string | null;
    here: string;
}) {
    const [copied, setCopied] = useState(false);
    if (!loaded.data) {
        return <LoadStatus state={loaded} what="progress" refusedText={PROGRESS_REFUSED} />;
    }
    const { grid, mis } = loaded.data;
    const dueOf = (aid: string) => due?.byActivity.get(aid) ?? null;
    const today = due?.today ?? null;

    if (grid.students.length === 0) {
        return (
            <div className="rounded-lg border border-line bg-canvas p-4">
                <p className="font-medium text-ink">No students yet</p>
                <p className="mt-1 text-sm text-muted">
                    Students join with the class code{' '}
                    <span className="cp-mono text-base text-ink">{grid.class.join_code}</span>
                    <button
                        type="button"
                        className="ml-3 min-h-[44px] rounded-md border border-line-strong bg-canvas px-3 text-sm font-medium text-strong hover:bg-surface"
                        onClick={() => {
                            void navigator.clipboard?.writeText(grid.class.join_code).then(
                                () => setCopied(true),
                                () => setCopied(false),
                            );
                        }}
                    >
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </p>
                <RefreshLine loaded={loaded} />
            </div>
        );
    }
    if (grid.activities.length === 0) {
        return (
            <div className="rounded-lg border border-line bg-canvas p-4">
                <p className="font-medium text-ink">Nothing assigned yet</p>
                <p className="mt-1 text-sm text-muted">
                    Add activities to this class from{' '}
                    <Link to="/activities" className="text-strong underline underline-offset-2">
                        Activities
                    </Link>
                    .
                </p>
                <RefreshLine loaded={loaded} />
            </div>
        );
    }

    const cellOf = new Map<string, ProgressCell>();
    for (const c of grid.cells) cellOf.set(`${c.student_id}:${c.activity_id}`, c);
    const statusOf = (sid: string, aid: string) => cellStatus(cellOf.get(`${sid}:${aid}`));
    const rowTally = (sid: string) => tally(grid.activities.map((a) => statusOf(sid, a.activity_id)));
    const students = leastDone ? leastDoneFirst(grid.students, (s) => rowTally(s.student_id)) : grid.students;

    return (
        <>
            <section className="mb-4 grid grid-cols-3 gap-3">
                <Stat label="Activities assigned" value={String(grid.activities.length)} />
                <Stat label="Students" value={String(grid.students.length)} />
                <Stat label="Last check" value={lastCheckWords(grid.last_check_at)} />
            </section>
            <Controls
                hideNames={hideNames}
                onHideNames={setHideNames}
                leastDone={leastDone}
                onLeastDone={setLeastDone}
                loaded={loaded}
            />
            {/* E-1 (ui-review-group-e.md), extended by gradebook-export.md:
                the grid plus the marks as a spreadsheet. Names (and emails,
                GB-8) are included even while "hide names" is on: that switch
                is for a projector, and a download goes to the teacher's own
                machine. */}
            <DownloadGradebook grid={grid} due={due} />
            {grid.cells.length === 0 && (
                <p className="mb-3 text-sm text-muted">No one has checked any work yet.</p>
            )}
            <div className="cp-scroller">
                <table className="ft-table cp-grid">
                    <caption className="sr-only">
                        Each student's progress on each assigned activity, newest activity first
                    </caption>
                    <thead>
                        <tr>
                            <th scope="col">Student</th>
                            {grid.activities.map((a) => {
                                const t = tally(grid.students.map((s) => statusOf(s.student_id, a.activity_id)));
                                return (
                                    <th key={a.activity_id} scope="col" className="cp-colhead">
                                        <span className="cp-clamp">{a.title}</span>
                                        <span className="cp-counts">{tallyWords(t)}</span>
                                        {dueOf(a.activity_id) && today && (
                                            <span className="cp-due" data-due-head>
                                                Due {dueWords(dueOf(a.activity_id)!, today)}
                                            </span>
                                        )}
                                    </th>
                                );
                            })}
                            <th scope="col" className="cp-rowtotal">
                                Done
                            </th>
                            {/* Who has gone quiet, at a glance: the newest check
                                on anything this class was set. */}
                            <th scope="col" className="cp-rowtotal">
                                Last check
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => {
                            const name = nameOf(s.student_id, s.name);
                            const t = rowTally(s.student_id);
                            return (
                                <tr key={s.student_id}>
                                    <th scope="row" {...(hideNames ? {} : { title: s.name })}>
                                        {name}
                                    </th>
                                    {grid.activities.map((a) => (
                                        <td key={a.activity_id}>
                                            <Cell
                                                status={statusOf(s.student_id, a.activity_id)}
                                                cell={cellOf.get(`${s.student_id}:${a.activity_id}`) ?? null}
                                                name={name}
                                                title={a.title}
                                                href={`${base}/${s.student_id}/${a.activity_id}`}
                                                cellKey={`${s.student_id}:${a.activity_id}`}
                                                selected={selected === `${s.student_id}:${a.activity_id}`}
                                                gradeHref={responsesHref(a.activity_id, here)}
                                                pastDue={isPastDue(dueOf(a.activity_id), today)}
                                            />
                                            {asking.has(`${s.student_id}:${a.activity_id}`) ? (
                                                <span className="cp-asking" data-asking>
                                                    Asking
                                                </span>
                                            ) : null}
                                        </td>
                                    ))}
                                    <td className="cp-rowtotal">
                                        done {t.done} of {grid.activities.length}
                                    </td>
                                    <td className="cp-rowtotal" data-last-check>
                                        {(() => {
                                            const at = studentLastCheck(grid.cells, s.student_id);
                                            return at ? (
                                                <time dateTime={at} title={fullDateTime(at)}>
                                                    {lastCheckAgo(at)}
                                                </time>
                                            ) : (
                                                lastCheckAgo(null)
                                            );
                                        })()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {mis === null ? (
                <p className="mt-8 text-sm text-muted">Couldn't load the misconception summary. Press Refresh to try again.</p>
            ) : (
                <MisconceptionPanel
                    rows={mis.misconceptions}
                    showActivities
                    nameOf={nameOf}
                    studentHref={(sid, aid) => `${base}/${sid}/${aid}`}
                />
            )}
            <p className="mt-6 text-xs text-muted">
                Hide names replaces names only; answers still show, so check the screen before projecting it.
            </p>
        </>
    );
}

/** One grid cell (DR-9 glyph + words; DR-10 a button named in full, or plain
 * "not started" text when there is no work). */
export function Cell({
    status,
    cell,
    name,
    title,
    href,
    cellKey,
    selected,
    gradeHref,
    pastDue = false,
}: {
    status: CellStatus;
    cell: { to_grade: number } | null;
    name: string;
    title: string;
    href: string;
    cellKey: string;
    selected: boolean;
    gradeHref: string;
    /** DD-4: the due date has passed and this cell isn't done. A quiet glyph
     *  on screen, words for a screen reader; never on a done cell. */
    pastDue?: boolean;
}) {
    const late = pastDue && status.kind !== 'done';
    const lateMark = late ? (
        <span className="cp-pastdue" title="Not done by the due date" data-past-due>
            <span aria-hidden="true">◷</span>
        </span>
    ) : null;
    if (status.kind === 'none') {
        return (
            <span className="cp-none">
                <span aria-hidden="true">—</span>
                <span className="sr-only">{late ? 'not started, not done by the due date' : 'not started'}</span>
                {lateMark}
            </span>
        );
    }
    const toGrade = cell?.to_grade ?? 0;
    return (
        <>
            <Link
                to={href}
                className={`cp-cell${status.kind === 'done' ? ' cp-done' : ''}`}
                data-cell={cellKey}
                data-current={selected ? 'true' : undefined}
                aria-label={`${name}, ${title}: ${cellWords(status)}${late ? ', not done by the due date' : ''}`}
                {...(status.kind === 'started_unknown' ? { title: 'Checked before progress totals were recorded' } : {})}
            >
                <CellFace status={status} />
                {lateMark}
            </Link>
            {toGrade > 0 && (
                <Link to={gradeHref} className="cp-chip">
                    <span aria-hidden="true">{toGrade} to grade</span>
                    <span className="sr-only">
                        {toGrade} to grade in {title}
                    </span>
                </Link>
            )}
        </>
    );
}

function CellFace({ status }: { status: CellStatus }) {
    const older = status.older ? <span className="cp-older">older</span> : null;
    if (status.kind === 'done') {
        return (
            <>
                <span aria-hidden="true">●</span> Done{status.percent !== null ? ` ${status.percent}%` : ''}
                {older}
            </>
        );
    }
    if (status.kind === 'started_unknown') {
        return (
            <>
                Started · ?{older}
            </>
        );
    }
    return (
        <>
            <span aria-hidden="true">◐</span> {status.checked}/{status.total}
            {older}
        </>
    );
}

/** The gradebook download (GB-1): the marks are read on the click, not on
 * every page view, then merged with the grid this page already loaded. */
function DownloadGradebook({ grid, due }: { grid: ClassProgressData; due: ClassDue | null }) {
    const [state, setState] = useState<'idle' | 'busy' | 'failed'>('idle');
    const onClick = async () => {
        setState('busy');
        try {
            const book = await fetchClassGradebook(grid.class.id);
            downloadText(gradebookFileName(grid.class.name, book.today), gradebookCsv(grid, book, due?.byActivity));
            setState('idle');
        } catch {
            setState('failed');
        }
    };
    return (
        <p className="mb-3">
            <button
                type="button"
                data-progress-csv
                disabled={state === 'busy'}
                onClick={() => void onClick()}
                className="text-sm font-medium text-strong underline underline-offset-2 disabled:opacity-60"
            >
                {state === 'busy' ? 'Preparing gradebook…' : 'Download gradebook (CSV)'}
            </button>
            {state === 'failed' && (
                <span role="alert" className="ml-3 text-sm text-muted">
                    The gradebook couldn't be prepared. Try again.
                </span>
            )}
        </p>
    );
}

/** Hand the teacher a file (E-1). A Blob URL, revoked once the click is done. */
function downloadText(fileName: string, text: string): void {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Not at 0 ms: Safari/iOS can cancel a download whose URL is revoked
    // before it has started reading.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
