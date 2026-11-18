// @vitest-environment jsdom
// =============================================================================
// workPhotos.test.tsx — students' photos in the teacher's Responses queue
// (media submissions slice 3). Storage and the state RPC are faked at the lib
// boundary; their server half is verify-0096 (states, release clock, stale)
// and verify-0094 / the Storage e2e (who may read the bytes).
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({
  sign: vi.fn(),
  states: vi.fn(),
}));
vi.mock('../lib/workPhotos', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/workPhotos')>()),
  signWorkPhotos: h.sign,
  fetchPhotoStates: h.states,
}));

import { WorkPhotoCount } from '../components/WorkPhotos';
import WorkPhotoStrip, { RESIGN_MS, WorkPhotoViewer, unavailablePhotoText, viewerGeometry } from '../components/WorkPhotoViewer';
import { workPhotoObjectName } from '../lib/workPhotos';
import type { GradingQueueRow } from '../lib/grading';

const ACT = 'aaaaaaaa-0000-4000-8000-000000000001';
const P1 = '11111111-0000-4000-8000-000000000001';
const P2 = '11111111-0000-4000-8000-000000000002';
const P3 = '11111111-0000-4000-8000-000000000003';

function row(over: Partial<GradingQueueRow> = {}): GradingQueueRow {
  return {
    check_id: 'chk-1', student_id: 'stu-1', student_label: 'maya@school.example', in_your_class: true,
    activity_version_id: 'v1', version_num: 1, is_current: true, section_id: 's1', block_id: 'b1',
    block_type: 'photo_response', response_text: null, response_photos: [{ id: P1 }, { id: P2 }],
    attempt_number: 1, checked_at: '2026-11-18T00:00:00Z', graded: false, criteria: null,
    general_feedback: null, graded_at: null, released_at: null, has_grader: true, stale: false,
    ...over,
  };
}

function Harness({ rows }: { rows: GradingQueueRow[] }) {
  return (
    <>
      {rows.map((r) => (
        <div key={r.check_id + r.block_id}>
          <WorkPhotoCount row={r} />
          <WorkPhotoStrip row={r} activityId={ACT} />
        </div>
      ))}
    </>
  );
}

beforeEach(() => {
  h.sign.mockReset();
  h.states.mockReset();
  h.sign.mockImplementation(async (keys: { photoId: string }[]) =>
    Object.fromEntries(keys.map((k) => [k.photoId, `https://storage.test/${k.photoId}`])),
  );
  h.states.mockImplementation(async (_a: string, ids: string[]) => Object.fromEntries(ids.map((id) => [id, 'ok'])));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('an open photo answer signs only its own photos', () => {
  it('one sign call per open answer, with the right Storage keys; text rows sign nothing', async () => {
    render(
      <Harness
        rows={[
          row(),
          row({ check_id: 'chk-3', block_type: 'short_answer', response_photos: null, response_text: 'x' }),
        ]}
      />,
    );
    await screen.findAllByRole('button', { name: /Open photo/ });
    expect(h.sign).toHaveBeenCalledTimes(1);
    expect(h.sign.mock.calls[0]![0]).toEqual([
      { activityId: ACT, studentId: 'stu-1', photoId: P1 },
      { activityId: ACT, studentId: 'stu-1', photoId: P2 },
    ]);
    expect(h.states).toHaveBeenCalledWith(ACT, [P1, P2]);
    expect(workPhotoObjectName({ activityId: ACT, studentId: 'stu-2', photoId: P3 })).toBe(`${ACT}/stu-2/${P3}.jpg`);
    expect(screen.getByText('2 photos')).toBeTruthy();
  });

  it('re-signs before the 10-minute URLs lapse', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<Harness rows={[row()]} />);
    await waitFor(() => expect(h.sign).toHaveBeenCalledTimes(1));
    await act(async () => { vi.advanceTimersByTime(RESIGN_MS); });
    await waitFor(() => expect(h.sign).toHaveBeenCalledTimes(2));
    expect(RESIGN_MS).toBeLessThan(10 * 60 * 1000);
  });
});

describe('a photo the teacher cannot see says why', () => {
  it('changed after hand-in, removed after release, removed at year end', async () => {
    h.sign.mockImplementation(async () => ({ [P1]: null, [P2]: null }));
    h.states.mockImplementation(async () => ({ [P1]: 'changed', [P2]: 'removed' }));
    render(<Harness rows={[row()]} />);
    expect(await screen.findByText(unavailablePhotoText('changed', null))).toBeTruthy();
    expect(screen.getByText(unavailablePhotoText('removed', null))).toBeTruthy();
    expect(unavailablePhotoText('removed', '2026-11-01T00:00:00Z')).toBe('Photo removed 30 days after the grade was released.');
    expect(unavailablePhotoText('removed', null)).toBe('Photo removed at the end of the school year.');
    expect(unavailablePhotoText('changed', '2026-11-01T00:00:00Z')).toMatch(/changed after it was handed in/);
    // Gone already when the check was made (a 7-day unattached photo):
    // never "end of the school year" (Fable review).
    expect(unavailablePhotoText('removed', null, true)).toBe('This photo was no longer stored when it was handed in.');
    // The server says ok but no URL came back: no reason that may be untrue.
    expect(unavailablePhotoText('ok', null)).toMatch(/can’t be shown right now/);
    expect(unavailablePhotoText(undefined, '2026-11-01T00:00:00Z')).toMatch(/can’t be shown right now/);
    expect(document.querySelector('[data-photo-state="changed"]')).not.toBeNull();
  });

  it('a failed read says so once, not as blank tiles', async () => {
    h.sign.mockRejectedValue(new Error('down'));
    render(<Harness rows={[row()]} />);
    expect(await screen.findByText(/couldn’t be loaded/)).toBeTruthy();
  });
});

describe('the full-size view', () => {
  it('opens, rotates the VIEW only, zooms, pages, and closes with Escape back to its thumbnail', async () => {
    render(<Harness rows={[row()]} />);
    const thumb = await screen.findByRole('button', { name: 'Open photo 1 full size' });
    thumb.focus();
    fireEvent.click(thumb);
    const dialog = screen.getByRole('dialog', { name: 'Photo 1 of 2' });
    const img = () => dialog.querySelector('img') as HTMLImageElement;
    expect(img().src).toBe(`https://storage.test/${P1}`);
    fireEvent.click(screen.getByRole('button', { name: 'Rotate right' }));
    expect(img().dataset.turns).toBe('1');
    expect(img().style.transform).toBe('rotate(90deg)');
    fireEvent.click(screen.getByRole('button', { name: 'Rotate left' }));
    fireEvent.click(screen.getByRole('button', { name: 'Rotate left' }));
    expect(img().dataset.turns).toBe('3');
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(img().dataset.zoom).toBe('1.5');
    fireEvent.click(screen.getByRole('button', { name: 'Next photo' }));
    expect(screen.getByRole('dialog', { name: 'Photo 2 of 2' })).toBeTruthy();
    expect(img().dataset.turns).toBe('0'); // a new photo starts upright
    // The stored photo is never touched: nothing was written.
    expect(h.sign).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(thumb);
  });
});

describe('the viewer geometry (Fable review)', () => {
  it('fits at zoom 1, and zoom ENLARGES even a photo smaller than the room', () => {
    const fit = viewerGeometry({ w: 400, h: 300 }, { w: 1200, h: 900 }, 0, 1);
    expect(fit.img).toEqual({ w: 1200, h: 900 });
    const zoomed = viewerGeometry({ w: 400, h: 300 }, { w: 1200, h: 900 }, 0, 2);
    expect(zoomed.img).toEqual({ w: 2400, h: 1800 });
  });

  it('a quarter turn lays the photo out sideways: its box swaps sides so it scrolls as seen', () => {
    const g = viewerGeometry({ w: 3000, h: 4000 }, { w: 1000, h: 800 }, 1, 1);
    // seen 4000 wide × 3000 tall → fits to 1000/4000 = 0.25 (800/3000 is larger)
    expect(g.img).toEqual({ w: 750, h: 1000 });
    expect(g.box).toEqual({ w: 1000, h: 750 });
    expect(viewerGeometry({ w: 3000, h: 4000 }, { w: 1000, h: 800 }, -3, 1).box).toEqual(g.box);
  });

  it('Tab stays inside the dialog, and a shortened list never shows past its end', () => {
    const onClose = vi.fn();
    const { rerender } = render(<WorkPhotoViewer urls={['a', 'b']} start={1} onClose={onClose} />);
    const close = screen.getByRole('button', { name: 'Close' });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
    rerender(<WorkPhotoViewer urls={['a']} start={1} onClose={onClose} />);
    expect(screen.getByRole('dialog', { name: 'Photo 1 of 1' })).toBeTruthy();
  });
});
