// =============================================================================
// ClassPresent.tsx — /classes/:classId/present, today's period on the projector
// (period planner PP-9; docs/design/period-planner.md)
// -----------------------------------------------------------------------------
// Large rows in §17's order, each with "about N min"; the practice link and join
// code at the top so students know where to go; the hook's prompt full width.
// The hook's TEACHER NOTE is hidden until "Show note (on screen)": notes carry
// answers and this page is on a projector. No student names, no progress, no
// answers, no clock, no timer. "We're here" highlights one row locally: nothing
// is saved or sent (not the lesson player PA-2 refused). Escape or Back returns
// to the class's Today & practice page.
// =============================================================================

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { fetchMyChainHooks, NO_CHAIN_HOOKS, type MyChainHooks } from '../lib/chainHooks';
import { listClasses, type ClassInfo } from '../lib/classes';
import { fetchClassToday, type ClassToday } from '../lib/classToday';
import {
    dayBlocks,
    dayLabel,
    dayTotal,
    fetchClassPlan,
    shapeFrom,
    totalLine,
    type ClassPlan,
} from '../lib/classPlan';
import { fetchSprintOverview, type SprintOverview } from '../lib/factSprint';
import { fetchMixedSummary, type MixedSummary } from '../lib/mixedTeacher';
import { useSession } from '../lib/SessionContext';

export default function ClassPresent() {
    const { classId = '' } = useParams();
    const navigate = useNavigate();
    const { role } = useSession();
    // Nothing is read or shown until the role is known to be a teacher (review
    // P1: class_today is student-readable, so a loading role must not fetch).
    const isTeacher = role === 'teacher';
    const back = `/classes/${classId}/facts`;

    const [cls, setCls] = useState<ClassInfo | null>(null);
    const [today, setToday] = useState<ClassToday | null>(null);
    const [failed, setFailed] = useState(false);
    const [detail, setDetail] = useState<ClassPlan | null>(null);
    const [hooks, setHooks] = useState<MyChainHooks>(NO_CHAIN_HOOKS);
    const [sprint, setSprint] = useState<SprintOverview | null>(null);
    const [mixed, setMixed] = useState<MixedSummary | null>(null);
    // Keyed by the block, not its index: rows that arrive late (facts, hook,
    // practice) must not move the highlight (review P1).
    const [here, setHere] = useState<string | null>(null);
    const [noteOpen, setNoteOpen] = useState(false);

    useEffect(() => {
        if (!isTeacher) return;
        let live = true;
        fetchClassToday(classId)
            .then((t) => {
                if (!live) return;
                setToday(t);
                // The detail (minutes, the dated hook) is optional: titles alone still present.
                fetchClassPlan(classId, t.on_date, t.on_date)
                    .then((d) => live && setDetail(d))
                    .catch(() => undefined);
            })
            .catch(() => live && setFailed(true));
        listClasses()
            .then((all) => live && setCls(all.find((c) => c.id === classId) ?? null))
            .catch(() => undefined);
        fetchMyChainHooks()
            .then((h) => live && setHooks(h))
            .catch(() => undefined);
        fetchSprintOverview(classId)
            .then((s) => live && setSprint(s))
            .catch(() => undefined);
        fetchMixedSummary(classId)
            .then((m) => live && setMixed(m))
            .catch(() => undefined);
        return () => {
            live = false;
        };
    }, [classId, isTeacher]);

    // Escape: hide an open note first (it carries answers), else go back.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // A held key's repeats must not hide the note AND leave the page.
            if (e.key !== 'Escape' || e.defaultPrevented || e.repeat) return;
            if (noteOpen) setNoteOpen(false);
            else navigate(back);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [noteOpen, navigate, back]);

    const view = useMemo(() => {
        if (!today) return null;
        const shape = shapeFrom(sprint, mixed);
        const detailDay = detail?.days.find((d) => d.on_date === detail.today);
        const sameIds =
            (detailDay?.activities ?? [])
                .filter((a) => a.available)
                .map((a) => a.activity_id)
                .join() === today.activities.map((a) => a.activity_id).join();
        const day =
            detailDay && sameIds
                ? detailDay
                : {
                      activities: today.activities.map((a, i) => ({
                          ...a,
                          minutes: null,
                          position: i + 1,
                          available: true,
                      })),
                      hook_ids: detailDay?.hook_ids ?? [],
                  };
        const hookId = day.hook_ids[0];
        const hook = hookId ? Object.values(hooks.chains).flat().find((h) => h.id === hookId) : undefined;
        return {
            blocks: dayBlocks(day, shape, hook?.prompt ?? null),
            total: totalLine(dayTotal(day, shape)),
            hook,
        };
    }, [today, detail, hooks, sprint, mixed]);

    if (role === null || role === undefined) {
        return (
            <Frame back={back} title="Present">
                <p role="status" className="text-lg text-muted">
                    Loading…
                </p>
            </Frame>
        );
    }
    if (!isTeacher) {
        return (
            <Frame back={back} title="Present">
                <p className="text-lg text-muted">This page is for teachers.</p>
            </Frame>
        );
    }
    if (failed) {
        return (
            <Frame back={back} title="Present">
                <p role="alert" className="text-lg text-danger">
                    Today’s plan couldn’t load. Check your connection, then try again.
                </p>
            </Frame>
        );
    }
    if (!today || !view) {
        return (
            <Frame back={back} title="Present">
                <p role="status" className="text-lg text-muted">
                    Loading…
                </p>
            </Frame>
        );
    }

    const link = cls ? `${window.location.origin}/practice/${cls.joinCode}`.replace(/^https?:\/\//, '') : null;

    return (
        <Frame back={back} title={`${cls?.name ?? 'Today'} · ${dayLabel(today.on_date)}`}>
            {link && cls && (
                <p className="mt-2 text-2xl text-strong" data-present-join>
                    Go to <span className="font-mono font-semibold text-ink">{link}</span>
                    <span className="ml-4 text-muted">code</span>{' '}
                    <span className="font-mono text-3xl font-bold tracking-widest text-ink">{cls.joinCode}</span>
                </p>
            )}

            {view.blocks.length === 0 ? (
                <p className="mt-10 text-2xl text-muted">
                    Nothing is picked for today. Pick one on the Today &amp; practice page.
                </p>
            ) : (
                <ol className="mt-8 space-y-3" role="list" aria-label="Today's period">
                    {view.blocks.map((b, i) => {
                        const key = `${b.kind}-${b.activityId ?? i}`;
                        const isHere = here === key;
                        return (
                            <li
                                key={key}
                                data-block={b.kind}
                                aria-current={isHere ? 'step' : undefined}
                                className={`rounded-xl border-2 px-6 py-4 ${
                                    isHere ? 'border-accent bg-surface-2' : 'border-line bg-canvas'
                                }`}
                            >
                                <div className="flex flex-wrap items-baseline justify-between gap-4">
                                    <p
                                        className={`min-w-0 flex-1 ${
                                            b.kind === 'hook' ? 'text-3xl' : 'text-2xl'
                                        } font-semibold text-ink`}
                                    >
                                        {b.kind === 'hook' ? (
                                            <>
                                                <span className="block text-lg font-medium text-muted">Hook</span>
                                                {view.hook?.prompt ?? 'Hook'}
                                            </>
                                        ) : (
                                            b.label
                                        )}
                                    </p>
                                    <span className="text-xl text-muted">{b.minutes}</span>
                                    <button
                                        type="button"
                                        aria-pressed={isHere}
                                        aria-label={`We're here: ${b.kind === 'hook' ? 'the hook' : b.label}`}
                                        onClick={() => setHere(isHere ? null : key)}
                                        className="rounded-md border border-line-strong px-3 py-1 text-sm text-strong hover:bg-surface-2"
                                    >
                                        {isHere ? 'Here' : "We're here"}
                                    </button>
                                </div>
                                {b.kind === 'hook' && view.hook && (
                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            aria-expanded={noteOpen}
                                            aria-controls="present-hook-note"
                                            onClick={() => setNoteOpen((o) => !o)}
                                            className="text-sm font-medium text-muted underline underline-offset-2 hover:text-strong"
                                        >
                                            {noteOpen ? 'Hide note' : 'Show note (on screen)'}
                                        </button>
                                        <div id="present-hook-note" aria-live="polite">
                                            {noteOpen && (
                                                <p className="mt-2 text-lg text-strong" data-hook-note>
                                                    {view.hook.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}

            {view.total && <p className="mt-6 text-xl text-muted">{view.total}</p>}
        </Frame>
    );
}

function Frame({ back, title, children }: { back: string; title: string; children: React.ReactNode }) {
    return (
        <main className="min-h-screen bg-surface px-8 py-6">
            <div className="mx-auto max-w-5xl">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-4xl font-bold text-ink">{title}</h1>
                    <Link to={back} className="text-base text-muted underline underline-offset-2 hover:text-strong">
                        Back (Esc)
                    </Link>
                </div>
                {children}
            </div>
        </main>
    );
}
