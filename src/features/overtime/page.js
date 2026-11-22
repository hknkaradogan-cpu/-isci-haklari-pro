import { defineCalculator } from '../../shared/calculator.js';
import { calculateOvertime } from './engine.js';

export default defineCalculator({
  route: 'overtime', title: 'Fazla Mesai Hesaplama', icon: 'clock',
  intro: 'Haftalık 45 saati aşan her saat fazla mesaidir ve saatlik ücretin %50 zamlı tutarıyla ödenir.',
  fields: [
    { id: 'gross', label: 'Brüt maaş', type: 'money', required: true, placeholder: '45.000' },
    { id: 'hours', label: 'Aylık fazla mesai saati', type: 'number', suffix: 'saat', required: true, placeholder: '20' },
    { id: 'months', label: 'Kaç aylık? (isteğe bağlı)', type: 'int', suffix: 'ay', required: false, placeholder: '1' },
  ],
  compute(i) {
    const r = calculateOvertime({ gross: i.gross, hours: i.hours, months: i.months || 1 });
    const notes = ['Saatlik ücret, aylık brüt ücretin 225 saate bölünmesiyle bulunur (haftalık 45 saat).'];
    if (r.overLimit) notes.unshift({ tone: 'warn', text: 'Yıllık fazla çalışma süresi 270 saati aşamaz. Girdiğiniz aylık saat bu sınırın üzerinde.' });
    return {
      cards: [
        { title: 'Net fazla mesai', amount: r.net, sub: `${r.totalHours} saat`, tone: 'success' },
        { title: 'Toplam fazla mesai (brüt)', amount: r.gross, tone: 'primary' },
        { title: '%50 zamlı saatlik ücret', amount: r.premiumHourly, tone: 'secondary' },
      ],
      details: [
        ['Saatlik brüt ücret (maaş / 225)', r.hourly],
        ['%50 zamlı saatlik ücret', r.premiumHourly],
        ['Toplam fazla mesai saati', `${r.totalHours} saat`],
        ['Brüt fazla mesai', r.gross, 'total'],
        ['SGK + işsizlik primi (%15)', -r.sgkCut, 'neg'],
        [`Gelir vergisi (%${Math.round(r.rate * 100)} dilimden)`, -r.incomeTax, 'neg'],
        ['Damga vergisi (‰7,59)', -r.stamp, 'neg'],
        ['Net fazla mesai', r.net, 'total'],
      ],
      notes,
      summary: { label: 'Net fazla mesai ücreti', amount: r.net, text: `${r.totalHours} saat × %50 zamlı` },
    };
  },
});
