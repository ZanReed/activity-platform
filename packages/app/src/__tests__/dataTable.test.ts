// @vitest-environment jsdom
// =============================================================================
// dataTable.test.ts — the graph-kit (x, y) data table (calculator Stage 3)
// -----------------------------------------------------------------------------
// The table is a standalone kit piece consumed by the calculator's data panel;
// testing it here (the app package has the jsdom devDep) pins the behaviors the
// panel relies on: auto-append on last-row typing, complete-rows-only parsing,
// and the never-empty remove rule.
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDataTable, type DataTableHandle } from '@activity/graph-kit';

let host: HTMLElement;
let onChange: () => void;
let table: DataTableHandle;

const rows = (): HTMLTableRowElement[] =>
    Array.from(host.querySelectorAll('tbody tr'));

const typeInto = (tr: HTMLTableRowElement, axis: 'x' | 'y', value: string): void => {
    const input = tr.querySelectorAll('input')[axis === 'x' ? 0 : 1];
    if (!input) throw new Error('missing input');
    input.value = value;
    input.dispatchEvent(new Event('input'));
};

const removeBtn = (tr: HTMLTableRowElement): HTMLButtonElement => {
    const btn = tr.querySelector('button');
    if (!btn) throw new Error('missing remove button');
    return btn;
};

beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    onChange = vi.fn();
    table = createDataTable(host, onChange);
});

describe('createDataTable', () => {
    it('mounts with 3 empty rows and no points', () => {
        expect(rows()).toHaveLength(3);
        expect(table.getPoints()).toEqual([]);
    });

    it('parses only complete numeric rows, in table order', () => {
        const [r1, r2, r3] = rows();
        typeInto(r1!, 'x', '1');
        typeInto(r1!, 'y', '4');
        typeInto(r2!, 'x', '2'); // y left blank — skipped
        typeInto(r3!, 'x', '3');
        typeInto(r3!, 'y', '12');
        expect(table.getPoints()).toEqual([
            { x: 1, y: 4 },
            { x: 3, y: 12 },
        ]);
        expect(onChange).toHaveBeenCalled();
    });

    it('auto-appends a fresh row when the last row is typed into', () => {
        const last = rows()[2]!;
        typeInto(last, 'x', '5');
        expect(rows()).toHaveLength(4);
        // …but only once per growth: typing again in the same (now non-last)
        // row must not append more.
        typeInto(last, 'y', '7');
        expect(rows()).toHaveLength(4);
    });

    it('typing in a non-last row does not append', () => {
        typeInto(rows()[0]!, 'x', '1');
        expect(rows()).toHaveLength(3);
    });

    it('remove deletes the row and re-reports points', () => {
        const [r1, r2] = rows();
        typeInto(r1!, 'x', '1');
        typeInto(r1!, 'y', '2');
        typeInto(r2!, 'x', '3');
        typeInto(r2!, 'y', '4');
        removeBtn(rows()[0]!).click();
        expect(rows()).toHaveLength(2);
        expect(table.getPoints()).toEqual([{ x: 3, y: 4 }]);
    });

    it('never removes the final row — clears it instead', () => {
        removeBtn(rows()[0]!).click();
        removeBtn(rows()[0]!).click();
        expect(rows()).toHaveLength(1);
        const last = rows()[0]!;
        typeInto(last, 'x', '9'); // typing appends a new last row…
        removeBtn(rows()[1]!).click(); // …remove it again
        expect(rows()).toHaveLength(1);
        removeBtn(rows()[0]!).click(); // removing the only row clears it
        expect(rows()).toHaveLength(1);
        expect(table.getPoints()).toEqual([]);
        const input = rows()[0]!.querySelector('input');
        expect(input?.value).toBe('');
    });

    it('destroy removes the table from the host', () => {
        table.destroy();
        expect(host.querySelector('table')).toBeNull();
    });
});
