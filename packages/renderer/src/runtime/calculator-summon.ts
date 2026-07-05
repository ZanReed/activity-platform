// =============================================================================
// calculator-summon.ts — sidecar that lazy-loads the calculator widget
// -----------------------------------------------------------------------------
// Inlined into a published page by document.ts ONLY when the activity has an
// enabled calculator AND a kit URL is available. Self-contained UI chrome with
// NOTHING to do with the scoring runtime (separate bundle, separate concern) —
// the calculator is a scaffold: it never scores, submits, or persists.
//
// This is the CHEAP, always-shipped half of the calculator: just a summon
// button + an empty mount. The HEAVY widget (MathLive + keypad + evaluator,
// hundreds of KiB) is NOT here — it is dynamic-import()ed on the first summon
// click from the URL in data-calculator-kit-src (a shared, content-hashed kit
// on R2). A page where a calculator is merely *available* therefore ships only
// this tiny sidecar until a student actually opens the tool; after the first
// open the kit is browser-cached.
//
// Integration contract with the kit (implemented in the widget slice):
//
//   import(src) resolves to a module exporting:
//     mountCalculator(
//       mount: HTMLElement,                 // .calculator-mount (starts hidden)
//       config: unknown,                    // parsed data-calculator-config
//       hooks: { onToggle(open: boolean): void },
//     ): CalculatorHandle
//
//   interface CalculatorHandle {
//     toggle(): void;          // flip open/closed (drives the summon button)
//     readonly isOpen: boolean;
//   }
//
// The kit owns the panel chrome and the mount's visibility; this sidecar only
// loads it, drives toggling from the summon button, and keeps aria-expanded in
// sync (via the onToggle hook, so a panel that closes itself still updates the
// button).
//
// Defensive throughout: a missing element or a failed import disables the
// calculator only — the rest of the page is untouched.
// =============================================================================

interface CalculatorHandle {
  toggle(): void;
  readonly isOpen: boolean;
}

interface CalculatorKitModule {
  mountCalculator(
    mount: HTMLElement,
    config: unknown,
    hooks: { onToggle(open: boolean): void; floating: boolean },
  ): CalculatorHandle;
}

function setupCalculator(tool: HTMLElement): void {
  const button = tool.querySelector<HTMLButtonElement>('.calculator-summon');
  const mount = tool.querySelector<HTMLElement>('.calculator-mount');
  const src = tool.getAttribute('data-calculator-kit-src');
  if (!button || !mount || !src) return;

  let config: unknown = {};
  try {
    const raw = tool.getAttribute('data-calculator-config');
    if (raw) config = JSON.parse(raw);
  } catch {
    // A malformed config yields a full (unrestricted) calculator, never a
    // broken one — the kit applies permissive defaults to {}.
    config = {};
  }

  let handle: CalculatorHandle | null = null;
  let loading = false;

  // The panel is a floating window, so hide the summon button while it's open
  // (it would otherwise sit under the panel in the same corner). The panel's
  // own × closes it, which fires onToggle(false) and brings the button back.
  const setExpanded = (open: boolean): void => {
    button.setAttribute('aria-expanded', String(open));
    button.hidden = open;
  };

  button.addEventListener('click', async () => {
    if (handle) {
      handle.toggle();
      return;
    }
    if (loading) return; // a load is already in flight; ignore extra clicks
    loading = true;
    button.setAttribute('aria-busy', 'true');
    try {
      const mod = (await import(src)) as CalculatorKitModule;
      handle = mod.mountCalculator(mount, config, {
        onToggle: setExpanded,
        floating: true,
      });
      setExpanded(handle.isOpen);
    } catch (err) {
      // The kit failed to load (offline, blocked CDN, bad URL). The rest of
      // the page keeps working; the student loses only the optional tool.
      console.error('Calculator failed to load', err);
      loading = false; // allow a retry on the next click
    } finally {
      button.removeAttribute('aria-busy');
    }
  });
}

function setupCalculators(): void {
  const tools = document.querySelectorAll<HTMLElement>('.calculator-tool');
  tools.forEach(setupCalculator);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCalculators);
} else {
  setupCalculators();
}
