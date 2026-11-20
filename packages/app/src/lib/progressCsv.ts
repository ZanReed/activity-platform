// =============================================================================
// progressCsv.ts — the class gradebook file (UI review E-1, ui-review-group-e.md;
// extended by docs/design/gradebook-export.md, GB-1..GB-13, ruled 2026-11-20)
// -----------------------------------------------------------------------------
// One row per student: name, email (GB-8, deliberately reversing E-1's
// names-only ruling), then per activity:
//   "<title> — due"               DD-4, only when the class has any dates
//   "<title> — sections checked"  "3 of 5", "3 of 5 (older version)" (CP-6),
//                                 "started (total not recorded)", or blank
//   "<title> — % right"           auto-marked work, whole percent, DONE cells
//                                 only, read through the grid's OWN
//                                 `cellStatus` so the file says what the cell
//                                 says (Fable review of E-1)
// and, for an activity with hand-graded questions (GB-2, numbers only so a
// spreadsheet can add them):
//   "— points"  "— points possible"  "— points pending"  "— notes"
//   released grades only (the latest per question, across versions, as the
//   student sees them); possible is the version's whole rubric total; pending
//   is the points of questions not graded or not released yet; notes carries
//   "older version", "grades from an earlier version" and "answer changed
//   since graded".
// and, for an activity whose DoL names a skill (GB-4):
//   "— DoL passed"   "Passed", "Passed (teacher)", or blank
// Auto and hand marks stay in separate columns (GB-3: weighting them is the
// teacher's call). Last, only for a class that has ever recorded practice
// scores (GB-5, ER-7: labelled apart from attainment), pooled over closed
// graded sessions: "Practice score — average %", "— sessions", "— latest %",
// then the same for reviews.
//
// Safe for spreadsheets: every field is quoted, quotes are doubled, and a
// field that a spreadsheet would read as a formula (= + - @, tab, CR) gets a
// leading apostrophe — a student's NAME is free text.
// =============================================================================

import { cellStatus, type ClassProgress } from './classProgress';
import type { ClassGradebook, GradebookHand, GradebookPractice } from './gradebook';

/** One CSV field: quoted, quotes doubled, formula-looking text defused. */
export function csvField(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '""';
    let s = String(value);
    if (typeof value === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
}

const percent = (right: number, planned: number): number | null =>
    planned > 0 ? Math.round((right / planned) * 100) : null;

function handNotes(h: GradebookHand, olderVersion: boolean): string | null {
    const notes: string[] = [];
    if (olderVersion) notes.push('older version');
    else if (h.from_older > 0) notes.push(h.from_older === 1 ? '1 grade from an earlier version' : `${h.from_older} grades from an earlier version`);
    if (h.stale > 0) notes.push(h.stale === 1 ? 'answer changed since graded' : `${h.stale} answers changed since graded`);
    return notes.length ? notes.join('; ') : null;
}

export function gradebookCsv(
    grid: ClassProgress,
    book: ClassGradebook,
    due?: ReadonlyMap<string, string>,
): string {
    // The due column only when the class has any dates (a class that never
    // uses them gets no column of blanks per activity).
    const withDue = (due?.size ?? 0) > 0;
    const hasHand = new Set(book.hand_activities);
    const hasDol = new Set(book.dol_activities);
    const header = ['Student', 'Email'];
    for (const a of grid.activities) {
        if (withDue) header.push(`${a.title} — due`);
        header.push(`${a.title} — sections checked`, `${a.title} — % right`);
        if (hasHand.has(a.activity_id)) {
            header.push(
                `${a.title} — points`,
                `${a.title} — points possible`,
                `${a.title} — points pending`,
                `${a.title} — notes`,
            );
        }
        if (hasDol.has(a.activity_id)) header.push(`${a.title} — DoL passed`);
    }
    if (book.practice_shown) {
        header.push(
            'Practice score — average %',
            'Practice score — sessions',
            'Practice score — latest %',
            'Review score — average %',
            'Review score — sessions',
        );
    }

    const key = (sid: string, aid: string) => `${sid}|${aid}`;
    const cellFor = new Map(grid.cells.map((c) => [key(c.student_id, c.activity_id), c]));
    const handFor = new Map(book.hand.map((h) => [key(h.student_id, h.activity_id), h]));
    const dolFor = new Map(book.dol.map((d) => [key(d.student_id, d.activity_id), d]));
    const emailOf = new Map(book.students.map((s) => [s.student_id, s.email]));
    const practiceFor = new Map<string, GradebookPractice>(
        book.practice.map((p) => [`${p.student_id}|${p.review ? 'review' : 'practice'}`, p]),
    );

    const rows = grid.students.map((st) => {
        const out: (string | number | null)[] = [st.name, emailOf.get(st.student_id) ?? null];
        for (const a of grid.activities) {
            const status = cellStatus(cellFor.get(key(st.student_id, a.activity_id)));
            const older = status.older ? ' (older version)' : '';
            if (withDue) out.push(due?.get(a.activity_id) ?? null); // DD-4: YYYY-MM-DD, sorts
            out.push(
                status.kind === 'none'
                    ? null
                    : status.kind === 'started_unknown'
                      ? `started (total not recorded)${older}`
                      : `${status.checked} of ${status.total}${older}`,
            );
            out.push(status.percent);
            if (hasHand.has(a.activity_id)) {
                const h = handFor.get(key(st.student_id, a.activity_id));
                if (h) out.push(h.points, h.possible, h.pending, handNotes(h, status.older));
                else out.push(null, null, null, null);
            }
            if (hasDol.has(a.activity_id)) {
                const d = dolFor.get(key(st.student_id, a.activity_id));
                out.push(d ? (d.source === 'teacher' ? 'Passed (teacher)' : 'Passed') : null);
            }
        }
        if (book.practice_shown) {
            const p = practiceFor.get(`${st.student_id}|practice`);
            const r = practiceFor.get(`${st.student_id}|review`);
            out.push(
                p ? percent(p.right, p.planned) : null,
                p ? p.sessions : null,
                p ? percent(p.latest_right, p.latest_planned) : null,
                r ? percent(r.right, r.planned) : null,
                r ? r.sessions : null,
            );
        }
        return out;
    });
    // \r\n and a BOM: what Excel needs to read UTF-8 names correctly.
    return '\uFEFF' + [header, ...rows].map((r) => r.map(csvField).join(',')).join('\r\n') + '\r\n';
}

/** The file name: "<class> gradebook <class's date>.csv", filesystem-safe.
 * The day is the class's own (GB-13), not UTC. */
export function gradebookFileName(className: string, day: string): string {
    const safe = className.replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'Class';
    return `${safe} gradebook ${day}.csv`;
}
