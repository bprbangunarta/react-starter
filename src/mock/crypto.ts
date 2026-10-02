/** SHA-256 as hex (the audit chain) and TOTP (RFC 6238), both with the browser's own crypto. */
const encoder = new TextEncoder();

export async function sha256(text: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(text));

    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function randomBase32(length = 32): string {
    const bytes = crypto.getRandomValues(new Uint8Array(length));

    return [...bytes].map((b) => ALPHABET[b % 32]).join('');
}

function base32Decode(input: string): Uint8Array {
    let bits = '';

    for (const char of input.replace(/=+$/, '').toUpperCase()) {
        bits += ALPHABET.indexOf(char).toString(2).padStart(5, '0');
    }

    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }

    return new Uint8Array(bytes);
}

async function hotp(secret: string, counter: number): Promise<string> {
    const key = await crypto.subtle.importKey('raw', base32Decode(secret) as BufferSource, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const buffer = new ArrayBuffer(8);
    new DataView(buffer).setBigUint64(0, BigInt(counter));
    const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, buffer));
    const offset = mac[19] & 0x0f;
    const code = ((mac[offset] & 0x7f) << 24) | (mac[offset + 1] << 16) | (mac[offset + 2] << 8) | mac[offset + 3];

    return String(code % 1_000_000).padStart(6, '0');
}

/** True when `code` is the current 6-digit code of the secret, give or take one 30-second step. */
export async function verifyTotp(secret: string, code: string): Promise<boolean> {
    const step = Math.floor(Date.now() / 30000);

    for (const drift of [0, -1, 1]) {
        if ((await hotp(secret, step + drift)) === code) {
            return true;
        }
    }

    return false;
}

export function otpauthUri(secret: string, account: string, issuer = 'Starter Kit'): string {
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
}

export function randomCode(): string {
    return String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');
}

export function recoveryCodes(count = 8): string[] {
    return Array.from({ length: count }, () => {
        const raw = [...crypto.getRandomValues(new Uint8Array(10))].map((b) => '0123456789abcdefghjkmnpqrstuvwxyz'[b % 33]).join('');

        return `${raw.slice(0, 5)}-${raw.slice(5)}`;
    });
}
