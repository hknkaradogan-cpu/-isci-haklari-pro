import { RATES } from '../../core/constants.js';
import { round2 } from '../../core/format.js';
import { deductions, estimateCumulativeBase } from '../../core/tax.js';

/** Hafta tatilinde çalışma: Yargıtay uygulamasıyla günlük ücretin %150'si ek ödenir */
export function calculateWeekendWork({ gross, days }) {
  if (!(gross > 0)) throw new Error('Brüt maaşı girin.');
  if (!(days > 0)) throw new Error('Çalışılan hafta tatili gününü girin.');
  const daily = round2(gross / 30);
  const perDay = round2(daily * RATES.weeklyRestMultiplier);
  const total = round2(perDay * days);
  const d = deductions(total, { sgk: true, cumulativeBase: estimateCumulativeBase(gross) });
  return { daily, perDay, days, ...d };
}
