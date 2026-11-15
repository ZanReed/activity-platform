// @vitest-environment jsdom
// formatting-s6-s7.test.tsx — what a student is served and sees: alignment,
// highlight, and links that are https or nothing (schema-shortlist.md S6, S7).
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { InlineContent } from '../src/inline/InlineContent.js';
import Paragraph from '../src/blocks/Paragraph.js';
import { sanitizeInlineContent, isHttpsHref } from '../src/sanitize/sanitize.js';

const text = (t: string, marks: unknown[]) => ({ type: 'text', text: t, marks });

describe('links', () => {
  it('an https link opens in a new tab and cannot reach back', () => {
    const { container } = render(<InlineContent nodes={[text('the site', [{ type: 'link', href: 'https://example.com' }])] as never} />);
    const a = container.querySelector('a.viewer-link')!;
    expect(a.getAttribute('href')).toBe('https://example.com');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('the sanitizer drops a non-https link and keeps its text', () => {
    const out = sanitizeInlineContent([
      text('a', [{ type: 'link', href: 'javascript:alert(1)' }, { type: 'bold' }]),
      text('b', [{ type: 'link', href: 'http://example.com' }]),
      text('c', [{ type: 'link', href: 'https://user:pw@example.com' }]),
      text('d', [{ type: 'link', href: 'https://example.com' }]),
    ]);
    expect(JSON.stringify(out)).not.toContain('javascript:');
    expect(JSON.stringify(out)).not.toContain('http://');
    expect(JSON.stringify(out)).not.toContain('user:pw');
    expect(JSON.stringify(out)).toContain('"href":"https://example.com"');
    expect(JSON.stringify(out)).toContain('{"type":"bold"}');
    expect(isHttpsHref('https://example.com')).toBe(true);
  });

  it('a non-https link that reaches the renderer anyway renders as plain text', () => {
    const { container } = render(<InlineContent nodes={[text('x', [{ type: 'link', href: 'javascript:alert(1)' }])] as never} />);
    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toBe('x');
  });
});

describe('highlight and alignment', () => {
  it('a highlight renders as a mark', () => {
    const { container } = render(<InlineContent nodes={[text('key', [{ type: 'highlight' }])] as never} />);
    expect(container.querySelector('mark.viewer-highlight')?.textContent).toBe('key');
  });

  it('a centred paragraph is centred', () => {
    const { container } = render(
      <Paragraph block={{ id: 'p', type: 'paragraph', align: 'center', content: [text('hi', [])] } as never} mode="screen" />,
    );
    const p = container.querySelector('p')!;
    expect(p.getAttribute('data-align')).toBe('center');
    expect(p.style.textAlign).toBe('center');
  });
});
