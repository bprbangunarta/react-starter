import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';

/** Latin letters, spaces, and the few marks a person's name uses (. , ' ’ -). Keep it identical to the server's rule for names. */
export const NAME_CHARACTER = /^[\p{Script=Latin}\p{M}.,'’ -]$/u;

/** Letters and digits only (codes and reference numbers). */
export const ALPHANUMERIC_CHARACTER = /^[A-Za-z0-9]$/;

/** Letters, digits, and a hyphen (codes such as "KC-01"). */
export const CODE_CHARACTER = /^[A-Za-z0-9-]$/;

type Props = Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'defaultValue'> & {
    value: string;
    onValueChange: (value: string) => void;
    /** Tested against one character at a time: the characters that fail never enter the field, whether typed or pasted. */
    allowed: RegExp;
};

/**
 * A text input that lets only the allowed characters in, so a field that cannot hold a character (a name with digits) never shows
 * one. Use `MaskedInput` for fixed digit formats. The server checks the same rule again; this keeps the screen honest.
 */
export function FilteredInput({ value, onValueChange, allowed, ...props }: Props) {
    return (
        <Input {...props} value={value} onChange={(event) => onValueChange([...event.target.value].filter((character) => allowed.test(character)).join(''))} />
    );
}
