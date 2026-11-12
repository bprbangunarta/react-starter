import { useLayoutEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { applyMask, caretAfter, dataBefore } from '@/lib/mask';

const isData = (char: string) => /[a-zA-Z0-9]/.test(char);

type Props = Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'defaultValue'> & {
    /** The raw data without literals, e.g. "081234567890" for 9999-9999-9999. */
    value: string;
    onValueChange: (raw: string) => void;
    /** Tokens: 9 digit, a letter, * letter or digit, h hex digit. Anything else is a literal. See MASKS in lib/mask.ts. */
    mask: string;
};

/** Text input that formats while typing (phone, NIK, NPWP). The screen keeps the unmasked value. */
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

                // Backspace right after a literal would just bring it back, so delete the data before it too.
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
