import { useState } from 'react';
import type { MathPrompt } from '@activity/schema';
import BlankEditPopover from '../components/BlankEditPopover';
import { placeholderIds } from '../mathPromptSync';

// Model A shared edit chrome for in-equation gaps — used by both MathBlockView
// and MathInlineView (MA-DR1/DR2/DR4). Rendered ALWAYS while the node exists (not
// gated on `editing`) so the settings popover survives a field blur; the chrome
// buttons themselves show only while editing. The container is a <span> so it's
// valid HTML inside both the block <div> and the inline <span> anchors.
interface MathPromptControlsProps {
  editing: boolean;
  /** The field's raw latex — to count gaps vs answered prompts (the signifier). */
  latex: string;
  prompts: MathPrompt[];
  insertPrompt: () => void;
  keepEditingRef: React.MutableRefObject<boolean>;
  /** Stable anchor element for the popover (the node's always-present wrapper). */
  anchorEl: HTMLElement | null;
  onUpdatePrompts: (prompts: MathPrompt[]) => void;
}

export default function MathPromptControls({
  editing,
  latex,
  prompts,
  insertPrompt,
  keepEditingRef,
  anchorEl,
  onUpdatePrompts,
}: MathPromptControlsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const prompt = prompts[0]; // single-gap v1

  // Signifier (MA-DR4): a placeholder present in the latex but not yet in
  // prompts[] is an unanswered gap — an incomplete question. Flag it so the
  // author sees at a glance that a blank still needs an answer.
  const unanswered = placeholderIds(latex).length - prompts.length;

  const patchPrompt = (patch: Partial<MathPrompt>) => {
    if (!prompt) return;
    onUpdatePrompts(prompts.map((p, i) => (i === 0 ? { ...p, ...patch } : p)));
  };

  return (
    <>
      {editing && (
        <span className="math-edit-chrome" contentEditable={false}>
          <button
            type="button"
            className="math-insert-blank"
            onMouseDown={(e) => {
              e.preventDefault();
              insertPrompt();
            }}
            title="Insert a fill-in blank at the cursor (⌘⇧B)"
          >
            + Blank
          </button>
          {prompt && (
            <button
              type="button"
              className="math-gap-settings"
              onMouseDown={(e) => {
                e.preventDefault();
                // Guard so opening the popover (which moves focus) doesn't exit
                // edit mode; the popover survives a blur regardless (decoupled).
                keepEditingRef.current = true;
                setShowSettings((s) => !s);
              }}
              aria-expanded={showSettings}
              title="Answer settings (equivalence, tolerance, alternatives)"
            >
              Answer settings
            </button>
          )}
          {unanswered > 0 && (
            <span className="math-gap-incomplete" role="status">
              {unanswered === 1
                ? 'Blank needs an answer'
                : `${unanswered} blanks need answers`}
            </span>
          )}
        </span>
      )}
      {showSettings && prompt && (
        <BlankEditPopover
          referenceElement={anchorEl}
          isOpen
          mathPromptMode
          blankId={prompt.id}
          initialAnswer={prompt.answer}
          initialAcceptableAnswers={prompt.acceptableAnswers}
          initialHint={undefined}
          initialMistakeFeedback={undefined}
          initialInterchangeable={false}
          initialAnswerType="math"
          initialTolerance={prompt.tolerance}
          initialEquivalence={prompt.equivalence}
          canGroupWithPrevious={false}
          onChange={(attrs) => {
            const patch: Partial<MathPrompt> = {};
            if (attrs.acceptableAnswers !== undefined)
              patch.acceptableAnswers = attrs.acceptableAnswers;
            if ('tolerance' in attrs) patch.tolerance = attrs.tolerance;
            if ('equivalence' in attrs) patch.equivalence = attrs.equivalence;
            patchPrompt(patch);
          }}
          onClose={() => {
            setShowSettings(false);
            keepEditingRef.current = false;
          }}
        />
      )}
    </>
  );
}
