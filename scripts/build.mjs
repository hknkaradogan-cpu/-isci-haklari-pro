// Kaynakları tek, çevrimdışı çalışan bir index.html dosyasında birleştirir → www/index.html
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const res = await build({
  entryPoints: [root + 'src/main.js'],
  bundle: true, minify: true, format: 'iife', target: ['es2020', 'chrome80'],
  write: false, loader: { '.ttf': 'base64' },
  external: ['html2canvas', 'dompurify', 'canvg'],
  legalComments: 'none',
});
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const css = readFileSync(root + 'src/styles.css', 'utf8');
const html = readFileSync(root + 'src/index.html', 'utf8')
  .replace('/*CSS*/', () => css)
  .replace('/*JS*/', () => js);
mkdirSync(root + 'www', { recursive: true });
writeFileSync(root + 'www/index.html', html);
// PWA: ana ekrana eklenebilir, çevrimdışı çalışan web sürümü
const sharp = (await import('sharp')).default;
for (const n of [192, 512]) await sharp(root + 'assets/icon-only.png').resize(n, n).png().toFile(root + `www/icon-${n}.png`);
writeFileSync(root + 'www/manifest.webmanifest', JSON.stringify({
  name: 'İşçi Hakları Pro', short_name: 'İşçi Hakları', lang: 'tr', start_url: './', scope: './', display: 'standalone',
  background_color: '#1565C0', theme_color: '#1565C0', description: 'Kıdem, ihbar, izin ve fazla mesai hesaplayıcı',
  icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }],
}, null, 2));
writeFileSync(root + 'www/sw.js', `const C='ihp-${Date.now()}';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'])));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)))});`);
console.log('www/index.html', (html.length / 1024).toFixed(0) + ' KB');
