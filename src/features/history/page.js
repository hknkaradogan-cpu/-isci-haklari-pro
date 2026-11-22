import { HistoryRepo } from '../../core/storage.js';
import { appBar, icon, emptyState, confirmDialog, dialog, detailTable, toast, button } from '../../shared/ui.js';
import { fmtTL, fmtDateTime, esc, trLower } from '../../core/format.js';
import { openForEdit } from '../../shared/calculator.js';
import { exportPdf } from '../../core/pdf.js';

export const MODULE_ICONS = { severance: 'severance', notice: 'notice', 'annual-leave': 'beach', overtime: 'clock', 'holiday-work': 'flag', 'weekend-work': 'week', quit: 'exit' };

export function recordItem(r) {
  return `<div class="rec" data-id="${r.id}">
    <button class="rec-main" data-a="view"><span class="cc-ic">${icon(MODULE_ICONS[r.module] || 'calc')}</span>
      <span class="rec-txt"><b>${esc(r.title || r.moduleName)}</b><small>${esc(r.title ? r.moduleName + ' · ' : '')}${fmtDateTime(r.date)}</small></span>
      <span class="rec-amt">${fmtTL(r.summary.amount)}</span></button>
    <div class="rec-actions">
      <button class="icon-btn${r.favorite ? ' on' : ''}" data-a="fav" aria-label="${r.favorite ? 'Favoriden çıkar' : 'Favorilere ekle'}">${icon(r.favorite ? 'star-fill' : 'star')}</button>
      <button class="icon-btn" data-a="edit" aria-label="Düzenle">${icon('edit')}</button>
      <button class="icon-btn" data-a="pdf" aria-label="PDF">${icon('pdf')}</button>
      <button class="icon-btn" data-a="del" aria-label="Sil">${icon('trash')}</button>
    </div></div>`;
}

/** Geçmiş ve favoriler için ortak liste davranışı */
export function bindRecordList(container, redraw) {
  container.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const id = b.closest('[data-id]').dataset.id;
    const r = HistoryRepo.get(id); if (!r) return;
    const a = b.dataset.a;
    if (a === 'fav') { HistoryRepo.toggleFavorite(id); toast(r.favorite ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi'); redraw(); }
    if (a === 'del' && await confirmDialog('Kaydı sil', `"${r.title || r.moduleName}" kalıcı olarak silinsin mi?`)) { HistoryRepo.remove(id); toast('Kayıt silindi'); redraw(); }
    if (a === 'pdf') exportPdf([r]);
    if (a === 'edit') {
      const choice = await dialog({
        title: 'Kaydı düzenle',
        body: `<label class="field"><span class="field-label">Kayıt adı</span><span class="field-box"><input id="rename" value="${esc(r.title)}" placeholder="${esc(r.moduleName)}"></span></label><p class="muted small">Girdileri değiştirip yeniden hesaplamak için "Girdileri düzenle"yi seçin.</p>`,
        actions: [{ label: 'Vazgeç', value: null }, { label: 'Girdileri düzenle', value: 'inputs', kind: 'tonal' }, { label: 'Adı kaydet', value: 'name', kind: 'filled' }],
      });
      const name = document.getElementById('rename')?.value;
      if (choice === 'name') { HistoryRepo.update(id, { title: (name ?? '').trim() }); toast('Kayıt adı güncellendi'); redraw(); }
      if (choice === 'inputs') openForEdit(r);
    }
    if (a === 'view') {
      const choice = await dialog({
        title: r.title || r.moduleName,
        body: `<p class="muted small">${fmtDateTime(r.date)}</p><h4>Girdiler</h4>${detailTable(r.inputLabels)}<h4>Sonuç</h4>${detailTable(r.results.details)}`,
        actions: [{ label: 'Kapat', value: null }, { label: 'Düzenle', value: 'edit', kind: 'tonal' }, { label: 'PDF', value: 'pdf', kind: 'filled' }],
      });
      if (choice === 'pdf') exportPdf([r]);
      if (choice === 'edit') openForEdit(r);
    }
  });
}

export default {
  title: 'Hesaplama Geçmişi',
  render(el) {
    el.innerHTML = `${appBar('Hesaplama Geçmişi', { actions: `<button class="icon-btn" data-clear aria-label="Tümünü sil">${icon('trash')}</button>` })}
      <main class="page"><label class="search">${icon('search')}<input type="search" id="q" placeholder="Geçmişte ara" aria-label="Geçmişte ara"></label><div class="rec-list"></div></main>`;
    const list = el.querySelector('.rec-list'), q = el.querySelector('#q');
    const draw = () => {
      const t = trLower(q.value.trim());
      const all = HistoryRepo.all();
      const items = all.filter((r) => !t || trLower(`${r.title} ${r.moduleName}`).includes(t));
      list.innerHTML = !all.length ? emptyState('Henüz kayıt yok', 'Yaptığınız hesaplamaları "Geçmişe kaydet" ile burada saklayabilirsiniz.', 'history', `<a class="btn filled" href="#quit">${icon('calc')}<span>Hesaplama yap</span></a>`)
        : items.length ? items.map(recordItem).join('') : emptyState('Eşleşme yok', 'Aramanızı değiştirin.', 'search');
    };
    q.addEventListener('input', draw);
    bindRecordList(list, draw);
    el.querySelector('[data-clear]').addEventListener('click', async () => {
      if (!HistoryRepo.all().length) return;
      if (await confirmDialog('Tüm geçmişi sil', 'Favoriler dahil tüm kayıtlar silinecek. Bu işlem geri alınamaz.', 'Tümünü sil')) { HistoryRepo.clear(); draw(); toast('Geçmiş temizlendi'); }
    });
    draw();
  },
};
