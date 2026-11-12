// @vitest-environment jsdom
// =============================================================================
// HomeSignOut.test.tsx — sign-out says what it clears (UI review G-1)
// -----------------------------------------------------------------------------
// Signing out wipes the device's viewer storage (S6-6, unchanged). When that
// would take answers the student hasn't checked, Home asks first and names
// how many activities; with nothing unchecked it signs out in one click. The
// idle bar is fixed to the screen and offers "I'm still here".
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

const h = vi.hoisted(() => ({
    unchecked: { current: 0 },
    signOut: vi.fn(async () => {}),
    prompt: { current: null as null | (() => void) },
}));

vi.mock('../lib/SessionContext', () => ({
    useSession: () => ({
        session: { user: { id: 'stu-1', email: 'stu@school.org', user_metadata: { full_name: 'Mere Paki' } } },
        loading: false,
        role: 'student',
        roleStatus: 'ready',
        retryRole: vi.fn(),
    }),
}));
vi.mock('../lib/studentAuth', async (importActual) => ({
    ...(await importActual<typeof import('../lib/studentAuth')>()),
    signOutEverything: h.signOut,
    watchIdleSignOut: (o: { onPrompt: () => void }) => {
        h.prompt.current = o.onPrompt;
        return { stop: () => {} };
    },
}));
vi.mock('../lib/uncheckedWork', async (importActual) => ({
    ...(await importActual<typeof import('../lib/uncheckedWork')>()),
    uncheckedActivitiesOnDevice: () => h.unchecked.current,
}));
vi.mock('../lib/classes', () => ({
    listMyClasses: async () => [{ classId: 'c1', name: '7B', joinedAt: '2026-09-01T00:00:00Z', factsCode: null }],
}));
vi.mock('../lib/classActivities', async (importActual) => ({
    ...(await importActual<typeof import('../lib/classActivities')>()),
    listClassActivities: async () => [],
    listMyActivityProgress: async () => [],
}));

const { default: Home } = await import('../routes/Home');

function renderHome() {
    return render(
        <MemoryRouter>
            <Home />
        </MemoryRouter>,
    );
}

beforeEach(() => {
    h.unchecked.current = 0;
    h.signOut.mockClear();
});
afterEach(cleanup);

describe('student sign-out (G-1)', () => {
    it('with nothing unchecked, Sign out signs out straight away', async () => {
        renderHome();
        fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }));
        await waitFor(() => expect(h.signOut).toHaveBeenCalledTimes(1));
        expect(screen.queryByRole('alertdialog')).toBeNull();
    });

    it('with unchecked answers, it asks first and names how many activities', async () => {
        h.unchecked.current = 2;
        renderHome();
        fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }));
        const dialog = await screen.findByRole('alertdialog', { name: 'Sign out?' });
        expect(within(dialog).getByText(/answers you haven’t checked in 2 activities/)).toBeInTheDocument();
        expect(h.signOut).not.toHaveBeenCalled();
        fireEvent.click(within(dialog).getByRole('button', { name: 'Go back' }));
        await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
        expect(h.signOut).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
        fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Sign out anyway' }));
        await waitFor(() => expect(h.signOut).toHaveBeenCalledTimes(1));
    });

    it('the idle warning is a fixed bar that names the cost and offers "I’m still here"', async () => {
        h.unchecked.current = 1;
        renderHome();
        await screen.findByRole('button', { name: 'Sign out' });
        act(() => h.prompt.current?.());
        const bar = document.querySelector('[data-banner="idle-prompt"]') as HTMLElement;
        expect(bar).toBeInTheDocument();
        expect(bar.className).toMatch(/\bfixed\b/);
        expect(bar.textContent).toMatch(/answers you haven’t checked in 1 activity\./);
        expect(within(bar).getByRole('button', { name: 'I’m still here' })).toBeInTheDocument();
    });
});
