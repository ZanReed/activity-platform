// @vitest-environment jsdom
// =============================================================================
// seedVarsPanel.test.tsx — seeded variables declared in the app (GUI amendment
// 2026-11-12, S-1…S-6): the shared rules, the live reference checks, and the
// panel writing meta.seedVars only when every row is valid.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import type { SeedVar } from '@activity/schema';
import { seedReferenceFindings, seedVarProblems, withoutOwnSeedDolSections } from '../lib/seedRules';
import { readRows } from '../lib/seedPanelWords';
import { buildEditorExtensions } from '../editor/editorExtensions';
import SeedVarsPanel from '../components/SeedVarsPanel';

afterEach(cleanup);

describe('seedVarProblems (one rule for the fence and the panel)', () => {
    const int = (min: number, max: number) => ({ kind: 'int' as const, min, max });
    it.each([
        ['a fine variable', 'a', int(2, 9), [], []],
        ['an uppercase name', 'A', int(2, 9), [], ['name-shape']],
        ['a reserved name', 'pi', int(2, 9), [], ['name-reserved']],
        ['a duplicate', 'a', int(2, 9), ['a'], ['name-duplicate']],
        ['min above max', 'a', int(9, 2), [], ['range-order']],
        ['a fractional bound', 'a', int(1.5, 9), [], ['range-order']],
        ['a sample bigger than its range', 's', { kind: 'sample' as const, n: 5, min: 1, max: 3 }, [], ['sample-too-many']],
        ['a list with a non-number', 'p', { kind: 'list' as const, values: [1, Number.NaN] }, [], ['list-not-numbers']],
    ])('%s', (_n, name, spec, others, codes) => {
        expect(seedVarProblems(name, spec, others).map((p) => p.code)).toEqual(codes);
    });
});

const doc = (...content: object[]) => content;
const para = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] });

describe('seedReferenceFindings', () => {
    it('finds undeclared, unused, bare-in-maths and literal matchers', () => {
        const blank = { type: 'blank', attrs: { answer: 'a*p', mistakeFeedback: [{ match: '12' }] } };
        const f = seedReferenceFindings(
            doc(para('Buy {a} pens at {q}.'), { type: 'mathInline', attrs: { latex: 'x^{p}' } }, blank),
            ['a', 'p', 'z'],
            true,
        );
        expect(f.undeclaredText).toEqual(['q']);
        expect(f.bareInMaths).toEqual(['p']);
        expect(f.unused).toEqual(['z']);
        expect(f.literalMatchers).toEqual(['12']);
    });

    it('skips a DoL section that carries its own seed', () => {
        const content = [
            { type: 'row', content: [para('{a}')] },
            { type: 'sectionBreak', attrs: { dol: { seed: { tables: [] } } } },
            { type: 'row', content: [para('{t6}')] },
            { type: 'sectionBreak', attrs: { title: 'After' } },
            { type: 'row', content: [para('{b}')] },
        ];
        const f = seedReferenceFindings(withoutOwnSeedDolSections(content), ['a', 'b'], true);
        expect(f.undeclaredText).toEqual([]);
        expect(f.unused).toEqual([]);
    });
});

describe('readRows (the panel writes only a valid list)', () => {
    const row = (over: object = {}) => ({ name: 'a', kind: 'int' as const, min: '2', max: '9', n: '', values: '', ...over });
    it('reads valid rows of each kind', () => {
        expect(
            readRows([row(), row({ name: 'p', kind: 'list', values: '1.5, 1.75' }), row({ name: 's', kind: 'sample', n: '3', min: '1', max: '10' })]).vars,
        ).toEqual([
            { name: 'a', spec: { kind: 'int', min: 2, max: 9 } },
            { name: 'p', spec: { kind: 'list', values: [1.5, 1.75] } },
            { name: 's', spec: { kind: 'sample', n: 3, min: 1, max: 10 } },
        ]);
    });
    it.each([
        ['a blank bound', row({ min: '' }), /whole numbers, lowest first/],
        ['an empty list value', row({ kind: 'list', values: '1, , 2' }), /must be a number/],
        ['a blank count', row({ kind: 'sample', n: '', min: '1', max: '5' }), /How many numbers/],
    ])('refuses %s', (_n, bad, pattern) => {
        const read = readRows([bad]);
        expect(read.vars).toBeNull();
        expect(read.problems.flat().join(' ')).toMatch(pattern);
    });
    it('refuses the second of two same names', () => {
        expect(readRows([row(), row()]).problems).toEqual([[], ['Another variable is already called “a”.']]);
    });
});

describe('SeedVarsPanel', () => {
    const A: SeedVar[] = [{ name: 'a', spec: { kind: 'int', min: 2, max: 9 } }];

    it('adds a variable, written to meta at once', () => {
        const onChange = vi.fn();
        render(<SeedVarsPanel seedVars={undefined} onChange={onChange} />);
        fireEvent.click(screen.getByRole('button', { name: 'Add a variable' }));
        expect(onChange).toHaveBeenCalledWith([{ name: 'a', spec: { kind: 'int', min: 1, max: 10 } }]);
    });

    it('a bad edit writes nothing and says why; fixing it writes', () => {
        const onChange = vi.fn();
        render(<SeedVarsPanel seedVars={A} onChange={onChange} />);
        const lowest = screen.getByLabelText('Variable 1 lowest');
        fireEvent.change(lowest, { target: { value: '20' } });
        fireEvent.blur(lowest);
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole('alert').textContent).toMatch(/lowest first/);
        fireEvent.change(lowest, { target: { value: '3' } });
        fireEvent.blur(lowest);
        expect(onChange).toHaveBeenCalledWith([{ name: 'a', spec: { kind: 'int', min: 3, max: 9 } }]);
    });

    it('removing the last variable writes undefined, never [] (R11)', () => {
        const onChange = vi.fn();
        render(<SeedVarsPanel seedVars={A} onChange={onChange} />);
        fireEvent.click(screen.getByRole('button', { name: 'Remove variable a' }));
        expect(onChange).toHaveBeenCalledWith(undefined);
    });

    it('shows a sample student inside each range', () => {
        render(<SeedVarsPanel seedVars={A} onChange={() => {}} />);
        const text = document.querySelector('[data-seed-sample]')!.textContent!;
        const value = Number(/a = (\d+)/.exec(text)![1]);
        expect(value).toBeGreaterThanOrEqual(2);
        expect(value).toBeLessThanOrEqual(9);
    });

    it("reads the editor's document live: an undeclared {q} and an unused variable", () => {
        const editor = new Editor({
            extensions: buildEditorExtensions(),
            content: { type: 'doc', content: [{ type: 'row', content: [{ type: 'column', content: [para('Buy {q} pens.')] }] }] },
        });
        render(<SeedVarsPanel seedVars={A} onChange={() => {}} editor={editor} />);
        const findings = document.querySelector('[data-seed-findings]')!.textContent!;
        expect(findings).toMatch(/\{q\} is in the activity, but there's no variable called “q”/);
        expect(findings).toMatch(/“a” isn't used anywhere yet/);
        editor.destroy();
    });
});

describe('closing the drawer leaves no draft behind (Fable review 2026-11-12)', () => {
    const A: SeedVar[] = [{ name: 'a', spec: { kind: 'int', min: 2, max: 9 } }];

    it('an invalid draft goes back to what is stored', () => {
        const onChange = vi.fn();
        const { rerender } = render(<SeedVarsPanel seedVars={A} onChange={onChange} visible />);
        const lowest = screen.getByLabelText('Variable 1 lowest') as HTMLInputElement;
        fireEvent.change(lowest, { target: { value: '' } });
        fireEvent.blur(lowest);
        rerender(<SeedVarsPanel seedVars={A} onChange={onChange} visible={false} />);
        expect(onChange).not.toHaveBeenCalled();
        expect((screen.getByLabelText('Variable 1 lowest') as HTMLInputElement).value).toBe('2');
    });

    it('a valid draft that was never blurred is saved', () => {
        const onChange = vi.fn();
        const { rerender } = render(<SeedVarsPanel seedVars={A} onChange={onChange} visible />);
        fireEvent.change(screen.getByLabelText('Variable 1 highest'), { target: { value: '12' } });
        expect(document.body.textContent).toMatch(/aren.t saved yet/);
        rerender(<SeedVarsPanel seedVars={A} onChange={onChange} visible={false} />);
        expect(onChange).toHaveBeenCalledWith([{ name: 'a', spec: { kind: 'int', min: 2, max: 12 } }]);
    });
});
