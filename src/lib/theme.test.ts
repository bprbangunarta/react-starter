import { afterEach, describe, expect, it } from 'vitest';
import { THEME_KEY, setTheme } from '@/lib/theme';

describe('theme', () => {
    afterEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
    });

    it('applies and saves a forced theme, and clears both for "system"', () => {
        setTheme('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(localStorage.getItem(THEME_KEY)).toBe('dark');

        setTheme('system');
        expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
        expect(localStorage.getItem(THEME_KEY)).toBeNull();
    });
});
