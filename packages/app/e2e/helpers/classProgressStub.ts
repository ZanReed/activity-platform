// A stand-in for the class progress reads (migration 0061), for the stub lanes.
// RPC names are the production constants (P2); payloads are typed by the lib's
// own shapes, which verify-0061 asserts the real functions return. The version
// content is a real document built with the schema's factories, so the answer
// panel's words come from the same formatter path production uses.
import type { Page } from '@playwright/test';
import {
  createBlankToken,
  createEmptyDocument,
  createFillInBlankBlock,
  createMultipleChoiceBlock,
  createShortAnswerBlock,
  type ActivityDocument,
} from '@activity/schema';
import {
  ACTIVITY_PROGRESS_RPC,
  CLASS_MISCONCEPTIONS_RPC,
  CLASS_PROGRESS_RPC,
  CLASS_STUDENT_WORK_RPC,
} from '../../src/lib/edgeFunctions';
import type {
  ActivityProgress,
  ClassMisconceptions,
  ClassProgress,
  StudentWork,
} from '../../src/lib/classProgress';

export const CP_CLASS_ID = 'eeeeeeee-0000-4000-8000-00000000c901';
export const CP_FRACTIONS = 'aaaaaaaa-0000-4000-8000-00000000c911';
export const CP_DECIMALS = 'aaaaaaaa-0000-4000-8000-00000000c912';
const V_FRACTIONS = 'bbbbbbbb-0000-4000-8000-00000000c921';
const V_DECIMALS_OLD = 'bbbbbbbb-0000-4000-8000-00000000c922';
const V_DECIMALS = 'bbbbbbbb-0000-4000-8000-00000000c923';
export const CP_ANA = 'dddddddd-0000-4000-8000-00000000c931';
export const CP_BEN = 'dddddddd-0000-4000-8000-00000000c932';
export const CP_CALEB = 'dddddddd-0000-4000-8000-00000000c933';
export const CP_NAMES = ['Ana Lee', 'Ben Carter', 'Caleb Wu'];
const CLASS_NAME = '9 Maths B';
const SEC_1 = '55555555-0000-4000-8000-00000000c971';
const SEC_2 = '55555555-0000-4000-8000-00000000c972';

const t = (text: string) => [{ type: 'text' as const, text, marks: [] }];

/** Fractions 2: section 1 = one blank + one multiple choice; section 2 = a short answer. */
function fractionsDoc(): { doc: ActivityDocument; blankId: string; mcId: string; shortId: string; choiceIds: string[] } {
  const doc = createEmptyDocument({ title: 'Fractions 2' });
  const fib = createFillInBlankBlock();
  const blank = { ...createBlankToken('0.8'), id: '11111111-0000-4000-8000-00000000c941' };
  fib.id = '11111111-0000-4000-8000-00000000c942';
  fib.content = [...t('Write 4/5 as a decimal: '), blank];
  const mc = createMultipleChoiceBlock();
  mc.id = '11111111-0000-4000-8000-00000000c943';
  mc.prompt = t('Which is bigger?');
  mc.choices.forEach((c, i) => {
    c.id = `11111111-0000-4000-8000-00000000c95${i}`;
    c.content = t(['three quarters', 'two thirds', 'one half'][i]!);
  });
  const short = createShortAnswerBlock();
  short.id = '11111111-0000-4000-8000-00000000c944';
  const s1 = doc.sections[0]!;
  s1.id = SEC_1;
  s1.title = 'Warm-up';
  s1.rows = [
    { id: '11111111-0000-4000-8000-00000000c961', gridLines: 'inherit', columns: [{ id: '11111111-0000-4000-8000-00000000c962', blocks: [fib, mc] }] },
  ];
  doc.sections.push({
    id: SEC_2,
    isCheckpoint: false,
    rows: [{ id: '11111111-0000-4000-8000-00000000c963', gridLines: 'inherit', columns: [{ id: '11111111-0000-4000-8000-00000000c964', blocks: [short] }] }],
  });
  return { doc, blankId: blank.id, mcId: mc.id, shortId: short.id, choiceIds: mc.choices.map((c) => c.id) };
}

export interface ClassProgressStub {
  calls: string[];
  /** Fail every class_progress read from now on (the refresh-failure state). */
  failNext: boolean;
}

export async function stubClassProgressApi(page: Page): Promise<ClassProgressStub> {
  const stub: ClassProgressStub = { calls: [], failNext: false };
  const f = fractionsDoc();

  const grid: ClassProgress = {
    class: { id: CP_CLASS_ID, name: CLASS_NAME, join_code: 'ABC234' },
    students: [
      { student_id: CP_ANA, name: 'Ana Lee' },
      { student_id: CP_BEN, name: 'Ben Carter' },
      { student_id: CP_CALEB, name: 'Caleb Wu' },
    ],
    activities: [
      { activity_id: CP_FRACTIONS, title: 'Fractions 2', current_version_id: V_FRACTIONS, added_at: '2027-02-08T00:00:00Z' },
      { activity_id: CP_DECIMALS, title: 'Decimals', current_version_id: V_DECIMALS, added_at: '2027-02-01T00:00:00Z' },
    ],
    cells: [
      // Ana: Fractions done (3 of 4 marked right), one short answer to grade.
      { student_id: CP_ANA, activity_id: CP_FRACTIONS, current_version_id: V_FRACTIONS, sections_total: 2, sections_checked: 2,
        earlier_checked: false, earlier_done: false, shown_version_id: V_FRACTIONS, shown_total: 2, shown_checked: 2,
        correct: 1, marked: 2, to_grade: 1, last_checked_at: '2027-02-09T09:41:00Z' },
      // Ana: Decimals only on the OLDER version, started 1 of 3.
      { student_id: CP_ANA, activity_id: CP_DECIMALS, current_version_id: V_DECIMALS, sections_total: null, sections_checked: 0,
        earlier_checked: true, earlier_done: false, shown_version_id: V_DECIMALS_OLD, shown_total: 3, shown_checked: 1,
        correct: 0, marked: 1, to_grade: 0, last_checked_at: '2027-02-02T09:00:00Z' },
      // Ben: Fractions started 1 of 2.
      { student_id: CP_BEN, activity_id: CP_FRACTIONS, current_version_id: V_FRACTIONS, sections_total: 2, sections_checked: 1,
        earlier_checked: false, earlier_done: false, shown_version_id: V_FRACTIONS, shown_total: 2, shown_checked: 1,
        correct: 0, marked: 2, to_grade: 0, last_checked_at: '2027-02-09T09:30:00Z' },
      // Ben: Decimals checked before 0059 (NULL total).
      { student_id: CP_BEN, activity_id: CP_DECIMALS, current_version_id: V_DECIMALS, sections_total: null, sections_checked: 1,
        earlier_checked: false, earlier_done: false, shown_version_id: V_DECIMALS, shown_total: null, shown_checked: 1,
        correct: 1, marked: 1, to_grade: 0, last_checked_at: '2027-02-03T09:00:00Z' },
      // Caleb: nothing.
    ],
    last_check_at: '2027-02-09T09:41:00Z',
  };

  const mis: ClassMisconceptions = {
    misconceptions: [
      { id: 'mis.decimal.tenths-as-place', description: 'Reads 4/5 as 0.45 (writes the digits side by side)', ever: 2, still: 1,
        activities: [{ activity_id: CP_FRACTIONS, title: 'Fractions 2' }],
        students: [
          { student_id: CP_ANA, name: 'Ana Lee', activity_id: CP_FRACTIONS, still: false },
          { student_id: CP_BEN, name: 'Ben Carter', activity_id: CP_FRACTIONS, still: true },
        ] },
      { id: 'mis.vfy.not-mirrored', description: null, ever: 1, still: 1,
        activities: [{ activity_id: CP_FRACTIONS, title: 'Fractions 2' }],
        students: [{ student_id: CP_BEN, name: 'Ben Carter', activity_id: CP_FRACTIONS, still: true }] },
    ],
    wrong_answers: [],
  };

  const work = (sid: string): StudentWork => ({
    student: { id: sid, name: sid === CP_ANA ? 'Ana Lee' : 'Ben Carter' },
    activity: { id: CP_FRACTIONS, title: 'Fractions 2', current_version_id: V_FRACTIONS },
    versions: [{
      version_id: V_FRACTIONS, version_num: 2, is_current: true,
      sections: [
        { section_id: SEC_1, attempts: 2, attempt_number: 2, checked_at: '2027-02-09T09:41:00Z',
          responses: { blanks: { [f.blankId]: '0.45' }, choices: { [f.mcId]: [f.choiceIds[0]!] } },
          verdicts: {
            [f.blankId]: { verdict: 'incorrect', feedback: t('Count the tenths.'), misconceptionIds: ['mis.decimal.tenths-as-place'] },
            [f.mcId]: { verdict: 'correct' },
          },
          graded_block_ids: [] },
        { section_id: SEC_2, attempts: 1, attempt_number: 1, checked_at: '2027-02-09T09:41:00Z',
          responses: { freeText: { [f.shortId]: 'Because 8 tenths is 0.8.' } },
          verdicts: { [f.shortId]: { verdict: 'recorded' } },
          graded_block_ids: [] },
      ],
    }],
  });

  const activity: ActivityProgress = {
    activity: { id: CP_FRACTIONS, title: 'Fractions 2', current_version_id: V_FRACTIONS },
    classes: [{
      class_id: CP_CLASS_ID, name: CLASS_NAME,
      students: [
        { student_id: CP_ANA, name: 'Ana Lee', ...grid.cells[0]! },
        { student_id: CP_BEN, name: 'Ben Carter', ...grid.cells[2]! },
        { student_id: CP_CALEB, name: 'Caleb Wu', sections_total: 2, sections_checked: 0, earlier_checked: false, earlier_done: false,
          shown_version_id: null, shown_total: null, shown_checked: null, to_grade: 0, last_checked_at: null },
      ],
    }],
    sections: [
      { student_id: CP_ANA, version_id: V_FRACTIONS, section_id: SEC_1, attempts: 2, correct: 1, marked: 2, checked_at: '2027-02-09T09:41:00Z' },
      { student_id: CP_ANA, version_id: V_FRACTIONS, section_id: SEC_2, attempts: 1, correct: 0, marked: 0, checked_at: '2027-02-09T09:41:00Z' },
      { student_id: CP_BEN, version_id: V_FRACTIONS, section_id: SEC_1, attempts: 1, correct: 0, marked: 2, checked_at: '2027-02-09T09:30:00Z' },
    ],
    last_check_at: '2027-02-09T09:41:00Z',
  };

  const actMis: ClassMisconceptions = {
    misconceptions: mis.misconceptions,
    wrong_answers: [{
      version_id: V_FRACTIONS, section_id: SEC_1, item_id: f.blankId, wrong: 2,
      answers: [{ family: 'blanks', answer: '0.45', count: 2, misconception_ids: ['mis.decimal.tenths-as-place'] }],
    }],
  };

  await page.route(`**/rest/v1/rpc/${CLASS_PROGRESS_RPC}**`, (route) => {
    stub.calls.push('class_progress');
    if (stub.failNext) return route.fulfill({ status: 500, json: { message: 'boom' } });
    return route.fulfill({ json: grid });
  });
  await page.route(`**/rest/v1/rpc/${CLASS_MISCONCEPTIONS_RPC}**`, (route) => {
    const body = route.request().postDataJSON() as { p_activity_id?: string | null };
    stub.calls.push(body.p_activity_id ? 'class_misconceptions:activity' : 'class_misconceptions:class');
    return route.fulfill({ json: body.p_activity_id ? actMis : mis });
  });
  await page.route(`**/rest/v1/rpc/${CLASS_STUDENT_WORK_RPC}**`, (route) => {
    const body = route.request().postDataJSON() as { p_student_id: string; p_class_id: string | null };
    stub.calls.push(`class_student_work:${body.p_class_id ? 'class' : 'activity'}`);
    return route.fulfill({ json: work(body.p_student_id) });
  });
  await page.route(`**/rest/v1/rpc/${ACTIVITY_PROGRESS_RPC}**`, (route) => {
    stub.calls.push('activity_progress');
    return route.fulfill({ json: activity });
  });
  await page.route('**/rest/v1/activity_versions**', (route) =>
    route.fulfill({ json: [{ id: V_FRACTIONS, version_num: 2, content: f.doc }] }),
  );
  await page.route('**/rest/v1/misconception_registry**', (route) =>
    route.fulfill({ json: [{ id: 'mis.decimal.tenths-as-place', description: 'Reads 4/5 as 0.45 (writes the digits side by side)' }] }),
  );
  return stub;
}
