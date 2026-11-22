// Yerel bildirim servisi: Android'de Capacitor LocalNotifications, web'de Notification API
import { isNative, plugin } from './platform.js';
import { ReminderRepo, SettingsRepo } from './storage.js';
import { toast } from '../shared/ui.js';

export const REMINDER_TYPES = [
  { id: 'retirement', label: 'Emeklilik hatırlatıcısı', ic: 'retire' },
  { id: 'leave', label: 'Yıllık izin hatırlatıcısı', ic: 'beach' },
  { id: 'law', label: 'Mevzuat güncellemesi', ic: 'law' },
  { id: 'custom', label: 'Diğer', ic: 'bell' },
];

export async function requestPermission() {
  if (isNative()) {
    const ln = plugin('LocalNotifications');
    const p = await ln.requestPermissions();
    return p.display === 'granted';
  }
  if (!('Notification' in window)) return false;
  try { return (await Notification.requestPermission()) === 'granted'; } catch { return false; }
}

export async function schedule(rem) {
  if (!SettingsRepo.get().notifications) return;
  const at = new Date(rem.at);
  if (at <= new Date()) return;
  if (isNative()) {
    await plugin('LocalNotifications').schedule({
      notifications: [{ id: rem.id, title: rem.title, body: rem.body || 'İşçi Hakları Pro hatırlatıcısı', schedule: { at, allowWhileIdle: true }, smallIcon: 'ic_stat_notify', iconColor: '#1565C0' }],
    });
  }
}

export async function cancel(id) {
  if (isNative()) { try { await plugin('LocalNotifications').cancel({ notifications: [{ id }] }); } catch { /* yok */ } }
}

export async function rescheduleAll() {
  if (!isNative()) return;
  const ln = plugin('LocalNotifications');
  try {
    const pending = await ln.getPending();
    if (pending.notifications?.length) await ln.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
  } catch { /* yok */ }
  if (!SettingsRepo.get().notifications) return;
  for (const r of ReminderRepo.all()) await schedule(r);
}

// Mevzuat güncelleme hatırlatıcıları (Ocak: asgari ücret & vergi; Temmuz: kıdem tavanı)
export function nextLegalUpdateDates(now = new Date()) {
  const y = now.getFullYear();
  const list = [new Date(y, 0, 3, 10), new Date(y, 6, 5, 10), new Date(y + 1, 0, 3, 10), new Date(y + 1, 6, 5, 10)];
  return list.filter((d) => d > now).slice(0, 2);
}

export async function ensureLegalReminders() {
  const s = SettingsRepo.get();
  const list = ReminderRepo.all().filter((r) => !r.auto || new Date(r.at) > new Date());
  const hasAuto = list.some((r) => r.auto);
  if (s.legalUpdates && !hasAuto) {
    for (const d of nextLegalUpdateDates()) {
      const jan = d.getMonth() === 0;
      const rec = { id: Math.floor(Math.random() * 2e9), auto: true, type: 'law', at: d.toISOString(),
        title: jan ? 'Yeni yıl: asgari ücret ve vergi dilimleri' : 'Temmuz: yeni kıdem tazminatı tavanı',
        body: jan ? 'Yeni asgari ücret ve gelir vergisi dilimleri yürürlükte. Hesaplamalarınızı güncelleyin.' : 'Kıdem tazminatı tavanı güncellendi. Alacağınızı yeniden hesaplayın.' };
      list.push(rec);
    }
  }
  ReminderRepo.replace(s.legalUpdates ? list : list.filter((r) => !r.auto));
}

// Web'de: uygulama açılışında zamanı gelmiş hatırlatıcıları göster
export function checkDueReminders() {
  if (isNative()) return;
  const now = Date.now();
  const due = ReminderRepo.all().filter((r) => !r.shown && new Date(r.at).getTime() <= now);
  if (!due.length) return;
  due.forEach((r) => {
    try { if ('Notification' in window && Notification.permission === 'granted') new Notification(r.title, { body: r.body }); } catch { /* yok */ }
    toast(`Hatırlatma: ${r.title}`);
  });
  ReminderRepo.replace(ReminderRepo.all().map((r) => (due.some((d) => d.id === r.id) ? { ...r, shown: true } : r)));
}
