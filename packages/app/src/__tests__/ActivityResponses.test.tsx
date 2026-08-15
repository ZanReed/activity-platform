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
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

const h = vi.hoisted(() => ({
  queue: vi.fn(),
  save: vi.fn(),
  release: vi.fn(),
}));

vi.mock('../lib/grading', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/grading')>()),
  fetchGradingQueue: h.queue,
  saveCheckGrade: h.save,
  releaseGrades: h.release,
}));

import ActivityResponses from '../routes/ActivityResponses';
import { RESPONSES_COPY as COPY, type GradingQueueRow } from '../lib/grading';

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
});

afterEach(() => {
  cleanup();
  h.queue.mockReset();
  h.save.mockReset();
  h.release.mockReset();
});

describe('the queue', () => {
  it('leads with the workload, not the version structure (D9)', async () => {
    setup([row(), row({ check_id: 'chk-2', student_id: 'stu-2', student_label: 'j@school.example' })]);
    await waitFor(() => expect(screen.getByText('2 need grading')).toBeTruthy());
    // A current-version row carries no version tag: in the common one-version
    // case the queue shows no version chrome at all.
    expect(screen.queryByText('v2')).toBeNull();
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

  async function openPanel(r: GradingQueueRow) {
    setup([r]);
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
    await waitFor(() => expect(h.release).toHaveBeenCalledTimes(2));
    expect(h.release).toHaveBeenCalledWith('a1', 'stu-1');
    expect(h.release).toHaveBeenCalledWith('a1', 'stu-2');
  });
});
