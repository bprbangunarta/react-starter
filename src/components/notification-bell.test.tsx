import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { toast } from 'sonner';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotificationBell, isInternalPath } from '@/components/notification-bell';
import type * as HttpModule from '@/lib/http';
import { HttpError } from '@/lib/http';

const http = vi.hoisted(() => ({ post: vi.fn() }));
const session = vi.hoisted(() => ({ setNotifications: vi.fn(), notifications: { unread: 0, items: [] as unknown[] } }));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock('@/lib/http', async (importOriginal) => ({ ...(await importOriginal<typeof HttpModule>()), http }));
vi.mock('@/auth/session', () => ({ useSession: () => ({ me: { notifications: session.notifications }, setNotifications: session.setNotifications }) }));

const item = (over: Record<string, unknown> = {}) => ({
    id: 7,
    title: 'Peringatan keamanan',
    body: 'Isi',
    module: 'Keamanan',
    level: 'warning',
    url: null,
    read: false,
    at: new Date().toISOString(),
    ...over,
});

const open = async () => {
    render(
        <MemoryRouter>
            <NotificationBell />
        </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole('button', { name: /^Notifikasi/ }));
};

describe('notification bell', () => {
    afterEach(() => {
        http.post.mockReset();
        session.setNotifications.mockReset();
        vi.mocked(toast.error).mockReset();
    });

    it('follows only links that are paths inside the application', () => {
        expect(isInternalPath('/audit-logs?module=alert')).toBe(true);
        for (const bad of [null, '', 'https://contoh.example', '//contoh.example', '/\\contoh.example', 'javascript:alert(1)', 'audit-logs']) {
            expect(isInternalPath(bad)).toBe(false);
        }
    });

    it('shows an outside link as plain text, not as a link', async () => {
        session.notifications = { unread: 1, items: [item({ url: 'https://contoh.example/masuk' })] };
        await open();

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Peringatan keamanan/ })).toBeInTheDocument();
    });

    it('names the level and the unread state in text, not by colour alone', async () => {
        session.notifications = { unread: 1, items: [item({ url: '/audit-logs' })] };
        await open();

        const link = screen.getByRole('link', { name: /Peringatan: Peringatan keamanan/ });
        expect(link).toHaveAttribute('href', '/audit-logs');
        expect(link).toHaveTextContent('Belum dibaca');
    });

    it('marks all as read only up to the newest notification shown', async () => {
        session.notifications = { unread: 2, items: [item({ id: 9 }), item({ id: 8 })] };
        http.post.mockResolvedValue({ unread: 0, items: [] });
        await open();

        await userEvent.click(screen.getByRole('button', { name: /Tandai semua dibaca/ }));

        await waitFor(() => expect(http.post).toHaveBeenCalledWith('/notifications/read-all', { up_to: 9 }));
    });

    it('tells the person when marking as read fails', async () => {
        session.notifications = { unread: 1, items: [item()] };
        http.post.mockRejectedValue(new HttpError(500, 'Terjadi kesalahan.', {}));
        await open();

        await userEvent.click(screen.getByRole('button', { name: /Tandai semua dibaca/ }));

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Terjadi kesalahan.'));
        expect(session.setNotifications).not.toHaveBeenCalled();
    });

    it('closes the list when the person opens a notification that links somewhere', async () => {
        session.notifications = { unread: 1, items: [item({ url: '/audit-logs' })] };
        http.post.mockResolvedValue({ unread: 0, items: [] });
        await open();

        await userEvent.click(screen.getByRole('link', { name: /Peringatan keamanan/ }));

        await waitFor(() => expect(screen.queryByRole('link', { name: /Peringatan keamanan/ })).not.toBeInTheDocument());
    });
});
