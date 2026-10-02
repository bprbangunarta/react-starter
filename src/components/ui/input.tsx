import * as React from 'react';
import { cn } from '@/lib/utils';

export const controlClass =
    'h-8 w-full rounded-md border border-line bg-surface px-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-danger/20';

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
    return <input className={cn(controlClass, className)} {...props} />;
}
