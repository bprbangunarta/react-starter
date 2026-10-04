import { useLayoutEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { applyMask, caretAfter, dataBefore } from '@/lib/mask';

const isData = (char: string) => /[a-zA-Z0-9]/.test(char);

type Props = Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'defaultValue'> & {
    /** The data without literals (e.g. "081234567890" for mask 9999-9999-9999). */
    value: string;
    onValueChange: (raw: string) => void;
    /** Mask tokens: 9 digit, a letter, * letter or digit, h hex digit; everything else is literal. See `MASKS` in lib/mask.ts. */
    mask: string;
};

/**
 * A text input that formats as you type (phone, NIK, NPWP, ...). The screen keeps and sends the unmasked `value`.
 * Wrong characters are dropped; the caret stays where you were typing.
 */
export function MaskedInput({ value, onValueChange, mask, className, ...props }: Props) {
    const ref = useRef<HTMLInputElement>(null);
    const caret = useRef<number | null>(null);
    const { masked } = applyMask(value, mask);

    useLayoutEffect(() => {
        if (caret.current !== null && ref.current && document.activeElement === ref.current) {
            ref.current.setSelectionRange(caret.current, caret.current);
        }

        caret.current = null;
    }, [masked]);

    return (
        <Input
            ref={ref}
            value={masked}
            inputMode={/^[9\W]+$/.test(mask) ? 'numeric' : 'text'}
            autoComplete="off"
            className={className}
            onChange={(event) => {
                const element = event.currentTarget;
                let text = element.value;
                let position = element.selectionStart ?? text.length;
                const native = event.nativeEvent as InputEvent;

                // Backspace over a literal ("0812-|"): the literal would just come back, so delete the data before it too.
                if (native.inputType === 'deleteContentBackward' && applyMask(text, mask).masked === masked && position > 0) {
                    text = text.slice(0, position - 1) + text.slice(position);
                    position -= 1;
                }

                const result = applyMask(text, mask);
                caret.current = caretAfter(result.masked, dataBefore(text, position, isData), isData);
                onValueChange(result.raw);
            }}
            {...props}
        />
    );
}
