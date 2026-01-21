const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateJoinCode(length = 4): string {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return code;
}

export function normalizeJoinCode(code: string): string {
    return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidJoinCode(code: string): boolean {
    const normalized = normalizeJoinCode(code);
    return normalized.length === 4 && /^[A-Z0-9]+$/.test(normalized);
}
