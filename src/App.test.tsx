import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '@/App';

describe('App routes', () => {
    afterEach(() => {
        window.history.pushState({}, '', '/');
    });

    it('shows an unknown address as a full-screen 404 without the app shell', async () => {
        window.history.pushState({}, '', '/alamat-yang-tidak-ada');
        render(<App />);

        expect(await screen.findByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument();
        expect(screen.queryByRole('navigation', { name: 'Menu utama' })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ke beranda' })).toBeInTheDocument();
    });

    it('previews an error screen at /ui-guideline/errors/:status, also full screen', async () => {
        window.history.pushState({}, '', '/ui-guideline/errors/503');
        render(<App />);

        expect(await screen.findByRole('heading', { name: 'Sedang dalam pemeliharaan' })).toBeInTheDocument();
        expect(screen.queryByRole('navigation', { name: 'Menu utama' })).not.toBeInTheDocument();
    });
});
