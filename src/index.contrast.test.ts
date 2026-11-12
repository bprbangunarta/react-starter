// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');
// The dark values live between markers; the light ones are the @theme block at the top.
const darkBlock = /\/\* dark:start \*\/([\s\S]*?)\/\* dark:end \*\//.exec(css)?.[1] ?? '';
type Theme = 'light' | 'dark';

const token = (name: string, theme: Theme = 'light'): string => {
    const value = new RegExp(`--color-${name}: ([^;]+);`).exec(theme === 'dark' ? darkBlock : css)?.[1];

    if (!value) {
        throw new Error(`Token ${name} not found in index.css`);
    }

    return value.trim();
};

/** Relative luminance of an `oklch(L C H)` or `#rrggbb` colour (WCAG 2.x, sRGB). */
function luminance(value: string): number {
    const hex = /^#([0-9a-f]{6})$/i.exec(value);

    if (hex?.[1]) {
        const [r = 0, g = 0, b = 0] = [0, 2, 4]
            .map((i) => parseInt(hex[1].slice(i, i + 2), 16) / 255)
            .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    const [L = 0, C = 0, H = 0] = (/oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/.exec(value)?.slice(1) ?? []).map(Number);
    const a = C * Math.cos((H * Math.PI) / 180);
    const b = C * Math.sin((H * Math.PI) / 180);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const channels = [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ].map((c) => Math.max(0, Math.min(1, c)));

    return 0.2126 * (channels[0] ?? 0) + 0.7152 * (channels[1] ?? 0) + 0.0722 * (channels[2] ?? 0);
}

const ratio = (a: string, b: string, theme: Theme = 'light'): number => {
    const [hi = 0, lo = 0] = [luminance(token(a, theme)), luminance(token(b, theme))].sort((x, y) => y - x);

    return (hi + 0.05) / (lo + 0.05);
};

describe.each<Theme>(['light', 'dark'])('colour contrast (WCAG), %s theme', (theme) => {
    const text: [string, string][] = [
        ['ink', 'surface'],
        ['ink', 'canvas'],
        ['muted', 'surface'],
        ['muted', 'canvas'],
        ['primary', 'surface'],
        ['primary', 'primary-soft'],
        ['on-primary', 'primary'],
        ['on-primary', 'primary-hover'],
        ['on-primary', 'danger'],
        ...['success', 'warning', 'info', 'danger'].map((tone): [string, string] => [`${tone}-ink`, `${tone}-soft`]),
    ];

    it.each(text)('text %s on %s reaches 4.5:1', (foreground, background) => {
        expect(ratio(foreground, background, theme)).toBeGreaterThanOrEqual(4.5);
    });

    it.each(['success', 'warning', 'info', 'danger'])('%s icon colour reaches 3:1 on its soft background', (tone) => {
        expect(ratio(tone, `${tone}-soft`, theme)).toBeGreaterThanOrEqual(3);
    });

    it('keeps the card edge (line) visible against the page and the card', () => {
        expect(ratio('line', 'canvas', theme)).toBeGreaterThanOrEqual(1.1);
        expect(ratio('line', 'surface', theme)).toBeGreaterThanOrEqual(1.1);
    });

    it.each([1, 2, 3, 4, 5])('chart series colour %i reaches 3:1 on the surface', (n) => {
        expect(ratio(`chart-${n}`, 'surface', theme)).toBeGreaterThanOrEqual(3);
    });
});

describe('dark theme definition', () => {
    it('defines every colour token of the light theme', () => {
        const light = [...css.slice(0, css.indexOf('}')).matchAll(/--color-([a-z0-9-]+):/g)].map((m) => m[1]);
        const dark = [...darkBlock.matchAll(/--color-([a-z0-9-]+):/g)].map((m) => m[1]);

        expect(light.length).toBeGreaterThan(25);
        expect(dark.sort()).toEqual(light.sort());
    });

    it('is the same in the forced block and in the system media query', () => {
        const media = css.slice(css.indexOf('@media (prefers-color-scheme: dark)'));
        const norm = (text: string) => [...text.matchAll(/--color-[a-z0-9-]+: [^;]+;/g)].map((m) => m[0]).join('\n');

        expect(norm(media.slice(0, media.indexOf('\n}\n')))).toBe(norm(darkBlock));
    });
});
