import { ARTICLES } from './data.js';
import { appBar, icon, emptyState, button } from '../../shared/ui.js';
import { esc, trLower } from '../../core/format.js';
import { nav } from '../../core/router.js';

function renderBody(lines) {
  let html = '', inList = false;
  for (const l of lines) {
    if (l.startsWith('- ')) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${esc(l.slice(2))}</li>`; continue; }
    if (inList) { html += '</ul>'; inList = false; }
    html += l.startsWith('## ') ? `<h3>${esc(l.slice(3))}</h3>` : `<p>${esc(l)}</p>`;
  }
  return html + (inList ? '</ul>' : '');
}

export default {
  title: 'İşçi Hakları Kütüphanesi',
  render(el) {
    el.innerHTML = `${appBar('İşçi Hakları Kütüphanesi')}
      <main class="page">
        <label class="search">${icon('search')}<input type="search" id="q" placeholder="Konu ara: kıdem, izin, mobbing…" aria-label="Makalelerde ara"></label>
        <div class="article-list"></div>
        <article class="article card" hidden></article>
      </main>`;
    const list = el.querySelector('.article-list'), art = el.querySelector('.article'), q = el.querySelector('#q');
    const draw = () => {
      const term = trLower(q.value.trim());
      const found = ARTICLES.filter((a) => !term || trLower(a.title + ' ' + a.tag + ' ' + a.body.join(' ')).includes(term));
      list.innerHTML = found.length ? found.map((a) => `<button class="article-item" data-id="${a.id}"><span class="cc-ic">${icon(a.ic)}</span><span><b>${esc(a.title)}</b><small>${esc(a.tag)} · ${Math.max(1, Math.round(a.body.join(' ').split(' ').length / 180))} dk okuma</small></span>${icon('chevron-r', 'trail')}</button>`).join('')
        : emptyState('Sonuç bulunamadı', `"${q.value}" için makale yok. Farklı bir kelime deneyin.`, 'search');
    };
    q.addEventListener('input', draw);
    list.addEventListener('click', (e) => {
      const b = e.target.closest('[data-id]'); if (!b) return;
      const a = ARTICLES.find((x) => x.id === b.dataset.id);
      art.innerHTML = `<button class="btn text" data-close>${icon('back')}<span>Tüm konular</span></button>
        <span class="tag">${esc(a.tag)}</span><h2>${esc(a.title)}</h2><div class="prose">${renderBody(a.body)}</div>
        ${a.calc ? `<div class="action-row">${button('İlgili hesaplamayı aç', { act: 'calc', ic: 'calc', extra: `data-route="${a.calc}"` })}</div>` : ''}`;
      art.hidden = false; list.hidden = true; q.parentElement.hidden = true;
      window.scrollTo(0, 0);
    });
    art.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) { art.hidden = true; list.hidden = false; q.parentElement.hidden = false; }
      const c = e.target.closest('[data-route]'); if (c) nav(c.dataset.route);
    });
    draw();
  },
};
