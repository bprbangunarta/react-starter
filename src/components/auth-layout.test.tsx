import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthLayout } from '@/components/auth-layout';

describe('AuthLayout', () => {
    it('gives the screen one heading, its words, and the brand', () => {
        render(
            <AuthLayout title="Masuk" description="Gunakan akun Anda." illustration="login">
                <button type="button">Kirim</button>
            </AuthLayout>,
        );

        expect(screen.getByRole('heading', { level: 1, name: 'Masuk' })).toBeInTheDocument();
        expect(screen.getByText('Gunakan akun Anda.')).toBeInTheDocument();
        expect(screen.getByText('Starter Kit')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Kirim' })).toBeInTheDocument();
    });

    it('sets the tab title, from `pageTitle` when it differs from the heading', () => {
        render(
            <AuthLayout title="Verifikasi dua langkah" pageTitle="Verifikasi" description="Kode." illustration="verify">
                <p>isi</p>
            </AuthLayout>,
        );

        expect(document.title).toBe('Verifikasi - Starter Kit');
    });

    it('is built phone first: a header with the illustration, the form on a rounded sheet, two columns only from lg', () => {
        const { container } = render(
            <AuthLayout title="Masuk" description="x" illustration="login">
                <p>isi</p>
            </AuthLayout>,
        );

        expect(container.firstElementChild).toHaveClass('flex-col', 'lg:grid', 'lg:grid-cols-2');
        expect(container.querySelector('main')).toHaveClass('rounded-t-3xl', 'lg:rounded-none');
        expect(container.querySelector('aside svg')).toBeInTheDocument();
    });
});
