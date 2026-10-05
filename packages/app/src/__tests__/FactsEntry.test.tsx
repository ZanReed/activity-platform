// @vitest-environment jsdom
// /facts/:code — the rule the e2e rows cannot force: once a run is on screen,
// NOTHING but the student's own sign-out tears it down (the author's no-reload
// rule). The session context is mocked so the test can make the role re-read
// mid-run — which is what really happens after a pending account joins (the
// route calls retryRole) and what a slow role fetch can do at any time.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

const session = vi.hoisted(() => ({
    value: {
        session: { user: { id: 'student-1' } } as unknown,
        loading: false,
        role: 'student' as string | null,
        roleStatus: 'ready' as string,
        retryRole: vi.fn(),
    },
}));
vi.mock('../lib/SessionContext', () => ({ useSession: () => session.value }));

const api = vi.hoisted(() => ({ fetchEntry: vi.fn(), saveAttempts: vi.fn() }));
vi.mock('../lib/factProbe', async (orig) => ({
    ...(await orig<typeof import('../lib/factProbe')>()),
    ...api,
}));
vi.mock('../lib/classes', () => ({ joinClass: vi.fn(), redeemJoinCode: vi.fn() }));
vi.mock('../lib/auth', () => ({ signInWithGoogle: vi.fn() }));
vi.mock('../lib/studentAuth', () => ({ signOutEverything: vi.fn(async () => {}) }));

import FactsEntry from '../routes/FactsEntry';

const READY = {
    state: 'ready', probe_id: 'probe-1', total: 2, ceiling_s: 15, saved: 0, next_n: 1,
    counts: { right: 0, skipped: 0, not_counted: 0 },
    baselines: { keyboard: null, keypad: null },
    items: [
        { n: 1, display: '7 × 8 = __', spoken: 'seven times eight', answer: '56' },
        { n: 2, display: '9 × 6 = __', spoken: 'nine times six', answer: '54' },
    ],
};

function page() {
    return render(
        <MemoryRouter initialEntries={['/facts/ABC234']}>
            <Routes>
                <Route path="/facts/:code" element={<FactsEntry />} />
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    api.fetchEntry.mockReset().mockResolvedValue(READY);
    api.saveAttempts.mockReset().mockResolvedValue({ state: 'saved', saved: 1, finished: false });
    session.value = { ...session.value, role: 'student', roleStatus: 'ready', loading: false };
});
afterEach(cleanup);

describe('FactsEntry', () => {
    it('a role re-read while a run is on screen does not tear it down or re-read the entry', async () => {
        const view = page();
        await screen.findByRole('heading', { name: 'Quick number facts' });
        expect(api.fetchEntry).toHaveBeenCalledTimes(1);
        expect(api.fetchEntry).toHaveBeenCalledWith('ABC234');

        // The student starts: the warm-up is on screen and they have typed.
        fireEvent.click(screen.getByRole('button', { name: 'Start' }));
        // WAIT for the warm-up, do not assume it is there synchronously. The
        // intro arrives from an async load (outside act), so React may not yet
        // have subscribed the runner to its store when the click lands; it
        // re-renders a tick later. Reading the DOM in the same tick failed
        // once on CI (run for a864945, 2026-10-05) and never locally.
        const answer = await screen.findByTestId('fx-answer');
        fireEvent.keyDown(answer, { key: '4' });
        expect(answer.textContent).toBe('4');

        // The role is re-read: loading, then ready again.
        session.value = { ...session.value, roleStatus: 'loading' };
        await act(async () => {
            view.rerender(
                <MemoryRouter initialEntries={['/facts/ABC234']}>
                    <Routes>
                        <Route path="/facts/:code" element={<FactsEntry />} />
                    </Routes>
                </MemoryRouter>,
            );
        });
        // Still the SAME runner, with what was typed — not a gate card.
        expect(screen.getByTestId('fx-answer')).toBe(answer);
        expect(answer.textContent).toBe('4');

        session.value = { ...session.value, roleStatus: 'ready' };
        await act(async () => {
            view.rerender(
                <MemoryRouter initialEntries={['/facts/ABC234']}>
                    <Routes>
                        <Route path="/facts/:code" element={<FactsEntry />} />
                    </Routes>
                </MemoryRouter>,
            );
        });
        expect(screen.getByTestId('fx-answer')).toBe(answer);
        expect(answer.textContent).toBe('4');
        expect(api.fetchEntry).toHaveBeenCalledTimes(1);
    });

    it('shows each named state its own card and never the word "probe"', async () => {
        for (const [entry, heading] of [
            [{ state: 'none_open' }, 'Nothing to do yet'],
            [{ state: 'not_member' }, 'Join this class first'],
            [{ state: 'teacher' }, 'This link is for students'],
            [{ state: 'closed', saved: 15, total: 30, counts: { right: 9, skipped: 1, not_counted: 0 } }, 'Your teacher has finished this'],
            [{ state: 'finished', saved: 30, total: 30, counts: { right: 24, skipped: 2, not_counted: 2 } }, 'All done'],
        ] as const) {
            api.fetchEntry.mockResolvedValue(entry);
            const { container } = page();
            await screen.findByRole('heading', { name: heading });
            expect(container.textContent).not.toMatch(/probe/i);
            if (entry.state === 'closed') expect(container.textContent).toContain('Your 15 answers were saved.');
            if (entry.state === 'finished') {
                expect(container.textContent).toContain('You got 24 right. You skipped 2.');
                expect(container.textContent).toContain('2 were not counted because you left the page.');
                expect(container.textContent).not.toMatch(/out of/);
            }
            cleanup();
        }
    });

    it('a failed entry read says so and retries on request', async () => {
        api.fetchEntry.mockRejectedValueOnce(new Error('fetch failed'));
        page();
        await screen.findByRole('heading', { name: 'That did not load' });
        api.fetchEntry.mockResolvedValue({ state: 'none_open' });
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
        });
        await screen.findByRole('heading', { name: 'Nothing to do yet' });
    });
});
