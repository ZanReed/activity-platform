// =============================================================================
// progressCsv.ts — class progress as a CSV (UI review E-1,
// docs/design/ui-review-group-e.md)
// -----------------------------------------------------------------------------
// One row per student, two columns per activity, from the grid the page
// already loaded (nothing new is fetched), read through the grid's OWN
// `cellStatus` so the file says what the cell says (Fable review of E-1):
//   "<title> — sections checked"   "3 of 5", "3 of 5 (older version)" for
//                                  work on an earlier version (CP-6),
//                                  "started (total not recorded)", or blank
//   "<title> — % right"            as the grid: a whole percent on DONE
//                                  cells where the computer marked anything
// Written answers waiting for the teacher are not grades, so they don't
// count. DoL passes are not in the class grid, so not in the file.
//
// Safe for spreadsheets: every field is quoted, quotes are doubled, and a
// field that a spreadsheet would read as a formula (= + - @, tab, CR) gets a
// leading apostrophe — a student's NAME is free text.
// =============================================================================

import { cellStatus, type ClassProgress } from './classProgress';

/** One CSV field: quoted, quotes doubled, formula-looking text defused. */
export function csvField(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '""';
    let s = String(value);
    if (typeof value === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
}

export function classProgressCsv(grid: ClassProgress): string {
    const header = ['Student'];
    for (const a of grid.activities) {
        header.push(`${a.title} — sections checked`, `${a.title} — % right`);
    }
    const cellFor = new Map(grid.cells.map((c) => [`${c.student_id}|${c.activity_id}`, c]));
    const rows = grid.students.map((st) => {
        const out: (string | number | null)[] = [st.name];
        for (const a of grid.activities) {
            const status = cellStatus(cellFor.get(`${st.student_id}|${a.activity_id}`));
            const older = status.older ? ' (older version)' : '';
            out.push(
                status.kind === 'none'
                    ? null
                    : status.kind === 'started_unknown'
                      ? `started (total not recorded)${older}`
                      : `${status.checked} of ${status.total}${older}`,
            );
            out.push(status.percent);
        }
        return out;
    });
    // \r\n and a BOM: what Excel needs to read UTF-8 names correctly.
    return '\uFEFF' + [header, ...rows].map((r) => r.map(csvField).join(',')).join('\r\n') + '\r\n';
}

/** The file name: "<class> progress <yyyy-mm-dd>.csv", filesystem-safe. */
export function classProgressFileName(className: string, today = new Date()): string {
    const safe = className.replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'Class';
    return `${safe} progress ${today.toISOString().slice(0, 10)}.csv`;
}
