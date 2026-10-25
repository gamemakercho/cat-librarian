export const normalizeKoreanAnswer=value=>String(value??'').normalize('NFC').replace(/[\s?？!！]/gu,'').toLowerCase();
