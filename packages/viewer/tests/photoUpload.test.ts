// photoUpload.ts — the reserve → upload order and what a failure gives back.
// (The re-encode runs in a real browser: app e2e student/photo-response.)
import { afterEach, describe, expect, it, vi } from 'vitest';
import { addPhoto, objectName } from '../src/blocks/photoUpload.js';
import { setPhotoLink } from '../src/blocks/photoLinkSeam.js';

const PHOTO = '77777777-0000-4000-8000-000000000001';
const IDS = { activityId: 'act', versionId: 'ver', blockId: 'blk' };

function link(calls: Array<[string, Record<string, string | number>]>) {
  setPhotoLink({
    client: {
      rpc: async (name, args) => {
        calls.push([name, args]);
        return name === 'reserve_work_photo' ? { data: PHOTO, error: null } : { data: true, error: null };
      },
      auth: { getSession: async () => ({ data: { session: { access_token: 'tok', user: { id: 'uid' } } } }) },
    },
    storageBase: () => 'https://storage.test/storage/v1',
    anonKey: () => 'anon',
  });
}

/** An XMLHttpRequest that answers every send with `status`. */
function xhrAnswering(status: number, sent: Array<{ url: string; headers: Record<string, string> }>) {
  class FakeXhr {
    status = 0;
    upload = { onprogress: null as unknown };
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    private url = '';
    private headers: Record<string, string> = {};
    open(_m: string, url: string) { this.url = url; }
    setRequestHeader(k: string, v: string) { this.headers[k] = v; }
    send() {
      sent.push({ url: this.url, headers: this.headers });
      this.status = status;
      queueMicrotask(() => this.onload?.());
    }
  }
  vi.stubGlobal('XMLHttpRequest', FakeXhr);
}

afterEach(() => {
  setPhotoLink(null);
  vi.unstubAllGlobals();
});

describe('addPhoto', () => {
  it('reserves, then uploads under the reserved key, never overwriting', async () => {
    const calls: Array<[string, Record<string, string | number>]> = [];
    const sent: Array<{ url: string; headers: Record<string, string> }> = [];
    link(calls);
    xhrAnswering(200, sent);
    await expect(addPhoto(IDS, new Blob(['x']), () => undefined)).resolves.toBe(PHOTO);
    expect(calls.map((c) => c[0])).toEqual(['reserve_work_photo']);
    expect(sent[0]!.url).toBe(`https://storage.test/storage/v1/object/student-work/${objectName('act', 'uid', PHOTO)}`);
    expect(sent[0]!.headers['x-upsert']).toBe('false');
    expect(sent[0]!.headers['Content-Type']).toBe('image/jpeg');
  });

  it('a failed upload gives its reservation back, so retries cannot use up the cap', async () => {
    const calls: Array<[string, Record<string, string | number>]> = [];
    link(calls);
    xhrAnswering(500, []);
    await expect(addPhoto(IDS, new Blob(['x']), () => undefined)).rejects.toMatchObject({ code: 'upload_failed' });
    expect(calls).toEqual([
      ['reserve_work_photo', { p_activity_id: 'act', p_version_id: 'ver', p_block_id: 'blk' }],
      ['discard_work_photo', { p_id: PHOTO }],
    ]);
  });
});
