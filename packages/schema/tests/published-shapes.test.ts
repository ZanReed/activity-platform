// =============================================================================
// published-shapes.test.ts — today's schema still reads yesterday's documents
// (review 2026-11-26, C8)
// -----------------------------------------------------------------------------
// `schemaVersion` has stayed 2 since the July hard cut and the upgrade chain is
// empty: the ruled policy is additive change inside one version. A change meant
// as additive that tightens a refine, drops an enum value or renames a field is
// an UpgradeError on a live activity, found by a student. This guard holds a
// few FROZEN documents, each written by the repo's own code on a past date, and
// requires `upgradeActivityDocument` — the exact entry get-activity,
// check-activity, practice and video-pause use on a stored row — to accept them.
//
// WHERE THE FIXTURES COME FROM (and why not live rows). Each file was produced
// by running that date's code from a `git archive` of the named commit, so it
// is a document exactly as that day's save path wrote it (a stored row is the
// output of `ActivityDocument.parse`, and so is each of these):
//   • `viewer-fixture` — `authoredFixtureDocument()` from
//     `@activity/viewer/fixtures` at that commit: one answer-bearing instance
//     of every block type registered that day, plus variants.
//   • `stress-test` — `docs/walkthrough/stress-test.md` (the every-feature
//     activity, 2026-11-20) through that day's batch-import pipeline
//     (importer → applyImportedMeta → wrapBlocksStrict → tiptapToActivity).
//   • `dol-import` — `fixtures/published-sources/2026-11-26-dol-import.md`
//     (the format doc's `{checkpoint dol}` example with its seed) through the
//     same pipeline in catalogue mode, and `dol-unseeded-import` (a DoL with
//     no seed, so `retake: false`): the only fixtures with a DoL section.
// Live `activity_versions.content` rows were NOT copied: they are the author's
// real catalogue with its answer keys, and this repo is public. The fixtures
// here are synthetic content already in the repo's history, so they carry no
// student data and nothing personal.
//
// WHEN A SCHEMA CHANGE IS DELIBERATE and a fixture stops parsing, that is the
// guard working: live rows of the same shape stop parsing too. Fix it where
// the live rows are fixed — an in-version fold or an UPGRADES step in
// `src/upgrade.ts` — and the frozen bytes then pass untouched. If the live
// rows are instead rewritten by a data migration, apply the SAME rewrite to the
// fixture, record it in that row's `migratedBy` and update its sha256. Never
// delete a fixture or hand-edit one to get green: the sha256 pin below makes
// any edit to the bytes visible, and the directory/manifest cross-check makes
// a removed file red.
//
// ADDING ONE: freeze a new dated document after a schema-touching arc (same
// recipe, any commit), add its row. Never regenerate an existing file.
// =============================================================================

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { upgradeActivityDocument } from '../src/upgrade.js';
import { Block } from '../src/blocks/index.js';

interface Frozen {
  file: string;
  /** Commit whose code wrote the document. */
  commit: string;
  date: string;
  sha256: string;
  /** Data migrations applied to these bytes since they were frozen. */
  migratedBy?: string[];
  /** Paths the CURRENT schema deliberately no longer reads (a field retired
   * on purpose), each with its reason. Anything else that the read drops or
   * changes is red. */
  droppedOnRead?: { path: RegExp; why: string }[];
}

// Retired on purpose after 2026-08-16. zod strips an unknown key, so stored
// rows still carrying these read cleanly without them (the intended outcome).
const DROPPED_E593: Frozen['droppedOnRead'] = [
  { path: /^meta\.(revisionMode|gradingMode)$/, why: 'deleted 2026-08-24, dba4d1cc (F6/F7)' },
  {
    path: /\.(hasConfidenceRating|partialCredit|allowTargetReuse)$/,
    why: 'the three ruled orphan knobs, deleted 2026-08-24, 8e2a1f38',
  },
];

// Retired on purpose after these documents were frozen, applied to EVERY
// fixture (each must still match something in at least one of them, below).
// A block type folded into another: its `keeps` keys must survive, its type
// must read as `to`, and anything else under it may go.
interface Fold { from: string; to: string; keeps: readonly string[]; why: string }
const FOLDED: readonly Fold[] = [
  {
    from: 'problem',
    to: 'paragraph',
    keeps: ['id', 'content'],
    why: 'the dead problem block, retired 2026-11-27 (ruling E1; review C3): retireShapes in upgrade.ts',
  },
];
// A field retired from one object type: zod strips it on read.
interface Retired { parentType: string; key: string; why: string }
const RETIRED: readonly Retired[] = [
  { parentType: 'blank', key: 'width', why: 'never authored; retired 2026-11-27 (review C3)' },
];

const FROZEN: readonly Frozen[] = [
  {
    file: '2026-08-16-viewer-fixture-e593a25d.json',
    commit: 'e593a25d',
    date: '2026-08-16',
    sha256: '11b039be220c8184c5a3b211e1d24e1010d2ef4661afdf323af64b50b391233f',
    droppedOnRead: DROPPED_E593,
  },
  {
    file: '2026-09-09-viewer-fixture-d5cf820b.json',
    commit: 'd5cf820b',
    date: '2026-09-09',
    sha256: 'f78e14106235a774b98edfc48096412cdfb836d369f4cd3ffcff5b70bb8674e9',
  },
  {
    file: '2026-10-15-viewer-fixture-82bce29d.json',
    commit: '82bce29d',
    date: '2026-10-15',
    sha256: 'd1116769b13de42b6607f1ce2fcf7914f714367738bf0103e1e2d0138e6eead0',
  },
  {
    file: '2026-11-21-viewer-fixture-04ef2bda.json',
    commit: '04ef2bda',
    date: '2026-11-21',
    sha256: 'e5386093c6f4164d214f9de7f675c3abe16f6f2448c0d7c6f34636572532fa31',
  },
  {
    file: '2026-11-21-stress-test-04ef2bda.json',
    commit: '04ef2bda',
    date: '2026-11-21',
    sha256: '626b56c4ec46572dca4b6d4b5768dda7c72fe1247710c44ca8672d54df435dc6',
  },
  {
    file: '2026-11-26-dol-import-6c434af4.json',
    commit: '6c434af4',
    date: '2026-11-26',
    sha256: '868e01e60af2f795a07758c0f35d9292bb94d09922d8eb0d1a250ebe29ae036a',
  },
  {
    file: '2026-11-26-dol-unseeded-import-6c434af4.json',
    commit: '6c434af4',
    date: '2026-11-26',
    sha256: '5c8c1df4e6aa0731be0468acc0ae40192c2d13607bafa652b820fa7815de756f',
  },
];

// Block types no frozen fixture holds yet. Pinned exactly, so a new block
// type shows up here (freeze a document that has it, or add it on purpose).
const NOT_YET_FROZEN: readonly string[] = [];

const DIR = fileURLToPath(new URL('./fixtures/published/', import.meta.url));
const bytes = (file: string): Buffer => readFileSync(DIR + file);

// Every object that is a block (or an inline blank token): a string `type` and
// a string `id`. Used to prove parsing kept every block, in order — zod strips
// unknown KEYS silently, but a block that vanished would show here.
function blockTrail(value: unknown): string[] {
  const out: string[] = [];
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (!v || typeof v !== 'object') return;
    const rec = v as Record<string, unknown>;
    if (typeof rec.type === 'string' && typeof rec.id === 'string') out.push(`${rec.type}:${rec.id}`);
    for (const key of Object.keys(rec).sort()) walk(rec[key]);
  };
  walk(value);
  return out;
}

// Every leaf (string, number, boolean, null) of the stored JSON, by path.
// Defaults may ADD keys on read; a stored leaf must never vanish or change —
// that is how a renamed field with a default, or a new `.catch()`, would
// silently rewrite a student's answer key.
function leaves(value: unknown, path = ''): [string, unknown][] {
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
  }
  return [[path, value]];
}
/** Paths of every object in `root` whose `type` is `type`. */
function pathsOfType(value: unknown, type: string, path = ''): string[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => pathsOfType(v, type, `${path}[${i}]`));
  if (!value || typeof value !== 'object') return [];
  const rec = value as Record<string, unknown>;
  const here = rec.type === type ? [path] : [];
  return here.concat(
    Object.entries(rec).flatMap(([k, v]) => pathsOfType(v, type, path ? `${path}.${k}` : k)),
  );
}
/** Is this stored leaf one a deliberate retirement may change or drop? */
function retiredLeaf(raw: unknown, doc: unknown, path: string): boolean {
  for (const f of FOLDED) {
    for (const at of pathsOfType(raw, f.from)) {
      if (path === `${at}.type`) return valueAt(doc, path) === f.to;
      const rest = path.slice(at.length);
      if (path.startsWith(at) && /^[.]/.test(rest)) {
        const key = rest.slice(1).split(/[.[]/)[0]!;
        if (!f.keeps.includes(key)) return true;
      }
    }
  }
  for (const r of RETIRED) {
    for (const at of pathsOfType(raw, r.parentType)) {
      if (path === `${at}.${r.key}` || path.startsWith(`${at}.${r.key}.`) || path.startsWith(`${at}.${r.key}[`)) return true;
    }
  }
  return false;
}
function valueAt(root: unknown, path: string): unknown {
  let cur: unknown = root;
  for (const part of path.match(/[^.[\]]+/g) ?? []) {
    if (cur === null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

describe('frozen published documents (C8)', () => {
  it('together they hold every block type in the schema union', () => {
    const held = new Set<string>();
    for (const f of FROZEN) {
      for (const entry of blockTrail(JSON.parse(bytes(f.file).toString('utf8')))) {
        held.add(entry.split(':')[0]!);
      }
    }
    const union = Block.options.map((o) => o.shape.type.value as string);
    expect(union.filter((t) => !held.has(t)).sort()).toEqual([...NOT_YET_FROZEN].sort());
  });

  it('they hold a seeded DoL (retake on) and an unseeded one (retake off)', () => {
    const docs = FROZEN.map((f) => JSON.parse(bytes(f.file).toString('utf8')) as { sections: { dol?: Record<string, unknown> }[] });
    const dols = docs.flatMap((d) => d.sections).flatMap((s) => (s.dol ? [s.dol] : []));
    expect(dols.some((d) => 'seed' in d && d.retake === true)).toBe(true);
    expect(dols.some((d) => !('seed' in d) && d.retake === false)).toBe(true);
  });

  it('the directory holds exactly the manifest', () => {
    const onDisk = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
    expect(onDisk).toEqual(FROZEN.map((f) => f.file).sort());
  });

  it('every deliberate retirement still matches something a fixture holds', () => {
    const raws = FROZEN.map((f) => JSON.parse(bytes(f.file).toString('utf8')) as unknown);
    for (const f of FOLDED) expect(raws.some((r) => pathsOfType(r, f.from).length > 0), f.why).toBe(true);
    for (const r of RETIRED) {
      const held = raws.some((raw) =>
        pathsOfType(raw, r.parentType).some((at) => valueAt(raw, `${at}.${r.key}`) !== undefined),
      );
      expect(held, r.why).toBe(true);
    }
  });

  it('the frozen fixtures span more than one date', () => {
    expect(new Set(FROZEN.map((f) => f.date)).size).toBeGreaterThan(1);
  });

  describe.each(FROZEN)('$file', (frozen) => {
    it('its bytes are the frozen bytes (sha256)', () => {
      expect(createHash('sha256').update(bytes(frozen.file)).digest('hex')).toBe(frozen.sha256);
    });

    it('upgradeActivityDocument accepts it and keeps every block', () => {
      const raw: unknown = JSON.parse(bytes(frozen.file).toString('utf8'));
      const trail = blockTrail(raw);
      expect(trail.length).toBeGreaterThan(0);
      const { doc } = upgradeActivityDocument(raw);
      const folded = trail.map((e) => {
        const f = FOLDED.find((x) => e.startsWith(`${x.from}:`));
        return f ? `${f.to}:${e.slice(f.from.length + 1)}` : e;
      });
      expect(blockTrail(doc)).toEqual(folded);
    });

    it('the read keeps every stored value (defaults may only add)', () => {
      const raw: unknown = JSON.parse(bytes(frozen.file).toString('utf8'));
      const { doc } = upgradeActivityDocument(raw);
      const allowed = frozen.droppedOnRead ?? [];
      const lost = leaves(raw)
        .filter(([path]) => !allowed.some((d) => d.path.test(path)))
        .filter(([path]) => !retiredLeaf(raw, doc, path))
        .filter(([path, v]) => !Object.is(valueAt(doc, path), v))
        .map(([path, v]) => `${path}: ${JSON.stringify(v)} → ${JSON.stringify(valueAt(doc, path))}`);
      expect(lost).toEqual([]);
    });

    it('every droppedOnRead entry still matches something it drops', () => {
      const raw: unknown = JSON.parse(bytes(frozen.file).toString('utf8'));
      for (const d of frozen.droppedOnRead ?? []) {
        expect(leaves(raw).some(([path]) => d.path.test(path)), d.why).toBe(true);
      }
    });
  });
});
