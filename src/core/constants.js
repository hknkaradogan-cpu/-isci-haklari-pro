// Yasal parametreler ve uygulama sabitleri (Kasım 2026 itibarıyla güncel)
export const APP = {
  name: 'İşçi Hakları Pro',
  version: '1.0.0',
  appId: 'com.iscihaklari.pro',
  updated: 'Kasım 2026',
};

// Kıdem tazminatı tavanları (yürürlük başlangıcına göre)
export const SEVERANCE_CAPS = [
  { from: '2023-01-01', value: 19982.83 },
  { from: '2023-07-01', value: 23489.83 },
  { from: '2024-01-01', value: 35058.58 },
  { from: '2024-07-01', value: 41828.42 },
  { from: '2025-01-01', value: 46655.43 },
  { from: '2025-07-01', value: 53919.68 },
  { from: '2026-01-01', value: 64948.77 },
  { from: '2026-07-01', value: 73729.87 },
];

// 2026 ücret gelirleri gelir vergisi tarifesi (yıllık kümülatif matrah)
export const TAX_BRACKETS = [
  { upTo: 190000, rate: 0.15 },
  { upTo: 400000, rate: 0.20 },
  { upTo: 1500000, rate: 0.27 },
  { upTo: 5300000, rate: 0.35 },
  { upTo: Infinity, rate: 0.40 },
];

export const RATES = {
  stamp: 0.00759,          // Damga vergisi (binde 7,59)
  sgkEmployee: 0.14,       // SGK işçi payı
  unemploymentEmployee: 0.01, // İşsizlik sigortası işçi payı
  overtimeMultiplier: 1.5, // %50 zamlı
  weeklyRestMultiplier: 1.5,
  monthlyHours: 225,       // 45 saat x 30/7 ≈ 225
  monthDays: 30,
};

export const MIN_WAGE_2026 = { gross: 33030.0, net: 28075.5 };

// İş Kanunu md.17 ihbar süreleri (kıdem ay cinsinden)
export const NOTICE_PERIODS = [
  { maxMonths: 6, weeks: 2, label: '6 aydan az' },
  { maxMonths: 18, weeks: 4, label: '6 ay – 1,5 yıl' },
  { maxMonths: 36, weeks: 6, label: '1,5 – 3 yıl' },
  { maxMonths: Infinity, weeks: 8, label: '3 yıldan fazla' },
];

export const EXIT_TYPES = [
  { id: 'istifa', label: 'İstifa', severance: false, notice: false,
    note: 'İstifada kıdem ve ihbar tazminatı doğmaz. Kullanılmayan izin ve ödenmemiş fazla mesai alacağı her durumda ödenir.' },
  { id: 'isveren', label: 'İşveren Feshi', severance: true, notice: true,
    note: 'Haklı bir neden (İş K. md.25/II) olmadan işveren feshinde kıdem (1 yıl şartıyla) ve ihbar tazminatı ödenir. İhbar süresi kullandırıldıysa ihbar tazminatı düşer.' },
  { id: 'emeklilik', label: 'Emeklilik', severance: true, notice: false,
    note: 'Yaşlılık aylığı bağlanması veya emeklilik için gerekli yıl/prim şartının dolması nedeniyle ayrılışta kıdem tazminatı ödenir; ihbar ödenmez.' },
  { id: 'askerlik', label: 'Askerlik', severance: true, notice: false,
    note: 'Muvazzaf askerlik nedeniyle ayrılan işçi kıdem tazminatı alır; ihbar ödenmez.' },
  { id: 'evlilik', label: 'Evlilik', severance: true, notice: false,
    note: 'Kadın işçi, evlendiği tarihten itibaren 1 yıl içinde kendi isteğiyle ayrılırsa kıdem tazminatı alır; ihbar ödenmez.' },
  { id: 'hakli', label: 'Haklı Fesih', severance: true, notice: false,
    note: 'İşçinin İş K. md.24 kapsamında haklı nedenle (ücretin ödenmemesi, mobbing vb.) feshinde kıdem tazminatı ödenir; ihbar ödenmez.' },
];

export const STORAGE_KEYS = {
  history: 'ihp.history.v1',
  settings: 'ihp.settings.v1',
  reminders: 'ihp.reminders.v1',
};

export const DISCLAIMER = 'Bu hesaplama bilgilendirme amaçlı bir tahmindir; resmi bordro veya hukuki görüş yerine geçmez. Kesin tutar için işvereninizin bordrosu, bir avukat ya da ALO 170 ile görüşün.';
