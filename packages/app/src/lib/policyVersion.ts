// The privacy-policy version string in force. Single source of truth —
// consumed by the /privacy route (displayed), the class-creation flow (stored
// on the class row as assertion_text_version, ruling 3.1C), and the drift
// guard test that pins it to docs/compliance/privacy-policy.md.
//
// Bump when the policy text changes materially, together with the doc.
// draft-2 (2026-08-07) is the FIRST real bump, and it exists because the
// wording changed in substance: the class-creation assertion dropped its
// under-13 school-authorization clause (the platform declines under-13
// sign-ins unconditionally — the clause promised a branch every other pack
// doc disclaims; eng review D2), and the privacy policy gained the
// departed-student retention disclosure + the roster-email correction
// (eng review D3). Every class row created from here records this version.
// draft-3 (2026-08-15) is the second real bump, and like draft-2 it exists
// because the wording changed in SUBSTANCE, not in style: self-serve admission
// (migration 0033) means a person can now hold an account before any teacher
// has vouched for them, so the pack gained "How you get an account" (the two
// doors, and the plain statement that a role-less account reaches nothing but
// link-shared activity content), the educator-confirmation rows in the data
// map, and the never-joined-account retention paragraph. The educator
// attestation stored by claim_teacher records THIS string, so a teacher who
// confirmed against draft-2 wording stays distinguishable from one who
// confirmed against draft-3.
export const POLICY_VERSION = '2026-08-15-draft-3';
