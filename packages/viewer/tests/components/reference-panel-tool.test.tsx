// =============================================================================
// reference-panel-tool.test.tsx — the reference panel's screen surface
// -----------------------------------------------------------------------------
// The guard bar is the calculator slice's, and it earned it: asserting a summon
// EXISTS is not sufficient, because a button is what the dead runtime had too.
// What must be asserted is that clicking it puts the teacher's AUTHORED BLOCKS
// on screen, that an activity without a panel renders no button at all, and
// that the panel a student reads cannot be answered.
//
// Two files, deliberately. This one drives the component against a fake block
// renderer — no registry, no resolver, no lazy chunks — so what is pinned is
// the container's behaviour. container.test.tsx pins the other half: that
// ViewerContainer actually wires the real BlockSlot into it and gates it on
// screen mode. A component that works, wired to nothing, is how the field
// became an orphan in the first place.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReferencePanelTool } from '../../src/index.js';

/** Panel blocks as they arrive from the wire: opaque to this component, which
 * only ever hands them to renderBlock. */
function panelOf(...texts: string[]) {
  return {
    title: 'Formula sheet',
    blocks: texts.map((text, i) => ({ id: `b${i}`, type: 'paragraph', text })),
  };
}

const renderBlock = (block: unknown) => (
  <p>{(block as { text: string }).text}</p>
);

describe('ReferencePanelTool — gating', () => {
  it('renders NOTHING when the activity has no reference panel', () => {
    const { container } = render(
      <ReferencePanelTool panel={undefined} renderBlock={renderBlock} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders NOTHING for a panel carrying a title but no blocks', () => {
    // A summon that opens an empty window is worse than no summon, and a title
    // with nothing under it is what a half-finished authoring session leaves.
    const { container } = render(
      <ReferencePanelTool
        panel={{ title: 'Formula sheet', blocks: [] }}
        renderBlock={renderBlock}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('names the summon after the panel, falling back to "Reference"', () => {
    const { rerender } = render(
      <ReferencePanelTool panel={panelOf('a')} renderBlock={renderBlock} />,
    );
    expect(screen.getByRole('button', { name: 'Formula sheet' })).toBeInTheDocument();

    rerender(
      <ReferencePanelTool
        panel={{ blocks: panelOf('a').blocks }}
        renderBlock={renderBlock}
      />,
    );
    expect(screen.getByRole('button', { name: 'Reference' })).toBeInTheDocument();
  });
});

describe('ReferencePanelTool — summon', () => {
  it("puts the teacher's authored blocks on screen, in order", () => {
    // THE test. Not "a dialog appeared" — the actual content a teacher wrote,
    // which is the thing that has been reaching nobody since S9 Drop 4.
    render(
      <ReferencePanelTool
        panel={panelOf('Slope: m = (y2-y1)/(x2-x1)', 'Area: A = bh')}
        renderBlock={renderBlock}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Formula sheet' }));

    const panel = screen.getByRole('dialog', { name: 'Formula sheet' });
    expect(panel).toBeVisible();
    expect(screen.getByText('Slope: m = (y2-y1)/(x2-x1)')).toBeInTheDocument();
    expect(screen.getByText('Area: A = bh')).toBeInTheDocument();
    // The summon and the panel share the corner (DECISIONS.md:195).
    expect(
      screen.queryByRole('button', { name: 'Formula sheet' }),
    ).not.toBeInTheDocument();
  });

  it('is a NON-modal dialog — the worksheet behind it stays live', () => {
    // The panel is consulted WHILE working. A modal would trap focus away from
    // the very work it is being read for.
    render(<ReferencePanelTool panel={panelOf('a')} renderBlock={renderBlock} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'false');
  });

  it('closes on × and returns focus to the summon', async () => {
    render(<ReferencePanelTool panel={panelOf('a')} renderBlock={renderBlock} />);
    fireEvent.click(screen.getByRole('button', { name: 'Formula sheet' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close reference' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const summon = screen.getByRole('button', { name: 'Formula sheet' });
    await waitFor(() => expect(summon).toHaveFocus());
  });

  it('closes on Escape', () => {
    render(<ReferencePanelTool panel={panelOf('a')} renderBlock={renderBlock} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('leaves Escape alone when something inside already used it', () => {
    // A definition popover opened over a term IN the panel consumes its own
    // Escape. A student pressing it once expects the popover to close, not the
    // whole panel to vanish out from under it (DECISIONS.md:195).
    //
    // Simulated the way it actually happens — an inner handler calling
    // preventDefault as the event bubbles — NOT by passing
    // `defaultPrevented: true` in the event init, which React ignores because
    // it derives that flag from a real preventDefault() call. The first draft
    // did exactly that and failed, which is the useful kind of failure: the
    // shortcut would have tested nothing.
    render(
      <ReferencePanelTool
        panel={{ title: 'Sheet', blocks: [{ id: 'b0' }] }}
        renderBlock={() => (
          <span
            data-testid="inner-popover"
            onKeyDown={(e) => {
              if (e.key === 'Escape') e.preventDefault();
            }}
          >
            term
          </span>
        )}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sheet' }));
    fireEvent.keyDown(screen.getByTestId('inner-popover'), { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // And the same key with nothing consuming it still closes — otherwise this
    // test would pass against a panel that ignored Escape entirely.
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('moves focus INTO the panel when it opens', () => {
    // Otherwise focus is stranded on a button that no longer exists, and the
    // next Tab restarts at the top of the worksheet.
    render(<ReferencePanelTool panel={panelOf('a')} renderBlock={renderBlock} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('does not steal focus on first render', () => {
    // The panel is summoned, never auto-opened (ruling R7) — but the focus
    // effect runs on mount too, and an effect that grabs focus on load would
    // take a student out of the worksheet before they touched anything.
    render(<ReferencePanelTool panel={panelOf('a')} renderBlock={renderBlock} />);
    expect(document.body).toHaveFocus();
  });
});

describe('ReferencePanelTool — reference material is not answerable', () => {
  it('disables every control inside the panel', () => {
    // A question block CAN reach a panel: ReferencePanelEditor registers the
    // multiple-choice / matching / ordering nodes to satisfy its column content
    // schema, so a teacher can paste one in. Its answer key no longer ships,
    // but its radios still RENDER — and a block in no section is never checked
    // and never submitted, so answering it is work a student silently loses.
    render(
      <ReferencePanelTool
        panel={{ title: 'Sheet', blocks: [{ id: 'b0' }] }}
        renderBlock={() => (
          <label>
            Pasted choice
            <input type="radio" name="pasted" />
          </label>
        )}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sheet' }));

    // Bound to the rendered control, not to the fieldset's attribute: a
    // `disabled` that the browser does not actually apply to descendants would
    // pass an attribute check and fail a student.
    //
    // ⚠ If you ever check this by hand in a browser, do NOT read
    // `input.disabled`. That IDL property reflects the element's OWN disabled
    // attribute and ignores an ancestor fieldset entirely, so it returns false
    // on a control the browser is genuinely refusing to activate — it reported
    // exactly that during this slice's browser pass and looked like a live bug
    // for a minute. `input.matches(':disabled')` accounts for the ancestor, and
    // a real .click() leaving `checked` unchanged is the ground truth. jest-dom's
    // toBeDisabled() below walks the ancestors correctly, which is why it agreed
    // with the browser and the hand-probe did not.
    expect(screen.getByRole('radio')).toBeDisabled();
  });
});
