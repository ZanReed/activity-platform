// =============================================================================
// upgrade.test.ts — the upgrade-on-read seam (S2, ruling 4A)
// -----------------------------------------------------------------------------
// The chain is empty at schemaVersion 2, so today's behavioral surface is the
// gate itself: current content passes through parsed, everything the build
// cannot serve fails LOUDLY with UpgradeError (never a white-screen null, never
// a guessed migration). The v1 rejection pins the documented greenfield
// hard-cut (document.ts header: deliberately NO migrate(1→2)).
//
// OWED WHEN THE FIRST REAL MIGRATION LANDS (schemaVersion 3+): a golden
// fixture PER historical version — a frozen stored-shape document for each
// old version, asserted to upgrade to a frozen expected current-shape result.
// The failure-modes table promises "golden fixtures per historical
// schemaVersion"; that promise is vacuously met today and becomes real work
// the moment migrate(2→3) exists. Add the fixture in the same commit as the
// migration step.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
  ACTIVITY_SCHEMA_VERSION,
  ActivityDocument,
  UpgradeError,
  createEmptyDocument,
  upgradeActivityDocument,
} from '../src/index.js';

describe('upgradeActivityDocument', () => {
  it('the exported constant matches the ActivityDocument literal', () => {
    // Reflection off the Zod schema, so the constant can't drift from the
    // parser (the same trick the registry guard uses on Block).
    expect(ActivityDocument.shape.schemaVersion.value).toBe(
      ACTIVITY_SCHEMA_VERSION,
    );
  });

  it('passes current-version content through, parsed and validated', () => {
    const doc = createEmptyDocument({ title: 'Seam check' });
    const result = upgradeActivityDocument(JSON.parse(JSON.stringify(doc)));
    expect(result.fromSchemaVersion).toBe(ACTIVITY_SCHEMA_VERSION);
    expect(result.doc.meta.title).toBe('Seam check');
    expect(result.doc.schemaVersion).toBe(ACTIVITY_SCHEMA_VERSION);
  });

  it('is deterministic — upgrading the same stored row twice is identical', () => {
    // The per-version read cache depends on this (cache stores the output).
    const stored = JSON.parse(JSON.stringify(createEmptyDocument()));
    const a = upgradeActivityDocument(stored);
    const b = upgradeActivityDocument(stored);
    expect(JSON.stringify(a.doc)).toBe(JSON.stringify(b.doc));
  });

  it('rejects v1 loudly — the greenfield hard-cut has no upgrade path', () => {
    const v1 = { schemaVersion: 1, meta: { title: 'old' }, sections: [] };
    expect(() => upgradeActivityDocument(v1)).toThrowError(UpgradeError);
    expect(() => upgradeActivityDocument(v1)).toThrowError(/No upgrade path/);
  });

  it('rejects a FUTURE version rather than guessing', () => {
    const future = {
      ...JSON.parse(JSON.stringify(createEmptyDocument())),
      schemaVersion: ACTIVITY_SCHEMA_VERSION + 1,
    };
    expect(() => upgradeActivityDocument(future)).toThrowError(/newer than/);
  });

  it('rejects content with no readable schemaVersion', () => {
    expect(() => upgradeActivityDocument({})).toThrowError(UpgradeError);
    expect(() => upgradeActivityDocument(null)).toThrowError(UpgradeError);
    expect(() => upgradeActivityDocument([])).toThrowError(UpgradeError);
    expect(() =>
      upgradeActivityDocument({ schemaVersion: 'two' }),
    ).toThrowError(UpgradeError);
  });

  it('rejects current-version content that fails validation', () => {
    const mangled = {
      schemaVersion: ACTIVITY_SCHEMA_VERSION,
      meta: { title: 42 },
      sections: 'nope',
    };
    try {
      upgradeActivityDocument(mangled);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(UpgradeError);
      expect((err as UpgradeError).storedVersion).toBe(
        ACTIVITY_SCHEMA_VERSION,
      );
      expect((err as UpgradeError).message).toContain('failed validation');
    }
  });
});
