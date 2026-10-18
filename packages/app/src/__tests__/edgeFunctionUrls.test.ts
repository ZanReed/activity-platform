import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FUNCTION_REGION,
  GET_ACTIVITY_FUNCTION,
  edgeFunctionUrl,
} from '../lib/edgeFunctions';

// Audit #14 (ruled 2026-10-18): every Edge Function call runs in the
// database's region. The pin is a query parameter added by ONE builder, so the
// failure this file exists for is a call site that builds its URL by hand and
// silently runs in the caller's nearest region again (~200 ms per DB call from
// NZ). Nothing else would notice: the request still succeeds, only slower.

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, '..');
const FUNCTIONS_DIR = resolve(HERE, '../../../../supabase/functions');

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === '__tests__' || name === 'test') continue;
      out.push(...sourceFiles(path));
    } else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name)) {
      out.push(path);
    }
  }
  return out;
}

describe('edgeFunctionUrl (the region pin)', () => {
  it('pins the region and keeps the caller’s parameters', () => {
    const url = new URL(
      edgeFunctionUrl('https://x.supabase.co/functions/v1', GET_ACTIVITY_FUNCTION, {
        join_code: 'AB C',
        meta: '1',
      }),
    );
    expect(url.pathname).toBe('/functions/v1/get-activity');
    expect(url.searchParams.get('forceFunctionRegion')).toBe(FUNCTION_REGION);
    expect(url.searchParams.get('join_code')).toBe('AB C');
    expect(url.searchParams.get('meta')).toBe('1');
  });

  it('a caller’s params cannot override the pin', () => {
    const url = new URL(
      edgeFunctionUrl('https://x.supabase.co/functions/v1', GET_ACTIVITY_FUNCTION, {
        forceFunctionRegion: 'ap-southeast-2',
      }),
    );
    expect(url.searchParams.getAll('forceFunctionRegion')).toEqual([FUNCTION_REGION]);
  });

  it('the pin is the database region (a tripwire: changing it is a ruling)', () => {
    // The project's database is in us-east-2. A change here is a ruling, not
    // a tweak: see the constant's comment and DECISIONS.md.
    expect(FUNCTION_REGION).toBe('us-east-2');
  });

  it(`GET_ACTIVITY_FUNCTION names an existing function directory (${GET_ACTIVITY_FUNCTION})`, () => {
    expect(existsSync(resolve(FUNCTIONS_DIR, GET_ACTIVITY_FUNCTION))).toBe(true);
  });
});

describe('no function URL is built by hand', () => {
  const files = sourceFiles(SRC);

  it('the sweep reads the app source (anti-vacuity)', () => {
    expect(files.length).toBeGreaterThan(50);
    // The four known call sites (viewer read, viewer check, Bank preview,
    // join-code meta) go through the builder; fewer means the sweep's
    // pattern stopped matching them, not that they went away.
    const pinned = files
      .map((f) => (readFileSync(f, 'utf8').match(/edgeFunctionUrl\(\s*functionsBase\(\)/g) ?? []).length)
      .reduce((a, b) => a + b, 0);
    expect(pinned).toBeGreaterThanOrEqual(4);
  });

  it('every functionsBase() call is the builder’s argument', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const rel = relative(SRC, file);
      if (rel === join('lib', 'supabase.ts')) continue; // the definition
      const text = readFileSync(file, 'utf8');
      // Whitespace-tolerant, so a formatter wrapping the call is not an offender.
      const all = (text.match(/functionsBase\(\)/g) ?? []).length;
      const pinned = (text.match(/edgeFunctionUrl\(\s*functionsBase\(\)/g) ?? []).length;
      if (all !== pinned) offenders.push(rel);
      if (/\/functions\/v1\//.test(text)) offenders.push(`${rel} (literal /functions/v1/)`);
      // supabase-js builds the URL itself and would run unpinned.
      if (/\.functions\.invoke\(|supabase\.functions\b/.test(text)) {
        offenders.push(`${rel} (supabase.functions — use edgeFunctionUrl)`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
