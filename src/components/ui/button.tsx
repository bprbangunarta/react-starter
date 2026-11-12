import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
    'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                // All variants share a 1px border box (transparent when invisible) so neighbouring buttons match to the pixel.
                primary: 'border border-transparent bg-primary text-on-primary hover:bg-primary-hover',
                outline: 'border border-line bg-surface text-ink hover:bg-canvas',
                ghost: 'border border-transparent text-muted hover:bg-canvas hover:text-ink',
                danger: 'border border-transparent bg-danger text-on-primary hover:bg-danger/90',
            },
            size: {
                default: 'h-8 px-3',
                sm: 'h-7 px-2.5 text-xs',
                icon: 'size-7',
                // As tall as the input (h-8), for buttons next to a field.
                fieldIcon: 'size-8',
            },
        },
        defaultVariants: { variant: 'primary', size: 'default' },
    },
);

type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { loading?: boolean };

export function Button({ className, variant, size, loading, children, disabled, type = 'button', ...props }: ButtonProps) {
    return (
        <button type={type} className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
            {loading && <Loader2 className="animate-spin" />}
            {children}
        </button>
    );
}
