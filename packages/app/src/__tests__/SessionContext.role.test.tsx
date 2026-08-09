// @vitest-environment jsdom
// =============================================================================
// SessionContext.role.test.tsx — the E-4/E-11 role state machine
// -----------------------------------------------------------------------------
// The load-bearing behaviors: ONE role select per signed-in user id (hourly
// TOKEN_REFRESHED events reuse it), zero rows → 'empty' (never a retry loop),
// select failure → 'error' with a working retry, sign-out clears to 'idle'.
// =============================================================================
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import type { Session } from '@supabase/supabase-js';

type AuthCallback = (event: string, session: Session | null) => void;

const h = vi.hoisted(() => {
  const state: {
    authCallback: AuthCallback | null;
    initialSession: Session | null;
    roleResult: { data: unknown; error: unknown };
    roleSelects: number;
  } = {
    authCallback: null,
    initialSession: null,
    roleResult: { data: { role: 'student' }, error: null },
    roleSelects: 0,
  };
  return { state };
});

vi.mock('../lib/supabase', () => ({
  supabaseConfigured: true,
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: h.state.initialSession } }),
      onAuthStateChange: (cb: AuthCallback) => {
        h.state.authCallback = cb;
        return { data: { subscription: { unsubscribe: () => undefined } } };
      },
    },
    from: (table: string) => {
      if (table !== 'users') throw new Error(`unexpected table ${table}`);
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => {
              h.state.roleSelects += 1;
              return Promise.resolve(h.state.roleResult);
            },
          }),
        }),
      };
    },
  },
}));

import { SessionProvider, useSession } from '../lib/SessionContext';

function fakeSession(userId: string): Session {
  return { user: { id: userId, email: `${userId}@x.test` } } as unknown as Session;
}

function Probe() {
  const { role, roleStatus, retryRole } = useSession();
  return (
    <div>
      <span data-testid="role">{role ?? '(null)'}</span>
      <span data-testid="status">{roleStatus}</span>
      <button type="button" onClick={retryRole}>
        retry
      </button>
    </div>
  );
}

beforeEach(() => {
  h.state.authCallback = null;
  h.state.initialSession = null;
  h.state.roleResult = { data: { role: 'student' }, error: null };
  h.state.roleSelects = 0;
});
afterEach(cleanup);

describe('SessionContext role machine (E-4/E-11)', () => {
  it('fetches once per user id and reuses it across TOKEN_REFRESHED', async () => {
    h.state.initialSession = fakeSession('u-1');
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('role').textContent).toBe('student');
    expect(h.state.roleSelects).toBe(1);

    // The hourly refresh event: same user, NO refetch (E-4's whole point).
    await act(async () => {
      h.state.authCallback?.('TOKEN_REFRESHED', fakeSession('u-1'));
    });
    expect(h.state.roleSelects).toBe(1);

    // A different user DOES refetch.
    await act(async () => {
      h.state.authCallback?.('SIGNED_IN', fakeSession('u-2'));
    });
    await waitFor(() => expect(h.state.roleSelects).toBe(2));
  });

  it('sign-out clears role state to idle', async () => {
    h.state.initialSession = fakeSession('u-1');
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    await act(async () => {
      h.state.authCallback?.('SIGNED_OUT', null);
    });
    expect(screen.getByTestId('status').textContent).toBe('idle');
    expect(screen.getByTestId('role').textContent).toBe('(null)');
  });

  it('zero rows → empty (the E-11 account-unavailable state), never ready', async () => {
    h.state.initialSession = fakeSession('u-1');
    h.state.roleResult = { data: null, error: null };
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('empty'));
    expect(screen.getByTestId('role').textContent).toBe('(null)');
  });

  it('a failed select → error, and retryRole re-runs it', async () => {
    h.state.initialSession = fakeSession('u-1');
    h.state.roleResult = { data: null, error: { message: 'network' } };
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('error'));

    h.state.roleResult = { data: { role: 'teacher' }, error: null };
    screen.getByRole('button', { name: 'retry' }).click();
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('role').textContent).toBe('teacher');
    expect(h.state.roleSelects).toBe(2);
  });
});
