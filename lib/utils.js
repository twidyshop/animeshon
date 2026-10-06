export const BASE = 'https://veloflix.my.id';
export const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
export const abs = (value, base = BASE) => { try { return value ? new URL(value, base).href : ''; } catch { return value || ''; } };
export const uniq = values => [...new Map(values.filter(Boolean).map(value => [JSON.stringify(value), value])).values()];
export const numericId = value => String(value ?? '').replace(/\D/g, '');
