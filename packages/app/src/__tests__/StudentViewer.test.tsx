// @vitest-environment jsdom
// =============================================================================
// StudentViewer.test.tsx — the student route's gate and failure screens
// -----------------------------------------------------------------------------
// Covers the screens a student meets when things are NOT the happy path, since
// those are the ones nobody exercises by hand:
//
//  - the pre-auth gate names the activity (3.2A) but must never print a
//    teacher's EMAIL to an anonymous page — a live check against the deployed
//    meta endpoint returned exactly that, because display_name holds whatever
//    the sign-up trigger stored;
//  - each ViewerErrorKind gets its own honest screen, and only the recoverable
//    ones offer Retry (telling a student to retry an unpublished activity is a
//    lie they will follow several times).
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
// Per-file, matching this package's convention (ImportMarkdownDialog.test.tsx):
// registers the jest-dom matchers on vitest's expect and augments its types.
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

const h = vi.hoisted(() => ({
    session: { current: null as { access_token: string } | null },
    meta: { current: { title: 'Linear Systems', teacherName: 'Kia Jafari' } as unknown },
    load: { current: null as unknown },
}));

vi.mock('../lib/SessionContext', () => ({
    useSession: () => ({ session: h.session.current, loading: false }),
}));
vi.mock('../lib/supabase', () => ({
    supabase: { auth: { signInWithOAuth: vi.fn() } },
    supabaseConfigured: true,
}));
vi.mock('@activity/viewer', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        createReadClient: () => ({
            fetchMeta: async () => {
                if (h.meta.current instanceof Error) throw h.meta.current;
                return h.meta.current;
            },
            load: async () => {
                if (h.load.current instanceof Error) throw h.load.current;
                return h.load.current;
            },
            resolve: async () => ({ versionId: 'v', versionNum: 1, title: 't' }),
            fetchContent: async () => h.load.current,
        }),
        createHttpCheckService: () => ({
            checkSection: async () => ({}),
            fetchReleasedFeedback: async () => ({ graded: false, blocks: {} }),
        }),
    };
});

import StudentViewer from '../routes/StudentViewer';
import { ViewerLoadError } from '@activity/viewer';

function renderRoute(id = 'aaaaaaaa-0000-4000-8000-000000000001') {
    return render(
        <MemoryRouter initialEntries={[`/a/${id}`]}>
            <Routes>
                <Route path="/a/:activityId" element={<StudentViewer />} />
            </Routes>
        </MemoryRouter>,
    );
}

afterEach(() => {
    cleanup();
    h.session.current = null;
    h.meta.current = { title: 'Linear Systems', teacherName: 'Kia Jafari' };
    h.load.current = null;
});

describe('pre-auth gate (ruling 3.2A)', () => {
    it('names the activity and its teacher before asking who you are', async () => {
        renderRoute();
        expect(await screen.findByText('Linear Systems')).toBeInTheDocument();
        expect(screen.getByText('Kia Jafari shared')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('NEVER prints an email-shaped teacher name to this anonymous page', async () => {
        h.meta.current = { title: 'Test 1', teacherName: 'teacher@school.org' };
        const { container } = renderRoute();
        expect(await screen.findByText('Test 1')).toBeInTheDocument();
        // Degrades to a neutral attribution rather than publishing an address.
        expect(screen.getByText('You were sent')).toBeInTheDocument();
        expect(container.textContent).not.toContain('@school.org');
    });

    it('still offers sign-in when the meta lookup fails', async () => {
        h.meta.current = new Error('meta down');
        renderRoute();
        expect(
            await screen.findByRole('button', { name: /sign in/i }),
        ).toBeInTheDocument();
    });
});

describe('failure screens (Q3A)', () => {
    const cases = [
        ['unavailable', /isn.t available/i, false],
        ['offline', /offline/i, true],
        ['unservable', /couldn.t be opened/i, true],
        ['unauthenticated', /sign in again/i, true],
    ] as const;

    for (const [kind, heading, retryable] of cases) {
        it(`${kind}: says what happened, ${retryable ? 'offers' : 'does NOT offer'} retry`, async () => {
            h.session.current = { access_token: 'tok' };
            h.load.current = new ViewerLoadError(kind, 'boom');
            const { container } = renderRoute();

            await waitFor(() =>
                expect(container.querySelector(`[data-failure="${kind}"]`)).not.toBeNull(),
            );
            expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
            const retry = screen.queryByRole('button', { name: /try again/i });
            expect(Boolean(retry)).toBe(retryable);
        });
    }

    it('never shows a raw status code as the headline', async () => {
        h.session.current = { access_token: 'tok' };
        h.load.current = new ViewerLoadError('unknown', 'Request failed (503)');
        renderRoute();
        const heading = await screen.findByRole('heading');
        expect(heading.textContent).not.toMatch(/\d{3}/);
    });
});
