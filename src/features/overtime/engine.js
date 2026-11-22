import { RATES } from '../../core/constants.js';
import { round2 } from '../../core/format.js';
import { deductions, estimateCumulativeBase } from '../../core/tax.js';

/** Fazla mesai (İş K. md.41): saatlik ücret x 1,5 */
export function calculateOvertime({ gross, hours, months = 1, payDate = new Date() }) {
  if (!(gross > 0)) throw new Error('Brüt maaşı girin.');
  if (!(hours > 0)) throw new Error('Fazla mesai saatini girin.');
  const hourly = round2(gross / RATES.monthlyHours);
  const premiumHourly = round2(hourly * RATES.overtimeMultiplier);
  const totalHours = hours * (months || 1);
  const total = round2(premiumHourly * totalHours);
  const d = deductions(total, { sgk: true, cumulativeBase: estimateCumulativeBase(gross, payDate) });
  return { hourly, premiumHourly, totalHours, overLimit: hours * 12 > 270, ...d };
}
