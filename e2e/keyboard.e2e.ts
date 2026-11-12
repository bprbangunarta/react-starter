import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function signIn(page: Page) {
    await page.goto('/login');
    await page.getByPlaceholder('Email atau Username').fill('admin');
    await page.getByPlaceholder('************************').fill('password');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await expect(page.getByRole('navigation', { name: 'Menu utama' })).toBeVisible();
}

test('a file opens in the drawer with Enter, Escape closes it and focus returns to the file', async ({ page }) => {
    await signIn(page);
    await page.goto('/file-manage');

    const file = page.getByRole('button', { name: /^Panduan Pengguna\.pdf/ });
    await file.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Panduan Pengguna.pdf' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(file).toBeFocused();
});

test('the action menu works by keyboard and gives focus back', async ({ page }) => {
    await signIn(page);
    await page.goto('/file-manage');

    const trigger = page.getByRole('button', { name: 'Aksi Dokumen' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    // Opening by keyboard puts focus on the first item.
    await expect(page.getByRole('menuitem', { name: 'Ubah nama' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Ubah nama' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();
});

test('an accordion section opens and closes with the keyboard', async ({ page }) => {
    await signIn(page);
    await page.goto('/ui-guideline');

    const section = page.getByRole('button', { name: 'Bagaimana menyambung backend?' });
    await section.focus();
    await expect(section).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Enter');
    await expect(section).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Space');
    await expect(section).toHaveAttribute('aria-expanded', 'false');
});

test('a combobox is operated with arrows and Enter', async ({ page }) => {
    await signIn(page);
    await page.goto('/audit-logs');

    await page.getByRole('combobox', { name: 'Filter hasil' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(page.getByRole('combobox', { name: 'Filter hasil' })).not.toContainText('Hasil');
});
