import { ReminderRepo, SettingsRepo } from '../../core/storage.js';
import { REMINDER_TYPES, schedule, cancel, requestPermission, ensureLegalReminders } from '../../core/notifications.js';
import { appBar, icon, emptyState, button, dialog, toast, confirmDialog, selectField, todayISO } from '../../shared/ui.js';
import { fmtDateTime, esc } from '../../core/format.js';
import { isNative } from '../../core/platform.js';

const PRESETS = {
  retirement: { title: 'Emeklilik tarihim yaklaşıyor', body: 'Emeklilik başvurusu ve kıdem tazminatı belgelerinizi hazırlayın.' },
  leave: { title: 'Yıllık izin hakkımı kullan', body: 'Kullanılmayan yıllık izin günlerinizi planlayın.' },
  law: { title: 'İş hukuku güncellemesini kontrol et', body: 'Asgari ücret, vergi dilimi ve kıdem tavanı değişikliklerini kontrol edin.' },
  custom: { title: '', body: '' },
};

export default {
  title: 'Hatırlatıcılar',
  render(el) {
    ensureLegalReminders();
    el.innerHTML = `${appBar('Hatırlatıcılar')}
      <main class="page">
        <section class="hero-mini">${icon('bell', 'hero-ic')}<p>Emeklilik, yıllık izin ve mevzuat güncellemeleri için kendinize hatırlatıcı kurun.${isNative() ? '' : ' Web sürümünde hatırlatmalar uygulamayı açtığınızda gösterilir; telefon bildirimi için Android uygulamasını kullanın.'}</p></section>
        <div class="action-row">${button('Yeni hatırlatıcı', { act: 'add', ic: 'plus', kind: 'filled' })}</div>
        <div class="rem-list"></div>
      </main>`;
    const list = el.querySelector('.rem-list');
    const draw = () => {
      const items = ReminderRepo.all().sort((a, b) => new Date(a.at) - new Date(b.at));
      list.innerHTML = items.length ? items.map((r) => {
        const t = REMINDER_TYPES.find((x) => x.id === r.type) || REMINDER_TYPES[3];
        const past = new Date(r.at) < new Date();
        return `<div class="rec${past ? ' past' : ''}" data-id="${r.id}"><div class="rec-main"><span class="cc-ic">${icon(t.ic)}</span>
          <span class="rec-txt"><b>${esc(r.title)}</b><small>${fmtDateTime(r.at)}${r.auto ? ' · otomatik' : ''}${past ? ' · geçti' : ''}</small></span></div>
          <div class="rec-actions"><button class="icon-btn" data-del aria-label="Sil">${icon('trash')}</button></div></div>`;
      }).join('') : emptyState('Hatırlatıcı yok', 'İlk hatırlatıcınızı ekleyin.', 'bell');
    };
    list.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-del]'); if (!b) return;
      const id = +b.closest('[data-id]').dataset.id;
      if (await confirmDialog('Hatırlatıcıyı sil', 'Bu hatırlatıcı silinsin mi?')) {
        const r = ReminderRepo.all().find((x) => x.id === id);
        if (r?.auto) SettingsRepo.set({ legalUpdates: false });
        ReminderRepo.remove(id); await cancel(id); draw();
      }
    });
    el.querySelector('[data-act="add"]').addEventListener('click', async () => {
      const ok = await dialog({
        title: 'Yeni hatırlatıcı',
        body: `<form class="dlg-form" onsubmit="return false">${selectField({ id: 'rType', label: 'Tür', options: REMINDER_TYPES, value: 'retirement' })}
          <label class="field"><span class="field-label">Başlık</span><span class="field-box"><input id="rTitle" value="${esc(PRESETS.retirement.title)}"></span></label>
          <label class="field"><span class="field-label">Tarih</span><span class="field-box"><input id="rDate" type="date" min="${todayISO()}" value="${todayISO()}"></span></label>
          <label class="field"><span class="field-label">Saat</span><span class="field-box"><input id="rTime" type="time" value="10:00"></span></label></form>`,
        actions: [{ label: 'Vazgeç', value: false }, { label: 'Kaydet', value: true, kind: 'filled' }],
      });
      if (!ok) return;
      const type = document.getElementById('rType').value;
      const title = document.getElementById('rTitle').value.trim() || REMINDER_TYPES.find((t) => t.id === type).label;
      const at = new Date(`${document.getElementById('rDate').value}T${document.getElementById('rTime').value || '10:00'}`);
      if (!(at > new Date())) return toast('Lütfen ileri bir tarih ve saat seçin');
      const rec = ReminderRepo.add({ type, title, body: PRESETS[type].body, at: at.toISOString() });
      if (SettingsRepo.get().notifications) { await requestPermission(); await schedule(rec); }
      toast('Hatırlatıcı kuruldu'); draw();
    });
    // Tür değişince başlığı öner
    if (!window.__ihpRemBound) {
      window.__ihpRemBound = true;
      document.addEventListener('change', (e) => {
        if (e.target.id === 'rType') { const t = document.getElementById('rTitle'); if (t) t.value = PRESETS[e.target.value].title; }
      });
    }
    draw();
  },
};
