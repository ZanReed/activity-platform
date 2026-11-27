// @vitest-environment jsdom
// =============================================================================
// photo-handoff-panel.test.tsx — "Use my phone" on the Chromebook (media
// submissions slice 2c, §4.1). The RPCs are faked at the seam; their server
// half is verify-0095, and the function end to end is verify-student-work-e2e.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

const upload = vi.hoisted(() => ({
  discardPhoto: vi.fn(async () => undefined),
  signPhotos: vi.fn(async (_a: string, ids: readonly string[]) =>
    Object.fromEntries(ids.map((id) => [id, `https://storage.test/${id}`])),
  ),
  photosEnabled: vi.fn(async () => true),
}));
vi.mock('../../src/blocks/photoUpload.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../src/blocks/photoUpload.js')>();
  return { ...real, ...upload };
});

import PhotoHandoffPanel, { GRACE_MS, HANDOFF_INTRO, POLL_MS, handoffRefusalText } from '../../src/blocks/PhotoHandoffPanel.js';
import PhotoResponse, { USE_PHONE_LABEL } from '../../src/blocks/PhotoResponse.js';
import { PHOTO_HANDOFF_PATH, setPhotoLink, type PhotoClient } from '../../src/blocks/photoLinkSeam.js';
import { ViewerProvider } from '../../src/container/context.js';
import { createViewerStore } from '../../src/store/store.js';
import { createMockCheckService } from '../../src/check/mock.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const BLOCK = 'cccccccc-0000-4000-8000-000000000001';
const HANDOFF = 'dddddddd-0000-4000-8000-000000000001';
const CODE = 'Q'.repeat(42) + '_';
const P1 = '99999999-9999-4999-8999-999999999991';
const P2 = '99999999-9999-4999-8999-999999999992';

type Rpc = (name: string, args: Record<string, string | number>) => Promise<{ data: unknown; error: unknown }>;

let status: { photos: string[]; slots_left: number; live: boolean };
let calls: Array<[string, Record<string, string | number>]>;
let startResult: { data: unknown; error: unknown };

/** Like supabase-js: the call is SENT (recorded) only when something calls
 *  `then` on the builder. A bare `void client.rpc(…)` sends nothing — the bug
 *  the e2e caught; this fake makes the unit tests catch it too. */
function lazy(rpc: Rpc) {
  return (name: string, args: Record<string, string | number>): PromiseLike<{ data: unknown; error: unknown }> => ({
    then: (ok, bad) => rpc(name, args).then(ok, bad),
  });
}

function seam(rpc?: Rpc) {
  setPhotoLink({
    client: {
      rpc: lazy(
        rpc ??
        (async (name, args) => {
          calls.push([name, args]);
          if (name === 'start_photo_handoff') return startResult;
          if (name === 'photo_handoff_status') return { data: status, error: null };
          return { data: null, error: null };
        })) as unknown as PhotoClient['rpc'], // a fake: it need not match the seam's generic, schema-typed signature
      auth: { getSession: async () => ({ data: { session: null } }) },
    },
    storageBase: () => 'https://storage.test/storage/v1',
    anonKey: () => 'anon',
  });
}

function store(initial: string[] = []) {
  const s = createViewerStore({
    userId: 'student-1',
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: createMockCheckService() as never,
  });
  if (initial.length) s.setPhotos(BLOCK, initial.map((id) => ({ id })));
  return s;
}

const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: false });
  calls = [];
  status = { photos: [], slots_left: 2, live: true };
  startResult = {
    data: { id: HANDOFF, code: CODE, expires_at: new Date(Date.now() + 600_000).toISOString(), slots: 2 },
    error: null,
  };
  upload.discardPhoto.mockClear();
  seam();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  setPhotoLink(null);
});

describe('the QR panel', () => {
  it('starts a code for the room left, and shows a QR of {origin}/h#code with the privacy line', async () => {
    const s = store([P1]);
    render(<PhotoHandoffPanel store={s} blockId={BLOCK} maxPhotos={3} onClose={() => undefined} />);
    await flush();
    expect(calls[0]).toEqual([
      'start_photo_handoff',
      { p_activity_id: ACTIVITY, p_version_id: VERSION, p_block_id: BLOCK, p_slots: 2 },
    ]);
    expect(screen.getByRole('img', { name: /QR code/ })).toBeTruthy();
    expect(screen.getByText(HANDOFF_INTRO)).toBeTruthy();
    expect(screen.getByText(/Works for 10:00 more/)).toBeTruthy();
    expect(PHOTO_HANDOFF_PATH).toBe('/h');
  });

  it('encodes the code in the FRAGMENT, never in the path or query', async () => {
    const { encode } = await import('uqr');
    const qr = encode(`${window.location.origin}/h#${CODE}`, { ecc: 'M', border: 4 });
    render(<PhotoHandoffPanel store={store()} blockId={BLOCK} maxPhotos={2} onClose={() => undefined} />);
    await flush();
    // The drawn modules are exactly those of the fragment URL.
    const d = document.querySelector('.viewer-photo-handoff__qr path')?.getAttribute('d') ?? '';
    const dark = qr.data.flat().filter(Boolean).length;
    expect(d.split('M').length - 1).toBe(dark);
  });

  it('each photo that arrives joins the answer as a server ref, once', async () => {
    const s = store();
    render(<PhotoHandoffPanel store={s} blockId={BLOCK} maxPhotos={2} onClose={() => undefined} />);
    await flush();
    status = { photos: [P1], slots_left: 1, live: true };
    await act(async () => { vi.advanceTimersByTime(POLL_MS); });
    await flush();
    expect(s.getState().responses.photos?.[BLOCK]).toEqual([{ id: P1 }]);
    expect(screen.getByText('Photo 1 arrived.')).toBeTruthy();
    await act(async () => { vi.advanceTimersByTime(POLL_MS); });
    await flush();
    expect(s.getState().responses.photos?.[BLOCK]).toEqual([{ id: P1 }]);
  });

  it('an arrival with no room left is discarded, never kept invisibly', async () => {
    const s = store([P1]);
    render(<PhotoHandoffPanel store={s} blockId={BLOCK} maxPhotos={1} onClose={() => undefined} />);
    await flush();
    status = { photos: [P2], slots_left: 0, live: true };
    await act(async () => { vi.advanceTimersByTime(POLL_MS); });
    await flush();
    expect(s.getState().responses.photos?.[BLOCK]).toEqual([{ id: P1 }]);
    expect(upload.discardPhoto).toHaveBeenCalledWith(P2);
  });

  it('Done revokes the code at once', async () => {
    const onClose = vi.fn();
    render(<PhotoHandoffPanel store={store()} blockId={BLOCK} maxPhotos={2} onClose={onClose} />);
    await flush();
    fireEvent.click(screen.getByRole('button', { name: 'Done with my phone' }));
    await flush();
    expect(calls).toContainEqual(['end_photo_handoff', { p_handoff_id: HANDOFF }]);
    expect(onClose).toHaveBeenCalled();
  });

  it('unmounting (the page closes) revokes it too, and stops polling', async () => {
    const view = render(<PhotoHandoffPanel store={store()} blockId={BLOCK} maxPhotos={2} onClose={() => undefined} />);
    await flush();
    view.unmount();
    await flush();
    expect(calls).toContainEqual(['end_photo_handoff', { p_handoff_id: HANDOFF }]);
    const polls = calls.filter((c) => c[0] === 'photo_handoff_status').length;
    await act(async () => { vi.advanceTimersByTime(POLL_MS * 3); });
    expect(calls.filter((c) => c[0] === 'photo_handoff_status').length).toBe(polls);
  });

  it('a code past its 10 minutes reads as stopped, with a way to make a new one', async () => {
    render(<PhotoHandoffPanel store={store()} blockId={BLOCK} maxPhotos={2} onClose={() => undefined} />);
    await flush();
    await act(async () => { vi.advanceTimersByTime(600_000); });
    expect(screen.queryByRole('img', { name: /QR code/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show a new code' }));
    await flush();
    expect(calls.filter((c) => c[0] === 'start_photo_handoff')).toHaveLength(2);
  });

  it('a quiz or exam refusal says so plainly and shows no QR', async () => {
    startResult = { data: null, error: { message: 'handoff_not_here' } };
    render(<PhotoHandoffPanel store={store()} blockId={BLOCK} maxPhotos={2} onClose={() => undefined} />);
    await flush();
    expect(screen.getByRole('alert').textContent).toBe(handoffRefusalText('handoff_not_here'));
    expect(screen.queryByRole('img', { name: /QR code/ })).toBeNull();
  });
});

describe('the block offers the phone', () => {
  it('"Use my phone" appears beside Add a photo, and opens the panel', async () => {
    vi.useRealTimers();
    const s = store();
    render(
      <ViewerProvider store={s} defaultSectionId="s1">
        <PhotoResponse block={{ id: BLOCK, type: 'photo_response', prompt: [], maxPhotos: 2 } as never} mode="screen" />
      </ViewerProvider>,
    );
    const button = await screen.findByRole('button', { name: USE_PHONE_LABEL });
    await vi.waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(button);
    expect(await screen.findByRole('group', { name: 'Use my phone' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: USE_PHONE_LABEL })).toBeNull();
  });

  it('is not offered on a surface with no seam (the teacher preview)', () => {
    vi.useRealTimers();
    setPhotoLink(null);
    render(
      <ViewerProvider store={store()} defaultSectionId="s1">
        <PhotoResponse block={{ id: BLOCK, type: 'photo_response', prompt: [] } as never} mode="screen" />
      </ViewerProvider>,
    );
    expect(screen.queryByRole('button', { name: USE_PHONE_LABEL })).toBeNull();
  });
});

describe('a superseded start', () => {
  it('a start that answers after a newer one is ended, and Done revokes the LIVE code', async () => {
    const NEW = 'dddddddd-0000-4000-8000-000000000002';
    let releaseFirst: (v: { data: unknown; error: unknown }) => void = () => undefined;
    let n = 0;
    seam(async (name, args) => {
      calls.push([name, args]);
      if (name === 'start_photo_handoff') {
        n += 1;
        const expires_at = new Date(Date.now() + 600_000).toISOString();
        if (n === 1) return new Promise((r) => { releaseFirst = r; });
        return { data: { id: NEW, code: CODE, expires_at, slots: 1 }, error: null };
      }
      return { data: { photos: [], slots_left: 1, live: true }, error: null };
    });
    const s = store();
    const view = render(<PhotoHandoffPanel store={s} blockId={BLOCK} maxPhotos={1} onClose={() => undefined} />);
    await flush();
    // A second start while the first is still unanswered (StrictMode's second
    // run, or a restart): the effect re-runs on a changed dependency.
    view.rerender(<PhotoHandoffPanel store={s} blockId={BLOCK} maxPhotos={2} onClose={() => undefined} />);
    await flush();
    releaseFirst({
      data: { id: HANDOFF, code: CODE, expires_at: new Date(Date.now() + 600_000).toISOString(), slots: 1 },
      error: null,
    });
    await flush();
    expect(calls).toContainEqual(['end_photo_handoff', { p_handoff_id: HANDOFF }]);
    calls = [];
    fireEvent.click(screen.getByRole('button', { name: 'Done with my phone' }));
    await flush();
    expect(calls.filter((c) => c[0] === 'end_photo_handoff')).toEqual([['end_photo_handoff', { p_handoff_id: NEW }]]);
  });
});

describe('the poll never loses a photo (Fable review 2026-11-18)', () => {
  const tickPoll = async () => {
    await act(async () => { vi.advanceTimersByTime(POLL_MS); });
    await flush();
  };

  it('a slot taken before its photo arrives is not the end: the poll waits for the photo', async () => {
    startResult = { data: { id: HANDOFF, code: CODE, expires_at: new Date(Date.now() + 600_000).toISOString(), slots: 1 }, error: null };
    const s = store();
    render(<PhotoHandoffPanel store={s} blockId={BLOCK} maxPhotos={1} onClose={() => undefined} />);
    await flush();
    status = { photos: [], slots_left: 0, live: true }; // reserved, bytes not yet stored
    await tickPoll();
    expect(screen.queryByText('All your photos have arrived.')).toBeNull();
    status = { photos: [P1], slots_left: 0, live: true }; // confirmed
    await tickPoll();
    expect(s.getState().responses.photos?.[BLOCK]).toEqual([{ id: P1 }]);
    expect(screen.getByText('All your photos have arrived.')).toBeTruthy();
  });

  it('a photo the student removed does not come back on the next poll', async () => {
    const s = store();
    render(<PhotoHandoffPanel store={s} blockId={BLOCK} maxPhotos={2} onClose={() => undefined} />);
    await flush();
    status = { photos: [P1], slots_left: 1, live: true };
    await tickPoll();
    expect(s.getState().responses.photos?.[BLOCK]).toEqual([{ id: P1 }]);
    act(() => s.setPhotos(BLOCK, [])); // Remove
    await tickPoll();
    await tickPoll();
    expect(s.getState().responses.photos?.[BLOCK] ?? []).toEqual([]);
  });

  it('a no-room arrival is discarded once, not on every poll', async () => {
    const s = store([P1]);
    render(<PhotoHandoffPanel store={s} blockId={BLOCK} maxPhotos={1} onClose={() => undefined} />);
    await flush();
    status = { photos: [P2], slots_left: 0, live: true };
    await tickPoll();
    await tickPoll();
    expect(upload.discardPhoto).toHaveBeenCalledTimes(1);
  });

  it('Done listens once more: a photo confirmed since the last poll still arrives', async () => {
    const s = store();
    const onClose = vi.fn();
    render(<PhotoHandoffPanel store={s} blockId={BLOCK} maxPhotos={2} onClose={onClose} />);
    await flush();
    status = { photos: [P1], slots_left: 1, live: true };
    fireEvent.click(screen.getByRole('button', { name: 'Done with my phone' }));
    await flush();
    expect(s.getState().responses.photos?.[BLOCK]).toEqual([{ id: P1 }]);
  });

  it('after the code stops, the poll keeps listening for the grace period, then stops', async () => {
    const s = store();
    render(<PhotoHandoffPanel store={s} blockId={BLOCK} maxPhotos={2} onClose={() => undefined} />);
    await flush();
    status = { photos: [], slots_left: 1, live: false }; // expired on the server
    await tickPoll();
    expect(screen.getByRole('button', { name: 'Show a new code' })).toBeTruthy();
    status = { photos: [P1], slots_left: 1, live: false }; // an upload from minute 9 lands
    await tickPoll();
    expect(s.getState().responses.photos?.[BLOCK]).toEqual([{ id: P1 }]);
    await act(async () => { vi.advanceTimersByTime(GRACE_MS + POLL_MS); });
    await flush();
    const polls = calls.filter((c) => c[0] === 'photo_handoff_status').length;
    await act(async () => { vi.advanceTimersByTime(POLL_MS * 5); });
    expect(calls.filter((c) => c[0] === 'photo_handoff_status').length).toBe(polls);
  });
});
