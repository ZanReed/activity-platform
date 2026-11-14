// @vitest-environment jsdom
// =============================================================================
// ClassPresent.test.tsx — today's period on the projector (period planner PP-9)
// -----------------------------------------------------------------------------
// Bound to what is RENDERED: the blocks in order with their times, the join
// link and code, the hook's prompt full width with its note HIDDEN until asked
// (notes carry answers), a local "we're here", and Escape (note first, then back).
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

const h = vi.hoisted(() => ({ role: 'teacher' as string | null, planFails: false, todayCalls: 0 }));
vi.mock('../lib/SessionContext', () => ({ useSession: () => ({ role: h.role }) }));
vi.mock('../lib/classes', () => ({
    listClasses: async () => [{ id: 'c1', name: '7A', joinCode: 'ABC123' }],
}));
vi.mock('../lib/classToday', () => ({
    fetchClassToday: async () => (h.todayCalls++, {
        on_date: '2026-11-16',
        activities: [{ activity_id: 'a1', title: 'Unit rates' }],
    }),
}));
vi.mock('../lib/classPlan', async (orig) => ({
    ...(await orig<typeof import('../lib/classPlan')>()),
    fetchClassPlan: async () => {
        if (h.planFails) throw new Error('offline');
        return {
        today: '2026-11-16',
        limit: '2026-12-18',
        days: [
            {
                on_date: '2026-11-16',
                activities: [{ activity_id: 'a1', title: 'Unit rates', minutes: 25, position: 1, available: true }],
                hook_ids: ['hook.r.1'],
            },
        ],
        last_day: null,
        };
    },
}));
vi.mock('../lib/chainHooks', async (orig) => ({
    ...(await orig<typeof import('../lib/chainHooks')>()),
    fetchMyChainHooks: async () => ({
        activityChains: { a1: 'chain.rates' },
        chains: {
            'chain.rates': [
                {
                    id: 'hook.r.1',
                    connects_to: [],
                    prompt: 'A bag of 5 for $4 or a bag of 12 for $10: which is better value?',
                    note: 'The 12-bag: 83c each against 80c. ANSWER LEAK if projected.',
                },
            ],
        },
    }),
}));
vi.mock('../lib/factSprint', () => ({ fetchSprintOverview: async () => ({ on: true }) }));
vi.mock('../lib/mixedTeacher', () => ({
    fetchMixedSummary: async () => ({ on_at: '2026-11-01', items_per_session: 6, default_items: 6 }),
}));

import ClassPresent from '../routes/ClassPresent';

function renderPage(from?: string) {
    return render(
        <MemoryRouter initialEntries={[{ pathname: '/classes/c1/present', state: from ? { from } : null }]}>
            <Routes>
                <Route path="/classes" element={<p>Classes page</p>} />
                <Route path="/classes/:classId/present" element={<ClassPresent />} />
                <Route path="/classes/:classId/facts" element={<p>Today and practice page</p>} />
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    h.role = 'teacher';
    h.planFails = false;
    h.todayCalls = 0;
});
afterEach(cleanup);

const rows = () =>
    [...screen.getByRole('list', { name: "Today's period" }).querySelectorAll('li')].map((li) => li.getAttribute('data-block'));

describe('the present view', () => {
    it('shows the blocks in §17 order with times, the join code, and the total', async () => {
        renderPage();
        await waitFor(() => expect(rows()).toEqual(['facts', 'hook', 'activity', 'practice']));
        expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('7A · Mon 16 Nov');
        expect(screen.getByText('ABC123')).toBeTruthy();
        expect(screen.getByText(/\/practice\/ABC123$/)).toBeTruthy();
        expect(screen.getByText('about 25 min')).toBeTruthy();
        expect(screen.getByText('About 38–42 min')).toBeTruthy();
    });

    it('the hook prompt is full width; its note is hidden until asked (it carries answers)', async () => {
        renderPage();
        expect(await screen.findByText('A bag of 5 for $4 or a bag of 12 for $10: which is better value?')).toBeTruthy();
        expect(screen.queryByText(/ANSWER LEAK/)).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Show note (on screen)' }));
        expect(screen.getByText(/ANSWER LEAK/)).toBeTruthy();
        // Escape hides the note first, and does not leave the page.
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(screen.queryByText(/ANSWER LEAK/)).toBeNull();
        expect(screen.getByRole('list', { name: "Today's period" })).toBeTruthy();
    });

    it('"We\'re here" marks one row at a time, locally', async () => {
        renderPage();
        const unit = await screen.findByRole('button', { name: "We're here: Unit rates" });
        fireEvent.click(unit);
        expect(unit.closest('li')?.getAttribute('aria-current')).toBe('step');
        fireEvent.click(screen.getByRole('button', { name: "We're here: the hook" }));
        expect(unit.closest('li')?.getAttribute('aria-current')).toBeNull();
    });

    it('Escape (with no note open) goes back to the class', async () => {
        renderPage();
        await screen.findByRole('list', { name: "Today's period" });
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(await screen.findByText('Today and practice page')).toBeTruthy();
    });

    it('opened from the Classes card, Escape and Back return to Classes', async () => {
        renderPage('/classes');
        await screen.findByRole('list', { name: "Today's period" });
        expect(screen.getByRole('link', { name: 'Back (Esc)' }).getAttribute('href')).toBe('/classes');
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(await screen.findByText('Classes page')).toBeTruthy();
    });

    it('a student sees nothing of the plan', async () => {
        h.role = 'student';
        renderPage();
        expect(await screen.findByText('This page is for teachers.')).toBeTruthy();
        expect(screen.queryByRole('list', { name: "Today's period" })).toBeNull();
    });

    it('while the role is loading, nothing is fetched or shown', async () => {
        h.role = null;
        renderPage();
        expect(await screen.findByText('Loading…')).toBeTruthy();
        await new Promise((r) => setTimeout(r, 20));
        expect(h.todayCalls).toBe(0);
        expect(screen.queryByRole('list', { name: "Today's period" })).toBeNull();
    });

    it('without the plan detail, it still presents today’s titles (no hook, no times)', async () => {
        h.planFails = true;
        renderPage();
        await waitFor(() => expect(rows()).toEqual(['facts', 'activity', 'practice']));
        expect(screen.getByText('time not set')).toBeTruthy();
        expect(screen.queryByText(/ANSWER LEAK/)).toBeNull();
    });

    it('a held Escape hides the note and stays on the page', async () => {
        renderPage();
        fireEvent.click(await screen.findByRole('button', { name: 'Show note (on screen)' }));
        fireEvent.keyDown(window, { key: 'Escape' });
        fireEvent.keyDown(window, { key: 'Escape', repeat: true });
        expect(screen.getByRole('list', { name: "Today's period" })).toBeTruthy();
    });
});
