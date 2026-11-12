import { CheckCircle2, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { cn } from '@/lib/utils';

/**
 * Small pill at the bottom of the screen while the connection is lost, and briefly after it returns.
 * It never blocks the page and stays hidden otherwise.
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
                offline ? 'border-danger-line bg-danger-soft text-danger-ink' : 'border-success-line bg-success-soft text-success-ink',
            )}
        >
            {offline ? <WifiOff className="size-3.5 shrink-0" /> : <CheckCircle2 className="size-3.5 shrink-0" />}
            <span>{offline ? 'Tidak ada koneksi. Perubahan belum bisa disimpan sampai Anda kembali online.' : 'Kembali online.'}</span>
        </div>
    );
}
