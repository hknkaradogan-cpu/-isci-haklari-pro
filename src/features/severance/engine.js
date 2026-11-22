import { SEVERANCE_CAPS, RATES } from '../../core/constants.js';
import { round2 } from '../../core/format.js';
import { serviceDuration } from '../../core/dates.js';
import { SettingsRepo } from '../../core/storage.js';

export function capForDate(endISO) {
  const override = parseFloat(String(SettingsRepo.get().capOverride || '').replace(',', '.'));
  if (override > 0) return { value: override, from: 'manuel', manual: true };
  let cap = SEVERANCE_CAPS[0];
  for (const c of SEVERANCE_CAPS) if (endISO >= c.from) cap = c;
  return { ...cap, manual: false };
}

/** Kıdem tazminatı hesaplama motoru (1475 s. K. md.14) */
export function calculateSeverance({ startDate, endDate, gross, transport = 0, meal = 0, extra = 0 }) {
  const dur = serviceDuration(startDate, endDate);
  if (!dur) throw new Error('İşten çıkış tarihi, işe giriş tarihinden sonra olmalı.');
  if (!(gross > 0)) throw new Error('Brüt maaşı girin.');
  const dressed = round2(gross + transport + meal + extra); // giydirilmiş brüt ücret
  const cap = capForDate(endDate);
  const base = Math.min(dressed, cap.value);
  const eligible = dur.totalDays >= 365;
  const yearPart = round2(base * dur.years);
  const monthPart = round2((base / 12) * dur.months);
  const dayPart = round2((base / 365) * dur.days);
  const gross_ = eligible ? round2(yearPart + monthPart + dayPart) : 0;
  const stamp = round2(gross_ * RATES.stamp);
  return {
    duration: dur, dressed, cap, base, capped: dressed > cap.value, eligible,
    yearPart, monthPart, dayPart,
    gross: gross_, stamp, net: round2(gross_ - stamp),
  };
}
