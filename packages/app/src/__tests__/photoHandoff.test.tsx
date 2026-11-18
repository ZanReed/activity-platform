// @vitest-environment jsdom
// =============================================================================
// photoHandoff.test.tsx — the phone's page for "Use my phone" (media
// submissions slice 2c, §4.1). The function is faked at fetch; its own logic is
// scripts/tests/photo-handoff.test.mjs, and the real thing end to end is
// verify-student-work-e2e.mjs's H rows.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const h = vi.hoisted(() => ({ supabaseTouched: false }));

vi.mock('../lib/supabase', () => ({
  functionsBase: () => 'https://fn.test/functions/v1',
  // Any use of the client on this page is a bug: the phone has no session.
  get supabase() {
    h.supabaseTouched = true;
    throw new Error('the phone page must not touch the Supabase client');
  },
}));
vi.mock('@activity/viewer/photo-handoff', async (importOriginal) => {
  const real = await importOriginal<typeof import('@activity/viewer/photo-handoff')>();
  return { ...real, reencodePhoto: vi.fn(async () => new Blob(['jpeg'], { type: 'image/jpeg' })) };
});

import PhotoHandoff, { ALL_SENT_TEXT, NO_CODE_TEXT, PRIVACY_TEXT, handoffErrorText } from '../routes/PhotoHandoff';
import { PHOTO_HANDOFF_PATH } from '@activity/viewer/photo-handoff';

const CODE = 'Z'.repeat(42) + '-';

let replies: Array<{ status: number; body: Record<string, unknown> }>;
let sent: Array<{ url: string; init: RequestInit }>;

beforeEach(() => {
  h.supabaseTouched = false;
  sent = [];
  replies = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    sent.push({ url, init });
    const next = replies.shift() ?? { status: 500, body: { error: 'failed' } };
    return new Response(JSON.stringify(next.body), { status: next.status });
  }));
  window.history.replaceState(null, '', `${PHOTO_HANDOFF_PATH}#${CODE}`);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const peekOk = (slots = 2) => ({ status: 200, body: { title: 'Linear equations', prompt: 'Show your working', slots_left: slots } });

function pick(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(['x'], 'a.jpg', { type: 'image/jpeg' })] } });
}

describe('the phone page', () => {
  it('takes the code from the fragment, then leaves none in the address bar', async () => {
    replies = [peekOk()];
    render(<PhotoHandoff />);
    expect(window.location.hash).toBe('');
    expect(window.location.pathname).toBe(PHOTO_HANDOFF_PATH);
    await screen.findByText('Linear equations');
    const body = sent[0]!.init.body as FormData;
    expect(body.get('action')).toBe('peek');
    expect(body.get('code')).toBe(CODE);
    // The code travels in the body only — never the URL.
    expect(sent[0]!.url).not.toContain(CODE);
    expect(sent[0]!.url).toContain('/photo-handoff?');
  });

  it('sends no Authorization header and never touches the Supabase client', async () => {
    replies = [peekOk(), { status: 200, body: { slots_left: 1 } }];
    const { container } = render(<PhotoHandoff />);
    await screen.findByText(PRIVACY_TEXT);
    pick(container);
    await screen.findByText(/Sent\./);
    for (const s of sent) expect(new Headers(s.init.headers).has('authorization')).toBe(false);
    expect(h.supabaseTouched).toBe(false);
  });

  it('uploads the re-encoded photo and counts down the slots', async () => {
    replies = [peekOk(2), { status: 200, body: { slots_left: 1 } }, { status: 200, body: { slots_left: 0 } }];
    const { container } = render(<PhotoHandoff />);
    await screen.findByText(PRIVACY_TEXT);
    pick(container);
    await screen.findByRole('button', { name: 'Take another photo' });
    const upload = sent[1]!.init.body as FormData;
    expect(upload.get('action')).toBe('upload');
    expect((upload.get('photo') as Blob).type).toBe('image/jpeg');
    pick(container);
    await screen.findByText(ALL_SENT_TEXT);
    expect(screen.queryByRole('button', { name: /Take/ })).toBeNull();
  });

  it('a stopped code says what to do, and offers no camera', async () => {
    replies = [{ status: 410, body: { error: 'handoff_expired' } }];
    render(<PhotoHandoff />);
    await screen.findByText(handoffErrorText('handoff_expired'));
    expect(screen.queryByRole('button', { name: /Take/ })).toBeNull();
  });

  it('a failed send keeps the page usable for another try', async () => {
    replies = [peekOk(), { status: 502, body: { error: 'upload_failed' } }];
    const { container } = render(<PhotoHandoff />);
    await screen.findByText(PRIVACY_TEXT);
    pick(container);
    await screen.findByRole('alert');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Take a photo' })).toBeTruthy());
  });

  it('a link with no code makes no request', async () => {
    // A fresh page: the code is kept for the page's life (StrictMode, a
    // remount), so this needs a module that has never taken one.
    vi.resetModules();
    window.history.replaceState(null, '', PHOTO_HANDOFF_PATH);
    const { default: FreshPage } = await import('../routes/PhotoHandoff');
    render(<FreshPage />);
    expect(screen.getByText(NO_CODE_TEXT)).toBeTruthy();
    expect(sent).toHaveLength(0);
  });

  it('a second mount (StrictMode, a remount) still has the code after the fragment is gone', async () => {
    replies = [peekOk(), peekOk()];
    const first = render(<PhotoHandoff />);
    await screen.findByText('Linear equations');
    first.unmount();
    expect(window.location.hash).toBe('');
    render(<PhotoHandoff />);
    await screen.findByText('Linear equations');
    expect((sent[1]!.init.body as FormData).get('code')).toBe(CODE);
  });

  it('the route is mounted at the viewer\'s PHOTO_HANDOFF_PATH, outside RequireAuth', () => {
    const app = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../App.tsx'), 'utf8');
    expect(app).toContain(`<Route path="${PHOTO_HANDOFF_PATH}" element={<PhotoHandoff />} />`);
  });
});
