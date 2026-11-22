// Uygulama ikonu ve açılış ekranı kaynaklarını üretir (assets/)
import sharp from 'sharp';
const scale = (s) => `<g transform="translate(512 512) scale(${s}) translate(-12 -12)" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v16M7 20.5h10M4.5 7h15"/><path d="M4.5 7L2 13a3 3 0 005 0zM19.5 7L17 13a3 3 0 005 0z"/></g>`;
const bg = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#42A5F5"/><stop offset=".45" stop-color="#1565C0"/><stop offset="1" stop-color="#0B3C8A"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#g)"/>`;
const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${body}</svg>`);
await sharp(svg(bg + scale(26))).png().toFile('assets/icon-only.png');
await sharp(svg(bg)).png().toFile('assets/icon-background.png');
await sharp(svg(scale(17))).png().toFile('assets/icon-foreground.png');
const sp = (c1, c2) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="2732" height="2732" fill="url(#g)"/><g transform="translate(854 854)">${scale(18)}</g></svg>`);
await sharp(sp('#1565C0', '#0D47A1')).png().toFile('assets/splash.png');
await sharp(sp('#0F3B78', '#081A36')).png().toFile('assets/splash-dark.png');
console.log('ok');
