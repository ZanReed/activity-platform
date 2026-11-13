// @vitest-environment jsdom
// =============================================================================
// HomeDueDates.test.tsx — what a student sees about due dates (DD-3,
// docs/design/due-dates.md): a label, never a lock; "Was due …" in plain
// muted words, never "late" or "overdue"; nothing once finished; due and
// unfinished first, soonest first. "Today" is the class's, from the server.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { orderForHome, type ActivityProgress, type StudentClassActivity } from '../lib/classActivities';

vi.mock('../lib/SessionContext', () => ({
    useSession: () => ({
        session: { user: { id: 'stu-1', email: 'stu@school.org', user_metadata: { full_name: 'Mere Paki' } } },
        loading: false,
        role: 'student',
        roleStatus: 'ready',
        retryRole: vi.fn(),
    }),
}));
vi.mock('../lib/studentAuth', () => ({
    signOutEverything: vi.fn(),
    watchIdleSignOut: () => ({ stop: () => {} }),
}));
vi.mock('../lib/classes', () => ({
    listMyClasses: async () => [{ classId: 'c1', name: '7B', joinedAt: '2026-09-01T00:00:00Z', factsCode: null }],
}));

const TODAY = '2026-11-13'; // a Friday, in the class's zone
const row = (activityId: string, title: string, addedAt: string, dueOn: string | null): StudentClassActivity => ({
    classId: 'c1', activityId, title, addedAt, dueOn, classToday: TODAY,
});
// The server's order: newest added first.
const ROWS = [
    row('a-new', 'Newest, no date', '2026-11-12T00:00:00Z', null),
    row('a-soon', 'Due soon', '2026-11-11T00:00:00Z', '2026-11-17'),
    row('a-done', 'Finished, was dated', '2026-11-10T00:00:00Z', '2026-11-10'),
    row('a-past', 'Past its date', '2026-11-09T00:00:00Z', '2026-11-12'),
];
const prog = (activityId: string, checked: number, total: number): ActivityProgress => ({
    activityId, sectionsTotal: total, sectionsChecked: checked, earlierChecked: false, earlierDone: false, feedbackReleased: false,
});
const PROGRESS = [prog('a-new', 0, 2), prog('a-soon', 1, 3), prog('a-done', 2, 2), prog('a-past', 0, 2)];
const progressImpl = vi.hoisted(() => ({ current: (): Promise<unknown> => Promise.resolve([]) }));
progressImpl.current = async () => PROGRESS;

vi.mock('../lib/classActivities', async (importActual) => ({
    ...(await importActual<typeof import('../lib/classActivities')>()),
    listClassActivities: async () => ROWS,
    listMyActivityProgress: () => progressImpl.current(),
}));

const { default: Home } = await import('../routes/Home');
afterEach(cleanup);

describe('orderForHome', () => {
    it('due and unfinished first, soonest first; then the server order', () => {
        const progress = new Map(PROGRESS.map((p) => [p.activityId, p]));
        expect(orderForHome(ROWS, progress).map((r) => r.activityId)).toEqual(['a-past', 'a-soon', 'a-new', 'a-done']);
    });
    it('before progress loads, a dated row still counts as unfinished', () => {
        expect(orderForHome(ROWS, null).map((r) => r.activityId)).toEqual(['a-done', 'a-past', 'a-soon', 'a-new']);
    });
});

describe('the student Home (DD-3)', () => {
    it('says when, plainly, and drops the date once the work is finished', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>,
        );
        const link = async (t: string) => screen.findByRole('link', { name: new RegExp(t) });
        expect((await link('Past its date')).textContent).toContain('Not started · Was due Thu 12 Nov');
        expect((await link('Due soon')).textContent).toContain('In progress (1 of 3) · Due Tue');
        expect((await link('Finished, was dated')).textContent).not.toMatch(/due/i);
        expect((await link('Newest, no date')).textContent).not.toMatch(/due/i);
        // Never shaming words.
        expect(document.body.textContent).not.toMatch(/\boverdue\b|\blate\b/i);
        // And the order on screen is the ruled one.
        const titles = screen.getAllByRole('link').map((l) => l.textContent ?? '').filter((t) => /date|soon/.test(t));
        expect(titles[0]).toMatch(/Past its date/);
        expect(titles[1]).toMatch(/Due soon/);
    });
});

describe('while progress is still loading (Fable review of DD-3)', () => {
    it('shows no due labels and keeps the server order, so nothing flashes or jumps', async () => {
        let release: (v: unknown) => void = () => {};
        progressImpl.current = () => new Promise((r) => (release = r));
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>,
        );
        const first = await screen.findByRole('link', { name: /Newest, no date/ });
        expect(document.querySelectorAll('[data-due]')).toHaveLength(0);
        expect(document.body.textContent).not.toMatch(/Was due|Due (today|Tue)/);
        expect(first).toBeTruthy();
        release(PROGRESS);
        await waitFor(() =>
            expect(screen.getByRole('link', { name: /Past its date/ }).textContent).toMatch(/Was due Thu 12 Nov/),
        );
        progressImpl.current = async () => PROGRESS;
    });
});
