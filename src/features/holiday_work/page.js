import { defineCalculator } from '../../shared/calculator.js';
import { calculateHolidayWork } from './engine.js';

export default defineCalculator({
  route: 'holiday-work', title: 'Resmi Tatil Mesaisi', icon: 'flag',
  intro: 'Ulusal bayram ve genel tatil günlerinde çalışırsanız, o günün ücretine ek olarak her gün için bir günlük ücret daha alırsınız.',
  fields: [
    { id: 'gross', label: 'Brüt maaş', type: 'money', required: true, placeholder: '45.000' },
    { id: 'days', label: 'Çalışılan resmi tatil günü', type: 'number', suffix: 'gün', required: true, placeholder: '1', hint: 'Arife günleri yarım gün olarak 0,5 girilebilir' },
  ],
  compute(i) {
    const r = calculateHolidayWork(i);
    return {
      cards: [
        { title: 'Hak edilen ödeme (net)', amount: r.net, sub: `${r.days} gün`, tone: 'success' },
        { title: 'Hak edilen ödeme (brüt)', amount: r.gross, tone: 'primary' },
        { title: 'Günlük ücret', amount: r.daily, tone: 'secondary' },
      ],
      details: [
        ['Günlük brüt ücret (maaş / 30)', r.daily],
        ['Çalışılan resmi tatil', `${r.days} gün`],
        ['Ek ödeme (gün × 1 yevmiye)', r.gross, 'total'],
        ['SGK + işsizlik primi (%15)', -r.sgkCut, 'neg'],
        [`Gelir vergisi (%${Math.round(r.rate * 100)} dilimden)`, -r.incomeTax, 'neg'],
        ['Damga vergisi (‰7,59)', -r.stamp, 'neg'],
        ['Net ek ödeme', r.net, 'total'],
      ],
      notes: ['İş Kanunu md.47: Tatil günü çalışmayan işçiye o günün ücreti zaten ödenir; çalışan işçiye ayrıca çalıştığı her gün için bir günlük ücret ödenir.'],
      summary: { label: 'Resmi tatil çalışması net ek ödeme', amount: r.net, text: `${r.days} gün` },
    };
  },
});
