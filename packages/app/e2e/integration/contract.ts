// =============================================================================
// e2e/integration/contract.ts — the lane's ONE identity source (DX ruling D10)
// -----------------------------------------------------------------------------
// Every identity the integration lane seeds or signs in with derives from
// here, and the seeding SQL is GENERATED from these constants at setup time —
// so a fixture and the spec asserting against it cannot drift (P2). The
// domain is deliberately .example (RFC 2606): even if a run escaped to the
// wrong database, these can never be real accounts.
// =============================================================================

/** The admitted student domain the lane seeds into student_domain. */
export const INT_DOMAIN = 'integration.example';

export const INT_TEACHER = {
  email: `int-teacher@${INT_DOMAIN}`,
  password: 'integration-lane-teacher-pw-1',
};

export const INT_STUDENT = {
  email: `int-student@${INT_DOMAIN}`,
  password: 'integration-lane-student-pw-1',
};

/** An email OUTSIDE both the allowlist and the domain — the trigger must
 * REFUSE it (the negative branch that proves the others aren't vacuous). */
export const INT_OUTSIDER = {
  email: 'int-outsider@elsewhere.example',
  password: 'integration-lane-outsider-pw-1',
};

/** The local stack's well-known demo ANON key (fixed across supabase-cli
 * versions unless the project overrides the JWT secret). The dev server is
 * built with this statically; the preflight VERIFIES it against
 * `supabase status` and names the fix if a custom secret is in use. */
export const LOCAL_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321';
