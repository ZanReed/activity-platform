// The sign-out cost sentence (UI review G-1; media submissions slice 2b).
import { describe, expect, it } from 'vitest';
import { uncheckedCostSentence } from './uncheckedWork';

describe('uncheckedCostSentence', () => {
  it('names unchecked answers alone when no photo is waiting', () => {
    expect(uncheckedCostSentence(1)).toBe(
      'You have answers you haven’t checked in 1 activity. Signing out clears them from this device.',
    );
  });

  it('names waiting photos apart: sign-out deletes them, they live nowhere else', () => {
    expect(uncheckedCostSentence(1, 1)).toMatch(/ 1 photo hasn’t uploaded yet\. Signing out will delete it\.$/);
    expect(uncheckedCostSentence(2, 3)).toMatch(/ 3 photos haven’t uploaded yet\. Signing out will delete them\.$/);
  });
});
