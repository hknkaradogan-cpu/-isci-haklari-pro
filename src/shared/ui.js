// Yeniden kullanılabilir arayüz bileşenleri
import { esc, fmtTL, toISO } from '../core/format.js';

export const icon = (name, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

export function appBar(title, { back = true, actions = '' } = {}) {
  return `<header class="appbar">
    ${back ? `<button class="icon-btn" data-act="back" aria-label="Geri">${icon('back')}</button>` : ''}
    <h1>${esc(title)}</h1><div class="appbar-actions">${actions}</div></header>`;
}

export const sectionHeader = (title, sub = '') =>
  `<div class="section-h"><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}</div>`;

export function textField({ id, label, value = '', hint = '', suffix = 'TL', type = 'money', required = false, placeholder = '' }) {
  const mode = type === 'money' ? 'decimal' : type === 'int' ? 'numeric' : 'text';
  return `<label class="field" for="${id}"><span class="field-label">${esc(label)}${required ? ' *' : ''}</span>
    <span class="field-box"><input id="${id}" name="${id}" inputmode="${mode}" autocomplete="off" value="${esc(value)}" placeholder="${esc(placeholder)}"${required ? ' required' : ''}>
    ${suffix ? `<span class="suffix">${esc(suffix)}</span>` : ''}</span>
    ${hint ? `<span class="hint">${esc(hint)}</span>` : ''}</label>`;
}

export function dateField({ id, label, value = '', required = true }) {
  return `<label class="field" for="${id}"><span class="field-label">${esc(label)}${required ? ' *' : ''}</span>
    <span class="field-box">${icon('calendar', 'lead')}<input id="${id}" name="${id}" type="date" value="${esc(value)}" max="2099-12-31"${required ? ' required' : ''}></span></label>`;
}

export function selectField({ id, label, options, value }) {
  return `<label class="field" for="${id}"><span class="field-label">${esc(label)}</span>
    <span class="field-box"><select id="${id}" name="${id}">${options.map((o) => `<option value="${esc(o.id)}"${o.id === value ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select>${icon('chevron', 'trail')}</span></label>`;
}

export function chipGroup({ id, label, options, value }) {
  return `<fieldset class="chips" id="${id}"><legend class="field-label">${esc(label)}</legend>
    ${options.map((o) => `<label class="chip"><input type="radio" name="${id}" value="${esc(o.id)}"${o.id === value ? ' checked' : ''}><span>${esc(o.label)}</span></label>`).join('')}</fieldset>`;
}

export const button = (label, { kind = 'filled', act = '', ic = '', type = 'button', extra = '' } = {}) =>
  `<button type="${type}" class="btn ${kind}" ${act ? `data-act="${act}"` : ''} ${extra}>${ic ? icon(ic) : ''}<span>${esc(label)}</span></button>`;

export function resultCard({ title, amount, sub = '', tone = 'primary', big = false }) {
  return `<div class="result-card tone-${tone}${big ? ' big' : ''}"><span class="rc-title">${esc(title)}</span>
    <strong class="rc-amount" data-count="${amount}">${fmtTL(amount)}</strong>${sub ? `<span class="rc-sub">${esc(sub)}</span>` : ''}</div>`;
}

export function detailTable(rows) {
  return `<dl class="detail">${rows.map(([k, v, cls = '']) => `<div class="row ${cls}"><dt>${esc(k)}</dt><dd>${typeof v === 'number' ? fmtTL(v) : esc(v)}</dd></div>`).join('')}</dl>`;
}

export const infoCard = (text, { tone = 'info', title = '' } = {}) =>
  `<div class="info-card tone-${tone}">${icon(tone === 'warn' ? 'alert' : 'info')}<div>${title ? `<strong>${esc(title)}</strong>` : ''}<p>${esc(text)}</p></div></div>`;

export const calculationCard = ({ title, sub, ic, route, accent = '' }) =>
  `<a class="calc-card ${accent}" href="#${route}"><span class="cc-ic">${icon(ic)}</span><span class="cc-t">${esc(title)}</span><span class="cc-s">${esc(sub)}</span></a>`;

export const emptyState = (title, text, ic = 'inbox', action = '') =>
  `<div class="empty">${icon(ic, 'xl')}<h3>${esc(title)}</h3><p>${esc(text)}</p>${action}</div>`;

export const errorWidget = (text) => `<div class="error-box" role="alert">${icon('alert')}<span>${esc(text)}</span></div>`;

export const loading = (text = 'Hazırlanıyor…') => `<div class="loading"><span class="spinner"></span><span>${esc(text)}</span></div>`;

// ---- Diyalog & bildirim ----
export function dialog({ title, body, actions = [{ label: 'Tamam', value: true, kind: 'filled' }] }) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'dialog-wrap';
    el.innerHTML = `<div class="dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h3>${esc(title)}</h3><div class="dialog-body">${body}</div>
      <div class="dialog-actions">${actions.map((a, i) => `<button class="btn ${a.kind || 'text'}" data-i="${i}">${esc(a.label)}</button>`).join('')}</div></div>`;
    const close = (v) => { el.classList.add('out'); setTimeout(() => el.remove(), 180); resolve(v); };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-i]');
      if (b) close(actions[+b.dataset.i].value);
      else if (e.target === el) close(undefined);
    });
    document.body.appendChild(el);
    el.querySelector('button[data-i]')?.focus();
  });
}
export const confirmDialog = (title, text, okLabel = 'Sil') =>
  dialog({ title, body: `<p>${esc(text)}</p>`, actions: [{ label: 'Vazgeç', value: false }, { label: okLabel, value: true, kind: 'filled danger' }] });

export function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, 2600);
}

// Sonuç rakamlarını sayarak gösteren animasyon
export function animateCounts(root) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const start = performance.now(), dur = 700;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = fmtTL(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

export const todayISO = () => toISO(new Date());
