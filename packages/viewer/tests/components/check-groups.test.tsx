// =============================================================================
// check-groups.test.tsx — the flow-mode guards, bound to RENDERED OUTPUT
// -----------------------------------------------------------------------------
// The design doc's guards 1–5, 9, 10 plus F3b's confirm and F9b's copy table.
//
// ⚠ GUARD 5 IS THE LOAD-BEARING ONE, and it is here rather than in
// checkGroups.test.ts on purpose (OV#16): a property test over a fold that
// assigns sections by construction proves the construction, not the product.
// This one renders the document and asks the only question that matters to a
// student — is there a Check button whose press covers MY section? — by taking
// the set of buttons actually in the DOM, clicking each, and reading the
// section ids that reached the service.
//
// Every guard here was mutation-tested once; the failures are recorded in the
// commit message.
// =============================================================================

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { MockInstance } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import {
  CheckError,
  ViewerContainer,
  createViewerStore,
} from '../../src/index.js';
import type {
  BlockComponentProps,
  BlockType,
  CheckRequest,
  CheckService,
  SanitizedActivityDocument,
  SectionCheckResult,
  SubmissionMode,
} from '../../src/index.js';
import { sanitizedFixtureDocument } from '../../src/fixtures/index.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';

const fullDoc = sanitizedFixtureDocument();
const shortAnswer = fullDoc.sections
  .flatMap((s) => s.rows)
  .flatMap((r) => r.columns)
  .flatMap((c) => c.blocks)
  .find((b) => (b as { type?: string }).type === 'short_answer')!;

/**
 * A document of N sections, one short-answer block each, with `checkpoints`
 * naming which carry the authored `{checkpoint}` marker.
 */
function docOfSections(
  checkpoints: boolean[],
  submissionMode: SubmissionMode,
): SanitizedActivityDocument {
  return {
    ...fullDoc,
    meta: { ...fullDoc.meta, submissionMode },
    sections: checkpoints.map((isCheckpoint, i) => ({
      id: `sec-${i}`,
      title: `Section ${i}`,
      isCheckpoint,
      rows: [
        {
          id: `row-${i}`,
          gridLines: 'inherit',
          columns: [
            {
              id: `col-${i}`,
              blocks: [{ ...(shortAnswer as object), id: `blk-${i}` }],
            },
          ],
        },
      ],
    })),
  } as unknown as SanitizedActivityDocument;
}

/** A CheckService scripted per section — the mock's failWith is all-or-nothing
 * and a PARTIAL group is half of what this file exists to pin. */
function service(behaviour: Record<string, 'ok' | Error> = {}) {
  const calls: CheckRequest[] = [];
  const impl: CheckService & { calls: CheckRequest[] } = {
    calls,
    async checkSection(request) {
      calls.push(request);
      const outcome = behaviour[request.sectionId] ?? 'ok';
      if (outcome !== 'ok') throw outcome;
      // ⚠ A REAL SOLUTION PAYLOAD, always. The OV#14 gate is invisible to a
      // service that returns `solutions: {}` — the reveal test would pass
      // whether the gate existed or not, which is exactly the vacuous-guard
      // class this repo keeps paying for. (It did: the first version of this
      // file scripted no solutions and survived a mutation that deleted the
      // gate outright.)
      const blockId = request.sectionId.replace('sec-', 'blk-');
      const result: SectionCheckResult = {
        wireVersion: request.wireVersion,
        sectionId: request.sectionId,
        items: {},
        solutions: {
          [blockId]: [{ type: 'text', text: `Worked answer for ${blockId}.` }],
        },
      } as SectionCheckResult;
      return result;
    },
    async fetchReleasedFeedback() {
      return { graded: false, blocks: {} };
    },
  };
  return impl;
}

function setup(
  doc: SanitizedActivityDocument,
  behaviour: Record<string, 'ok' | Error> = {},
  overrides: {
    resolveComponent?: (type: BlockType) => ComponentType<BlockComponentProps> | null;
  } = {},
) {
  const svc = service(behaviour);
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: svc,
  });
  const utils = render(
    <ViewerContainer document={doc} store={store} versionId={VERSION} {...overrides} />,
  );
  return { ...utils, store, service: svc };
}

/** The document's Check buttons — deliberately NOT counting the confirm step's
 * own fire button, which is a second press of the same one control. */
const checkButtons = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLButtonElement>(
      '.viewer-section__check:not(.viewer-check-group__confirm-fire)',
    ),
  );

/** Press a group's Check, walking the `locked` confirm step when it appears.
 * Scoped to the group element: in a multi-group locked document several
 * buttons carry the same words, and a document-wide query would press the
 * wrong one. */
async function pressCheck(group: Element) {
  await act(async () => {
    fireEvent.click(
      group.querySelector<HTMLButtonElement>(
        '.viewer-section__check:not(.viewer-check-group__confirm-fire)',
      )!,
    );
  });
  const confirm = group.querySelector<HTMLButtonElement>(
    '.viewer-check-group__confirm-fire',
  );
  if (confirm) {
    await act(async () => {
      fireEvent.click(confirm);
    });
  }
}

const groupsOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('.viewer-check-group'));

let errorSpy: MockInstance<Parameters<typeof console.error>, void>;
beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  errorSpy.mockRestore();
});

// -----------------------------------------------------------------------------
// GUARD 1 — Check buttons exist only where R1 says
// -----------------------------------------------------------------------------
describe('guard 1 — a checkpoint checks everything since the previous one', () => {
  it('[plain, checkpoint, plain, plain] renders exactly two buttons', () => {
    const { container } = setup(
      docOfSections([false, true, false, false], 'free'),
    );
    expect(checkButtons(container)).toHaveLength(2);
  });

  it('the checkpoint’s button fires for sections 0 AND 1', async () => {
    const { container, service: svc } = setup(
      docOfSections([false, true, false, false], 'free'),
    );
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(svc.calls.map((c) => c.sectionId).sort()).toEqual(['sec-0', 'sec-1']);
  });

  it('the trailing run gets the implicit end-of-activity checkpoint', async () => {
    const { container, service: svc } = setup(
      docOfSections([false, true, false, false], 'free'),
    );
    await act(async () => {
      fireEvent.click(checkButtons(container)[1]!);
    });
    expect(svc.calls.map((c) => c.sectionId).sort()).toEqual(['sec-2', 'sec-3']);
  });

  it('a document with no marker at all has ONE button, at the end', () => {
    const { container } = setup(docOfSections([false, false, false], 'free'));
    expect(checkButtons(container)).toHaveLength(1);
  });

  it('the button names its scope so the region and the words agree (D1)', () => {
    const { container } = setup(docOfSections([false, false, false], 'free'));
    expect(checkButtons(container)[0]!.textContent).toBe('Check these 3 sections');
  });

  it('a one-section group keeps the bare verb — no invented plural', () => {
    const { container } = setup(docOfSections([true, true], 'free'));
    expect(checkButtons(container).map((b) => b.textContent)).toEqual([
      'Check',
      'Check',
    ]);
  });
});

// -----------------------------------------------------------------------------
// GUARD 2 — single hides every mid button
// -----------------------------------------------------------------------------
describe('guard 2 — `single` ignores every marker', () => {
  it('renders one button for a fully-marked document', () => {
    const { container } = setup(docOfSections([true, true, true], 'single'));
    expect(checkButtons(container)).toHaveLength(1);
  });

  it('and that one button still covers every section', async () => {
    const { container, service: svc } = setup(
      docOfSections([true, true, true], 'single'),
    );
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(svc.calls.map((c) => c.sectionId).sort()).toEqual([
      'sec-0',
      'sec-1',
      'sec-2',
    ]);
  });
});

// -----------------------------------------------------------------------------
// GUARD 5 — NO SECTION IS EVER UN-CHECKABLE (rendered output)
// -----------------------------------------------------------------------------
describe('guard 5 — every section is covered by some Check button in the DOM', () => {
  const shapes: boolean[][] = [
    [false],
    [true],
    [false, false],
    [true, false],
    [false, true],
    [true, true],
    [false, true, false, false],
    [true, false, true, false, true],
    [false, false, false, true],
    [false, true, true, false, false, true, false],
  ];

  for (const mode of ['free', 'locked', 'single'] as const) {
    for (const shape of shapes) {
      it(`${mode}: [${shape.map((c) => (c ? 'C' : '.')).join('')}] — every section reaches the grader`, async () => {
        const doc = docOfSections(shape, mode);
        const { container, service: svc } = setup(doc);
        // Press EVERY button that exists, and collect what actually reached
        // the service. Nothing here consults the fold: the question is whether
        // a student pressing every button in front of them gets all their work
        // checked. `locked` needs its confirm walked, which is part of what a
        // student actually does.
        for (const group of groupsOf(container)) {
          await pressCheck(group);
        }
        const covered = new Set(svc.calls.map((c) => c.sectionId));
        expect([...covered].sort()).toEqual(doc.sections.map((s) => s.id).sort());
        // ...and no button fires for a section that isn't in the document.
        expect(svc.calls.length).toBe(doc.sections.length);
      });
    }
  }
});

// -----------------------------------------------------------------------------
// GUARDS 3 + 4 — locked freezes, free does not
// -----------------------------------------------------------------------------
const inputsOf = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLFieldSetElement>('.viewer-section__inputs'),
  );

describe('guard 3 — `locked` freezes the group it checked', () => {
  it('a fired check disables every input in the group and removes the button', async () => {
    const { container } = setup(docOfSections([false, true, false], 'locked'));
    // The confirm step is part of the press in `locked` (D3).
    await pressCheck(groupsOf(container)[0]!);

    const groups = container.querySelectorAll('.viewer-check-group');
    expect(groups[0]!.getAttribute('data-group-frozen')).toBe('true');
    const frozen = inputsOf(container).slice(0, 2);
    expect(frozen.every((f) => f.disabled)).toBe(true);
    // ...and the group's Check is GONE, because there is nothing left to press:
    // no unlock exists in v1.
    expect(groups[0]!.querySelector('.viewer-section__check')).toBeNull();
    // The other group is untouched.
    expect(groups[1]!.getAttribute('data-group-frozen')).toBeNull();
    expect(inputsOf(container)[2]!.disabled).toBe(false);
  });

  it('the real input inside a frozen group is actually disabled — not just the fieldset', async () => {
    const { container } = setup(docOfSections([true, false], 'locked'));
    await pressCheck(groupsOf(container)[0]!);
    const field = container
      .querySelector('[data-section-id="sec-0"]')!
      .querySelector('textarea, input')!;
    // ⚠ `:disabled`, NOT `.disabled`. The IDL property reflects the control's
    // OWN attribute and stays false inside a disabled fieldset — in jsdom AND
    // in every real browser. The pseudo-class is what actually answers "can
    // the student type here?", so asserting `.disabled` here would have been a
    // guard that passes whether or not the freeze works.
    expect(field.matches(':disabled')).toBe(true);
  });

  it('a REFUSED check freezes nothing — a partial freeze would trap the answer', async () => {
    const { container } = setup(docOfSections([true, false], 'locked'), {
      'sec-0': new CheckError('server_error', 'grader down', 500),
    });
    await pressCheck(groupsOf(container)[0]!);
    expect(inputsOf(container)[0]!.disabled).toBe(false);
    expect(
      container.querySelector('[data-check-group="sec-0"] .viewer-section__check'),
    ).not.toBeNull();
  });

  it('the server’s `locked` refusal freezes on arrival — the second-device path', async () => {
    const { container } = setup(docOfSections([true, false], 'locked'), {
      'sec-0': new CheckError('locked', 'already locked', 409),
    });
    await pressCheck(groupsOf(container)[0]!);
    expect(inputsOf(container)[0]!.disabled).toBe(true);
    expect(screen.getByText('Already checked and locked.')).toBeTruthy();
  });
});

describe('guard 4 — `free` never freezes (the regression pin)', () => {
  it('inputs stay live after a check and the button stays pressable', async () => {
    const { container } = setup(docOfSections([true, false], 'free'));
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(inputsOf(container)[0]!.disabled).toBe(false);
    expect(checkButtons(container)).toHaveLength(2);
    expect(
      container.querySelector('.viewer-check-group')!.getAttribute('data-group-frozen'),
    ).toBeNull();
  });

  it('re-checking re-fires the whole group (7.1A)', async () => {
    const { container, service: svc } = setup(docOfSections([false, false], 'free'));
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(svc.calls).toHaveLength(4);
  });

  it('`free` never shows the confirm step (D3 is `locked` only)', async () => {
    const { container } = setup(docOfSections([true], 'free'));
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
  });
});

// -----------------------------------------------------------------------------
// F3b — the locked confirm step (D3)
// -----------------------------------------------------------------------------
describe('F3b — “Check and lock” asks first, because there is no unlock', () => {
  it('the button reads “Check and lock …” in locked mode', () => {
    const { container } = setup(docOfSections([false, false], 'locked'));
    expect(checkButtons(container)[0]!.textContent).toBe(
      'Check and lock these 2 sections',
    );
  });

  it('pressing it fires NOTHING — it opens the confirm', async () => {
    const { container, service: svc } = setup(docOfSections([true], 'locked'));
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(svc.calls).toHaveLength(0);
    expect(
      screen.getByText(
        'Check and lock this section? You won’t be able to change your answers after this.',
      ),
    ).toBeTruthy();
  });

  it('the plural confirm names the count', async () => {
    const { container } = setup(docOfSections([false, false, false], 'locked'));
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(
      screen.getByText(
        'Check and lock these 3 sections? You won’t be able to change your answers after this.',
      ),
    ).toBeTruthy();
  });

  it('Cancel fires no RPC and freezes nothing', async () => {
    const { container, service: svc } = setup(docOfSections([true, false], 'locked'));
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    });
    expect(svc.calls).toHaveLength(0);
    expect(inputsOf(container)[0]!.disabled).toBe(false);
    // ...and the original button is back.
    expect(checkButtons(container)[0]!.textContent).toBe('Check and lock');
  });
});

// -----------------------------------------------------------------------------
// GUARD 9 — the partial group
// -----------------------------------------------------------------------------
describe('guard 9 — a partial group names what is missing and reveals nothing', () => {
  it('says how many landed, offers Retry, and Retry fires only the unlanded', async () => {
    const { container, service: svc } = setup(
      docOfSections([false, false, false], 'free'),
      { 'sec-1': new CheckError('server_error', 'grader down', 500) },
    );
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(screen.getByText('Checked 2 of 3 — one part didn’t send.')).toBeTruthy();

    const retry = screen.getByRole('button', { name: 'Retry' });
    svc.calls.length = 0;
    await act(async () => {
      fireEvent.click(retry);
    });
    expect(svc.calls.map((c) => c.sectionId)).toEqual(['sec-1']);
  });

  it('a partial group does NOT reveal solutions for the members that landed (OV#14)', async () => {
    const behaviour: Record<string, 'ok' | Error> = {
      'sec-1': new CheckError('server_error', 'grader down', 500),
    };
    const { container, store } = setup(docOfSections([false, false], 'free'), behaviour);
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    // sec-0 LANDED and the server sent its worked answer — the gate is the
    // only thing keeping it off the screen while sec-1 is still editable.
    const state = store.getState();
    expect(state.sections['sec-0']?.phase).toBe('checked');
    const landed = state.sections['sec-0'];
    expect(landed?.phase === 'checked' && landed.result.solutions['blk-0']).toBeTruthy();
    expect(container.querySelector('.viewer-solution')).toBeNull();

    // ...and it appears the moment the group completes.
    behaviour['sec-1'] = 'ok';
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    });
    expect(container.querySelectorAll('.viewer-solution')).toHaveLength(2);
  });

  it('a COMPLETE group reveals every member’s solution (the other direction)', async () => {
    const { container } = setup(docOfSections([false, false], 'free'));
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(container.querySelectorAll('.viewer-solution')).toHaveLength(2);
  });

  it('D8 — a LOCKED group reveals its solutions too; the lock is not punitive', async () => {
    const { container } = setup(docOfSections([false, false], 'locked'));
    await pressCheck(groupsOf(container)[0]!);
    expect(container.querySelectorAll('.viewer-solution')).toHaveLength(2);
  });

  it('a 429 mid-group reads as partial, never as failure (OV#15)', async () => {
    const { container } = setup(docOfSections([false, false], 'free'), {
      'sec-1': new CheckError('rate_limited', 'too quick', 429),
    });
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(screen.getByText('Checked 1 of 2 — one part didn’t send.')).toBeTruthy();
    expect(
      container.querySelector('.viewer-check-group')!.getAttribute('data-group-phase'),
    ).toBe('partial');
  });
});

// -----------------------------------------------------------------------------
// GUARD 10 — locked + a crashed gradable block
// -----------------------------------------------------------------------------
const Exploding: ComponentType<BlockComponentProps> = () => {
  throw new Error('block component blew up');
};

describe('guard 10 — `locked` never fires around a crashed gradable block (T4)', () => {
  it('the button is disabled, no RPC fires, and nothing freezes', async () => {
    const { container, service: svc } = setup(
      docOfSections([true, false], 'locked'),
      {},
      { resolveComponent: () => Exploding },
    );
    const button = checkButtons(container)[0]!;
    expect(button.disabled).toBe(true);
    expect(screen.getAllByText('One question can’t be checked yet.').length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(button);
    });
    expect(svc.calls).toHaveLength(0);
    expect(inputsOf(container)[0]!.disabled).toBe(false);
  });

  it('`free` keeps fire-then-report — the student can check again once it recovers', async () => {
    const { container, service: svc } = setup(
      docOfSections([true, false], 'free'),
      {},
      { resolveComponent: () => Exploding },
    );
    const button = checkButtons(container)[0]!;
    expect(button.disabled).toBe(false);
    await act(async () => {
      fireEvent.click(button);
    });
    expect(svc.calls.map((c) => c.sectionId)).toEqual(['sec-0']);
    expect(container.querySelector('.viewer-section__shortfall')).not.toBeNull();
  });
});

// -----------------------------------------------------------------------------
// F9b — the D2 copy table, one assertion per state string
// -----------------------------------------------------------------------------
describe('F9b — the five new sentences, pinned verbatim', () => {
  it('group checked, `free`: “Checked.”', async () => {
    const { container } = setup(docOfSections([true], 'free'));
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(screen.getByText('Checked.')).toBeTruthy();
  });

  it('group checked, `locked`: states the irreversibility once, when it becomes true', async () => {
    const { container } = setup(docOfSections([true], 'locked'));
    await pressCheck(groupsOf(container)[0]!);
    expect(
      screen.getByText('Checked and locked. You can’t change these answers.'),
    ).toBeTruthy();
  });

  it('lock refused: “Already checked and locked.” and NEVER “try again”', async () => {
    const { container } = setup(docOfSections([true], 'locked'), {
      'sec-0': new CheckError('locked', 'already locked', 409),
    });
    await pressCheck(groupsOf(container)[0]!);
    const status = container.querySelector('.viewer-section__status')!;
    expect(status.textContent).toBe('Already checked and locked.');
    expect(status.textContent).not.toMatch(/try again/i);
  });

  it('partial group: names what is pending', async () => {
    const { container } = setup(docOfSections([false, false], 'free'), {
      'sec-1': new CheckError('server_error', 'x', 500),
    });
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(screen.getByText('Checked 1 of 2 — one part didn’t send.')).toBeTruthy();
  });

  it('partial group, more than one missing: pluralises', async () => {
    const { container } = setup(docOfSections([false, false, false], 'free'), {
      'sec-1': new CheckError('server_error', 'x', 500),
      'sec-2': new CheckError('server_error', 'x', 500),
    });
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(screen.getByText('Checked 1 of 3 — 2 parts didn’t send.')).toBeTruthy();
  });

  it('locked + crashed block: “One question can’t be checked yet.”', () => {
    const { container } = setup(
      docOfSections([true], 'locked'),
      {},
      { resolveComponent: () => Exploding },
    );
    expect(container.querySelector('.viewer-section__status')!.textContent).toBe(
      'One question can’t be checked yet.',
    );
  });

  it('offline press, `locked`: the freeze is stated first', async () => {
    const { container } = setup(docOfSections([true], 'locked'), {
      'sec-0': new CheckError('offline', 'no network'),
    });
    await pressCheck(groupsOf(container)[0]!);
    expect(
      screen.getByText('Locked. Will check when you’re back online.'),
    ).toBeTruthy();
    expect(inputsOf(container)[0]!.disabled).toBe(true);
  });

  it('offline press, `free`: the pre-slice sentence, unchanged', async () => {
    const { container } = setup(docOfSections([true], 'free'), {
      'sec-0': new CheckError('offline', 'no network'),
    });
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(screen.getByText('Will check when you’re back online.')).toBeTruthy();
  });
});

// -----------------------------------------------------------------------------
// D6 — focus and announcement on freeze
// -----------------------------------------------------------------------------
describe('D6 — a frozen group announces itself and keeps the keyboard’s place', () => {
  it('the status region is focusable and polite', () => {
    const { container } = setup(docOfSections([true], 'locked'));
    const status = container.querySelector('.viewer-section__status')!;
    expect(status.getAttribute('tabindex')).toBe('-1');
    expect(status.getAttribute('aria-live')).toBe('polite');
  });

  it('freezing moves focus to it — disabling the fieldset would drop focus to the body', async () => {
    const { container } = setup(docOfSections([true], 'locked'));
    await pressCheck(groupsOf(container)[0]!);
    expect(document.activeElement).toBe(
      container.querySelector('.viewer-section__status'),
    );
  });

  it('`free` does not steal focus — nothing became irreversible', async () => {
    const { container } = setup(docOfSections([true], 'free'));
    await act(async () => {
      fireEvent.click(checkButtons(container)[0]!);
    });
    expect(document.activeElement).not.toBe(
      container.querySelector('.viewer-section__status'),
    );
  });
});
