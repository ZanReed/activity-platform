// =============================================================================
// ActivityProgress.tsx — /activity/:id/progress, one activity across classes
// -----------------------------------------------------------------------------
// docs/design/class-progress-view.md D5, D6, DR-2, DR-3, DR-11. Students on the
// LIVE roster of every class the teacher has assigned this activity to — never
// "everyone who checked it" (D6) — grouped by class, one block per class whose
// heading carries that class's done / started / not started counts (DR-2).
// Columns are the CURRENT version's sections ("Section 3" when untitled). A
// student whose latest work is on an older version gets one cell across the
// sections, tagged older (CP-6). Common misconceptions and common wrong answers
// sit ABOVE the grid here (DR-3: one activity's signal is the actionable one).
// A cell opens the same answer panel as the class page (DR-5).
// =============================================================================

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router';
import { servedDocument, type ServedDoc } from '../lib/answerText';
import {
    cellStatus,
    cellWords,
    fetchActivityProgress,
    fetchMisconceptions,
    fetchVersionContents,
    leastDoneFirst,
    pseudonyms,
    responsesHref,
    tally,
    tallyWords,
    type ActivityProgress as ActivityProgressData,
    type ActivityProgressSection,
    type ActivityProgressStudent,
    type ClassMisconceptions,
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
import WrongAnswersPanel from '../progress/WrongAnswersPanel';
import '../styles/teacherTable.css';
import '../progress/progress.css';

interface Loaded {
    grid: ActivityProgressData;
    mis: ClassMisconceptions | null;
    /** version id → unseeded document; the current version is always tried. */
    docs: Map<string, ServedDoc>;
}

export default function ActivityProgress() {
    const { id = '', studentId } = useParams();
    const location = useLocation();
    const base = `/activity/${id}/progress`;
    const loaded = useProgressLoad<Loaded>(async () => {
        const [grid, mis] = await Promise.all([
            fetchActivityProgress(id),
            fetchMisconceptions(null, id).catch(() => null),
        ]);
        const versionIds = [
            ...(grid.activity.current_version_id ? [grid.activity.current_version_id] : []),
            ...(mis?.wrong_answers.map((w) => w.version_id) ?? []),
        ];
        const docs = new Map<string, ServedDoc>();
        try {
            const contents = await fetchVersionContents(versionIds);
            for (const [vid, c] of contents) {
                try {
                    docs.set(vid, servedDocument(c.content, vid, null));
                } catch {
                    // Unreadable by this build: columns fall back to "Section N".
                }
            }
        } catch {
            // Same fallback.
        }
        return { grid, mis, docs };
    }, [id]);
    const [hideNames, setHideNames] = useHideNames();
    const [leastDone, setLeastDone] = useLeastDoneFirst();

    const grid = loaded.data?.grid ?? null;
    const alias = useMemo(
        () => pseudonyms((grid?.classes ?? []).flatMap((c) => c.students)),
        [grid],
    );
    const nameOf = useCallback(
        (sid: string, name: string) => (hideNames ? (alias.get(sid) ?? 'Student') : name),
        [hideNames, alias],
    );

    const lastOpened = useRef<string | null>(null);
    useEffect(() => {
        if (studentId) {
            lastOpened.current = studentId;
        } else if (lastOpened.current) {
            const key = lastOpened.current;
            lastOpened.current = null;
            document.querySelector<HTMLElement>(`[data-student-cell="${CSS.escape(key)}"]`)?.focus();
        }
    }, [studentId]);

    const outlet: ProgressOutletContext = { hideNames, nameOf, classId: null, closeTo: base };

    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-sm text-muted">
                    <Link to="/activities" className="underline underline-offset-2 hover:text-strong">
                        Activities
                    </Link>
                    {grid ? ` / ${grid.activity.title}` : ''}
                </p>
                <Link
                    to={`/activity/${id}`}
                    className="text-sm font-medium text-muted underline underline-offset-2 hover:text-strong"
                >
                    Back to editor
                </Link>
            </div>
            <h1 className="mb-4 text-xl font-semibold text-ink">Progress</h1>
            <Body
                loaded={loaded}
                hideNames={hideNames}
                setHideNames={setHideNames}
                leastDone={leastDone}
                setLeastDone={setLeastDone}
                nameOf={nameOf}
                base={base}
                here={location.pathname}
                selected={studentId ?? null}
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
    here,
    selected,
}: {
    loaded: ReturnType<typeof useProgressLoad<Loaded>>;
    hideNames: boolean;
    setHideNames: (on: boolean) => void;
    leastDone: boolean;
    setLeastDone: (on: boolean) => void;
    nameOf: (sid: string, name: string) => string;
    base: string;
    here: string;
    selected: string | null;
}) {
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
    const { grid, mis, docs } = loaded.data;
    const activityId = grid.activity.id;

    if (grid.classes.length === 0) {
        return (
            <div className="rounded-lg border border-line bg-canvas p-4">
                <p className="font-medium text-ink">Not assigned to a class yet</p>
                <p className="mt-1 text-sm text-muted">
                    Progress shows students in the classes you add this activity to. Add it from{' '}
                    <Link to="/activities" className="text-strong underline underline-offset-2">
                        Activities
                    </Link>
                    .
                </p>
                <RefreshLine loaded={loaded} />
            </div>
        );
    }

    const current = grid.activity.current_version_id ? docs.get(grid.activity.current_version_id) : undefined;
    const sectionIds = current
        ? Object.keys(current.index.bySection)
        : [...new Set(grid.sections.filter((s) => s.version_id === grid.activity.current_version_id).map((s) => s.section_id))];
    const sectionTitle = (sid: string, i: number) => current?.index.sectionTitles[sid] ?? `Section ${i + 1}`;
    const sectionRow = new Map<string, ActivityProgressSection>();
    for (const s of grid.sections) sectionRow.set(`${s.student_id}:${s.version_id}:${s.section_id}`, s);
    const everyone = grid.classes.flatMap((c) => c.students);
    const studentCount = new Set(everyone.map((s) => s.student_id)).size;
    const anyWork = everyone.some((s) => s.shown_version_id !== null);
    const misDescriptions = new Map((mis?.misconceptions ?? []).map((m) => [m.id, m.description]));

    return (
        <>
            <section className="mb-4 grid grid-cols-3 gap-3">
                <Stat label="Classes" value={String(grid.classes.length)} />
                <Stat label="Students" value={String(studentCount)} />
                <Stat label="Last check" value={lastCheckWords(grid.last_check_at)} />
            </section>
            {mis === null ? (
                <p className="mt-4 text-sm text-muted">
                    Couldn't load misconceptions and common wrong answers. Press Refresh to try again.
                </p>
            ) : (
                <>
                    <MisconceptionPanel
                        rows={mis.misconceptions}
                        showActivities={false}
                        nameOf={nameOf}
                        studentHref={(sid) => `${base}/${sid}`}
                    />
                    <WrongAnswersPanel
                        items={mis.wrong_answers}
                        docs={docs}
                        describe={(mid) => misDescriptions.get(mid) ?? `Unknown misconception (${mid})`}
                    />
                </>
            )}
            <div className="mt-8">
                <Controls
                    hideNames={hideNames}
                    onHideNames={setHideNames}
                    leastDone={leastDone}
                    onLeastDone={setLeastDone}
                    loaded={loaded}
                />
            </div>
            {!anyWork && <p className="mb-3 text-sm text-muted">No one has checked any work yet.</p>}
            {grid.classes.map((cls) => {
                const statuses = cls.students.map((s) => cellStatus(s));
                const students = leastDone
                    ? leastDoneFirst(cls.students, (s) => tally([cellStatus(s)]))
                    : cls.students;
                return (
                    <section key={cls.class_id} className="mb-6" aria-labelledby={`cp-class-${cls.class_id}`}>
                        <h2 id={`cp-class-${cls.class_id}`} className="mb-2 text-base font-semibold text-ink">
                            {cls.name}
                            <span className="ml-2 text-sm font-normal text-muted">{tallyWords(tally(statuses))}</span>
                        </h2>
                        {cls.students.length === 0 ? (
                            <p className="text-sm text-muted">No students in this class yet.</p>
                        ) : (
                            <div className="cp-scroller">
                                <table className="ft-table cp-grid">
                                    <caption className="sr-only">
                                        {cls.name}: each student's checked sections of this activity
                                    </caption>
                                    <thead>
                                        <tr>
                                            <th scope="col">Student</th>
                                            {sectionIds.map((sid, i) => (
                                                <th key={sid} scope="col" className="cp-colhead">
                                                    <span className="cp-clamp">{sectionTitle(sid, i)}</span>
                                                </th>
                                            ))}
                                            <th scope="col" className="cp-rowtotal">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((s) => (
                                            <StudentRow
                                                key={s.student_id}
                                                s={s}
                                                name={nameOf(s.student_id, s.name)}
                                                fullName={hideNames ? null : s.name}
                                                currentVersionId={grid.activity.current_version_id}
                                                sectionIds={sectionIds}
                                                sectionTitle={sectionTitle}
                                                sectionRow={sectionRow}
                                                href={`${base}/${s.student_id}`}
                                                selected={selected === s.student_id}
                                                gradeHref={responsesHref(activityId, here)}
                                                activityTitle={grid.activity.title}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                );
            })}
            <p className="mt-6 text-xs text-muted">
                Only students in your classes that have this activity appear here. Hide names replaces names only;
                answers still show.
            </p>
        </>
    );
}

function StudentRow({
    s,
    name,
    fullName,
    currentVersionId,
    sectionIds,
    sectionTitle,
    sectionRow,
    href,
    selected,
    gradeHref,
    activityTitle,
}: {
    s: ActivityProgressStudent;
    name: string;
    fullName: string | null;
    currentVersionId: string | null;
    sectionIds: string[];
    sectionTitle: (sid: string, i: number) => string;
    sectionRow: Map<string, ActivityProgressSection>;
    href: string;
    selected: boolean;
    gradeHref: string;
    activityTitle: string;
}) {
    const status = cellStatus(s);
    let firstLink = true;
    const linkProps = () => {
        const p = firstLink ? { 'data-student-cell': s.student_id } : {};
        firstLink = false;
        return p;
    };
    return (
        <tr>
            <th scope="row" {...(fullName ? { title: fullName } : {})}>
                {name}
            </th>
            {status.older ? (
                <td colSpan={Math.max(sectionIds.length, 1)}>
                    <Link
                        to={href}
                        className="cp-cell"
                        data-current={selected ? 'true' : undefined}
                        aria-label={`${name}: ${cellWords(status)}`}
                        {...linkProps()}
                    >
                        <span className="cp-older">older version</span>
                        {status.kind === 'done' ? (
                            <>
                                <span aria-hidden="true">●</span> Done
                            </>
                        ) : status.kind === 'started' ? (
                            <>
                                <span aria-hidden="true">◐</span> {status.checked}/{status.total}
                            </>
                        ) : (
                            'Started · ?'
                        )}
                    </Link>
                </td>
            ) : (
                sectionIds.map((sid, i) => {
                    const row = currentVersionId ? sectionRow.get(`${s.student_id}:${currentVersionId}:${sid}`) : undefined;
                    if (!row) {
                        return (
                            <td key={sid}>
                                <span className="cp-none">
                                    <span aria-hidden="true">—</span>
                                    <span className="sr-only">not checked</span>
                                </span>
                            </td>
                        );
                    }
                    const pct = row.marked > 0 ? Math.round((row.correct / row.marked) * 100) : null;
                    const attempts = row.attempts === 1 ? '1 attempt' : `${row.attempts} attempts`;
                    return (
                        <td key={sid}>
                            <Link
                                to={href}
                                className="cp-cell"
                                data-current={selected ? 'true' : undefined}
                                aria-label={`${name}, ${sectionTitle(sid, i)}: checked${pct !== null ? `, ${pct} percent` : ''}, ${attempts}`}
                                {...linkProps()}
                            >
                                <span aria-hidden="true">✓</span>
                                {pct !== null ? ` ${pct}%` : ' Checked'}
                            </Link>
                        </td>
                    );
                })
            )}
            <td className="cp-rowtotal">
                {status.kind === 'none'
                    ? 'not started'
                    : status.kind === 'done'
                      ? 'done'
                      : status.kind === 'started'
                        ? `started ${status.checked} of ${status.total}`
                        : 'started'}
                {s.to_grade > 0 && (
                    <Link to={gradeHref} className="cp-chip">
                        <span aria-hidden="true">{s.to_grade} to grade</span>
                        <span className="sr-only">
                            {s.to_grade} to grade in {activityTitle}
                        </span>
                    </Link>
                )}
            </td>
        </tr>
    );
}
