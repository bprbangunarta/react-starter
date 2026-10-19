import * as React from 'react';
import { cn } from '@/lib/utils';

export const controlClass =
    'h-8 w-full rounded-md border border-line bg-surface px-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-danger/20';

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
    return <input className={cn(controlClass, className)} {...props} />;
}

type GroupProps = {
    children: React.ReactNode;
    className?: string;
    // Passed down by `Field` (label `for`, description, invalid) and given to the control, the first child.
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
};

/**
 * A control with buttons beside it (generate, copy). Put it inside `Field` like any control: the first child is the control and receives
 * the `id`, `aria-describedby`, and `aria-invalid` that `Field` passes, so the label and the error stay wired to it. The buttons use
 * `size="fieldIcon"` to be as tall as the control.
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
