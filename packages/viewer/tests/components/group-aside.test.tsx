// =============================================================================
// group-aside.test.tsx — the host's footer slot (S9 "Ask my teacher", 0090)
// -----------------------------------------------------------------------------
// ViewerContainer's `groupAside` draws in each check group's footer, is
// handed that group's section ids, and never draws where there is no footer
// (print, externalCheck). Bound to rendered output.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ViewerContainer, createViewerStore, indexDocument } from '../../src/index.js';
import type { CheckService } from '../../src/index.js';
import { sanitizedFixtureDocument } from '../../src/fixtures/index.js';
import { checkGroups } from '../../src/container/checkGroups.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000002';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000002';
const doc = sanitizedFixtureDocument();

const svc: CheckService = {
  async checkSection() {
    throw new Error('not called');
  },
  async fetchReleasedFeedback() {
    return { graded: false, blocks: {} };
  },
};

function mount(extra: Record<string, unknown>) {
  const store = createViewerStore({ userId: TEST_USER_ID, activityId: ACTIVITY, versionId: VERSION, checkService: svc });
  const seen: string[][] = [];
  const utils = render(
    <ViewerContainer
      document={doc}
      store={store}
      versionId={VERSION}
      groupAside={(ids) => {
        seen.push([...ids]);
        return <span data-aside={ids.join(',')}>aside</span>;
      }}
      {...extra}
    />,
  );
  return { ...utils, seen };
}

describe('groupAside', () => {
  it('draws once in every check group footer, given that group\'s section ids', () => {
    const { container } = mount({});
    const groups = checkGroups(indexDocument(doc), doc.meta.submissionMode ?? 'free');
    const asides = Array.from(container.querySelectorAll('[data-aside]'));
    expect(asides).toHaveLength(groups.length);
    expect(asides.map((a) => a.getAttribute('data-aside'))).toEqual(
      groups.map((g) => g.sections.map((s) => s.sectionId).join(',')),
    );
    for (const a of asides) {
      expect(a.closest('.viewer-check-group__footer')).not.toBeNull();
    }
  });

  it('never draws in print or when the caller draws Check', () => {
    expect(mount({ mode: 'print' }).container.querySelector('[data-aside]')).toBeNull();
    expect(mount({ externalCheck: true }).container.querySelector('[data-aside]')).toBeNull();
  });
});
