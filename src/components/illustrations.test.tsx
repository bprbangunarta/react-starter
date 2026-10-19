import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ILLUSTRATIONS, Illustration } from '@/components/illustrations';
import type { IllustrationName } from '@/components/illustrations';

const names = Object.keys(ILLUSTRATIONS) as IllustrationName[];

describe('illustrations', () => {
    it.each(names)('%s is a decorative SVG, hidden from screen readers', (name) => {
        const { container } = render(<Illustration name={name} />);
        const svg = container.querySelector('svg');

        expect(svg).toHaveAttribute('aria-hidden', 'true');
        expect(svg).toHaveAttribute('viewBox', '0 0 240 180');
        expect(container.querySelectorAll('svg *').length).toBeGreaterThan(8);
    });

    it.each(names)('%s uses only theme tokens for colour, so a rebrand recolours it', (name) => {
        const { container } = render(<Illustration name={name} />);
        const colours = [...container.querySelectorAll('[fill], [stroke]')]
            .flatMap((el) => [el.getAttribute('fill'), el.getAttribute('stroke')])
            .filter((value): value is string => !!value && value !== 'none');

        expect(colours.length).toBeGreaterThan(3);
        expect(colours.every((value) => value.startsWith('var(--color-'))).toBe(true);
    });
});
