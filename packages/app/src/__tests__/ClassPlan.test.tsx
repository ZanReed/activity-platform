// @vitest-environment jsdom
// =============================================================================
// ClassPlan.test.tsx — the Plan page (period planner PP-1–PP-4, PP-6, 0088)
// -----------------------------------------------------------------------------
// Bound to what is SENT (the RPC and its arguments) and to what is RENDERED
// (the days shown, the total line). The server's rules are verify-0088's.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import {
    addDays,
    CLASS_PLAN_RPC,
    dayLabel,
    dayTotal,
    DEFAULT_SHAPE,
    planDates,
    planErrorMessage,
    shapeFrom,
    totalLine,
    type ClassPlan,
    type PlannedActivity,
} from '../lib/classPlan';

const TODAY = '2026-11-13'; // a Friday
const act = (id: string, title: string, minutes: number | null, position = 1, available = true): PlannedActivity => ({
    activity_id: id,
    title,
    minutes,
    position,
    available,
});

const h = vi.hoisted(() => ({
    rpc: vi.fn(),
    plan: null as unknown as ClassPlan,
    dueA1: null as string | null,
}));
vi.mock('../lib/supabase', () => ({ supabase: { rpc: h.rpc } }));
vi.mock('../components/TeacherNav', () => ({ TeacherNav: () => null }));
vi.mock('../components/TimezoneControl', () => ({ default: () => null }));
vi.mock('../lib/classes', () => ({ listClasses: async () => [{ id: 'c1', name: '7A' }] }));
vi.mock('../lib/classActivities', () => ({
    listTeacherClassActivities: async () => [
        { classId: 'c1', activityId: 'a1', title: 'Unit rates', addedAt: '', published: true, dueOn: h.dueA1 },
        { classId: 'c1', activityId: 'a2', title: 'Graphs', addedAt: '', published: true, dueOn: '2026-11-20' },
        { classId: 'c1', activityId: 'a9', title: 'Decimals', addedAt: '', published: true, dueOn: null },
        { classId: 'c1', activityId: 'a3', title: 'Draft one', addedAt: '', published: false, dueOn: null },
        { classId: 'c2', activityId: 'a4', title: 'Other class', addedAt: '', published: true, dueOn: null },
    ],
}));
vi.mock('../lib/factSprint', () => ({ fetchSprintOverview: async () => ({ on: true }) }));
vi.mock('../lib/mixedTeacher', () => ({
    fetchMixedSummary: async () => ({ on_at: null, items_per_session: null, default_items: null }),
}));

import ClassPlanPage from '../routes/ClassPlan';

beforeEach(() => {
    h.plan = {
        today: TODAY,
        limit: '2026-12-18',
        days: [{ on_date: '2026-11-16', activities: [act('a1', 'Unit rates', 30, 1), act('a2', 'Graphs', null, 2)], hook_ids: [] }],
        last_day: { on_date: '2026-11-12', activities: [act('a9', 'Decimals', 25)] },
    };
    h.dueA1 = null;
    h.rpc.mockReset();
    h.rpc.mockImplementation(async (name: string, args?: { p_due_on?: string }) => {
        if (name === 'set_class_activity_due') {
            h.dueA1 = args?.p_due_on ?? null;
            return { data: h.dueA1, error: null };
        }
        return { data: h.plan, error: null };
    });
});
afterEach(cleanup);

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/classes/c1/plan']}>
            <Routes>
                <Route path="/classes/:classId/plan" element={<ClassPlanPage />} />
            </Routes>
        </MemoryRouter>,
    );
}

describe('the Plan page', () => {
    it('shows ten school days from the class’s today, skipping an empty weekend', async () => {
        renderPage();
        expect(await screen.findByRole('heading', { name: 'Today · Fri 13 Nov' })).toBeTruthy();
        const days = within(screen.getByRole('list', { name: 'Planned days' })).getAllByRole('heading', { level: 2 });
        expect(days).toHaveLength(10);
        expect(days.map((d) => d.textContent)).not.toContain('Sat 14 Nov');
        const last = document.querySelector('[data-last-day]') as HTMLElement;
        expect(last.textContent).toMatch(/Last time \(Thu 12 Nov\):.*Decimals/);
    });

    it('a day shows its activities, their times, and the total (unset never counted as zero)', async () => {
        renderPage();
        const card = await screen.findByRole('listitem', { name: 'Mon 16 Nov' });
        expect(within(card).getByText('about 30 min')).toBeTruthy();
        expect(within(card).getByText('time not set')).toBeTruthy();
        // Sprint on (5) + Unit rates 30; Graphs named, not zero.
        expect(within(card).getByText('About 35 min + Graphs (time not set)')).toBeTruthy();
    });

    it('Add sends set_class_plan for that day; only this class’s published activities, not already on it', async () => {
        renderPage();
        const card = await screen.findByRole('listitem', { name: 'Tue 17 Nov' });
        const select = within(card).getByLabelText('Add an activity on Tue 17 Nov') as HTMLSelectElement;
        expect([...select.options].map((o) => o.text)).toEqual(['Add activity…', 'Unit rates', 'Graphs', 'Decimals']);
        const monday = screen.getByRole('listitem', { name: 'Mon 16 Nov' });
        const mondaySelect = within(monday).getByLabelText('Add an activity on Mon 16 Nov') as HTMLSelectElement;
        // Unit rates and Graphs are already on Monday: only Decimals is left.
        expect([...mondaySelect.options].map((o) => o.text)).toEqual(['Add activity…', 'Decimals']);
        fireEvent.change(select, { target: { value: 'a2' } });
        fireEvent.click(within(card).getByRole('button', { name: 'Add' }));
        await waitFor(() =>
            expect(h.rpc).toHaveBeenCalledWith(CLASS_PLAN_RPC.set, {
                p_class_id: 'c1',
                p_on_date: '2026-11-17',
                p_activity_id: 'a2',
                p_on: true,
            }),
        );
    });

    it('up / down send the whole day’s new order; Remove and Move send their own RPCs', async () => {
        renderPage();
        await screen.findByRole('listitem', { name: 'Mon 16 Nov' });
        fireEvent.click(screen.getByRole('button', { name: 'Move Unit rates down' }));
        await waitFor(() =>
            expect(h.rpc).toHaveBeenCalledWith(CLASS_PLAN_RPC.reorder, {
                p_class_id: 'c1',
                p_on_date: '2026-11-16',
                p_activity_ids: ['a2', 'a1'],
            }),
        );
        fireEvent.click(screen.getByRole('button', { name: 'Remove Graphs' }));
        await waitFor(() =>
            expect(h.rpc).toHaveBeenCalledWith(CLASS_PLAN_RPC.set, {
                p_class_id: 'c1',
                p_on_date: '2026-11-16',
                p_activity_id: 'a2',
                p_on: false,
            }),
        );
        fireEvent.click(screen.getByRole('button', { name: 'Move Unit rates to another day' }));
        fireEvent.change(screen.getByLabelText('Move Unit rates to'), { target: { value: '2026-11-18' } });
        fireEvent.click(screen.getByRole('button', { name: 'Move' }));
        await waitFor(() =>
            expect(h.rpc).toHaveBeenCalledWith(CLASS_PLAN_RPC.move, {
                p_class_id: 'c1',
                p_from_date: '2026-11-16',
                p_activity_id: 'a1',
                p_to_date: '2026-11-18',
            }),
        );
    });

    it('a refusal is named, and the page re-reads what the server holds', async () => {
        renderPage();
        const card = await screen.findByRole('listitem', { name: 'Tue 17 Nov' });
        h.rpc.mockImplementation(async (name: string) =>
            name === CLASS_PLAN_RPC.set ? { data: null, error: { message: 'day_full' } } : { data: h.plan, error: null },
        );
        const reads = h.rpc.mock.calls.filter((c) => c[0] === CLASS_PLAN_RPC.read).length;
        fireEvent.change(within(card).getByLabelText('Add an activity on Tue 17 Nov'), { target: { value: 'a1' } });
        fireEvent.click(within(card).getByRole('button', { name: 'Add' }));
        expect((await screen.findByRole('alert')).textContent).toMatch(/6 activities at most/);
        expect(h.rpc.mock.calls.filter((c) => c[0] === CLASS_PLAN_RPC.read).length).toBeGreaterThan(reads);
    });

    it('an activity no longer available is struck through, not counted, and removable', async () => {
        h.plan.days[0]!.activities = [act('a1', 'Unit rates', 30, 1, false)];
        renderPage();
        const card = await screen.findByRole('listitem', { name: 'Mon 16 Nov' });
        expect(within(card).getByText('no longer available')).toBeTruthy();
        expect(within(card).queryByText(/About/)).toBeNull();
        expect(within(card).getByRole('button', { name: 'Remove Unit rates' })).toBeTruthy();
    });
});

describe('the Plan page: carry on and due dates (PP-2, PP-10)', () => {
    it('Carry on today puts last time’s activity on the class’s today', async () => {
        renderPage();
        fireEvent.click(await screen.findByRole('button', { name: 'Carry on Decimals today' }));
        await waitFor(() =>
            expect(h.rpc).toHaveBeenCalledWith(CLASS_PLAN_RPC.set, {
                p_class_id: 'c1',
                p_on_date: TODAY,
                p_activity_id: 'a9',
                p_on: true,
            }),
        );
    });

    it('an activity already on today is not offered again', async () => {
        h.plan.days.push({ on_date: TODAY, activities: [act('a9', 'Decimals', 25)], hook_ids: [] });
        renderPage();
        await screen.findByText('on today');
        expect(screen.queryByRole('button', { name: 'Carry on Decimals today' })).toBeNull();
    });

    it('Make it due this day sets that date; a due date already set is shown, not offered', async () => {
        renderPage();
        const card = await screen.findByRole('listitem', { name: 'Mon 16 Nov' });
        expect(within(card).getByText('Due Fri 20 Nov')).toBeTruthy(); // Graphs
        fireEvent.click(within(card).getByRole('button', { name: 'Make Unit rates due this day' }));
        await waitFor(() =>
            expect(h.rpc).toHaveBeenCalledWith('set_class_activity_due', {
                p_class_id: 'c1',
                p_activity_id: 'a1',
                p_due_on: '2026-11-16',
            }),
        );
        // The row then reads the class's due date, not the button (bound to RENDER).
        expect(await within(card).findByText('Due Mon 16 Nov')).toBeTruthy();
        expect(within(card).queryByRole('button', { name: 'Make Unit rates due this day' })).toBeNull();
    });
});

describe('the Plan page: windows and limits', () => {
    const reads = () => h.rpc.mock.calls.filter((c) => c[0] === CLASS_PLAN_RPC.read).map((c) => c[1]);

    it('reads a window around the browser, then one starting at the class’s today', async () => {
        renderPage();
        await screen.findByRole('heading', { name: 'Today · Fri 13 Nov' });
        const last = reads().at(-1) as { p_from: string; p_to: string };
        expect(last.p_from).toBe(TODAY);
        expect(last.p_to > addDays(TODAY, 13)).toBe(true); // ten school days fit
    });

    it('Go to ignores an incomplete or out-of-range date and loads a valid one', async () => {
        renderPage();
        await screen.findByRole('heading', { name: 'Today · Fri 13 Nov' });
        const input = screen.getByLabelText('Go to');
        const before = reads().length;
        fireEvent.change(input, { target: { value: '2026-11-01' } }); // before today
        fireEvent.change(input, { target: { value: '2027-06-01' } }); // past the limit
        expect(reads().length).toBe(before);
        fireEvent.change(input, { target: { value: '2026-12-01' } });
        await waitFor(() => expect((reads().at(-1) as { p_from: string }).p_from).toBe('2026-12-01'));
    });

    it('a day past the limit shows its rows (removable) but no Add', async () => {
        h.plan.limit = '2026-11-16';
        h.plan.days.push({ on_date: '2026-11-17', activities: [act('a1', 'Unit rates', 30)], hook_ids: [] });
        renderPage();
        const tue = await screen.findByRole('listitem', { name: 'Tue 17 Nov' });
        expect(within(tue).queryByRole('button', { name: 'Add' })).toBeNull();
        expect(within(tue).getByRole('button', { name: 'Remove Unit rates' })).toBeTruthy();
        expect(within(screen.getByRole('listitem', { name: 'Mon 16 Nov' })).getByRole('button', { name: 'Add' })).toBeTruthy();
    });

    it('a weekend today still has a card', async () => {
        h.plan.today = '2026-11-14';
        renderPage();
        expect(await screen.findByRole('heading', { name: 'Today · Sat 14 Nov' })).toBeTruthy();
    });

    it('reorder sends unavailable rows too (the server wants the whole day)', async () => {
        h.plan.days[0]!.activities = [act('a1', 'Unit rates', 30, 1), act('a5', 'Gone', null, 2, false), act('a2', 'Graphs', 10, 3)];
        renderPage();
        await screen.findByRole('listitem', { name: 'Mon 16 Nov' });
        fireEvent.click(screen.getByRole('button', { name: 'Move Unit rates down' }));
        await waitFor(() =>
            expect(h.rpc).toHaveBeenCalledWith(CLASS_PLAN_RPC.reorder, {
                p_class_id: 'c1',
                p_on_date: '2026-11-16',
                p_activity_ids: ['a5', 'a1', 'a2'],
            }),
        );
    });
});

describe('classPlan helpers', () => {
    it('dates: UTC arithmetic, labels, school days with planned weekends kept', () => {
        expect(addDays('2026-11-13', 3)).toBe('2026-11-16');
        expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
        expect(dayLabel('2026-11-17')).toBe('Tue 17 Nov');
        expect(planDates('2026-11-13', 3, new Set())).toEqual(['2026-11-13', '2026-11-16', '2026-11-17']);
        expect(planDates('2026-11-13', 2, new Set(['2026-11-15']))).toEqual(['2026-11-13', '2026-11-15', '2026-11-16']);
    });

    it('the total: sprint, hook, each activity and its practice; unset named', () => {
        const shape = { ...DEFAULT_SHAPE, sprintOn: true, mixedOn: true, itemsPerSession: 6 };
        const t = dayTotal({ activities: [act('a', 'A', 30), act('b', 'B', null, 2)], hook_ids: ['hook.x'] }, shape);
        // 5 + (2–3) + 30 + (6–9) + (6–9)
        expect(t).toEqual({ low: 49, high: 56, unset: ['B'] });
        expect(totalLine(t)).toBe('About 49–56 min + B (time not set)');
        expect(totalLine({ low: 0, high: 0, unset: [] })).toBeNull();
        expect(totalLine({ low: 0, high: 0, unset: ['X'] })).toBe('X (time not set)');
    });

    it('the shape comes from the mirrored period_shapes; missing reads fall back, never invent', () => {
        expect(shapeFrom(null, null)).toEqual(DEFAULT_SHAPE);
        const s = shapeFrom(
            { on: true },
            {
                on_at: '2026-11-01',
                items_per_session: 8,
                default_items: 6,
                seconds_per_item: [45, 75],
                period_shapes: { lengths: { 50: [{ kind: 'fluency', minutes: [4, 6] }, { kind: 'hook', minutes: [1, 2] }] } },
            },
        );
        // Sprint and practice use the student list's numbers (5; 60–90 s), never
        // the mirrored copies, so the plan and the student list agree.
        expect(s).toEqual({ sprintOn: true, sprint: [5, 5], mixedOn: true, itemsPerSession: 8, secondsPerItem: [60, 90], hook: [1, 2] });
    });

    it('names each refusal', () => {
        expect(planErrorMessage(new Error('past_day'))).toMatch(/read-only/);
        expect(planErrorMessage(new Error('too_far'))).toMatch(/end of the school year/);
        expect(planErrorMessage(new Error('today_full'))).toMatch(/at most/);
        expect(planErrorMessage(new Error('boom'))).toMatch(/Check your connection/);
    });
});
