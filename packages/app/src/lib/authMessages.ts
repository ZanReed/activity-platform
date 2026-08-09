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

/** Sign-in-failed copy — cause-agnostic (P1); school-account line only on student surfaces (P3). */
export const SIGN_IN_FAILED_COPY = {
  title: "We couldn't sign you in",
  studentGuidance:
    'Most of the time this means the wrong Google account. Choose the account that ends in',
  retry: 'Try again',
  fallback: 'Still stuck? Ask your teacher.',
} as const;
