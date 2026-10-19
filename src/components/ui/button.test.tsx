import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

describe('icon button beside an input', () => {
    it('is as tall as the input, not 28 px like a plain icon button', () => {
        render(
            <div>
                <Input aria-label="Isian" />
                <Button size="fieldIcon" aria-label="Salin" />
                <Button size="icon" aria-label="Biasa" />
            </div>,
        );

        expect(screen.getByLabelText('Isian').className).toContain('h-8');
        expect(screen.getByRole('button', { name: 'Salin' }).className).toContain('size-8');
        expect(screen.getByRole('button', { name: 'Biasa' }).className).toContain('size-7');
        expect(buttonVariants({ size: 'fieldIcon' })).not.toContain('size-7');
    });
});

describe('button variants', () => {
    it('share one border box, so side-by-side buttons are the same size to the pixel', () => {
        for (const variant of ['primary', 'outline', 'ghost', 'danger'] as const) {
            expect(buttonVariants({ variant })).toMatch(/\bborder\b/);
        }
    });
});
