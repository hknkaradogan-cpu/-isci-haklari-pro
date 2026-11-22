import { DocumentScanner } from '@capacitor-mlkit/document-scanner';
import { jsPDF } from 'jspdf';
import { DocumentRepo } from '../../core/storage.js';
import { isNative, plugin, saveFile } from '../../core/platform.js';
import { appBar, button, emptyState, icon, toast, confirmDialog } from '../../shared/ui.js';
import { fmtDateTime, esc } from '../../core/format.js';

const safeName = (s) => (s || 'Evrak').replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ_-]+/g, '_').slice(0, 48);

async function persistPdf(result, title = 'Çalışma Evrakı') {
  if (!result?.pdf?.uri) throw new Error('Tarama PDF dosyası oluşturulamadı.');
  const fs = plugin('Filesystem');
  const id = Date.now().toString(36);
  const filename = `${safeName(title)}_${id}.pdf`;
  const path = `IsciHaklariPro/Evraklar/${filename}`;
  await fs.mkdir({ path: 'IsciHaklariPro/Evraklar', directory: 'DOCUMENTS', recursive: true });
  await fs.copy({ from: result.pdf.uri, to: path, toDirectory: 'DOCUMENTS' });
  const fileUri = await fs.getUri({ path, directory: 'DOCUMENTS' });
  const saved = DocumentRepo.add({ title: filename.replace(/\.pdf$/i, ''), filename, path, uri: fileUri.uri, pageCount: result.pdf.pageCount || 1 });
  toast(`Evrak kaydedildi · ${saved.pageCount} sayfa`);
  return saved;
}

export async function saveRestoredScan(result) {
  try { await persistPdf(result, 'Taranan Evrak'); }
  catch (e) { toast(e?.message || 'Tarama kaydedilemedi.'); }
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function createBrowserPdf(files) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  for (let i = 0; i < files.length; i++) {
    const data = await readAsDataUrl(files[i]);
    const image = new Image();
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = data; });
    if (i) doc.addPage();
    const ratio = Math.min(210 / image.width, 297 / image.height);
    const w = image.width * ratio, h = image.height * ratio;
    doc.addImage(data, 'JPEG', (210 - w) / 2, (297 - h) / 2, w, h, undefined, 'FAST');
  }
  await saveFile(doc.output('blob'), `IsciHaklariPro_Evrak_${Date.now()}.pdf`);
  toast('PDF hazırlandı ve indirildi.');
}

export default {
  title: 'Evrak Tarama',
  render(el) {
    const native = isNative();
    const docs = DocumentRepo.all();
    el.innerHTML = `${appBar('Evrak Tarama')}
      <main class="page">
        <section class="hero-mini accent-hero">
          ${icon('pdf', 'hero-ic')}
          <div><b>Belgelerinizi dijitalleştirin</b><p>İş sözleşmesi, bordro, izin formu ve diğer iş evraklarını telefon kameranızla tarayın. Kenar algılama, kırpma, döndürme ve çok sayfalı PDF oluşturma desteklenir.</p></div>
        </section>
        <section class="card form">
          <h3 class="card-t">${icon('pdf')} Yeni evrak tara</h3>
          <label class="field"><span class="field-label">Belge adı</span><span class="field-box"><input id="doc-title" maxlength="48" placeholder="Örn. İş sözleşmesi / Maaş bordrosu" value="Çalışma Evrakı"></span></label>
          <p class="muted small">${native ? 'Kamera açılır; sayfa kenarlarını otomatik bulur. Birden fazla sayfayı tek PDF yapabilirsiniz.' : 'Tarayıcıda kamerayla fotoğraf çekebilir veya galeriden birden fazla sayfa seçebilirsiniz.'}</p>
          <div class="form-actions">
            ${button('Kamerayla tara', { act: 'scan', ic: 'pdf', kind: 'filled', block: true })}
            ${native ? '' : '<input id="web-files" type="file" accept="image/*" capture="environment" multiple hidden><button class="btn outlined" data-act="pick" type="button">Fotoğraf seç / kamera aç</button>'}
          </div>
          <div class="muted small" id="scan-status" aria-live="polite"></div>
        </section>
        <section class="card">
          <h3 class="card-t">${icon('inbox')} Kaydedilen evraklar <span class="muted">(${docs.length})</span></h3>
          <div class="doc-list">${docs.length ? docs.map((d) => `<article class="rec-mini doc-row" data-id="${esc(d.id)}">
            <span class="cc-ic sm">${icon('pdf')}</span>
            <span class="rec-txt"><b>${esc(d.title)}</b><small>${fmtDateTime(d.createdAt)} · ${d.pageCount} sayfa</small></span>
            <button class="icon-btn" data-act="open" aria-label="Aç">${icon('share')}</button>
            <button class="icon-btn" data-act="delete" aria-label="Sil">${icon('trash')}</button>
          </article>`).join('') : emptyState('Henüz evrak yok', 'İlk belgenizi taradığınızda burada listelenecek.', 'pdf')}</div>
        </section>
        <p class="muted small">Gizlilik: Taranan belgeler cihazınızda saklanır; uygulama sunucusuna gönderilmez. Önemli belgelerinizin ayrıca yedeğini almanızı öneririz.</p>
      </main>`;

    const status = el.querySelector('#scan-status');
    const title = () => el.querySelector('#doc-title').value.trim() || 'Çalışma Evrakı';
    el.addEventListener('click', async (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (!act) return;
      if (act === 'scan') {
        if (!native) { el.querySelector('#web-files')?.click(); return; }
        const scanButton = el.querySelector('[data-act="scan"]');
        scanButton.disabled = true; status.textContent = 'Tarayıcı açılıyor…';
        try {
          const moduleState = await DocumentScanner.isGoogleDocumentScannerModuleAvailable();
          if (!moduleState.available) {
            await DocumentScanner.installGoogleDocumentScannerModule();
            status.textContent = 'Google belge tarayıcısı telefona indiriliyor. İndirme tamamlanınca tekrar Kamerayla Tara düğmesine dokunun.';
            toast('Tarayıcı bileşeni indirilmeye başlandı.');
            return;
          }
          const result = await DocumentScanner.scanDocument({ galleryImportAllowed: true, pageLimit: 20, resultFormats: 'JPEG_PDF', scannerMode: 'FULL' });
          if (result?.pdf) await persistPdf(result, title());
          else status.textContent = 'Tarama iptal edildi.';
          location.hash = 'documents';
        } catch (err) {
          status.textContent = err?.message || 'Tarama açılamadı. Google Play Hizmetleri ve internet bağlantısını kontrol edin.';
          toast('Tarama başarısız oldu.');
        } finally { scanButton.disabled = false; }
      }
      if (act === 'pick') el.querySelector('#web-files')?.click();
      if (act === 'open' || act === 'delete') {
        const row = e.target.closest('[data-id]');
        const item = DocumentRepo.all().find((d) => d.id === row?.dataset.id);
        if (!item) return;
        if (act === 'delete') {
          if (!await confirmDialog('Evrakı sil', 'Bu PDF cihazdan ve listeden silinecek.', 'Sil')) return;
          try { await plugin('Filesystem').deleteFile({ path: item.path, directory: 'DOCUMENTS' }); } catch {}
          DocumentRepo.remove(item.id); location.hash = 'documents'; toast('Evrak silindi.');
        } else {
          try {
            const uri = await plugin('Filesystem').getUri({ path: item.path, directory: 'DOCUMENTS' });
            await plugin('Share').share({ title: item.title, text: item.title, url: uri.uri, dialogTitle: 'Evrakı aç veya paylaş' });
          } catch { toast('Evrak açılamadı.'); }
        }
      }
    });
    el.querySelector('#web-files')?.addEventListener('change', async (e) => {
      const files = [...(e.target.files || [])].filter((f) => f.type.startsWith('image/'));
      if (!files.length) return;
      status.textContent = 'PDF hazırlanıyor…';
      try { await createBrowserPdf(files); } catch (err) { toast(err?.message || 'PDF oluşturulamadı.'); }
      finally { status.textContent = ''; e.target.value = ''; }
    });
  },
};
