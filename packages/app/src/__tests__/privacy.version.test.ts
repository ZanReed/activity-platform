// Drift guard: the public /privacy route and the class-creation assertion both
// render lib/policyVersion.ts's POLICY_VERSION; this test pins that constant
// to the version string in docs/compliance/privacy-policy.md, so bumping one
// without the other fails CI. (The assertion↔policy linkage itself is pinned
// in classes.test.ts, where the supabase client is mocked.)
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { POLICY_VERSION, policyChangedOn } from '../lib/policyVersion';

describe('privacy policy version sync', () => {
  it('POLICY_VERSION matches docs/compliance/privacy-policy.md', () => {
    const md = readFileSync(
      resolve(__dirname, '../../../../docs/compliance/privacy-policy.md'),
      'utf8',
    );
    expect(md).toContain(`\`${POLICY_VERSION}\``);
  });

  // The class-card notice reads the change date from this prefix.
  it('POLICY_VERSION starts with the day it took effect (YYYY-MM-DD)', () => {
    expect(POLICY_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}-/);
    const d = policyChangedOn();
    expect(Number.isNaN(d.getTime())).toBe(false);
    expect([d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-')).toBe(
      POLICY_VERSION.slice(0, 10).split('-').map(Number).join('-'),
    );
  });
});
