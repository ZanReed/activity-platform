# The UX Lens

A reusable review instrument for auditing any GUI feature in this product. Point it
at one feature, run the procedure, get a consistent verdict + ranked fixes.

Use it three ways:
- **Self-review** — read the lenses, walk your feature, be honest.
- **AI review** — paste: *"Review `<feature>` against `docs/design/ux-lens.md`. Walk
  it as a first-time teacher, then score each lens and rank the fixes."*
- **Design-time** — run it on a sketch before you build, so the interface is
  task-shaped from the start instead of retrofitted.

---

## The one thesis

> **Design the interface around the user's task, not around your data model.**

The number-one tell of an inexperienced builder is a UI that mirrors the schema 1:1 —
a control for every field, a generic "insert" for every node type. It's honest about
capability and cheap to build, and it forces the user to reverse-engineer your database
to operate the product. Every lens below is a specific way of pulling the interface
back toward *what the teacher is trying to do*.

**The master diagnostic — run it on every control on screen:**

> *Is this here because the user needs it right now, or because my model has this field?*

Everything in the second bucket is a candidate to **hide, default, or delete.**

---

## The lenses

Each lens is a question, the **failure signature** that answers it "no," and the
**direction** of the fix. Score each feature against all ten.

### 1. Task over schema  *(master)*
**Ask:** Does the screen model the user's intention, or my storage?
**Failure signature:** Field-per-property forms; UI vocabulary matches DB column names;
the user must understand your node types to do anything.
**Fix direction:** Group and name controls by what the user is *accomplishing*. Collapse
implementation details into a single meaningful action.

### 2. Visibility of action  *(affordance vs. signifier)*
**Ask:** Can the user *see* that this action is available?
**Failure signature:** A capability that only works if you already know it exists
(type-here-and-it-becomes-a-block; a hidden gesture; a magic keystroke with no hint).
**Fix direction:** Add a signifier — a `+`, a button, a placeholder, a hover reveal.
"The feature exists" ≠ "the user can find it."

### 3. Progressive disclosure
**Ask:** Is the common 20% front-and-center and the long-tail tucked away?
**Failure signature:** Every option present on first paint; a wall of settings that
taxes 100% of users to serve 15%.
**Fix direction:** Primary path visible, everything else under "Advanced." Complexity
should be *available*, not *present*.

### 4. Locus of intent
**Ask:** Is the action where the user's attention already is?
**Failure signature:** A fixed top toolbar for actions that target a specific spot; the
user must hold "I want it *there*" in their head while traveling to a control *here*.
**Fix direction:** Put insertion/edit affordances inline, at the point of the object
(hover `+` between blocks, edit-on-click).

### 5. Two doors
**Ask:** Is there an on-ramp for the novice *and* a shortcut for the fluent user?
**Failure signature:** Only a menu (slow for pros) or only a keystroke (invisible to
newcomers); no path from one to the other.
**Fix direction:** Ship both to the same destination; surface the shortcut *next to* the
menu item so people graduate.

### 6. Default to done
**Ask:** How much must the user supply before this is usable?
**Failure signature:** Required fields that could have a sensible default; blank states
that demand configuration before showing value.
**Fix direction:** Smart defaults, pre-filled common cases, "works immediately, tune
later." Every required input is a tax — justify it.

### 7. Visible system state
**Ask:** Does the user always know what the system just did / is doing?
**Failure signature:** Silent saves, invisible mode changes, actions with no feedback,
ambiguous "did that work?" moments.
**Fix direction:** Optimistic feedback, visible save/validation indicators, obvious
selected/active states. (This product's standing constraint — honor it.)

### 8. Reversibility over confirmation
**Ask:** Can the user undo instead of being interrogated?
**Failure signature:** "Are you sure?" dialogs guarding recoverable actions; friction on
the happy path to prevent a rare mistake.
**Fix direction:** Make it undoable and let them move fast. Reserve confirmation for the
genuinely destructive and irreversible.

### 9. Recognition over recall
**Ask:** Does the UI show the options, or make the user remember them?
**Failure signature:** Empty inputs that only work with memorized syntax; features you
have to *know about* to use; no discoverable inventory of what's possible.
**Fix direction:** Menus, previews, examples, inline hints. Let people point instead of
recall.

### 10. Name by the user's concept
**Ask:** Do labels match the teacher's mental model, not the internal type name?
**Failure signature:** UI text leaks internal names (`numeric_input`, `FillInBlank`,
`schemaVersion`); jargon the user never uses.
**Fix direction:** Name by what it *is to them* ("blank," "problem," "answer"). Shape,
not implementation. (Echoes the repo rule: name by shape.)

---

## The review procedure

1. **Name the feature and the user's goal in one sentence.** ("A teacher wants to add a
   fill-in-the-blank to a question.")
2. **Walk it as a first-timer.** Click through with zero prior knowledge. Note every
   pause, every "wait, how do I…", every moment you rely on knowing something invisible.
3. **Run the master diagnostic** on every on-screen control. List what's schema-driven.
4. **Score each of the 10 lenses**: ✅ pass / ⚠️ weak / ❌ fail, one line of evidence each.
5. **Rank the fixes** by (impact on cognitive load) × (cheapness to build). Cheap +
   high-impact first.
6. **Write the smallest next change**, not the redesign.

## Output format

```
Feature: <name>
Goal: <one sentence, the user's intent>

Schema-leak inventory:
- <control> — present because <field>, user doesn't need it here

Lens scores:
1. Task over schema        ❌  <evidence>
2. Visibility of action    ⚠️  <evidence>
...
10. Name by user's concept ✅  <evidence>

Ranked fixes:
1. [cheap/high]  <change>
2. [med/high]    <change>
3. [cheap/low]   <change>

Smallest next change: <one thing to ship first>
```

---

## Why these ten

They're this product's tailoring of Nielsen's usability heuristics, Norman's
affordances/signifiers (*The Design of Everyday Things*), and Krug's "don't make me
think" — narrowed to the failure modes that show up when the builder knows the schema too
well. If you internalize only two things: **the thesis** (task, not schema) and **the
master diagnostic** (need-now vs. field-exists) regenerate most of the rest on demand.
