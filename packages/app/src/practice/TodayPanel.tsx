// =============================================================================
// TodayPanel.tsx — the teacher's plan for today, top of the class's Practice
// page (period assembly PA-3, PA-8; docs/design/period-assembly.md)
// -----------------------------------------------------------------------------
// The period as one line, a link to the hook page, and the pick. No student
// names, so it is safe on a projector. No clock (PA-11). Nothing here starts,
// locks or schedules anything (§18, PA-6).
// =============================================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { fetchMyChainHooks } from '../lib/chainHooks';
import { listTeacherClassActivities, type TeacherClassActivity } from '../lib/classActivities';
import { fetchClassToday, MAX_TODAY, setClassToday, type TodayActivity } from '../lib/classToday';

/**
 * §17's order: number facts, one hook a day, then each activity with its
 * practice. Only what the class has on is named. Exported for its tests.
 */
export function periodLine(
    sprintOn: boolean,
    mixedOn: boolean,
    titles: readonly string[],
): string {
    const parts: string[] = [];
    if (sprintOn) parts.push('Number facts 5');
    parts.push('Hook');
    for (const title of titles) {
        parts.push(title);
        if (mixedOn) parts.push('Practice');
    }
    return parts.join(' · ');
}

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
    const [chains, setChains] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        let live = true;
        setToday(null);
        setFailed(false);
        setOptions(null);
        setChoosing(false);
        setSaveError(null);
        fetchClassToday(classId)
            .then((t) => live && setToday(t.activities))
            .catch(() => live && setFailed(true));
        // The hook link is a convenience: without it the line still reads.
        fetchMyChainHooks()
            .then((h) => live && setChains(h.activityChains))
            .catch(() => undefined);
        return () => {
            live = false;
        };
    }, [classId]);

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
            setToday((await setClassToday(classId, activityId, on)).activities);
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
    const hookChain = today.map((a) => chains[a.activity_id]).find(Boolean);

    return (
        <section className="ft-panel" aria-label="Today">
            <h2>Today</h2>
            {today.length > 0 ? (
                <p className="ft-today-line">
                    {periodLine(
                        sprintOn,
                        mixedOn,
                        today.map((a) => a.title),
                    )}
                </p>
            ) : (
                <p className="ft-muted">No activity picked for today. Students see their usual list.</p>
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
