// @vitest-environment jsdom
// The demo's teacher view (DR-4). Its data is INVENTED, so nothing else checks
// it: this file holds the made-up numbers to their own arithmetic (P11 — a
// rehearsal screen whose counts disagree with its rows would teach a teacher
// to distrust the real one), and checks the screen says the data is invented.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { DEMO_RESULTS } from '../practice/demoResults';

vi.mock('../lib/classes', () => ({ listClasses: vi.fn(async () => []) }));

import FactsDemoTeacher from '../routes/FactsDemoTeacher';

afterEach(cleanup);

describe('the demo results', () => {
    const { class: c, students } = DEMO_RESULTS;
    const members = students.filter((s) => s.is_member);
    const rated = members.filter((s) => s.has_rate);

    it('the class counts are the rows, counted', () => {
        expect(c.in_class).toBe(members.length);
        expect(c.started).toBe(members.filter((s) => s.status !== 'not_started').length);
        expect(c.finished).toBe(members.filter((s) => s.status === 'finished').length);
        expect(c.with_rate).toBe(rated.length);
        expect(c.left_out).toBe(c.started - c.with_rate);
        for (const g of ['fluent', 'slow', 'needs_strategy'] as const) {
            expect(c.groups[g], g).toBe(rated.filter((s) => s.group === g).length);
        }
        expect(students.filter((s) => !s.has_rate).every((s) => s.group === null && s.rate === null)).toBe(true);
    });

    it('the median is the median of the rates, and the verdict follows from the floor', () => {
        const rates = rated.map((s) => s.rate!).sort((a, b) => a - b);
        const mid = rates.length / 2;
        const median = rates.length % 2 ? rates[Math.floor(mid)]! : (rates[mid - 1]! + rates[mid]!) / 2;
        expect(c.median_rate).toBeCloseTo(median, 2);
        expect(c.verdict).toBe(c.median_rate! < c.floor ? 'below' : 'at_or_above');
        expect(c.with_rate).toBeGreaterThanOrEqual(c.min_students);
    });

    it('each row adds up: right, met and skipped never exceed what was counted', () => {
        for (const s of students) {
            expect(s.met, s.name).toBeLessThanOrEqual(s.right);
            expect(s.right + s.skipped, s.name).toBeLessThanOrEqual(s.counted);
            expect(s.counted + s.not_counted, s.name).toBeLessThanOrEqual(s.done);
            for (const f of s.families) expect(f.met, `${s.name} ${f.name}`).toBeLessThanOrEqual(f.counted);
        }
    });

    it('says the data is invented, and keeps names behind their disclosure', () => {
        const back = vi.fn();
        const { container } = render(
            <MemoryRouter>
                <FactsDemoTeacher onBack={back} />
            </MemoryRouter>,
        );
        expect(screen.getByRole('note').textContent).toContain('every number below are invented');
        expect(container.querySelector('.ft-verdict')!.getAttribute('data-verdict')).toBe('below');
        expect(container.textContent).not.toContain('Ben (demo)');
        expect(container.textContent).not.toMatch(/probe/i);
        fireEvent.click(screen.getByRole('button', { name: 'Show names' }));
        expect(screen.getByRole('region', { name: 'Fluent' }).textContent).toContain('Ben (demo)');
        fireEvent.click(screen.getByRole('button', { name: '← Back to the demo' }));
        expect(back).toHaveBeenCalledTimes(1);
    });
});
