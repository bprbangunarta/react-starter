import { CheckCircle2, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { cn } from '@/lib/utils';

/**
 * A small pill at the bottom of the screen: shown while the connection is lost (stays until it is back) and for a
 * moment after it returns. It never blocks the page, and it is silent while everything is fine.
 */
export function NetworkStatus() {
    const status = useNetworkStatus();

    if (status === 'online') {
        return null;
    }

    const offline = status === 'offline';

    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                'fixed bottom-3 left-1/2 z-50 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-2 rounded-full border px-3 py-1.5 text-xs shadow-md',
                offline
                    ? 'border-danger-line bg-danger-soft text-danger-ink'
                    : 'border-success-line bg-success-soft text-success-ink',
            )}
        >
            {offline ? (
                <WifiOff className="size-3.5 shrink-0" />
            ) : (
                <CheckCircle2 className="size-3.5 shrink-0" />
            )}
            <span>
                {offline
                    ? 'Tidak ada koneksi. Perubahan belum bisa disimpan sampai Anda kembali online.'
                    : 'Kembali online.'}
            </span>
        </div>
    );
}
