import { defineCalculator } from '../../shared/calculator.js';
import { calculateSeverance } from './engine.js';
import { durationText } from '../../core/dates.js';
import { fmtTL, fmtDate } from '../../core/format.js';
import { todayISO } from '../../shared/ui.js';

export default defineCalculator({
  route: 'severance', title: 'Kıdem Tazminatı Hesaplama', icon: 'severance',
  intro: 'En az 1 yıl çalıştıysanız ve ayrılış şekliniz uygunsa her tam yıl için 30 günlük giydirilmiş brüt ücretiniz kadar kıdem tazminatı alırsınız.',
  fields: [
    { id: 'startDate', label: 'İşe giriş tarihi', type: 'date' },
    { id: 'endDate', label: 'İşten çıkış tarihi', type: 'date', default: todayISO() },
    { id: 'gross', label: 'Brüt maaş', type: 'money', required: true, placeholder: '45.000' },
    { id: 'transport', label: 'Yol yardımı (aylık)', type: 'money', required: false, placeholder: '0' },
    { id: 'meal', label: 'Yemek yardımı (aylık)', type: 'money', required: false, placeholder: '0' },
    { id: 'extra', label: 'Düzenli ek ödeme (aylık)', type: 'money', required: false, placeholder: '0', hint: 'İkramiye, prim gibi düzenli ödemelerin aylık ortalaması' },
  ],
  compute(i) {
    const r = calculateSeverance(i);
    const notes = [];
    if (!r.eligible) notes.push({ tone: 'warn', text: 'Toplam çalışma süreniz 1 yıldan az olduğu için kıdem tazminatı hakkı doğmuyor.' });
    if (r.capped) notes.push({ tone: 'warn', text: `Giydirilmiş brüt ücretiniz (${fmtTL(r.dressed)}) kıdem tazminatı tavanını aştığı için hesaplama tavan (${fmtTL(r.cap.value)}) üzerinden yapıldı.` });
    notes.push('Kıdem tazminatından yalnızca damga vergisi (binde 7,59) kesilir; gelir vergisi ve SGK primi kesilmez.');
    return {
      cards: [
        { title: 'Net kıdem tazminatı', amount: r.net, sub: durationText(r.duration), tone: 'success' },
        { title: 'Brüt kıdem tazminatı', amount: r.gross, tone: 'primary' },
        { title: 'Damga vergisi', amount: r.stamp, tone: 'error' },
      ],
      details: [
        ['Toplam çalışma süresi', durationText(r.duration)],
        ['Yıl / Ay / Gün', `${r.duration.years} yıl · ${r.duration.months} ay · ${r.duration.days} gün`],
        ['Toplam gün', `${r.duration.totalDays} gün`],
        ['Giydirilmiş brüt ücret', r.dressed],
        [`Kıdem tavanı (${r.cap.manual ? 'manuel' : fmtDate(r.cap.from) + ' itibarıyla'})`, r.cap.value],
        ['Hesaba esas ücret', r.base],
        [`Yıl karşılığı (${r.duration.years} × ücret)`, r.yearPart],
        [`Ay karşılığı (${r.duration.months} × ücret/12)`, r.monthPart],
        [`Gün karşılığı (${r.duration.days} × ücret/365)`, r.dayPart],
        ['Brüt kıdem tazminatı', r.gross, 'total'],
        ['Damga vergisi (‰7,59)', -r.stamp, 'neg'],
        ['Net kıdem tazminatı', r.net, 'total'],
      ],
      notes,
      summary: { label: 'Net kıdem tazminatı', amount: r.net, text: durationText(r.duration) + ' çalışma' },
    };
  },
});
