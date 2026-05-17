const TWELVE_DIGITS = /^\d{12}$/;
const THIRTEEN_DIGITS = /^\d{13}$/;

export function computeGtinCheckDigit(twelveDigits: string): number {
    if (!TWELVE_DIGITS.test(twelveDigits)) {
        throw new Error('computeGtinCheckDigit expects exactly 12 numeric characters');
    }
    let oddSum = 0;
    let evenSum = 0;
    for (let i = 0; i < 12; i++) {
        const digit = twelveDigits.charCodeAt(i) - 48;
        if (i % 2 === 0) oddSum += digit;
        else evenSum += digit;
    }
    return (10 - ((oddSum + evenSum * 3) % 10)) % 10;
}

export function randomGtin13(prefix = ''): string {
    if (prefix && !/^\d*$/.test(prefix)) {
        throw new Error('randomGtin13 prefix must be numeric');
    }
    if (prefix.length > 12) {
        throw new Error('randomGtin13 prefix cannot exceed 12 digits');
    }
    let body = prefix;
    while (body.length < 12) {
        body += Math.floor(Math.random() * 10).toString();
    }
    return body + computeGtinCheckDigit(body).toString();
}

export function isValidGtin13(gtin: string): boolean {
    if (!THIRTEEN_DIGITS.test(gtin)) return false;
    return computeGtinCheckDigit(gtin.slice(0, 12)) === gtin.charCodeAt(12) - 48;
}
