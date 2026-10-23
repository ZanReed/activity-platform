// =============================================================================
// MixedPanel.tsx — the teacher's mixed practice panel (D43 mixed practice, slice 4)
// -----------------------------------------------------------------------------
// docs/design/mixed-practice.md DM-3, 8, 9, 15, 18, 20 and the teacher-panel
// rulings (W-6 labels, W-9 words), on the class's practice page under the
// number-facts panel, in SprintPanel's shape:
//
//   THE SWITCH    On · since, or why not in words (DM-9). Switching off lets
//                 students already practising finish (DM-8).
//   SETTINGS      items per session (empty = the curriculum's number) and
//                 "Record a practice score" (off by default).
//   THE SUMMARY   practised today / this week; per skill: Students practising
//                 · Getting stuck · First tries right (last 5) · Skips. Counts
//                 only (DM-18). Labels truncate in the table; the full label
//                 is the accessible name and the tooltip (W-6).
//   STUDENTS      behind "Show students" — not in the page until opened
//                 (DM-18): name order, days this week, "getting stuck on",
//                 and in a class recording a score the latest FINISHED score
//                 as "n of N" or "In progress" (DM-20, S4-5).
//
// Every number is the server's (mixed_class_summary / mixed_class_students);
// this file formats it. Lazy: it ships in the teacher page's chunk.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { setClassYearEnd } from '../lib/factProbe';
import {
    fetchMixedStudents,
    fetchMixedSummary,
    setMixedPractice,
    setMixedSettings,
    skillName,
    type MixedBlockedReason,
    type MixedStudentRow,
    type MixedSummary,
} from '../lib/mixedTeacher';
import { guessYearEnd, longDay, yearEndBounds } from './yearEnd';

const BLOCKED: Record<MixedBlockedReason, string> = {
    mixed_settings_not_mirrored:
        'The practice settings have not been loaded yet, so it cannot be switched on. They are loaded by the platform’s import run.',
    school_year_end_missing: 'Give the date this class’s school year ends, then you can switch mixed practice on.',
    school_year_ended: 'This class’s school year has ended. Give the new end date to switch mixed practice on.',
};

function shortDay(date: string): string {
    return longDay(date).replace(/,? \d{4}$/, '');
}

export default function MixedPanel({
    classId,
    joinCode,
    onState,
    onYearEndSaved,
}: {
    classId: string;
    joinCode: string;
    /** Whether mixed practice is on, for the page's "Who to see first" (S4-1). */
    onState?: (on: boolean) => void;
    onYearEndSaved?: () => void;
}) {
    const [data, setData] = useState<MixedSummary | null>(null);
    const [failed, setFailed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [actionFailed, setActionFailed] = useState(false);
    const [items, setItems] = useState('');
    const savedItems = useRef<number | null | undefined>(undefined);
    const [showStudents, setShowStudents] = useState(false);
    const [students, setStudents] = useState<MixedStudentRow[] | null>(null);
    const [studentsFailed, setStudentsFailed] = useState(false);
    const bounds = yearEndBounds(new Date());
    const [endsOn, setEndsOn] = useState(() =>
        guessYearEnd(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone),
    );

    const load = useCallback(async () => {
        try {
            const summary = await fetchMixedSummary(classId);
            // The field follows the SAVED value only when that value moved, so
            // an unsaved number survives the graded toggle's re-read (Fable
            // review 2026-10-23, P3-1).
            if (savedItems.current !== summary.items_per_session) {
                savedItems.current = summary.items_per_session;
                setItems(summary.items_per_session === null ? '' : String(summary.items_per_session));
            }
            setData(summary);
            setFailed(false);
            onState?.(summary.on_at !== null);
        } catch {
            setFailed(true);
        }
    }, [classId, onState]);
    useEffect(() => {
        void load();
    }, [load]);

    // DM-18: names are fetched only when the teacher opens the list, and the
    // list leaves the page when it is closed.
    useEffect(() => {
        if (!showStudents) {
            setStudents(null);
            return;
        }
        let live = true;
        setStudentsFailed(false);
        fetchMixedStudents(classId).then(
            (rows) => live && setStudents(rows),
            () => live && setStudentsFailed(true),
        );
        return () => {
            live = false;
        };
    }, [showStudents, classId]);

    const act = async (work: () => Promise<unknown>) => {
        setBusy(true);
        setActionFailed(false);
        try {
            await work();
            await load();
        } catch {
            setActionFailed(true);
        } finally {
            setBusy(false);
        }
    };

    if (failed && !data) {
        return (
            <div className="ft-panel" data-testid="ft-mixed">
                <h2>Mixed practice</h2>
                <p className="ft-muted">This did not load.</p>
                <button type="button" className="ft-btn" style={{ marginTop: 8 }} onClick={() => void load()}>
                    Try again
                </button>
            </div>
        );
    }
    if (!data) {
        return (
            <div className="ft-panel" data-testid="ft-mixed" role="status">
                <h2>Mixed practice</h2>
                <p className="ft-muted">Loading…</p>
            </div>
        );
    }

    const on = data.on_at !== null;
    const needsDate = data.reason === 'school_year_end_missing' || data.reason === 'school_year_ended';
    const dateValid = endsOn >= bounds.min && endsOn <= bounds.max;
    const itemsValue = items.trim() === '' ? null : Number(items);
    const itemsValid = itemsValue === null || (Number.isInteger(itemsValue) && itemsValue >= 1 && itemsValue <= 50);
    const itemsChanged = itemsValue !== data.items_per_session;
    const link = `${window.location.origin}/practice/${joinCode}`.replace(/^https?:\/\//, '');

    return (
        <div className="ft-panel" data-testid="ft-mixed">
            <h2>Mixed practice</h2>
            <p className="ft-muted">
                A few questions a day on the skills your class has worked on, spaced out and mixed
                together, from each skill’s practice bank. One try each, with the working after
                every answer.
            </p>

            <p style={{ marginTop: 12 }} data-testid="ft-mixed-state">
                <strong>{on ? 'On' : 'Off'}</strong>
                {on && data.on_at ? ` since ${shortDay(data.on_at)}` : ''}
            </p>

            {data.reason && !on ? (
                <p className="ft-note" role="status">
                    {BLOCKED[data.reason]}
                </p>
            ) : null}

            {!data.has_bank ? (
                <p className="ft-note" data-testid="ft-mixed-nobank">
                    None of the skills your class has worked on has a practice bank yet.
                </p>
            ) : null}

            {needsDate && !on ? (
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
                        Students’ practice answers are removed 30 days after the school year ends.
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

            {actionFailed ? (
                <p role="alert" style={{ marginTop: 8 }}>
                    That did not work. Check your connection, then try again.
                </p>
            ) : null}

            <div className="ft-row" style={{ marginTop: 12 }}>
                {on ? (
                    <button type="button" className="ft-btn" disabled={busy} onClick={() => void act(() => setMixedPractice(classId, false))}>
                        Switch mixed practice off
                    </button>
                ) : (
                    <button
                        type="button"
                        className="ft-btn-primary"
                        disabled={busy || data.reason !== null}
                        onClick={() => void act(() => setMixedPractice(classId, true))}
                    >
                        Switch mixed practice on
                    </button>
                )}
                {on ? (
                    <span className="ft-muted ft-small">
                        Students already practising can finish. Switching it off keeps what they have done.
                    </span>
                ) : null}
            </div>

            <fieldset className="ft-settings" disabled={busy}>
                <legend className="ft-sr">Settings</legend>
                <label className="ft-setting">
                    <span>Items per session</span>
                    <input
                        type="number"
                        min={1}
                        max={50}
                        inputMode="numeric"
                        className="ft-date ft-items"
                        value={items}
                        placeholder={data.default_items === null ? '' : String(data.default_items)}
                        aria-invalid={!itemsValid}
                        aria-describedby="ft-items-hint"
                        onChange={(e) => setItems(e.target.value)}
                    />
                </label>
                <span id="ft-items-hint" className="ft-muted ft-small">
                    {data.default_items === null
                        ? 'Leave it empty for the usual number.'
                        : `Leave it empty for the usual ${data.default_items}.`}
                </span>
                <label className="ft-setting">
                    <input
                        type="checkbox"
                        checked={data.graded}
                        onChange={(e) => void act(() => setMixedSettings(classId, data.items_per_session, e.target.checked))}
                    />
                    <span>Record a practice score</span>
                </label>
                {itemsChanged ? (
                    <button
                        type="button"
                        className="ft-btn"
                        disabled={!itemsValid}
                        onClick={() => void act(() => setMixedSettings(classId, itemsValue, data.graded))}
                    >
                        Save
                    </button>
                ) : null}
                <p className="ft-muted ft-small" style={{ margin: 0 }}>
                    Changes apply to practice started after you save.
                </p>
            </fieldset>

            {on && data.practised_week === 0 ? (
                <p className="ft-note" data-testid="ft-mixed-none-yet">
                    No one has practised yet. Students start from the class link: <strong>{link}</strong>
                </p>
            ) : null}

            {data.practised_week > 0 || data.skills.length > 0 ? (
                <p className="ft-counts" data-testid="ft-mixed-counts">
                    Practised today {data.practised_today} of {data.in_class} · In the last 7 days{' '}
                    {data.practised_week}
                </p>
            ) : null}

            {data.skills.length > 0 ? (
                <>
                    <div className="ft-tablewrap">
                        <table className="ft-table">
                            <caption className="ft-muted ft-small" style={{ textAlign: 'left' }}>
                                Each skill: students’ last 5 first tries
                            </caption>
                            <thead>
                                <tr>
                                    <th scope="col">Skill</th>
                                    <th scope="col" className="ft-num">Students practising</th>
                                    <th scope="col" className="ft-num">Getting stuck</th>
                                    <th scope="col" className="ft-num">First tries right (last 5)</th>
                                    <th scope="col" className="ft-num">Skips</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.skills.map((s) => {
                                    const name = skillName({ id: s.skill_id, label: s.label });
                                    return (
                                        <tr key={s.skill_id}>
                                            <th scope="row" style={{ fontWeight: 500 }}>
                                                <span className="ft-trunc" title={name}>{name}</span>
                                            </th>
                                            <td className="ft-num">{s.students_practising}</td>
                                            <td className="ft-num">{s.struggling}</td>
                                            <td className="ft-num">
                                                {s.first_tries_right} of {s.first_tries}
                                            </td>
                                            <td className="ft-num">{s.skips}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : null}

            {data.practised_week > 0 || data.skills.length > 0 ? (
                <button type="button" className="ft-link" aria-expanded={showStudents} onClick={() => setShowStudents((v) => !v)}>
                    {showStudents ? 'Hide students' : 'Show students'}
                </button>
            ) : null}
            {showStudents ? (
                studentsFailed ? (
                    <p className="ft-muted">That did not load. Close the list and open it again.</p>
                ) : !students ? (
                    <p className="ft-muted" role="status">Loading…</p>
                ) : (
                    <div className="ft-tablewrap" data-testid="ft-mixed-students">
                        <table className="ft-table">
                            <caption className="ft-muted ft-small" style={{ textAlign: 'left' }}>
                                Each student: days practised this week and the skills they are getting
                                stuck on
                            </caption>
                            <thead>
                                <tr>
                                    <th scope="col">Student</th>
                                    <th scope="col" className="ft-num">Days this week</th>
                                    <th scope="col">Getting stuck on</th>
                                    {data.graded ? <th scope="col">Latest practice score</th> : null}
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s) => (
                                    <tr key={s.student_id}>
                                        <th scope="row" style={{ fontWeight: 500 }}>{s.name}</th>
                                        <td className="ft-num">{s.days_this_week}</td>
                                        <td>{s.struggling.length === 0 ? '—' : s.struggling.map(skillName).join('; ')}</td>
                                        {data.graded ? (
                                            <td>
                                                {s.latest_score
                                                    ? `${s.latest_score.right} of ${s.latest_score.planned}`
                                                    : s.score_in_progress
                                                      ? 'In progress'
                                                      : '—'}
                                                {s.latest_score && s.score_in_progress ? ' (another in progress)' : ''}
                                            </td>
                                        ) : null}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : null}
        </div>
    );
}
