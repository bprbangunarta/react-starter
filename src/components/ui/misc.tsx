import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div className={cn('rounded-lg border border-line bg-surface', className)} {...props} />
    );
}

export function Skeleton({ className }: { className?: string }) {
    return <div className={cn('animate-pulse rounded bg-line', className)} />;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
}: {
    icon: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center gap-1 px-4 py-10 text-center [&>svg]:size-8 [&>svg]:text-muted/50">
            {icon}
            <p className="mt-1 text-sm font-medium">{title}</p>
            {description && <p className="text-xs text-muted">{description}</p>}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
            <AlertTriangle className="size-8 text-danger/60" />
            <p className="mt-1 text-sm font-medium">Terjadi kesalahan</p>
            <p className="text-xs text-muted">{message}</p>
            {onRetry && (
                <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
                    Coba lagi
                </Button>
            )}
        </div>
    );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
    return (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
                <h1 className="text-base font-semibold">{title}</h1>
                {description && <p className="text-xs text-muted">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}

const badgeTones = {
    neutral: 'bg-canvas text-muted ring-line',
    info: 'bg-primary-soft text-primary ring-primary/20',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    danger: 'bg-red-50 text-danger ring-danger/20',
} as const;

export type BadgeTone = keyof typeof badgeTones;

export function Badge({ tone = 'neutral', className, ...props }: React.ComponentProps<'span'> & { tone?: BadgeTone }) {
    return (
        <span
            className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[11px] leading-4 font-medium ring-1 ring-inset', badgeTones[tone], className)}
            {...props}
        />
    );
}
