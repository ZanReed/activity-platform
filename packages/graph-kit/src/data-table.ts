// =============================================================================
// data-table.ts — the (x, y) data-entry table (Stage 3)
// -----------------------------------------------------------------------------
// A standalone kit piece (the design doc's "reusable kit piece" — a future
// graded line-of-best-fit question and any later stats feature reuse it), not
// buried inside the calculator shell. Vanilla DOM, no dependencies: a real
// <table> (screen readers get row/column context for free), number inputs,
// per-row remove buttons, and Desmos-style auto-append — typing in the last row
// grows the table, so there is no "add row" click in the hot path.
//
// v1 is manual entry only (the green-lit scope); clipboard paste from a
// spreadsheet is a possible fast-follow.
// =============================================================================

export interface DataTableHandle {
  /** Complete numeric rows, in table order. Partial/blank rows are skipped. */
  getPoints(): { x: number; y: number }[];
  destroy(): void;
}

const START_ROWS = 3;

export function createDataTable(
  host: HTMLElement,
  onChange: () => void,
): DataTableHandle {
  const table = document.createElement('table');
  table.className = 'gk-data-table';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const label of ['x', 'y', '']) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = label;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);
  host.appendChild(table);

  function makeCellInput(axis: 'x' | 'y'): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.inputMode = 'decimal';
    input.className = 'gk-data-input';
    input.setAttribute('aria-label', `${axis} value`);
    return input;
  }

  function rowIsTouched(tr: HTMLTableRowElement): boolean {
    return Array.from(tr.querySelectorAll('input')).some((i) => i.value !== '');
  }

  function addRow(): void {
    const tr = document.createElement('tr');
    const xInput = makeCellInput('x');
    const yInput = makeCellInput('y');
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'gk-data-remove';
    removeBtn.setAttribute('aria-label', 'Remove row');
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
      // Never remove the last remaining row — clear it instead, so the table
      // always has somewhere to type.
      if (tbody.rows.length > 1) tr.remove();
      else {
        xInput.value = '';
        yInput.value = '';
      }
      onChange();
    });
    const handleInput = (): void => {
      if (tr === tbody.rows[tbody.rows.length - 1] && rowIsTouched(tr)) addRow();
      onChange();
    };
    xInput.addEventListener('input', handleInput);
    yInput.addEventListener('input', handleInput);
    for (const child of [xInput, yInput, removeBtn]) {
      const td = document.createElement('td');
      td.appendChild(child);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  for (let i = 0; i < START_ROWS; i++) addRow();

  return {
    getPoints() {
      const points: { x: number; y: number }[] = [];
      for (const tr of Array.from(tbody.rows)) {
        const [xInput, yInput] = Array.from(tr.querySelectorAll('input'));
        if (!xInput || !yInput) continue;
        if (xInput.value === '' || yInput.value === '') continue;
        const x = Number(xInput.value);
        const y = Number(yInput.value);
        if (Number.isFinite(x) && Number.isFinite(y)) points.push({ x, y });
      }
      return points;
    },
    destroy() {
      table.remove();
    },
  };
}
