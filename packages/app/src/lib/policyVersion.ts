// The privacy-policy version string in force. Single source of truth —
// consumed by the /privacy route (displayed), the class-creation flow (stored
// on the class row as assertion_text_version, ruling 3.1C), and the drift
// guard test that pins it to docs/compliance/privacy-policy.md.
//
// Bump when the policy text changes materially, together with the doc.
export const POLICY_VERSION = '2026-07-28-draft-1';
