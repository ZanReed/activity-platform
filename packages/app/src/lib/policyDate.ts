// The day the privacy policy in force took effect, for the Classes page's
// "the privacy policy changed" notice. Its own module, not policyVersion.ts:
// that file is in the student Home journey (through lib/classes), whose budget
// is full, and only the lazy Classes route needs this.
import { POLICY_VERSION } from './policyVersion';

/**
 * The day the policy in force took effect, read from the version string's
 * date prefix (YYYY-MM-DD; privacy.version.test.ts pins the shape). Parsed at
 * LOCAL midnight so it shows the same day in NZ and the US.
 */
export function policyChangedOn(): Date {
    return new Date(`${POLICY_VERSION.slice(0, 10)}T00:00:00`);
}
