import { DropdownMenu as M } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const DropdownMenu = M.Root;
export const DropdownTrigger = M.Trigger;

export function DropdownContent({ className, ...props }: React.ComponentProps<typeof M.Content>) {
    return (
        <M.Portal>
            <M.Content
                align="end"
                sideOffset={4}
                className={cn('z-50 min-w-36 rounded-md border border-line bg-surface p-1 shadow-lg', className)}
                {...props}
            />
        </M.Portal>
    );
}

export function DropdownItem({ className, danger, icon, children, ...props }: React.ComponentProps<typeof M.Item> & { danger?: boolean; icon?: ReactNode }) {
    return (
        <M.Item
            className={cn(
                'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-canvas [&_svg]:size-3.5',
                danger && 'text-danger',
                className,
            )}
            {...props}
        >
            {icon}
            {children}
        </M.Item>
    );
}

export const DropdownSeparator = () => <M.Separator className="my-1 h-px bg-line" />;
export const DropdownLabel = M.Label;
