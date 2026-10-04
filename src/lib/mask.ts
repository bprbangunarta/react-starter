/** Input masks. Mask tokens: `9` digit, `a` letter, `*` letter or digit, `h` hex digit; any other character is a literal. */
const TOKENS: Record<string, RegExp> = { '9': /\d/, a: /[a-zA-Z]/, '*': /[a-zA-Z0-9]/, h: /[0-9a-fA-F]/ };

export type Masked = { raw: string; masked: string };

/** Fill `mask` with the data characters found in `input` (literals the user typed are ignored; wrong characters are dropped). */
export function applyMask(input: string, mask: string): Masked {
    const candidates = [...input.replace(/[^a-zA-Z0-9]/g, '')];
    let raw = '';
    let masked = '';
    let next = 0;

    for (const token of mask) {
        const test = TOKENS[token];

        if (!test) {
            // A literal is only added while more data follows, so nothing dangles at the end while deleting.
            if (next < candidates.length) {
                masked += token;
            }

            continue;
        }

        while (next < candidates.length && !test.test(candidates[next] ?? '')) {
            next += 1;
        }

        const char = candidates[next];

        if (char === undefined) {
            break;
        }

        raw += char;
        masked += char;
        next += 1;
    }

    return { raw, masked };
}

/** How many data characters (not literals) sit before `caret` in `text`. */
export function dataBefore(text: string, caret: number, isData: (char: string) => boolean): number {
    return [...text.slice(0, caret)].filter(isData).length;
}

/** The caret index in `text` just after its `count`-th data character. */
export function caretAfter(text: string, count: number, isData: (char: string) => boolean): number {
    if (count <= 0) {
        return 0;
    }

    let seen = 0;

    for (let i = 0; i < text.length; i += 1) {
        if (isData(text.charAt(i))) {
            seen += 1;

            if (seen === count) {
                return i + 1;
            }
        }
    }

    return text.length;
}

export const MASKS = {
    /** Mobile phone, e.g. 0812-3456-7890 */
    phone: '9999-9999-9999',
    /** NIK (16 digits), e.g. 3171 0123 4567 8901 */
    nik: '9999 9999 9999 9999',
    /** NPWP (15 digits), e.g. 01.234.567.8-901.234 */
    npwp: '99.999.999.9-999.999',
} as const;
