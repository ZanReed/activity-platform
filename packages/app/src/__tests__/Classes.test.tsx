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
    const rpc = vi.fn(() => Promise.resolve({ data: [], error: null }));
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
