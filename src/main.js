import { registerRoutes, startRouter, back, onRouteChange } from './core/router.js';
import { applyTheme } from './core/theme.js';
import { iconSprite } from './shared/icons.js';
import { icon } from './shared/ui.js';
import { ensureLegalReminders, checkDueReminders, rescheduleAll } from './core/notifications.js';
import { isNative } from './core/platform.js';

import dashboard from './features/dashboard/page.js';
import severance from './features/severance/page.js';
import notice from './features/notice/page.js';
import annualLeave from './features/annual_leave/page.js';
import overtime from './features/overtime/page.js';
import holidayWork from './features/holiday_work/page.js';
import weekendWork from './features/weekend_work/page.js';
import quit from './features/quit_calculator/page.js';
import library from './features/rights_library/page.js';
import minWage from './features/min_wage/page.js';
import historyPage from './features/history/page.js';
import favorites from './features/favorites/page.js';
import reports from './features/reports/page.js';
import reminders from './features/reminders/page.js';
import settings from './features/settings/page.js';
import scanner, { saveRestoredScan } from './features/documents/page.js';

{
  registerRoutes({
    dashboard, severance, notice, 'annual-leave': annualLeave, overtime, 'holiday-work': holidayWork,
    'weekend-work': weekendWork, quit, library, 'min-wage': minWage, history: historyPage, favorites, reports, reminders, settings, documents: scanner,
  });

  applyTheme();
  document.body.insertAdjacentHTML('afterbegin', iconSprite());

  const tabs = [['dashboard', 'home', 'Ana sayfa'], ['quit', 'exit', 'Ne alırım?'], ['history', 'history', 'Geçmiş'], ['library', 'book', 'Haklar'], ['settings', 'settings', 'Ayarlar']];
  const navEl = document.getElementById('tabbar');
  navEl.innerHTML = tabs.map(([r, ic, l]) => `<a href="#${r}" data-r="${r}">${icon(ic)}<span>${l}</span></a>`).join('');
  onRouteChange((r) => navEl.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.r === r)));

  document.addEventListener('click', (e) => { if (e.target.closest('[data-act="back"]')) back(); });

  startRouter(document.getElementById('app'));

  // Splash ekranını kaldır
  const splash = document.getElementById('splash');
  setTimeout(() => { splash?.classList.add('hide'); setTimeout(() => splash?.remove(), 500); }, 650);

  // PWA servis çalışanı (yalnızca normal web sitesinde)
  if (!isNative() && location.protocol === 'https:' && 'serviceWorker' in navigator && !location.hostname.endsWith('claude.ai') && !location.hostname.includes('claudeusercontent')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  if (isNative()) {
    const appPlugin = window.Capacitor?.Plugins?.App;
    appPlugin?.addListener?.('appRestoredResult', async (event) => {
      if (event.pluginId === 'DocumentScanner' && event.methodName === 'scanDocument' && event.success) {
        await saveRestoredScan(event.data);
      }
    });
  }

  ensureLegalReminders();
  if (isNative()) rescheduleAll(); else setTimeout(checkDueReminders, 1500);
}
