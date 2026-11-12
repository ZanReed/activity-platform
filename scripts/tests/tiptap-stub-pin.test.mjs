// =============================================================================
// tiptap-stub-pin.test.mjs — the y-tiptap stub and the packages that import it
// must stay in step (shell-size review TR3, 2026-11-13)
// -----------------------------------------------------------------------------
// packages/app/src/lib/tiptap-stubs/y-tiptap.ts replaces @tiptap/y-tiptap at
// bundle time (resolve.alias in vite.config.ts). The stub is safe only because
// of how ONE release of extension-drag-handle reads it: it checks
// ySyncPluginKey.getState() before calling anything else. A Tiptap bump can
// change that, or import a new name, so this test fails on any version move
// and reads the INSTALLED dist files to prove every imported name is exported.
//
// The Tiptap deps float on carets (the family is bumped together, per
// CLAUDE.md), so the lockfile decides the installed version and this test is
// what turns a bump into a re-audit. ZERO DEPENDENCIES: node:fs + node:path.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const appDir = join(repo, 'packages/app');
const stubPath = join(appDir, 'src/lib/tiptap-stubs/y-tiptap.ts');
const stub = readFileSync(stubPath, 'utf8');

const REAUDIT =
    '\nRe-audit before changing anything here: read the installed ' +
    'extension-drag-handle and extension-collaboration dist/index.js, confirm ' +
    'drag-handle still checks ySyncPluginKey.getState() before using any other ' +
    'y-tiptap export, update the stub to match, then bump its `AUDITED AGAINST:` ' +
    'line. Background: docs/design/shell-size-review.md (TR3).';

// pnpm installs drag-handle's peers next to it, so collaboration and y-tiptap
// resolve from the same directory the bundle resolves them from.
const dragHandleDir = realpathSync(join(appDir, 'node_modules/@tiptap/extension-drag-handle'));
const peerDir = (name) => join(dirname(dragHandleDir), name);

function importedNames(distFile) {
    const src = readFileSync(distFile, 'utf8');
    const names = new Set();
    for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']@tiptap\/y-tiptap["']/g)) {
        for (const part of m[1].split(',')) {
            const name = part.trim().split(/\s+as\s+/)[0];
            if (name) names.add(name);
        }
    }
    return names;
}

const stubExports = new Set(
    [...stub.matchAll(/^export const (\w+)/gm)].map((m) => m[1]),
);

test('the stub names the drag-handle version it was audited against, and it is installed', () => {
    const audited = stub.match(/AUDITED AGAINST:\s*@tiptap\/extension-drag-handle\s+(\d+\.\d+\.\d+)/)?.[1];
    assert.ok(audited, 'y-tiptap.ts lost its "AUDITED AGAINST: @tiptap/extension-drag-handle <version>" line.');
    const installed = JSON.parse(readFileSync(join(dragHandleDir, 'package.json'), 'utf8')).version;
    assert.equal(installed, audited, `extension-drag-handle ${installed} is installed; the stub was audited against ${audited}.` + REAUDIT);
    const collab = JSON.parse(readFileSync(join(peerDir('extension-collaboration'), 'package.json'), 'utf8')).version;
    assert.equal(collab, audited, `extension-collaboration ${collab} is installed beside drag-handle ${audited}.` + REAUDIT);
});

test('every name drag-handle and collaboration import from y-tiptap is exported by the stub', () => {
    for (const pkg of ['extension-drag-handle', 'extension-collaboration']) {
        const dir = pkg === 'extension-drag-handle' ? dragHandleDir : peerDir(pkg);
        const names = importedNames(join(dir, 'dist/index.js'));
        assert.ok(names.size > 0, `${pkg} no longer imports from @tiptap/y-tiptap: the stub may be retirable.` + REAUDIT);
        for (const name of names) {
            assert.ok(stubExports.has(name), `${pkg} imports ${name} from @tiptap/y-tiptap; the stub does not export it.` + REAUDIT);
        }
    }
});

test('drag-handle still guards every y-tiptap call behind ySyncPluginKey.getState()', () => {
    // The whole safety argument. If a release calls a position helper without
    // the `if (!ystate) return` guard, the stub's wall would throw mid-drag.
    const src = readFileSync(join(dragHandleDir, 'dist/index.js'), 'utf8');
    const guarded = src.match(/const ystate = ySyncPluginKey\.getState\(state\);\s*if \(!ystate\)/g) ?? [];
    const calls = src.match(/(absolute|relative)PositionTo(Relative|Absolute)Position\(/g) ?? [];
    assert.equal(guarded.length, 2, 'drag-handle no longer has its two ystate guards.' + REAUDIT);
    assert.equal(calls.length, 2, 'drag-handle calls a y-tiptap position helper outside the two guarded helpers.' + REAUDIT);
});

test('vite.config.ts still aliases @tiptap/y-tiptap at the stub', () => {
    const config = readFileSync(join(appDir, 'vite.config.ts'), 'utf8');
    assert.match(config, /'@tiptap\/y-tiptap':[\s\S]{0,200}?tiptap-stubs\/y-tiptap\.ts/,
        'the alias is gone, so yjs returns to the editor and this file guards nothing. ' +
        'Retire the stub, this test and the yjs absence row in perf-budgets.mjs together.');
});
