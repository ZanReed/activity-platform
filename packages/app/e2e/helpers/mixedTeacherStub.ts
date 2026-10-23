// A stand-in for mixed practice's TEACHER reads and switches (0066 + 0068),
// for the stub lanes. Names are the production constants (P2); payloads are
// the shapes verify-0068 asserts the real functions return.
import type { Page } from '@playwright/test';
import { MIXED_PRACTICE_RPC } from '../../src/lib/mixedPracticeRpc';

export const MT_LONG_LABEL =
  'Identify the constant of proportionality k in y = kx from a table, graph, or context';

export interface MixedTeacherStub {
  whoReads: number;
  studentReads: number;
  recentReads: { p_class_id: string; p_student_id: string }[];
}

export async function stubMixedTeacherApi(page: Page): Promise<MixedTeacherStub> {
  const state: MixedTeacherStub = { whoReads: 0, studentReads: 0, recentReads: [] };
  await page.route(`**/rest/v1/rpc/${MIXED_PRACTICE_RPC.summary}`, (route) =>
    route.fulfill({
      json: {
        on_at: '2027-02-10T00:00:00Z', reason: null, items_per_session: null, default_items: 6,
        graded: true, school_year_ends_on: '2099-12-17', has_bank: true, in_class: 28,
        practised_today: 18, practised_week: 24,
        skills: [
          { skill_id: 'rate.unit-rate', label: 'Compute a unit rate from a ratio', students_practising: 20,
            struggling: 3, first_tries_right: 61, first_tries: 90, skips: 4 },
          { skill_id: 'rate.constant-of-proportionality', label: MT_LONG_LABEL, students_practising: 9,
            struggling: 1, first_tries_right: 20, first_tries: 30, skips: 0 },
        ],
      },
    }),
  );
  await page.route(`**/rest/v1/rpc/${MIXED_PRACTICE_RPC.students}`, (route) => {
    state.studentReads += 1;
    return route.fulfill({
      json: [
        { student_id: 's1', name: 'Aroha Ngata', days_this_week: 3,
          struggling: [{ id: 'rate.unit-rate', label: 'Compute a unit rate from a ratio' }],
          latest_score: { right: 4, answered: 5, planned: 6, practice_day: '2027-02-14' }, score_in_progress: false },
      ],
    });
  });
  await page.route(`**/rest/v1/rpc/${MIXED_PRACTICE_RPC.whoFirst}`, (route) => {
    state.whoReads += 1;
    return route.fulfill({
      json: {
        mixed_on: true, facts_on: false, started_today: 12,
        stuck: [{ student_id: 's1', name: 'Aroha Ngata', skills: [
          { id: 'rate.unit-rate', label: 'Compute a unit rate from a ratio' },
          { id: 'rate.constant-of-proportionality', label: MT_LONG_LABEL },
        ] }],
        facts: [],
        same_mistake: [{ student_id: 's2', name: 'Ben Carter', mistakes: [
          { id: 'mis.rate.additive', label: 'Adds instead of scaling',
            skills: [{ id: 'rate.unit-rate', label: 'Compute a unit rate from a ratio' }] },
        ] }],
        everyone_else: 10,
      },
    });
  });
  await page.route(`**/rest/v1/rpc/${MIXED_PRACTICE_RPC.studentRecent}`, (route) => {
    state.recentReads.push(route.request().postDataJSON());
    return route.fulfill({
      json: [
        { practice_day: '2027-02-15', kind: 'skill', skill_id: 'rate.unit-rate',
          skill_label: 'Compute a unit rate from a ratio', correct: false, skipped: false,
          mistakes: [{ id: 'mis.rate.additive', label: 'Adds instead of scaling' }] },
      ],
    });
  });
  return state;
}
