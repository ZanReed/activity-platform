// Drift guard: the public /privacy route and the class-creation assertion both
// render lib/policyVersion.ts's POLICY_VERSION; this test pins that constant
// to the version string in docs/compliance/privacy-policy.md, so bumping one
// without the other fails CI. (The assertion↔policy linkage itself is pinned
// in classes.test.ts, where the supabase client is mocked.)
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { POLICY_VERSION } from '../lib/policyVersion';

describe('privacy policy version sync', () => {
  it('POLICY_VERSION matches docs/compliance/privacy-policy.md', () => {
    const md = readFileSync(
      resolve(__dirname, '../../../../docs/compliance/privacy-policy.md'),
      'utf8',
    );
    expect(md).toContain(`\`${POLICY_VERSION}\``);
  });
});
