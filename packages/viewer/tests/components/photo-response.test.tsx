// =============================================================================
// photo-response.test.tsx — the photo block's own behaviour (media submissions
// slice 2). The family contract (recorded, never a verdict) is the conformance
// suite's; this file pins what only this block does: the seam-less preview,
// the switch, the add → upload → answer path, Remove, and a failed upload's
// Retry. The upload module is mocked at its boundary — its real re-encode runs
// in a browser (e2e: photo-exif), and its server half in verify-0093/0094.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const upload = vi.hoisted(() => ({
  reencodePhoto: vi.fn(async (f: Blob) => f),
  addPhoto: vi.fn(async (_ids: unknown, _jpeg: Blob, onProgress: (f: number) => void) => {
    onProgress(1);
    return '99999999-9999-4999-8999-999999999991';
  }),
  signPhotos: vi.fn(async (_a: string, ids: readonly string[]): Promise<Record<string, string | null>> =>
    Object.fromEntries(ids.map((id) => [id, `https://storage.test/${id}`])),
  ),
  discardPhoto: vi.fn(async () => undefined),
  photosEnabled: vi.fn(async () => true),
}));
vi.mock('../../src/blocks/photoUpload.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../src/blocks/photoUpload.js')>();
  return { ...real, ...upload };
});

import PhotoResponse, {
  ADD_PHOTO_LABEL,
  PHOTOS_OFF_TEXT,
  PREVIEW_TEXT,
  REMOVED_AFTER_RELEASE_TEXT,
} from '../../src/blocks/PhotoResponse.js';
import { PhotoError } from '../../src/blocks/photoUpload.js';
import { setPhotoLink } from '../../src/blocks/photoLinkSeam.js';
import { ViewerProvider } from '../../src/container/context.js';
import { createViewerStore } from '../../src/store/store.js';
import { createMockCheckService } from '../../src/check/mock.js';
import { CHECK_WIRE_VERSION } from '../../src/check/wire.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const BLOCK = {
  id: 'cccccccc-0000-4000-8000-000000000001',
  type: 'photo_response',
  prompt: [{ type: 'text', text: 'Photograph your working.' }],
  maxPhotos: 2,
};
const PHOTO = '99999999-9999-4999-8999-999999999991';

function mount(block: Record<string, unknown> = BLOCK, checkService: unknown = createMockCheckService()) {
  const store = createViewerStore({
    userId: 'student-1',
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: checkService as never,
  });
  const view = render(
    <ViewerProvider store={store} defaultSectionId="s1">
      <PhotoResponse block={block as never} mode="screen" />
    </ViewerProvider>,
  );
  return { ...view, store };
}

const live = () =>
  setPhotoLink({
    client: { rpc: async () => ({ data: null, error: null }), auth: { getSession: async () => ({ data: { session: null } }) } },
    storageBase: () => 'https://storage.test/storage/v1',
    anonKey: () => 'anon',
  });

function pick(container: HTMLElement, ...names: string[]) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  const files = names.map((n) => new File(['x'], n, { type: 'image/jpeg' }));
  fireEvent.change(input, { target: { files } });
}

beforeEach(() => {
  vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: () => 'blob:local', revokeObjectURL: () => undefined }));
  Object.values(upload).forEach((fn) => fn.mockClear());
  // mockClear keeps implementations: put the defaults back so one test's
  // mockImplementation cannot leak into the next.
  upload.addPhoto.mockImplementation(async (_ids, _jpeg, onProgress) => {
    onProgress(1);
    return PHOTO;
  });
  upload.reencodePhoto.mockImplementation(async (f: Blob) => f);
  upload.photosEnabled.mockImplementation(async () => true);
});
afterEach(() => {
  cleanup();
  setPhotoLink(null);
});

describe('photo_response', () => {
  it('with no seam (the teacher’s preview) shows what students get and makes no request', () => {
    mount();
    expect(screen.getByText(PREVIEW_TEXT)).toBeTruthy();
    expect((screen.getByRole('button', { name: ADD_PHOTO_LABEL }) as HTMLButtonElement).disabled).toBe(true);
    expect(upload.photosEnabled).not.toHaveBeenCalled();
    expect(upload.signPhotos).not.toHaveBeenCalled();
  });

  it('says so, and offers no Add, while the switch is off', async () => {
    live();
    upload.photosEnabled.mockResolvedValueOnce(false);
    mount();
    expect(await screen.findByText(PHOTOS_OFF_TEXT)).toBeTruthy();
    expect((screen.getByRole('button', { name: ADD_PHOTO_LABEL }) as HTMLButtonElement).disabled).toBe(true);
    // 0099: the read is per ACTIVITY (the owner must be a pilot teacher).
    expect(upload.photosEnabled).toHaveBeenCalledWith(ACTIVITY);
  });

  it('adds a photo: re-encodes, uploads, and puts only its id in the answer', async () => {
    live();
    const { container, store } = mount();
    await waitFor(() =>
      expect((screen.getByRole('button', { name: ADD_PHOTO_LABEL }) as HTMLButtonElement).disabled).toBe(false),
    );
    pick(container, 'IMG_0042.jpg');
    // Waiting first (a device id, `local`), then swapped for the server id —
    // keeping the same `key`, so a queued check does not read it as a change.
    await waitFor(() => expect(store.getState().responses.photos?.[BLOCK.id]?.map((r) => r.id)).toEqual([PHOTO]));
    const [ref] = store.getState().responses.photos![BLOCK.id]!;
    expect(ref!.local).toBeUndefined();
    expect(ref!.key).toMatch(/^[0-9a-f-]{36}$/);
    expect(upload.reencodePhoto).toHaveBeenCalledTimes(1);
    expect(upload.addPhoto.mock.calls[0]![0]).toEqual({ activityId: ACTIVITY, versionId: VERSION, blockId: BLOCK.id });
    expect(screen.getByRole('img', { name: 'Photo 1 of your working' })).toBeTruthy();
    expect(screen.getByText('1 of 2')).toBeTruthy();
  });

  it('never adds more than maxPhotos from one pick', async () => {
    live();
    let n = 0;
    upload.addPhoto.mockImplementation(async () => `99999999-9999-4999-8999-99999999999${++n}`);
    const { container, store } = mount();
    await waitFor(() =>
      expect((screen.getByRole('button', { name: ADD_PHOTO_LABEL }) as HTMLButtonElement).disabled).toBe(false),
    );
    pick(container, 'a.jpg', 'b.jpg', 'c.jpg');
    await waitFor(() => expect(store.getState().responses.photos?.[BLOCK.id]).toHaveLength(2));
    expect(upload.addPhoto).toHaveBeenCalledTimes(2);
    // Full: the Add control is gone.
    expect(screen.queryByRole('button', { name: ADD_PHOTO_LABEL })).toBeNull();
  });

  it('Remove takes the photo out of the answer and discards it on the server', async () => {
    live();
    const { store } = mount();
    act(() => store.setPhotos(BLOCK.id, [{ id: PHOTO }]));
    fireEvent.click(await screen.findByRole('button', { name: /Remove photo 1/ }));
    expect(store.getState().responses.photos?.[BLOCK.id]).toBeUndefined();
    expect(upload.discardPhoto).toHaveBeenCalledWith(PHOTO);
  });

  it('a failed upload says why, keeps the photo waiting in the answer, and Retry sends it again', async () => {
    live();
    upload.addPhoto.mockRejectedValueOnce(new PhotoError('photo_cap'));
    upload.addPhoto.mockImplementationOnce(async () => PHOTO);
    const { container, store } = mount();
    await waitFor(() =>
      expect((screen.getByRole('button', { name: ADD_PHOTO_LABEL }) as HTMLButtonElement).disabled).toBe(false),
    );
    pick(container, 'a.jpg');
    expect((await screen.findByRole('alert')).textContent).toMatch(/a lot of photos/);
    // Still the student's answer, still waiting: a check would hold for it.
    expect(store.getState().responses.photos?.[BLOCK.id]?.[0]?.local).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(store.getState().responses.photos?.[BLOCK.id]?.map((r) => r.id)).toEqual([PHOTO]));
  });

  it('offline, the photo is saved on the device and waits, then uploads on reconnect', async () => {
    live();
    const onLine = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const { container, store } = mount();
    await waitFor(() =>
      expect((screen.getByRole('button', { name: ADD_PHOTO_LABEL }) as HTMLButtonElement).disabled).toBe(false),
    );
    pick(container, 'a.jpg');
    expect(await screen.findByText(/Saved on this device/)).toBeTruthy();
    expect(upload.addPhoto).not.toHaveBeenCalled();
    expect(store.getState().responses.photos?.[BLOCK.id]?.[0]?.local).toBe(true);
    onLine.mockReturnValue(true);
    act(() => void window.dispatchEvent(new Event('online')));
    await waitFor(() => expect(store.getState().responses.photos?.[BLOCK.id]?.map((r) => r.id)).toEqual([PHOTO]));
    onLine.mockRestore();
  });

  it('Remove on a waiting photo deletes the device copy and never uploads it', async () => {
    live();
    const onLine = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const { container, store } = mount();
    await waitFor(() =>
      expect((screen.getByRole('button', { name: ADD_PHOTO_LABEL }) as HTMLButtonElement).disabled).toBe(false),
    );
    pick(container, 'a.jpg');
    await screen.findByText(/Saved on this device/);
    fireEvent.click(screen.getByRole('button', { name: /Remove photo 1/ }));
    expect(store.getState().responses.photos?.[BLOCK.id]).toBeUndefined();
    onLine.mockReturnValue(true);
    act(() => void window.dispatchEvent(new Event('online')));
    await new Promise((r) => setTimeout(r, 20));
    expect(upload.addPhoto).not.toHaveBeenCalled();
    expect(upload.discardPhoto).not.toHaveBeenCalled(); // nothing on the server to discard
    onLine.mockRestore();
  });

  it('a check that could not hand a photo in says so and drops it from the answer', async () => {
    live();
    // The handler's read-back (removedPhotos) on this block's item.
    const { store } = mount(BLOCK, {
      checkSection: async (req: { sectionId: string }) => ({
        wireVersion: CHECK_WIRE_VERSION,
        sectionId: req.sectionId,
        items: { [BLOCK.id]: { verdict: 'recorded', removedPhotos: [PHOTO] } },
        solutions: {},
      }),
    });
    act(() => store.setPhotos(BLOCK.id, [{ id: PHOTO }]));
    await act(() => store.checkSection('s1', { photos: [BLOCK.id] }));
    expect((await screen.findByRole('alert')).textContent).toMatch(/wasn’t handed in/);
    expect(store.getState().responses.photos?.[BLOCK.id]).toBeUndefined();
  });

  it('a photo the server has removed shows that, not a broken image', async () => {
    live();
    upload.signPhotos.mockResolvedValueOnce({ [PHOTO]: null });
    const { store } = mount();
    act(() => store.setPhotos(BLOCK.id, [{ id: PHOTO }]));
    expect(await screen.findByText('This photo has been removed.')).toBeTruthy();
  });

  it('once the grade has come back, a removed photo says it went 30 days after (MS-10)', async () => {
    live();
    upload.signPhotos.mockResolvedValueOnce({ [PHOTO]: null });
    const service = createMockCheckService();
    service.fetchReleasedFeedback = async () => ({
      graded: true,
      blocks: {
        [BLOCK.id]: { criteria: [], attemptNumber: 1, activityVersionId: VERSION, stale: false, hasGrader: true },
      },
    });
    const { store } = mount(BLOCK, service);
    await act(async () => {
      await store.loadReleasedFeedback();
      store.setPhotos(BLOCK.id, [{ id: PHOTO }]);
    });
    expect(await screen.findByText(REMOVED_AFTER_RELEASE_TEXT)).toBeTruthy();
  });

  it('prints a work box and none of the controls', () => {
    const store = createViewerStore({
      userId: 'student-1', activityId: ACTIVITY, versionId: VERSION, checkService: createMockCheckService(),
    });
    const { container } = render(
      <ViewerProvider store={store} defaultSectionId="s1">
        <PhotoResponse block={BLOCK as never} mode="print" />
      </ViewerProvider>,
    );
    expect(container.querySelector('.viewer-photo-response__box')).not.toBeNull();
    expect(container.querySelector('button, input')).toBeNull();
  });
});
