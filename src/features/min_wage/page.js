import { MIN_WAGES } from './data.js';
import { appBar, icon, emptyState } from '../../shared/ui.js';
import { fmtTL, esc, trLower } from '../../core/format.js';

export default {
  title: 'Asgari Ücret Arşivi',
  render(el) {
    const latest = MIN_WAGES[0];
    const prevYear = MIN_WAGES.find((w) => w.year === latest.year - 1 && !w.period.includes('Ocak'));
    const yearly = [...new Map(MIN_WAGES.map((w) => [w.year, w])).values()].reverse(); // her yılın son dönemi
    const max = Math.max(...yearly.map((w) => w.net));
    el.innerHTML = `${appBar('Asgari Ücret Arşivi')}
      <main class="page">
        <section class="hero-mini">${icon('wallet', 'hero-ic')}<div><p class="muted-inv">${esc(latest.period)} asgari ücreti</p>
          <div class="hero-nums"><div><small>Net</small><strong>${fmtTL(latest.net)}</strong></div><div><small>Brüt</small><strong>${fmtTL(latest.gross)}</strong></div>
          ${prevYear ? `<div><small>Yıllık artış</small><strong>%${(((latest.net / prevYear.net) - 1) * 100).toFixed(0)}</strong></div>` : ''}</div></div></section>
        <section class="card"><h3 class="card-t">Net asgari ücretin seyri</h3>
          <div class="bars">${yearly.map((w) => `<div class="bar" title="${w.year}: ${fmtTL(w.net)}"><span style="height:${(w.net / max) * 100}%"></span><small>${String(w.year).slice(2)}</small></div>`).join('')}</div>
        </section>
        <label class="search">${icon('search')}<input type="search" id="q" inputmode="numeric" placeholder="Yıl ara (ör. 2019)" aria-label="Yıl ara"></label>
        <section class="card table-card"><table class="data-table"><thead><tr><th>Dönem</th><th class="num">Brüt</th><th class="num">Net</th></tr></thead><tbody></tbody></table></section>
        <p class="muted small">2022 öncesi net tutarlara asgari geçim indirimi (bekâr) dahildir. 2022'den itibaren asgari ücret gelir ve damga vergisinden istisnadır.</p>
      </main>`;
    const tb = el.querySelector('tbody'), q = el.querySelector('#q');
    const draw = () => {
      const t = trLower(q.value.trim());
      const rows = MIN_WAGES.filter((w) => !t || trLower(w.period).includes(t));
      tb.innerHTML = rows.length ? rows.map((w) => `<tr><td>${esc(w.period)}</td><td class="num">${fmtTL(w.gross)}</td><td class="num"><b>${fmtTL(w.net)}</b></td></tr>`).join('')
        : `<tr><td colspan="3">${emptyState('Kayıt yok', 'Arşiv 2010 ve sonrasını kapsar.', 'search')}</td></tr>`;
    };
    q.addEventListener('input', draw);
    draw();
  },
};
