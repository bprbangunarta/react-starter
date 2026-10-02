import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Field({
    label,
    error,
    required,
    hint,
    className,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    hint?: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={cn('flex min-w-0 flex-col gap-1', className)}>
            <label className="text-xs font-medium text-ink">
                {label}
                {required && <span className="ml-0.5 text-danger">*</span>}
            </label>
            {children}
            {error ? (
                <p role="alert" className="text-xs text-danger">
                    {error}
                </p>
            ) : (
                hint && <p className="text-xs text-muted">{hint}</p>
            )}
        </div>
    );
}
