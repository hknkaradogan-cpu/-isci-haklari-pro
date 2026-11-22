class CalculationResult {
  const CalculationResult({required this.title, required this.gross, required this.notes});
  final String title;
  final double gross;
  final List<String> notes;
}

class LaborCalculator {
  static CalculationResult severance({required double monthlyGross, required double years, required double months, required double ceiling}) {
    final serviceYears = years + months / 12;
    final eligibleMonthly = ceiling > 0 ? (monthlyGross < ceiling ? monthlyGross : ceiling) : monthlyGross;
    return CalculationResult(title: 'Tahmini kıdem tazminatı (brüt)', gross: eligibleMonthly * serviceYears, notes: ['Her tam hizmet yılı için 30 günlük giydirilmiş brüt ücret varsayılmıştır.', 'Kıdem tazminatı tavanı girilen tutara göre uygulanmıştır.', 'Damga vergisi ve hak kazanma koşulları bu tahmine dahil değildir.']);
  }
  static CalculationResult notice({required double monthlyGross, required int serviceDays}) {
    final weeks = serviceDays < 180 ? 2 : serviceDays < 540 ? 4 : serviceDays < 1080 ? 6 : 8;
    return CalculationResult(title: 'Tahmini ihbar tazminatı (brüt)', gross: monthlyGross / 30 * weeks * 7, notes: ['Hizmet süresine göre yasal ihbar süresi esas alınmıştır.', 'İhbar tazminatı, bildirim süresi kullandırılmadığında gündeme gelir.', 'Olağan istifada işçi kural olarak ihbar tazminatı alamaz.']);
  }
  static CalculationResult annualLeave({required double monthlyGross, required double unusedDays}) => CalculationResult(title: 'Kullanılmamış izin ücreti (brüt)', gross: monthlyGross / 30 * unusedDays, notes: ['İş sözleşmesi sona erdiğinde kullanılmayan yıllık izin günleri ücrete dönüşebilir.', 'Vergi ve kesintiler bu brüt tahmine dahil değildir.']);
  static CalculationResult overtime({required double monthlyGross, required double hours}) => CalculationResult(title: 'Fazla çalışma ücreti (brüt)', gross: monthlyGross / 225 * 1.5 * hours, notes: ['Saatlik ücret yaklaşık olarak aylık brüt ücret / 225 alınmıştır.', 'Denkleştirme, çalışma düzeni ve yasal sınırlar ayrıca değerlendirilmelidir.']);
}
