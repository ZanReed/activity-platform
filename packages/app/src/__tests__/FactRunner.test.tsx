// @vitest-environment jsdom
// The runner's screens, bound to rendered output (D43 slice 1; DR-2, DR-5,
// CR-16). factRun.test.ts covers the timing rules; this file covers what the
// DOM does with them: the keypad registers on pointer-down WITHOUT taking
// focus, the keys a scope does not use are absent, and the word "probe" never
// reaches the page.
import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import FactRunner, { aboutMinutes } from '../practice/FactRunner';
import FactsDemo from '../routes/FactsDemo';
import type { ProbeItem } from '../practice/factRun';

afterEach(cleanup);

const PLAIN: ProbeItem[] = [
    { n: 1, display: '7 × 8 = __', spoken: 'seven times eight', answer: '56' },
    { n: 2, display: '9 × 6 = __', spoken: 'nine times six', answer: '54' },
];

function runner(items = PLAIN) {
    return render(
        <FactRunner
            items={items}
            ceilingS={15}
            savedLine="Your answers are saved. This is not marked."
            doneAction={{ label: 'Go to your classes', onClick: () => {} }}
        />,
    );
}

describe('FactRunner', () => {
    it('states the time in words, never as a clock (DR-6)', () => {
        expect(aboutMinutes(40)).toBe('About 7 minutes');
        expect(aboutMinutes(65)).toBe('About 11 minutes');
        expect(aboutMinutes(3)).toBe('About 1 minute');
        runner();
        expect(screen.getByText('About 1 minute.')).toBeTruthy();
    });

    it('a keypad key registers on pointer-down and never takes focus (DR-2)', () => {
        runner();
        fireEvent.click(screen.getByRole('button', { name: 'Start' }));
        const answer = screen.getByTestId('fx-answer');
        expect(document.activeElement).toBe(answer);
        const seven = screen.getByRole('button', { name: '7' });
        const down = fireEvent.pointerDown(seven);
        expect(down).toBe(false); // default prevented: no focus move
        expect(answer.textContent).toBe('7');
        // A mouse click after the pointer-down does not type a second 7.
        fireEvent.click(seven, { detail: 1 });
        expect(answer.textContent).toBe('7');
        // A keyboard activation of a FOCUSED key arrives as a click with detail 0.
        fireEvent.click(seven, { detail: 0 });
        expect(answer.textContent).toBe('77');
    });

    it('keys typed on the answer box register; the minus and point keys are absent when nothing uses them (CR-16)', () => {
        runner();
        fireEvent.click(screen.getByRole('button', { name: 'Start' }));
        const answer = screen.getByTestId('fx-answer');
        fireEvent.keyDown(answer, { key: '4' });
        fireEvent.keyDown(answer, { key: '2' });
        fireEvent.keyDown(answer, { key: 'Backspace' });
        expect(answer.textContent).toBe('4');
        expect(screen.queryByRole('button', { name: 'Negative sign' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Decimal point' })).toBeNull();
    });

    it('shows the minus and point keys, and a true minus, when the items use them', () => {
        runner([{ n: 1, display: '6 × (−4) = __', spoken: 'six times negative four', answer: '-24' }, { n: 2, display: '3/4 = __ as a decimal', spoken: 'three quarters as a decimal', answer: '0.75' }]);
        fireEvent.click(screen.getByRole('button', { name: 'Start' }));
        fireEvent.pointerDown(screen.getByRole('button', { name: 'Negative sign' }));
        fireEvent.pointerDown(screen.getByRole('button', { name: '2' }));
        expect(screen.getByTestId('fx-answer').textContent).toBe('−2');
        expect(screen.getByRole('button', { name: 'Decimal point' })).toBeTruthy();
    });
});

describe('/facts/demo', () => {
    it('says it is a demo, and the word "probe" never renders (DR-5)', async () => {
        const { container } = render(
            <MemoryRouter>
                <FactsDemo />
            </MemoryRouter>,
        );
        expect(screen.getByText('This is a demo. Nothing you type is saved.')).toBeTruthy();
        expect(container.textContent).not.toMatch(/probe/i);
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Start' }));
        });
        expect(container.textContent).not.toMatch(/probe/i);
        expect(screen.getByText(/stick with whichever you start with/)).toBeTruthy();
    });
});
