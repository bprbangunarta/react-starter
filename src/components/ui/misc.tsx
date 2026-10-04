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

/** Status tones: soft surface, line, and ink from the shared ladder in src/index.css. Badge, Alert, and toasts use the same family. */
const badgeTones = {
    neutral: 'bg-canvas text-muted ring-line',
    info: 'bg-info-soft text-info-ink ring-info-line',
    success: 'bg-success-soft text-success-ink ring-success-line',
    warning: 'bg-warning-soft text-warning-ink ring-warning-line',
    danger: 'bg-danger-soft text-danger-ink ring-danger-line',
} as const;

const alertTones = {
    neutral: 'border-line bg-canvas text-muted',
    info: 'border-info-line bg-info-soft text-info-ink',
    success: 'border-success-line bg-success-soft text-success-ink',
    warning: 'border-warning-line bg-warning-soft text-warning-ink',
    danger: 'border-danger-line bg-danger-soft text-danger-ink',
} as const;

export type BadgeTone = keyof typeof badgeTones;

/** An inline message (result of an action, notice). Icon optional; `danger` is announced as an alert, the rest as status. */
export function Alert({ tone = 'info', icon, className, children, ...props }: React.ComponentProps<'div'> & { tone?: BadgeTone; icon?: ReactNode }) {
    return (
        <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex items-start gap-2 rounded-md border px-3 py-2 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0', alertTones[tone], className)} {...props}>
            {icon}
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}

export function Badge({ tone = 'neutral', className, ...props }: React.ComponentProps<'span'> & { tone?: BadgeTone }) {
    return (
        <span
            className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[11px] leading-4 font-medium ring-1 ring-inset', badgeTones[tone], className)}
            {...props}
        />
    );
}
