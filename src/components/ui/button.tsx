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
                primary: 'bg-primary text-white hover:bg-primary-hover',
                outline: 'border border-line bg-surface text-ink hover:bg-canvas',
                ghost: 'text-muted hover:bg-canvas hover:text-ink',
                danger: 'bg-danger text-white hover:bg-danger/90',
            },
            size: {
                default: 'h-8 px-3',
                sm: 'h-7 px-2.5 text-xs',
                icon: 'size-7',
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
