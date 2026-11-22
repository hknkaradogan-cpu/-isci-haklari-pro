import { SettingsRepo } from './storage.js';
import { isNative, plugin } from './platform.js';

const mq = matchMedia('(prefers-color-scheme: dark)');
export function applyTheme() {
  const pref = SettingsRepo.get().theme;
  const dark = pref === 'dark' || (pref === 'system' && mq.matches);
  document.documentElement.dataset.mode = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0d1b2e' : '#1565C0');
  if (isNative()) { try { plugin('StatusBar')?.setStyle({ style: 'DARK' }); } catch { /* yok */ } }
}
mq.addEventListener?.('change', applyTheme);
