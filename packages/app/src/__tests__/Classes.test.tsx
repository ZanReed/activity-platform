// @vitest-environment jsdom
// =============================================================================
// Classes.test.tsx — the 3.1C assertion gate in the create-class flow
// -----------------------------------------------------------------------------
// The compliance-critical behavior: a class cannot be created until the
// teacher picks ONE of the two age statements (U-1, 2026-10-06; it was a
// single 13+ checkbox before), both render in their exact AGE_STATEMENTS
// wording, nothing is picked by default, and the choice RESETS after a
// successful create (each class is its own record — no sticky consent). An
// existing class's teacher can confirm the other statement (U-2).
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
import { AGE_STATEMENT_PROMPT, AGE_STATEMENTS, ASSERTION_TEXT_VERSION } from '../lib/classes';

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
            includes_under_13: false,
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

describe('Classes create flow — the age statement (U-1)', () => {
    const choices = () => screen.getAllByRole('radio') as HTMLInputElement[];

    it('renders both statements in their exact wording, with NOTHING picked by default', async () => {
        renderClasses();
        fireEvent.click(await screen.findByRole('button', { name: 'New class' }));
        expect(screen.getByText(AGE_STATEMENT_PROMPT)).toBeTruthy();
        expect(screen.getByLabelText(AGE_STATEMENTS.thirteenPlus)).toBeTruthy();
        expect(screen.getByLabelText(AGE_STATEMENTS.under13)).toBeTruthy();
        expect(choices()).toHaveLength(2);
        expect(choices().some((r) => r.checked)).toBe(false);
        expect(screen.queryByRole('checkbox')).toBeNull();
    });

    it('create is disabled until a name AND one of the statements are present', async () => {
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
        expect(screen.getByText('The age confirmation is required.')).toBeTruthy();

        fireEvent.click(screen.getByLabelText(AGE_STATEMENTS.thirteenPlus));
        expect(create.disabled).toBe(false);
    });

    it('a 13-or-older create sends that choice, stamps the version and RESETS the choice', async () => {
        renderClasses();
        fireEvent.click(await screen.findByRole('button', { name: 'New class' }));
        fireEvent.change(screen.getByLabelText('Class name'), {
            target: { value: 'Algebra I — Period 2' },
        });
        fireEvent.click(screen.getByLabelText(AGE_STATEMENTS.thirteenPlus));
        fireEvent.click(screen.getByRole('button', { name: 'Create class' }));

        await screen.findByText('ABC234');
        expect(h.rpc).toHaveBeenCalledWith(
            'create_class',
            expect.objectContaining({
                p_assertion_text_version: ASSERTION_TEXT_VERSION,
                p_includes_under_13: false,
            }),
        );

        // Re-open the form: the choice must NOT be remembered.
        fireEvent.click(screen.getByRole('button', { name: 'New class' }));
        await waitFor(() => {
            const fresh = screen.getAllByRole('radio') as HTMLInputElement[];
            expect(fresh.some((r) => r.checked)).toBe(false);
        });
    });

    it('an under-13 create sends THAT choice, and the card says which statement the class carries', async () => {
        h.rpc.mockImplementation(() =>
            Promise.resolve({
                data: {
                    id: 'c-y7', name: 'Year 7 Maths', join_code: 'Y7Y7Y7', expected_domain: null,
                    age_assertion_at: '2026-10-06T00:00:00Z', assertion_text_version: ASSERTION_TEXT_VERSION,
                    includes_under_13: true, created_at: '2026-10-06T00:00:00Z',
                },
                error: null,
            }),
        );
        renderClasses();
        fireEvent.click(await screen.findByRole('button', { name: 'New class' }));
        fireEvent.change(screen.getByLabelText('Class name'), { target: { value: 'Year 7 Maths' } });
        fireEvent.click(screen.getByLabelText(AGE_STATEMENTS.under13));
        fireEvent.click(screen.getByRole('button', { name: 'Create class' }));
        await screen.findByText('Y7Y7Y7');
        expect(h.rpc).toHaveBeenCalledWith('create_class', expect.objectContaining({ p_includes_under_13: true }));
        expect(screen.getByTestId('class-age-statement').textContent).toMatch(
            /^Includes students under 13, school authorized · confirmed /,
        );
    });
});

describe('an existing class — changing the age confirmation (U-2)', () => {
    beforeEach(() => {
        h.listResult.current = {
            data: [{
                id: 'class-1', name: 'Algebra I — Period 3', join_code: 'QX7M2P', expected_domain: null,
                age_assertion_at: '2026-08-12T00:00:00Z', assertion_text_version: '2026-08-15-draft-3',
                includes_under_13: false, created_at: '2026-08-12T00:00:00Z',
            }],
            error: null,
        };
    });

    it('the card says which statement the class carries, and re-confirming asks the server and updates it', async () => {
        h.rpc.mockImplementation(() =>
            Promise.resolve({
                data: { id: 'class-1', includes_under_13: true, age_assertion_at: '2026-10-06T01:00:00Z', assertion_text_version: ASSERTION_TEXT_VERSION },
                error: null,
            }),
        );
        renderClasses();
        const statement = await screen.findByTestId('class-age-statement');
        expect(statement.textContent).toMatch(/^All students 13 or older · confirmed /);

        fireEvent.click(screen.getByRole('button', { name: 'Change age confirmation' }));
        const radios = screen.getAllByRole('radio') as HTMLInputElement[];
        // Nothing pre-picked, not even the statement the class carries now.
        expect(radios.some((r) => r.checked)).toBe(false);
        const confirm = screen.getByRole('button', { name: 'Confirm' }) as HTMLButtonElement;
        expect(confirm.disabled).toBe(true);

        fireEvent.click(screen.getByLabelText(AGE_STATEMENTS.under13));
        fireEvent.click(confirm);
        await waitFor(() =>
            expect(screen.getByTestId('class-age-statement').textContent).toMatch(
                /^Includes students under 13, school authorized · confirmed /,
            ),
        );
        expect(h.rpc).toHaveBeenCalledWith('reconfirm_class_age', {
            p_class_id: 'class-1',
            p_includes_under_13: true,
            p_assertion_text_version: ASSERTION_TEXT_VERSION,
        });
        expect(screen.queryByRole('radio')).toBeNull();
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
