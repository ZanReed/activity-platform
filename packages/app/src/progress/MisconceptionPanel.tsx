// =============================================================================
// MisconceptionPanel.tsx — "Common misconceptions" (D7, D8, DR-9, DR-10)
// -----------------------------------------------------------------------------
// One row per misconception the grader tagged on rostered students' checks:
// the registry's description (or "Unknown misconception" and the id, when the
// registry does not mirror it — visible, never silent), how many students
// showed it on any attempt and how many still do on their latest, and on the
// class page which activities. A disclosure opens the students (Hide names
// applies), each linking to that student's answer panel.
// =============================================================================

import { useState } from 'react';
import { Link } from 'react-router';
import type { MisconceptionRow } from '../lib/classProgress';

export function countWords(ever: number, still: number): { short: string; full: string } {
    const s = (n: number) => (n === 1 ? 'student' : 'students');
    return {
        short: `${ever} showed it · ${still} still ${still === 1 ? 'does' : 'do'}`,
        full: `${ever} ${s(ever)} showed it, ${still} still ${still === 1 ? 'does' : 'do'}`,
    };
}

export default function MisconceptionPanel({
    rows,
    showActivities,
    nameOf,
    studentHref,
}: {
    rows: MisconceptionRow[];
    showActivities: boolean;
    nameOf: (studentId: string, name: string) => string;
    studentHref: (studentId: string, activityId: string) => string;
}) {
    return (
        <section aria-labelledby="cp-mis-h" className="mt-8">
            <h2 id="cp-mis-h" className="mb-1 text-base font-semibold text-ink">
                Common misconceptions
            </h2>
            <p className="mb-3 text-sm text-muted">
                From the mistakes the activities tag. "Still" counts students whose latest try at
                that section shows it.
            </p>
            {rows.length === 0 ? (
                <p className="text-sm text-muted">No tagged misconceptions in this work yet.</p>
            ) : (
                <ul className="divide-y divide-line rounded-lg border border-line bg-canvas px-4">
                    {rows.map((m) => (
                        <MisconceptionItem
                            key={m.id}
                            row={m}
                            showActivities={showActivities}
                            nameOf={nameOf}
                            studentHref={studentHref}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

function MisconceptionItem({
    row,
    showActivities,
    nameOf,
    studentHref,
}: {
    row: MisconceptionRow;
    showActivities: boolean;
    nameOf: (studentId: string, name: string) => string;
    studentHref: (studentId: string, activityId: string) => string;
}) {
    const [open, setOpen] = useState(false);
    const words = countWords(row.ever, row.still);
    const titles = new Map(row.activities.map((a) => [a.activity_id, a.title]));
    const panelId = `cp-mis-${row.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    return (
        <li className="py-2">
            <button
                type="button"
                className="cp-disclosure"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen(!open)}
            >
                <span aria-hidden="true" className="text-muted">
                    {open ? '▾' : '▸'}
                </span>
                <span className="flex-1">
                    {row.description ? (
                        <span className="text-ink">{row.description}</span>
                    ) : (
                        <span className="text-ink">
                            Unknown misconception <span className="cp-mono text-muted">{row.id}</span>
                        </span>
                    )}
                    <span className="block text-sm text-muted">
                        <span aria-hidden="true">{words.short}</span>
                        <span className="sr-only">{words.full}</span>
                        {showActivities && row.activities.length > 0 && (
                            <> · {row.activities.map((a) => a.title).join(', ')}</>
                        )}
                    </span>
                </span>
            </button>
            {open && (
                <ul id={panelId} className="mb-2 ml-6 space-y-1 text-sm">
                    {row.students.map((s) => (
                        <li key={`${s.student_id}:${s.activity_id}`}>
                            <Link
                                to={studentHref(s.student_id, s.activity_id)}
                                className="text-strong underline underline-offset-2"
                            >
                                {nameOf(s.student_id, s.name)}
                                {showActivities ? ` · ${titles.get(s.activity_id) ?? 'activity'}` : ''}
                            </Link>
                            <span className="ml-2 text-muted">{s.still ? 'still shows it' : 'not on their latest try'}</span>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
}
