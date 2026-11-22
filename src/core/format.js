const tl = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });

export const fmtTL = (v) => tl.format(Number.isFinite(v) ? v : 0);
export const fmtNum = (v) => num.format(Number.isFinite(v) ? v : 0);
export const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

export function fmtDate(d) {
  if (!d) return '';
  const dt = typeof d === 'string' ? parseISO(d) : d;
  return dt.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
}
export function fmtDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export function parseISO(s) {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
export function toISO(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Türkçe giriş: "45.000,50" veya "45000.50" -> 45000.5
export function parseMoney(v) {
  if (typeof v === 'number') return v;
  let s = String(v ?? '').trim().replace(/[^\d.,-]/g, '');
  if (!s) return 0;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if ((s.match(/\./g) || []).length > 1 || /\.\d{3}$/.test(s)) s = s.replace(/\./g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function trLower(s) { return String(s).toLocaleLowerCase('tr-TR'); }
