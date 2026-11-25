// =============================================================================
// rpcStatus — the ONE mapping from a caller-RPC failure to an HTTP status
// -----------------------------------------------------------------------------
// Review 2026-11-26 B3. Five sites used to pick 401 by testing the error TEXT
// against /JWT|token|auth/i, so any Postgres error that merely mentioned
// `authenticated`, `author_id` or the `auth` schema told the student to sign in
// again and was never logged, and every other failure echoed the raw database
// message to the student. The decision now reads what PostgREST actually says:
//
//   - 'Not available' (the caller RPCs' single no-oracle refusal, raised as
//     42501 so PostgREST answers 403) → 404. Checked FIRST: its status would
//     otherwise read as an auth failure.
//   - HTTP 401, or a PGRST301–303 code (PostgREST's JWT errors) → 401.
//   - our own SQL's exact 'Not authorized' (raised when auth.uid() is null,
//     P0001 / HTTP 400) → 401: an accepted token with no subject.
//   - anything else → 500, with a FIXED message; the detail goes to the log.
//
// Every non-404 is logged, so a misrouted 401 shows up in the function logs
// instead of as a student quietly signing in again.
// =============================================================================

/** The parts of a supabase-js / PostgREST error this mapping reads. */
export interface RpcErrorLike {
  message?: string;
  /** PostgREST's `PGRSTxxx` or the Postgres SQLSTATE. */
  code?: string;
}

/** The fixed text a 500 carries; the real error is logged, never echoed. */
export const RPC_FAILED_MESSAGE = 'Something went wrong on our side';

/** PostgREST's JWT errors: 301 invalid/undecodable, 302 anonymous where a
 * role is required, 303 claims validation (expired, bad audience). */
const JWT_CODES = new Set(['PGRST301', 'PGRST302', 'PGRST303']);

export function rpcStatus(
  error: RpcErrorLike | null | undefined,
  httpStatus?: number,
): 404 | 401 | 500 {
  const message = error?.message ?? '';
  if (message.includes('Not available')) return 404;
  if (httpStatus === 401) return 401;
  if (message === 'Not authorized') return 401;
  if (error?.code !== undefined && JWT_CODES.has(error.code)) return 401;
  return 500;
}

/** The status, the message to send, and the log line, for one RPC failure. */
export function rpcFailure(
  label: string,
  error: RpcErrorLike | null | undefined,
  httpStatus?: number,
): { status: 404 | 401 | 500; message: string } {
  const status = rpcStatus(error, httpStatus);
  if (status === 404) return { status, message: 'Not available' };
  if (status === 401) {
    console.warn(`[${label}] RPC refused the caller's token:`, {
      status: httpStatus,
      code: error?.code,
      message: error?.message,
    });
    return { status, message: 'Your session has expired. Please sign in again.' };
  }
  console.error(`[${label}] RPC error:`, { status: httpStatus, error });
  return { status, message: RPC_FAILED_MESSAGE };
}
