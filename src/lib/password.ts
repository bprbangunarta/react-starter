const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnpqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '#$%&*+-=?@';

/** A random integer from 0 to `max - 1` from the browser's random source, without bias (values in the leftover range are thrown away). */
function randomBelow(max: number): number {
    const limit = Math.floor(0x100000000 / max) * max;
    const value = new Uint32Array(1);

    do {
        crypto.getRandomValues(value);
    } while ((value[0] ?? 0) >= limit);

    return (value[0] ?? 0) % max;
}

const pick = (characters: string): string => characters.charAt(randomBelow(characters.length));

/**
 * A random password with upper and lower case letters, digits, and symbols. Letters and digits that are easy to mix up (0 O 1 l I)
 * are left out so it can be read aloud or typed again. Needs a secure context (`crypto.getRandomValues`).
 */
export function generatePassword(length = 16): string {
    const all = UPPER + LOWER + DIGITS + SYMBOLS;
    const characters = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SYMBOLS), ...Array.from({ length: length - 4 }, () => pick(all))];

    // Fisher-Yates shuffle, so the four guaranteed characters are not always first.
    for (let i = characters.length - 1; i > 0; i--) {
        const j = randomBelow(i + 1);
        [characters[i], characters[j]] = [characters[j], characters[i]];
    }

    return characters.join('');
}
