// =============================================================================
// pagesHeaders.test.ts — the Cloudflare Pages `_headers` rule (audit #15)
// -----------------------------------------------------------------------------
// Pins two things the file's own comment promises: hashed /assets/ are served
// immutable for a year, and NOTHING else (index.html, the service worker) is
// given a long cache — that would strand a returning visitor on an old deploy.
// Vite copies public/ to the dist root only while publicDir is left at its
// default, so that is pinned too. The BUILT dist/_headers is checked by
// scripts/check-perf-budget.mjs after every build; the live proof is a
// `curl -sI` of an asset.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

describe('public/_headers', () => {
    const rules = read('../../public/_headers')
        .split('\n')
        .filter((line) => line.trim() !== '' && !line.trimStart().startsWith('#'));

    it('serves hashed assets immutable for a year', () => {
        const at = rules.indexOf('/assets/*');
        expect(at).toBeGreaterThanOrEqual(0);
        expect(rules[at + 1]?.trim()).toBe('Cache-Control: public, max-age=31536000, immutable');
    });

    it('names no other path — index.html and the service worker keep revalidating', () => {
        const paths = rules.filter((line) => !/^\s/.test(line));
        expect(paths).toEqual(['/assets/*']);
    });

    it('is copied into the build (vite publicDir left at its default)', () => {
        expect(read('../../vite.config.ts')).not.toMatch(/publicDir\s*:/);
    });
});
