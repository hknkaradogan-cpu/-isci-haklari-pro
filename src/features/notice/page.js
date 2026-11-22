import { defineCalculator } from '../../shared/calculator.js';
import { calculateNotice } from './engine.js';
import { NOTICE_PERIODS } from '../../core/constants.js';

export default defineCalculator({
  route: 'notice', title: 'İhbar Tazminatı', icon: 'notice',
  intro: 'İş sözleşmesi bildirim süresine uyulmadan feshedilirse, kıdeminize göre 2 ile 8 hafta arasındaki ücret ihbar tazminatı olarak ödenir.',
  fields: [
    { id: 'gross', label: 'Brüt maaş', type: 'money', required: true, placeholder: '45.000' },
    { id: 'years', label: 'Çalışma süresi (yıl)', type: 'int', suffix: 'yıl', required: false, placeholder: '0' },
    { id: 'months', label: 'Çalışma süresi (ay)', type: 'int', suffix: 'ay', required: false, placeholder: '0' },
  ],
  compute(i) {
    const totalMonths = (i.years || 0) * 12 + (i.months || 0);
    if (totalMonths <= 0) throw new Error('Toplam çalışma süresini yıl ve/veya ay olarak girin.');
    const r = calculateNotice({ gross: i.gross, totalMonths });
    return {
      cards: [
        { title: 'Net ihbar tazminatı', amount: r.net, sub: `${r.weeks} hafta · ${r.days} gün`, tone: 'success' },
        { title: 'Brüt ihbar', amount: r.gross, tone: 'primary' },
        { title: 'Toplam vergiler', amount: r.incomeTax + r.stamp, tone: 'error' },
      ],
      extraHtml: `<div class="card"><h3 class="card-t">Yasal ihbar süreleri</h3><div class="steps">${NOTICE_PERIODS.map((p) => `<div class="step${p.weeks === r.weeks ? ' on' : ''}"><b>${p.weeks} hafta</b><span>${p.label}</span></div>`).join('')}</div></div>`,
      details: [
        ['Toplam çalışma süresi', `${Math.floor(totalMonths / 12)} yıl ${totalMonths % 12} ay`],
        ['Yasal ihbar süresi', `${r.weeks} hafta (${r.period.label})`],
        ['Günlük brüt ücret (maaş / 30)', r.daily],
        ['İhbar gün sayısı', `${r.days} gün`],
        ['Brüt ihbar tazminatı', r.gross, 'total'],
        ['Tahmini kümülatif vergi matrahı', r.cumulativeBase],
        [`Gelir vergisi (%${Math.round(r.rate * 100)} dilimden başlayarak)`, -r.incomeTax, 'neg'],
        ['Damga vergisi (‰7,59)', -r.stamp, 'neg'],
        ['Net ihbar tazminatı', r.net, 'total'],
      ],
      notes: ['İhbar tazminatından SGK primi kesilmez; gelir vergisi ve damga vergisi kesilir. Gelir vergisi, yıl içindeki kümülatif matrahınıza göre değişebilir.',
        'İşveren bildirim süresini kullandırdıysa veya peşin ödediyse ayrıca ihbar tazminatı istenemez.'],
      summary: { label: 'Net ihbar tazminatı', amount: r.net, text: `${r.weeks} haftalık ihbar süresi` },
    };
  },
});
