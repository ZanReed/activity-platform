/**
 * @vitest-environment jsdom
 */
// =============================================================================
// feedback.test.ts — the student-facing manual-feedback sidecar
// -----------------------------------------------------------------------------
// The sidecar reads the stored submission_id + config, POSTs to get-feedback,
// and fills each `.free-text-feedback` mount point when graded. fetch is mocked;
// asserts the DOM the sidecar builds (via textContent, no innerHTML).
// =============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { run } from '../feedback.js';

const ACTIVITY = '11111111-1111-4111-8111-111111111111';
const SUB = '22222222-2222-4222-8222-222222222222';

function setup(html: string, opts: { withConfig?: boolean; withId?: boolean } = {}) {
  document.body.innerHTML = html;
  if (opts.withConfig !== false) {
    const cfg = document.createElement('script');
    cfg.id = 'activity-config';
    cfg.type = 'application/json';
    cfg.textContent = JSON.stringify({
      activityId: ACTIVITY,
      feedbackEndpoint: 'https://example.com/functions/v1/get-feedback',
    });
    document.body.appendChild(cfg);
  }
  if (opts.withId !== false) {
    localStorage.setItem('activity_submission_id_' + ACTIVITY, SUB);
  }
}

function container(blockId: string): string {
  return `<div class="free-text-feedback" data-for-block="${blockId}" hidden></div>`;
}

// Resolve microtasks so the fetch .then chain settles.
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});
afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(payload: unknown, ok = true) {
  const fn = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(payload),
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('feedback sidecar', () => {
  it('no-ops when there are no feedback containers (no fetch)', async () => {
    setup('<p>nothing gradable</p>');
    const fetchFn = mockFetch({ graded: true, blocks: [] });
    run();
    await flush();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('no-ops when no submission_id is stored', async () => {
    setup(container('b1'), { withId: false });
    const fetchFn = mockFetch({ graded: true, blocks: [] });
    run();
    await flush();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('no-ops when the config has no feedbackEndpoint', async () => {
    document.body.innerHTML = container('b1');
    const cfg = document.createElement('script');
    cfg.id = 'activity-config';
    cfg.type = 'application/json';
    cfg.textContent = JSON.stringify({ activityId: ACTIVITY }); // no endpoint
    document.body.appendChild(cfg);
    localStorage.setItem('activity_submission_id_' + ACTIVITY, SUB);
    const fetchFn = mockFetch({ graded: true, blocks: [] });
    run();
    await flush();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('POSTs the submission_id and leaves containers hidden when ungraded', async () => {
    setup(container('b1'));
    const fetchFn = mockFetch({ graded: false, blocks: [] });
    run();
    await flush();
    expect(fetchFn).toHaveBeenCalledOnce();
    const [, opts] = fetchFn.mock.calls[0]!;
    expect(JSON.parse(opts.body)).toEqual({ submission_id: SUB });
    expect(document.querySelector('.free-text-feedback')!.hasAttribute('hidden')).toBe(true);
  });

  it('fills + reveals the matching container when graded', async () => {
    setup(container('b1') + container('b2'));
    mockFetch({
      graded: true,
      gradedAt: '2026-07-13T00:00:00Z',
      blocks: [
        {
          blockId: 'b1',
          criteria: [
            { label: 'Thesis', maxPoints: 4, earned: 3, feedback: 'Clear.' },
            { label: 'Evidence', maxPoints: 6 }, // unscored → em dash
          ],
          generalFeedback: 'Nice work.',
        },
      ],
    });
    run();
    await flush();

    const b1 = document.querySelector(
      '.free-text-feedback[data-for-block="b1"]',
    ) as HTMLElement;
    const b2 = document.querySelector(
      '.free-text-feedback[data-for-block="b2"]',
    ) as HTMLElement;
    // b1 graded → revealed + rendered; b2 not in payload → still hidden.
    expect(b1.hasAttribute('hidden')).toBe(false);
    expect(b2.hasAttribute('hidden')).toBe(true);
    expect(b1.textContent).toContain('Thesis');
    expect(b1.textContent).toContain('3 / 4');
    expect(b1.textContent).toContain('Clear.');
    expect(b1.textContent).toContain('— / 6'); // unscored criterion
    expect(b1.textContent).toContain('Nice work.');
  });

  it('renders feedback via textContent (no HTML injection)', async () => {
    setup(container('b1'));
    mockFetch({
      graded: true,
      blocks: [
        {
          blockId: 'b1',
          criteria: [{ label: 'X', maxPoints: 2, earned: 1 }],
          generalFeedback: '<img src=x onerror=alert(1)>',
        },
      ],
    });
    run();
    await flush();
    const b1 = document.querySelector('.free-text-feedback[data-for-block="b1"]')!;
    expect(b1.querySelector('img')).toBeNull(); // injected as text, not markup
    expect(b1.textContent).toContain('<img src=x onerror=alert(1)>');
  });
});
