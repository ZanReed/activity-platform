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
} from '../../src/blocks/PhotoResponse.js';
import { PhotoError } from '../../src/blocks/photoUpload.js';
import { setPhotoLink } from '../../src/blocks/photoLinkSeam.js';
import { ViewerProvider } from '../../src/container/context.js';
import { createViewerStore } from '../../src/store/store.js';
import { createMockCheckService } from '../../src/check/mock.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const BLOCK = {
  id: 'cccccccc-0000-4000-8000-000000000001',
  type: 'photo_response',
  prompt: [{ type: 'text', text: 'Photograph your working.' }],
  maxPhotos: 2,
};
const PHOTO = '99999999-9999-4999-8999-999999999991';

function mount(block: Record<string, unknown> = BLOCK) {
  const store = createViewerStore({
    userId: 'student-1',
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: createMockCheckService(),
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
  });

  it('adds a photo: re-encodes, uploads, and puts only its id in the answer', async () => {
    live();
    const { container, store } = mount();
    await waitFor(() =>
      expect((screen.getByRole('button', { name: ADD_PHOTO_LABEL }) as HTMLButtonElement).disabled).toBe(false),
    );
    pick(container, 'IMG_0042.jpg');
    await waitFor(() => expect(store.getState().responses.photos?.[BLOCK.id]).toEqual([{ id: PHOTO }]));
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

  it('a failed upload says why, keeps nothing in the answer, and Retry sends it again', async () => {
    live();
    upload.addPhoto.mockRejectedValueOnce(new PhotoError('photo_cap'));
    upload.addPhoto.mockImplementationOnce(async () => PHOTO);
    const { container, store } = mount();
    await waitFor(() =>
      expect((screen.getByRole('button', { name: ADD_PHOTO_LABEL }) as HTMLButtonElement).disabled).toBe(false),
    );
    pick(container, 'a.jpg');
    expect((await screen.findByRole('alert')).textContent).toMatch(/a lot of photos/);
    expect(store.getState().responses.photos?.[BLOCK.id]).toBeUndefined();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(store.getState().responses.photos?.[BLOCK.id]).toEqual([{ id: PHOTO }]));
  });

  it('a photo the server has removed shows that, not a broken image', async () => {
    live();
    upload.signPhotos.mockResolvedValueOnce({ [PHOTO]: null });
    const { store } = mount();
    act(() => store.setPhotos(BLOCK.id, [{ id: PHOTO }]));
    expect(await screen.findByText('This photo has been removed.')).toBeTruthy();
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
