// @vitest-environment jsdom
// =============================================================================
// ActivityAnalytics.test.tsx — the S7 teacher panel's four states
// -----------------------------------------------------------------------------
// The panel is the only place a human ever sees the census, so its failure
// states matter more than its happy path:
//
//   * an RPC refusal must not blank the page (the same message covers "not
//     yours" and "doesn't exist" — the panel repeats it, it doesn't guess),
//   * a version nobody has opened yet must SAY so rather than show a zero that
//     looks like "students got everything wrong",
//   * the unattributed bucket must be visible, because it is the signal that
//     the census is behind,
//   * a maintenance job that has never run must be stated, since a silently
//     dead cron is this system's classic failure.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

const h = vi.hoisted(() => {
    const result: { current: { data: unknown; error: unknown } } = {
        current: { data: null, error: null },
    };
    const rpc = vi.fn(() => Promise.resolve(result.current));
    return { result, rpc };
});

vi.mock('../lib/supabase', () => ({ supabase: { rpc: h.rpc } }));
vi.mock('../lib/SessionContext', () => ({
    useSession: () => ({ session: { user: { id: 'owner-1' } }, loading: false }),
}));

import ActivityAnalytics from '../routes/ActivityAnalytics';

function renderPanel() {
    return render(
        <MemoryRouter initialEntries={['/activity/act-1/analytics']}>
            <Routes>
                <Route path="/activity/:id/analytics" element={<ActivityAnalytics />} />
            </Routes>
        </MemoryRouter>,
    );
}

const payload = {
    activity_id: 'act-1',
    current_version_id: 'ver-1',
    censused: true,
    keys: [
        {
            census_key: 'fill_in_blank',
            block_count: 2,
            verdicts_all: 6,
            correct_all: 4,
            incorrect_all: 2,
            recorded_all: 0,
            verdicts_latest: 4,
            correct_latest: 3,
            incorrect_latest: 1,
            recorded_latest: 0,
            students: 2,
        },
    ],
    totals: { checks: 3, students: 2, last_check_at: '2026-08-04T10:00:00Z' },
    job: {
        last_run_at: '2026-08-04T03:30:00Z',
        stale_cache_rows_deleted: 0,
        section_check_rows: 3,
    },
};

afterEach(() => {
    cleanup();
    h.result.current = { data: null, error: null };
    h.rpc.mockClear();
});

describe('ActivityAnalytics', () => {
    it('renders both readings — latest attempt AND all attempts', async () => {
        h.result.current = { data: payload, error: null };
        renderPanel();

        await waitFor(() => expect(screen.getByText('fill in blank')).toBeTruthy());
        // 3 of 4 on the latest attempt; 4 of 6 across attempts. Showing only the
        // second would overstate mastery, which is exactly why both are here.
        expect(screen.getByText('(3/4)')).toBeTruthy();
        expect(screen.getByText('(4/6)')).toBeTruthy();
        expect(screen.getByText('75%')).toBeTruthy();
        expect(screen.getByText('67%')).toBeTruthy();
    });

    // 0036 (R12/D8): the Students column counts LATEST attempts only, so the
    // panel must say so. The number alone is ambiguous — a teacher reading it
    // beside "all attempts" would reasonably assume it spans every attempt.
    // Pinned because it is the arc's ONE user-visible change and a copy
    // refactor could drop it silently.
    it('discloses that Students is grounded in the latest attempt', async () => {
        h.result.current = { data: payload, error: null };
        renderPanel();

        await waitFor(() => expect(screen.getByText('fill in blank')).toBeTruthy());
        expect(
            screen.getByText(/Students.*counts each student whose latest attempt reaches/i),
        ).toBeTruthy();
    });

    it('shows totals and the maintenance-job line', async () => {
        h.result.current = { data: payload, error: null };
        renderPanel();
        await waitFor(() => expect(screen.getByText('Checks')).toBeTruthy());
        expect(screen.getByText('3')).toBeTruthy();
        expect(screen.getByText(/Maintenance last ran/)).toBeTruthy();
    });

    it('says the job has not run yet WITHOUT claiming it is unscheduled', async () => {
        // The ledger knows whether the job RAN; it knows nothing about whether
        // it is scheduled. An earlier version asserted "not scheduled yet",
        // which went false the moment the cron was registered and would have
        // sent a reader to re-schedule an already-scheduled job.
        h.result.current = { data: { ...payload, job: null }, error: null };
        renderPanel();
        await waitFor(() => expect(screen.getByText(/has not run yet/)).toBeTruthy());
        expect(screen.queryByText(/not scheduled/)).toBeNull();
    });

    it('flags a run that is more than a day old as possibly stopped', async () => {
        const twoDaysAgo = new Date(Date.now() - 48 * 3_600_000).toISOString();
        h.result.current = {
            data: { ...payload, job: { ...payload.job, last_run_at: twoDaysAgo } },
            error: null,
        };
        renderPanel();
        await waitFor(() => expect(screen.getByText(/may have stopped/)).toBeTruthy());
    });

    it('does not flag a run from within the last day', async () => {
        const sixHoursAgo = new Date(Date.now() - 6 * 3_600_000).toISOString();
        h.result.current = {
            data: { ...payload, job: { ...payload.job, last_run_at: sixHoursAgo } },
            error: null,
        };
        renderPanel();
        await waitFor(() => expect(screen.getByText(/Maintenance last ran/)).toBeTruthy());
        expect(screen.queryByText(/may have stopped/)).toBeNull();
    });

    it('explains an uncensused version instead of showing a bare zero', async () => {
        h.result.current = {
            data: { ...payload, censused: false, keys: [] },
            error: null,
        };
        renderPanel();
        await waitFor(() => expect(screen.getByText(/No census yet/)).toBeTruthy());
        expect(screen.getByText(/backfill:census/)).toBeTruthy();
    });

    it('surfaces the unattributed bucket with its explanation', async () => {
        h.result.current = {
            data: {
                ...payload,
                keys: [
                    {
                        ...payload.keys[0],
                        census_key: '_unattributed',
                        block_count: null,
                    },
                ],
            },
            error: null,
        };
        renderPanel();
        await waitFor(() =>
            expect(screen.getByText('Not yet attributed')).toBeTruthy(),
        );
        expect(screen.getByText(/no census/)).toBeTruthy();
    });

    it('keeps the page alive and repeats the server message on refusal', async () => {
        h.result.current = { data: null, error: { message: 'Not available' } };
        renderPanel();
        await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
        expect(screen.getByRole('alert').textContent).toContain('Not available');
        // The heading is still there: a refusal is a panel state, not a crash.
        expect(screen.getByText('Activity analytics')).toBeTruthy();
    });

    it('reports no checks yet without implying failure', async () => {
        h.result.current = {
            data: { ...payload, keys: [], totals: { checks: 0, students: 0, last_check_at: null } },
            error: null,
        };
        renderPanel();
        await waitFor(() =>
            expect(screen.getByText(/no student has checked/i)).toBeTruthy(),
        );
    });
});
