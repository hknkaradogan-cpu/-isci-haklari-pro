import { SettingsRepo, HistoryRepo } from '../../core/storage.js';
import { APP, SEVERANCE_CAPS, MIN_WAGE_2026, TAX_BRACKETS } from '../../core/constants.js';
import { appBar, icon, dialog, toast, confirmDialog } from '../../shared/ui.js';
import { applyTheme } from '../../core/theme.js';
import { requestPermission, rescheduleAll, ensureLegalReminders } from '../../core/notifications.js';
import { shareText } from '../../core/platform.js';
import { fmtTL, esc } from '../../core/format.js';

const PLAY_URL = `https://play.google.com/store/apps/details?id=${APP.appId}`;

const PRIVACY = `<p><b>${APP.name}</b> kişisel verilerinizi toplamaz, sunuculara göndermez ve üçüncü kişilerle paylaşmaz.</p>
<ul><li>Girdiğiniz maaş, tarih ve hesaplama bilgileri yalnızca cihazınızda saklanır.</li>
<li>Uygulama çalışmak için internet bağlantısına ihtiyaç duymaz.</li>
<li>Hatırlatıcılar cihazınızın yerel bildirim sistemiyle kurulur.</li>
<li>Uygulamayı kaldırdığınızda veya "Tüm verileri sil" dediğinizde tüm kayıtlar silinir.</li></ul>
<p>Hesaplamalar bilgilendirme amaçlıdır; hukuki danışmanlık niteliği taşımaz.</p>`;

const toggle = (id, label, sub, on) => `<label class="set-row"><span class="set-txt"><b>${label}</b><small>${sub}</small></span><span class="switch"><input type="checkbox" id="${id}"${on ? ' checked' : ''}><i></i></span></label>`;
const link = (act, ic, label, sub = '') => `<button class="set-row" data-act="${act}"><span class="cc-ic sm">${icon(ic)}</span><span class="set-txt"><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span>${icon('chevron-r', 'trail')}</button>`;

export default {
  title: 'Ayarlar',
  render(el) {
    const s = SettingsRepo.get();
    const cap = SEVERANCE_CAPS[SEVERANCE_CAPS.length - 1];
    el.innerHTML = `${appBar('Ayarlar')}
      <main class="page">
        <section class="card set-group"><h3 class="card-t">Görünüm</h3>
          <div class="seg" role="radiogroup" aria-label="Tema">${[['system', 'Sistem'], ['light', 'Açık'], ['dark', 'Koyu']].map(([v, l]) => `<label><input type="radio" name="theme" value="${v}"${s.theme === v ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div>
        </section>
        <section class="card set-group"><h3 class="card-t">Bildirimler</h3>
          ${toggle('notif', 'Bildirimlere izin ver', 'Hatırlatıcılar telefonunuza bildirim olarak gelir', s.notifications)}
          ${toggle('legal', 'Mevzuat güncellemeleri', 'Ocak ve Temmuz\'da asgari ücret / kıdem tavanı hatırlatması', s.legalUpdates)}
          ${link('reminders', 'bell', 'Hatırlatıcıları yönet')}
        </section>
        <section class="card set-group"><h3 class="card-t">Hesaplama parametreleri</h3>
          <div class="param"><span>Kıdem tavanı (${esc(cap.from.slice(0, 7))})</span><b>${fmtTL(cap.value)}</b></div>
          <div class="param"><span>Asgari ücret 2026 (brüt / net)</span><b>${fmtTL(MIN_WAGE_2026.gross)} / ${fmtTL(MIN_WAGE_2026.net)}</b></div>
          <div class="param"><span>Gelir vergisi dilimleri</span><b>${TAX_BRACKETS.map((b) => '%' + b.rate * 100).join(' · ')}</b></div>
          <label class="field"><span class="field-label">Kıdem tavanını elle belirle (isteğe bağlı)</span><span class="field-box"><input id="cap" inputmode="decimal" placeholder="Otomatik" value="${esc(s.capOverride)}"><span class="suffix">TL</span></span><span class="hint">Yeni tavan açıklandığında uygulama güncellenene kadar kullanabilirsiniz.</span></label>
        </section>
        <section class="card set-group"><h3 class="card-t">Uygulama</h3>
          ${link('privacy', 'shield', 'Gizlilik politikası')}
          ${link('rate', 'star', 'Uygulamayı değerlendir', 'Google Play\'de puan verin')}
          ${link('share', 'share', 'Uygulamayı paylaş')}
          ${link('about', 'info', 'Hakkında', `Sürüm ${APP.version}`)}
          ${link('wipe', 'trash', 'Tüm verileri sil', `${HistoryRepo.all().length} kayıt`)}
        </section>
      </main>`;

    el.querySelectorAll('input[name="theme"]').forEach((r) => r.addEventListener('change', () => { SettingsRepo.set({ theme: r.value }); applyTheme(); }));
    el.querySelector('#notif').addEventListener('change', async (e) => {
      if (e.target.checked) {
        const ok = await requestPermission();
        if (!ok) toast('Bildirim izni verilmedi. Telefon ayarlarından izin verebilirsiniz.');
      }
      SettingsRepo.set({ notifications: e.target.checked }); await rescheduleAll();
      toast(e.target.checked ? 'Bildirimler açık' : 'Bildirimler kapalı');
    });
    el.querySelector('#legal').addEventListener('change', async (e) => { SettingsRepo.set({ legalUpdates: e.target.checked }); ensureLegalReminders(); await rescheduleAll(); });
    el.querySelector('#cap').addEventListener('change', (e) => { SettingsRepo.set({ capOverride: e.target.value.trim() }); toast(e.target.value.trim() ? 'Manuel kıdem tavanı kaydedildi' : 'Otomatik tavana dönüldü'); });

    el.addEventListener('click', async (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act; if (!act) return;
      if (act === 'reminders') location.hash = 'reminders';
      if (act === 'privacy') dialog({ title: 'Gizlilik politikası', body: PRIVACY });
      if (act === 'rate') dialog({ title: 'Uygulamayı değerlendir', body: `<p>Beğendiyseniz Google Play'de 5 yıldız vererek destek olabilirsiniz.</p><p><a class="btn filled" href="${PLAY_URL}" target="_blank" rel="noopener">${icon('star')}<span>Google Play'i aç</span></a></p>` });
      if (act === 'share') {
        try { const r = await shareText({ title: APP.name, text: 'Kıdem, ihbar, izin ve fazla mesai alacağınızı saniyeler içinde hesaplayın: İşçi Hakları Pro', url: PLAY_URL }); if (r === 'copied') toast('Bağlantı kopyalandı'); }
        catch { /* iptal */ }
      }
      if (act === 'about') dialog({ title: APP.name, body: `<p>Sürüm ${APP.version} · Veriler: ${APP.updated}</p><p>Türkiye'deki çalışanlar, İK ve bordro uzmanları için kıdem, ihbar, yıllık izin, fazla mesai ve tatil çalışması hesaplayıcıları ile çevrimdışı işçi hakları rehberi.</p><p class="muted small">Dayanak: 4857 sayılı İş Kanunu, 1475 s. K. md.14, 193 s. Gelir Vergisi Kanunu, 488 s. Damga Vergisi Kanunu.</p>` });
      if (act === 'wipe' && await confirmDialog('Tüm verileri sil', 'Geçmiş, favoriler ve hatırlatıcılar silinecek.', 'Sil')) {
        try { localStorage.clear(); } catch { /* yok */ }
        await rescheduleAll(); toast('Tüm veriler silindi'); location.hash = 'dashboard';
      }
    });
  },
};
