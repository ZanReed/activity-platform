// @vitest-environment jsdom
// Blanks inside inline maths (walkthrough, 2026-11-09), bound to rendered output.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import {
  createMockCheckService,
  createViewerStore,
  ViewerProvider,
} from '../../src/index.js';
import { setMathPromptsSurface } from '../../src/blocks/kitSurfaces.js';
import { InlineContent } from '../../src/inline/InlineContent.js';
import { AnswerKeyProvider } from '../../src/answer-key/context.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const NODE = { type: 'math_inline', latex: 'k = \\placeholder[g1]{}', prompts: [{ id: 'g1' }] };

function setup(ui: React.ReactNode, script: Parameters<typeof createMockCheckService>[0] = {}) {
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: 'aaaaaaaa-0000-4000-8000-000000000001',
    versionId: 'bbbbbbbb-0000-4000-8000-000000000001',
    checkService: createMockCheckService(script),
  });
  render(
    <ViewerProvider store={store} defaultSectionId="sec-1">
      {ui}
    </ViewerProvider>,
  );
  return store;
}

afterEach(() => {
  cleanup();
  setMathPromptsSurface(null);
});

describe('inline maths with a gap', () => {
  it('mounts a field, and what is typed reaches the store under the prompt id', async () => {
    const surface = vi.fn(async () => ({ destroy: () => {} }));
    setMathPromptsSurface(surface);
    const store = setup(<InlineContent nodes={[NODE]} />);
    await waitFor(() => expect(surface).toHaveBeenCalledTimes(1));
    const [, opts] = surface.mock.calls[0] as unknown as [
      HTMLElement,
      { latex: string; onValue: (id: string, v: string) => void },
    ];
    expect(opts.latex).toBe(NODE.latex);
    opts.onValue('g1', '4');
    expect(store.getState().responses.blanks['g1']).toBe('4');
  });

  it('never shows the raw marker while it waits', async () => {
    setMathPromptsSurface(() => new Promise(() => {}));
    const { container } = render(
      <ViewerProvider
        store={createViewerStore({
          userId: TEST_USER_ID,
          activityId: 'aaaaaaaa-0000-4000-8000-000000000001',
          versionId: 'bbbbbbbb-0000-4000-8000-000000000001',
          checkService: createMockCheckService({}),
        })}
        defaultSectionId="sec-1"
      >
        <InlineContent nodes={[NODE]} />
      </ViewerProvider>,
    );
    await waitFor(() => expect(container.querySelector('[data-math-gaps]')).not.toBeNull());
    expect(container.textContent).not.toContain('placeholder[');
  });

  it('a teacher key shows the answer, with no field', async () => {
    const surface = vi.fn(async () => ({ destroy: () => {} }));
    setMathPromptsSurface(surface);
    setup(
      <AnswerKeyProvider answers={{ b1: { mathGaps: { g1: '4' } } } as never}>
        <InlineContent nodes={[NODE]} />
      </AnswerKeyProvider>,
    );
    await waitFor(() => expect(document.querySelector('[data-math-gaps]')?.textContent).toContain('4'));
    expect(surface).not.toHaveBeenCalled();
  });

  it('on paper it mounts no field', async () => {
    const surface = vi.fn(async () => ({ destroy: () => {} }));
    setMathPromptsSurface(surface);
    setup(
      <div data-viewer-mode="print">
        <InlineContent nodes={[NODE]} />
      </div>,
    );
    await waitFor(() => expect(document.querySelector('[data-math-gaps]')).not.toBeNull());
    expect(surface).not.toHaveBeenCalled();
  });

  it('a gap shows the feedback the check returns (the FG-5 built-in line)', async () => {
    setMathPromptsSurface(async () => ({ destroy: () => {} }));
    const line = "That's equal to the answer, but it isn't in the form the question asks for.";
    const store = setup(<InlineContent nodes={[NODE]} />, {
      verdicts: { g1: 'incorrect' },
      feedback: { g1: [{ type: 'text', text: line, marks: [] }] as never },
    });
    store.setBlank('g1', '18x-12');
    await store.checkSection('sec-1', { blanks: ['g1'] } as never);
    await waitFor(() =>
      expect(document.querySelector('[data-math-gaps] [data-feedback="server"]')?.textContent).toBe(line),
    );
  });
});
