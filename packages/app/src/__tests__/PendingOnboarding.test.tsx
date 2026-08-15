// @vitest-environment jsdom
// =============================================================================
// PendingOnboarding.test.tsx — the 0033 self-serve admission surface (R5-DR)
// -----------------------------------------------------------------------------
// What matters here, and why each row exists:
//
//  * The FORK is code-first (design board row 1, variant A): the code field and
//    its action are primary, the teacher path is a quiet link. A regression to
//    a symmetric fork would tax the dominant journey, so the weighting is
//    pinned by asserting the teacher path is not a primary button.
//  * REFUSALS REACH THE USER. This is the whole reason admission moved into an
//    RPC (R2) — the trigger's raise text never reached the browser. If these
//    rows ever go green while showing generic copy, the architecture's premise
//    has broken.
//  * The attestation is UNCHECKED BY DEFAULT and gates the action (3.1C mirror
//    + DR-13): an attestation nobody actively made is not an attestation.
//  * ANNOUNCEMENTS are contract strings the a11y lane also asserts, so they are
//    pinned here against ADMISSION_ANNOUNCEMENTS rather than typed literals.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({
  redeem: vi.fn<[string], Promise<unknown>>(),
  claim: vi.fn<[], Promise<void>>(),
}));

vi.mock('../lib/classes', () => ({
  redeemJoinCode: h.redeem,
  claimTeacher: h.claim,
}));

import { PendingOnboarding } from '../components/PendingOnboarding';
import {
  ADMISSION_ANNOUNCEMENTS,
  ONBOARDING_COPY,
  REDEEM_ERROR_COPY,
  CLAIM_ERROR_COPY,
} from '../lib/authMessages';
import contract from '../lib/authContract.json';

function setup(props: Partial<React.ComponentProps<typeof PendingOnboarding>> = {}) {
  const onPromoted = vi.fn();
  const onSignOut = vi.fn();
  render(
    <PendingOnboarding
      email="kim@gmail.example"
      onPromoted={onPromoted}
      onSignOut={onSignOut}
      {...props}
    />,
  );
  return { onPromoted, onSignOut };
}

afterEach(() => {
  cleanup();
  h.redeem.mockReset();
  h.claim.mockReset();
});

describe('the fork (code-first, variant A)', () => {
  it('leads with the code field and its primary action', () => {
    setup();
    expect(screen.getByLabelText(ONBOARDING_COPY.codeLabel)).toBeTruthy();
    expect(screen.getByRole('button', { name: ONBOARDING_COPY.codeAction })).toBeTruthy();
  });

  it('keeps the teacher path present but quiet (not a primary button)', () => {
    setup();
    const teacher = screen.getByRole('button', { name: ONBOARDING_COPY.teacherAction });
    // The weighting IS the design decision: a primary-styled teacher path would
    // invite students into attestation, which variant A exists to prevent.
    expect(teacher.className).not.toContain('bg-ink');
  });

  it('disables the join action until a code is entered', () => {
    setup();
    const join = screen.getByRole('button', {
      name: ONBOARDING_COPY.codeAction,
    }) as HTMLButtonElement;
    expect(join.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(ONBOARDING_COPY.codeLabel), {
      target: { value: 'QX7M2P' },
    });
    expect(join.disabled).toBe(false);
  });

  it('upper-cases typed codes and pre-fills from the deep link', () => {
    setup({ initialCode: 'AB12CD' });
    const input = screen.getByLabelText(ONBOARDING_COPY.codeLabel) as HTMLInputElement;
    expect(input.value).toBe('AB12CD');
    fireEvent.change(input, { target: { value: 'qx7m2p' } });
    expect(input.value).toBe('QX7M2P');
  });

  it('keeps the code field paste-friendly and zoom-safe on iOS', () => {
    setup();
    const input = screen.getByLabelText(ONBOARDING_COPY.codeLabel) as HTMLInputElement;
    // ONE field, not six boxes — a student pasting from chat is the common case.
    expect(input.getAttribute('autocapitalize')).toBe('off');
    expect(input.getAttribute('maxlength')).toBe('6');
    // >=16px or iOS Safari zooms the viewport on focus.
    expect(input.className).toContain('text-lg');
  });
});

describe('redeem outcomes', () => {
  it('promotes on success and announces it', async () => {
    h.redeem.mockResolvedValue({ classId: 'c1', name: 'Algebra I', joinedAt: 'now' });
    const { onPromoted } = setup({ initialCode: 'QX7M2P' });
    fireEvent.click(screen.getByRole('button', { name: ONBOARDING_COPY.codeAction }));
    await waitFor(() => expect(onPromoted).toHaveBeenCalledOnce());
    expect(h.redeem).toHaveBeenCalledWith('QX7M2P');
    expect(screen.getByRole('status').textContent).toBe(ADMISSION_ANNOUNCEMENTS.redeemed);
  });

  it('renders the NAMED refusal for a bad code, not generic copy', async () => {
    h.redeem.mockRejectedValue(new Error(contract.joinClassErrors.badCode));
    setup({ initialCode: 'ZZZZZZ' });
    fireEvent.click(screen.getByRole('button', { name: ONBOARDING_COPY.codeAction }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe(REDEEM_ERROR_COPY.bad_code),
    );
    expect(screen.getByRole('alert').textContent).not.toBe(REDEEM_ERROR_COPY.unknown);
  });

  it('names the school-account requirement for a domain-restricted class', async () => {
    h.redeem.mockRejectedValue(new Error('This class is limited to district.org accounts'));
    setup({ initialCode: 'QX7M2P' });
    fireEvent.click(screen.getByRole('button', { name: ONBOARDING_COPY.codeAction }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe(REDEEM_ERROR_COPY.domain),
    );
  });

  it('surfaces the class-full cap in student language', async () => {
    h.redeem.mockRejectedValue(new Error(contract.redeemErrors.classFull));
    setup({ initialCode: 'QX7M2P' });
    fireEvent.click(screen.getByRole('button', { name: ONBOARDING_COPY.codeAction }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe(REDEEM_ERROR_COPY.class_full),
    );
  });

  it('returns focus to the code field after a refusal so retry is one keystroke', async () => {
    h.redeem.mockRejectedValue(new Error(contract.joinClassErrors.badCode));
    setup({ initialCode: 'ZZZZZZ' });
    fireEvent.click(screen.getByRole('button', { name: ONBOARDING_COPY.codeAction }));
    await waitFor(() => screen.getByRole('alert'));
    expect(document.activeElement).toBe(screen.getByLabelText(ONBOARDING_COPY.codeLabel));
  });

  it('does not fire a second redeem while one is in flight', async () => {
    let release: (v: unknown) => void = () => {};
    h.redeem.mockReturnValue(new Promise((r) => (release = r)));
    setup({ initialCode: 'QX7M2P' });
    const join = screen.getByRole('button', { name: ONBOARDING_COPY.codeAction });
    fireEvent.click(join);
    fireEvent.click(join);
    expect(h.redeem).toHaveBeenCalledOnce();
    release({ classId: 'c1', name: 'A', joinedAt: 'now' });
  });
});

describe('the teacher path', () => {
  it('switches to attestation and back without losing the fork', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: ONBOARDING_COPY.teacherAction }));
    expect(screen.getByText(ONBOARDING_COPY.claimTitle)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: ONBOARDING_COPY.claimBack }));
    expect(screen.getByLabelText(ONBOARDING_COPY.codeLabel)).toBeTruthy();
  });

  it('is unchecked by default and gates the action (3.1C mirror / DR-13)', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: ONBOARDING_COPY.teacherAction }));
    const box = screen.getByRole('checkbox') as HTMLInputElement;
    const action = screen.getByRole('button', {
      name: ONBOARDING_COPY.claimAction,
    }) as HTMLButtonElement;
    expect(box.checked).toBe(false);
    expect(action.disabled).toBe(true);
    fireEvent.click(box);
    expect(action.disabled).toBe(false);
  });

  it('promotes on a successful claim', async () => {
    h.claim.mockResolvedValue(undefined);
    const { onPromoted } = setup();
    fireEvent.click(screen.getByRole('button', { name: ONBOARDING_COPY.teacherAction }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: ONBOARDING_COPY.claimAction }));
    await waitFor(() => expect(onPromoted).toHaveBeenCalledOnce());
    expect(screen.getByRole('status').textContent).toBe(ADMISSION_ANNOUNCEMENTS.claimed);
  });

  it('renders the named claim refusal', async () => {
    h.claim.mockRejectedValue(new Error(contract.claimTeacherErrors.alreadySetUp));
    setup();
    fireEvent.click(screen.getByRole('button', { name: ONBOARDING_COPY.teacherAction }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: ONBOARDING_COPY.claimAction }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe(CLAIM_ERROR_COPY.already_set_up),
    );
  });
});

describe('the account footer', () => {
  it('names the signed-in account and offers sign-out (shared-device escape)', () => {
    const { onSignOut } = setup();
    expect(screen.getByText(/kim@gmail\.example/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });
});
