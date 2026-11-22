import { EXIT_TYPES } from '../../core/constants.js';
import { round2, parseISO } from '../../core/format.js';
import { calculateSeverance } from '../severance/engine.js';
import { calculateNotice } from '../notice/engine.js';
import { calculateAnnualLeave } from '../annual_leave/engine.js';
import { calculateOvertime } from '../overtime/engine.js';
import { calculateHolidayWork } from '../holiday_work/engine.js';
import { calculateWeekendWork } from '../weekend_work/engine.js';
import { serviceDuration } from '../../core/dates.js';

/** "İşten ayrılırsam ne kadar alırım?" toplam alacak motoru */
export function calculateQuit({ startDate, endDate, gross, leaveDays = 0, overtimeHours = 0, overtimeMonths = 1, holidayDays = 0, weekendDays = 0, exitType }) {
  const type = EXIT_TYPES.find((t) => t.id === exitType) || EXIT_TYPES[0];
  const dur = serviceDuration(startDate, endDate);
  if (!dur) throw new Error('İşten çıkış tarihi, işe giriş tarihinden sonra olmalı.');
  if (!(gross > 0)) throw new Error('Brüt maaşı girin.');
  const payDate = parseISO(endDate);

  const sev = calculateSeverance({ startDate, endDate, gross });
  const severance = type.severance && sev.eligible ? sev : null;
  const notice = type.notice ? calculateNotice({ gross, totalMonths: dur.totalMonths, payDate }) : null;
  const leave = leaveDays > 0 ? calculateAnnualLeave({ gross, days: leaveDays, payDate }) : null;
  const overtime = overtimeHours > 0 ? calculateOvertime({ gross, hours: overtimeHours, months: overtimeMonths, payDate }) : null;
  const holiday = holidayDays > 0 ? calculateHolidayWork({ gross, days: holidayDays }) : null;
  const weekend = weekendDays > 0 ? calculateWeekendWork({ gross, days: weekendDays }) : null;

  const items = [
    { key: 'severance', label: 'Kıdem Tazminatı', gross: severance?.gross || 0, net: severance?.net || 0,
      reason: severance ? `${dur.years} yıl ${dur.months} ay ${dur.days} gün kıdem` : !type.severance ? `${type.label} durumunda ödenmez` : '1 yıl çalışma şartı dolmadı' },
    { key: 'notice', label: 'İhbar Tazminatı', gross: notice?.gross || 0, net: notice?.net || 0,
      reason: notice ? `${notice.weeks} hafta (${notice.days} gün)` : `${type.label} durumunda ödenmez` },
    { key: 'leave', label: 'Yıllık İzin Alacağı', gross: leave?.gross || 0, net: leave?.net || 0,
      reason: leave ? `${leaveDays} gün kullanılmayan izin` : 'Kullanılmayan izin girilmedi' },
    { key: 'overtime', label: 'Fazla Mesai Alacağı', gross: overtime?.gross || 0, net: overtime?.net || 0,
      reason: overtime ? `${overtime.totalHours} saat × %50 zamlı` : 'Fazla mesai girilmedi' },
    { key: 'holiday', label: 'Resmi Tatil Mesaisi', gross: holiday?.gross || 0, net: holiday?.net || 0,
      reason: holiday ? `${holidayDays} gün resmi tatil çalışması` : 'Resmi tatil çalışması girilmedi' },
    { key: 'weekend', label: 'Hafta Tatili Mesaisi', gross: weekend?.gross || 0, net: weekend?.net || 0,
      reason: weekend ? `${weekendDays} gün hafta tatili çalışması` : 'Hafta tatili çalışması girilmedi' },
  ];
  const totalGross = round2(items.reduce((a, i) => a + i.gross, 0));
  const totalNet = round2(items.reduce((a, i) => a + i.net, 0));
  return { type, duration: dur, severance, severanceRef: sev, notice, leave, overtime, holiday, weekend, items, totalGross, totalNet };
}
