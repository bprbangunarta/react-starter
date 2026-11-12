import { useSyncExternalStore } from 'react';

export type ThemeChoice = 'light' | 'dark' | 'system';

/** The same key as public/theme-init.js, which applies the choice before the page paints (a test keeps them equal). */
export const THEME_KEY = 'theme';

const CHANGED = 'app:theme';

function stored(): ThemeChoice {
    try {
        const value = localStorage.getItem(THEME_KEY);

        return value === 'light' || value === 'dark' ? value : 'system';
    } catch {
        // Storage blocked (private window): fall back to the system setting.
        return 'system';
    }
}

/** "system" removes the attribute, so the media query in index.css decides. */
function apply(choice: ThemeChoice): void {
    if (choice === 'system') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', choice);
    }
}

/** Saves the choice (it is a preference, not a secret) and applies it at once. */
export function setTheme(choice: ThemeChoice): void {
    try {
        if (choice === 'system') {
            localStorage.removeItem(THEME_KEY);
        } else {
            localStorage.setItem(THEME_KEY, choice);
        }
    } catch {
        // Not saved, but it still applies until the page is closed.
    }

    apply(choice);
    window.dispatchEvent(new Event(CHANGED));
}

function subscribe(onChange: () => void): () => void {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    window.addEventListener(CHANGED, onChange);
    media.addEventListener('change', onChange);

    return () => {
        window.removeEventListener(CHANGED, onChange);
        media.removeEventListener('change', onChange);
    };
}

const snapshot = (): string => `${stored()}|${window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}`;

/** The saved choice and what is actually showing (a "system" choice resolves to the OS setting). */
export function useTheme(): { choice: ThemeChoice; resolved: 'light' | 'dark' } {
    const [choice, system] = useSyncExternalStore(subscribe, snapshot).split('|') as [ThemeChoice, 'light' | 'dark'];

    return { choice, resolved: choice === 'system' ? system : choice };
}
