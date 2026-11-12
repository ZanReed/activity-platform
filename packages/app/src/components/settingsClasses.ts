// The drawer's shared form-control classes, in a module of their own so the
// print page's PrintSettingsBody can use them without importing
// ActivityConfigDrawer.tsx, which reaches the editor (shell-size review TR2).
export const SELECT_CLASS =
    'w-full rounded-md border border-line-strong bg-canvas px-2 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';
export const SETTINGS_LABEL_CLASS =
    'text-xs font-semibold uppercase tracking-wide text-muted';
export const SETTINGS_HELP_CLASS = 'mt-1 text-xs text-muted';
