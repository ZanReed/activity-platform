// @vitest-environment jsdom
// The under-13 wording (U-4, approved by the author 2026-10-06; POLICY_VERSION
// 2026-10-06-draft-4). The public /privacy page is the rendered form of
// docs/compliance/privacy-policy.md, and the class form's two statements are
// what a teacher confirms: this pins the three to one another, so one cannot
// be reworded alone.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Privacy from '../routes/Privacy';

const flat = (s: string) => s.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const md = flat(readFileSync(resolve(__dirname, '../../../../docs/compliance/privacy-policy.md'), 'utf8'));

const WHO =
    'Your teacher confirms one of two things when they create a class: that everyone in the class is 13 or older, or that the class includes students under 13 and the school has authorized them to use it.';
const BASIS =
    'For a student under 13, the school\'s authorization is the permission we rely on, and we use their information only for schoolwork.';

describe('the privacy notice — who can use this', () => {
    it('the page and the source document carry the same two sentences', () => {
        const { container } = render(
            <MemoryRouter>
                <Privacy />
            </MemoryRouter>,
        );
        const page = flat(container.textContent ?? '');
        for (const sentence of [WHO, BASIS]) {
            expect(page).toContain(sentence);
            expect(md).toContain(sentence);
        }
    });

    it('neither still says the platform is for 13 or older only', () => {
        const { container } = render(
            <MemoryRouter>
                <Privacy />
            </MemoryRouter>,
        );
        for (const text of [flat(container.textContent ?? ''), md.slice(md.indexOf('## Who can use this'))]) {
            expect(text).not.toMatch(/with no exceptions in this version/);
            expect(text).not.toMatch(/If you're under 13, don't sign in — ask your teacher for a paper copy/);
        }
    });
});
