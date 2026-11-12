import * as React from 'react';
import { cn } from '@/lib/utils';

export const controlClass =
    'h-8 w-full rounded-md border border-line bg-surface px-2.5 text-sm text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-danger/20';

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
    return <input className={cn(controlClass, className)} {...props} />;
}

type GroupProps = {
    children: React.ReactNode;
    className?: string;
    // From Field: label for, description, invalid.
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
};

/**
 * A control with buttons next to it. The first child is the control and gets the id and aria props from Field.
 * Buttons use size="fieldIcon".
 */
export function InputGroup({ children, className, ...wiring }: GroupProps) {
    const [control, ...actions] = React.Children.toArray(children);

    return (
        <div className={cn('flex gap-2', className)}>
            {React.isValidElement<Record<string, unknown>>(control) ? React.cloneElement(control, { ...wiring, ...control.props }) : control}
            {actions}
        </div>
    );
}
