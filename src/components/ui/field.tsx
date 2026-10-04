import { cloneElement, isValidElement, useId } from 'react';
import type { ReactElement, ReactNode } from 'react';
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
    const id = useId();
    const note = error || hint ? `${id}-note` : undefined;
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
            <label htmlFor={target} className="text-xs font-medium text-ink">
                {label}
                {required && <span className="ml-0.5 text-danger">*</span>}
            </label>
            {control}
            {error ? (
                <p id={note} role="alert" className="text-xs text-danger">
                    {error}
                </p>
            ) : (
                hint && (
                    <p id={note} className="text-xs text-muted">
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}
