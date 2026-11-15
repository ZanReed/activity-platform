// @vitest-environment jsdom
// blank-enter.test.tsx — Enter in a blank (author ruling 2026-11-15) and the
// tray closing when a field freezes under the cursor (TODOS, 2026-10-23).
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ViewerProvider, createMockCheckService, createViewerStore } from '../../src/index.js';
import FillInBlank from '../../src/blocks/FillInBlank.js';
import { BlankInput, loadSuperscriptTray } from '../../src/blocks/BlankInput.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const t = (text: string) => ({ type: 'text', text, marks: [] });
const fib = (id: string, blanks: string[]) => ({
  id,
  type: 'fill_in_blank',
  content: blanks.flatMap((b) => [t('x = '), { type: 'blank', id: b }]),
});

function harness(ui: ReactElement) {
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: 'aaaaaaaa-0000-4000-8000-000000000003',
    versionId: 'bbbbbbbb-0000-4000-8000-000000000003',
    checkService: createMockCheckService({}),
  });
  return render(<ViewerProvider store={store} defaultSectionId="sec-1">{ui}</ViewerProvider>);
}

describe('Enter in a blank', () => {
  it('moves to the next blank this Check covers, then to Check, never pressing it', () => {
    let pressed = 0;
    harness(
      <div data-check-group="g1">
        <FillInBlank block={fib('f1', ['b1', 'b2']) as never} mode="screen" />
        <FillInBlank block={fib('f2', ['b3']) as never} mode="screen" />
        <button type="button" className="viewer-section__check" onClick={() => (pressed += 1)}>
          Check
        </button>
      </div>,
    );
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    inputs[0]!.focus();
    fireEvent.keyDown(inputs[0]!, { key: 'Enter' });
    expect(document.activeElement).toBe(inputs[1]);
    fireEvent.keyDown(inputs[1]!, { key: 'Enter' });
    expect(document.activeElement).toBe(inputs[2]); // the next block, same Check
    fireEvent.keyDown(inputs[2]!, { key: 'Enter' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Check' }));
    expect(pressed).toBe(0);
  });

  it('skips the blanks of a section already frozen (a disabled fieldset)', () => {
    harness(
      <div data-check-group="g1">
        <FillInBlank block={fib('f1', ['b1']) as never} mode="screen" />
        <fieldset disabled>
          <FillInBlank block={fib('f2', ['b2']) as never} mode="screen" />
        </fieldset>
        <FillInBlank block={fib('f3', ['b3']) as never} mode="screen" />
      </div>,
    );
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    inputs[0]!.focus();
    fireEvent.keyDown(inputs[0]!, { key: 'Enter' });
    expect(document.activeElement).toBe(inputs[2]);
  });

  it('leaves Shift+Enter alone', () => {
    harness(
      <div data-check-group="g1">
        <FillInBlank block={fib('f1', ['b1', 'b2']) as never} mode="screen" />
      </div>,
    );
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    inputs[0]!.focus();
    fireEvent.keyDown(inputs[0]!, { key: 'Enter', shiftKey: true });
    expect(document.activeElement).toBe(inputs[0]);
  });
});

describe('a field that freezes under the cursor', () => {
  it('closes its ² ³ tray', async () => {
    const props = {
      blankId: 'b1',
      value: '28 m',
      ariaLabel: 'Blank 1',
      size: undefined,
      answerKeyFilled: false,
      onChange: () => undefined,
    };
    const { rerender } = render(<BlankInput {...props} readOnly={false} />);
    await act(async () => {
      (screen.getByRole('textbox') as HTMLInputElement).focus();
      await loadSuperscriptTray();
    });
    const keys = () => screen.queryAllByRole('button', { name: /Insert (squared|cubed)/ });
    expect(keys()).toHaveLength(2);
    // Checked and locked: no blur fires, the field just becomes read-only.
    rerender(<BlankInput {...props} readOnly />);
    expect(keys()).toHaveLength(0);
  });
});

describe('Enter outside a worksheet', () => {
  it('is left alone where it has nowhere to go, so a form (mixed practice) still submits', () => {
    harness(
      <form>
        {/* Mixed practice: a check group with no Check button of its own. */}
        <div data-check-group="g1">
          <FillInBlank block={fib('f1', ['b1']) as never} mode="screen" />
        </div>
      </form>,
    );
    const input = screen.getAllByRole('textbox')[0] as HTMLInputElement;
    input.focus();
    const ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    input.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(input);
  });
});
