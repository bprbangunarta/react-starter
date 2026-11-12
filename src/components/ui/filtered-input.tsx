import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';

/** Latin letters, spaces and the marks used in names (. , ' ’ -). Keep in sync with the server rule. */
export const NAME_CHARACTER = /^[\p{Script=Latin}\p{M}.,'’ -]$/u;

/** Letters and digits only. */
export const ALPHANUMERIC_CHARACTER = /^[A-Za-z0-9]$/;

/** Letters, digits and a hyphen, like "KC-01". */
export const CODE_CHARACTER = /^[A-Za-z0-9-]$/;

type Props = Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'defaultValue'> & {
    value: string;
    onValueChange: (value: string) => void;
    /** Tested one character at a time. Characters that fail never enter the field, typed or pasted. */
    allowed: RegExp;
};

/** Text input that only lets allowed characters in. The server checks the same rule again. */
export function FilteredInput({ value, onValueChange, allowed, ...props }: Props) {
    return (
        <Input {...props} value={value} onChange={(event) => onValueChange([...event.target.value].filter((character) => allowed.test(character)).join(''))} />
    );
}
