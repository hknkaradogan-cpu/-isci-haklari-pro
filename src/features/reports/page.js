import { HistoryRepo } from '../../core/storage.js';
import { appBar, emptyState, icon, button, toast } from '../../shared/ui.js';
import { fmtTL, fmtDateTime, esc } from '../../core/format.js';
import { exportPdf } from '../../core/pdf.js';
import { MODULE_ICONS } from '../history/page.js';

export default {
  title: 'PDF Raporlar',
  render(el) {
    el.innerHTML = `${appBar('PDF Raporlar')}
      <main class="page">
        <section class="hero-mini">${icon('pdf', 'hero-ic')}<p>Kaydettiğiniz hesaplamalardan logolu, tarihli, girdi ve detaylı döküm içeren profesyonel PDF raporlar oluşturun. Birden fazla hesaplamayı tek raporda birleştirebilirsiniz.</p></section>
        <div class="toolbar"><label class="check"><input type="checkbox" id="all"><span>Tümünü seç</span></label>${button('Seçilenlerle rapor oluştur', { act: 'make', ic: 'pdf', kind: 'filled' })}</div>
        <div class="pick-list"></div>
      </main>`;
    const list = el.querySelector('.pick-list');
    const all = HistoryRepo.all();
    list.innerHTML = all.length ? all.map((r) => `<label class="pick"><input type="checkbox" value="${r.id}"><span class="cc-ic">${icon(MODULE_ICONS[r.module] || 'calc')}</span>
        <span class="rec-txt"><b>${esc(r.title || r.moduleName)}</b><small>${fmtDateTime(r.date)}</small></span><span class="rec-amt">${fmtTL(r.summary.amount)}</span></label>`).join('')
      : emptyState('Rapor için kayıt yok', 'Önce bir hesaplama yapıp "Geçmişe kaydet" veya "PDF rapor" düğmesine dokunun.', 'pdf', `<a class="btn filled" href="#quit">${icon('calc')}<span>Hesaplama yap</span></a>`);
    el.querySelector('#all').addEventListener('change', (e) => list.querySelectorAll('input').forEach((c) => { c.checked = e.target.checked; }));
    el.querySelector('[data-act="make"]').addEventListener('click', () => {
      const ids = [...list.querySelectorAll('input:checked')].map((c) => c.value);
      if (!ids.length) return toast('En az bir hesaplama seçin');
      exportPdf(ids.map((id) => HistoryRepo.get(id)));
    });
  },
};
