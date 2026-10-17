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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router';
import {
    cellStatus,
    cellWords,
    fetchClassProgress,
    fetchMisconceptions,
    leastDoneFirst,
    pseudonyms,
    responsesHref,
    tally,
    tallyWords,
    type CellStatus,
    type ClassMisconceptions,
    type ClassProgress as ClassProgressData,
    type ProgressCell,
} from '../lib/classProgress';
import {
    Controls,
    LoadFailed,
    RefreshLine,
    Stat,
    lastCheckWords,
    useHideNames,
    useLeastDoneFirst,
    useProgressLoad,
    type ProgressOutletContext,
} from '../progress/common';
import MisconceptionPanel from '../progress/MisconceptionPanel';
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
    const loaded = useProgressLoad<Loaded>(async () => {
        const [grid, mis] = await Promise.all([
            fetchClassProgress(classId),
            fetchMisconceptions(classId).catch(() => null),
        ]);
        return { grid, mis };
    }, [classId]);
    const [hideNames, setHideNames] = useHideNames();
    const [leastDone, setLeastDone] = useLeastDoneFirst();

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
            <h1 className="mb-4 text-xl font-semibold text-ink">Class progress</h1>
            <Body
                loaded={loaded}
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
    loaded,
    hideNames,
    setHideNames,
    leastDone,
    setLeastDone,
    nameOf,
    base,
    selected,
    here,
}: {
    loaded: ReturnType<typeof useProgressLoad<Loaded>>;
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
    if (loaded.failed) {
        return <LoadFailed refused={loaded.refused} onRetry={loaded.reload} />;
    }
    if (!loaded.data) {
        return (
            <p role="status" className="text-sm text-muted">
                Loading…
            </p>
        );
    }
    const { grid, mis } = loaded.data;

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
                                    </th>
                                );
                            })}
                            <th scope="col" className="cp-rowtotal">
                                Done
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
                                            />
                                        </td>
                                    ))}
                                    <td className="cp-rowtotal">
                                        done {t.done} of {grid.activities.length}
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
}: {
    status: CellStatus;
    cell: { to_grade: number } | null;
    name: string;
    title: string;
    href: string;
    cellKey: string;
    selected: boolean;
    gradeHref: string;
}) {
    if (status.kind === 'none') {
        return (
            <span className="cp-none">
                <span aria-hidden="true">—</span>
                <span className="sr-only">not started</span>
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
                aria-label={`${name}, ${title}: ${cellWords(status)}`}
                {...(status.kind === 'started_unknown' ? { title: 'Checked before progress totals were recorded' } : {})}
            >
                <CellFace status={status} />
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
