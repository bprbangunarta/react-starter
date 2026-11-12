import { Progress as P } from 'radix-ui';
import { cn } from '@/lib/utils';

const tones = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
} as const;

type Props = {
    /** 0 to `max`; leave out when the length of the task is unknown. */
    value?: number;
    max?: number;
    tone?: keyof typeof tones;
    /** Text above the bar; the percentage is shown beside it. */
    label?: string;
    'aria-label'?: string;
    className?: string;
};

/** Progress of a task or a share of a quota. Without `value` it shows a moving bar (indeterminate). */
export function Progress({ value, max = 100, tone = 'primary', label, 'aria-label': ariaLabel, className }: Props) {
    const percent = value === undefined ? null : Math.round((Math.min(Math.max(value, 0), max) / max) * 100);

    return (
        <div className={cn('flex flex-col gap-1', className)}>
            {label && (
                <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate text-ink">{label}</span>
                    {percent !== null && <span className="shrink-0 text-muted">{percent}%</span>}
                </div>
            )}
            <P.Root value={value ?? null} max={max} aria-label={ariaLabel ?? label} className="relative h-2 w-full overflow-hidden rounded-full bg-canvas">
                <P.Indicator
                    className={cn('h-full rounded-full transition-[width] duration-300', tones[tone], percent === null && 'w-1/3 animate-pulse')}
                    style={percent === null ? undefined : { width: `${percent}%` }}
                />
            </P.Root>
        </div>
    );
}
