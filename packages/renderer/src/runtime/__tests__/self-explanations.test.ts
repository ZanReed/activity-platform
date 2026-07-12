/**
 * @vitest-environment jsdom
 */
// =============================================================================
// self-explanations.test.ts — ungraded free-text capture
// -----------------------------------------------------------------------------
// buildRefs discovers self_explanation blocks (document-wide, no section
// membership); wireSelfExplanations persists on input; gatherFreeResponses
// builds the payload map, trimming and omitting empty responses.
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildRefs } from '../init.js';
import { wireSelfExplanations, gatherFreeResponses } from '../self-explanations.js';

function block(id: string): string {
  return (
    '<div class="block block-self-explanation" data-block-category="question"' +
    ' data-block-type="self_explanation" data-block-id="' + id + '">' +
    '<div class="block-self-explanation__prompt">Explain.</div>' +
    '<textarea class="self-explanation-input" data-for-block="' + id + '"></textarea>' +
    '</div>'
  );
}

const CONFIG =
  '<script id="activity-config" type="application/json">' +
  JSON.stringify({
    activityId: '11111111-1111-1111-1111-111111111111',
    versionNum: 1,
    submissionEndpoint: 'https://example.com/submit',
    submissionMode: 'free',
    revisionMode: 'free',
    gradingMode: 'auto',
  }) +
  '</script>';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('self-explanation capture', () => {
  it('discovers self_explanation blocks and their textareas', () => {
    document.body.innerHTML = CONFIG + block('se-1') + block('se-2');
    const refs = buildRefs();
    expect(refs.selfExplanations.size).toBe(2);
    expect(refs.selfExplanations.get('se-1')?.textarea).toBeInstanceOf(
      HTMLTextAreaElement,
    );
  });

  it('gathers non-empty trimmed responses; omits empty ones', () => {
    document.body.innerHTML = CONFIG + block('se-1') + block('se-2');
    const refs = buildRefs();
    refs.selfExplanations.get('se-1')!.textarea.value = '  I isolated x.  ';
    refs.selfExplanations.get('se-2')!.textarea.value = '   '; // whitespace only
    const gathered = gatherFreeResponses(refs);
    expect(gathered).toEqual({ 'se-1': { text: 'I isolated x.' } });
  });

  it('returns undefined when nothing was written (stays out of the payload)', () => {
    document.body.innerHTML = CONFIG + block('se-1');
    const refs = buildRefs();
    expect(gatherFreeResponses(refs)).toBeUndefined();
  });

  it('persists on input via onUpdate', () => {
    document.body.innerHTML = CONFIG + block('se-1');
    const refs = buildRefs();
    const onUpdate = vi.fn();
    wireSelfExplanations(refs, onUpdate);
    const textarea = refs.selfExplanations.get('se-1')!.textarea;
    textarea.value = 'because';
    textarea.dispatchEvent(new Event('input'));
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});
