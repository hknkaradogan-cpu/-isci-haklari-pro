import { NOTICE_PERIODS } from '../../core/constants.js';
import { round2 } from '../../core/format.js';
import { deductions, estimateCumulativeBase } from '../../core/tax.js';

export function noticeWeeks(totalMonths) {
  return NOTICE_PERIODS.find((p) => totalMonths < p.maxMonths) || NOTICE_PERIODS[NOTICE_PERIODS.length - 1];
}

/** İhbar tazminatı (İş K. md.17) — SGK kesilmez, gelir + damga vergisi kesilir */
export function calculateNotice({ gross, totalMonths, payDate = new Date(), cumulativeBase }) {
  if (!(gross > 0)) throw new Error('Brüt maaşı girin.');
  if (!(totalMonths >= 0)) throw new Error('Çalışma süresini girin.');
  const period = noticeWeeks(totalMonths);
  const days = period.weeks * 7;
  const daily = round2(gross / 30);
  const grossNotice = round2(daily * days);
  const base = cumulativeBase ?? estimateCumulativeBase(gross, payDate);
  const d = deductions(grossNotice, { sgk: false, cumulativeBase: base });
  return { period, weeks: period.weeks, days, daily, cumulativeBase: base, ...d };
}
