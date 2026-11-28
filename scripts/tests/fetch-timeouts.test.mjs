// =============================================================================
// fetch-timeouts.test.mjs — every server-side fetch has a time limit (review D7)
// -----------------------------------------------------------------------------
// Before 2026-11-28 no fetch in the Edge Functions or the grading worker had a
// timeout, so a hung Storage PUT held a reserved photo slot until the
// platform's wall clock, and a hung model server hung the worker for good.
// Each call now carries `signal: AbortSignal.timeout(<limit>)`, with the
// limit chosen and justified at its definition, and each caller turns the
// abort into a named failure (tested where it lives: photo-handoff.test.mjs,
// viewer tests/restClient.test.ts, grading-worker tests/timeouts.test.ts).
//
// This scan is the ratchet: a NEW `fetch(` in these trees without a `signal`
// in its arguments goes red. It reads each call's whole argument list (paren-
// balanced), so a signal passed on any line of the call counts.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const TREES = ['supabase/functions', 'packages/viewer/src/server', 'packages/grading-worker/src'];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.endsWith('.bundle.js')) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(ts|mjs|js)$/.test(name) && !/\.test\./.test(name)) out.push(path);
  }
  return out;
}

/** The text of a call's arguments, from just after `(` to its matching `)`. */
function argsAt(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '(') depth++;
    else if (src[i] === ')' && --depth === 0) return src.slice(open + 1, i);
  }
  return src.slice(open + 1);
}

/** Every `fetch(` / `doFetch(` call site, with whether it passes a signal. */
export function fetchSites(src) {
  const sites = [];
  for (const m of src.matchAll(/\b(?:fetch|doFetch)\(/g)) {
    const before = src.slice(Math.max(0, m.index - 30), m.index);
    // Declarations and type positions are not calls.
    if (/(function\s+|typeof\s+)$/.test(before)) continue;
    const line = src.slice(0, m.index).split('\n').length;
    const lineText = src.split('\n')[line - 1] ?? '';
    if (/^\s*(\/\/|\*)/.test(lineText)) continue; // prose
    // In the arguments, or in an `init` built on the lines just above the
    // call (restClient builds one per attempt).
    const args = argsAt(src, m.index + m[0].length - 1);
    const lead = src.slice(Math.max(0, m.index - 300), m.index);
    const signal = /\bsignal\b/.test(args) || (/\binit\b/.test(args) && /\binit\b[^\n]*\bsignal\b/.test(lead));
    sites.push({ line, signal });
  }
  return sites;
}

test('every server-side fetch passes a signal', () => {
  const missing = [];
  let total = 0;
  for (const tree of TREES) {
    for (const file of walk(join(ROOT, tree))) {
      for (const site of fetchSites(readFileSync(file, 'utf8'))) {
        total++;
        if (!site.signal) missing.push(`${relative(ROOT, file)}:${site.line}`);
      }
    }
  }
  assert.deepEqual(missing, [], `fetch without a time limit:\n  ${missing.join('\n  ')}`);
  // Liveness: the scan is finding the known call sites (photo-handoff 2,
  // sweep 2, restClient 1, worker 2). A scan that finds nothing passes vacuously.
  assert.ok(total >= 7, `expected at least 7 fetch sites, found ${total}`);
});

test('the scanner flags a fetch with no signal and passes one with it', () => {
  assert.deepEqual(fetchSites("await fetch(url, {\n  method: 'POST',\n  body,\n});"), [{ line: 1, signal: false }]);
  assert.deepEqual(fetchSites("await fetch(url, {\n  body: f(x),\n  signal: AbortSignal.timeout(5),\n});"), [{ line: 1, signal: true }]);
  assert.deepEqual(fetchSites("const init = { method, signal: AbortSignal.timeout(5) };\nres = await doFetch(url, init);"), [{ line: 2, signal: true }]);
  assert.deepEqual(fetchSites("const init = { method };\nres = await doFetch(url, init);"), [{ line: 2, signal: false }]);
  assert.deepEqual(fetchSites('// a comment about fetch(x)\nconst f: typeof fetch = x;'), []);
});
