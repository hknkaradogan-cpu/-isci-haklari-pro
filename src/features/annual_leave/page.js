import { defineCalculator } from '../../shared/calculator.js';
import { calculateAnnualLeave, legalLeaveDays } from './engine.js';

export default defineCalculator({
  route: 'annual-leave', title: 'Yıllık İzin Ücreti', icon: 'beach',
  intro: 'Kullanmadığınız yıllık izin günleri, iş sözleşmesi hangi nedenle sona ererse ersin son brüt ücretiniz üzerinden size ödenir.',
  fields: [
    { id: 'gross', label: 'Brüt maaş', type: 'money', required: true, placeholder: '45.000' },
    { id: 'days', label: 'Kullanılmayan izin günü', type: 'int', suffix: 'gün', required: true, placeholder: '14' },
  ],
  compute(i) {
    const r = calculateAnnualLeave(i);
    return {
      cards: [
        { title: 'Net izin alacağı', amount: r.net, sub: `${r.days} gün`, tone: 'success' },
        { title: 'Toplam izin alacağı (brüt)', amount: r.gross, tone: 'primary' },
        { title: 'Günlük ücret', amount: r.daily, tone: 'secondary' },
      ],
      extraHtml: `<div class="card"><h3 class="card-t">Yasal yıllık izin hakkı</h3><div class="steps">
        <div class="step"><b>14 gün</b><span>1–5 yıl</span></div><div class="step"><b>20 gün</b><span>5–15 yıl</span></div>
        <div class="step"><b>26 gün</b><span>15 yıl ve üzeri</span></div><div class="step"><b>20 gün</b><span>18 yaş altı / 50 yaş üstü en az</span></div></div></div>`,
      details: [
        ['Günlük brüt ücret (maaş / 30)', r.daily],
        ['Kullanılmayan izin', `${r.days} gün`],
        ['Brüt izin alacağı', r.gross, 'total'],
        ['SGK + işsizlik primi (%15)', -r.sgkCut, 'neg'],
        ['Gelir vergisi matrahı', r.taxBase],
        [`Gelir vergisi (%${Math.round(r.rate * 100)} dilimden)`, -r.incomeTax, 'neg'],
        ['Damga vergisi (‰7,59)', -r.stamp, 'neg'],
        ['Net izin alacağı', r.net, 'total'],
      ],
      notes: ['İzin ücreti ücret niteliğinde olduğundan SGK primi, gelir vergisi ve damga vergisi kesilir.',
        `Örnek: 6 yıllık bir çalışan için yasal izin hakkı yılda ${legalLeaveDays(6)} gündür.`],
      summary: { label: 'Net yıllık izin alacağı', amount: r.net, text: `${r.days} gün kullanılmayan izin` },
    };
  },
});
