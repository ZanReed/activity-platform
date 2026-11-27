// @vitest-environment jsdom
// =============================================================================
// ActivityResponses.test.tsx — the teacher grading surface (0034 G8 + G8-DR)
// -----------------------------------------------------------------------------
// The rows here pin the DESIGN RULINGS, not the markup. Each one corresponds to
// a decision that was argued and could plausibly be "simplified" back out:
//
//  * A stale row RE-ENTERS the needs-grading queue (D5). Without this, a
//    student's revision disappears behind "Graded" and the teacher never learns
//    it happened — the silent state the staleness ruling exists to prevent.
//  * Empty ≠ all-caught-up (D7). Two identical-looking empty lists that mean
//    opposite things is the failure the state set was written to avoid, and the
//    all-caught-up line has to name the unreleased remainder or finishing
//    grading silently skips releasing it.
//  * A failed save KEEPS the teacher's entries. Losing typed rubric scores to a
//    network blip is the worst outcome this screen has.
//  * Identity is ROSTER-SCOPED. A published activity is open by link, so its
//    checks can include students the teacher has no relationship with; the
//    server sends NULL for those and the UI must not invent a name.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

const h = vi.hoisted(() => ({
  queue: vi.fn(),
  save: vi.fn(),
  release: vi.fn(),
  suggestions: vi.fn(),
  assistStatus: vi.fn(),
  rubrics: vi.fn(),
  dolPrimaries: vi.fn(),
  dolOptionals: vi.fn(async () => new Set<string>()),
  dolPasses: vi.fn(),
  setDolPass: vi.fn(),
  versionContents: vi.fn(async () => new Map<string, { version_num: number; content: unknown }>()),
}));

// The section and question words come from each version's document, read
// through the page-session cache. Empty by default: no document, no heading.
// The Class picker's rosters (S4): none by default, so no picker.
const rosters = vi.hoisted(() => ({ current: [] as { id: string; name: string; students: Set<string> }[] }));
vi.mock('../lib/classTeacher', () => ({ listClassRosters: () => Promise.resolve(rosters.current) }));
vi.mock('../lib/activityTitle', () => ({ fetchActivityTitle: () => Promise.resolve(null) }));
vi.mock('../lib/versionContent', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/versionContent')>()),
  getVersionContents: h.versionContents,
}));

vi.mock('../lib/grading', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/grading')>()),
  fetchGradingQueue: h.queue,
  saveCheckGrade: h.save,
  releaseGrades: h.release,
}));

vi.mock('../lib/dolPass', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/dolPass')>()),
  fetchDolPassStatus: h.dolPasses,
  setDolPass: h.setDolPass,
}));

// The assist layer (0042) is mocked to its quiet defaults here — these rows
// pin the 0034 surface's rulings, and a plain manual queue must render
// exactly as it did before drafts existed. The assist rulings have their own
// file (ActivityResponsesAssist.test.tsx).
vi.mock('../lib/gradingAssist', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/gradingAssist')>()),
  fetchSuggestions: h.suggestions,
  fetchAssistStatus: h.assistStatus,
  fetchVersionRubrics: h.rubrics,
  fetchDolPrimaries: h.dolPrimaries,
  fetchDolOptionals: h.dolOptionals,
}));

import ActivityResponses from '../routes/ActivityResponses';
import { nextOwedKey } from '../lib/responsesQueue';
import { RESPONSES_COPY as COPY, type GradingQueueRow } from '../lib/grading';
import { DOL_PASS_COPY } from '../lib/dolPass';
import { createEmptyDocument, createShortAnswerBlock } from '@activity/schema';

const BASE: GradingQueueRow = {
  check_id: 'chk-1',
  student_id: 'stu-1',
  student_label: 'maya@school.example',
  in_your_class: true,
  activity_version_id: 'v1',
  version_num: 2,
  is_current: true,
  section_id: 'sec-1',
  block_id: 'blk-1',
  block_type: 'short_answer',
  response_text: 'because the slope stays the same',
  response_photos: null,
  attempt_number: 1,
  checked_at: '2026-08-15T00:00:00Z',
  graded: false,
  criteria: null,
  general_feedback: null,
  graded_at: null,
  released_at: null,
  has_grader: true,
  stale: false,
};

function row(overrides: Partial<GradingQueueRow> = {}): GradingQueueRow {
  return { ...BASE, ...overrides };
}

/** A real Route, not a bare render: the component reads :id from useParams, so
 *  a router without the path pattern silently hands it an empty activity id —
 *  which is exactly how the first draft of these rows "passed" a release call
 *  with no activity. */
function renderRoute() {
  render(
    <MemoryRouter initialEntries={['/activity/a1/responses']}>
      <Routes>
        <Route path="/activity/:id/responses" element={<ActivityResponses />} />
      </Routes>
    </MemoryRouter>,
  );
}

function setup(rows: GradingQueueRow[]) {
  h.queue.mockResolvedValue(rows);
  renderRoute();
}

beforeEach(() => {
  h.save.mockResolvedValue(undefined);
  h.release.mockResolvedValue(1);
  // Assist quiet defaults: no drafts, provider off, no rubric specs — the
  // 0034 surface exactly as shipped.
  h.suggestions.mockResolvedValue([]);
  h.assistStatus.mockResolvedValue({ provider: 'off' });
  h.rubrics.mockResolvedValue(new Map());
  // D65: no DoL rows unless a test says so.
  h.dolPrimaries.mockResolvedValue(new Set());
  h.dolPasses.mockResolvedValue([]);
  h.setDolPass.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  h.queue.mockReset();
  h.save.mockReset();
  h.release.mockReset();
  h.suggestions.mockReset();
  h.assistStatus.mockReset();
  h.rubrics.mockReset();
});

describe('the queue', () => {
  it('leads with the workload, not the version structure (D9)', async () => {
    setup([row(), row({ check_id: 'chk-2', student_id: 'stu-2', student_label: 'j@school.example' })]);
    await waitFor(() => expect(screen.getByText('2 need grading')).toBeTruthy());
    // A current-version row carries no version tag: in the common one-version
    // case the queue shows no version chrome at all.
    expect(screen.queryByText('v2')).toBeNull();
  });

  it('an optional DoL explanation is never owed, and stays reachable (D77)', async () => {
    const base = row();
    h.dolOptionals.mockResolvedValueOnce(new Set([`${base.activity_version_id}:${base.block_id}`]));
    setup([base]);
    await waitFor(() => expect(screen.getByText(/1 optional explanation/)).toBeTruthy());
    expect(screen.queryByText(/need grading/)).toBeNull();
    expect(screen.queryByText(base.student_label as string)).toBeNull();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Needs grading' }));
    await waitFor(() => expect(screen.getByText(base.student_label as string)).toBeTruthy());
  });

  it('a REVISED optional explanation is still named in the note, not silently hidden (sweep 2026-11-12)', async () => {
    const base = row({ graded: true, graded_at: 'x', stale: true });
    h.dolOptionals.mockResolvedValueOnce(new Set([`${base.activity_version_id}:${base.block_id}`]));
    setup([base]);
    await waitFor(() => expect(screen.getByText(/1 optional explanation/)).toBeTruthy());
    expect(screen.queryByText(/need grading/)).toBeNull();
  });

  it('tags rows from an earlier version instead of grouping by version', async () => {
    setup([row({ is_current: false, version_num: 1 })]);
    await waitFor(() => expect(screen.getByText('v1')).toBeTruthy());
  });

  it('a revised-after-grading row RE-ENTERS the needs-grading queue (D5)', async () => {
    setup([row({ graded: true, graded_at: 'x', stale: true })]);
    await waitFor(() => expect(screen.getByText('1 need grading')).toBeTruthy());
    // and it wears the distinct amber chip, not the plain needs-grading one
    expect(document.querySelector('[data-chip="stale"]')).not.toBeNull();
    expect(document.querySelector('[data-chip="needs_grading"]')).toBeNull();
  });

  it('a graded, unrevised row leaves the default queue', async () => {
    setup([row({ graded: true, graded_at: 'x', released_at: 'y' })]);
    await waitFor(() => expect(screen.getByText(COPY.allCaughtTitle)).toBeTruthy());
  });

  it('marks an unanswered response rather than hiding the row (D13)', async () => {
    setup([row({ response_text: null })]);
    await waitFor(() => expect(screen.getAllByText(COPY.noAnswer).length).toBeGreaterThan(0));
  });

  it('never invents a name for a student outside the teacher’s classes', async () => {
    setup([row({ student_label: null, in_your_class: false })]);
    await waitFor(() => expect(screen.getByText(COPY.notInYourClass)).toBeTruthy());
    expect(document.body.textContent).not.toContain('maya@school.example');
  });
});

describe('the three empty states are three different truths (D7)', () => {
  it('nothing has happened yet', async () => {
    setup([]);
    await waitFor(() => expect(screen.getByText(COPY.emptyTitle)).toBeTruthy());
  });

  it('all caught up NAMES the unreleased remainder', async () => {
    setup([row({ graded: true, graded_at: 'x', released_at: null })]);
    await waitFor(() => expect(screen.getByText(COPY.allCaughtTitle)).toBeTruthy());
    // Finishing the grading must not silently skip releasing it.
    expect(screen.getByText(/1 unreleased/)).toBeTruthy();
    expect(screen.getByRole('button', { name: COPY.showGraded })).toBeTruthy();
  });

  it('a failed load says so instead of looking empty', async () => {
    // renderRoute, not setup: setup() stubs a RESOLVED queue, which would
    // overwrite the rejection this row is about.
    h.queue.mockRejectedValue(new Error('nope'));
    renderRoute();
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toContain(COPY.loadFailed);
  });
});

describe('the grading panel', () => {
  const GRADED = row({
    graded: true,
    graded_at: 'x',
    criteria: [{ criterionId: 'c1', earned: 2, maxPoints: 4 }],
    general_feedback: 'ok',
  });

  async function openPanel(r: GradingQueueRow, others: GradingQueueRow[] = []) {
    setup([r, ...others]);
    // A graded, unrevised row is filtered out of the default queue by design —
    // reaching its panel means turning the filter off first, exactly as a
    // teacher would.
    await waitFor(() => expect(h.queue).toHaveBeenCalled());
    const showGraded = screen.queryByRole('button', { name: COPY.showGraded });
    if (showGraded) fireEvent.click(showGraded);
    const rowButton = await waitFor(() => {
      const el = document.querySelector('[data-chip]')?.closest('button');
      if (!el) throw new Error('no queue row');
      return el as HTMLElement;
    });
    fireEvent.click(rowButton);
    await waitFor(() => expect(screen.getByLabelText(COPY.generalFeedback)).toBeTruthy());
  }

  it('saves explicitly — never on keystroke', async () => {
    await openPanel(row());
    fireEvent.change(screen.getByLabelText(COPY.generalFeedback), {
      target: { value: 'Nice reasoning.' },
    });
    expect(h.save).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: COPY.save }));
    await waitFor(() => expect(h.save).toHaveBeenCalledTimes(1));
    expect(h.save.mock.calls[0]?.[0]).toMatchObject({
      checkId: 'chk-1',
      blockId: 'blk-1',
      generalFeedback: 'Nice reasoning.',
    });
  });

  // Review A5 follow-up: a Save changes ONE row, and the reply says how, so
  // the page patches it instead of re-reading the queue, the suggestions and
  // the DoL passes. (The mock's default reply carries no grade, which is the
  // re-read fallback the next row pins.)
  it('a save patches its row in place: no re-read, and the graded row leaves the to-grade list', async () => {
    const other = row({ check_id: 'chk-2', student_id: 'stu-2', student_label: 'ari@school.example' });
    h.save.mockResolvedValue({
      criteria: [{ criterionId: 'c1', earned: 2, maxPoints: 4 }],
      graded_at: '2026-11-26T00:00:00Z',
      released_at: null,
    });
    setup([row(), other]);
    await waitFor(() => expect(document.querySelectorAll('[data-chip]').length).toBe(2));
    fireEvent.click(document.querySelector('[data-chip]')!.closest('button')!);
    await waitFor(() => expect(screen.getByLabelText(COPY.generalFeedback)).toBeTruthy());
    // Counts BEFORE the save: the claim is that the save added none.
    const before = [h.queue, h.suggestions, h.dolPasses].map((f) => f.mock.calls.length);
    fireEvent.click(screen.getByRole('button', { name: COPY.save }));
    await waitFor(() => expect(h.save).toHaveBeenCalledTimes(1));
    // The patched row is graded, so the default (still-to-grade) list drops it.
    await waitFor(() => expect(document.querySelectorAll('[data-chip]').length).toBe(1));
    expect([h.queue, h.suggestions, h.dolPasses].map((f) => f.mock.calls.length)).toEqual(before);
  });

  // Option (b), author-chosen: grading the LAST row still to grade re-reads,
  // so a student who checked in meanwhile appears ("All caught up" is when a
  // new answer matters).
  it('saving the last row still to grade re-reads the queue, to bring in new answers', async () => {
    h.save.mockResolvedValue({
      criteria: [{ criterionId: 'c1', earned: 2, maxPoints: 4 }],
      graded_at: '2026-11-26T00:00:00Z',
      released_at: null,
    });
    setup([row()]);
    await waitFor(() => expect(document.querySelectorAll('[data-chip]').length).toBe(1));
    fireEvent.click(document.querySelector('[data-chip]')!.closest('button')!);
    await waitFor(() => expect(screen.getByLabelText(COPY.generalFeedback)).toBeTruthy());
    const before = h.queue.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: COPY.save }));
    await waitFor(() => expect(h.queue.mock.calls.length).toBe(before + 1));
  });

  it('a failed re-read after a good save keeps the queue and panel, and says so', async () => {
    const other = row({ check_id: 'chk-2', student_id: 'stu-2', student_label: 'ari@school.example' });
    await openPanel(row(), [other]);
    h.queue.mockRejectedValue(new Error('network down'));
    fireEvent.click(screen.getByRole('button', { name: COPY.save }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain(COPY.refreshFailed));
    expect(screen.getByLabelText(COPY.generalFeedback)).toBeTruthy();
    expect(screen.queryByText(new RegExp(COPY.loadFailed))).toBeNull();
  });

  it('clamps points to the criterion maximum before they leave the client', async () => {
    await openPanel(GRADED);
    fireEvent.change(screen.getByLabelText('c1'), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: COPY.save }));
    await waitFor(() => expect(h.save).toHaveBeenCalled());
    expect(h.save.mock.calls[0]?.[0].criteria[0]).toMatchObject({ earned: 4 });
  });

  it('a FAILED save keeps the teacher’s entries on screen', async () => {
    h.save.mockRejectedValue(new Error('network'));
    await openPanel(row());
    fireEvent.change(screen.getByLabelText(COPY.generalFeedback), {
      target: { value: 'a paragraph I do not want to retype' },
    });
    fireEvent.click(screen.getByRole('button', { name: COPY.save }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(
      (screen.getByLabelText(COPY.generalFeedback) as HTMLTextAreaElement).value,
    ).toBe('a paragraph I do not want to retype');
  });

  it('the release button carries its count, and only when something is unreleased', async () => {
    await openPanel(GRADED);
    const button = screen.getByRole('button', { name: /Release 1 graded to/ });
    fireEvent.click(button);
    await waitFor(() => expect(h.release).toHaveBeenCalledWith('a1', 'stu-1'));
  });

  it('a released grade says so PERSISTENTLY — edits go live immediately (D10)', async () => {
    await openPanel(row({ graded: true, graded_at: 'x', released_at: '2026-08-15' }));
    expect(screen.getByText(COPY.releasedNote)).toBeTruthy();
    // and there is nothing left to release on that row
    expect(screen.queryByRole('button', { name: /Release 1 graded/ })).toBeNull();
  });
});

describe('bulk release (D10)', () => {
  it('iterates the per-student RPC so each student keeps their own audit row', async () => {
    setup([
      row({ graded: true, graded_at: 'x' }),
      row({ check_id: 'chk-2', student_id: 'stu-2', student_label: 'j@school.example', graded: true, graded_at: 'x' }),
    ]);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Release all graded \(2 students\)/ })).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole('button', { name: /Release all graded/ }));
    // G-4: it asks first, and nothing goes out until the teacher says so.
    const dialog = await screen.findByRole('alertdialog', { name: /Release grades to 2 students\?/ });
    expect(h.release).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Release grades' }));
    await waitFor(() => expect(h.release).toHaveBeenCalledTimes(2));
    expect(h.release).toHaveBeenCalledWith('a1', 'stu-1');
    expect(h.release).toHaveBeenCalledWith('a1', 'stu-2');
  });

  it('Cancel releases nothing (G-4)', async () => {
    setup([row({ graded: true, graded_at: 'x' })]);
    fireEvent.click(await screen.findByRole('button', { name: /Release all graded/ }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(h.release).not.toHaveBeenCalled();
  });

  it('a failure part-way keeps the queue, names who missed out, and retries just them (G-4)', async () => {
    setup([
      row({ graded: true, graded_at: 'x' }),
      row({ check_id: 'chk-2', student_id: 'stu-2', student_label: 'j@school.example', graded: true, graded_at: 'x' }),
    ]);
    h.release.mockImplementation(async (_a: string, s: string) => {
      if (s === 'stu-2') throw new Error('network');
      return 1;
    });
    fireEvent.click(await screen.findByRole('button', { name: /Release all graded/ }));
    fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Release grades' }));
    const note = await waitFor(() => {
      const el = document.querySelector('[data-release-failed]');
      if (!el) throw new Error('no failure note');
      return el as HTMLElement;
    });
    expect(note.textContent).toMatch(/Released 1 of 2/);
    expect(note.textContent).toMatch(/j@school\.example/);
    // The queue is still there — the failure did not replace it.
    expect(screen.queryByText(new RegExp(COPY.loadFailed))).toBeNull();
    h.release.mockClear();
    h.release.mockResolvedValue(1);
    fireEvent.click(within(note).getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(h.release).toHaveBeenCalledTimes(1));
    expect(h.release).toHaveBeenCalledWith('a1', 'stu-2');
  });
});

describe('the DoL pass tick (D65 DL-11, DE-15)', () => {
  const SPEC = [
    { id: 'c-a', label: 'Describes it', maxPoints: 2, level: 'A' },
    { id: 'c-m', label: 'Justifies it', maxPoints: 2, level: 'M' },
  ];

  async function openDolPanel(passes: Array<{ student_id: string; source: 'auto' | 'teacher'; passed_at: string }> = []) {
    h.setDolPass.mockClear();
    h.save.mockClear();
    h.rubrics.mockResolvedValue(new Map([['v1:blk-1', SPEC]]));
    h.dolPrimaries.mockResolvedValue(new Set(['v1:blk-1']));
    h.dolPasses.mockResolvedValue(passes);
    setup([row()]);
    const rowButton = await waitFor(() => {
      const el = document.querySelector('[data-chip]')?.closest('button');
      if (!el) throw new Error('no queue row');
      return el as HTMLElement;
    });
    fireEvent.click(rowButton);
    return waitFor(() => screen.getByRole('checkbox', { name: DOL_PASS_COPY.label }) as HTMLInputElement);
  }

  it('prefills from the BASE-level lines and saves the pass with the grade', async () => {
    const box = await openDolPanel();
    expect(box.checked).toBe(false);
    fireEvent.change(screen.getByLabelText('Describes it'), { target: { value: '2' } });
    expect((screen.getByRole('checkbox', { name: DOL_PASS_COPY.label }) as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText(DOL_PASS_COPY.prefill('A'))).toBeTruthy();
    expect(screen.getByText(/every Achieved line/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: COPY.save }));
    await waitFor(() => expect(h.setDolPass).toHaveBeenCalledWith('chk-1', true));
    expect(h.save).toHaveBeenCalled();
  });

  it('a rubric with the teacher’s own level words prefills from its FIRST level', async () => {
    const own = [
      { id: 'c-b', label: 'Names the rate', maxPoints: 1, level: 'Basic' },
      { id: 'c-p', label: 'Compares the rates', maxPoints: 2, level: 'Proficient' },
    ];
    h.rubrics.mockResolvedValue(new Map([['v1:blk-1', own]]));
    h.dolPrimaries.mockResolvedValue(new Set(['v1:blk-1']));
    h.dolPasses.mockResolvedValue([]);
    setup([row()]);
    const rowButton = await waitFor(() => {
      const el = document.querySelector('[data-chip]')?.closest('button');
      if (!el) throw new Error('no queue row');
      return el as HTMLElement;
    });
    fireEvent.click(rowButton);
    const box = await waitFor(() => screen.getByRole('checkbox', { name: DOL_PASS_COPY.label }) as HTMLInputElement);
    expect(box.checked).toBe(false);
    fireEvent.change(screen.getByLabelText('Names the rate'), { target: { value: '1' } });
    expect((screen.getByRole('checkbox', { name: DOL_PASS_COPY.label }) as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText(/every “Basic” line is at full marks/)).toBeTruthy();
  });

  it('a teacher’s untick removes THEIR pass on save', async () => {
    const box = await openDolPanel([{ student_id: 'stu-1', source: 'teacher', passed_at: 'x' }]);
    expect(box.checked).toBe(true);
    fireEvent.click(box);
    fireEvent.click(screen.getByRole('button', { name: COPY.save }));
    await waitFor(() => expect(h.setDolPass).toHaveBeenCalledWith('chk-1', false));
  });

  it('an auto pass is fixed: the box is disabled and save never touches it', async () => {
    const box = await openDolPanel([{ student_id: 'stu-1', source: 'auto', passed_at: 'x' }]);
    expect(box.checked).toBe(true);
    expect(box.disabled).toBe(true);
    expect(screen.getByText(DOL_PASS_COPY.auto)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: COPY.save }));
    await waitFor(() => expect(h.save).toHaveBeenCalled());
    expect(h.setDolPass).not.toHaveBeenCalled();
  });

  it('a row that is not the DoL primary shows no tick', async () => {
    h.dolPrimaries.mockResolvedValue(new Set());
    setup([row()]);
    const rowButton = await waitFor(() => {
      const el = document.querySelector('[data-chip]')?.closest('button');
      if (!el) throw new Error('no queue row');
      return el as HTMLElement;
    });
    fireEvent.click(rowButton);
    await waitFor(() => expect(screen.getByRole('button', { name: COPY.save })).toBeTruthy());
    expect(screen.queryByRole('checkbox', { name: DOL_PASS_COPY.label })).toBeNull();
  });
});

describe('what the queue calls a section and a question', () => {
  // Playtest sweep 2026-11-12: the group heading printed the section's UUID and
  // the question appeared nowhere, so a teacher graded an answer without
  // seeing what was asked. The words come from the version's own document.
  const VERSION = '11111111-1111-4111-8111-111111111111';
  function docWithQuestion() {
    const doc = createEmptyDocument();
    const section = doc.sections[0]!;
    section.title = 'Check for understanding';
    const short = createShortAnswerBlock();
    short.prompt = [{ type: 'text', text: 'Explain why the cheaper card is not better value.', marks: [] }];
    section.rows = [
      {
        id: '00000000-0000-4000-8000-000000000001',
        gridLines: 'inherit',
        columns: [{ id: '00000000-0000-4000-8000-000000000101', blocks: [short] }],
      },
    ];
    return { doc, sectionId: section.id, blockId: short.id };
  }

  it('heads a group with the section title and a question with its number and words, never an id', async () => {
    const { doc, sectionId, blockId } = docWithQuestion();
    h.versionContents.mockResolvedValueOnce(new Map([[VERSION, { version_num: 1, content: doc }]]));
    setup([row({ activity_version_id: VERSION, section_id: sectionId, block_id: blockId })]);

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2, name: 'Check for understanding' })).toBeTruthy(),
    );
    const question = 'Q1 · Explain why the cheaper card is not better value.';
    expect(screen.getByText(question)).toBeTruthy();
    expect(document.body.textContent).not.toContain(sectionId);

    // The grading pane names the question too, above the student's answer.
    fireEvent.click(screen.getByText(BASE.student_label as string).closest('button')!);
    await waitFor(() => expect(screen.getAllByText(question)).toHaveLength(2));
  });

  it('a document it cannot read leaves the heading out rather than printing the id', async () => {
    h.versionContents.mockResolvedValueOnce(new Map([[VERSION, { version_num: 1, content: { nonsense: true } }]]));
    setup([row({ activity_version_id: VERSION, section_id: 'sec-raw-id' })]);
    await waitFor(() => expect(screen.getByText(BASE.student_label as string)).toBeTruthy());
    expect(document.body.textContent).not.toContain('sec-raw-id');
  });
});

describe('Hide names, Next to grade, and the unsaved-grade prompt (D8)', () => {
  const MAYA = row();
  const ARI = row({
    check_id: 'chk-2',
    student_id: 'stu-2',
    student_label: 'ari@school.example',
    checked_at: '2026-08-16T00:00:00Z',
  });
  const header = () => document.querySelector('[data-grade-panel] p.text-xs')?.textContent ?? '';

  beforeEach(() => window.localStorage.removeItem('progress.hideNames'));
  afterEach(() => window.localStorage.removeItem('progress.hideNames'));

  async function openFirst(rows: GradingQueueRow[]) {
    setup(rows);
    const first = await screen.findByRole('button', { name: /maya@school\.example/ });
    fireEvent.click(first);
    await waitFor(() => expect(header()).toContain('maya@school.example'));
  }

  it('Hide names takes every name off the page, the open panel included', async () => {
    await openFirst([MAYA, ARI]);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Hide names' }));
    await waitFor(() => expect(document.body.textContent).not.toContain('maya@school.example'));
    expect(document.body.textContent).not.toContain('ari@school.example');
    // Numbered by name order: ari before maya.
    expect(screen.getByRole('button', { name: /Student 1/ }).textContent).toContain('the slope');
    expect(header()).toContain('Student 2');
    expect(window.localStorage.getItem('progress.hideNames')).toBe('1');
  });

  it('Next to grade opens the next response and puts focus in it', async () => {
    await openFirst([MAYA, ARI]);
    fireEvent.click(screen.getByRole('button', { name: 'Next to grade' }));
    await waitFor(() => expect(header()).toContain('ari@school.example'));
    expect(document.activeElement).toBe(screen.getByLabelText(COPY.generalFeedback));
    // Wraps back to the top: maya is still owed.
    fireEvent.click(screen.getByRole('button', { name: 'Next to grade' }));
    await waitFor(() => expect(header()).toContain('maya@school.example'));
  });

  it('leaving a row with unsaved entries asks first; Keep editing keeps them', async () => {
    await openFirst([MAYA, ARI]);
    fireEvent.change(screen.getByLabelText(COPY.generalFeedback), { target: { value: 'half typed' } });
    fireEvent.click(screen.getByRole('button', { name: /ari@school\.example/ }));
    expect(await screen.findByRole('alertdialog', { name: /Discard unsaved grade/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect((screen.getByLabelText(COPY.generalFeedback) as HTMLTextAreaElement).value).toBe('half typed');

    fireEvent.click(screen.getByRole('button', { name: 'Next to grade' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(header()).toContain('ari@school.example'));
    expect((screen.getByLabelText(COPY.generalFeedback) as HTMLTextAreaElement).value).toBe('');
  });

  it('a saved grade is not unsaved: Next goes straight on', async () => {
    await openFirst([MAYA, ARI]);
    fireEvent.change(screen.getByLabelText(COPY.generalFeedback), { target: { value: 'done' } });
    h.queue.mockResolvedValue([row({ graded: true, graded_at: 'x', general_feedback: 'done' }), ARI]);
    fireEvent.click(screen.getByRole('button', { name: COPY.save }));
    await waitFor(() => expect(h.save).toHaveBeenCalledTimes(1));
    // Wait for the re-read: Maya's LIST row (name, then her answer) leaves the
    // filtered list, and Next is enabled again (it is disabled while a save
    // runs). The panel's "Release 1 graded to maya…" button stays, on purpose.
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /maya@school\.example.*the slope/ })).toBeNull(),
    );
    await waitFor(() =>
      expect((screen.getByRole('button', { name: 'Next to grade' }) as HTMLButtonElement).disabled).toBe(false),
    );
    // Next still knows where Maya's row was.
    fireEvent.click(screen.getByRole('button', { name: 'Next to grade' }));
    await waitFor(() => expect(header()).toContain('ari@school.example'));
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('nextOwedKey goes forward, wraps, skips what is graded, and stops at the last', () => {
    const graded = row({ check_id: 'chk-3', graded: true, checked_at: '2026-08-17T00:00:00Z' });
    const owed = (r: GradingQueueRow) => !r.graded;
    expect(nextOwedKey([MAYA, ARI, graded], 'chk-1:blk-1', owed)).toBe('chk-2:blk-1');
    expect(nextOwedKey([MAYA, ARI, graded], 'chk-2:blk-1', owed)).toBe('chk-1:blk-1');
    expect(nextOwedKey([MAYA, ARI, graded], 'chk-3:blk-1', owed)).toBe('chk-1:blk-1');
    expect(nextOwedKey([MAYA, graded], 'chk-1:blk-1', owed)).toBeNull();
    expect(nextOwedKey([MAYA, ARI], null, owed)).toBe('chk-1:blk-1');
  });
});

describe('narrowing the list: one student, only my classes, J / K', () => {
  const MAYA = row();
  const ARI = row({ check_id: 'chk-2', student_id: 'stu-2', student_label: 'ari@school.example', checked_at: '2026-08-16T00:00:00Z' });
  const STRANGER = row({
    check_id: 'chk-3', student_id: 'stu-3', student_label: null, in_your_class: false,
    checked_at: '2026-08-17T00:00:00Z', response_text: 'from outside',
  });
  const listed = () => [...document.querySelectorAll('[data-row-key]')].map((b) => b.getAttribute('data-row-key'));
  const header = () => document.querySelector('[data-grade-panel] p.text-xs')?.textContent ?? '';

  beforeEach(() => window.localStorage.removeItem('progress.hideNames'));

  it('the student picker shows one student; outside students share one entry', async () => {
    setup([MAYA, ARI, STRANGER]);
    const picker = (await screen.findByRole('combobox', { name: 'Student' })) as HTMLSelectElement;
    expect([...picker.options].map((o) => o.textContent)).toEqual([
      'All students', 'ari@school.example', 'maya@school.example', COPY.notInYourClass,
    ]);
    fireEvent.change(picker, { target: { value: 'stu-2' } });
    expect(listed()).toEqual(['chk-2:blk-1']);
    fireEvent.change(picker, { target: { value: '__outside__' } });
    expect(listed()).toEqual(['chk-3:blk-1']);
  });

  it('the Class picker narrows to one class; a student in two classes shows in both (S4)', async () => {
    rosters.current = [
      { id: 'k7a', name: '7A', students: new Set(['stu-1']) },
      { id: 'k7b', name: '7B', students: new Set(['stu-1', 'stu-2']) },
      { id: 'k9', name: '9 Maths', students: new Set(['stu-9']) }, // nobody here in this queue
    ];
    setup([MAYA, ARI, STRANGER]);
    const picker = (await screen.findByRole('combobox', { name: 'Class' })) as HTMLSelectElement;
    expect([...picker.options].map((o) => o.textContent)).toEqual(['All classes', '7A', '7B']);
    fireEvent.change(picker, { target: { value: 'k7a' } });
    expect(listed()).toEqual(['chk-1:blk-1']);
    fireEvent.change(picker, { target: { value: 'k7b' } });
    expect(listed()).toEqual(['chk-1:blk-1', 'chk-2:blk-1']);
    rosters.current = [];
  });

  it('no Class picker for a teacher with one class in the queue', async () => {
    rosters.current = [{ id: 'k7a', name: '7A', students: new Set(['stu-1', 'stu-2']) }];
    setup([MAYA, ARI]);
    await screen.findByRole('combobox', { name: 'Student' });
    expect(screen.queryByRole('combobox', { name: 'Class' })).toBeNull();
    rosters.current = [];
  });

  it('Only my classes hides students outside them, and appears only when there are some', async () => {
    setup([MAYA, ARI, STRANGER]);
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Only my classes' }));
    expect(listed()).toEqual(['chk-1:blk-1', 'chk-2:blk-1']);
    cleanup();
    setup([MAYA, ARI]);
    await screen.findByRole('combobox', { name: 'Student' });
    expect(screen.queryByRole('checkbox', { name: 'Only my classes' })).toBeNull();
  });

  it('a selection that hides everything says so, and Show everyone undoes it', async () => {
    setup([MAYA, row({ check_id: 'chk-2', student_id: 'stu-2', student_label: 'ari@school.example', graded: true, graded_at: 'x' })]);
    fireEvent.change(await screen.findByRole('combobox', { name: 'Student' }), { target: { value: 'stu-2' } });
    expect(screen.getByText('Nothing here for this selection')).toBeTruthy();
    expect(screen.queryByText(COPY.allCaughtTitle)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show everyone' }));
    expect(listed()).toEqual(['chk-1:blk-1']);
  });

  it('Next to grade skips a row the picker hides', async () => {
    setup([MAYA, ARI, STRANGER]);
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Only my classes' }));
    fireEvent.click(screen.getByRole('button', { name: /ari@school\.example/ }));
    await waitFor(() => expect(header()).toContain('ari@school.example'));
    fireEvent.click(screen.getByRole('button', { name: 'Next to grade' }));
    // Wraps to Maya, not on to the hidden outside row.
    await waitFor(() => expect(header()).toContain('maya@school.example'));
  });

  it('a filter that hides the open response closes it, unless it holds unsaved work', async () => {
    setup([MAYA, ARI, STRANGER]);
    fireEvent.click(await screen.findByRole('button', { name: /maya@school\.example/ }));
    await waitFor(() => expect(header()).toContain('maya@school.example'));
    fireEvent.change(screen.getByRole('combobox', { name: 'Student' }), { target: { value: 'stu-2' } });
    await waitFor(() => expect(document.querySelector('[data-grade-panel]')).toBeNull());
    fireEvent.change(screen.getByRole('combobox', { name: 'Student' }), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /maya@school\.example/ }));
    await waitFor(() => expect(header()).toContain('maya@school.example'));
    fireEvent.change(screen.getByLabelText(COPY.generalFeedback), { target: { value: 'typed' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Student' }), { target: { value: 'stu-2' } });
    expect(header()).toContain('maya@school.example');
    expect((screen.getByLabelText(COPY.generalFeedback) as HTMLTextAreaElement).value).toBe('typed');
  });

  it('with a student picked, the header counts what is shown and names the whole queue', async () => {
    setup([MAYA, ARI, STRANGER]);
    fireEvent.change(await screen.findByRole('combobox', { name: 'Student' }), { target: { value: 'stu-2' } });
    const head = document.querySelector('[data-outstanding]')!;
    expect(head.textContent).toBe('1 need grading · 3 in all');
  });

  it('the picker uses Student N while Hide names is on', async () => {
    window.localStorage.setItem('progress.hideNames', '1');
    setup([MAYA, ARI, STRANGER]);
    const picker = (await screen.findByRole('combobox', { name: 'Student' })) as HTMLSelectElement;
    expect([...picker.options].map((o) => o.textContent)).toEqual(['All students', 'Student 1', 'Student 2', COPY.notInYourClass]);
  });

  it('J and K do nothing while a dialog is open', async () => {
    // A graded, unreleased row puts "Release all graded" up; its dialog is modal.
    setup([MAYA, row({ check_id: 'chk-2', student_id: 'stu-2', student_label: 'ari@school.example', graded: true, graded_at: 'x' })]);
    fireEvent.click(await screen.findByRole('button', { name: /Release all graded/ }));
    await screen.findByRole('alertdialog');
    fireEvent.keyDown(document.body, { key: 'j' });
    expect(document.querySelector('[data-grade-panel]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    fireEvent.keyDown(document.body, { key: 'j' });
    await waitFor(() => expect(header()).toContain('maya@school.example'));
  });

  it('J and K step through the list as shown, but not while typing', async () => {
    setup([MAYA, ARI, STRANGER]);
    await screen.findByRole('combobox', { name: 'Student' });
    // J steps through the LOADED rows; the Student box can appear first, and
    // a J pressed before the rows arrive is a no-op (about 1 run in 40 timed
    // out here, 2026-11-27). Press once the list is there.
    await waitFor(() => expect(document.querySelectorAll('[data-row-key]')).toHaveLength(3));
    fireEvent.keyDown(document.body, { key: 'j' });
    await waitFor(() => expect(header()).toContain('maya@school.example'));
    fireEvent.keyDown(document.body, { key: 'j' });
    await waitFor(() => expect(header()).toContain('ari@school.example'));
    expect(document.activeElement?.getAttribute('data-row-key')).toBe('chk-2:blk-1');
    fireEvent.keyDown(document.body, { key: 'k' });
    await waitFor(() => expect(header()).toContain('maya@school.example'));
    // In the feedback box, j is a letter.
    const fb = screen.getByLabelText(COPY.generalFeedback);
    fireEvent.keyDown(fb, { key: 'j' });
    expect(header()).toContain('maya@school.example');
  });
});
