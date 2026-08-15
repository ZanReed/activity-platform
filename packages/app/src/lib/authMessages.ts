/**
 * Auth-boundary error classification + student-facing copy (identity slice
 * E-7 / design §12). Two layers, deliberately separate:
 *
 *  1. The WIRE contract — SQL raise strings in authContract.json, shared
 *     verbatim with migration 0027 and the verify runner. Match against
 *     these; never against retyped literals.
 *  2. The COPY layer — what a 13-year-old reads. 8th-grade level, blame-free
 *     (design P1/P4 rulings). Screens render these, never the wire strings.
 *
 * Sign-in (OAuth callback) failures are a different transport: GoTrue never
 * forwards the trigger's raise text, so callback errors are classified by
 * PRESENCE only and the screens use cause-agnostic copy (P1). Which screen a
 * surface renders is the P3 route split: /join/:code + the StudentViewer gate
 * show school-account guidance; Home shows the generic frame.
 */
import contract from './authContract.json' with { type: 'json' };

export const AUTH_CONTRACT = contract;

export type JoinErrorKind =
  | 'not_student'
  | 'disabled'
  | 'bad_code'
  | 'domain'
  | 'unknown';

const DOMAIN_PREFIX = contract.joinClassErrors.domainTemplate.split('%')[0] ?? '';

/** Classify a join_class RPC error message against the wire contract. */
export function classifyJoinError(message: string): JoinErrorKind {
  if (message.includes(contract.joinClassErrors.notStudent)) return 'not_student';
  if (message.includes(contract.joinClassErrors.disabled)) return 'disabled';
  if (message.includes(contract.joinClassErrors.badCode)) return 'bad_code';
  if (DOMAIN_PREFIX && message.includes(DOMAIN_PREFIX.trim())) return 'domain';
  return 'unknown';
}

/**
 * Student-facing copy per join failure (design board frame 1b). Rendered
 * inline under the code input with the typed code preserved.
 */
export const JOIN_ERROR_COPY: Record<JoinErrorKind, string> = {
  bad_code: "That code didn't match a class. Check it with your teacher and try again.",
  domain: 'This class is for school accounts only. Sign in with your school account.',
  disabled: "This account isn't active — ask your teacher.",
  not_student: 'Join links are for student accounts.',
  unknown: "Something went wrong joining the class. Try again, and if it keeps happening, ask your teacher.",
};

/**
 * OAuth callback error detection (E-7). Supabase surfaces callback errors in
 * the URL hash (implicit flow) or query string; parse BOTH (design P4/#hash
 * form verified against the live Probe 2 recording before this ships).
 */
export function readAuthCallbackError(url: URL): string | null {
  const fromQuery = url.searchParams.get('error_description') ?? url.searchParams.get('error');
  if (fromQuery) return fromQuery;
  const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
  const hashParams = new URLSearchParams(hash);
  return hashParams.get('error_description') ?? hashParams.get('error');
}

/* ---------------------------------------------------------------------------
 * 0033 admission: redeem + claim (R2/R3/R6)
 * -------------------------------------------------------------------------
 * The transport difference that decided the whole architecture: these RPC
 * raises REACH THE BROWSER verbatim, where the trigger's did not. That is why
 * every refusal moved into an RPC — the copy below is reachable, so a student
 * gets a named reason instead of "something went wrong".
 */
export type RedeemErrorKind =
  | 'bad_code'
  | 'domain'
  | 'disabled'
  | 'signed_out'
  | 'wrong_role'
  | 'class_full'
  | 'unknown';

/** Classify a redeem_join_code error against the wire contract. Order matters:
 *  redeem delegates to join_class after promoting, so a single call can raise
 *  from either body — the shared strings (bad_code/domain/disabled) are matched
 *  through the same joinClassErrors entries both functions use. */
export function classifyRedeemError(message: string): RedeemErrorKind {
  if (message.includes(contract.redeemErrors.signedOut)) return 'signed_out';
  if (message.includes(contract.redeemErrors.wrongRole)) return 'wrong_role';
  if (message.includes(contract.redeemErrors.classFull)) return 'class_full';
  if (message.includes(contract.joinClassErrors.disabled)) return 'disabled';
  if (message.includes(contract.joinClassErrors.badCode)) return 'bad_code';
  if (DOMAIN_PREFIX && message.includes(DOMAIN_PREFIX.trim())) return 'domain';
  return 'unknown';
}

/** Student-facing redeem copy (R5-DR row 2). Every string names a next action:
 *  no state in this family is a dead end. */
export const REDEEM_ERROR_COPY: Record<RedeemErrorKind, string> = {
  bad_code: "That code didn't match a class. Check it with your teacher and try again.",
  domain: 'This class needs your school account. Sign in with your school Google account to join.',
  disabled: "This account isn't active — ask your teacher.",
  signed_out: 'Your sign-in expired. Sign in again to join.',
  wrong_role: "You're signed in as a teacher. Use a student account to join a class.",
  // Deliberately NOT the wire string (which reads for a log): the copy layer is
  // what a 13-year-old sees, and the distinctness is pinned by the contract test.
  class_full: 'This class is already full. Let your teacher know so they can sort it out.',
  unknown: 'Something went wrong joining the class. Try again, and if it keeps happening, ask your teacher.',
};

export type ClaimErrorKind =
  | 'signed_out'
  | 'already_set_up'
  | 'no_attestation'
  | 'class_cap'
  | 'unknown';

export function classifyClaimError(message: string): ClaimErrorKind {
  if (message.includes(contract.claimTeacherErrors.signedOut)) return 'signed_out';
  if (message.includes(contract.claimTeacherErrors.alreadySetUp)) return 'already_set_up';
  if (message.includes(contract.claimTeacherErrors.noAttestation)) return 'no_attestation';
  if (message.includes(contract.claimTeacherErrors.classCapTemplate)) return 'class_cap';
  return 'unknown';
}

export const CLAIM_ERROR_COPY: Record<ClaimErrorKind, string> = {
  signed_out: 'Your sign-in expired. Sign in again to continue.',
  already_set_up: 'This account is already set up. Reload to continue.',
  no_attestation: 'Please confirm you are an educator to continue.',
  class_cap: 'This account has reached its class limit. Contact support to raise it.',
  unknown: 'Something went wrong setting up your account. Try again.',
};

/** Onboarding copy — the R5-DR fork and the attestation card. */
export const ONBOARDING_COPY = {
  forkTitle: "Welcome! Let's get you set up.",
  forkBody: "Ask your teacher for the class code if you don't have it.",
  codeLabel: 'Have a class code?',
  codeAction: 'Join your class',
  teacherAction: "I'm a teacher",
  claimTitle: 'Set up your teacher account',
  claimBody: 'For educators using this with their own classes.',
  claimAttestation:
    'I am an educator, and I am authorized by my school to use this platform with my students.',
  claimAction: 'Continue as a teacher',
  claimBack: 'Back',
  signedInAs: 'Signed in as',
} as const;

/**
 * Landing copy — the R5-DR PRE-AUTH fork (board Row 0), which is the DOMINANT
 * path: a student self-selects the code door and a teacher the teacher door
 * BEFORE Google, so the post-auth ONBOARDING_COPY fork above only ever serves
 * intent-less arrivals. Wording is the approved board's verbatim.
 *
 * `codeNotFound` is shared with /join/:code on purpose: the same DR-6
 * definitive-negative is now rendered by two surfaces, and two copies of one
 * sentence is exactly how they drift apart (P11).
 */
export const LANDING_COPY = {
  lede: 'Students join with a class code. Teachers build the activities.',
  studentHeading: 'Students',
  codeLabel: 'Have a class code?',
  studentAction: 'Continue with Google',
  teacherAction: "I'm a teacher · get started",
  teacherBody: "Teachers sign in with Google and confirm they're an educator.",
  codeNotFound: "This code doesn't match a class — double-check it with your teacher.",
  /** Shown WITH codeNotFound: the anon meta endpoint can be stale, so the
   *  check warns and then gets out of the way — it never hard-blocks (DR-6). */
  codeNotFoundContinue: 'Press again to continue anyway.',
} as const;

/** Landing announcements (R5-DR a11y block, same role=status channel as the
 *  onboarding card). Kept separate from ADMISSION_ANNOUNCEMENTS so the strings
 *  the a11y lane already asserts there stay a closed set. */
export const LANDING_ANNOUNCEMENTS = {
  checking: 'Checking your class code',
  notFound: 'That code did not match a class',
  continuing: 'Taking you to Google to sign in',
} as const;

/** aria-live announcements (R5-DR a11y block). The a11y lane asserts these
 *  exact strings, so they are contract, not incidental component copy. */
export const ADMISSION_ANNOUNCEMENTS = {
  redeeming: 'Joining your class',
  redeemed: 'Joined',
  redeemFailed: 'Could not join',
  claiming: 'Setting up your teacher account',
  claimed: 'Teacher account ready',
  claimFailed: 'Could not set up your account',
} as const;

/** Sign-in-failed copy — cause-agnostic (P1); school-account line only on
 * student surfaces (P3). `genericBody` replaced "Check your connection and
 * try again." (T16, Probe 2 evidence): in the one real refusal observed the
 * connection was fine and the ACCOUNT was declined, so the old sentence
 * actively misdirected. The body now names the two real user levers and
 * guesses no cause. */
export const SIGN_IN_FAILED_COPY = {
  title: "We couldn't sign you in",
  genericBody: 'Try again, or sign in with a different account.',
  studentGuidance:
    'Most of the time this means the wrong Google account. Choose the account that ends in',
  retry: 'Try again',
  fallback: 'Still stuck? Ask your teacher.',
} as const;
