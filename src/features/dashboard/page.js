import { icon, calculationCard, sectionHeader } from '../../shared/ui.js';
import { HistoryRepo } from '../../core/storage.js';
import { SEVERANCE_CAPS, MIN_WAGE_2026, APP } from '../../core/constants.js';
import { fmtTL, fmtDateTime, esc } from '../../core/format.js';
import { MODULE_ICONS } from '../history/page.js';

export const CALCULATORS = [
  { route: 'severance', title: 'Kıdem Tazminatı', sub: 'Yıl, ay, gün bazında net tutar', ic: 'severance' },
  { route: 'notice', title: 'İhbar Tazminatı', sub: '2–8 hafta yasal süre', ic: 'notice' },
  { route: 'annual-leave', title: 'Yıllık İzin Ücreti', sub: 'Kullanılmayan izin alacağı', ic: 'beach' },
  { route: 'overtime', title: 'Fazla Mesai', sub: '%50 zamlı saat ücreti', ic: 'clock' },
  { route: 'holiday-work', title: 'Resmi Tatil Mesaisi', sub: 'Bayram ve genel tatil', ic: 'flag' },
  { route: 'weekend-work', title: 'Hafta Tatili Mesaisi', sub: 'Dinlenme günü çalışması', ic: 'week' },
];
export const TOOLS = [
  { route: 'library', title: 'Haklar Kütüphanesi', sub: '10 konu, çevrimdışı', ic: 'book' },
  { route: 'min-wage', title: 'Asgari Ücret Arşivi', sub: '2010–2026 brüt / net', ic: 'wallet' },
  { route: 'history', title: 'Hesaplama Geçmişi', sub: 'Kaydet, düzenle, sil', ic: 'history' },
  { route: 'favorites', title: 'Favoriler', sub: 'Sık bakılanlar', ic: 'star' },
  { route: 'reports', title: 'PDF Raporlar', sub: 'Kaydet ve paylaş', ic: 'pdf' },
  { route: 'reminders', title: 'Hatırlatıcılar', sub: 'Emeklilik, izin, mevzuat', ic: 'bell' },
  { route: 'settings', title: 'Ayarlar', sub: 'Tema, bildirim, hakkında', ic: 'settings' },
];

export default {
  title: 'Ana Sayfa',
  render(el) {
    const cap = SEVERANCE_CAPS[SEVERANCE_CAPS.length - 1];
    const recent = HistoryRepo.all().slice(0, 3);
    const h = new Date().getHours();
    const greet = h < 6 ? 'İyi geceler' : h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar';
    el.innerHTML = `
      <header class="dash-hero">
        <div class="dash-top"><span class="brand"><span class="logo">${icon('law')}</span><span><small>${greet}</small><b>${APP.name}</b></span></span>
          <a class="icon-btn glass" href="#settings" aria-label="Ayarlar">${icon('settings')}</a></div>
        <a class="feature-card" href="#quit">
          <span class="fc-tag">En çok kullanılan</span>
          <h2>İşten ayrılırsam ne kadar alırım?</h2>
          <p>Kıdem, ihbar, izin ve fazla mesai alacağınız tek ekranda.</p>
          <span class="fc-cta">Hemen hesapla ${icon('chevron-r')}</span>
          <svg class="fc-art" viewBox="0 0 160 120" aria-hidden="true"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity=".55"/></linearGradient></defs>
            <rect x="18" y="70" width="22" height="40" rx="5" fill="url(#g1)" opacity=".5"/><rect x="50" y="52" width="22" height="58" rx="5" fill="url(#g1)" opacity=".65"/><rect x="82" y="34" width="22" height="76" rx="5" fill="url(#g1)" opacity=".8"/><rect x="114" y="14" width="22" height="96" rx="5" fill="url(#g1)"/>
            <path d="M22 62 L60 44 L92 28 L130 8" stroke="#FFD54F" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="130" cy="8" r="6" fill="#FFD54F"/></svg>
        </a>
        <div class="stat-row">
          <div class="stat glass"><small>Net asgari ücret 2026</small><b>${fmtTL(MIN_WAGE_2026.net)}</b></div>
          <div class="stat glass"><small>Kıdem tavanı · Temmuz 2026</small><b>${fmtTL(cap.value)}</b></div>
        </div>
      </header>
      <main class="page dash">
        ${sectionHeader('Hesaplayıcılar', 'Brüt maaşınızla saniyeler içinde net sonuç')}
        <div class="card-grid">${CALCULATORS.map((c, i) => calculationCard({ ...c, accent: `d${i}` })).join('')}</div>
        ${recent.length ? `${sectionHeader('Son hesaplamalar')}<div class="recent">${recent.map((r) => `<a class="rec-mini" href="#history"><span class="cc-ic sm">${icon(MODULE_ICONS[r.module] || 'calc')}</span><span class="rec-txt"><b>${esc(r.title || r.moduleName)}</b><small>${fmtDateTime(r.date)}</small></span><span class="rec-amt">${fmtTL(r.summary.amount)}</span></a>`).join('')}</div>` : ''}
        ${sectionHeader('Bilgi ve araçlar')}
        <div class="card-grid tools">${TOOLS.map((c) => calculationCard({ ...c, accent: 'tool' })).join('')}</div>
        <p class="muted small center">Veriler ${APP.updated} itibarıyla günceldir · Hesaplamalar bilgilendirme amaçlıdır.</p>
      </main>`;
  },
};
