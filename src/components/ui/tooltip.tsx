import { Tooltip as T } from 'radix-ui';
import type { ReactNode } from 'react';

export function Tip({ label, children }: { label: string; children: ReactNode }) {
    return (
        <T.Root>
            <T.Trigger asChild>{children}</T.Trigger>
            <T.Portal>
                <T.Content
                    sideOffset={4}
                    className="z-[60] rounded bg-ink px-2 py-1 text-xs text-white"
                >
                    {label}
                </T.Content>
            </T.Portal>
        </T.Root>
    );
}

export const TooltipProvider = T.Provider;
