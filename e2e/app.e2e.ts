/// <reference types="node" />
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

// The demo accounts of the mock API (see README).
async function signIn(page: Page, username = 'admin') {
    await page.goto('/login');
    await page.getByPlaceholder('Email atau Username').fill(username);
    await page.getByPlaceholder('************************').fill('password');
    await page.getByRole('button', { name: 'Masuk' }).click();
}

test('an unknown address shows the full-screen 404', async ({ page }) => {
    await page.goto('/tidak-ada');

    await expect(page.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Menu utama' })).toHaveCount(0);
});

test('a visitor without a session is sent to the sign-in page', async ({ page }) => {
    await page.goto('/audit-logs');

    await expect(page).toHaveURL(/\/login$/);
});

test('signs in and reads the audit log', async ({ page }) => {
    await signIn(page);

    await expect(page.getByRole('navigation', { name: 'Menu utama' })).toBeVisible();
    await page.getByRole('link', { name: 'Audit Logs' }).click();
    await expect(page.getByRole('heading', { name: 'Audit Logs' })).toBeVisible();
    await expect(page.getByRole('row').nth(1)).toBeVisible();

    await page.getByPlaceholder('Cari pengguna, kejadian, data, IP…').fill('auth.login');
    await expect(page.getByRole('row', { name: /auth\.login/ }).first()).toBeVisible();
});

test('an account with an expired password must set a new one first', async ({ page }) => {
    await signIn(page, 'kadaluarsa');

    await expect(page).toHaveURL(/\/password-expired$/);
});

test('File Manage: opens a folder, makes a folder and uploads a file', async ({ page }) => {
    await signIn(page);
    await page.getByRole('link', { name: 'File Manage' }).click();

    await page.getByRole('button', { name: /^Dokumen\s*Folder/ }).click();
    await expect(page.getByText('Prosedur Operasional.pdf')).toBeVisible();

    await page.getByRole('button', { name: 'Folder Baru' }).click();
    await page.getByLabel(/Nama/).fill('Arsip 2026');
    await page.getByRole('button', { name: 'Simpan' }).click();
    await expect(page.getByRole('button', { name: /^Arsip 2026\s*Folder/ })).toBeVisible();

    await page.getByRole('button', { name: 'Unggah' }).click();
    await page.getByLabel(/Pilih berkas/).setInputFiles({ name: 'ringkasan.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(2048) });
    await expect(page.getByText('Selesai', { exact: true })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Tutup' }).click();
    await expect(page.getByRole('button', { name: /^ringkasan\.pdf/ })).toBeVisible();
});
