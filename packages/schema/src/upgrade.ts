// =============================================================================
// upgrade.ts — server-side upgrade-on-read (components-as-data ruling 4A)
// -----------------------------------------------------------------------------
// The read API (S2) upgrades every stored activity_versions.content to the
// CURRENT schema before sanitizing and serving it, so the viewer only ever
// sees the latest shape. This module is that seam.
//
// The chain is EMPTY today, deliberately: schemaVersion is 2 and the 1→2
// reshape was a greenfield hard-cut with no migrate path (document.ts header —
// a stray v1 fails loudly rather than mis-parsing). When schemaVersion 3
// lands, its migration is one pure entry in UPGRADES below; stored rows stay
// at their original version forever and are upgraded on read, never mutated.
//
// Distinct from the two other "upgrade" layers, on purpose:
//   - Mark/definition legacy preprocessing (inline.ts) runs INSIDE
//     ActivityDocument.parse — additive shape drift within one schemaVersion.
//   - migrateSubmissionResponses (submission.ts) is the SUBMISSION wire's
//     ladder — a different document with its own versioning.
// This module owns only the top-level ActivityDocument schemaVersion.
// =============================================================================

import { ActivityDocument } from './document.js';

/** The schemaVersion this build parses and serves. Guard-tested against the
 * ActivityDocument literal so the constant can't drift from the parser. */
export const ACTIVITY_SCHEMA_VERSION = 2;

/** Thrown when stored content cannot be brought to the current schema. The
 * read API maps this to an explicit error state (failure-modes table: "upgrade
 * chain bug on old version" → clear error, never a white screen). */
export class UpgradeError extends Error {
  constructor(
    message: string,
    /** The schemaVersion the stored document claimed, when readable. */
    readonly storedVersion?: number,
  ) {
    super(message);
    this.name = 'UpgradeError';
  }
}

/** One step of the chain: a PURE json → json rewrite from `from` to `from+1`.
 * No I/O, no randomness, no Date — upgrading the same stored row twice must
 * yield identical output (the per-version read cache depends on it). */
interface UpgradeStep {
  readonly from: number;
  readonly run: (raw: Record<string, unknown>) => Record<string, unknown>;
}

// The chain. Append-only; each entry bumps exactly one version. Empty today —
// see the header for why v1 deliberately has no entry.
const UPGRADES: readonly UpgradeStep[] = [];

export interface UpgradeResult {
  /** The document, parsed and validated at the CURRENT schema. */
  doc: ActivityDocument;
  /** The schemaVersion the stored content arrived at (=== current when no
   * chain step ran). Callers may log it; the cache stores the target. */
  fromSchemaVersion: number;
}

/**
 * Bring raw stored content (activity_versions.content) to the current schema
 * and validate it. Throws UpgradeError on any content this build cannot serve
 * — an unknown/future version, a version with no chain path, or content that
 * fails validation after upgrading. Never returns a partially-upgraded doc.
 */
export function upgradeActivityDocument(raw: unknown): UpgradeResult {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new UpgradeError('Stored content is not an object');
  }
  const stored = raw as Record<string, unknown>;
  const version = stored.schemaVersion;
  if (typeof version !== 'number' || !Number.isInteger(version)) {
    throw new UpgradeError('Stored content has no integer schemaVersion');
  }
  if (version > ACTIVITY_SCHEMA_VERSION) {
    // Content written by a NEWER build than this one (deploy-order slip).
    throw new UpgradeError(
      `Stored schemaVersion ${version} is newer than this build's ` +
        `${ACTIVITY_SCHEMA_VERSION} — refusing to guess`,
      version,
    );
  }

  let current = stored;
  let at = version;
  while (at < ACTIVITY_SCHEMA_VERSION) {
    const step = UPGRADES.find((u) => u.from === at);
    if (!step) {
      // v1 lands here by design (greenfield hard-cut: no migrate(1→2)).
      throw new UpgradeError(
        `No upgrade path from schemaVersion ${at} — cannot serve`,
        version,
      );
    }
    current = step.run(current);
    at += 1;
  }

  const parsed = ActivityDocument.safeParse(current);
  if (!parsed.success) {
    throw new UpgradeError(
      `Content failed validation at schemaVersion ${at}: ` +
        parsed.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; '),
      version,
    );
  }
  return { doc: parsed.data, fromSchemaVersion: version };
}
