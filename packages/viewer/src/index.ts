// =============================================================================
// @activity/viewer — the student-viewer package (components-as-data arc)
// -----------------------------------------------------------------------------
// S0 surface: the block-registry contract + the design-token vocabulary. The
// container shell, store, and block components land in S3/T6 and export from
// here as they arrive. Adding new exports requires editing this file; that's
// intentional friction (schema package precedent).
// =============================================================================

export type {
  BlockType,
  CheckedStateFamily,
  Interactivity,
  BlockCategory,
  NumberingRule,
  SanitizeSpec,
  PrintTreatment,
  PrintSpec,
  A11ySpec,
  BlockComponentProps,
  LazyBlockComponent,
  BlockRegistryEntry,
  BlockRegistry,
} from './registry/types.js';

export {
  blockRegistry,
  registeredBlockTypes,
  familyOf,
  categoryOf,
  censusKeyOf,
  isPageNumbered,
  BLANK_SECRET_FIELDS,
  MATH_PROMPT_SECRET_FIELDS,
} from './registry/registry.js';

export {
  colorTokens,
  staticTokens,
  stateNames,
} from './tokens/tokens.js';
export type { ColorToken, StaticToken, DesignToken, StateName } from './tokens/tokens.js';
