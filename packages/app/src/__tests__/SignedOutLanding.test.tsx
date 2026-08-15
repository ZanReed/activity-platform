// @vitest-environment jsdom
// =============================================================================
// SignedOutLanding.test.tsx — the PRE-AUTH admission fork (0033 R5-DR, Row 0)
// -----------------------------------------------------------------------------
// Why each row exists:
//
//  * THE DOOR DECIDES THE REDIRECT, and the redirect is the only way intent
//    survives OAuth. If these assertions drift, a student lands on Home as a
//    bare pending account instead of auto-redeeming, and a teacher lands on the
//    student fork — the exact failure the pre-auth fork was ruled to remove.
//    The URLs are asserted through the exported builders, never retyped (P2).
//  * THE CODE CHECK WARNS BUT NEVER HARD-BLOCKS (DR-6). Two rows: a bad code
//    stops the first press, and the SECOND press goes anyway. The second row is
//    the one that matters — an anonymous, possibly-stale lookup must not be the
//    final word on whether a class exists.
//  * RETYPING RE-CHECKS. Without this, the "press again" escape hatch would let
//    a corrected code skip its own validation.
//  * ANNOUNCEMENTS are contract strings (LANDING_ANNOUNCEMENTS), pinned here
//    rather than typed, same discipline as the onboarding card's rows.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({
  signIn: vi.fn<[unknown], Promise<{ error: Error | null }>>(),
  fetchMeta: vi.fn<[string], Promise<unknown>>(),
}));

vi.mock('../lib/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/auth')>()),
  signInWithGoogle: h.signIn,
}));

vi.mock('../lib/classActivities', () => ({
  fetchClassMeta: h.fetchMeta,
}));

import {
  SignedOutLanding,
  studentRedirectUrl,
  teacherRedirectUrl,
} from '../components/SignedOutLanding';
import { LANDING_ANNOUNCEMENTS, LANDING_COPY } from '../lib/authMessages';

const CODE = '7NE9M2';

function typeCode(value: string) {
  fireEvent.change(screen.getByLabelText(LANDING_COPY.codeLabel), { target: { value } });
}

function pressContinue() {
  fireEvent.click(screen.getByRole('button', { name: LANDING_COPY.studentAction }));
}

beforeEach(() => {
  h.signIn.mockResolvedValue({ error: null });
  h.fetchMeta.mockResolvedValue({ kind: 'name', name: 'Algebra 1' });
});

afterEach(() => {
  cleanup();
  h.signIn.mockReset();
  h.fetchMeta.mockReset();
});

describe('SignedOutLanding — the pre-auth fork', () => {
  it('the code door signs in with the JOIN URL as the redirect, district hint on', async () => {
    render(<SignedOutLanding idleSignedOut={false} />);
    typeCode(CODE);
    pressContinue();

    await waitFor(() => expect(h.signIn).toHaveBeenCalledTimes(1));
    expect(h.signIn).toHaveBeenCalledWith({
      redirectTo: studentRedirectUrl(CODE, window.location.origin),
      includeDistrictHint: true,
    });
    expect(studentRedirectUrl(CODE, 'https://x.test')).toBe(`https://x.test/join/${CODE}`);
  });

  it('the teacher door carries the intent hint and NO district hint', async () => {
    render(<SignedOutLanding idleSignedOut={false} />);
    fireEvent.click(screen.getByRole('button', { name: LANDING_COPY.teacherAction }));

    await waitFor(() => expect(h.signIn).toHaveBeenCalledTimes(1));
    expect(h.signIn).toHaveBeenCalledWith({
      redirectTo: teacherRedirectUrl(window.location.origin),
    });
    expect(teacherRedirectUrl('https://x.test')).toBe('https://x.test/?intent=teacher');
  });

  it('the action stays disabled until the code is full length', () => {
    render(<SignedOutLanding idleSignedOut={false} />);
    const button = screen.getByRole('button', {
      name: LANDING_COPY.studentAction,
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    typeCode('7NE9');
    expect(button.disabled).toBe(true);
    typeCode(CODE);
    expect(button.disabled).toBe(false);
  });

  it('a bad code warns BEFORE Google and does not sign in', async () => {
    h.fetchMeta.mockResolvedValue({ kind: 'none' });
    render(<SignedOutLanding idleSignedOut={false} />);
    typeCode('ZZZZZZ');
    pressContinue();

    await screen.findByText(new RegExp(LANDING_COPY.codeNotFound.slice(0, 30)));
    expect(h.signIn).not.toHaveBeenCalled();
    expect(screen.getByRole('status').textContent).toBe(LANDING_ANNOUNCEMENTS.notFound);
  });

  it('pressing again on the SAME bad code proceeds anyway (never a hard block)', async () => {
    h.fetchMeta.mockResolvedValue({ kind: 'none' });
    render(<SignedOutLanding idleSignedOut={false} />);
    typeCode('ZZZZZZ');
    pressContinue();
    await screen.findByRole('alert');

    pressContinue();
    await waitFor(() => expect(h.signIn).toHaveBeenCalledTimes(1));
    expect(h.signIn).toHaveBeenCalledWith({
      redirectTo: studentRedirectUrl('ZZZZZZ', window.location.origin),
      includeDistrictHint: true,
    });
    // One lookup only: the second press is the user overruling it, not a re-check.
    expect(h.fetchMeta).toHaveBeenCalledTimes(1);
  });

  it('correcting the code re-checks instead of sailing through on the warning', async () => {
    h.fetchMeta.mockResolvedValueOnce({ kind: 'none' });
    render(<SignedOutLanding idleSignedOut={false} />);
    typeCode('ZZZZZZ');
    pressContinue();
    await screen.findByRole('alert');

    h.fetchMeta.mockResolvedValueOnce({ kind: 'name', name: 'Algebra 1' });
    typeCode(CODE);
    expect(screen.queryByRole('alert')).toBeNull();
    pressContinue();

    await waitFor(() => expect(h.fetchMeta).toHaveBeenCalledTimes(2));
    expect(h.fetchMeta).toHaveBeenLastCalledWith(CODE);
  });

  it('a network failure on the lookup proceeds silently rather than stranding', async () => {
    h.fetchMeta.mockResolvedValue({ kind: 'error' });
    render(<SignedOutLanding idleSignedOut={false} />);
    typeCode(CODE);
    pressContinue();

    await waitFor(() => expect(h.signIn).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('keeps the idle sign-out explanation (it moved here with the landing)', () => {
    render(<SignedOutLanding idleSignedOut />);
    expect(
      screen.getByText('You were signed out after being away. Your work is saved.'),
    ).not.toBeNull();
  });

  it('weights the student door primary and the teacher door quiet (board Row 0)', () => {
    render(<SignedOutLanding idleSignedOut={false} />);
    const teacher = screen.getByRole('button', { name: LANDING_COPY.teacherAction });
    // The quiet door is a text link, not a filled button — students must not
    // mis-tap into attestation (the variant-A weighting).
    expect(teacher.className).toContain('underline');
    expect(teacher.className).not.toContain('bg-ink');
  });
});
