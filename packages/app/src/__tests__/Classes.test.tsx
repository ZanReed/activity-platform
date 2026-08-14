// @vitest-environment jsdom
// =============================================================================
// Classes.test.tsx — the 3.1C assertion gate in the create-class flow
// -----------------------------------------------------------------------------
// The compliance-critical behavior: a class cannot be created until the 13+
// assertion checkbox is checked, the checkbox renders the exact ASSERTION_TEXT
// wording, it is unchecked by default, and it RESETS after a successful create
// (each class is its own assertion record — no sticky consent).
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

const h = vi.hoisted(() => {
    const listResult: { current: { data: unknown; error: unknown } } = {
        current: { data: [], error: null },
    };
    const from = vi.fn((table: string) => {
        if (table === 'classes') {
            const qb: Record<string, unknown> = {
                select: () => qb,
                order: () => Promise.resolve(listResult.current),
            };
            return qb;
        }
        throw new Error(`unexpected table ${table}`);
    });
    // Creation goes through the audited create_class RPC since 0027 (E-2);
    // the direct INSERT is privilege-dead, so the mock exposes rpc only.
    // Wide return type: mockImplementation swaps shapes per test (list rows
    // vs the created-class object), and never[] would reject the latter —
    // the exact TS2322 a stale local .tsbuildinfo hid until CI's cold check.
    const rpc = vi.fn(
        (): Promise<{ data: unknown; error: unknown }> =>
            Promise.resolve({ data: [], error: null }),
    );
    return { listResult, from, rpc };
});

vi.mock('../lib/supabase', () => ({
    supabase: { from: h.from, rpc: h.rpc },
}));
vi.mock('../lib/SessionContext', () => ({
    useSession: () => ({
        session: { user: { id: 'teacher-1' } },
        loading: false,
    }),
}));

import Classes from '../routes/Classes';
import { ASSERTION_TEXT, ASSERTION_TEXT_VERSION } from '../lib/classes';

function renderClasses() {
    return render(
        <MemoryRouter>
            <Classes />
        </MemoryRouter>,
    );
}

function createdRpcResult() {
    return Promise.resolve({
        data: {
            id: 'c-new',
            name: 'Algebra I — Period 2',
            join_code: 'ABC234',
            expected_domain: null,
            age_assertion_at: '2026-07-28T00:00:00Z',
            assertion_text_version: ASSERTION_TEXT_VERSION,
            created_at: '2026-07-28T00:00:00Z',
        },
        error: null,
    });
}

beforeEach(() => {
    h.listResult.current = { data: [], error: null };
    h.rpc.mockClear().mockImplementation(() => createdRpcResult());
});
afterEach(cleanup);

describe('Classes create flow — assertion gate', () => {
    it('renders the exact assertion wording, unchecked by default', async () => {
        renderClasses();
        fireEvent.click(await screen.findByRole('button', { name: 'New class' }));
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);
        expect(screen.getByText(ASSERTION_TEXT)).toBeTruthy();
    });

    it('create is disabled until name + assertion are both present', async () => {
        renderClasses();
        fireEvent.click(await screen.findByRole('button', { name: 'New class' }));
        const create = screen.getByRole('button', {
            name: 'Create class',
        }) as HTMLButtonElement;
        expect(create.disabled).toBe(true);

        fireEvent.change(screen.getByLabelText('Class name'), {
            target: { value: 'Algebra I — Period 2' },
        });
        expect(create.disabled).toBe(true); // name alone is not enough

        fireEvent.click(screen.getByRole('checkbox'));
        expect(create.disabled).toBe(false);

        fireEvent.click(screen.getByRole('checkbox')); // uncheck again
        expect(create.disabled).toBe(true);
    });

    it('successful create stamps the assertion payload and RESETS the checkbox', async () => {
        renderClasses();
        fireEvent.click(await screen.findByRole('button', { name: 'New class' }));
        fireEvent.change(screen.getByLabelText('Class name'), {
            target: { value: 'Algebra I — Period 2' },
        });
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: 'Create class' }));

        await screen.findByText('ABC234');
        // The audited door (E-2): the version rides the wire; identity is
        // auth.uid() server-side, so no client-supplied teacher id exists to
        // assert on anymore.
        expect(h.rpc).toHaveBeenCalledWith(
            'create_class',
            expect.objectContaining({
                p_assertion_text_version: ASSERTION_TEXT_VERSION,
            }),
        );

        // Re-open the form: the assertion must NOT be remembered.
        fireEvent.click(screen.getByRole('button', { name: 'New class' }));
        await waitFor(() =>
            expect(
                (screen.getByRole('checkbox') as HTMLInputElement).checked,
            ).toBe(false),
        );
    });
});

// =============================================================================
// The shareable join link (B12's "shareable /join/:code deep link").
// The route has existed since the identity slice, but the teacher UI only ever
// copied the bare CODE — so the one thing a teacher actually posts to Google
// Classroom had to be hand-assembled, and the B14 dialog's "the old link no
// longer works" referred to a link the product never produced. These rows pin
// the link's SHAPE, because a link that does not match App.tsx's /join/:code
// route is a dead link in every classroom that already posted it.
// =============================================================================
describe('join link', () => {
    it('Copy link yields the /join/:code URL, and the code chip still yields the bare code', async () => {
        const writeText = vi.fn(() => Promise.resolve());
        Object.assign(navigator, { clipboard: { writeText } });
        h.listResult.current = {
            data: [
                {
                    id: 'class-1',
                    name: 'Algebra I — Period 3',
                    join_code: 'QX7M2P',
                    expected_domain: null,
                    age_assertion_at: '2026-08-12T00:00:00Z',
                    created_at: '2026-08-12T00:00:00Z',
                },
            ],
            error: null,
        };
        renderClasses();

        fireEvent.click(await screen.findByRole('button', { name: 'Copy link' }));
        await waitFor(() =>
            expect(writeText).toHaveBeenCalledWith(
                `${window.location.origin}/join/QX7M2P`,
            ),
        );

        // The chip is a DIFFERENT affordance on purpose: teachers read codes
        // aloud. Copying the chip must not start handing out a URL.
        fireEvent.click(screen.getByRole('button', { name: 'QX7M2P' }));
        await waitFor(() => expect(writeText).toHaveBeenLastCalledWith('QX7M2P'));
    });

    it('the link matches the route App.tsx registers (a mismatch is a dead posted link)', async () => {
        const { joinUrlFor } = await import('../routes/Classes');
        const path = new URL(joinUrlFor('ABC123')).pathname;
        // App.tsx: <Route path="/join/:code" ... />
        expect(path).toBe('/join/ABC123');
        expect(path.split('/')[1]).toBe('join');
    });
});
