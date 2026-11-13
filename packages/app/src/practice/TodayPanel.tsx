// =============================================================================
// TodayPanel.tsx — the teacher's plan for today, top of the class's Practice
// page (period assembly PA-3, PA-8; docs/design/period-assembly.md)
// -----------------------------------------------------------------------------
// Today's DAY CARD (period planner PP-8): number facts, the hook, each activity
// with its time and its practice, then the total; "Carry on today" for last
// time's activities (PP-2); a link to the hook page and to the Plan page; and
// the pick. No student names, so it is safe on a projector. No clock (PA-11).
// Nothing here starts, locks or schedules anything (§18, PA-6).
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { fetchMyChainHooks, hookShortName, NO_CHAIN_HOOKS, type MyChainHooks } from '../lib/chainHooks';
import {
    dayBlocks,
    dayLabel,
    dayTotal,
    fetchClassPlan,
    shapeFrom,
    totalLine,
    type ClassPlan,
} from '../lib/classPlan';
import { fetchMixedSummary, type MixedSummary } from '../lib/mixedTeacher';
import { listTeacherClassActivities, type TeacherClassActivity } from '../lib/classActivities';
import { fetchClassToday, MAX_TODAY, setClassToday, type TodayActivity } from '../lib/classToday';

export default function TodayPanel({
    classId,
    sprintOn,
    mixedOn,
}: {
    classId: string;
    sprintOn: boolean;
    mixedOn: boolean;
}) {
    const [today, setToday] = useState<TodayActivity[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [choosing, setChoosing] = useState(false);
    const [options, setOptions] = useState<TeacherClassActivity[] | null>(null);
    const [hooks, setHooks] = useState<MyChainHooks>(NO_CHAIN_HOOKS);
    // PP-8: the day's detail (minutes, the dated hook, last time) from
    // class_plan for today's date; a failed read leaves the card plainer.
    const [detail, setDetail] = useState<ClassPlan | null>(null);
    const [mixed, setMixed] = useState<MixedSummary | null>(null);
    const [busy, setBusy] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Latest-wins (review P1): two quick picks or a class switch must not let
    // an older read land last.
    const detailSeq = useRef(0);
    const loadDetail = useCallback(
        async (onDate: string, stillLive: () => boolean = () => true) => {
            const seq = ++detailSeq.current;
            try {
                const d = await fetchClassPlan(classId, onDate, onDate);
                if (stillLive() && seq === detailSeq.current) setDetail(d);
            } catch {
                /* the card falls back to titles only */
            }
        },
        [classId],
    );

    useEffect(() => {
        let live = true;
        setToday(null);
        setFailed(false);
        setOptions(null);
        setChoosing(false);
        setSaveError(null);
        setDetail(null);
        fetchClassToday(classId)
            .then((t) => {
                if (!live) return;
                setToday(t.activities);
                void loadDetail(t.on_date, () => live);
            })
            .catch(() => live && setFailed(true));
        // The hook link is a convenience: without it the card still reads.
        fetchMyChainHooks()
            .then((h) => live && setHooks(h))
            .catch(() => undefined);
        fetchMixedSummary(classId)
            .then((m) => live && setMixed(m))
            .catch(() => undefined);
        return () => {
            live = false;
        };
    }, [classId, loadDetail]);

    useEffect(() => {
        if (!choosing || options) return;
        let live = true;
        listTeacherClassActivities()
            .then((all) => {
                if (live) setOptions(all.filter((a) => a.classId === classId && a.published));
            })
            .catch(() => {
                if (live) setSaveError("Couldn't load this class's activities. Try again.");
            });
        return () => {
            live = false;
        };
    }, [choosing, options, classId]);

    const pick = async (activityId: string, on: boolean) => {
        setBusy(true);
        setSaveError(null);
        try {
            const next = await setClassToday(classId, activityId, on);
            setToday(next.activities);
            void loadDetail(next.on_date);
        } catch (err) {
            const message = err instanceof Error ? err.message : '';
            const refused = message.includes('today_full') || message.includes('not_in_class');
            setSaveError(
                message.includes('today_full')
                    ? `A day holds ${MAX_TODAY} activities at most. Remove one first.`
                    : message.includes('not_in_class')
                      ? "That activity isn't available to this class any more."
                      : "That didn't save. Check your connection, then try again.",
            );
            // A refusal means this screen is out of date (another tab, or the
            // activity changed): show what the server now holds.
            if (refused) {
                setOptions(null);
                await fetchClassToday(classId)
                    .then((t) => setToday(t.activities))
                    .catch(() => undefined);
            }
        } finally {
            setBusy(false);
        }
    };

    if (failed) {
        return (
            <section className="ft-panel" aria-label="Today">
                <h2>Today</h2>
                <p className="ft-muted">Today's plan couldn't load. The rest of this page still works.</p>
            </section>
        );
    }
    if (!today) return null;

    const full = today.length >= MAX_TODAY;
    const hookChain = today.map((a) => hooks.activityChains[a.activity_id]).find(Boolean);
    // The card: class_plan's day when it has loaded, else today's titles alone.
    const shape = { ...shapeFrom({ on: sprintOn }, mixed), sprintOn, mixedOn };
    // The detail's day only while it holds exactly today's picks; a pick that
    // hasn't re-read yet (or whose re-read failed) shows the titles instead.
    const detailDay = detail?.days.find((d) => d.on_date === detail.today);
    const sameIds = (detailDay?.activities ?? [])
        .filter((a) => a.available)
        .map((a) => a.activity_id)
        .join() === today.map((a) => a.activity_id).join();
    const day = detailDay && sameIds
        ? detailDay
        : {
              activities: today.map((a, i) => ({ ...a, minutes: null, position: i + 1, available: true })),
              hook_ids: detailDay?.hook_ids ?? [],
          };
    const prompts = new Map(Object.values(hooks.chains).flat().map((h) => [h.id, h.prompt]));
    const firstHook = day.hook_ids[0];
    const firstPrompt = firstHook ? prompts.get(firstHook) : undefined;
    const blocks = dayBlocks(day, shape, firstPrompt ? hookShortName(firstPrompt) : null);
    const total = totalLine(dayTotal(day, shape));
    const onToday = new Set(today.map((a) => a.activity_id));
    const carry = (detail?.last_day?.activities ?? []).filter((a) => a.available && !onToday.has(a.activity_id));

    return (
        <section className="ft-panel" aria-label="Today">
            <h2>Today</h2>
            {today.length > 0 ? (
                <>
                    <ol className="ft-today-card" role="list" aria-label="Today's period">
                        {blocks.map((b, i) => (
                            <li key={`${b.kind}-${b.activityId ?? i}`} data-block={b.kind}>
                                <span className="ft-today-what">
                                    {b.kind === 'hook' && firstPrompt ? (
                                        // PP-8: the hook opens the present view, prompt full width.
                                        <Link to={`/classes/${classId}/present`}>Hook: {b.label}</Link>
                                    ) : b.kind === 'hook' ? (
                                        firstPrompt ? `Hook: ${b.label}` : 'Hook'
                                    ) : (
                                        b.label
                                    )}
                                </span>
                                <span className="ft-muted">{b.minutes}</span>
                            </li>
                        ))}
                    </ol>
                    {total && <p className="ft-today-total">{total}</p>}
                </>
            ) : (
                <p className="ft-muted">No activity picked for today. Students see their usual list.</p>
            )}
            {carry.length > 0 && detail?.last_day && (
                <div className="ft-today-carry">
                    <p className="ft-muted ft-small">Last time ({dayLabel(detail.last_day.on_date)}):</p>
                    <ul className="ft-today-list">
                        {carry.map((a) => (
                            <li key={a.activity_id}>
                                <span>{a.title}</span>
                                <button
                                    type="button"
                                    className="ft-btn"
                                    disabled={busy || full}
                                    aria-label={`Carry on ${a.title} today`}
                                    onClick={() => void pick(a.activity_id, true)}
                                >
                                    Carry on today
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <p className="ft-today-actions">
                <button
                    type="button"
                    className="ft-btn"
                    aria-expanded={choosing}
                    onClick={() => setChoosing((c) => !c)}
                >
                    {choosing ? 'Done' : today.length > 0 ? 'Change' : "Pick today's activity"}
                </button>
                {hookChain ? <Link to={`/chains/${hookChain}`}>Hooks for this unit</Link> : null}
                {/* PP-1: the Plan page, for any day after today. */}
                <Link to={`/classes/${classId}/plan`}>Plan ahead</Link>
                {/* PP-9: today on the projector. */}
                {today.length > 0 ? <Link to={`/classes/${classId}/present`}>Present</Link> : null}
            </p>
            {saveError ? <p role="alert">{saveError}</p> : null}
            {choosing && options ? (
                options.length > 0 ? (
                    <ul className="ft-today-list">
                        {options.map((a) => {
                            const picked = today.some((t) => t.activity_id === a.activityId);
                            return (
                                <li key={a.activityId}>
                                    <span>{a.title}</span>
                                    <button
                                        type="button"
                                        className="ft-btn"
                                        disabled={busy || (!picked && full)}
                                        aria-label={`${picked ? 'Remove from today' : 'Use today'}: ${a.title}`}
                                        onClick={() => void pick(a.activityId, !picked)}
                                    >
                                        {picked ? 'Remove' : 'Use today'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="ft-muted">This class has no published activities yet.</p>
                )
            ) : null}
            {choosing && full ? (
                <p className="ft-muted ft-small">Six is the most for one day.</p>
            ) : null}
        </section>
    );
}
