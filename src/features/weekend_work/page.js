import { defineCalculator } from '../../shared/calculator.js';
import { calculateWeekendWork } from './engine.js';

export default defineCalculator({
  route: 'weekend-work', title: 'Hafta Tatili Mesaisi', icon: 'week',
  intro: '7 günlük dönemde kesintisiz 24 saat dinlenme hakkınız vardır. Hafta tatilinde çalıştırılırsanız her gün için günlük ücretin %150\'si ek kazanç olarak ödenir.',
  fields: [
    { id: 'gross', label: 'Brüt maaş', type: 'money', required: true, placeholder: '45.000' },
    { id: 'days', label: 'Çalışılan hafta tatili', type: 'number', suffix: 'gün', required: true, placeholder: '4' },
  ],
  compute(i) {
    const r = calculateWeekendWork(i);
    return {
      cards: [
        { title: 'Ek kazanç (net)', amount: r.net, sub: `${r.days} gün`, tone: 'success' },
        { title: 'Ek kazanç (brüt)', amount: r.gross, tone: 'primary' },
        { title: 'Gün başı ek ödeme', amount: r.perDay, tone: 'secondary' },
      ],
      details: [
        ['Günlük brüt ücret (maaş / 30)', r.daily],
        ['Gün başı ek ödeme (× 1,5)', r.perDay],
        ['Çalışılan hafta tatili', `${r.days} gün`],
        ['Brüt ek kazanç', r.gross, 'total'],
        ['SGK + işsizlik primi (%15)', -r.sgkCut, 'neg'],
        [`Gelir vergisi (%${Math.round(r.rate * 100)} dilimden)`, -r.incomeTax, 'neg'],
        ['Damga vergisi (‰7,59)', -r.stamp, 'neg'],
        ['Net ek kazanç', r.net, 'total'],
      ],
      notes: ['Hafta tatili çalışmasının ücreti kanunda ayrıca düzenlenmemiştir; Yargıtay uygulamasında genellikle günlük ücretin %50 zamlısı (1,5 yevmiye) ek olarak ödenir.'],
      summary: { label: 'Hafta tatili çalışması net ek kazanç', amount: r.net, text: `${r.days} gün` },
    };
  },
});
