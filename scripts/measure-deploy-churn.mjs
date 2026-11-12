#!/usr/bin/env node
// =============================================================================
// scripts/measure-deploy-churn.mjs — what a returning user re-downloads per deploy
// (shell-size review T7, 2026-11-13)
// -----------------------------------------------------------------------------
// T7 asks whether splitting library code out of the editor's chunks
// (`manualChunks`) would cut what a teacher re-downloads after each deploy. A
// warm cache keeps every hashed file it has seen (dist/_headers marks
// /assets/* immutable), so after a deploy the browser fetches exactly the files
// whose NAMES are new. This script measures that, per deploy, for real commits:
//
//   node scripts/measure-deploy-churn.mjs <out-dir> <sha> <sha> ...   (oldest first)
//
// For each commit it makes a detached worktree under <out-dir>, installs, and
// builds packages/app TWICE with CI's env: as shipped, and with a trial
// `manualChunks` rule that puts Tiptap/ProseMirror, mathjs, KaTeX and MathLive
// node_modules code into chunks of their own (the TR9 counterfactual). Then for
// each consecutive pair it reports, per journey (the student shell and the
// editor), the gz bytes of files in the new build's static closure that the
// old build did not have.
//
// It never touches this checkout: worktrees are created and removed under
// <out-dir> (keep it in a scratch directory). ZERO DEPENDENCIES.
// =============================================================================

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const [outArg, ...shas] = process.argv.slice(2);
if (!outArg || shas.length < 2) {
    console.error('usage: node scripts/measure-deploy-churn.mjs <out-dir> <sha-oldest> <sha> ... <sha-newest>');
    process.exit(2);
}
const out = resolve(outArg);
const repo = resolve(fileURLToPath(new URL('..', import.meta.url)));
mkdirSync(out, { recursive: true });

const ci = readFileSync(join(repo, '.github/workflows/ci.yml'), 'utf8');
const ENV = {
    ...process.env,
    VITE_SUPABASE_URL: ci.match(/VITE_SUPABASE_URL:\s*(\S+)/)[1],
    VITE_SUPABASE_ANON_KEY: ci.match(/VITE_SUPABASE_ANON_KEY:\s*(\S+)/)[1],
    VITE_DISTRICT_HINT: '',
};

// The variants. `split` is the TR9 trial rule: only node_modules ids, and only
// libraries the shell never loads, so it cannot pull vendor code into the
// student entry. `stable` turns off Rollup's minifyInternalExports, whose
// short export aliases (`export{ns as a,…}`) are reassigned when IMPORTING
// code changes, which re-hashes a chunk whose code did not change (found by
// this script on the first run: two vendor-mathjs chunks differed only there).
const MANUAL_CHUNKS = `manualChunks(id) {
    if (!id.includes('node_modules')) return undefined;
    if (/[\\\\/](prosemirror-[^\\\\/]+|@tiptap|orderedmap|rope-sequence|w3c-keyname|linkifyjs|tippy\\.js|@popperjs)[\\\\/]/.test(id)) return 'vendor-editor';
    if (/[\\\\/](mathjs|typed-function|decimal\\.js|complex\\.js|fraction\\.js|javascript-natural-sort|escape-latex|seedrandom|tiny-emitter)[\\\\/]/.test(id)) return 'vendor-mathjs';
    if (/[\\\\/]katex[\\\\/]/.test(id)) return 'vendor-katex';
    if (/[\\\\/]mathlive[\\\\/]/.test(id)) return 'vendor-mathlive';
    return undefined;
  },`;
const overlay = (output) => `import base from './vite.config';
import { mergeConfig } from 'vite';
const cfg = typeof base === 'function' ? await base({ command: 'build', mode: 'production' }) : base;
export default mergeConfig(cfg, { build: { rollupOptions: { output: { ${output} } } } });
`;
const VARIANTS = {
    shipped: null,
    split: overlay(MANUAL_CHUNKS),
    stable: overlay('minifyInternalExports: false,'),
    'split+stable': overlay(MANUAL_CHUNKS + ' minifyInternalExports: false,'),
};

const run = (cmd, args, cwd) =>
    execFileSync(cmd, args, { cwd, env: ENV, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 }).toString();

function buildCommit(sha) {
    const dest = join(out, sha.slice(0, 10));
    const missing = Object.keys(VARIANTS).filter((v) => !existsSync(join(dest, v, '.vite/manifest.json')));
    if (missing.length === 0) return dest;
    const wt = join(out, `wt-${sha.slice(0, 10)}`);
    rmSync(wt, { recursive: true, force: true });
    run('git', ['worktree', 'add', '--detach', wt, sha], repo);
    try {
        run('pnpm', ['install', '--frozen-lockfile', '--prefer-offline'], wt);
        const app = join(wt, 'packages/app');
        for (const v of missing) {
            const args = ['exec', 'vite', 'build'];
            if (VARIANTS[v]) {
                writeFileSync(join(app, 'vite.churn.config.ts'), VARIANTS[v]);
                args.push('--config', 'vite.churn.config.ts');
            }
            run('pnpm', args, app);
            rmSync(join(dest, v), { recursive: true, force: true });
            cpSync(join(app, 'dist'), join(dest, v), { recursive: true });
        }
    } finally {
        run('git', ['worktree', 'remove', '--force', wt], repo);
    }
    return dest;
}

function journeys(dist) {
    const m = JSON.parse(readFileSync(join(dist, '.vite/manifest.json'), 'utf8'));
    const closure = (key, seen = new Set()) => {
        if (seen.has(key) || !m[key]) return seen;
        seen.add(key);
        for (const dep of m[key].imports ?? []) closure(dep, seen);
        return seen;
    };
    const entry = Object.keys(m).find((k) => m[k].isEntry);
    const files = (keys) => [...keys].map((k) => m[k].file);
    const shell = closure(entry);
    const editorKey = 'src/routes/ActivityEditor.tsx';
    // The editor journey as a first visit fetches it: shell + editor closure.
    return { shell: files(shell), editor: files(closure(editorKey, new Set(shell))) };
}

const gzCache = new Map();
function gz(dist, file) {
    const p = join(dist, file);
    if (!gzCache.has(p)) gzCache.set(p, gzipSync(readFileSync(p)).length);
    return gzCache.get(p);
}

const builds = shas.map((sha) => {
    process.stderr.write(`building ${sha.slice(0, 10)}…\n`);
    return { sha, dir: buildCommit(sha) };
});

const kib = (b) => (b / 1024).toFixed(1);
const names = Object.keys(VARIANTS);
const sums = Object.fromEntries(names.map((v) => [v, { shell: 0, editor: 0 }]));
console.log(`| deploy | ${names.map((v) => `shell / editor re-download (${v})`).join(' | ')} |`);
console.log(`|---|${names.map(() => '---').join('|')}|`);
for (let i = 1; i < builds.length; i++) {
    const cells = [];
    for (const v of names) {
        const oldDir = join(builds[i - 1].dir, v);
        const newDir = join(builds[i].dir, v);
        const oldJ = journeys(oldDir);
        const newJ = journeys(newDir);
        const oldFiles = new Set([...oldJ.shell, ...oldJ.editor]);
        const fresh = (j) => newJ[j].filter((f) => !oldFiles.has(f)).reduce((s, f) => s + gz(newDir, f), 0);
        const total = (j) => newJ[j].reduce((s, f) => s + gz(newDir, f), 0);
        const sh = fresh('shell');
        const ed = fresh('editor');
        sums[v].shell += sh;
        sums[v].editor += ed;
        cells.push(`${kib(sh)} / ${kib(ed)} (of ${kib(total('editor'))})`);
    }
    console.log(`| ${builds[i - 1].sha.slice(0, 8)} → ${builds[i].sha.slice(0, 8)} | ${cells.join(' | ')} |`);
}
console.log('');
for (const v of names) {
    console.log(`${v}: over ${builds.length - 1} deploys, shell ${kib(sums[v].shell)} KiB, editor ${kib(sums[v].editor)} KiB re-downloaded`);
}
