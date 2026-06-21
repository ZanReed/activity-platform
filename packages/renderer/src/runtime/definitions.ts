// =============================================================================
// definitions.ts — sidecar script for inline vocabulary-definition popovers
// -----------------------------------------------------------------------------
// Inlined into a published page by document.ts ONLY when the page contains at
// least one definition mark (a `.definition` span). Self-contained UI chrome,
// like reference-panel.ts: it has NOTHING to do with the scoring runtime
// (separate bundle, separate concern) and manages its OWN popover element, so
// the scoring runtime's state->render discipline and its shared `.js-popover`
// stay untouched. Definitions can appear anywhere inline text does — inside a
// problem AND inside the reference panel (outside any .activity-section) — so
// this sidecar queries the whole document, not section-scoped subtrees.
//
// Interaction (decided in docs/design/vocabulary-definitions.md): tap / click
// or keyboard (Enter / Space) on a defined term opens a small popover with the
// definition; Escape, an outside click, or scrolling closes it; focus returns
// to the term on close (managed-dialog pattern). Tap-only — no hover popover,
// which would create a dual desktop/touch interaction model.
//
// Defensive throughout: a term with no definition text is inert; everything is
// null-guarded so older/newer markup degrades to "nothing happens", never a
// throw.
// =============================================================================

export function setupDefinitions(): void {
  const terms = Array.from(
    document.querySelectorAll<HTMLElement>('.definition'),
  );
  if (terms.length === 0) return;

  // One popover element for the page, created lazily on first open and reused.
  let popover: HTMLElement | null = null;
  let bodyEl: HTMLElement | null = null;
  // The term whose definition is currently shown (null when closed).
  let activeTerm: HTMLElement | null = null;

  const POPOVER_ID = 'definition-popover';

  const ensurePopover = (): HTMLElement => {
    if (popover) return popover;
    const el = document.createElement('div');
    el.className = 'definition-popover';
    el.id = POPOVER_ID;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Definition');
    el.hidden = true;
    const body = document.createElement('div');
    body.className = 'definition-popover-body';
    el.appendChild(body);
    document.body.appendChild(el);
    popover = el;
    bodyEl = body;
    return el;
  };

  // Anchor the (position:fixed) popover just below the term, clamped to the
  // viewport; flip above when there isn't room below.
  const position = (pop: HTMLElement, term: HTMLElement): void => {
    const rect = term.getBoundingClientRect();
    const margin = 8;
    const gap = 6;
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    let left = rect.left;
    if (left + pw > window.innerWidth - margin) {
      left = window.innerWidth - margin - pw;
    }
    if (left < margin) left = margin;
    let top = rect.bottom + gap;
    if (top + ph > window.innerHeight - margin && rect.top - ph - gap > margin) {
      top = rect.top - ph - gap;
    }
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  };

  const close = (): void => {
    if (!popover || popover.hidden) return;
    popover.hidden = true;
    const term = activeTerm;
    activeTerm = null;
    if (term) {
      term.setAttribute('aria-expanded', 'false');
      term.removeAttribute('aria-controls');
      term.focus();
    }
  };

  const open = (term: HTMLElement): void => {
    // Rich content lives in a hidden <template> emitted right after the span
    // (pre-rendered text + math + optional image). Fall back to the plain-text
    // data-definition attribute when no template is present (older published
    // markup, or a no-rich-content path).
    const sibling = term.nextElementSibling;
    const tpl =
      sibling instanceof HTMLTemplateElement &&
      sibling.classList.contains('js-definition-content')
        ? sibling
        : null;
    const fallbackText = term.getAttribute('data-definition') ?? '';
    if (tpl) {
      if (tpl.content.childNodes.length === 0) return; // empty — inert
    } else if (!fallbackText) {
      return; // nothing to show — inert
    }
    const pop = ensurePopover();
    if (bodyEl) {
      if (tpl) {
        bodyEl.replaceChildren(tpl.content.cloneNode(true));
      } else {
        bodyEl.textContent = fallbackText;
      }
    }
    if (activeTerm && activeTerm !== term) {
      activeTerm.setAttribute('aria-expanded', 'false');
      activeTerm.removeAttribute('aria-controls');
    }
    pop.hidden = false;
    position(pop, term);
    activeTerm = term;
    term.setAttribute('aria-expanded', 'true');
    term.setAttribute('aria-controls', POPOVER_ID);
  };

  const toggle = (term: HTMLElement): void => {
    if (activeTerm === term && popover && !popover.hidden) {
      close();
    } else {
      open(term);
    }
  };

  for (const term of terms) {
    term.addEventListener('click', (e) => {
      e.preventDefault();
      toggle(term);
    });
    term.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggle(term);
      }
    });
  }

  // Escape closes (and returns focus to the term).
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  });

  // Outside click closes. A click on a term or inside the popover is handled
  // elsewhere (or should not close), so ignore those.
  document.addEventListener('click', (e) => {
    if (!popover || popover.hidden) return;
    const target = e.target as Element | null;
    if (!target) return;
    if (target.closest('.definition') || target.closest('.definition-popover')) {
      return;
    }
    close();
  });

  // The popover is position:fixed and won't follow the term as the page
  // scrolls, so close rather than let it drift away from its anchor.
  window.addEventListener('scroll', () => close(), true);
  window.addEventListener('resize', () => close());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupDefinitions);
} else {
  setupDefinitions();
}
