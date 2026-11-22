// Platform servisi: Android (Capacitor), Claude artifact veya standart tarayıcı
export const Cap = () => window.Capacitor;
export const isNative = () => !!window.Capacitor?.isNativePlatform?.();
export const plugin = (name) => window.Capacitor?.Plugins?.[name];

let downloadsNs;
export async function claudeDownloads() {
  if (downloadsNs !== undefined) return downloadsNs;
  try { downloadsNs = window.claude?.use ? await window.claude.use('downloads') : null; } catch { downloadsNs = null; }
  return downloadsNs;
}
// Artifact ortamında yetenek önceden hazırlansın
setTimeout(() => { claudeDownloads(); }, 0);

function blobToBase64(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

/** Dosyayı cihaza kaydet. Dönüş: kullanıcıya gösterilecek mesaj */
export async function saveFile(blob, filename) {
  if (isNative()) {
    const fs = plugin('Filesystem');
    const data = await blobToBase64(blob);
    try {
      await fs.writeFile({ path: `IsciHaklariPro/${filename}`, data, directory: 'DOCUMENTS', recursive: true });
      return 'PDF "Belgeler/IsciHaklariPro" klasörüne kaydedildi';
    } catch {
      await fs.writeFile({ path: filename, data, directory: 'EXTERNAL', recursive: true });
      return 'PDF uygulama klasörüne kaydedildi';
    }
  }
  const dl = await claudeDownloads();
  if (dl) {
    try { await dl.save({ filename, data: blob }); return 'PDF indirildi'; }
    catch (e) { if (e?.code === 'declined') return 'İndirme iptal edildi'; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return 'PDF indirildi';
}

export function canShareFiles() {
  if (isNative()) return true;
  try { return !!navigator.canShare?.({ files: [new File([new Blob(['x'])], 'a.pdf', { type: 'application/pdf' })] }); } catch { return false; }
}

export async function shareFile(blob, filename, title) {
  if (isNative()) {
    const fs = plugin('Filesystem');
    const data = await blobToBase64(blob);
    const w = await fs.writeFile({ path: filename, data, directory: 'CACHE' });
    await plugin('Share').share({ title, text: title, url: w.uri, dialogTitle: 'Raporu paylaş' });
    return;
  }
  const file = new File([blob], filename, { type: 'application/pdf' });
  await navigator.share({ files: [file], title });
}

export async function shareText({ title, text, url }) {
  if (isNative()) return plugin('Share').share({ title, text, url, dialogTitle: 'Paylaş' });
  if (navigator.share) return navigator.share({ title, text, url });
  await navigator.clipboard?.writeText(`${text} ${url || ''}`.trim());
  return 'copied';
}
