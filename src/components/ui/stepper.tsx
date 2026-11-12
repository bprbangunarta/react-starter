import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Step = {
    label: string;
    description?: string;
};

/**
 * Process steps. current is the active index: earlier steps get a check, later ones are dimmed.
 * Vertical on phones, horizontal from sm.
 */
export function Stepper({ steps, current, 'aria-label': ariaLabel = 'Langkah' }: { steps: Step[]; current: number; 'aria-label'?: string }) {
    return (
        <ol aria-label={ariaLabel} className="flex flex-col gap-3 sm:flex-row sm:gap-2">
            {steps.map((step, index) => {
                const done = index < current;
                const active = index === current;

                return (
                    <li key={step.label} aria-current={active ? 'step' : undefined} className="flex min-w-0 flex-1 items-start gap-2 sm:flex-col sm:gap-1.5">
                        <div className="flex items-center gap-2 sm:w-full">
                            <span
                                className={cn(
                                    'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                                    done && 'border-primary bg-primary text-on-primary',
                                    active && 'border-primary bg-primary-soft text-primary',
                                    !done && !active && 'border-line bg-surface text-muted',
                                )}
                            >
                                {done ? <Check className="size-3.5" strokeWidth={3} aria-label="Selesai" /> : index + 1}
                            </span>
                            {index < steps.length - 1 && <span aria-hidden className={cn('hidden h-px flex-1 sm:block', done ? 'bg-primary' : 'bg-line')} />}
                        </div>
                        <div className="min-w-0">
                            <p className={cn('text-sm', active ? 'font-semibold text-ink' : done ? 'font-medium text-ink' : 'text-muted')}>{step.label}</p>
                            {step.description && <p className="text-xs text-muted">{step.description}</p>}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
