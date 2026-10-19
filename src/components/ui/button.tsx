import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
    'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                // Every variant has the same 1px border box (transparent when it has no visible border), so two buttons side by side
                // are the same size to the pixel, also when a tool scales the screen and a lone border would make one look taller.
                primary: 'border border-transparent bg-primary text-white hover:bg-primary-hover',
                outline: 'border border-line bg-surface text-ink hover:bg-canvas',
                ghost: 'border border-transparent text-muted hover:bg-canvas hover:text-ink',
                danger: 'border border-transparent bg-danger text-white hover:bg-danger/90',
            },
            size: {
                default: 'h-8 px-3',
                sm: 'h-7 px-2.5 text-xs',
                icon: 'size-7',
                // An icon button beside an input (copy, generate): as tall as the input (h-8), so both line up top and bottom.
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
