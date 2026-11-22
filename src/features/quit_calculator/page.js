import { defineCalculator } from '../../shared/calculator.js';
import { calculateQuit } from './engine.js';
import { EXIT_TYPES } from '../../core/constants.js';
import { durationText } from '../../core/dates.js';
import { fmtTL, esc } from '../../core/format.js';
import { todayISO, icon } from '../../shared/ui.js';

const ICONS = { severance: 'severance', notice: 'notice', leave: 'beach', overtime: 'clock' };

export default defineCalculator({
  route: 'quit', title: 'İşten Ayrılırsam Ne Kadar Alırım?', icon: 'exit', accent: 'accent-hero',
  intro: 'Ayrılış şeklinizi seçin; kıdem, ihbar, izin ve fazla mesai alacaklarınızı tek seferde hesaplayalım.',
  fields: [
    { id: 'exitType', label: 'Ayrılış şekli', type: 'chips', options: EXIT_TYPES, default: 'isveren' },
    { id: 'startDate', label: 'İşe giriş tarihi', type: 'date' },
    { id: 'endDate', label: 'İşten çıkış tarihi', type: 'date', default: todayISO() },
    { id: 'gross', label: 'Brüt maaş', type: 'money', required: true, placeholder: '45.000' },
    { id: 'leaveDays', label: 'Kullanılmayan izin günü', type: 'int', suffix: 'gün', required: false, placeholder: '0' },
    { id: 'overtimeHours', label: 'Ödenmemiş aylık fazla mesai', type: 'number', suffix: 'saat', required: false, placeholder: '0' },
    { id: 'overtimeMonths', label: 'Fazla mesai kaç aydır ödenmedi?', type: 'int', suffix: 'ay', required: false, placeholder: '1' },
  ],
  compute(i) {
    const r = calculateQuit({ ...i, overtimeMonths: i.overtimeMonths || 1 });
    const items = r.items;
    const breakdown = `<div class="quit-items">${items.map((it, idx) => `
      <div class="quit-item ${it.net > 0 ? 'on' : 'off'}" style="--d:${idx * 80}ms">
        <span class="qi-ic">${icon(ICONS[it.key])}</span>
        <div class="qi-body"><b>${esc(it.label)}</b><span>${esc(it.reason)}</span></div>
        <div class="qi-val"><strong data-count="${it.net}">${fmtTL(it.net)}</strong><small>brüt ${fmtTL(it.gross)}</small></div>
      </div>`).join('')}
      ${totalBar(items, r.totalNet)}</div>`;
    const details = [
      ['Ayrılış şekli', r.type.label],
      ['Toplam çalışma süresi', durationText(r.duration)],
      ['Kıdem tazminatı hakkı', r.severance ? 'Var' : 'Yok'],
      ['İhbar tazminatı hakkı', r.notice ? `Var (${r.notice.weeks} hafta)` : 'Yok'],
    ];
    if (r.severance) details.push(['Kıdem brüt', r.severance.gross], ['Kıdem damga vergisi', -r.severance.stamp, 'neg'], ['Kıdem net', r.severance.net, 'total']);
    if (r.notice) details.push(['İhbar brüt', r.notice.gross], ['İhbar gelir + damga vergisi', -(r.notice.incomeTax + r.notice.stamp), 'neg'], ['İhbar net', r.notice.net, 'total']);
    if (r.leave) details.push(['İzin brüt', r.leave.gross], ['İzin SGK + vergiler', -(r.leave.sgkCut + r.leave.incomeTax + r.leave.stamp), 'neg'], ['İzin net', r.leave.net, 'total']);
    if (r.overtime) details.push(['Fazla mesai brüt', r.overtime.gross], ['Fazla mesai SGK + vergiler', -(r.overtime.sgkCut + r.overtime.incomeTax + r.overtime.stamp), 'neg'], ['Fazla mesai net', r.overtime.net, 'total']);
    details.push(['Tahmini toplam alacak (brüt)', r.totalGross], ['Tahmini toplam alacak (net)', r.totalNet, 'total']);

    const notes = [{ tone: 'info', text: r.type.note }];
    if (r.type.severance && !r.severance) notes.push({ tone: 'warn', text: 'Kıdem tazminatı için aynı işverende en az 1 yıl çalışmış olmanız gerekir.' });
    if (r.type.id === 'istifa' && r.severanceRef.eligible) notes.push({ tone: 'warn', text: `Haklı bir nedenle (ör. maaşın ödenmemesi, fazla mesainin ödenmemesi, mobbing) fesih yaparsanız ${fmtTL(r.severanceRef.net)} net kıdem tazminatı da alabilirsiniz. "Haklı Fesih" seçeneğiyle karşılaştırın.` });
    return {
      cards: [
        { title: 'Tahmini toplam alacak (net)', amount: r.totalNet, sub: `${r.type.label} · ${durationText(r.duration)}`, tone: 'success' },
        { title: 'Toplam brüt', amount: r.totalGross, tone: 'primary' },
        { title: 'Kıdem (net)', amount: r.severance?.net || 0, tone: 'secondary' },
      ],
      extraHtml: breakdown,
      details, notes,
      summary: { label: 'Tahmini toplam alacak (net)', amount: r.totalNet, text: `${r.type.label} · ${durationText(r.duration)}` },
    };
  },
  footer: `<h3>Ayrılış şekline göre haklarınız</h3>
    <div class="scroll"><table class="rights-table"><thead><tr><th>Ayrılış</th><th>Kıdem</th><th>İhbar</th><th>İzin</th></tr></thead><tbody>
    ${EXIT_TYPES.map((t) => `<tr><td>${t.label}</td><td>${t.severance ? 'Var' : 'Yok'}</td><td>${t.notice ? 'Var' : 'Yok'}</td><td>Var</td></tr>`).join('')}
    </tbody></table></div><p class="muted">Kıdem için en az 1 yıl çalışma şartı aranır. İşverenin ahlak ve iyi niyet kurallarına aykırılık (md.25/II) nedeniyle feshinde kıdem ve ihbar ödenmez.</p>`,
});

function totalBar(items, total) {
  if (!(total > 0)) return '';
  const colors = ['var(--primary)', 'var(--secondary)', 'var(--success)', 'var(--warning)'];
  return `<div class="stack-bar" role="img" aria-label="Alacak dağılımı">${items.filter((x) => x.net > 0).map((x) => `<span style="width:${(x.net / total) * 100}%;background:${colors[items.indexOf(x)]}" title="${esc(x.label)}"></span>`).join('')}</div>
    <div class="legend">${items.filter((x) => x.net > 0).map((x) => `<span><i style="background:${colors[items.indexOf(x)]}"></i>${esc(x.label)} %${Math.round((x.net / total) * 100)}</span>`).join('')}</div>`;
}
