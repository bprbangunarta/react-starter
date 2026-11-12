import { Check } from 'lucide-react';
import { Checkbox as C, RadioGroup as R, Switch as S } from 'radix-ui';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const box =
    'flex size-4 shrink-0 cursor-pointer items-center justify-center border border-line bg-surface transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary';

function Label({ htmlFor, label, description }: { htmlFor: string; label: ReactNode; description?: string }) {
    return (
        <label htmlFor={htmlFor} className="min-w-0 cursor-pointer text-sm leading-4 text-ink">
            {label}
            {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
        </label>
    );
}

/** Checkbox. Clicking the label toggles it. */
export function Checkbox({ label, description, className, ...props }: React.ComponentProps<typeof C.Root> & { label: ReactNode; description?: string }) {
    const id = useId();

    return (
        <div className={cn('flex items-start gap-2', className)}>
            <C.Root id={id} className={cn(box, 'mt-px rounded')} {...props}>
                <C.Indicator>
                    <Check className="size-3 text-white" strokeWidth={3} />
                </C.Indicator>
            </C.Root>
            <Label htmlFor={id} label={label} description={description} />
        </div>
    );
}

/** Switch for settings that apply immediately. Use a Checkbox when a Save button is needed. */
export function Switch({ label, description, className, ...props }: React.ComponentProps<typeof S.Root> & { label: ReactNode; description?: string }) {
    const id = useId();

    return (
        <div className={cn('flex items-start gap-2', className)}>
            <S.Root
                id={id}
                className="relative mt-px h-[18px] w-8 shrink-0 cursor-pointer rounded-full bg-line transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary"
                {...props}
            >
                <S.Thumb className="block size-3.5 translate-x-0.5 rounded-full bg-surface shadow-sm transition-transform duration-200 ease-out data-[state=checked]:translate-x-[16px]" />
            </S.Root>
            <Label htmlFor={id} label={label} description={description} />
        </div>
    );
}

export type RadioOption = { value: string; label: ReactNode; description?: string; disabled?: boolean };

/** Radio group for up to about 5 options. Use Combobox for more. */
export function RadioGroup({ options, className, ...props }: React.ComponentProps<typeof R.Root> & { options: readonly RadioOption[] }) {
    const group = useId();

    return (
        <R.Root className={cn('flex flex-col gap-2', className)} {...props}>
            {options.map((option) => {
                const id = `${group}-${option.value}`;

                return (
                    <div key={option.value} className="flex items-start gap-2">
                        <R.Item id={id} value={option.value} disabled={option.disabled} className={cn(box, 'mt-px rounded-full')}>
                            <R.Indicator className="size-1.5 rounded-full bg-white" />
                        </R.Item>
                        <Label htmlFor={id} label={option.label} description={option.description} />
                    </div>
                );
            })}
        </R.Root>
    );
}
