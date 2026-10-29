// =============================================================================
// dol-retake.test.tsx — the student's DoL, bound to RENDERED OUTPUT (D65)
// -----------------------------------------------------------------------------
// docs/design/dol-retake.md DL-8/9, DE-1, DE-2, DE-14. What a student sees on
// each served state, and what the store sends: the try N of M button and its
// confirm; the frozen section between attempts with the copy for the next day
// (and for a rubric primary, the mark); a retake that starts empty; "Passed."
// =============================================================================

import { describe, expect, it } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { ViewerContainer, createViewerStore } from '../../src/index.js';
import type {
  CheckRequest,
  CheckService,
  SanitizedActivityDocument,
  SectionCheckResult,
} from '../../src/index.js';
import { sanitizedFixtureDocument } from '../../src/fixtures/index.js';
import type { DolServedState } from '../../src/sanitize/dolForm.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const fullDoc = sanitizedFixtureDocument();
const shortAnswer = fullDoc.sections
  .flatMap((s) => s.rows).flatMap((r) => r.columns).flatMap((c) => c.blocks)
  .find((b) => (b as { type?: string }).type === 'short_answer')!;

function dolDoc(dol: DolServedState): SanitizedActivityDocument {
  return {
    ...fullDoc,
    meta: { ...fullDoc.meta, submissionMode: 'free' },
    sections: [{
      id: 'dol-sec',
      title: 'Check for understanding',
      isCheckpoint: true,
      dol,
      rows: [{ id: 'r', gridLines: 'inherit', columns: [{ id: 'c', blocks: [{ ...(shortAnswer as object), id: 'blk-dol' }] }] }],
    }],
  } as unknown as SanitizedActivityDocument;
}

const state = (over: Partial<DolServedState> = {}): DolServedState => ({
  allowance: 2, attempts: 0, form: 1, retakeOpen: false, passed: false, markFirst: false, practiceAvailable: false, ...over,
});

function service(result: Partial<SectionCheckResult> = {}) {
  const calls: CheckRequest[] = [];
  const svc: CheckService & { calls: CheckRequest[] } = {
    calls,
    async checkSection(request) {
      calls.push(request);
      return {
        wireVersion: request.wireVersion, sectionId: request.sectionId, items: {}, solutions: {},
        dol: { attempts: request.form ?? 1, allowance: 2, passed: false },
        ...result,
      } as SectionCheckResult;
    },
    async fetchReleasedFeedback() { return { graded: false, blocks: {} }; },
  };
  return svc;
}

function setup(dol: DolServedState, svc = service(), hydrate?: (store: ReturnType<typeof createViewerStore>) => void) {
  const store = createViewerStore({ userId: TEST_USER_ID, activityId: ACTIVITY, versionId: VERSION, checkService: svc });
  hydrate?.(store);
  const utils = render(<ViewerContainer document={dolDoc(dol)} store={store} versionId={VERSION} />);
  return { ...utils, store, svc };
}

const button = (c: HTMLElement) =>
  c.querySelector<HTMLButtonElement>('.viewer-section__check:not(.viewer-check-group__confirm-fire)');
const status = (c: HTMLElement) => c.querySelector('.viewer-section__status')?.textContent ?? '';
const inputsDisabled = (c: HTMLElement) =>
  c.querySelector<HTMLFieldSetElement>('.viewer-section__inputs')?.disabled === true;

describe('the DoL on screen (D65)', () => {
  it('form 1: "try 1 of 2", a confirm that names the try and the blanks, and the form is sent', async () => {
    const { container, svc } = setup(state());
    expect(button(container)!.textContent).toBe('Check — try 1 of 2');
    await act(async () => { fireEvent.click(button(container)!); });
    const text = container.querySelector('.viewer-check-group__confirm-text')!.textContent!;
    expect(text).toContain('This is try 1 of 2.');
    expect(text).toContain('One question is still blank.');
    await act(async () => { fireEvent.click(container.querySelector('.viewer-check-group__confirm-fire')!); });
    expect(svc.calls[0]!.form).toBe(1);
    // After a failed attempt 1 with a retake left: frozen, no button, the
    // next-day copy.
    expect(button(container)).toBeNull();
    expect(inputsDisabled(container)).toBe(true);
    expect(status(container)).toBe('Checked. You can try a new version on your next practice day.');
  });

  it('served frozen (attempt 1 recorded, retake not open): no button, inputs disabled, the copy; a rubric primary names the mark', () => {
    const a = setup(state({ attempts: 1, form: 1 }));
    expect(button(a.container)).toBeNull();
    expect(inputsDisabled(a.container)).toBe(true);
    expect(status(a.container)).toBe('Checked. You can try a new version on your next practice day.');
    a.unmount();
    const b = setup(state({ attempts: 1, form: 1, markFirst: true }));
    expect(status(b.container)).toBe('Checked. You can try a new version once your teacher has marked this, on a later day.');
  });

  it('form 2 (the retake): a fresh start — earlier answers and verdicts cleared, "try 2 of 2"', () => {
    const { container, store } = setup(state({ attempts: 1, form: 2, retakeOpen: true }), service(), (s) => {
      // The buffer from yesterday: form 1's answer and its checked result.
      s.setFreeText('blk-dol', 'yesterday’s answer');
      (s as unknown as { hydrate: (raw: string) => boolean }).hydrate(JSON.stringify({
        ...JSON.parse(s.serialize()),
        checked: { 'dol-sec': { wireVersion: 3, sectionId: 'dol-sec', items: {}, solutions: {}, dol: { attempts: 1, allowance: 2, passed: false } } },
      }));
    });
    expect(store.getState().responses.freeText['blk-dol']).toBeUndefined();
    expect(store.getState().sections['dol-sec']).toBeUndefined();
    expect(button(container)!.textContent).toBe('Check — try 2 of 2');
    expect(inputsDisabled(container)).toBe(false);
  });

  it('passed: "Passed." and frozen', () => {
    const { container } = setup(state({ attempts: 1, form: 1, passed: true }));
    expect(status(container)).toBe('Passed.');
    expect(button(container)).toBeNull();
    expect(inputsDisabled(container)).toBe(true);
  });

  it('the last try: "That was your last try."', async () => {
    const { container } = setup(state({ attempts: 1, form: 2, retakeOpen: true }), service());
    await act(async () => { fireEvent.click(button(container)!); });
    await act(async () => { fireEvent.click(container.querySelector('.viewer-check-group__confirm-fire')!); });
    expect(status(container)).toBe('Checked. That was your last try.');
  });
});

describe('targeted practice offer (D65 slice 2, TP-1/TP-6)', () => {
  const offer = (c: HTMLElement) => c.querySelector<HTMLButtonElement>('.viewer-dol__practice');
  function setupWith(dol: DolServedState, onDolPractice?: () => void) {
    const store = createViewerStore({ userId: TEST_USER_ID, activityId: ACTIVITY, versionId: VERSION, checkService: service() });
    return render(<ViewerContainer document={dolDoc(dol)} store={store} versionId={VERSION} onDolPractice={onDolPractice} />);
  }

  it('shows between the tries when there is something to practise, and calls the host', () => {
    let opened = 0;
    const { container } = setupWith(state({ attempts: 1, form: 1, practiceAvailable: true }), () => { opened += 1; });
    expect(offer(container)!.textContent).toBe('Practise this skill first');
    fireEvent.click(offer(container)!);
    expect(opened).toBe(1);
    // It is not a Check button (no guard counting those counts it).
    expect(button(container)).toBeNull();
  });

  it.each([
    ['nothing to practise', state({ attempts: 1, form: 1, practiceAvailable: false })],
    ['before the first try', state({ attempts: 0, form: 1, practiceAvailable: true })],
    ['passed', state({ attempts: 1, form: 1, passed: true, practiceAvailable: true })],
    ['the retake used', state({ attempts: 2, form: 2, retakeOpen: true, practiceAvailable: true })],
    ['no retake at all', state({ allowance: 1, attempts: 1, form: 1, practiceAvailable: true })],
  ])('is absent: %s', (_label, dol) => {
    const { container } = setupWith(dol, () => {});
    expect(offer(container)).toBeNull();
  });

  it('is absent when the host does not route it (print, the teacher preview)', () => {
    const { container } = setupWith(state({ attempts: 1, form: 1, practiceAvailable: true }));
    expect(offer(container)).toBeNull();
  });
});
