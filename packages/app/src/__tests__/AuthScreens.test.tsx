// @vitest-environment jsdom
// =============================================================================
// AuthScreens.test.tsx — the T16 copy pin (S9 Drop 2, §12 finding)
// -----------------------------------------------------------------------------
// Probe 2's evidence: in the one real sign-in refusal observed, the
// connection was fine and the ACCOUNT was declined — yet the generic frame
// said "Check your connection and try again.", asserting a cause where
// ruling P1 forbids guessing. The body is now cause-agnostic and names the
// two real user levers (retry / different account). This pins BOTH halves:
// the ruled copy renders, and the cause-guessing sentence is gone.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('../lib/auth', () => ({ signInWithGoogle: vi.fn() }));
vi.mock('../lib/supabase', () => ({ districtHint: undefined }));

import { SignInFailedCard } from '../components/AuthScreens';
import { SIGN_IN_FAILED_COPY } from '../lib/authMessages';

afterEach(cleanup);

describe('SignInFailedCard (generic frame)', () => {
    it('renders the cause-agnostic body — never the connection guess', () => {
        render(<SignInFailedCard studentSurface={false} redirectTo="/" />);
        expect(screen.getByText(SIGN_IN_FAILED_COPY.title)).toBeTruthy();
        expect(screen.getByText(SIGN_IN_FAILED_COPY.genericBody)).toBeTruthy();
        // The copy itself must not smuggle a cause back in.
        expect(SIGN_IN_FAILED_COPY.genericBody).not.toMatch(/connection/i);
        expect(screen.queryByText(/check your connection/i)).toBeNull();
    });

    it('the student surface keeps the P3 school-account line instead', () => {
        render(<SignInFailedCard studentSurface redirectTo="/" />);
        expect(
            screen.getByText(/wrong Google account/i, { exact: false }),
        ).toBeTruthy();
        expect(screen.queryByText(SIGN_IN_FAILED_COPY.genericBody)).toBeNull();
    });
});
