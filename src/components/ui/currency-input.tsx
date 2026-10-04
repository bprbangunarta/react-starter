import { useLayoutEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { caretAfter, dataBefore } from '@/lib/mask';

const isDigit = (char: string) => /\d/.test(char);
const thousands = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

type Props = Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'defaultValue' | 'prefix'> & {
    /** The amount as a number (whole units), or null when empty. */
    value: number | null;
    onValueChange: (value: number | null) => void;
    /** Label in front of the amount; `null` for a plain number with thousands separators. */
    prefix?: string | null;
    /** Most digits allowed (default 15, which Number holds exactly). */
    maxDigits?: number;
};

/**
 * Money input: it is a text field, accepts only digits, and formats as you type (1000000 becomes 1.000.000).
 * The value stays a plain number, so the screen sends `1000000` to the API, never the formatted text.
 */
export function CurrencyInput({ value, onValueChange, prefix = 'Rp', maxDigits = 15, className, ...props }: Props) {
    const ref = useRef<HTMLInputElement>(null);
    const caret = useRef<number | null>(null);
    const text = value === null ? '' : thousands.format(value);

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

                    // Backspace over a separator ("1.|000"): nothing changes, so remove the digit before it.
                    if (native.inputType === 'deleteContentBackward' && digits === (value === null ? '' : String(value)) && before > 0) {
                        digits = digits.slice(0, before - 1) + digits.slice(before);
                        before -= 1;
                    }

                    digits = digits.slice(0, maxDigits).replace(/^0+(?=\d)/, '');
                    const next = digits === '' ? null : Number(digits);
                    caret.current = caretAfter(next === null ? '' : thousands.format(next), Math.min(before, digits.length), isDigit);
                    onValueChange(next);
                }}
                {...props}
            />
        </div>
    );
}
