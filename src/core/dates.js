import { parseISO } from './format.js';

// İki tarih arası takvim farkı (çıkış günü dahil) → yıl / ay / gün
export function serviceDuration(startISO, endISO) {
  const s = parseISO(startISO);
  const e = parseISO(endISO);
  e.setDate(e.getDate() + 1); // son çalışılan gün dahil
  if (e <= s) return null;
  let y = e.getFullYear() - s.getFullYear();
  let m = e.getMonth() - s.getMonth();
  let d = e.getDate() - s.getDate();
  if (d < 0) {
    m -= 1;
    const prevMonthDays = new Date(e.getFullYear(), e.getMonth(), 0).getDate();
    d += prevMonthDays;
  }
  if (m < 0) { y -= 1; m += 12; }
  const totalDays = Math.round((e - s) / 86400000);
  const totalMonths = y * 12 + m + d / 30;
  return { years: y, months: m, days: d, totalDays, totalMonths, yearsDecimal: y + m / 12 + d / 365 };
}

export function durationText(dur) {
  if (!dur) return '-';
  const parts = [];
  if (dur.years) parts.push(`${dur.years} yıl`);
  if (dur.months) parts.push(`${dur.months} ay`);
  if (dur.days || !parts.length) parts.push(`${dur.days} gün`);
  return parts.join(' ');
}
