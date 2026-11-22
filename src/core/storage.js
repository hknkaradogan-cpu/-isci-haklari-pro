import { STORAGE_KEYS } from './constants.js';

// Yerel depolama servisi (localStorage; erişilemezse bellek içi yedek)
const memory = {};
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return key in memory ? memory[key] : fallback; }
}
function write(key, value) {
  memory[key] = value;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* bellek içi */ }
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ---- Hesaplama geçmişi deposu ----
export const HistoryRepo = {
  all() { return read(STORAGE_KEYS.history, []); },
  get(id) { return this.all().find((r) => r.id === id); },
  save({ module, moduleName, inputs, inputLabels, results, summary }) {
    const list = this.all();
    const rec = { id: uid(), date: new Date().toISOString(), module, moduleName, inputs, inputLabels, results, summary, favorite: false, title: '' };
    list.unshift(rec);
    write(STORAGE_KEYS.history, list.slice(0, 300));
    return rec;
  },
  update(id, patch) {
    const list = this.all().map((r) => (r.id === id ? { ...r, ...patch, updated: new Date().toISOString() } : r));
    write(STORAGE_KEYS.history, list);
    return list.find((r) => r.id === id);
  },
  remove(id) { write(STORAGE_KEYS.history, this.all().filter((r) => r.id !== id)); },
  clear() { write(STORAGE_KEYS.history, []); },
  toggleFavorite(id) {
    const r = this.get(id); if (!r) return;
    return this.update(id, { favorite: !r.favorite });
  },
  favorites() { return this.all().filter((r) => r.favorite); },
};

// ---- Ayarlar ----
const DEFAULT_SETTINGS = { theme: 'system', notifications: true, legalUpdates: true, capOverride: '', firstRun: true };
export const SettingsRepo = {
  get() { return { ...DEFAULT_SETTINGS, ...read(STORAGE_KEYS.settings, {}) }; },
  set(patch) { const s = { ...this.get(), ...patch }; write(STORAGE_KEYS.settings, s); return s; },
};

// ---- Hatırlatıcılar ----
export const ReminderRepo = {
  all() { return read(STORAGE_KEYS.reminders, []); },
  add(r) { const list = this.all(); const rec = { id: Math.floor(Math.random() * 2e9), ...r }; list.push(rec); write(STORAGE_KEYS.reminders, list); return rec; },
  remove(id) { write(STORAGE_KEYS.reminders, this.all().filter((r) => r.id !== id)); },
  replace(list) { write(STORAGE_KEYS.reminders, list); },
};


// ---- Taranan evrak deposu ----
export const DocumentRepo = {
  all() { return read(STORAGE_KEYS.documents, []); },
  add(document) {
    const list = this.all();
    list.unshift({ id: uid(), createdAt: new Date().toISOString(), ...document });
    write(STORAGE_KEYS.documents, list.slice(0, 200));
    return list[0];
  },
  remove(id) { write(STORAGE_KEYS.documents, this.all().filter((d) => d.id !== id)); },
};
