import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertTriangle, Bell, CheckCheck, CheckCircle2, Info } from 'lucide-react';
import { Link } from 'react-router';
import { useSession } from '@/auth/session';
import type { Notifications } from '@/auth/session';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { http } from '@/lib/http';
import { cn } from '@/lib/utils';

const LEVEL_ICONS = {
    info: { icon: Info, className: 'text-info' },
    success: { icon: CheckCircle2, className: 'text-success' },
    warning: { icon: AlertTriangle, className: 'text-warning' },
} as const;

/** The notification level as a small icon in the status colour (base token of the shared ladder). */
function LevelIcon({ level }: { level: keyof typeof LEVEL_ICONS }) {
    const { icon: Icon, className } = LEVEL_ICONS[level];

    return <Icon aria-hidden="true" className={cn('mt-0.5 size-3.5 shrink-0', className)} />;
}

export function NotificationBell() {
    const { me, setNotifications } = useSession();
    const { unread, items } = me?.notifications ?? { unread: 0, items: [] };

    const markRead = async (url: string) => setNotifications(await http.post<Notifications>(url));

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Notifikasi${unread ? ` (${unread} belum dibaca)` : ''}`} className="relative">
                    <Bell />
                    {unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-2xs leading-4 font-semibold text-white">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" aria-label="Notifikasi" className="w-80 p-0">
                <div className="flex items-center justify-between border-b border-line px-3 py-2">
                    <p className="text-sm font-semibold">Notifikasi</p>
                    {unread > 0 && (
                        <button
                            type="button"
                            onClick={() => void markRead('/notifications/read-all')}
                            className="flex cursor-pointer items-center gap-1 text-xs text-primary hover:underline"
                        >
                            <CheckCheck className="size-3.5" /> Tandai semua dibaca
                        </button>
                    )}
                </div>
                {items.length === 0 ? (
                    <p className="px-3 py-8 text-center text-xs text-muted">Tidak ada notifikasi baru.</p>
                ) : (
                    <ul className="max-h-80 divide-y divide-line overflow-auto">
                        {items.map((n) => {
                            const content = (
                                <div className="flex items-start gap-2">
                                    <LevelIcon level={n.level} />
                                    <div className="min-w-0 flex-1">
                                        <p className={cn('text-sm', !n.read && 'font-medium')}>{n.title}</p>
                                        {n.body && <p className="text-xs text-muted">{n.body}</p>}
                                        <p className="mt-0.5 text-2xs text-muted">{formatDistanceToNow(new Date(n.at), { addSuffix: true, locale: id })}</p>
                                    </div>
                                    {!n.read && <span aria-label="Belum dibaca" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />}
                                </div>
                            );
                            const read = () => !n.read && void markRead(`/notifications/${n.id}/read`);

                            return (
                                <li key={n.id} className="hover:bg-canvas">
                                    {n.url ? (
                                        <Link to={n.url} className="block px-3 py-2" onClick={read}>
                                            {content}
                                        </Link>
                                    ) : (
                                        <button type="button" className="block w-full cursor-pointer px-3 py-2 text-left" onClick={read}>
                                            {content}
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </PopoverContent>
        </Popover>
    );
}
