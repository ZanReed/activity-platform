// @vitest-environment jsdom
// =============================================================================
// DolPractice.test.tsx — the targeted-practice page (D65 slice 2, TP-1/5/6)
// -----------------------------------------------------------------------------
// The page is a thin shell over the server's decision: it starts (or resumes)
// the practice for the DoL version in its URL, says plainly when it is closed
// or has nothing to practise, and otherwise runs the questions in mixed
// practice's runner on the `dol-practice` check mode with its own done screen.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { CheckError } from '@activity/viewer';

const session = vi.hoisted(() => ({
    value: { session: { user: { id: 'student-1' } } as unknown, loading: false },
}));
vi.mock('../lib/SessionContext', () => ({ useSession: () => session.value }));
const api = vi.hoisted(() => ({ startDolPractice: vi.fn() }));
vi.mock('../lib/mixedPractice', async (orig) => ({
    ...(await orig<typeof import('../lib/mixedPractice')>()),
    ...api,
}));
const runner = vi.hoisted(() => ({ props: null as Record<string, unknown> | null }));
vi.mock('../practice/MixedRunner', () => ({
    default: (props: Record<string, unknown>) => {
        runner.props = props;
        return <p>runner</p>;
    },
}));

import DolPractice, { DOL_PRACTICE_COPY } from '../routes/DolPractice';

const ACT = '11111111-2222-4333-8444-555555555555';
const VER = 'aaaaaaaa-bbbb-4ccc-9ddd-eeeeeeeeeeee';

function renderPage() {
    render(
        <MemoryRouter initialEntries={[`/a/${ACT}/practice/${VER}`]}>
            <Routes>
                <Route path="/a/:activityId/practice/:versionId" element={<DolPractice />} />
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    api.startDolPractice.mockReset();
    runner.props = null;
});
afterEach(cleanup);

describe('the targeted-practice page (D65 slice 2)', () => {
    it('starts the practice for THIS DoL version and runs it on the dol-practice mode, unscored', async () => {
        api.startDolPractice.mockResolvedValue({
            wireVersion: 3,
            state: 'started',
            session: { sessionId: 's1', planned: 4, finished: false, items: [] },
        });
        renderPage();
        expect(await screen.findByText('runner')).toBeTruthy();
        expect(api.startDolPractice).toHaveBeenCalledWith(ACT, VER);
        expect(runner.props?.checkMode).toBe('dol-practice');
        expect((runner.props?.session as { graded: boolean }).graded).toBe(false);
        expect(typeof runner.props?.done).toBe('function');
    });

    it('nothing to practise says so, with the way back (TP-6)', async () => {
        api.startDolPractice.mockResolvedValue({ wireVersion: 3, state: 'nothing_to_practise' });
        renderPage();
        expect(await screen.findByText(DOL_PRACTICE_COPY.nothing)).toBeTruthy();
        expect(screen.getByRole('link', { name: DOL_PRACTICE_COPY.back }).getAttribute('href')).toBe(`/a/${ACT}`);
    });

    it('a closed practice (the server\'s one 404) says when it opens (TP-1)', async () => {
        api.startDolPractice.mockRejectedValue(new CheckError('unavailable', 'Not available', 404));
        renderPage();
        expect(await screen.findByText(DOL_PRACTICE_COPY.closed)).toBeTruthy();
    });

    it('any other failure is an alert, never the closed copy', async () => {
        api.startDolPractice.mockRejectedValue(new CheckError('server_error', 'boom', 500));
        renderPage();
        expect((await screen.findByRole('alert')).textContent).toContain(DOL_PRACTICE_COPY.error);
    });
});
