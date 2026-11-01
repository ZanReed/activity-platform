// =============================================================================
// UnitTracker.tsx — the unit tracker, for a student and for their teacher (D67)
// -----------------------------------------------------------------------------
// docs/design/student-unit-tracker.md. LAZY (App.tsx). /progress/:classId is
// the student's page: each unit's rows with a status word, and one next line
// (UT-1, UT-3, UT-4, UT-8). /classes/:classId/tracker is the same page for the
// class's teacher: no statuses, an inline wording field on each row (UT-6).
// The server decides everything (0074); this file formats. Re-reads on open.
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
    fetchClassTracker,
    fetchMyTracker,
    HARDER_NOTE,
    nextLine,
    rowText,
    saveTrackerWording,
    TRACKER_WORDS,
    type StudentTrackerUnit,
    type TeacherTrackerRow,
    type TeacherTrackerUnit,
} from '../lib/unitTracker';

export const TRACKER_COPY = {
    studentTitle: 'Your progress',
    teacherTitle: 'Unit tracker',
    teacherIntro:
        'Students see these rows with a status beside each one. Add your school’s wording to a row, or leave it blank to use the label shown.',
    studentEmpty: 'Nothing to show yet. Your progress appears once your teacher adds an activity from a unit.',
    teacherEmpty: 'Nothing to show yet. A unit appears here once this class has an activity from it.',
    failed: 'We couldn’t load this just now.',
    refused: 'This page isn’t available.',
    retry: 'Try again',
} as const;

const CARD = 'rounded-lg border border-line bg-canvas p-6 shadow-sm';

type Load<T> = { kind: 'loading' } | { kind: 'failed' } | { kind: 'refused' } | { kind: 'ready'; units: T[] };

function useTracker<T>(fetcher: (classId: string) => Promise<T[]>, classId: string) {
    const [state, setState] = useState<Load<T>>({ kind: 'loading' });
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        let live = true;
        setState({ kind: 'loading' });
        fetcher(classId)
            .then((units) => {
                if (live) setState({ kind: 'ready', units });
            })
            .catch((err: { code?: string }) => {
                if (live) setState({ kind: err?.code === '42501' ? 'refused' : 'failed' });
            });
        return () => {
            live = false;
        };
    }, [fetcher, classId, attempt]);
    return { state, retry: () => setAttempt((n) => n + 1) };
}

function Frame({ title, back, backTo, children }: { title: string; back: string; backTo: string; children: React.ReactNode }) {
    return (
        <main className="mx-auto max-w-3xl space-y-4 p-4">
            <Link to={backTo} className="text-sm text-muted underline underline-offset-2 hover:text-strong">
                {back}
            </Link>
            <h1 className="text-2xl font-bold text-ink">{title}</h1>
            {children}
        </main>
    );
}

function Status<T>({ state, retry, empty }: { state: Load<T>; retry: () => void; empty: string }) {
    if (state.kind === 'loading') return <p role="status" className="text-muted">Loading…</p>;
    if (state.kind === 'refused') return <p className="text-muted">{TRACKER_COPY.refused}</p>;
    if (state.kind === 'failed') {
        return (
            <div role="alert">
                <p className="text-muted">{TRACKER_COPY.failed}</p>
                <button type="button" onClick={retry} className="mt-2 text-sm underline underline-offset-2">
                    {TRACKER_COPY.retry}
                </button>
            </div>
        );
    }
    return state.units.length === 0 ? <p className="text-muted">{empty}</p> : null;
}

export function StudentTracker() {
    const { classId = '' } = useParams();
    const { state, retry } = useTracker<StudentTrackerUnit>(fetchMyTracker, classId);
    return (
        <Frame title={TRACKER_COPY.studentTitle} back="Back to your classes" backTo="/">
            <Status state={state} retry={retry} empty={TRACKER_COPY.studentEmpty} />
            {state.kind === 'ready' &&
                state.units.map((unit) => {
                    const next = nextLine(unit);
                    return (
                        <section key={unit.unit} className={CARD}>
                            <h2 className="text-xl font-bold text-ink">{unit.unit}</h2>
                            {next ? (
                                <p className="mt-2 text-base text-strong" data-next={unit.next?.kind}>
                                    {next.href ? (
                                        <Link to={next.href} className="underline underline-offset-2">
                                            {next.text}
                                        </Link>
                                    ) : (
                                        next.text
                                    )}
                                </p>
                            ) : null}
                            <ul className="mt-3 divide-y divide-line">
                                {unit.rows.map((row) => (
                                    <li key={row.skill_id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2">
                                        <span className="min-w-0 flex-1 text-sm text-ink">
                                            {rowText(row)}
                                            {row.harder ? (
                                                <span className="mt-0.5 block text-xs text-muted">{HARDER_NOTE}</span>
                                            ) : null}
                                        </span>
                                        <span
                                            data-status={row.status}
                                            className={`shrink-0 text-sm ${row.status === 'not_started' ? 'text-muted' : 'font-medium text-ink'}`}
                                        >
                                            {TRACKER_WORDS[row.status]}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}
        </Frame>
    );
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/** UT-6: optimistic autosave, with a visible state, flushed on blur and unmount. */
function WordingField({ row }: { row: TeacherTrackerRow }) {
    const [value, setValue] = useState(row.wording ?? '');
    const [save, setSave] = useState<SaveState>('idle');
    const lastSaved = useRef(row.wording ?? '');
    const latest = useRef(value);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    latest.current = value;

    const flush = () => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        const text = latest.current.trim();
        if (text === lastSaved.current) return;
        setSave('saving');
        saveTrackerWording(row.skill_id, text)
            .then(() => {
                lastSaved.current = text;
                setSave('saved');
            })
            .catch(() => setSave('error'));
    };

    useEffect(() => flush, []); // eslint-disable-line react-hooks/exhaustive-deps

    const inputId = `tracker-wording-${row.skill_id}`;
    return (
        <div className="py-3">
            <label htmlFor={inputId} className="block text-sm text-ink">
                {row.letters.length > 0 ? `${row.label} · ${row.letters.join(' ')}` : row.label}
            </label>
            <input
                id={inputId}
                type="text"
                maxLength={200}
                value={value}
                placeholder="Your school’s wording (optional)"
                onChange={(e) => {
                    setValue(e.target.value);
                    setSave('idle');
                    if (timer.current) clearTimeout(timer.current);
                    timer.current = setTimeout(flush, 800);
                }}
                onBlur={flush}
                className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink"
            />
            <p className="mt-1 min-h-4 text-xs text-muted" aria-live="polite" data-save={save}>
                {save === 'saving' ? 'Saving…' : save === 'saved' ? 'Saved' : save === 'error' ? 'Couldn’t save. Try again.' : ''}
            </p>
        </div>
    );
}

export function TeacherTracker() {
    const { classId = '' } = useParams();
    const { state, retry } = useTracker<TeacherTrackerUnit>(fetchClassTracker, classId);
    return (
        <Frame title={TRACKER_COPY.teacherTitle} back="Back to classes" backTo="/classes">
            <p className="text-sm text-muted">{TRACKER_COPY.teacherIntro}</p>
            <Status state={state} retry={retry} empty={TRACKER_COPY.teacherEmpty} />
            {state.kind === 'ready' &&
                state.units.map((unit) => (
                    <section key={unit.unit} className={CARD}>
                        <h2 className="text-xl font-bold text-ink">{unit.unit}</h2>
                        <div className="mt-2 divide-y divide-line">
                            {unit.rows.map((row) => (
                                <WordingField key={row.skill_id} row={row} />
                            ))}
                        </div>
                    </section>
                ))}
        </Frame>
    );
}
