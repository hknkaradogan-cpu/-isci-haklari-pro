// Tüm hesaplama modülleri için ortak sayfa iskeleti (form → sonuç → kaydet / favori / PDF)
import { appBar, textField, dateField, selectField, chipGroup, button, resultCard, detailTable, infoCard, errorWidget, animateCounts, toast, icon } from './ui.js';
import { parseMoney, fmtTL, fmtDate, esc } from '../core/format.js';
import { HistoryRepo } from '../core/storage.js';
import { DISCLAIMER } from '../core/constants.js';
import { exportPdf } from '../core/pdf.js';
import { nav } from '../core/router.js';

const session = { editId: null, prefill: null };
export function openForEdit(record) { session.editId = record.id; session.prefill = record.inputs; nav(record.module); }
export function openWithInputs(route, inputs) { session.editId = null; session.prefill = inputs; nav(route); }

function renderField(f, value) {
  const v = value ?? f.default ?? '';
  if (f.type === 'date') return dateField({ id: f.id, label: f.label, value: v, required: f.required !== false });
  if (f.type === 'select') return selectField({ id: f.id, label: f.label, options: f.options, value: v });
  if (f.type === 'chips') return chipGroup({ id: f.id, label: f.label, options: f.options, value: v });
  return textField({ id: f.id, label: f.label, value: v, hint: f.hint, suffix: f.suffix ?? (f.type === 'money' ? 'TL' : ''), type: f.type, required: f.required, placeholder: f.placeholder });
}

function readValue(form, f) {
  if (f.type === 'chips') return form.querySelector(`input[name="${f.id}"]:checked`)?.value || f.default;
  const raw = form.elements[f.id]?.value ?? '';
  if (f.type === 'money' || f.type === 'int' || f.type === 'number') return raw === '' ? (f.required ? NaN : 0) : parseMoney(raw);
  return raw;
}

function displayValue(f, v) {
  if (f.type === 'date') return fmtDate(v);
  if (f.type === 'money') return fmtTL(v);
  if (f.type === 'select' || f.type === 'chips') return f.options.find((o) => o.id === v)?.label || v;
  return `${v}${f.suffix ? ' ' + f.suffix : ''}`;
}

export function defineCalculator(cfg) {
  return {
    title: cfg.title,
    render(el) {
      const editId = session.editId;
      const pre = session.prefill || {};
      session.editId = null; session.prefill = null;
      el.innerHTML = `${appBar(cfg.title)}
      <main class="page calc-page">
        <section class="hero-mini ${cfg.accent || ''}">${icon(cfg.icon, 'hero-ic')}<p>${esc(cfg.intro)}</p></section>
        <form class="card form" novalidate>
          ${editId ? infoCard('Kayıtlı bir hesaplamayı düzenliyorsunuz. Hesapladıktan sonra "Güncelle" ile kaydı değiştirebilirsiniz.', { tone: 'info' }) : ''}
          <div class="grid-fields">${cfg.fields.map((f) => renderField(f, pre[f.id])).join('')}</div>
          <div class="form-err"></div>
          <div class="form-actions">${button('Hesapla', { type: 'submit', ic: 'calc', kind: 'filled wide' })}${button('Temizle', { act: 'reset', kind: 'tonal' })}</div>
        </form>
        <section class="results" aria-live="polite"></section>
        ${cfg.footer ? `<section class="card prose">${cfg.footer}</section>` : ''}
      </main>`;

      const form = el.querySelector('form');
      const out = el.querySelector('.results');
      let last = null, savedId = editId;

      const compute = () => {
        const inputs = {};
        cfg.fields.forEach((f) => { inputs[f.id] = readValue(form, f); });
        const missing = cfg.fields.find((f) => f.required !== false && (f.type === 'date' ? !inputs[f.id] : f.required && !(inputs[f.id] > 0)));
        if (missing) throw new Error(`"${missing.label}" alanını doldurun.`);
        const res = cfg.compute(inputs);
        return { inputs, res };
      };

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.querySelector('.form-err').innerHTML = '';
        try {
          const { inputs, res } = compute();
          last = {
            module: cfg.route, moduleName: cfg.title, inputs,
            inputLabels: cfg.fields.filter((f) => !(f.type !== 'date' && f.type !== 'select' && f.type !== 'chips' && !inputs[f.id])).map((f) => [f.label, displayValue(f, inputs[f.id])]),
            results: { cards: res.cards, details: res.details, notes: res.notes || [] },
            summary: res.summary,
          };
          out.innerHTML = `
            <div class="result-grid">${res.cards.map((c, i) => resultCard({ ...c, big: i === 0 })).join('')}</div>
            ${res.extraHtml || ''}
            <div class="card"><h3 class="card-t">${icon('list')} Hesaplama detayı</h3>${detailTable(res.details)}</div>
            ${(res.notes || []).map((n) => infoCard(n.text || n, { tone: n.tone || 'info' })).join('')}
            ${infoCard(DISCLAIMER, { tone: 'muted' })}
            <div class="action-row">
              ${button(savedId && editId ? 'Güncelle' : 'Geçmişe kaydet', { act: 'save', ic: 'save', kind: 'filled' })}
              ${button('Favori', { act: 'fav', ic: 'star', kind: 'tonal' })}
              ${button('PDF rapor', { act: 'pdf', ic: 'pdf', kind: 'tonal' })}
            </div>`;
          out.classList.remove('show'); void out.offsetWidth; out.classList.add('show');
          animateCounts(out);
          out.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
          out.innerHTML = '';
          form.querySelector('.form-err').innerHTML = errorWidget(err.message);
        }
      });

      const persist = () => {
        if (savedId && HistoryRepo.get(savedId)) { HistoryRepo.update(savedId, last); return HistoryRepo.get(savedId); }
        const r = HistoryRepo.save(last); savedId = r.id; return r;
      };

      el.addEventListener('click', async (e) => {
        const act = e.target.closest('[data-act]')?.dataset.act;
        if (!act) return;
        if (act === 'reset') { form.reset(); cfg.fields.forEach((f) => { if (f.type !== 'chips' && f.type !== 'select' && form.elements[f.id]) form.elements[f.id].value = ''; }); out.innerHTML = ''; savedId = null; }
        if (!last) return;
        if (act === 'save') { persist(); toast(editId ? 'Kayıt güncellendi' : 'Hesaplama geçmişe kaydedildi'); }
        if (act === 'fav') { const r = persist(); if (!r.favorite) HistoryRepo.toggleFavorite(r.id); toast('Favorilere eklendi'); }
        if (act === 'pdf') { const r = persist(); await exportPdf([HistoryRepo.get(r.id)]); }
      });
    },
  };
}
