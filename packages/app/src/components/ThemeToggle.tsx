import { Monitor, Sun, Moon } from 'lucide-react';
import { useTheme, type Theme } from '../lib/theme';

// Global color-theme switcher (dark-mode slice 3). A compact 3-way segmented
// control (System / Light / Dark). There is no shared app shell to host it, so
// it floats bottom-left, quiet at rest (opacity) and full on hover. `print:hidden`
// keeps it off paper. Placement is a one-line change in App.tsx if it should
// move into a route header later.
const OPTIONS: { value: Theme; label: string; Icon: typeof Monitor }[] = [
    { value: 'system', label: 'Match system theme', Icon: Monitor },
    { value: 'light', label: 'Light theme', Icon: Sun },
    { value: 'dark', label: 'Dark theme', Icon: Moon },
];

export default function ThemeToggle() {
    const [theme, setTheme] = useTheme();
    return (
        <div
            role="radiogroup"
            aria-label="Color theme"
            className="fixed bottom-4 left-4 z-30 flex items-center gap-0.5 rounded-full border border-line bg-canvas p-0.5 opacity-70 shadow-sm transition hover:opacity-100 print:hidden"
        >
            {OPTIONS.map(({ value, label, Icon }) => {
                const active = theme === value;
                return (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        title={label}
                        onClick={() => setTheme(value)}
                        className={`grid h-7 w-7 place-items-center rounded-full transition ${
                            active
                                ? 'bg-primary text-white'
                                : 'text-muted hover:bg-surface-2 hover:text-strong'
                        }`}
                    >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    </button>
                );
            })}
        </div>
    );
}
