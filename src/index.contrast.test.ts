// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');
const token = (name: string): string => {
    const value = new RegExp(`--color-${name}: ([^;]+);`).exec(css)?.[1];

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

const ratio = (a: string, b: string): number => {
    const [hi = 0, lo = 0] = [luminance(token(a)), luminance(token(b))].sort((x, y) => y - x);

    return (hi + 0.05) / (lo + 0.05);
};

describe('colour contrast (WCAG)', () => {
    const text: [string, string][] = [
        ['ink', 'surface'],
        ['ink', 'canvas'],
        ['muted', 'surface'],
        ['muted', 'canvas'],
        ['primary', 'surface'],
        ['surface', 'primary'],
        ['surface', 'primary-hover'],
        ['surface', 'danger'],
        ...['success', 'warning', 'info', 'danger'].map((tone): [string, string] => [`${tone}-ink`, `${tone}-soft`]),
    ];

    it.each(text)('text %s on %s reaches 4.5:1', (foreground, background) => {
        expect(ratio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    });

    it.each(['success', 'warning', 'info', 'danger'])('%s icon colour reaches 3:1 on its soft background', (tone) => {
        expect(ratio(tone, `${tone}-soft`)).toBeGreaterThanOrEqual(3);
    });
});
