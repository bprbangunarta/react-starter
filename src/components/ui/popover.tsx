import { Popover as P } from 'radix-ui';
import { cn } from '@/lib/utils';

export const Popover = P.Root;
export const PopoverTrigger = P.Trigger;
export const PopoverAnchor = P.Anchor;

export function PopoverContent({ className, ...props }: React.ComponentProps<typeof P.Content>) {
    return (
        <P.Portal>
            <P.Content
                align="start"
                sideOffset={4}
                className={cn('z-[70] rounded-md border border-line bg-surface shadow-lg focus:outline-none', className)}
                {...props}
            />
        </P.Portal>
    );
}
