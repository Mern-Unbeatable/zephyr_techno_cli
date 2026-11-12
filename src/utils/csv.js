const escapeCell = (value) => {
    if (value === null || value === undefined) return '';
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** rows: array of arrays → CSV text (CRLF line endings for Excel). */
export function toCsv(rows = []) {
    return rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
}

/** RFC 4180 parser. Returns an array of string arrays; fully blank lines are dropped. */
export function parseCsv(input = '') {
    const text = String(input).replace(/^\uFEFF/, '');
    const delimiter = detectDelimiter(text);
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];

        if (inQuotes) {
            if (char === '"') {
                if (text[i + 1] === '"') {
                    cell += '"';
                    i += 1;
                } else {
                    inQuotes = false;
                }
            } else {
                cell += char;
            }
            continue;
        }

        if (char === '"') {
            inQuotes = true;
        } else if (char === delimiter) {
            row.push(cell);
            cell = '';
        } else if (char === '\n' || char === '\r') {
            if (char === '\r' && text[i + 1] === '\n') i += 1;
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        } else {
            cell += char;
        }
    }

    if (cell !== '' || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }

    return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
}

// Excel/WPS can save "CSV" with semicolons (some locales) or tabs ("Unicode Text").
function detectDelimiter(text) {
    const firstLine = text.split(/\r?\n/, 1)[0] || '';
    const counts = [',', ';', '\t'].map((d) => [d, firstLine.split(d).length - 1]);
    counts.sort((a, b) => b[1] - a[1]);
    return counts[0][1] > 0 ? counts[0][0] : ',';
}

export function downloadCsv(filename, rows) {
    const blob = new Blob([`\uFEFF${toCsv(rows)}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

const startsWith = (bytes, signature) => signature.every((b, i) => bytes[i] === b);

function decodeText(buffer) {
    const bytes = new Uint8Array(buffer);
    if (startsWith(bytes, [0xff, 0xfe])) return new TextDecoder('utf-16le').decode(bytes);
    if (startsWith(bytes, [0xfe, 0xff])) return new TextDecoder('utf-16be').decode(bytes);
    if (startsWith(bytes, [0xef, 0xbb, 0xbf])) return new TextDecoder('utf-8').decode(bytes);

    const sample = bytes.subarray(0, 200);
    const oddZeros = sample.filter((b, i) => i % 2 === 1 && b === 0).length;
    if (sample.length > 4 && oddZeros > sample.length / 4) {
        return new TextDecoder('utf-16le').decode(bytes);
    }

    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
        // Excel "CSV" on Windows is often ANSI, which breaks £ under UTF-8.
        return new TextDecoder('windows-1252').decode(bytes);
    }
}

const cellToString = (value) => {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value);
};

/**
 * Read an uploaded .csv / .tsv / .txt / .xlsx file into an array of string rows.
 * The format is detected from the file contents, not the extension.
 */
export async function readSpreadsheetFile(file) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer, 0, Math.min(8, buffer.byteLength));

    if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])) {
        const { readSheet } = await import('read-excel-file/browser');
        const sheet = await readSheet(file);
        return sheet
            .map((row) => row.map(cellToString))
            .filter((row) => row.some((cell) => cell.trim() !== ''));
    }

    if (startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0])) {
        throw new Error('Old Excel (.xls) files are not supported. Please save the file as .xlsx or CSV and upload again.');
    }

    return parseCsv(decodeText(buffer));
}

export const normalizeHeader = (value) =>
    String(value ?? '')
        .replace(/[\uFEFF\u200B\u0000]/g, '')
        .replace(/\u00A0/g, ' ')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();

export const todayStamp = () => new Date().toISOString().slice(0, 10);
