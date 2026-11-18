// =============================================================================
// photoGrading.test.ts — the student's side of a graded photo (media
// submissions slice 3, MS-18): a re-check that sends NEW photos for an answer
// with released feedback re-reads that feedback, because 0096 makes the
// server's `stale` flag compare photo ids too. Without the re-read the card
// kept "Reviewed by your teacher" over photos the teacher never saw, until a
// reload (the text half is exemplars.test.tsx's "a re-check re-reads").
// =============================================================================

import { describe, expect, it, vi } from 'vitest';
import { createViewerStore } from '../src/store/store.js';
import { createMockCheckService } from '../src/check/mock.js';

const PB = 'cccccccc-0000-4000-8000-0000000000aa';
const FEEDBACK = {
  criteria: [{ criterionId: 'c1', earned: 2, maxPoints: 2 }],
  attemptNumber: 1,
  activityVersionId: 'v1',
  stale: false,
  hasGrader: true,
};

function setUp() {
  const service = createMockCheckService({ verdicts: { [PB]: 'recorded' } } as never);
  const reads = vi.fn(async () => ({ graded: true, blocks: { [PB]: FEEDBACK } }));
  service.fetchReleasedFeedback = reads;
  const store = createViewerStore({ userId: 'u', activityId: 'a', versionId: 'v1', checkService: service });
  return { store, reads };
}

describe('a photo answer with released feedback', () => {
  it('a re-check of its photos re-reads the feedback (staleness now includes photos)', async () => {
    const { store, reads } = setUp();
    await store.loadReleasedFeedback();
    expect(reads).toHaveBeenCalledTimes(1);
    store.setPhotos(PB, [{ id: '99999999-9999-4999-8999-000000000002' }]);
    await store.checkSection('s1', { photos: [PB] });
    await vi.waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
  });

  it('a check that does not touch the photo answer makes no extra read', async () => {
    const { store, reads } = setUp();
    await store.loadReleasedFeedback();
    await store.checkSection('s1', { freeText: [] });
    await new Promise((r) => setTimeout(r, 10));
    expect(reads).toHaveBeenCalledTimes(1);
  });
});
