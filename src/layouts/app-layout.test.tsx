import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import AppLayout, { SubMenu } from '@/layouts/app-layout';
import { Database } from 'lucide-react';

vi.mock('@/auth/session', () => ({
    useSession: () => ({
        me: {
            user: { id: 1, name: 'Rina', username: 'rina', email: 'rina@example.com', avatar_url: null },
            security: { enabled: true, method: 'totp' },
            notifications: { unread: 0, items: [] },
            session: { idle_minutes: 10 },
        },
        loading: false,
        refresh: vi.fn(),
        setNotifications: vi.fn(),
        signOut: vi.fn(),
    }),
}));

const renderLayout = (path = '/') =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route index element={<p>isi</p>} />
                    <Route path="*" element={<p>isi</p>} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );

/** The menu as people read it, top to bottom: section headings and links in order. */
const menu = () =>
    within(screen.getByRole('navigation', { name: 'Menu utama' }))
        .getAllByText(/./)
        .map((node) => node.textContent);

describe('sidebar', () => {
    // jsdom has no media queries; the layout asks whether the screen is wide.
    beforeAll(() => {
        window.matchMedia = vi
            .fn()
            .mockImplementation((query: string) => ({ matches: true, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    });

    it('follows the order work is done in, with short labels', () => {
        renderLayout();

        expect(menu()).toEqual(['Dashboard', 'Sistem', 'Audit Logs', 'UI Guideline']);
    });

    it('marks the page being shown', () => {
        renderLayout('/audit-logs');

        expect(within(screen.getByRole('navigation', { name: 'Menu utama' })).getByRole('link', { name: 'Audit Logs' })).toHaveAttribute(
            'aria-current',
            'page',
        );
    });
});

describe('submenu', () => {
    const children = [
        { label: 'Data Jabatan', to: '/roles' },
        { label: 'Data Kantor', to: '/offices' },
    ];
    const draw = (path: string) =>
        render(
            <MemoryRouter initialEntries={[path]}>
                <SubMenu label="Data Master" icon={Database} onNavigate={() => undefined}>
                    {children}
                </SubMenu>
            </MemoryRouter>,
        );

    it('is closed until opened when none of its pages is shown', () => {
        draw('/');
        const toggle = screen.getByRole('button', { name: 'Data Master' });

        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('link', { name: 'Data Kantor' })).not.toBeInTheDocument();

        fireEvent.click(toggle);

        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('link', { name: 'Data Kantor' })).toBeInTheDocument();
    });

    it('opens by itself while one of its pages is shown, until the person closes it', () => {
        draw('/offices');
        const toggle = screen.getByRole('button', { name: 'Data Master' });

        expect(toggle).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(toggle);

        expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
});
