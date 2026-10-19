import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorPage } from '@/components/error-page';
import { ERROR_PAGES } from '@/lib/error-pages';

describe('ErrorPage', () => {
    it.each(ERROR_PAGES.map((page) => [page.status, page.title] as const))(
        '%i says what happened in words, with the code only as a small note',
        (status, title) => {
            render(<ErrorPage status={status} />);

            expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
            expect(screen.getByText(`Kode ${status}`)).toBeInTheDocument();
            expect(document.title).toBe(`${title} - Starter Kit`);
            expect(document.title).not.toMatch(/^\d{3}/);
        },
    );

    it('calls a 503 maintenance, never "Service Unavailable"', () => {
        render(<ErrorPage status={503} />);

        expect(screen.getByRole('heading', { name: 'Sedang dalam pemeliharaan' })).toBeInTheDocument();
        expect(document.body.textContent).not.toMatch(/service unavailable/i);
    });

    it('offers a way out: reload for what may pass, home for a page that is not there, sign-in for a missing session', () => {
        const { unmount } = render(<ErrorPage status={503} />);
        expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeInTheDocument();
        unmount();

        const { unmount: unmountHome } = render(<ErrorPage status={404} back />);
        expect(screen.getByRole('link', { name: 'Ke beranda' })).toHaveAttribute('href', '/');
        expect(screen.getByRole('button', { name: 'Kembali' })).toBeInTheDocument();
        unmountHome();

        render(<ErrorPage status={401} />);
        expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute('href', '/login');
    });

    it('stands alone: no sidebar, no header, no navigation', () => {
        render(<ErrorPage status={404} />);

        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
        expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    });

    it('falls back to the 500 page for a status it has no wording for', () => {
        render(<ErrorPage status={418} />);

        expect(screen.getByRole('heading', { name: 'Terjadi kesalahan' })).toBeInTheDocument();
    });
});
