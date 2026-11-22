import { round2 } from '../../core/format.js';
import { deductions, estimateCumulativeBase } from '../../core/tax.js';

/** Yasal yıllık izin hakkı (İş K. md.53) */
export function legalLeaveDays(years, age) {
  if (years < 1) return 0;
  let days = years < 5 ? 14 : years < 15 ? 20 : 26;
  if (age && (age <= 18 || age >= 50)) days = Math.max(days, 20);
  return days;
}

/** Kullanılmayan yıllık izin ücreti (İş K. md.59) */
export function calculateAnnualLeave({ gross, days, payDate = new Date() }) {
  if (!(gross > 0)) throw new Error('Brüt maaşı girin.');
  if (!(days > 0)) throw new Error('Kullanılmayan izin gününü girin.');
  const daily = round2(gross / 30);
  const total = round2(daily * days);
  const d = deductions(total, { sgk: true, cumulativeBase: estimateCumulativeBase(gross, payDate) });
  return { daily, days, ...d };
}
