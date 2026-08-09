// @vitest-environment jsdom
// =============================================================================
// authHelper.test.ts — the E-10 sign-in contract + E-7 callback parsing
// -----------------------------------------------------------------------------
// The two pins the design review demanded: the hd hint reaches Google only on
// student surfaces, and the failure-screen retry ALWAYS forces the account
// picker (OV#4 — without prompt=select_account Google silently reuses the
// rejected account and the retry loops).
// =============================================================================
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(() => Promise.resolve({ error: null })),
  districtHint: 'school.org' as string | undefined,
}));

vi.mock('../lib/supabase', () => ({
  supabase: { auth: { signInWithOAuth: h.signInWithOAuth } },
  get districtHint() {
    return h.districtHint;
  },
}));

import {
  signInWithGoogle,
  markIdleSignOut,
  consumeIdleSignOutFlag,
} from '../lib/auth';
import { readAuthCallbackError } from '../lib/authMessages';

beforeEach(() => {
  h.signInWithOAuth.mockClear();
  h.districtHint = 'school.org';
  sessionStorage.clear();
});

describe('signInWithGoogle (E-10/E-6/OV#4)', () => {
  it('passes hd on student surfaces when the hint is configured', async () => {
    await signInWithGoogle({ redirectTo: 'https://x/join/AB', includeDistrictHint: true });
    expect(h.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'https://x/join/AB',
        queryParams: { hd: 'school.org' },
      },
    });
  });

  it('omits queryParams entirely on the teacher entry (no hint, no picker)', async () => {
    await signInWithGoogle({ redirectTo: 'https://x/' });
    expect(h.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'https://x/' },
    });
  });

  it('unset env hint degrades gracefully — no hd even on student surfaces', async () => {
    h.districtHint = undefined;
    await signInWithGoogle({ redirectTo: 'https://x/', includeDistrictHint: true });
    expect(h.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'https://x/' },
    });
  });

  it('the failure-screen retry forces the account picker (OV#4)', async () => {
    await signInWithGoogle({
      redirectTo: 'https://x/join/AB',
      includeDistrictHint: true,
      forceAccountPicker: true,
    });
    expect(h.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'https://x/join/AB',
        queryParams: { hd: 'school.org', prompt: 'select_account' },
      },
    });
  });
});

describe('readAuthCallbackError (E-7 — both transport forms)', () => {
  it('reads the query form', () => {
    expect(
      readAuthCallbackError(new URL('https://x/join/AB?error=server_error&error_description=Database+error')),
    ).toBe('Database error');
  });
  it('reads the hash form', () => {
    expect(
      readAuthCallbackError(new URL('https://x/#error=access_denied&error_description=refused')),
    ).toBe('refused');
  });
  it('falls back to the bare error code, and null when clean', () => {
    expect(readAuthCallbackError(new URL('https://x/?error=server_error'))).toBe('server_error');
    expect(readAuthCallbackError(new URL('https://x/join/AB'))).toBeNull();
  });
});

describe('idle sign-out flag (board 1d)', () => {
  it('round-trips once and clears on consume', () => {
    expect(consumeIdleSignOutFlag()).toBe(false);
    markIdleSignOut();
    expect(consumeIdleSignOutFlag()).toBe(true);
    expect(consumeIdleSignOutFlag()).toBe(false);
  });
});
