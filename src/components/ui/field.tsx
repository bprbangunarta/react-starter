import { Info } from 'lucide-react';
import { cloneElement, isValidElement, useId } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Tip, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * A label, its control, and the error. A description for the field is the `hint`: it is shown as a tooltip on an info icon beside the
 * label, never as text under the control (only the error shows there). Screen readers still get the hint as the control's description.
 */
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
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;
    const hintId = hint ? `${id}-hint` : undefined;
    const note = [errorId, hintId].filter(Boolean).join(' ') || undefined;
    // Connect the label, hint, and error to the control: the label's `for`, plus aria-describedby and aria-invalid.
    const control = isValidElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>(children)
        ? cloneElement(children as ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>, {
              id: children.props.id ?? id,
              'aria-describedby': children.props['aria-describedby'] ?? note,
              'aria-invalid': children.props['aria-invalid'] ?? (error ? true : undefined),
          })
        : children;
    const target = isValidElement<{ id?: string }>(children) ? (children.props.id ?? id) : undefined;

    return (
        <div className={cn('flex min-w-0 flex-col gap-1', className)}>
            <div className="flex items-center gap-1">
                <label htmlFor={target} className="text-xs font-medium text-ink">
                    {label}
                    {required && <span className="ml-0.5 text-danger">*</span>}
                </label>
                {hint && (
                    <TooltipProvider delayDuration={200}>
                        <Tip label={hint}>
                            <button
                                type="button"
                                aria-label="Lihat keterangan"
                                className="flex size-4 cursor-help items-center justify-center rounded-full text-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none [&_svg]:size-3.5"
                            >
                                <Info />
                            </button>
                        </Tip>
                    </TooltipProvider>
                )}
            </div>
            {control}
            {hint && (
                <p id={hintId} className="sr-only">
                    {hint}
                </p>
            )}
            {error && (
                <p id={errorId} role="alert" className="text-xs text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}
