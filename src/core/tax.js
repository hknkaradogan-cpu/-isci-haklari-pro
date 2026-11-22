import { TAX_BRACKETS, RATES } from './constants.js';
import { round2 } from './format.js';

// Kümülatif matrahtan başlayarak "amount" kadar ek matrah için gelir vergisi
export function incomeTaxOnRange(startBase, amount) {
  let tax = 0, lower = 0, remaining = amount, cursor = startBase;
  for (const b of TAX_BRACKETS) {
    const upper = b.upTo;
    if (cursor < upper && remaining > 0) {
      const slice = Math.min(remaining, upper - Math.max(cursor, lower));
      if (slice > 0) { tax += slice * b.rate; remaining -= slice; cursor += slice; }
    }
    lower = upper;
    if (remaining <= 0) break;
  }
  return round2(tax);
}

export function bracketRateAt(base) {
  for (const b of TAX_BRACKETS) if (base < b.upTo) return b.rate;
  return TAX_BRACKETS[TAX_BRACKETS.length - 1].rate;
}

// Yıl başından ödeme ayına kadar oluşan tahmini kümülatif matrah
export function estimateCumulativeBase(grossMonthly, date = new Date()) {
  const monthsBefore = date.getMonth(); // Ocak=0 → önceki ay yok
  return round2(grossMonthly * (1 - RATES.sgkEmployee - RATES.unemploymentEmployee) * monthsBefore);
}

/**
 * Ücret niteliğindeki ek ödemenin kesintileri.
 * opts.sgk: SGK + işsizlik kesilsin mi (izin, fazla mesai, tatil ücreti: evet; ihbar: hayır)
 */
export function deductions(gross, { sgk = true, cumulativeBase = 0 } = {}) {
  const sgkCut = sgk ? round2(gross * (RATES.sgkEmployee + RATES.unemploymentEmployee)) : 0;
  const taxBase = round2(gross - sgkCut);
  const incomeTax = incomeTaxOnRange(cumulativeBase, taxBase);
  const stamp = round2(gross * RATES.stamp);
  const net = round2(gross - sgkCut - incomeTax - stamp);
  return { gross: round2(gross), sgkCut, taxBase, incomeTax, stamp, net, rate: bracketRateAt(cumulativeBase) };
}
