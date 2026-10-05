// =============================================================================
// SprintPanel.tsx — the teacher's panel for the class's daily facts practice
// -----------------------------------------------------------------------------
// D43 slice 2 (docs/design/practice-blocks.md → "Slice 2, the sprint"; SP-2,
// SP-4). On the class's number-facts page, under "Run a snapshot":
//
//   THE SWITCH   on or off, at any time once the class has one closed
//                snapshot (SP-2). When it cannot be switched on the panel says
//                why, in words, and for a missing school-year end it asks for
//                the date right here.
//   THE SUMMARY  how many practised today and in the last seven days; each
//                fact family by how many students are in each state.
//   STUDENTS     behind "Show students" (a name is not in the page until the
//                disclosure is opened, as on the results screen — DR-22): days
//                practised and families by state. No ranking, no times (SP-4).
//
// Every number is the server's (fact_sprint_overview); this file formats it.
// Lazy: it ships in the teacher page's chunk, never in the shell.
// =============================================================================

import { useCallback, useEffect, useState } from 'react';
import { factsLink, setClassYearEnd } from '../lib/factProbe';
import { fetchSprintOverview, setFactSprint, type SprintOverview } from '../lib/factSprint';
import { guessYearEnd, longDay, yearEndBounds } from './yearEnd';

const BLOCKED: Record<NonNullable<SprintOverview['blocked_by']>, string> = {
    no_closed_check:
        'Run a snapshot with this class first. It gives each student a starting point, and it tells you whether the class needs daily practice.',
    sprint_settings_not_mirrored:
        'The practice settings have not been loaded yet, so it cannot be switched on. They are loaded by the platform’s import run.',
    year_not_available: 'The year level of this class’s last snapshot is not in the current fact lists.',
    school_year_end_missing: 'Give the date this class’s school year ends, then you can switch daily practice on.',
    school_year_ended: 'This class’s school year has ended. Give the new end date to switch daily practice on.',
};

function shortDay(date: string): string {
    return longDay(date).replace(/,? \d{4}$/, '');
}

export default function SprintPanel({
    classId,
    /** The latest closed snapshot's verdict, to say when it was recommended. */
    latestVerdict,
    onYearEndSaved,
}: {
    classId: string;
    latestVerdict: 'below' | 'at_or_above' | 'not_enough' | null;
    /** The class's school-year end was saved here: the page re-reads it. */
    onYearEndSaved?: () => void;
}) {
    const [data, setData] = useState<SprintOverview | null>(null);
    const [failed, setFailed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [switchFailed, setSwitchFailed] = useState(false);
    const [showStudents, setShowStudents] = useState(false);
    const bounds = yearEndBounds(new Date());
    const [endsOn, setEndsOn] = useState(() =>
        guessYearEnd(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone),
    );

    const load = useCallback(async () => {
        try {
            setData(await fetchSprintOverview(classId));
            setFailed(false);
        } catch {
            setFailed(true);
        }
    }, [classId]);
    useEffect(() => {
        void load();
    }, [load]);

    const act = async (work: () => Promise<unknown>) => {
        setBusy(true);
        setSwitchFailed(false);
        try {
            await work();
            await load();
        } catch {
            setSwitchFailed(true);
        } finally {
            setBusy(false);
        }
    };

    if (failed && !data) {
        // A database without the practice (or a failed read): say nothing
        // alarming on a page whose other panels work.
        return (
            <div className="ft-panel" data-testid="ft-sprint">
                <h2>Daily facts practice</h2>
                <p className="ft-muted">This did not load.</p>
                <button type="button" className="ft-btn" style={{ marginTop: 8 }} onClick={() => void load()}>
                    Try again
                </button>
            </div>
        );
    }
    if (!data) return null;

    const needsDate = data.blocked_by === 'school_year_end_missing' || data.blocked_by === 'school_year_ended';
    const dateValid = endsOn >= bounds.min && endsOn <= bounds.max;
    const link = factsLink(window.location.origin, data.join_code).replace(/^https?:\/\//, '');

    return (
        <div className="ft-panel" data-testid="ft-sprint">
            <h2>Daily facts practice</h2>
            <p className="ft-muted">
                About 5 minutes a day on each student’s own device. Each student practises only the
                facts they have not learned yet, with a strategy first where they are making
                mistakes. It is not marked.
            </p>

            <p style={{ marginTop: 12 }} data-testid="ft-sprint-state">
                <strong>{data.on ? 'On' : 'Off'}</strong>
                {data.on && data.on_at ? ` since ${shortDay(data.on_at)}` : ''}
                {!data.on && !data.blocked_by && latestVerdict === 'below'
                    ? '. The last snapshot recommends switching it on.'
                    : ''}
            </p>

            {data.blocked_by && !data.on ? (
                <p className="ft-note" role="status">
                    {BLOCKED[data.blocked_by]}
                </p>
            ) : null}

            {needsDate && !data.on ? (
                <div className="ft-yearend">
                    <label>
                        <strong style={{ display: 'block' }}>School year end date for this class</strong>
                        <input
                            type="date"
                            className="ft-date"
                            value={endsOn}
                            min={bounds.min}
                            max={bounds.max}
                            required
                            aria-invalid={!dateValid}
                            onChange={(e) => setEndsOn(e.target.value)}
                        />
                    </label>
                    <p className="ft-muted ft-small">
                        Students’ answers and timings are removed 30 days after the school year
                        ends.
                    </p>
                    <button
                        type="button"
                        className="ft-btn"
                        disabled={busy || !dateValid}
                        onClick={() =>
                            void act(async () => {
                                await setClassYearEnd(classId, endsOn);
                                onYearEndSaved?.();
                            })
                        }
                    >
                        Save the date
                    </button>
                </div>
            ) : null}

            {switchFailed ? (
                <p role="alert" style={{ marginTop: 8 }}>
                    That did not work. Check your connection, then try again.
                </p>
            ) : null}

            <div className="ft-row" style={{ marginTop: 12 }}>
                {data.on ? (
                    <button type="button" className="ft-btn" disabled={busy} onClick={() => void act(() => setFactSprint(classId, false))}>
                        Switch daily practice off
                    </button>
                ) : (
                    <button
                        type="button"
                        className="ft-btn-primary"
                        disabled={busy || data.blocked_by !== null}
                        onClick={() => void act(() => setFactSprint(classId, true))}
                    >
                        Switch daily practice on
                    </button>
                )}
                {data.on ? (
                    <span className="ft-muted ft-small">
                        Switching it off keeps what students have done.
                    </span>
                ) : null}
            </div>

            {data.on ? (
                <>
                    <p className="ft-muted ft-small" style={{ marginTop: 12 }}>
                        Students go to <strong>{link}</strong> (the same address as a snapshot), or
                        use the link under this class on their home page.
                    </p>
                    <p className="ft-counts" data-testid="ft-sprint-counts">
                        Practised today {data.practised_today} of {data.in_class} · In the last 7
                        days {data.practised_week}
                    </p>
                </>
            ) : null}

            {data.on && data.families.length > 0 ? (
                <>
                    <div className="ft-tablewrap">
                        <table className="ft-table">
                            <caption className="ft-muted ft-small" style={{ textAlign: 'left' }}>
                                Students by where they are with each fact family
                            </caption>
                            <thead>
                                <tr>
                                    <th scope="col">Fact family</th>
                                    <th scope="col" className="ft-num">Strategy first</th>
                                    <th scope="col" className="ft-num">Practising</th>
                                    <th scope="col" className="ft-num">Fluent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.families.map((f) => (
                                    <tr key={f.family_id}>
                                        <th scope="row" style={{ fontWeight: 500 }}>{f.name}</th>
                                        <td className="ft-num">{f.strategy}</td>
                                        <td className="ft-num">{f.practising}</td>
                                        <td className="ft-num">{f.fluent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button type="button" className="ft-link" aria-expanded={showStudents} onClick={() => setShowStudents((v) => !v)}>
                        {showStudents ? 'Hide students' : 'Show students'}
                    </button>
                    {showStudents ? (
                        <div className="ft-tablewrap">
                            <table className="ft-table">
                                <caption className="ft-muted ft-small" style={{ textAlign: 'left' }}>
                                    Each student: days practised, and how many fact families are in
                                    each state
                                </caption>
                                <thead>
                                    <tr>
                                        <th scope="col">Student</th>
                                        <th scope="col" className="ft-num">Days practised</th>
                                        <th scope="col">Last practised</th>
                                        <th scope="col" className="ft-num">Strategy first</th>
                                        <th scope="col" className="ft-num">Practising</th>
                                        <th scope="col" className="ft-num">Fluent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.students.map((s) => (
                                        <tr key={s.student_id}>
                                            <th scope="row" style={{ fontWeight: 500 }}>{s.name}</th>
                                            <td className="ft-num">{s.days_practised}</td>
                                            <td>{s.last_day ? shortDay(s.last_day) : 'Not yet'}</td>
                                            <td className="ft-num">{s.strategy}</td>
                                            <td className="ft-num">{s.practising}</td>
                                            <td className="ft-num">{s.fluent}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : null}
                </>
            ) : null}
        </div>
    );
}
