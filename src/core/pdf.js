// PDF rapor servisi (jsPDF + gömülü Roboto, Türkçe karakter desteği)
import { jsPDF } from 'jspdf';
import RobotoRegular from '../../node_modules/@expo-google-fonts/roboto/400Regular/Roboto_400Regular.ttf';
import RobotoBold from '../../node_modules/@expo-google-fonts/roboto/700Bold/Roboto_700Bold.ttf';
import { APP, DISCLAIMER } from './constants.js';
import { fmtTL, fmtDateTime } from './format.js';
import { saveFile, shareFile, canShareFiles } from './platform.js';
import { dialog, toast, loading } from '../shared/ui.js';

const BLUE = [21, 101, 192], LIGHT = [66, 165, 245], INK = [28, 33, 41], MUTED = [96, 106, 120], LINE = [224, 229, 236], GREEN = [46, 125, 50];

function newDoc() {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  doc.addFileToVFS('Roboto-Regular.ttf', RobotoRegular);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.addFileToVFS('Roboto-Bold.ttf', RobotoBold);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
  doc.setFont('Roboto', 'normal');
  return doc;
}

function drawLogo(doc, x, y, s) {
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, s, s, 3, 3, 'F');
  doc.setDrawColor(...BLUE); doc.setLineWidth(0.7);
  const cx = x + s / 2;
  doc.line(cx, y + s * 0.22, cx, y + s * 0.78);           // terazi direği
  doc.line(x + s * 0.2, y + s * 0.32, x + s * 0.8, y + s * 0.32); // kol
  doc.line(x + s * 0.32, y + s * 0.8, x + s * 0.68, y + s * 0.8); // taban
  doc.setFillColor(...LIGHT);
  doc.triangle(x + s * 0.12, y + s * 0.55, x + s * 0.38, y + s * 0.55, x + s * 0.25, y + s * 0.34, 'F');
  doc.triangle(x + s * 0.62, y + s * 0.55, x + s * 0.88, y + s * 0.55, x + s * 0.75, y + s * 0.34, 'F');
}

function header(doc, title) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BLUE); doc.rect(0, 0, W, 30, 'F');
  doc.setFillColor(...LIGHT); doc.rect(0, 30, W, 1.2, 'F');
  drawLogo(doc, 14, 7, 16);
  doc.setTextColor(255, 255, 255);
  doc.setFont('Roboto', 'bold'); doc.setFontSize(15); doc.text(APP.name, 35, 14);
  doc.setFont('Roboto', 'normal'); doc.setFontSize(9.5); doc.text(title, 35, 20.5);
  doc.setFontSize(9); doc.text(`Rapor tarihi: ${fmtDateTime(new Date().toISOString())}`, W - 14, 14, { align: 'right' });
  doc.text('Hesaplama raporu', W - 14, 20.5, { align: 'right' });
}

function footer(doc) {
  const n = doc.getNumberOfPages(), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LINE); doc.line(14, H - 16, W - 14, H - 16);
    doc.setFont('Roboto', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...MUTED);
    doc.text(doc.splitTextToSize(DISCLAIMER, W - 50), 14, H - 12);
    doc.text(`${i} / ${n}`, W - 14, H - 12, { align: 'right' });
  }
}

function sectionTitle(doc, y, text) {
  doc.setFont('Roboto', 'bold'); doc.setFontSize(11.5); doc.setTextColor(...BLUE);
  doc.text(text, 14, y);
  doc.setDrawColor(...LIGHT); doc.setLineWidth(0.4); doc.line(14, y + 1.8, 40, y + 1.8);
  return y + 7;
}

function ensure(doc, y, need, title) {
  if (y + need > doc.internal.pageSize.getHeight() - 22) { doc.addPage(); header(doc, title); return 42; }
  return y;
}

function table(doc, y, rows, title) {
  const W = doc.internal.pageSize.getWidth();
  rows.forEach(([k, v, cls], i) => {
    const val = typeof v === 'number' ? fmtTL(v) : String(v ?? '');
    const lines = doc.splitTextToSize(String(k), 105);
    const h = Math.max(7, lines.length * 4.4 + 2.6);
    y = ensure(doc, y, h, title);
    if (i % 2 === 0) { doc.setFillColor(245, 248, 252); doc.rect(14, y - 4.6, W - 28, h, 'F'); }
    const strong = cls && cls.includes('total');
    doc.setFont('Roboto', strong ? 'bold' : 'normal'); doc.setFontSize(9.5); doc.setTextColor(...INK);
    doc.text(lines, 17, y);
    doc.setTextColor(...(cls && cls.includes('neg') ? [198, 40, 40] : strong ? GREEN : INK));
    doc.text(val, W - 17, y, { align: 'right' });
    y += h;
  });
  return y + 3;
}

function renderRecord(doc, rec) {
  const W = doc.internal.pageSize.getWidth();
  const title = rec.title || rec.moduleName;
  header(doc, rec.moduleName);
  let y = 42;
  doc.setFont('Roboto', 'bold'); doc.setFontSize(17); doc.setTextColor(...INK);
  doc.text(title, 14, y); y += 6;
  doc.setFont('Roboto', 'normal'); doc.setFontSize(9); doc.setTextColor(...MUTED);
  doc.text(`Hesaplama tarihi: ${fmtDateTime(rec.date)}`, 14, y); y += 9;

  y = sectionTitle(doc, y, 'Hesaplama girdileri');
  y = table(doc, y, rec.inputLabels, title);

  y = ensure(doc, y, 34, title);
  y = sectionTitle(doc, y, 'Hesaplama sonuçları');
  const cards = rec.results.cards.slice(0, 3);
  const cw = (W - 28 - (cards.length - 1) * 4) / cards.length;
  cards.forEach((c, i) => {
    const x = 14 + i * (cw + 4);
    doc.setFillColor(...(i === 0 ? BLUE : [236, 243, 252])); doc.roundedRect(x, y - 3, cw, 20, 2.5, 2.5, 'F');
    doc.setTextColor(...(i === 0 ? [255, 255, 255] : MUTED)); doc.setFont('Roboto', 'normal'); doc.setFontSize(8.5);
    doc.text(doc.splitTextToSize(c.title, cw - 6)[0], x + 3.5, y + 3);
    doc.setTextColor(...(i === 0 ? [255, 255, 255] : INK)); doc.setFont('Roboto', 'bold'); doc.setFontSize(12.5);
    doc.text(fmtTL(c.amount), x + 3.5, y + 11.5);
  });
  y += 25;

  y = ensure(doc, y, 20, title);
  y = sectionTitle(doc, y, 'Detaylı döküm');
  y = table(doc, y, rec.results.details, title);

  if (rec.results.notes?.length) {
    y = ensure(doc, y, 16, title);
    y = sectionTitle(doc, y, 'Notlar');
    doc.setFont('Roboto', 'normal'); doc.setFontSize(9); doc.setTextColor(...INK);
    rec.results.notes.forEach((n) => {
      const lines = doc.splitTextToSize('• ' + (n.text || n), W - 30);
      y = ensure(doc, y, lines.length * 4.4, title);
      doc.text(lines, 15, y); y += lines.length * 4.4 + 1.5;
    });
    y += 2;
  }

  y = ensure(doc, y, 30, title);
  y = sectionTitle(doc, y, 'Özet');
  doc.setFillColor(232, 245, 233); doc.roundedRect(14, y - 3, W - 28, 20, 2.5, 2.5, 'F');
  doc.setFont('Roboto', 'normal'); doc.setFontSize(10); doc.setTextColor(...INK);
  doc.text(rec.summary.label, 19, y + 4.5);
  doc.setFont('Roboto', 'bold'); doc.setFontSize(16); doc.setTextColor(...GREEN);
  doc.text(fmtTL(rec.summary.amount), W - 19, y + 9, { align: 'right' });
  if (rec.summary.text) {
    doc.setFont('Roboto', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...MUTED);
    doc.text(doc.splitTextToSize(rec.summary.text, 110), 19, y + 10);
  }
}

export function buildPdf(records) {
  const doc = newDoc();
  records.forEach((r, i) => { if (i) doc.addPage(); renderRecord(doc, r); });
  footer(doc);
  return doc.output('blob');
}

const slug = (s) => String(s).toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Rapor üret ve Kaydet / Paylaş seçeneklerini sun */
export async function exportPdf(records) {
  const wait = document.createElement('div'); wait.className = 'overlay'; wait.innerHTML = loading('PDF raporu hazırlanıyor…');
  document.body.appendChild(wait);
  let blob;
  try {
    await new Promise((r) => setTimeout(r, 30));
    blob = buildPdf(records);
  } catch (e) { wait.remove(); toast('PDF oluşturulamadı: ' + e.message); return; }
  wait.remove();
  const d = new Date();
  const filename = `${records.length === 1 ? slug(records[0].moduleName) : 'hesaplama-raporu'}-${d.toISOString().slice(0, 10)}.pdf`;
  const actions = [{ label: 'Kapat', value: null }];
  if (canShareFiles()) actions.push({ label: 'Paylaş', value: 'share', kind: 'tonal' });
  actions.push({ label: 'Kaydet', value: 'save', kind: 'filled' });
  const choice = await dialog({
    title: 'PDF raporu hazır',
    body: `<p><strong>${filename}</strong></p><p class="muted">${records.length} hesaplama · ${(blob.size / 1024).toFixed(0)} KB</p>`,
    actions,
  });
  try {
    if (choice === 'save') toast(await saveFile(blob, filename));
    if (choice === 'share') await shareFile(blob, filename, `${APP.name} raporu`);
  } catch (e) { if (e?.name !== 'AbortError') toast('İşlem tamamlanamadı: ' + (e?.message || e)); }
}
