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
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

const STUDENT_ID = 'dddddddd-0000-4000-8000-000000000001';
const OTHER_STUDENT_ID = 'dddddddd-0000-4000-8000-000000000002';

const h = vi.hoisted(() => ({
    // Shaped like a real Supabase Session: `user` is NOT optional there, and a
    // double that omits it lets the route read `session.user.id` in tests that
    // would crash against the real thing.
    session: {
      current: null as
        | { access_token: string; user: { id: string } }
        | null,
    },
    meta: { current: { title: 'Linear Systems', teacherName: 'Kia Jafari' } as unknown },
    load: { current: null as unknown },
}));

vi.mock('../lib/SessionContext', () => ({
    useSession: () => ({ session: h.session.current, loading: false }),
}));
vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithOAuth: vi.fn(),
            // The queue's ensureSession port calls this. Omitting it would send
            // every run down the catch branch and quietly park the queue.
            getSession: async () => ({ data: { session: h.session.current } }),
        },
    },
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
import { servedFixtureDocument } from '@activity/viewer/fixtures';

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
            h.session.current = { access_token: 'tok', user: { id: STUDENT_ID } };
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
        h.session.current = { access_token: 'tok', user: { id: STUDENT_ID } };
        h.load.current = new ViewerLoadError('unknown', 'Request failed (503)');
        renderRoute();
        const heading = await screen.findByRole('heading');
        expect(heading.textContent).not.toMatch(/\d{3}/);
    });
});

describe('local-first mount (S6 V1+V2)', () => {
    const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';

    function servedActivity() {
        return {
            activityId: ACTIVITY,
            versionId: 'v1',
            versionNum: 1,
            title: 'Linear Systems',
            document: servedFixtureDocument(),
        };
    }

    /** The key the route must write under — restated from the student's side
     * so a change to the scheme has to be deliberate on both ends. */
    function bufferKeys() {
        return Object.keys(window.localStorage).filter((k) =>
            k.startsWith('activity-viewer:buffer:'),
        );
    }

    afterEach(() => window.localStorage.clear());

    /** The fixture document carries many inputs; the first one in document
     * order is stable because the fixture and its shuffle seed are fixed.
     *
     * The `act` flush is load-bearing, not ceremony. `findAllByRole` resolves
     * the moment the input is in the DOM — that is the COMMIT, not the passive
     * effect. The effect is where the route wires the local-first buffer
     * (`store.subscribe(() => buffer.save())`, StudentViewer.tsx), and the
     * served-activity fetch resolves OUTSIDE act, so the commit and that effect
     * are separate tasks — waitFor's MutationObserver can and does land between
     * them. Typing in that window updates a store nobody is subscribed to yet:
     * `save()` never runs, so `dirty` stays false, so `buffer.dispose()`'s
     * flush writes nothing (`write()` bails on `if (!dirty) return`) and the
     * assertion sees []. Invisible in a quiet suite; ~1 run in 4 under full
     * `pnpm test` load, which is where it surfaced. "Ready" therefore has to
     * mean mounted AND wired, not merely painted. */
    async function firstBlank(): Promise<HTMLElement> {
        const inputs = await screen.findAllByRole('textbox');
        await act(async () => {});
        return inputs[0]!;
    }

    it('persists the student’s work under their own key', async () => {
        h.session.current = { access_token: 'tok', user: { id: STUDENT_ID } };
        h.load.current = servedActivity();
        renderRoute();

        const input = await firstBlank();
        fireEvent.change(input, { target: { value: '42' } });

        // The debounce is real time here; the flush on unmount is what makes
        // this deterministic — and it is the same path a closing lid takes.
        cleanup();

        const keys = bufferKeys();
        expect(keys).toHaveLength(1);
        expect(keys[0]).toContain(STUDENT_ID);
        expect(window.localStorage.getItem(keys[0]!)).toContain('42');
    });

    it('restores that work when the student comes back', async () => {
        h.session.current = { access_token: 'tok', user: { id: STUDENT_ID } };
        h.load.current = servedActivity();
        renderRoute();
        const input = await firstBlank();
        fireEvent.change(input, { target: { value: '42' } });
        cleanup();

        renderRoute();
        const restored = await firstBlank();
        expect(restored).toHaveValue('42');
    });

    it('sweeps the previous student’s work off a shared machine', async () => {
        // Student A never signed out — their blob is still sitting here.
        const foreign = `activity-viewer:buffer:${OTHER_STUDENT_ID}:${ACTIVITY}:v1`;
        window.localStorage.setItem(foreign, '{"schemaVersion":1}');

        h.session.current = { access_token: 'tok', user: { id: STUDENT_ID } };
        h.load.current = servedActivity();
        renderRoute();
        await firstBlank();

        // Seeded first, then swept — an unseeded version of this test would
        // pass against an empty store and prove nothing.
        expect(window.localStorage.getItem(foreign)).toBeNull();
    });

    it('does not restore the previous student’s answers into this session', async () => {
        h.session.current = { access_token: 'tok', user: { id: OTHER_STUDENT_ID } };
        h.load.current = servedActivity();
        renderRoute();
        const input = await firstBlank();
        fireEvent.change(input, { target: { value: 'their answer' } });
        cleanup();

        // Student B sits down at the same Chromebook.
        h.session.current = { access_token: 'tok', user: { id: STUDENT_ID } };
        renderRoute();
        const fresh = await firstBlank();
        expect(fresh).toHaveValue('');
    });
});

describe('boot paths (S6 V6)', () => {
    const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';

    function servedActivity(versionId = 'v1') {
        return {
            activityId: ACTIVITY,
            versionId,
            versionNum: 1,
            title: 'Linear Systems',
            document: servedFixtureDocument(),
        };
    }

    /** A buffer for `versionId` holding work the student never got graded. */
    function seedUnsentWork(versionId: string) {
        window.localStorage.setItem(
            `activity-viewer:buffer:${STUDENT_ID}:${ACTIVITY}:${versionId}`,
            JSON.stringify({
                schemaVersion: 1,
                userId: STUDENT_ID,
                activityId: ACTIVITY,
                versionId,
                responses: { blanks: { 'blank-1': '42' }, choices: {}, matches: {}, orderings: {}, freeText: {}, graphs: {} },
                checked: {},
                pending: { 'sec-1': { fingerprint: 'fp' } },
                inFlight: {},
            }),
        );
    }

    function seedCachedDocument(versionId: string) {
        window.localStorage.setItem(
            `activity-viewer:doc:${STUDENT_ID}:${ACTIVITY}:${versionId}`,
            JSON.stringify({ ...servedActivity(versionId), document: servedFixtureDocument() }),
        );
    }

    afterEach(() => window.localStorage.clear());

    it('offline with a cached copy shows the worksheet, not an error screen', async () => {
        h.session.current = { access_token: 'tok', user: { id: STUDENT_ID } };
        seedCachedDocument('v1');
        h.load.current = new ViewerLoadError('offline', 'no network');

        const { container } = renderRoute(ACTIVITY);

        // The student already knows they are offline; what they need is their
        // worksheet and their work.
        await waitFor(() =>
            expect(container.querySelector('[data-banner="offline-copy"]')).not.toBeNull(),
        );
        expect(container.querySelector('[data-failure="offline"]')).toBeNull();
        expect(await screen.findAllByRole('textbox')).not.toHaveLength(0);
    });

    it('offline with NOTHING cached still fails honestly', async () => {
        h.session.current = { access_token: 'tok', user: { id: STUDENT_ID } };
        h.load.current = new ViewerLoadError('offline', 'no network');

        const { container } = renderRoute(ACTIVITY);

        // No copy means no worksheet — inventing one would be worse.
        await waitFor(() =>
            expect(container.querySelector('[data-failure="offline"]')).not.toBeNull(),
        );
    });

    it('a republish keeps the student on THEIR version when we still have it', async () => {
        h.session.current = { access_token: 'tok', user: { id: STUDENT_ID } };
        seedUnsentWork('v1');
        seedCachedDocument('v1');
        h.load.current = servedActivity('v2'); // the teacher republished

        const { container } = renderRoute(ACTIVITY);

        await waitFor(() =>
            expect(container.querySelector('[data-banner="pinned-version"]')).not.toBeNull(),
        );
        // Their work is still on this device, not collected by the GC.
        expect(
            window.localStorage.getItem(
                `activity-viewer:buffer:${STUDENT_ID}:${ACTIVITY}:v1`,
            ),
        ).not.toBeNull();
    });

    it('a republish says so honestly when their version is gone', async () => {
        h.session.current = { access_token: 'tok', user: { id: STUDENT_ID } };
        seedUnsentWork('v1'); // work, but no cached v1 document to render
        h.load.current = servedActivity('v2');

        const { container } = renderRoute(ACTIVITY);

        await waitFor(() =>
            expect(container.querySelector('[data-banner="work-stranded"]')).not.toBeNull(),
        );
        // Preserved, not deleted: this is the case the GC exception protects.
        expect(
            window.localStorage.getItem(
                `activity-viewer:buffer:${STUDENT_ID}:${ACTIVITY}:v1`,
            ),
        ).not.toBeNull();
    });

    it('a normal load shows no banner at all', async () => {
        h.session.current = { access_token: 'tok', user: { id: STUDENT_ID } };
        h.load.current = servedActivity('v1');

        const { container } = renderRoute(ACTIVITY);
        await screen.findAllByRole('textbox');

        expect(container.querySelector('[data-banner]')).toBeNull();
    });
});
