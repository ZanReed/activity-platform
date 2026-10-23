// =============================================================================
// WhoFirst.tsx — "Who to see first", the class's practice page (curriculum D68)
// -----------------------------------------------------------------------------
// docs/design/mixed-practice-teacher-panel.md W-2, W-3, W-4, W-7, W-8, W-9 and
// slice 4's S4-1 (one list for the page, shown when either practice is on).
//
//   CLOSED BY DEFAULT. Nothing is fetched and no name is in the page until the
//   teacher opens it (W-2, DM-18); it is never on a full-screen view.
//   GROUPS, NOT A RANK. "Getting stuck on a skill" (mixed practice, and the
//   number-facts "needs a strategy" rows beside — never merged with — them),
//   then "Same mistake twice"; name order inside each; "Everyone else (n)" is
//   a count. No scores, rates or colour-only flags.
//   LIVE. While open and the tab is visible it re-reads every 5 s (the
//   realtime client is stubbed — CLAUDE.md). A failed read keeps the list and
//   says when it was last updated (W-7).
//   A ROW opens that student's last 10 first tries in this class (W-8).
//
// Words (W-9): never "struggling", "behind", "weak", "at risk" or "slow".
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    fetchStudentRecent,
    fetchWhoFirst,
    skillName,
    type RecentTry,
    type SkillRef,
    type WhoFirst as WhoFirstData,
} from '../lib/mixedTeacher';
import { longDay } from './yearEnd';

export const WHO_FIRST_POLL_MS = 5000;

type Row =
    | { kind: 'stuck'; key: string; studentId: string; name: string; skills: SkillRef[] }
    | { kind: 'facts'; key: string; studentId: string; name: string; families: string[] }
    | {
          kind: 'mistake';
          key: string;
          studentId: string;
          name: string;
          mistakes: WhoFirstData['same_mistake'][number]['mistakes'];
      };

/** At most two skills, then "+n" (W-8); the full list stays in the
 * accessible name. */
function skillsShort(skills: SkillRef[]): { shown: string; full: string } {
    const names = skills.map(skillName);
    const shown = names.slice(0, 2).join('; ') + (names.length > 2 ? ` +${names.length - 2}` : '');
    return { shown, full: names.join('; ') };
}

function clock(at: Date): string {
    return at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function WhoFirst({ classId }: { classId: string }) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<WhoFirstData | null>(null);
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
    const [stale, setStale] = useState(false);
    const [drawer, setDrawer] = useState<string | null>(null);
    // Each read carries a generation; closing the list (or a newer read)
    // retires every older one, so a slow answer never lands after "Hide the
    // list" or over a fresher list (Fable review 2026-10-23, P3-2).
    const generation = useRef(0);

    const read = useCallback(async () => {
        const mine = ++generation.current;
        try {
            const next = await fetchWhoFirst(classId);
            if (mine !== generation.current) return;
            setData(next);
            setUpdatedAt(new Date());
            setStale(false);
        } catch {
            if (mine === generation.current) setStale(true);
        }
    }, [classId]);

    useEffect(() => {
        if (!open) {
            // Closed: the names leave the page (W-2), and any read still out
            // is retired.
            generation.current += 1;
            setData(null);
            setUpdatedAt(null);
            setStale(false);
            setDrawer(null);
            return;
        }
        void read();
        const timer = window.setInterval(() => {
            if (document.visibilityState === 'visible') void read();
        }, WHO_FIRST_POLL_MS);
        return () => window.clearInterval(timer);
    }, [open, read]);

    const rows = (list: Row[]) =>
        list.map((row) => (
            <WhoRow
                key={row.key}
                row={row}
                classId={classId}
                open={drawer === row.key}
                onToggle={() => setDrawer((d) => (d === row.key ? null : row.key))}
            />
        ));

    let body = null;
    if (open) {
        if (!data) {
            body = stale ? (
                <p className="ft-muted">This did not load. It will try again in a few seconds.</p>
            ) : (
                <p className="ft-muted" role="status">Loading…</p>
            );
        } else {
            const stuck: Row[] = [
                ...data.stuck.map((s): Row => ({ kind: 'stuck', key: `s:${s.student_id}`, studentId: s.student_id, name: s.name, skills: s.skills })),
                ...data.facts.map((s): Row => ({ kind: 'facts', key: `f:${s.student_id}`, studentId: s.student_id, name: s.name, families: s.families })),
            ].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()) || a.kind.localeCompare(b.kind));
            const same: Row[] = data.same_mistake.map((s) => ({
                kind: 'mistake',
                key: `m:${s.student_id}`,
                studentId: s.student_id,
                name: s.name,
                mistakes: s.mistakes,
            }));
            body = (
                <>
                    {data.started_today === 0 ? (
                        <p className="ft-note">Students haven’t started today’s practice.</p>
                    ) : stuck.length === 0 && same.length === 0 ? (
                        <p className="ft-note">No one needs you right now.</p>
                    ) : null}
                    {stuck.length > 0 ? (
                        <section className="ft-who-group" aria-labelledby="ft-who-stuck">
                            <h3 id="ft-who-stuck">Getting stuck on a skill</h3>
                            <ul className="ft-who-list">{rows(stuck)}</ul>
                        </section>
                    ) : null}
                    {same.length > 0 ? (
                        <section className="ft-who-group" aria-labelledby="ft-who-same">
                            <h3 id="ft-who-same">Same mistake twice</h3>
                            <ul className="ft-who-list">{rows(same)}</ul>
                        </section>
                    ) : null}
                    {data.started_today > 0 ? (
                        <p className="ft-muted ft-small">Everyone else ({data.everyone_else})</p>
                    ) : null}
                    {stale && updatedAt ? (
                        <p className="ft-muted ft-small" role="status">
                            Not updated since {clock(updatedAt)}.
                        </p>
                    ) : null}
                </>
            );
        }
    }

    return (
        <div className="ft-panel" data-testid="ft-who">
            <h2>Who to see first</h2>
            <p className="ft-muted">
                Students who have practised today and are getting stuck, or making the same mistake
                again. Names are hidden until you open the list; keep it off a projector.
            </p>
            <button type="button" className="ft-link" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
                {open ? 'Hide the list' : 'Show the list'}
            </button>
            {body}
        </div>
    );
}

function WhoRow({
    row,
    classId,
    open,
    onToggle,
}: {
    row: Row;
    classId: string;
    open: boolean;
    onToggle: () => void;
}) {
    let detail: { shown: string; full: string };
    if (row.kind === 'stuck') {
        detail = skillsShort(row.skills);
    } else if (row.kind === 'facts') {
        const fams = row.families.join('; ');
        detail = { shown: `Number facts: needs a strategy (${fams})`, full: `Number facts: needs a strategy (${fams})` };
    } else {
        // W-8: the misconception's words, and the skill it showed on.
        const words = row.mistakes.map(
            (m) => `Same mistake: ${m.label ?? m.id} (${m.skills.map(skillName).join('; ')})`,
        );
        detail = { shown: words.join(' · '), full: words.join('. ') };
    }

    // Number-facts rows have no practice history to open (W-8 is mixed only).
    if (row.kind === 'facts') {
        return (
            <li className="ft-who-row">
                <span className="ft-who-name">{row.name}</span>
                <span className="ft-who-detail">{detail.shown}</span>
            </li>
        );
    }
    return (
        <li className="ft-who-row">
            <button
                type="button"
                className="ft-who-open"
                aria-expanded={open}
                aria-label={`${row.name}: ${detail.full}`}
                onClick={onToggle}
            >
                <span className="ft-who-name">{row.name}</span>
                <span className="ft-who-detail" title={detail.full}>
                    {detail.shown}
                </span>
            </button>
            {open ? <Drawer classId={classId} studentId={row.studentId} /> : null}
        </li>
    );
}

/** The student's last 10 first tries in this class (W-8). */
function Drawer({ classId, studentId }: { classId: string; studentId: string }) {
    const [tries, setTries] = useState<RecentTry[] | null>(null);
    const [failed, setFailed] = useState(false);
    const live = useRef(true);
    useEffect(() => {
        live.current = true;
        fetchStudentRecent(classId, studentId).then(
            (t) => live.current && setTries(t),
            () => live.current && setFailed(true),
        );
        return () => {
            live.current = false;
        };
    }, [classId, studentId]);

    if (failed) return <p className="ft-muted ft-small">This did not load.</p>;
    if (!tries) return <p className="ft-muted ft-small" role="status">Loading…</p>;
    if (tries.length === 0) return <p className="ft-muted ft-small">No practice yet in this class.</p>;
    return (
        <div className="ft-tablewrap" data-testid="ft-who-drawer">
            <table className="ft-table">
                <caption className="ft-muted ft-small" style={{ textAlign: 'left' }}>
                    Last {tries.length} first tries, newest first
                </caption>
                <thead>
                    <tr>
                        <th scope="col">Day</th>
                        <th scope="col">Skill</th>
                        <th scope="col">First try</th>
                        <th scope="col">Mistake</th>
                    </tr>
                </thead>
                <tbody>
                    {tries.map((t, i) => (
                        <tr key={i}>
                            <td>{longDay(t.practice_day).replace(/,? \d{4}$/, '')}</td>
                            <td>{t.skill_label ?? t.skill_id}</td>
                            <td>
                                {t.skipped ? (
                                    'Skipped'
                                ) : t.correct ? (
                                    <>
                                        <span aria-hidden="true">✓ </span>Right
                                    </>
                                ) : (
                                    <>
                                        <span aria-hidden="true">✕ </span>Not right
                                    </>
                                )}
                            </td>
                            <td>{t.mistakes.length === 0 ? '—' : t.mistakes.map((m) => m.label ?? m.id).join('; ')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
