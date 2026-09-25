// @vitest-environment jsdom
// =============================================================================
// ActivityResponsesAssist.test.tsx — the AI-draft layer on the grading surface
// (migration 0042; ai-grading-assist.md §4b DR-1..12)
// -----------------------------------------------------------------------------
// Sibling of ActivityResponses.test.tsx (which pins the 0034 rulings with the
// assist layer mocked quiet). Each row here pins a DR ruling that could
// plausibly be "simplified" back out:
//
//  * DR-1/DR-3 — the pre-fill wears a draft mark that clears PER FIELD on
//    touch, and Save routes through the confirm RPC with the draft's id + rev
//    so the SERVER decides confirmed-vs-edited. The client never labels edits.
//  * D6/DR-5 — a low-confidence draft NEVER pre-fills; the badge is neutral.
//  * DR-6 — "Draft pending" exists only under a live lease; an expired claim
//    renders NOTHING; the heartbeat renders only when the provider is on.
//  * DR-8 — reject clears the drafted values in place and records a reason.
//  * EH-5 — a draft that changed under the teacher reloads, never guesses.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

const h = vi.hoisted(() => ({
  queue: vi.fn(),
  save: vi.fn(),
  release: vi.fn(),
  suggestions: vi.fn(),
  assistStatus: vi.fn(),
  rubrics: vi.fn(),
  confirm: vi.fn(),
  reject: vi.fn(),
}));

vi.mock('../lib/grading', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/grading')>()),
  fetchGradingQueue: h.queue,
  saveCheckGrade: h.save,
  releaseGrades: h.release,
}));

vi.mock('../lib/gradingAssist', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/gradingAssist')>()),
  fetchSuggestions: h.suggestions,
  fetchAssistStatus: h.assistStatus,
  fetchVersionRubrics: h.rubrics,
  confirmSuggestion: h.confirm,
  rejectSuggestion: h.reject,
}));

import ActivityResponses from '../routes/ActivityResponses';
import { RESPONSES_COPY as COPY, type GradingQueueRow } from '../lib/grading';
import {
  ASSIST_COPY,
  deriveAssistDisplay,
  type SuggestionRow,
} from '../lib/gradingAssist';

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

const FUTURE = new Date(Date.now() + 10 * 60000).toISOString();
const PAST = new Date(Date.now() - 60000).toISOString();

const DRAFT: SuggestionRow = {
  suggestion_id: 'sug-1',
  check_id: 'chk-1',
  block_id: 'blk-1',
  status: 'pending',
  machine_confidence: 'high',
  criteria: [
    { criterionId: 'c1', earned: 3, maxPoints: 4, feedback: 'unit rates compared' },
  ],
  general_feedback_draft: 'Good comparison overall.',
  misconception_notes: [
    { misId: 'mis.rate.compares-totals', evidence: 'compared 5.40 to 7.50' },
  ],
  struck_mis: [],
  model_id: 'qwen3-32b',
  prompt_rev: 1,
  schema_rev: 1,
  claimed_at: PAST,
  lease_expires_at: FUTURE,
  submitted_at: PAST,
  resolved_at: null,
  reject_reason: null,
  updated_at: '2026-09-26T00:00:00Z',
};

const RUBRIC = new Map([
  ['v1:blk-1', [{ id: 'c1', label: 'Reasoning', maxPoints: 4 }]],
]);

function row(overrides: Partial<GradingQueueRow> = {}): GradingQueueRow {
  return { ...BASE, ...overrides };
}

function suggestion(overrides: Partial<SuggestionRow> = {}): SuggestionRow {
  return { ...DRAFT, ...overrides };
}

function renderRoute() {
  render(
    <MemoryRouter initialEntries={['/activity/a1/responses']}>
      <Routes>
        <Route path="/activity/:id/responses" element={<ActivityResponses />} />
      </Routes>
    </MemoryRouter>,
  );
}

function setup(rows: GradingQueueRow[], suggestions: SuggestionRow[]) {
  h.queue.mockResolvedValue(rows);
  h.suggestions.mockResolvedValue(suggestions);
  renderRoute();
}

async function openFirstRow() {
  const rowButton = await waitFor(() => {
    const el = document.querySelector('[data-chip]')?.closest('button');
    if (!el) throw new Error('no queue row');
    return el as HTMLElement;
  });
  fireEvent.click(rowButton);
  await waitFor(() => expect(screen.getByLabelText(COPY.generalFeedback)).toBeTruthy());
}

beforeEach(() => {
  h.save.mockResolvedValue(undefined);
  h.release.mockResolvedValue(1);
  h.assistStatus.mockResolvedValue({ provider: 'local_worker', last_draft_at: PAST });
  h.rubrics.mockResolvedValue(RUBRIC);
  h.confirm.mockResolvedValue('confirmed');
  h.reject.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  for (const fn of Object.values(h)) fn.mockReset();
});

describe('the pre-fill (DR-1/DR-2/DR-3)', () => {
  it('initializes from the draft, marks every drafted field, and clears marks per field on touch', async () => {
    setup([row()], [suggestion()]);
    await openFirstRow();

    // Values pre-filled from the draft...
    expect((screen.getByLabelText('Reasoning') as HTMLInputElement).value).toBe('3');
    expect(
      (screen.getByLabelText(COPY.generalFeedback) as HTMLTextAreaElement).value,
    ).toBe('Good comparison overall.');
    // ...each wearing its own draft mark (points, per-criterion feedback,
    // general): the mark is TEXT, not a style, so it survives grayscale and
    // screen readers.
    expect(document.querySelectorAll('[data-draft-mark]').length).toBe(3);

    // Touching ONE field clears ONLY its mark.
    fireEvent.change(screen.getByLabelText('Reasoning'), { target: { value: '2' } });
    await waitFor(() =>
      expect(document.querySelectorAll('[data-draft-mark]').length).toBe(2),
    );
  });

  it('Save routes through the confirm RPC with the draft id + rev — the SERVER labels the edit', async () => {
    setup([row()], [suggestion()]);
    await openFirstRow();
    fireEvent.click(screen.getByRole('button', { name: COPY.save }));
    await waitFor(() => expect(h.confirm).toHaveBeenCalledTimes(1));
    expect(h.save).not.toHaveBeenCalled();
    expect(h.confirm.mock.calls[0]?.[0]).toMatchObject({
      suggestionId: 'sug-1',
      expectedUpdatedAt: '2026-09-26T00:00:00Z',
      struckMis: [],
    });
    // An UNTOUCHED pre-fill saves the draft's own values verbatim.
    expect(h.confirm.mock.calls[0]?.[0].criteria[0]).toMatchObject({
      criterionId: 'c1',
      earned: 3,
    });
  });

  it('a draft that changed under the teacher reloads instead of guessing (EH-5)', async () => {
    h.confirm.mockRejectedValue(new Error('suggestion_changed'));
    setup([row()], [suggestion()]);
    await openFirstRow();
    fireEvent.click(screen.getByRole('button', { name: COPY.save }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toBe(ASSIST_COPY.draftChanged);
    // ...and the row reloaded (initial load + the reload).
    expect(h.queue).toHaveBeenCalledTimes(2);
  });

  it('a manual row (no draft) still saves through the 0034 path', async () => {
    setup([row()], []);
    await openFirstRow();
    fireEvent.change(screen.getByLabelText('Reasoning'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: COPY.save }));
    await waitFor(() => expect(h.save).toHaveBeenCalledTimes(1));
    expect(h.confirm).not.toHaveBeenCalled();
  });
});

describe('misconception chips (DR-4)', () => {
  it('chips strike individually, show their evidence, and travel with Save', async () => {
    setup([row()], [suggestion()]);
    await openFirstRow();

    const chip = screen.getByRole('button', { name: 'mis.rate.compares-totals' });
    expect(chip.getAttribute('aria-pressed')).toBe('false');

    // Evidence appears on focus (keyboard-reachable, not hover-only)...
    fireEvent.focus(chip);
    await waitFor(() =>
      expect(screen.getByText('compared 5.40 to 7.50')).toBeTruthy(),
    );

    // ...a strike toggles without rejecting the draft...
    fireEvent.click(chip);
    expect(chip.getAttribute('aria-pressed')).toBe('true');

    // ...and the strike is REPORTED to the server (it counts as an edit and
    // as per-tag telemetry — the client never computes the edit label).
    fireEvent.click(screen.getByRole('button', { name: COPY.save }));
    await waitFor(() => expect(h.confirm).toHaveBeenCalled());
    expect(h.confirm.mock.calls[0]?.[0].struckMis).toEqual(['mis.rate.compares-totals']);
  });
});

describe('abstain (D6/DR-5)', () => {
  it('a low-confidence draft never pre-fills and wears the NEUTRAL badge', async () => {
    setup(
      [row()],
      [suggestion({ machine_confidence: 'low', criteria: [], general_feedback_draft: null })],
    );
    await openFirstRow();
    // The badge, in the panel — the exact contract string.
    expect(screen.getAllByText(ASSIST_COPY.abstain).length).toBeGreaterThan(0);
    // No pre-fill: the points field is empty and Save goes the manual path.
    expect((screen.getByLabelText('Reasoning') as HTMLInputElement).value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: COPY.save }));
    await waitFor(() => expect(h.save).toHaveBeenCalled());
    expect(h.confirm).not.toHaveBeenCalled();
  });
});

describe('worker states (DR-6/DR-9)', () => {
  it('a live lease shows "Draft pending"; an expired one shows NOTHING', async () => {
    setup(
      [row(), row({ check_id: 'chk-2', student_id: 'stu-2', student_label: 'j@school.example', block_id: 'blk-1' })],
      [
        suggestion({ status: 'claimed', submitted_at: null }),
        suggestion({
          suggestion_id: 'sug-2',
          check_id: 'chk-2',
          status: 'claimed',
          submitted_at: null,
          lease_expires_at: PAST,
        }),
      ],
    );
    await waitFor(() =>
      expect(screen.getByText(ASSIST_COPY.draftPending)).toBeTruthy(),
    );
    expect(document.querySelectorAll('[data-assist="draft-pending"]').length).toBe(1);
  });

  it('the heartbeat renders only when the provider is on; quota pause is a header line', async () => {
    h.assistStatus.mockResolvedValue({
      provider: 'platform_api',
      last_draft_at: PAST,
      quota_paused: true,
      resumes_at: '2026-10-01T00:00:00Z',
    });
    setup([row()], []);
    await waitFor(() =>
      expect(document.querySelector('[data-assist-heartbeat]')).toBeTruthy(),
    );
    const paused = document.querySelector('[data-assist-quota-paused]');
    expect(paused?.textContent).toContain('AI drafting paused');
  });

  it('provider off means NO assist chrome at all', async () => {
    h.assistStatus.mockResolvedValue({ provider: 'off' });
    setup([row()], []);
    await waitFor(() => expect(screen.getByText('1 need grading')).toBeTruthy());
    expect(document.querySelector('[data-assist-heartbeat]')).toBeNull();
    expect(document.querySelector('[data-assist-quota-paused]')).toBeNull();
  });
});

describe('reject (DR-8)', () => {
  it('clears the drafted values in place and records the one-tap reason', async () => {
    setup([row()], [suggestion()]);
    await openFirstRow();
    fireEvent.click(screen.getByRole('button', { name: ASSIST_COPY.rejectDraft }));
    fireEvent.click(
      screen.getByRole('button', { name: ASSIST_COPY.rejectReasons.wrong_points }),
    );
    await waitFor(() => expect(h.reject).toHaveBeenCalledTimes(1));
    expect(h.reject.mock.calls[0]?.[0]).toMatchObject({
      suggestionId: 'sug-1',
      reason: 'wrong_points',
    });
    // The rubric is BLANK now — a plain manual row (the row does not vanish).
    expect((screen.getByLabelText('Reasoning') as HTMLInputElement).value).toBe('');
    expect(
      (screen.getByLabelText(COPY.generalFeedback) as HTMLTextAreaElement).value,
    ).toBe('');
  });
});

describe('provenance (DR-10)', () => {
  it('a graded row shows its teacher-only draft provenance', async () => {
    setup(
      [
        row({
          graded: true,
          graded_at: 'x',
          criteria: [{ criterionId: 'c1', earned: 3, maxPoints: 4 }],
        }),
      ],
      [suggestion({ status: 'edited', resolved_at: PAST })],
    );
    h.queue.mockResolvedValue([
      row({
        graded: true,
        graded_at: 'x',
        criteria: [{ criterionId: 'c1', earned: 3, maxPoints: 4 }],
      }),
    ]);
    renderRoute();
    // Graded rows hide behind the filter; flip it, then open.
    const showGraded = await waitFor(() =>
      screen.getAllByRole('button', { name: COPY.showGraded })[0],
    );
    fireEvent.click(showGraded!);
    await openFirstRow();
    expect(screen.getByText(ASSIST_COPY.provenanceEdited)).toBeTruthy();
  });
});

describe('the rubric renders from the pinned version', () => {
  it('a FIRST-time manual grade gets labeled rubric rows (the shipped gap, closed)', async () => {
    setup([row()], []);
    await openFirstRow();
    // Label from the version's rubric spec, max shown statically.
    expect(screen.getByLabelText('Reasoning')).toBeTruthy();
    expect(screen.getByText('/ 4')).toBeTruthy();
  });
});

describe('deriveAssistDisplay (DR-6, the state table in one function)', () => {
  const now = new Date('2026-09-26T12:00:00Z');
  it('covers the table', () => {
    expect(deriveAssistDisplay(undefined, false, now).kind).toBe('none');
    expect(
      deriveAssistDisplay(
        suggestion({ status: 'claimed', lease_expires_at: '2026-09-26T12:05:00Z' }),
        false,
        now,
      ).kind,
    ).toBe('draft_pending');
    expect(
      deriveAssistDisplay(
        suggestion({ status: 'claimed', lease_expires_at: '2026-09-26T11:55:00Z' }),
        false,
        now,
      ).kind,
    ).toBe('none');
    expect(deriveAssistDisplay(suggestion(), false, now).kind).toBe('prefill');
    expect(
      deriveAssistDisplay(suggestion({ machine_confidence: 'low' }), false, now).kind,
    ).toBe('abstain');
    // A pending draft on an already-graded row is moot — never pre-fill
    // against a saved grade.
    expect(deriveAssistDisplay(suggestion(), true, now).kind).toBe('none');
    expect(
      deriveAssistDisplay(suggestion({ status: 'confirmed' }), true, now).kind,
    ).toBe('provenance');
  });
});
