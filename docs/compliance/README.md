# Compliance doc pack (S1 — student accounts)

> **DRAFT FOR DISTRICT / COUNSEL REVIEW — NOT LEGAL ADVICE.** These documents
> were prepared as working drafts for the components-as-data re-architecture
> (ruling TV1-A, 2026-07-28). Before any real student signs in, they must be
> reviewed by the district's data-privacy officer and/or counsel, and the
> placeholders (marked `⟨…⟩`) filled in.

| Doc | What it is | Who reads it |
|---|---|---|
| [privacy-policy.md](privacy-policy.md) | Plain-language policy; source for the public `/privacy` route | Students, parents, teachers |
| [data-map.md](data-map.md) | Every piece of personal data: what, where, why, how long | District DPO, author |
| [retention-policy.md](retention-policy.md) | Retention windows + the deletion mechanics that enforce them | District DPO, author |
| [school-authorization-template.md](school-authorization-template.md) | Fill-in agreement a school signs to authorize classroom use | School admin |

Ground rules baked into all four (from the ruled design):

- **13+ in v1.** The teacher asserts age eligibility at class creation (ruling
  3.1C); the assertion is recorded on the class row (`age_assertion_at/by/
  text_version`). Under-13 via school authorization is a later compliance arc.
- **Answers never reach clients** (ruling Q2B) — graded server-side.
- **No behavioral telemetry.** Analytics are census-based aggregates (P3A).
- **Data minimization:** a student account is district email + Google display
  name (which may be absent — 0021 stores a name or NULL, never a fallback to
  the email), nothing else. `ip_hash` exists for abuse detection only, never
  raw IPs.
- **One anonymous disclosure, by design:** the pre-auth screen shows an
  activity's title and its teacher's display name to anyone with the link
  (ruling 3.2A). No student data is ever disclosed without a sign-in. See
  [data-map.md](data-map.md) → Disclosures.
