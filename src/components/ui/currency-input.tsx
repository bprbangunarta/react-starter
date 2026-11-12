import { useLayoutEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';
import { caretAfter, dataBefore } from '@/lib/mask';

const isDigit = (char: string) => /\d/.test(char);

type Props = Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'defaultValue' | 'prefix'> & {
    /** Amount as a number in whole units, null when empty. */
    value: number | null;
    onValueChange: (value: number | null) => void;
    /** Text before the amount. null for a plain number with separators. */
    prefix?: string | null;
    /** Most digits allowed, default 15 (exact in a JS number). */
    maxDigits?: number;
};

/** Money field: digits only, formatted while typing (1000000 becomes 1.000.000). The value stays a number. */
export function CurrencyInput({ value, onValueChange, prefix = 'Rp', maxDigits = 15, className, ...props }: Props) {
    const ref = useRef<HTMLInputElement>(null);
    const caret = useRef<number | null>(null);
    const text = value === null ? '' : formatNumber(value);

    useLayoutEffect(() => {
        if (caret.current !== null && ref.current && document.activeElement === ref.current) {
            ref.current.setSelectionRange(caret.current, caret.current);
        }

        caret.current = null;
    }, [text]);

    return (
        <div className="relative">
            {prefix && <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted">{prefix}</span>}
            <Input
                ref={ref}
                value={text}
                inputMode="numeric"
                autoComplete="off"
                className={cn('text-right tabular-nums', prefix && 'pl-9', className)}
                onChange={(event) => {
                    const element = event.currentTarget;
                    const typed = element.value;
                    const position = element.selectionStart ?? typed.length;
                    const native = event.nativeEvent as InputEvent;
                    let before = dataBefore(typed, position, isDigit);
                    let digits = typed.replace(/\D/g, '');

                    // Backspace on a separator changes nothing, so remove the digit before it.
                    if (native.inputType === 'deleteContentBackward' && digits === (value === null ? '' : String(value)) && before > 0) {
                        digits = digits.slice(0, before - 1) + digits.slice(before);
                        before -= 1;
                    }

                    digits = digits.slice(0, maxDigits).replace(/^0+(?=\d)/, '');
                    const next = digits === '' ? null : Number(digits);
                    caret.current = caretAfter(next === null ? '' : formatNumber(next), Math.min(before, digits.length), isDigit);
                    onValueChange(next);
                }}
                {...props}
            />
        </div>
    );
}
