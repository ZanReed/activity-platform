// @vitest-environment jsdom
// =============================================================================
// TeacherNav.test.tsx — the teacher can move between Activities, Classes and
// the Bank from each of them (author's walkthrough bug, 2026-10-14)
// -----------------------------------------------------------------------------
// Bound to the REAL pages, not to TeacherNav alone: a nav component that no
// page renders would pass a component test and leave the bug in place. Each
// page must link to the other two, mark itself as current, and offer Sign out.
// The click-through proves the links route, not just that anchors exist.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

const h = vi.hoisted(() => {
    const from = vi.fn(() => {
        const qb: Record<string, unknown> = {
            select: () => qb,
            is: () => qb,
            order: () => Promise.resolve({ data: [], error: null }),
        };
        return qb;
    });
    return {
        from,
        rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
        signOutEverything: vi.fn(() => Promise.resolve()),
    };
});

vi.mock('../lib/supabase', () => ({ supabase: { from: h.from, rpc: h.rpc } }));
vi.mock('../lib/studentAuth', () => ({ signOutEverything: h.signOutEverything }));
vi.mock('../lib/bank', () => ({
    BANK_LICENSE: 'CC BY-NC-SA 4.0',
    listBank: () => Promise.resolve([]),
    copyBankActivity: vi.fn(),
    getBankTeacherGuide: vi.fn(),
    isBankLister: () => Promise.resolve(false),
    setActivityListing: vi.fn(),
    getMyPublicName: () => Promise.resolve({ name: null, optedIn: false }),
    setPublicName: vi.fn(),
}));
vi.mock('../lib/chainHooks', async (importActual) => ({
    ...(await importActual<typeof import('../lib/chainHooks')>()),
    fetchMyChainHooks: () => Promise.resolve([]),
}));
vi.mock('../lib/SessionContext', () => ({
    useSession: () => ({ session: { user: { id: 'teacher-1' } }, loading: false }),
}));
vi.mock('../components/BankPreview', () => ({ default: () => null }));

const { default: Activities } = await import('../routes/Activities');
const { default: Classes } = await import('../routes/Classes');
const { default: Bank } = await import('../routes/Bank');

const PAGES = [
    { path: '/activities', label: 'My activities', heading: 'My activities' },
    { path: '/classes', label: 'My classes', heading: 'My classes' },
    { path: '/bank', label: 'Activity Bank', heading: 'Activity Bank' },
] as const;

function renderAt(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/activities" element={<Activities />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/bank" element={<Bank />} />
            </Routes>
        </MemoryRouter>,
    );
}

const nav = () => screen.getByRole('navigation', { name: 'Teacher pages' });

afterEach(cleanup);

describe('teacher navigation between Activities, Classes and the Bank', () => {
    for (const page of PAGES) {
        it(`${page.path} links to the other two and marks itself current`, async () => {
            renderAt(page.path);
            await screen.findByRole('heading', { level: 1, name: page.heading });
            for (const other of PAGES) {
                const link = within(nav()).getByRole('link', { name: other.label });
                expect(link).toHaveAttribute('href', other.path);
                if (other.path === page.path) expect(link).toHaveAttribute('aria-current', 'page');
                else expect(link).not.toHaveAttribute('aria-current');
            }
            expect(within(nav()).getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
        });
    }

    it('the links route: Activities → Classes → Bank → Activities', async () => {
        renderAt('/activities');
        await screen.findByRole('heading', { level: 1, name: 'My activities' });
        fireEvent.click(within(nav()).getByRole('link', { name: 'My classes' }));
        await screen.findByRole('heading', { level: 1, name: 'My classes' });
        fireEvent.click(within(nav()).getByRole('link', { name: 'Activity Bank' }));
        await screen.findByRole('heading', { level: 1, name: 'Activity Bank' });
        fireEvent.click(within(nav()).getByRole('link', { name: 'My activities' }));
        await screen.findByRole('heading', { level: 1, name: 'My activities' });
    });

    it('Sign out uses the full sign-out sweep', async () => {
        renderAt('/classes');
        await screen.findByRole('heading', { level: 1, name: 'My classes' });
        fireEvent.click(within(nav()).getByRole('button', { name: 'Sign out' }));
        expect(h.signOutEverything).toHaveBeenCalledTimes(1);
    });
});
