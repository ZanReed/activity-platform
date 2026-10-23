// @vitest-environment jsdom
// DM-13: the words a student never sees on mixed practice — "mixed",
// "session", "discrimination", "step", "due", "planned", "graded" — swept over
// EVERY screen the student routes can draw, as rendered (the DR-5 shape: bound
// to output, not to source strings). Each screen is listed by name, so a new
// one is added here or the sweep is visibly incomplete.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { CheckError } from '@activity/viewer';
import { PX_CLASS_ID, pxCheckResult, pxSession, pxStartResult } from '../test/practiceFixtures';

const BANNED = /\b(mixed|sessions?|discrimination|steps?|due|planned|graded)\b/i;

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
vi.mock('../lib/factProbe', async (orig) => ({ ...(await orig<typeof import('../lib/factProbe')>()), ...api }));
const sprintApi = vi.hoisted(() => ({ fetchSprintEntry: vi.fn(), saveSprintAttempts: vi.fn() }));
vi.mock('../lib/factSprint', () => sprintApi);
vi.mock('../lib/classes', () => ({ joinClass: vi.fn(), redeemJoinCode: vi.fn() }));
vi.mock('../lib/auth', () => ({ signInWithGoogle: vi.fn(async () => ({ error: null })) }));
vi.mock('../lib/studentAuth', () => ({ signOutEverything: vi.fn(async () => {}) }));
const mixedApi = vi.hoisted(() => ({
    lookupPracticeClass: vi.fn(),
    previewMixed: vi.fn(),
    startMixed: vi.fn(),
    finishMixed: vi.fn(),
    checkPracticeItem: vi.fn(),
}));
vi.mock('../lib/mixedPractice', async (orig) => ({ ...(await orig<typeof import('../lib/mixedPractice')>()), ...mixedApi }));

import FactsEntry from '../routes/FactsEntry';
import MixedRunner from '../practice/MixedRunner';

/** Everything a student can read or hear: text, plus labels and titles. */
function words(root: HTMLElement): string {
    const clone = root.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('style').forEach((el) => el.remove());
    const attrs = [...clone.querySelectorAll('[aria-label],[title],[alt]')].flatMap((el) =>
        ['aria-label', 'title', 'alt'].map((a) => el.getAttribute(a) ?? ''),
    );
    return [clone.textContent ?? '', ...attrs].join(' ');
}

const seen: string[] = [];
function sweep(name: string, root: HTMLElement) {
    seen.push(name);
    const text = words(root);
    expect(text, `screen "${name}"`).not.toMatch(BANNED);
}

const READY = { state: 'ready', doneToday: 0, graded: true, itemsPerSession: 6, planned: 6 };

function entryPage() {
    return render(
        <MemoryRouter initialEntries={['/practice/ABC234']}>
            <Routes>
                <Route path="/practice/:code" element={<FactsEntry />} />
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    api.fetchEntry.mockReset().mockResolvedValue({ state: 'none_open' });
    sprintApi.fetchSprintEntry.mockReset().mockResolvedValue({ state: 'off' });
    mixedApi.lookupPracticeClass.mockReset().mockResolvedValue({ id: PX_CLASS_ID, mixedOn: true });
    mixedApi.previewMixed.mockReset().mockResolvedValue(READY);
    mixedApi.startMixed.mockReset().mockResolvedValue(pxStartResult(pxSession({ graded: true })));
    mixedApi.finishMixed.mockReset().mockResolvedValue({ planned: 6, right: 2, answered: 3, skipped: 1, graded: true });
    mixedApi.checkPracticeItem.mockReset();
});
afterEach(cleanup);

describe('DM-13: no banned word on any student screen of mixed practice', () => {
    it('the entry screens', async () => {
        for (const [name, preview, heading] of [
            ['start card (recording a score)', READY, 'Practice'],
            ['resume card', { ...READY, state: 'resume', nextSeq: 4, sessionId: 's' }, 'Welcome back'],
            ['nothing taught', { ...READY, state: 'nothing_taught', planned: 0 }, 'Nothing to practise yet'],
            ['nothing to practise today', { ...READY, state: 'nothing_due', planned: 0 }, 'Nothing to practise today'],
            ['done today', { ...READY, state: 'done_today', planned: 0 }, 'You’ve done today’s practice'],
        ] as const) {
            mixedApi.previewMixed.mockResolvedValue(preview);
            const view = entryPage();
            await screen.findByRole('heading', { name: heading });
            sweep(name, view.container);
            cleanup();
        }
        // The chooser (both on).
        sprintApi.fetchSprintEntry.mockResolvedValue({ done_today: 0, best: null, class_name: 'x', state: 'ready', due: 3, minutes: 5 });
        const chooser = entryPage();
        await screen.findByRole('button', { name: /^Practice/ });
        sweep('chooser', chooser.container);
        cleanup();
        // Finish here → the done screen.
        sprintApi.fetchSprintEntry.mockResolvedValue({ state: 'off' });
        mixedApi.previewMixed.mockResolvedValue({ ...READY, state: 'resume', nextSeq: 4, sessionId: 's' });
        const finish = entryPage();
        const finishHere = await screen.findByRole('button', { name: 'Finish here' });
        await act(async () => {
            fireEvent.click(finishHere);
        });
        await screen.findByRole('heading', { name: 'Practice done' });
        sweep('done (finish here, recording a score)', finish.container);
    });

    it('the runner screens', async () => {
        const run = () =>
            render(
                <MemoryRouter>
                    <MixedRunner session={pxSession({ graded: true })} userId="u" classId={PX_CLASS_ID} onAgain={() => {}} onEnded={() => {}} />
                </MemoryRouter>,
            );
        const typeAndCheck = () => {
            fireEvent.change(screen.getByRole('textbox'), { target: { value: '8' } });
            fireEvent.click(screen.getByRole('button', { name: 'Check' }));
        };

        let view = run();
        sweep('question', view.container);
        fireEvent.click(screen.getByRole('button', { name: 'Check' }));
        sweep('empty Check', view.container);

        mixedApi.checkPracticeItem.mockResolvedValueOnce(pxCheckResult(1, 'wrong'));
        typeAndCheck();
        await screen.findByRole('heading', { name: /Not this time/ });
        sweep('wrong + working', view.container);
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        mixedApi.checkPracticeItem.mockResolvedValueOnce(pxCheckResult(2, 'skipped'));
        fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
        await screen.findByRole('heading', { name: /Skipped/ });
        sweep('skipped', view.container);
        mixedApi.previewMixed.mockResolvedValue({ ...READY, planned: 2 });
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        await screen.findByRole('button', { name: 'Practise again' });
        sweep('done (finished, recording a score, practise again)', view.container);
        cleanup();

        mixedApi.checkPracticeItem.mockResolvedValueOnce(pxCheckResult(1, 'right'));
        view = run();
        fireEvent.change(screen.getByRole('textbox'), { target: { value: '5' } });
        fireEvent.click(screen.getByRole('button', { name: 'Check' }));
        await screen.findByRole('heading', { name: /Right/ });
        fireEvent.click(screen.getByRole('button', { name: 'See the working' }));
        sweep('right + working', view.container);
        fireEvent.click(screen.getByRole('button', { name: 'Stop for now' }));
        sweep('stopped', view.container);
        cleanup();

        for (const [name, kind, button] of [
            ['signed out', 'unauthenticated', 'Sign in again'],
            ['ended', 'unavailable', 'See what is next'],
            ['out of date', 'stale_client', 'Reload'],
            ['server failed', 'server_error', 'Try again'],
        ] as const) {
            mixedApi.checkPracticeItem.mockRejectedValueOnce(new CheckError(kind, 'x'));
            view = run();
            typeAndCheck();
            await screen.findByRole('button', { name: button });
            sweep(name, view.container);
            cleanup();
        }
    });

    it('swept every screen it names (a new screen joins the list)', () => {
        expect(seen).toEqual([
            'start card (recording a score)', 'resume card', 'nothing taught', 'nothing to practise today', 'done today',
            'chooser', 'done (finish here, recording a score)',
            'question', 'empty Check', 'wrong + working', 'skipped', 'done (finished, recording a score, practise again)',
            'right + working', 'stopped', 'signed out', 'ended', 'out of date', 'server failed',
        ]);
    });
});
