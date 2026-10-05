// =============================================================================
// demoResults.ts — invented results for the demo's teacher view (DR-4)
// -----------------------------------------------------------------------------
// "See what your teacher sees (demo data)": the REAL results screen
// (routes/FactsTeacher → Results) on a made-up class of eight, in exactly the
// shape fact_probe_results returns. Every name and number here is invented and
// the screen says so. The numbers are internally consistent, so a teacher
// rehearsing with it is not misled:
//
//   8 in class · 7 started · 5 finished · 6 with a result · 1 too little
//   rates 9.5, 12.4, 14.1, 18.0, 27.3, 31.2 → median 16.05, floor 16.9 → below
//   each fact family is labelled on its own questions (80% right, then 80%
//   quick and right); there is no single label per student
// =============================================================================

import type { FamilyReading, ProbeResults, StudentRow } from '../lib/factProbe';

/** One family reading, labelled by the ruled rule at 80% / 80% (accuracy
 *  first; fewer counted items than the minimum of 5 is not judged). */
const fam = (id: string, name: string, right: number, met: number, counted = 5): FamilyReading => {
    const group =
        counted < 5 ? null : right / counted < 0.8 ? 'needs_strategy' : met / counted >= 0.8 ? 'fluent' : 'slow';
    return {
        family_id: id,
        name,
        counted,
        right,
        met,
        group,
        status: group === null ? 'not_judged' : group === 'fluent' ? 'met' : 'not_met',
    };
};

/** [right, quick-and-right] of 5 for each of the three demo families. */
const families = (mult: [number, number], div: [number, number], neg: [number, number]): FamilyReading[] => [
    fam('fact.mult.to-12', 'Multiplication to 12 × 12', ...mult),
    fam('fact.div.to-12', 'Division to 144 ÷ 12', ...div),
    fam('fact.int.add', 'Adding integers', ...neg),
];

const row = (i: number, name: string, extra: Partial<StudentRow>): StudentRow => ({
    student_id: `demo-${i}`,
    name,
    is_member: true,
    status: 'finished',
    done: 55,
    has_rate: true,
    rate: null,
    right: 0,
    met: 0,
    skipped: 0,
    not_counted: 0,
    counted: 55,
    group: null,
    typing_flag: false,
    families: [],
    ...extra,
});

export const DEMO_RESULTS: ProbeResults = {
    probe: {
        id: 'demo',
        class_id: 'demo',
        join_code: 'DEMO',
        year_level: 8,
        opened_at: '2027-02-08T21:00:00Z',
        closes_at: '2027-02-15T21:00:00Z',
        closed_at: '2027-02-08T21:40:00Z',
        auto_closed: false,
        state: 'closed',
        item_count: 55,
    },
    class: {
        in_class: 8,
        started: 7,
        finished: 5,
        with_rate: 6,
        left_out: 1,
        median_rate: 16.05,
        floor: 16.9,
        min_students: 5,
        verdict: 'below',
        groups: { fluent: 2, slow: 2, needs_strategy: 2 },
        closed_by: 'teacher',
    },
    students: [
        row(1, 'Aroha (demo)', { rate: 9.5, right: 38, met: 20, skipped: 6, group: 'needs_strategy', families: families([5, 5], [4, 2], [3, 1]) }),
        row(2, 'Ben (demo)', { rate: 31.2, right: 54, met: 51, group: 'fluent', families: families([5, 5], [5, 5], [5, 4]) }),
        row(3, 'Caleb (demo)', { rate: 12.4, right: 52, met: 24, skipped: 1, group: 'slow', families: families([5, 4], [5, 2], [4, 2]) }),
        row(4, 'Dina (demo)', { rate: 27.3, right: 53, met: 47, group: 'fluent', not_counted: 2, counted: 53, families: families([5, 5], [4, 4], [5, 5]) }),
        row(5, 'Eli (demo)', { rate: 14.1, right: 41, met: 26, skipped: 4, group: 'needs_strategy', typing_flag: true, families: families([5, 4], [4, 3], [2, 1]) }),
        row(6, 'Fetu (demo)', { status: 'in_progress', done: 31, counted: 31, rate: 18.0, right: 30, met: 17, group: 'slow', families: [fam('fact.mult.to-12', 'Multiplication to 12 × 12', 5, 4), fam('fact.div.to-12', 'Division to 144 ÷ 12', 4, 2), fam('fact.int.add', 'Adding integers', 2, 1, 3)] }),
        row(7, 'Grace (demo)', { status: 'in_progress', done: 4, counted: 4, has_rate: false, right: 4, met: 3, families: [fam('fact.mult.to-12', 'Multiplication to 12 × 12', 2, 2, 2), fam('fact.div.to-12', 'Division to 144 ÷ 12', 1, 1, 1), fam('fact.int.add', 'Adding integers', 1, 0, 1)] }),
        row(8, 'Hemi (demo)', { status: 'not_started', done: 0, counted: 0, has_rate: false }),
    ],
};
