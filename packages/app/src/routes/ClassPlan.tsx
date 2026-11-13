// =============================================================================
// ClassPlan.tsx — /classes/:classId/plan, a class's next school days
// (period planner PP-1–PP-4, PP-6; docs/design/period-planner.md)
// -----------------------------------------------------------------------------
// Ten school days from the class's today, each a card: its activities in
// order (up / down, move to another day, remove), each one's time, the day's
// total as a range, and "Add activity". A teacher places every day by hand;
// nothing here fills a day in or suggests a date (§18). Students never see a
// plan, only today (class_today). Every rule is the server's (0088): this page
// re-reads its window after each write rather than guessing the result.
// Step 4a: the hook picker, "Make it due this day" and "Carry on today" are
// step 4b (PP-7, PP-10, PP-2's last day).
// =============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { TeacherNav } from '../components/TeacherNav';
import TimezoneControl from '../components/TimezoneControl';
import { formatActivityMinutes } from '../lib/activityMinutes';
import { listClasses } from '../lib/classes';
import { listTeacherClassActivities, type TeacherClassActivity } from '../lib/classActivities';
import {
    addDays,
    dayLabel,
    dayTotal,
    DEFAULT_SHAPE,
    fetchClassPlan,
    MAX_PER_DAY,
    moveClassPlanItem,
    PLAN_WINDOW_DAYS,
    planDates,
    planErrorMessage,
    reorderClassPlan,
    setClassPlan,
    shapeFrom,
    totalLine,
    windowEnd,
    type ClassPlan as Plan,
    type DayShape,
    type PlanDay,
    type PlannedActivity,
} from '../lib/classPlan';
import { fetchSprintOverview } from '../lib/factSprint';
import { fetchMixedSummary } from '../lib/mixedTeacher';

const BTN =
    'rounded-md border border-line-strong bg-canvas px-2 py-1 text-xs font-medium text-strong transition hover:bg-surface-2 disabled:opacity-50';
const LINK = 'text-xs font-medium text-muted underline underline-offset-2 hover:text-strong disabled:opacity-50';

export default function ClassPlan() {
    const { classId = '' } = useParams();
    const [className, setClassName] = useState<string | null>(null);
    const [start, setStart] = useState<string | null>(null);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [shape, setShape] = useState<DayShape>(DEFAULT_SHAPE);
    const [options, setOptions] = useState<TeacherClassActivity[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Latest-wins: only the newest read may set the page (review P1).
    const loadSeq = useRef(0);
    const startRef = useRef<string | null>(null);

    // The window: the server says what today is, so the first read is a span
    // around the browser's date wide enough to hold the class's today.
    const load = useCallback(
        async (from: string | null) => {
            const seq = ++loadSeq.current;
            try {
                const anchor = from ?? addDays(new Date().toISOString().slice(0, 10), -2);
                const first = await fetchClassPlan(classId, anchor, windowEnd(anchor, PLAN_WINDOW_DAYS + 2));
                // Never before the class's today: past days are read-only.
                const begin = from === null || from < first.today ? first.today : from;
                const p =
                    begin !== anchor
                        ? await fetchClassPlan(classId, begin, windowEnd(begin, PLAN_WINDOW_DAYS))
                        : first;
                if (seq !== loadSeq.current) return;
                startRef.current = begin;
                setStart(begin);
                setPlan(p);
                setLoadError(null);
            } catch (err) {
                if (seq !== loadSeq.current) return;
                setLoadError(err instanceof Error ? err.message : 'could not load');
            }
        },
        [classId],
    );

    useEffect(() => {
        void load(null);
        void listClasses()
            .then((all) => setClassName(all.find((c) => c.id === classId)?.name ?? null))
            .catch(() => setClassName(null));
        void listTeacherClassActivities()
            .then((all) => setOptions(all.filter((a) => a.classId === classId && a.published)))
            .catch(() => setOptions([]));
        // The total's parts: either read failing leaves that part out.
        void Promise.all([
            fetchSprintOverview(classId).catch(() => null),
            fetchMixedSummary(classId).catch(() => null),
        ]).then(([sprint, mixed]) => setShape(shapeFrom(sprint, mixed)));
    }, [classId, load]);

    const write = async (fn: () => Promise<unknown>) => {
        setBusy(true);
        setError(null);
        try {
            await fn();
        } catch (err) {
            setError(planErrorMessage(err));
        } finally {
            // Success or refusal, show what the server now holds (the CURRENT
            // window: startRef, not the start this closure was made with).
            await load(startRef.current);
            setBusy(false);
        }
    };

    const byDate = useMemo(() => new Map((plan?.days ?? []).map((d) => [d.on_date, d])), [plan]);
    const dates = useMemo(
        () => (start ? planDates(start, PLAN_WINDOW_DAYS, new Set(byDate.keys())) : []),
        [start, byDate],
    );

    if (loadError && !plan) {
        return (
            <Page className={className}>
                <p role="alert" className="text-sm text-danger">
                    The plan couldn’t load ({loadError}).
                </p>
            </Page>
        );
    }
    if (!plan || !start) {
        return (
            <Page className={className}>
                <p role="status" className="text-sm text-muted">
                    Loading…
                </p>
            </Page>
        );
    }

    const shift = (n: number) => {
        const next = addDays(start, n);
        void load(next < plan.today ? plan.today : next > plan.limit ? plan.limit : next);
    };

    return (
        <Page className={className}>
            <div className="mt-2">
                <TimezoneControl />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <button type="button" className={BTN} disabled={busy || start <= plan.today} onClick={() => shift(-14)}>
                    ← Earlier
                </button>
                <button type="button" className={BTN} disabled={busy || addDays(start, 14) > plan.limit} onClick={() => shift(14)}>
                    Later →
                </button>
                {start !== plan.today && (
                    <button type="button" className={LINK} disabled={busy} onClick={() => void load(plan.today)}>
                        Back to today
                    </button>
                )}
                <label className="ml-auto flex items-center gap-2 text-xs text-muted">
                    Go to
                    <input
                        type="date"
                        min={plan.today}
                        max={plan.limit}
                        disabled={busy}
                        className="rounded-md border border-line-strong bg-canvas px-2 py-1 text-xs text-ink"
                        // A COMPLETE date in range only: a year typed digit by
                        // digit would otherwise load 0002, 0020, … (review P1).
                        onChange={(e) => {
                            const v = e.target.value;
                            if (/^\d{4}-\d{2}-\d{2}$/.test(v) && v >= plan.today && v <= plan.limit) void load(v);
                        }}
                    />
                </label>
            </div>

            {error && (
                <p role="alert" className="mt-3 text-sm text-danger">
                    {error}
                </p>
            )}
            {loadError && (
                <p role="alert" className="mt-3 text-sm text-danger">
                    The plan couldn’t refresh ({loadError}).{' '}
                    <button type="button" className={LINK} onClick={() => void load(startRef.current)}>
                        Try again
                    </button>
                </p>
            )}

            {plan.last_day && start === plan.today && (
                <p className="mt-4 text-sm text-muted" data-last-day>
                    Last time ({dayLabel(plan.last_day.on_date)}):{' '}
                    {plan.last_day.activities.map((a) => a.title).join(' · ') || 'nothing planned'}
                </p>
            )}

            <ol className="mt-4 space-y-3" aria-label="Planned days">
                {dates.map((d) => (
                    <DayCard
                        key={d}
                        date={d}
                        isToday={d === plan.today}
                        canAdd={d >= plan.today && d <= plan.limit}
                        day={byDate.get(d) ?? { on_date: d, activities: [], hook_ids: [] }}
                        shape={shape}
                        options={options}
                        busy={busy}
                        today={plan.today}
                        limit={plan.limit}
                        onAdd={(id) => write(() => setClassPlan(classId, d, id, true))}
                        onRemove={(id) => write(() => setClassPlan(classId, d, id, false))}
                        onMove={(id, to) => write(() => moveClassPlanItem(classId, d, id, to))}
                        onReorder={(ids) => write(() => reorderClassPlan(classId, d, ids))}
                    />
                ))}
            </ol>
        </Page>
    );
}

function Page({ className, children }: { className: string | null; children: React.ReactNode }) {
    const { classId = '' } = useParams();
    return (
        <main className="min-h-screen bg-surface p-8">
            <div className="mx-auto max-w-2xl">
                <TeacherNav />
                <Link to={`/classes/${classId}/facts`} className="text-sm text-muted underline underline-offset-2 hover:text-strong">
                    ← Today &amp; practice
                </Link>
                <h1 className="mt-2 text-3xl font-bold text-ink">Plan{className ? ` · ${className}` : ''}</h1>
                {children}
            </div>
        </main>
    );
}

function DayCard({
    date,
    isToday,
    canAdd,
    day,
    shape,
    options,
    busy,
    today,
    limit,
    onAdd,
    onRemove,
    onMove,
    onReorder,
}: {
    date: string;
    isToday: boolean;
    canAdd: boolean;
    day: PlanDay;
    shape: DayShape;
    options: TeacherClassActivity[];
    busy: boolean;
    today: string;
    limit: string;
    onAdd: (activityId: string) => void;
    onRemove: (activityId: string) => void;
    onMove: (activityId: string, to: string) => void;
    onReorder: (activityIds: string[]) => void;
}) {
    const [choice, setChoice] = useState('');
    const [moving, setMoving] = useState<string | null>(null);
    const [moveTo, setMoveTo] = useState('');
    const visible = day.activities.filter((a) => a.available);
    const full = visible.length >= MAX_PER_DAY;
    const onDay = new Set(day.activities.map((a) => a.activity_id));
    const addable = options.filter((o) => !onDay.has(o.activityId));
    const total = totalLine(dayTotal(day, shape));
    const label = `${isToday ? 'Today · ' : ''}${dayLabel(date)}`;
    const ids = day.activities.map((a) => a.activity_id);
    const swap = (i: number, j: number) => {
        const next = [...ids];
        [next[i], next[j]] = [next[j]!, next[i]!];
        onReorder(next);
    };

    return (
        <li
            className="rounded-lg border border-line bg-canvas p-4 shadow-sm"
            aria-labelledby={`day-${date}`}
            data-plan-day={date}
        >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={`day-${date}`} className="text-base font-semibold text-ink">
                    {label}
                </h2>
                {total && (
                    <p className="text-xs text-muted" data-day-total>
                        {total}
                    </p>
                )}
            </div>

            {day.hook_ids.length > 0 && (
                <p className="mt-1 text-xs text-muted">Hook planned{day.hook_ids.length > 1 ? ` (${day.hook_ids.length}: one a day is the rule)` : ''}</p>
            )}

            {day.activities.length > 0 && (
                <ul className="mt-2 divide-y divide-line">
                    {day.activities.map((a, i) => (
                        <PlanRow
                            key={a.activity_id}
                            a={a}
                            first={i === 0}
                            last={i === day.activities.length - 1}
                            busy={busy}
                            moving={moving === a.activity_id}
                            moveTo={moveTo}
                            today={today}
                            limit={limit}
                            onUp={() => swap(i, i - 1)}
                            onDown={() => swap(i, i + 1)}
                            onRemove={() => onRemove(a.activity_id)}
                            onStartMove={() => {
                                setMoving(a.activity_id);
                                setMoveTo('');
                            }}
                            onMoveTo={setMoveTo}
                            onMove={() => {
                                if (moveTo && moveTo !== date) onMove(a.activity_id, moveTo);
                                setMoving(null);
                            }}
                            onCancelMove={() => setMoving(null)}
                        />
                    ))}
                </ul>
            )}

            {canAdd && (
                <form
                    className="mt-3 flex flex-wrap items-center gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (choice) {
                            onAdd(choice);
                            setChoice('');
                        }
                    }}
                >
                    <label className="sr-only" htmlFor={`add-${date}`}>
                        Add an activity on {dayLabel(date)}
                    </label>
                    <select
                        id={`add-${date}`}
                        value={choice}
                        disabled={full || busy || addable.length === 0}
                        onChange={(e) => setChoice(e.target.value)}
                        className="min-w-0 flex-1 rounded-md border border-line-strong bg-canvas px-2 py-1 text-sm text-ink"
                    >
                        <option value="">
                            {full
                                ? `Full (${MAX_PER_DAY} a day)`
                                : addable.length === 0
                                  ? 'No more published activities in this class'
                                  : 'Add activity…'}
                        </option>
                        {addable.map((o) => (
                            <option key={o.activityId} value={o.activityId}>
                                {o.title}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className={BTN} disabled={!choice || full || busy}>
                        Add
                    </button>
                </form>
            )}
        </li>
    );
}

function PlanRow({
    a,
    first,
    last,
    busy,
    moving,
    moveTo,
    today,
    limit,
    onUp,
    onDown,
    onRemove,
    onStartMove,
    onMoveTo,
    onMove,
    onCancelMove,
}: {
    a: PlannedActivity;
    first: boolean;
    last: boolean;
    busy: boolean;
    moving: boolean;
    moveTo: string;
    today: string;
    limit: string;
    onUp: () => void;
    onDown: () => void;
    onRemove: () => void;
    onStartMove: () => void;
    onMoveTo: (d: string) => void;
    onMove: () => void;
    onCancelMove: () => void;
}) {
    return (
        <li className="py-2" data-plan-activity={a.activity_id}>
            <div className="flex flex-wrap items-center gap-2">
                {a.available ? (
                    <Link to={`/activity/${a.activity_id}`} className="min-w-0 flex-1 truncate text-sm font-medium text-ink hover:underline">
                        {a.title}
                    </Link>
                ) : (
                    <span className="min-w-0 flex-1 truncate text-sm text-muted line-through">{a.title}</span>
                )}
                <span className="text-xs text-faint">
                    {!a.available
                        ? 'no longer available'
                        : a.minutes != null
                          ? formatActivityMinutes(a.minutes)
                          : 'time not set'}
                </span>
                <button type="button" className={BTN} disabled={first || busy} onClick={onUp} aria-label={`Move ${a.title} up`}>
                    ↑
                </button>
                <button type="button" className={BTN} disabled={last || busy} onClick={onDown} aria-label={`Move ${a.title} down`}>
                    ↓
                </button>
                {a.available && (
                    <button type="button" className={LINK} disabled={busy} onClick={onStartMove} aria-label={`Move ${a.title} to another day`}>
                        Move to…
                    </button>
                )}
                <button type="button" className={LINK} disabled={busy} onClick={onRemove} aria-label={`Remove ${a.title}`}>
                    Remove
                </button>
            </div>
            {moving && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <label htmlFor={`move-${a.activity_id}`} className="text-muted">
                        Move {a.title} to
                    </label>
                    <input
                        id={`move-${a.activity_id}`}
                        type="date"
                        min={today}
                        max={limit}
                        value={moveTo}
                        onChange={(e) => onMoveTo(e.target.value)}
                        className="rounded-md border border-line-strong bg-canvas px-2 py-1 text-xs text-ink"
                    />
                    <button type="button" className={BTN} disabled={!moveTo || busy} onClick={onMove}>
                        Move
                    </button>
                    <button type="button" className={LINK} onClick={onCancelMove}>
                        Cancel
                    </button>
                </div>
            )}
        </li>
    );
}
