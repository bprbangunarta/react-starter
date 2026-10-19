import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * A round profile photo, or the first letter of the name when there is none (or the photo cannot be loaded). The image is decorative:
 * the name is always next to it, so its alternative text is empty.
 */
export function Avatar({ name, src, className }: { name: string; src: string | null; className?: string }) {
    const [failed, setFailed] = useState<string | null>(null);

    if (src && failed !== src) {
        return <img src={src} alt="" onError={() => setFailed(src)} className={cn('shrink-0 rounded-full object-cover', className)} />;
    }

    return (
        <span className={cn('flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary', className)}>
            {name.charAt(0).toUpperCase()}
        </span>
    );
}
