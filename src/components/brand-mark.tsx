import { APP_INITIAL, APP_NAME } from '@/lib/brand';
import { cn } from '@/lib/utils';

/** The logo letter and the app name, for the screens outside the app shell (sign-in, error). */
export function BrandMark({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">{APP_INITIAL}</span>
            <span className="text-base font-semibold">{APP_NAME}</span>
        </div>
    );
}
