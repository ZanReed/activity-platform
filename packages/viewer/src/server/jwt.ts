// =============================================================================
// server/jwt.ts — the ONE unverified `sub` reader (G2)
// -----------------------------------------------------------------------------
// Decoded WITHOUT verification, deliberately: by the time either handler calls
// this, its user-scoped RPC has already succeeded, which means PostgREST
// verified the token's signature. This only re-reads the `sub` claim — to key
// the student's serve shuffle (read path) and their section_checks row
// (check path). NEVER an authorization input.
//
// Was pasted byte-identically into both handlers as jwtSub / jwtSubject
// (s2-retro finding 8); one copy, one name, since 2026-08-06.
// =============================================================================

/** The token's `sub` claim, or null when the header carries no readable JWT. */
export function jwtSub(authHeader: string): string | null {
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const json = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    ) as { sub?: unknown };
    return typeof json.sub === 'string' ? json.sub : null;
  } catch {
    return null;
  }
}
