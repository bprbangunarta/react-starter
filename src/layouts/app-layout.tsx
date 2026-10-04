import { ChevronDown, LayoutDashboard, LogOut, Menu, Palette, ScrollText, ShieldAlert, UserRound, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useSession } from '@/auth/session';
import { NetworkStatus } from '@/components/network-status';
import { NotificationBell } from '@/components/notification-bell';
import { ReauthDialog } from '@/components/reauth-dialog';
import { Button } from '@/components/ui/button';
import { overlayClass, useRestoreFocus } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/misc';
import { DropdownContent, DropdownItem, DropdownLabel, DropdownMenu, DropdownSeparator, DropdownTrigger } from '@/components/ui/dropdown';
import { TooltipProvider } from '@/components/ui/tooltip';
import { APP_INITIAL, APP_NAME } from '@/lib/brand';
import { cn } from '@/lib/utils';

/** The sidebar. Add an entry here for every page the product gets. */
const MENU: { label?: string; items: { label: string; to: string; icon: LucideIcon; end?: boolean }[] }[] = [
    { items: [{ label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true }] },
    {
        label: 'Sistem',
        items: [
            { label: 'Panduan', to: '/styleguide', icon: Palette },
            { label: 'Audit log', to: '/audit-logs', icon: ScrollText },
        ],
    },
];

function Brand({ onNavigate }: { onNavigate?: () => void }) {
    return (
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">{APP_INITIAL}</span>
            {APP_NAME}
        </Link>
    );
}

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
    return (
        <nav className="flex flex-col gap-0.5 overflow-y-auto p-2" aria-label="Menu utama">
            {MENU.map((section, index) => (
                <div key={section.label ?? index} className="flex flex-col gap-0.5">
                    {section.label && <p className="mt-2 px-2.5 pb-0.5 text-2xs font-semibold tracking-wide text-muted/80 uppercase">{section.label}</p>}
                    {section.items.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={onNavigate}
                            className={({ isActive }) =>
                                cn(
                                    'flex h-8 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-muted transition-colors hover:bg-canvas hover:text-ink [&_svg]:size-4',
                                    isActive && 'bg-primary-soft text-primary hover:bg-primary-soft hover:text-primary',
                                )
                            }
                        >
                            <item.icon />
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            ))}
        </nav>
    );
}

/** The frame of every signed-in page: sidebar, top bar (notifications, account menu), reminder to turn on two-factor. */
export default function AppLayout() {
    const { me, signOut } = useSession();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const restoreFocus = useRestoreFocus(mobileOpen);

    // The drawer is for small screens: close it when the window grows past the desktop breakpoint, so its scroll lock does not linger.
    useEffect(() => {
        const desktop = window.matchMedia('(min-width: 1024px)');
        const close = () => desktop.matches && setMobileOpen(false);
        desktop.addEventListener('change', close);

        return () => desktop.removeEventListener('change', close);
    }, []);

    if (!me) {
        return null;
    }

    return (
        <TooltipProvider delayDuration={200}>
            <a
                href="#content"
                className="sr-only z-50 rounded-md bg-surface px-3 py-2 text-sm font-medium text-primary shadow-md focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
            >
                Lewati ke konten
            </a>
            <div className="flex min-h-screen">
                <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex">
                    <div className="flex h-12 items-center border-b border-line px-4">
                        <Brand />
                    </div>
                    <Sidebar onNavigate={() => undefined} />
                </aside>

                <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className={cn(overlayClass, 'z-40 lg:hidden')} />
                        <Dialog.Content
                            aria-describedby={undefined}
                            {...restoreFocus}
                            className="overlay-fade fixed inset-y-0 left-0 z-40 w-64 bg-surface shadow-xl focus:outline-none lg:hidden"
                        >
                            <div className="flex h-12 items-center justify-between border-b border-line px-4">
                                <Dialog.Title className="sr-only">Menu navigasi</Dialog.Title>
                                <Brand onNavigate={() => setMobileOpen(false)} />
                                <Dialog.Close asChild>
                                    <Button variant="ghost" size="icon" aria-label="Tutup menu">
                                        <X />
                                    </Button>
                                </Dialog.Close>
                            </div>
                            <Sidebar onNavigate={() => setMobileOpen(false)} />
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-line bg-surface px-3 sm:px-5">
                        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buka menu" onClick={() => setMobileOpen(true)}>
                            <Menu />
                        </Button>
                        <div className="hidden lg:block" />
                        <div className="flex items-center gap-1">
                            <NotificationBell />
                            <DropdownMenu>
                                <DropdownTrigger asChild>
                                    <button type="button" className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 hover:bg-canvas">
                                        <span className="flex size-6 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                                            {me.user.name.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="hidden text-sm font-medium sm:block">{me.user.name}</span>
                                        <ChevronDown className="size-3.5 text-muted" />
                                    </button>
                                </DropdownTrigger>
                                <DropdownContent>
                                    <DropdownLabel className="px-2 py-1.5 text-xs text-muted">{me.user.email}</DropdownLabel>
                                    <DropdownSeparator />
                                    <DropdownItem icon={<UserRound />} onSelect={() => navigate('/profile')}>
                                        Profil
                                    </DropdownItem>
                                    <DropdownSeparator />
                                    <DropdownItem icon={<LogOut />} onSelect={() => void signOut().then(() => navigate('/login'))}>
                                        Keluar
                                    </DropdownItem>
                                </DropdownContent>
                            </DropdownMenu>
                        </div>
                    </header>
                    {me.security.enabled && me.security.method === null && (
                        <div
                            role="status"
                            className="flex items-center gap-2 border-b border-warning-line bg-warning-soft px-3 py-1.5 text-xs text-warning-ink sm:px-5"
                        >
                            <ShieldAlert className="size-3.5 shrink-0" />
                            <span className="min-w-0 flex-1 truncate">Akun Anda belum dilindungi verifikasi dua langkah.</span>
                            <Link to="/profile" className="shrink-0 font-medium underline underline-offset-2 hover:no-underline">
                                Aktifkan
                            </Link>
                        </div>
                    )}
                    <main id="content" tabIndex={-1} className="flex-1 p-3 outline-none sm:p-5">
                        <Suspense fallback={<Skeleton className="h-24 w-full" />}>
                            <Outlet />
                        </Suspense>
                    </main>
                </div>
            </div>
            <NetworkStatus />
            <ReauthDialog />
        </TooltipProvider>
    );
}
