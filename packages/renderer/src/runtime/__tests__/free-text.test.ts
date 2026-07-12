/**
 * @vitest-environment jsdom
 */
// =============================================================================
// free-text.test.ts — shared free-text capture (self_explanation / short_answer
// / essay)
// -----------------------------------------------------------------------------
// buildRefs discovers every `.free-text-input` textarea (document-wide, no
// section membership); wireFreeText persists on input and refreshes an essay's
// word counter; gatherFreeResponses builds the payload map, trimming and
// omitting empty responses; countWords is the shared compute-on-read rule.
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildRefs } from '../init.js';
import { wireFreeText, gatherFreeResponses, countWords } from '../free-text.js';

// A free-text block. `type` picks the block-type; pass a counter object to add
// the essay word counter (optionally with min/max targets).
function block(
  id: string,
  type: 'self_explanation' | 'short_answer' | 'essay' = 'short_answer',
  counter?: { min?: number; max?: number },
): string {
  const min = counter?.min !== undefined ? ` data-word-min="${counter.min}"` : '';
  const max = counter?.max !== undefined ? ` data-word-max="${counter.max}"` : '';
  const counterEl = counter
    ? `<div class="free-text-wordcount" data-for-block="${id}"${min}${max}></div>`
    : '';
  return (
    `<div class="block block-free-response" data-block-category="question"` +
    ` data-block-type="${type}" data-block-id="${id}">` +
    `<div class="block-free-response__prompt">Explain.</div>` +
    `<textarea class="free-text-input" data-for-block="${id}"></textarea>` +
    counterEl +
    `</div>`
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

describe('countWords', () => {
  it('counts whitespace-separated runs; empty/whitespace → 0', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
    expect(countWords('one')).toBe(1);
    expect(countWords('  two  words ')).toBe(2);
    expect(countWords('a\nb\tc   d')).toBe(4);
  });
});

describe('free-text capture', () => {
  it('discovers every .free-text-input across the three block types', () => {
    document.body.innerHTML =
      CONFIG +
      block('se-1', 'self_explanation') +
      block('sa-1', 'short_answer') +
      block('es-1', 'essay', {});
    const refs = buildRefs();
    expect(refs.freeText.size).toBe(3);
    expect(refs.freeText.get('sa-1')?.textarea).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('parses an essay word-count target off the counter element', () => {
    document.body.innerHTML = CONFIG + block('es-1', 'essay', { min: 200, max: 300 });
    const ref = buildRefs().freeText.get('es-1')!;
    expect(ref.wordCountEl).not.toBeNull();
    expect(ref.wordMin).toBe(200);
    expect(ref.wordMax).toBe(300);
  });

  it('gathers non-empty trimmed responses; omits empty ones', () => {
    document.body.innerHTML = CONFIG + block('sa-1') + block('sa-2');
    const refs = buildRefs();
    refs.freeText.get('sa-1')!.textarea.value = '  I isolated x.  ';
    refs.freeText.get('sa-2')!.textarea.value = '   '; // whitespace only
    expect(gatherFreeResponses(refs)).toEqual({ 'sa-1': { text: 'I isolated x.' } });
  });

  it('returns undefined when nothing was written', () => {
    document.body.innerHTML = CONFIG + block('sa-1');
    expect(gatherFreeResponses(buildRefs())).toBeUndefined();
  });

  it('persists on input and updates the essay counter with range colouring', () => {
    document.body.innerHTML = CONFIG + block('es-1', 'essay', { min: 2, max: 4 });
    const refs = buildRefs();
    const onUpdate = vi.fn();
    wireFreeText(refs, onUpdate);
    const ref = refs.freeText.get('es-1')!;

    ref.textarea.value = 'one two three'; // 3 words → in range
    ref.textarea.dispatchEvent(new Event('input'));
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(ref.wordCountEl!.textContent).toContain('3 words');
    expect(ref.wordCountEl!.textContent).toContain('aim for 2–4');
    expect(ref.wordCountEl!.classList.contains('in-range')).toBe(true);

    ref.textarea.value = 'one two three four five'; // 5 → over target
    ref.textarea.dispatchEvent(new Event('input'));
    expect(ref.wordCountEl!.classList.contains('out-of-range')).toBe(true);
  });
});
