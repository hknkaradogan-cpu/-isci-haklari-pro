import { round2 } from '../../core/format.js';
import { deductions, estimateCumulativeBase } from '../../core/tax.js';

/** Resmi tatilde çalışma (İş K. md.47): her gün için 1 günlük ek ücret */
export function calculateHolidayWork({ gross, days }) {
  if (!(gross > 0)) throw new Error('Brüt maaşı girin.');
  if (!(days > 0)) throw new Error('Çalışılan resmi tatil gününü girin.');
  const daily = round2(gross / 30);
  const total = round2(daily * days);
  const d = deductions(total, { sgk: true, cumulativeBase: estimateCumulativeBase(gross) });
  return { daily, days, ...d };
}
