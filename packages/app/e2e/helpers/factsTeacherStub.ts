// A stateful stand-in for the teacher's number-facts RPCs (migrations 0045, 0048), for
// the stub lanes. RPC names are the production constants (P2); payload shapes
// are the ones verify-0045 asserts the real functions return.
import type { Page } from '@playwright/test';
import { FACT_PROBE_RPC } from '../../src/lib/factProbeRpc';

export const FT_CLASS_ID = 'eeeeeeee-0000-4000-8000-00000000e2e1';
export const FT_PROBE_ID = 'cccccccc-0000-4000-8000-00000000e2e2';
export const FT_CODE = 'ABC234';

const family = (id: string, name: string, right: number, met: number, group: string | null) => ({
  family_id: id, name, counted: group === null ? 2 : 5, right, met, group,
  status: group === null ? 'not_judged' : group === 'fluent' ? 'met' : 'not_met',
});

const row = (i: number, name: string, extra: Record<string, unknown>) => ({
  student_id: `dddddddd-0000-4000-8000-0000000000${String(i).padStart(2, '0')}`,
  name, is_member: true, status: 'finished', done: 40, has_rate: true, rate: 20, right: 36,
  met: 30, skipped: 1, not_counted: 0, counted: 40, group: 'fluent', typing_flag: false,
  families: [
    family('fact.mult.to-12', 'Multiplication to 12 × 12', 5, 5, 'fluent'),
    family('fact.div.to-12', 'Division to 144 ÷ 12', 4, 2, 'slow'),
    family('fact.square.to-144', 'Square numbers to 144', 2, 2, null),
  ],
  ...extra,
});

export const FT_STUDENTS = [
  row(1, 'Aroha Ngata', { group: 'needs_strategy', rate: 9.5, right: 22, met: 12, typing_flag: true }),
  row(2, 'Ben Carter', { rate: 31.2 }),
  row(3, 'Caleb Wu', { status: 'in_progress', done: 14, group: 'slow', rate: 12.4, right: 13, met: 4 }),
  row(4, 'Dina Patel', { status: 'not_started', done: 0, has_rate: false, rate: null, group: null, right: 0, met: 0, skipped: 0, families: [] }),
];

export interface TeacherStub {
  state: 'none' | 'open' | 'closed';
  /** The class's school-year end (0048); null until set_class_year_end. */
  schoolYearEndsOn: string | null;
  /** Set when the prune has removed the check's student rows (0048). */
  prunedAt: string | null;
  yearEnds: { p_class_id: string; p_ends_on: string }[];
  /** Every RPC in call order, to prove the end date is saved BEFORE the open. */
  calls: string[];
  opens: { p_class_id: string; p_year_level: number }[];
  closes: number;
  resultReads: number;
}

export async function stubFactsTeacherApi(
  page: Page,
  initial: TeacherStub['state'] = 'none',
  options: { prunedAt?: string } = {},
): Promise<TeacherStub> {
  const stub: TeacherStub = {
    state: initial, schoolYearEndsOn: null, prunedAt: options.prunedAt ?? null,
    yearEnds: [], calls: [], opens: [], closes: 0, resultReads: 0,
  };
  const classStat = () => ({
    in_class: 28, started: 23, finished: 17, with_rate: 20, left_out: 3, median_rate: 14.2,
    floor: 19.6, min_students: 5, verdict: 'below',
    groups: { fluent: 6, slow: 9, needs_strategy: 5 },
    ...(stub.state === 'closed' ? { closed_by: 'teacher' } : {}),
  });
  const probe = () => ({
    id: FT_PROBE_ID, class_id: FT_CLASS_ID, join_code: FT_CODE, year_level: 8,
    opened_at: '2027-02-08T21:00:00Z', closes_at: '2027-02-15T21:00:00Z',
    closed_at: stub.state === 'closed' ? '2027-02-08T22:10:00Z' : null,
    auto_closed: false, state: stub.state === 'closed' ? 'closed' : 'open', item_count: 55,
    keep_until: '2028-01-16', pruned_at: stub.prunedAt,
  });

  await page.route('**/rest/v1/classes**', async (route) => {
    await route.fulfill({
      json: [{
        id: FT_CLASS_ID, name: '9 Maths B', join_code: FT_CODE, expected_domain: null,
        age_assertion_at: '2027-01-30T00:00:00Z', assertion_text_version: 'e2e',
        created_at: '2027-01-30T00:00:00Z',
      }],
    });
  });
  await page.route(`**/rest/v1/rpc/${FACT_PROBE_RPC.overview}`, async (route) => {
    await route.fulfill({
      json: {
        join_code: FT_CODE,
        mirrored: true,
        school_year_ends_on: stub.schoolYearEndsOn,
        years: [
          { year: 7, description: 'Times tables, squares, cubes, fraction equivalents, unit relationships and square roots', adds: [], families: 8, items: 40 },
          { year: 8, description: 'adds cube roots and adding and subtracting negatives', adds: [], families: 11, items: 55 },
          { year: 9, description: 'adds multiplying and dividing negatives', adds: [], families: 13, items: 65 },
          { year: 10, description: null, adds: [], families: 13, items: 65 },
        ],
        probes: stub.state === 'none' ? [] : [{
          id: FT_PROBE_ID, year_level: 8, opened_at: probe().opened_at, closed_at: probe().closed_at,
          auto_closed: false, state: probe().state, item_count: 55,
          verdict: stub.state === 'closed' ? 'below' : null,
          keep_until: probe().keep_until, pruned_at: probe().pruned_at,
        }],
      },
    });
  });
  await page.route(`**/rest/v1/rpc/${FACT_PROBE_RPC.yearEnd}`, async (route) => {
    const body = route.request().postDataJSON();
    stub.calls.push('yearEnd');
    stub.yearEnds.push(body);
    stub.schoolYearEndsOn = body.p_ends_on;
    await route.fulfill({ json: body.p_ends_on });
  });
  await page.route(`**/rest/v1/rpc/${FACT_PROBE_RPC.open}`, async (route) => {
    stub.calls.push('open');
    stub.opens.push(route.request().postDataJSON());
    stub.state = 'open';
    await route.fulfill({ json: { probe_id: FT_PROBE_ID } });
  });
  await page.route(`**/rest/v1/rpc/${FACT_PROBE_RPC.results}`, async (route) => {
    stub.resultReads += 1;
    // A pruned check returns no student rows (0048's fact_probe_results).
    await route.fulfill({ json: { probe: probe(), class: classStat(), students: stub.prunedAt ? [] : FT_STUDENTS } });
  });
  await page.route(`**/rest/v1/rpc/${FACT_PROBE_RPC.close}`, async (route) => {
    stub.closes += 1;
    stub.state = 'closed';
    await route.fulfill({ json: classStat() });
  });
  return stub;
}
