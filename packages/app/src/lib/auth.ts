/**
 * The ONE Google sign-in call site (identity slice E-10). Home, the
 * StudentViewer pre-auth gate, and /join/:code all call this — three
 * hand-rolled signInWithOAuth calls had already diverged on redirectTo, and
 * the hd hint / account-picker options must never be maintained per-site.
 */
import { supabase, districtHint } from './supabase';

export interface SignInOptions {
  /** Where the OAuth round-trip lands. Join links pass their own URL so the
   * code survives the redirect (B12); Home passes the origin. */
  redirectTo: string;
  /** Student-facing surfaces pass true → `hd` steers Google's account picker
   * toward the district domain (E-6; teacher Home passes false). */
  includeDistrictHint?: boolean;
  /**
   * The sign-in-failed screen's retry MUST pass true: without
   * `prompt=select_account` Google silently reuses the already-consented
   * (rejected) account and the retry loops straight back to the failure
   * screen (design OV#4; pinned by unit test).
   */
  forceAccountPicker?: boolean;
}

export async function signInWithGoogle(opts: SignInOptions): Promise<{ error: Error | null }> {
  const queryParams: Record<string, string> = {};
  if (opts.includeDistrictHint && districtHint) queryParams.hd = districtHint;
  if (opts.forceAccountPicker) queryParams.prompt = 'select_account';
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: opts.redirectTo,
      ...(Object.keys(queryParams).length > 0 ? { queryParams } : {}),
    },
  });
  return { error: error ?? null };
}

/**
 * Idle sign-out leaves this flag so the signed-out Home can say "you were
 * signed out after being away — your work is saved" instead of looking like
 * a random logout (design board 1d). sessionStorage: per-tab, survives the
 * sign-out redirect, gone when the tab closes.
 */
const IDLE_SIGNOUT_FLAG = 'activity-platform:idle-signed-out';

export function markIdleSignOut(): void {
  try {
    sessionStorage.setItem(IDLE_SIGNOUT_FLAG, '1');
  } catch {
    // Storage unavailable (private mode edge) — the banner is best-effort.
  }
}

export function consumeIdleSignOutFlag(): boolean {
  try {
    const set = sessionStorage.getItem(IDLE_SIGNOUT_FLAG) === '1';
    if (set) sessionStorage.removeItem(IDLE_SIGNOUT_FLAG);
    return set;
  } catch {
    return false;
  }
}
