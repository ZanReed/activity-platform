// @vitest-environment jsdom
// First tries (0062; first-try-view.md FT-1..FT-8), bound to rendered output.
// Payloads are typed by the lib's shapes, which verify-0062 asserts against the
// real function; SQL correctness is verify-0062's.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router';
import {
    createBlankToken,
    createEmptyDocument,
    createFillInBlankBlock,
    createMultipleChoiceBlock,
} from '@activity/schema';
import FirstTriesPanel, { headline } from '../progress/FirstTriesPanel';
import { servedDocument } from '../lib/answerText';
import type { FirstTries, FirstTryItem } from '../lib/classProgress';

const api = vi.hoisted(() => ({
    fetchStudentWork: vi.fn(),
    fetchVersionContents: vi.fn(),
    fetchMisconceptionDescriptions: vi.fn(async () => new Map()),
}));
vi.mock('../lib/classProgress', async (orig) => ({
    ...(await orig<typeof import('../lib/classProgress')>()),
    ...api,
}));
import AnswerPanel from '../progress/AnswerPanel';

const t = (text: string) => [{ type: 'text' as const, text, marks: [] }];

function fixture() {
    const doc = createEmptyDocument();
    const mc = createMultipleChoiceBlock();
    mc.choices.forEach((c, i) => {
        c.content = t(['three quarters', 'two thirds', 'one half'][i]!);
    });
    mc.choices[1]!.feedback = t('Compare them with a common denominator.');
    mc.choices[1]!.misconceptionId = 'mis.frac.bigger-denominator';
    const fib = createFillInBlankBlock();
    const blank = createBlankToken('0.8');
    fib.content = [...t('4/5 = '), blank];
    const easy = createFillInBlankBlock();
    const easyBlank = createBlankToken('1');
    easy.content = [easyBlank];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [mc, fib, easy];
    return { doc, mc, blank, easyBlank, sid: doc.sections[0]!.id };
}

const item = (over: Partial<FirstTryItem>): FirstTryItem => ({
    section_id: 's', item_id: 'x', family: 'blanks', first: 4, right_first: 4, wrong_first: 0,
    wrong_right_now: 0, picked: 0, groups: [], ...over,
});

function panel(data: FirstTries, served: ReturnType<typeof servedDocument> | null, hide = false) {
    return render(
        <MemoryRouter>
            <FirstTriesPanel
                data={data}
                served={served}
                describe={(m) => (m === 'mis.frac.bigger-denominator' ? 'Thinks a bigger denominator means a bigger fraction' : `Unknown misconception (${m})`)}
                nameOf={(sid, name) => (hide ? `Student ${sid.slice(-1)}` : name)}
                studentHref={(sid) => `/activity/a/progress/${sid}`}
            />
        </MemoryRouter>,
    );
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('the First tries panel', () => {
    const f = fixture();
    const served = servedDocument(f.doc, 'v', null);
    const data: FirstTries = {
        activity: { id: 'a', title: 'Fractions 2', current_version_id: 'v' },
        older_only: 2,
        no_first: 1,
        sections: [{ section_id: f.sid, students: 5 }],
        items: [
            item({ section_id: f.sid, item_id: f.easyBlank.id, first: 5, right_first: 5 }),
            // A fourth question (gone from the document): it must start CLOSED.
            item({ section_id: f.sid, item_id: 'retired-item', first: 6, right_first: 6 }),
            item({ section_id: f.sid, item_id: f.mc.id, family: 'choices', first: 4, right_first: 1, wrong_first: 3,
                wrong_right_now: 2, picked: 4, groups: [
                    { answer: f.mc.choices[1]!.id, family: 'choices', count: 3, right_now: 2, misconception_ids: [],
                      students: [{ student_id: 's1', name: 'Ana Lee', right_now: true }, { student_id: 's2', name: 'Ben Carter', right_now: true },
                                 { student_id: 's3', name: 'Caleb Wu', right_now: false }] },
                    { answer: f.mc.choices[0]!.id, family: 'choices', count: 1, right_now: 1, misconception_ids: [],
                      students: [{ student_id: 's4', name: 'Dina Patel', right_now: true }] },
                ] }),
            item({ section_id: f.sid, item_id: f.blank.id, family: 'blanks', first: 4, right_first: 2, wrong_first: 2,
                wrong_right_now: 0, groups: [
                    { answer: '0.45', family: 'blanks', count: 2, right_now: 0, misconception_ids: ['mis.decimal.digits'],
                      students: [{ student_id: 's1', name: 'Ana Lee', right_now: false }, { student_id: 's3', name: 'Caleb Wu', right_now: false }] },
                ] }),
        ],
    };

    it('orders by first-try rate, lowest first, and opens only the first three', () => {
        panel(data, served);
        const heads = screen.getAllByRole('button', { name: /right first time/ });
        expect(heads.map((h) => h.textContent)).toEqual([
            expect.stringContaining('Q1 · 1 of 4 right first time · 2 of the 3 wrong are right now'),
            expect.stringContaining('Q2 · 2 of 4 right first time · 0 of the 2 wrong are right now'),
            expect.stringContaining('Q3 · 5 of 5 right first time'),
            expect.stringContaining('A question · 6 of 6 right first time'),
        ]);
        expect(heads.map((h) => h.getAttribute('aria-expanded'))).toEqual(['true', 'true', 'true', 'false']);
        expect(screen.getByText(/2 students are only on an older version/)).toBeTruthy();
        expect(screen.getByText(/1 student's first try is no longer kept, so not counted/)).toBeTruthy();
    });

    it('multiple choice shows every choice in authored order, zeros, the correct one, and what a distractor told them', () => {
        panel(data, served);
        const mc = screen.getAllByRole('button', { name: /right first time/ })[0]!.parentElement!;
        const lines = within(mc).getAllByRole('listitem').map((li) => li.textContent ?? '');
        expect(lines[0]).toMatch(/^A\. three quarters✓ correct1 student/);
        expect(lines[1]).toContain('B. two thirds');
        expect(lines[1]).toContain('3 students · 2 right now');
        expect(lines[1]).toContain('They were told: “Compare them with a common denominator.” · Thinks a bigger denominator means a bigger fraction');
        expect(lines[2]).toMatch(/^C\. one half0 students$/);
        expect(lines[3]).toBe('No answer: 1 student');
    });

    it('other questions show their first-try wrong answers with right-now and the tag', () => {
        panel(data, served);
        const q2 = screen.getAllByRole('button', { name: /right first time/ })[1]!.parentElement!;
        expect(q2.textContent).toContain('0.452 students · 0 right now');
        expect(q2.textContent).toContain('Unknown misconception (mis.decimal.digits)');
        // FT-2: a blank left empty on the first check is "no answer".
        expect(q2.textContent).toContain('No answer: 1 student');
    });

    it('"Who" lists students only when opened, each to their answers, and Hide names holds', () => {
        const { container } = panel(data, served, true);
        expect(container.innerHTML).not.toContain('Ana Lee');
        fireEvent.click(screen.getByRole('button', { name: 'Who picked B' }));
        const link = screen.getByRole('link', { name: 'Student 1' });
        expect(link.getAttribute('href')).toBe('/activity/a/progress/s1');
        expect(container.innerHTML).not.toMatch(/Ana Lee|Ben Carter|Caleb Wu|Dina Patel/);
    });

    it('without the document, a multiple-choice question never lists the right choice as a wrong answer', () => {
        panel(data, null);
        const mc = screen.getAllByRole('button', { name: /right first time/ })[0]!.parentElement!;
        expect(mc.textContent).toContain("This question's text could not be loaded");
        expect(mc.textContent).toContain('4 of 5 picked an answer');
        expect(within(mc).queryAllByRole('listitem')).toHaveLength(0);
    });

    it('headline omits the right-now clause when nobody was wrong', () => {
        expect(headline(item({ first: 3, right_first: 3 }))).toBe('3 of 3 right first time');
        expect(headline(item({ first: 3, right_first: 2, wrong_first: 1, wrong_right_now: 1 }))).toBe(
            '2 of 3 right first time · 1 of the 1 wrong is right now',
        );
    });
});

describe('the answer panel: First try / Latest (FT-8)', () => {
    it('switches a re-checked section to attempt 1, and back', async () => {
        const f = fixture();
        api.fetchVersionContents.mockResolvedValue(new Map([['v', { version_num: 1, content: f.doc }]]));
        api.fetchStudentWork.mockResolvedValue({
            student: { id: 's1', name: 'Ana Lee' },
            activity: { id: 'a', title: 'Fractions 2', current_version_id: 'v' },
            versions: [{ version_id: 'v', version_num: 1, is_current: true, sections: [{
                section_id: f.sid, attempts: 2, attempt_number: 2, checked_at: '2027-02-09T09:41:00Z',
                responses: { choices: { [f.mc.id]: [f.mc.choices[0]!.id] } },
                verdicts: { [f.mc.id]: { verdict: 'correct' } },
                graded_block_ids: [],
                first: { checked_at: '2027-02-09T09:30:00Z',
                         responses: { choices: { [f.mc.id]: [f.mc.choices[1]!.id] } },
                         verdicts: { [f.mc.id]: { verdict: 'incorrect', feedback: t('Compare them with a common denominator.') } } },
            }] }],
        });
        const ctx = { hideNames: false, nameOf: (_: string, n: string) => n, classId: null, closeTo: '/activity/a/progress' };
        render(
            <MemoryRouter initialEntries={['/activity/a/progress/s1']}>
                <Routes>
                    <Route path="/activity/:id/progress" element={<Outlet context={ctx} />}>
                        <Route path=":studentId" element={<AnswerPanel />} />
                    </Route>
                </Routes>
            </MemoryRouter>,
        );
        const latest = await screen.findByRole('button', { name: 'Latest' });
        expect(latest.getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByText('three quarters')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'First try' }));
        expect(screen.getByRole('button', { name: 'First try' }).getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByText('two thirds')).toBeTruthy();
        expect(screen.getByText(/Compare them with a common denominator/)).toBeTruthy();
        expect(screen.getByText('Answer: three quarters')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Latest' }));
        expect(screen.getByText('three quarters')).toBeTruthy();
    });

    it('offers no switch on a section checked once', async () => {
        const f = fixture();
        api.fetchVersionContents.mockResolvedValue(new Map([['v', { version_num: 1, content: f.doc }]]));
        api.fetchStudentWork.mockResolvedValue({
            student: { id: 's1', name: 'Ana Lee' },
            activity: { id: 'a', title: 'Fractions 2', current_version_id: 'v' },
            versions: [{ version_id: 'v', version_num: 1, is_current: true, sections: [{
                section_id: f.sid, attempts: 1, attempt_number: 1, checked_at: '2027-02-09T09:41:00Z',
                responses: {}, verdicts: {}, graded_block_ids: [],
                first: { checked_at: '2027-02-09T09:41:00Z', responses: {}, verdicts: {} },
            }] }],
        });
        const ctx = { hideNames: false, nameOf: (_: string, n: string) => n, classId: null, closeTo: '/activity/a/progress' };
        render(
            <MemoryRouter initialEntries={['/activity/a/progress/s1']}>
                <Routes>
                    <Route path="/activity/:id/progress" element={<Outlet context={ctx} />}>
                        <Route path=":studentId" element={<AnswerPanel />} />
                    </Route>
                </Routes>
            </MemoryRouter>,
        );
        await screen.findByText('1 attempt');
        expect(screen.queryByRole('button', { name: 'First try' })).toBeNull();
    });
});

describe('the answer panel: "N to grade" stays the latest attempt\'s under First try', () => {
    it('counts the latest ungraded essay whichever attempt is on screen, and shows no grade badge on a first try', async () => {
        const schema = await import('@activity/schema');
        const doc = schema.createEmptyDocument();
        const essay = schema.createEssayBlock();
        doc.sections[0]!.rows[0]!.columns[0]!.blocks = [essay];
        const sid = doc.sections[0]!.id;
        api.fetchVersionContents.mockResolvedValue(new Map([['v', { version_num: 1, content: doc }]]));
        api.fetchStudentWork.mockResolvedValue({
            student: { id: 's1', name: 'Ana Lee' },
            activity: { id: 'a', title: 'Fractions 2', current_version_id: 'v' },
            versions: [{ version_id: 'v', version_num: 1, is_current: true, sections: [{
                section_id: sid, attempts: 2, attempt_number: 2, checked_at: '2027-02-09T09:41:00Z',
                responses: { freeText: { [essay.id]: 'second draft' } },
                verdicts: { [essay.id]: { verdict: 'recorded' } },
                graded_block_ids: [],
                first: { checked_at: '2027-02-09T09:30:00Z', responses: { freeText: { [essay.id]: 'first draft' } },
                         verdicts: { [essay.id]: { verdict: 'recorded' } } },
            }] }],
        });
        const ctx = { hideNames: false, nameOf: (_: string, n: string) => n, classId: null, closeTo: '/activity/a/progress' };
        render(
            <MemoryRouter initialEntries={['/activity/a/progress/s1']}>
                <Routes>
                    <Route path="/activity/:id/progress" element={<Outlet context={ctx} />}>
                        <Route path=":studentId" element={<AnswerPanel />} />
                    </Route>
                </Routes>
            </MemoryRouter>,
        );
        expect(await screen.findByRole('link', { name: '1 to grade in Fractions 2' })).toBeTruthy();
        expect(screen.getByText('second draft').closest('li')!.textContent).toContain('To grade');
        fireEvent.click(screen.getByRole('button', { name: 'First try' }));
        expect(screen.getByText('first draft').closest('li')!.textContent).toContain('Recorded');
        expect(screen.getByRole('link', { name: '1 to grade in Fractions 2' })).toBeTruthy();
    });
});
