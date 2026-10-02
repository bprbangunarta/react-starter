import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * One-time code field. The constraints travel with the validation: digits only, 6 characters, numeric
 * keyboard and browser/OS autofill of SMS/email codes. With `recovery` it accepts a recovery code instead.
 */
export function CodeInput({
    recovery = false,
    className,
    onValueChange,
    ...props
}: Omit<ComponentProps<typeof Input>, 'onChange' | 'type'> & { recovery?: boolean; onValueChange: (value: string) => void }) {
    return (
        <Input
            {...props}
            type="text"
            inputMode={recovery ? 'text' : 'numeric'}
            autoComplete={recovery ? 'off' : 'one-time-code'}
            pattern={recovery ? undefined : '[0-9]*'}
            maxLength={recovery ? 11 : 6}
            spellCheck={false}
            className={cn('text-center font-mono tracking-[0.3em]', recovery && 'tracking-widest', className)}
            onChange={(e) => onValueChange(recovery ? e.target.value.toLowerCase().trim() : e.target.value.replace(/\D/g, ''))}
        />
    );
}
