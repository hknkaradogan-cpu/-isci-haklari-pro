import 'package:flutter/material.dart';

class RightsPage extends StatelessWidget {
  const RightsPage({super.key});
  static const entries = <(String, String)>[
    ('Ücretin ödenmesi', 'Ücret en geç ayda bir ödenir. İş sözleşmesi veya toplu iş sözleşmesiyle ödeme aralığı kısaltılabilir.'),
    ('Fazla çalışma', 'Genel kural olarak haftalık 45 saati aşan çalışmalar fazla çalışma sayılır. Her saat fazla çalışma için normal saatlik ücret yüzde 50 zamlı ödenir. Denkleştirme ve özel çalışma düzenleri ayrıca değerlendirilir.'),
    ('Yıllık ücretli izin', 'Bir yıllık çalışma süresini tamamlayan işçi, kanundaki koşullarla yıllık ücretli izne hak kazanır. Kullanılmayan izin ücreti iş sözleşmesi sona erdiğinde son ücret üzerinden ödenir.'),
    ('Hafta tatili', 'İşçiye yedi günlük zaman diliminde kesintisiz en az 24 saat hafta tatili verilmesi esastır. Çalışma yapılması halinde ücretlendirme somut çalışma düzenine göre değerlendirilir.'),
    ('Ulusal bayram ve genel tatil', 'Ulusal bayram ve genel tatil günlerinde çalışılmaması halinde o günün ücreti tam ödenir; çalışılması halinde ayrıca bir günlük ücret ödenmesi esastır.'),
    ('Kıdem tazminatı', 'Kıdem tazminatı için genel olarak en az bir yıllık kıdem ve kanunda sayılan sona erme koşullarından biri gerekir. Her istifa kıdem tazminatı hakkı vermez; istisnalar vardır.'),
    ('İhbar süresi', 'Belirsiz süreli sözleşmelerde kıdeme göre 2, 4, 6 veya 8 haftalık bildirim süreleri uygulanır. Bildirim şartına uymayan taraf ihbar tazminatıyla karşılaşabilir; kanuni istisnalar saklıdır.'),
  ];
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('İşçi hakları rehberi')), body: ListView(padding: const EdgeInsets.all(16), children: [const Text('Türkiye İş Kanunu hakkında temel bilgiler', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)), const SizedBox(height: 8), ...entries.map((e) => Card(child: ExpansionTile(title: Text(e.$1, style: const TextStyle(fontWeight: FontWeight.w600)), childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16), children: [Text(e.$2)]))), const SizedBox(height: 12), const Text('Bu özet genel bilgilendirme içindir. İş Kanunu, ilgili yönetmelikler, sözleşmeler ve güncel yargı kararları birlikte değerlendirilmelidir.', style: TextStyle(fontSize: 12, color: Colors.grey))]));
}
