import { useState } from 'react';
import { AlertTriangle, Bell, CheckCheck, CheckCircle2, Info } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useSession } from '@/auth/session';
import type { Notifications } from '@/auth/session';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatRelative } from '@/lib/format';
import { http, HttpError } from '@/lib/http';
import { cn } from '@/lib/utils';

const LEVEL_ICONS = {
    info: { icon: Info, className: 'text-info', label: 'Info' },
    success: { icon: CheckCircle2, className: 'text-success', label: 'Berhasil' },
    warning: { icon: AlertTriangle, className: 'text-warning', label: 'Peringatan' },
} as const;

/** The notification level as a small icon in the status colour (base token of the shared ladder), named in text for a screen reader. */
function LevelIcon({ level }: { level: keyof typeof LEVEL_ICONS }) {
    const { icon: Icon, className, label } = LEVEL_ICONS[level];

    return (
        <>
            <Icon aria-hidden="true" className={cn('mt-0.5 size-3.5 shrink-0', className)} />
            <span className="sr-only">{label}: </span>
        </>
    );
}

/** A link is followed only when it is a path inside this application; anything else already stored is shown as plain text. */
export function isInternalPath(url: string | null): url is string {
    return url !== null && /^\/(?![/\\])/.test(url);
}

export function NotificationBell() {
    const { me, setNotifications } = useSession();
    const [open, setOpen] = useState(false);
    const { unread, items } = me?.notifications ?? { unread: 0, items: [] };

    const markRead = async (url: string, data?: { up_to: number }) => {
        try {
            setNotifications(await http.post<Notifications>(url, data));
        } catch (error) {
            toast.error(error instanceof HttpError ? error.message : 'Tidak dapat menandai notifikasi. Coba lagi.');
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
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
                            onClick={() => void markRead('/notifications/read-all', { up_to: items[0].id })}
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
                                        <p className="mt-0.5 text-2xs text-muted">{formatRelative(n.at)}</p>
                                    </div>
                                    {!n.read && (
                                        <>
                                            <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                                            <span className="sr-only">Belum dibaca</span>
                                        </>
                                    )}
                                </div>
                            );
                            const read = () => !n.read && void markRead(`/notifications/${n.id}/read`);

                            return (
                                <li key={n.id} className="hover:bg-canvas">
                                    {isInternalPath(n.url) ? (
                                        <Link
                                            to={n.url}
                                            className="block px-3 py-2"
                                            onClick={() => {
                                                read();
                                                setOpen(false);
                                            }}
                                        >
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
