import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from '@/components/avatar';

describe('Avatar', () => {
    it('shows the first letter of the name when there is no photo', () => {
        render(<Avatar name="rina" src={null} />);

        expect(screen.getByText('R')).toBeInTheDocument();
    });

    it('shows the photo when there is one', () => {
        const { container } = render(<Avatar name="Rina" src="/foto/1.jpg" />);

        expect(container.querySelector('img')).toHaveAttribute('src', '/foto/1.jpg');
    });

    it('falls back to the letter when the photo cannot be loaded', () => {
        const { container } = render(<Avatar name="Rina" src="/foto/1.jpg" />);

        fireEvent.error(container.querySelector('img') as HTMLImageElement);

        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText('R')).toBeInTheDocument();
    });
});
