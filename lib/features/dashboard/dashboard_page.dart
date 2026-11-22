import 'package:flutter/material.dart';
import '../calculators/calculator_page.dart';
import '../rights/rights_page.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});
  static const items = <({String title, String subtitle, IconData icon, String type})>[
    (title: 'Kıdem tazminatı', subtitle: 'Çalışma süresine göre', icon: Icons.account_balance_wallet_outlined, type: 'severance'),
    (title: 'İhbar tazminatı', subtitle: 'Bildirim süresine göre', icon: Icons.notifications_active_outlined, type: 'notice'),
    (title: 'Yıllık izin ücreti', subtitle: 'Kullanılmayan izinler', icon: Icons.beach_access_outlined, type: 'leave'),
    (title: 'Fazla mesai', subtitle: 'Saatlik ücret hesabı', icon: Icons.more_time, type: 'overtime'),
  ];
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('İşçi Hakları Pro'), actions: [IconButton(tooltip: 'Haklar rehberi', onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RightsPage())), icon: const Icon(Icons.menu_book_outlined))]), body: SafeArea(child: ListView(padding: const EdgeInsets.all(16), children: [
    Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF145C50), Color(0xFF248875)]), borderRadius: BorderRadius.circular(22)), child: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Haklarını öğren,\nalacağını hesapla.', style: TextStyle(color: Colors.white, fontSize: 25, fontWeight: FontWeight.bold)), SizedBox(height: 8), Text('Pratik hesaplama araçları ve temel iş hukuku rehberi', style: TextStyle(color: Colors.white70))])),
    const SizedBox(height: 22), const Text('Hesaplama araçları', style: TextStyle(fontSize: 19, fontWeight: FontWeight.bold)), const SizedBox(height: 10),
    GridView.builder(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), itemCount: items.length, gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 1.15), itemBuilder: (context, i) { final item = items[i]; return Card(child: InkWell(borderRadius: BorderRadius.circular(18), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CalculatorPage(type: item.type, title: item.title))), child: Padding(padding: const EdgeInsets.all(15), child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Icon(item.icon, size: 30, color: Theme.of(context).colorScheme.primary), Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(item.title, style: const TextStyle(fontWeight: FontWeight.bold)), Text(item.subtitle, style: Theme.of(context).textTheme.bodySmall)])])))); }),
    const SizedBox(height: 14), Card(child: ListTile(leading: const Icon(Icons.menu_book_outlined), title: const Text('İşçi hakları rehberi'), subtitle: const Text('Temel haklar ve önemli notlar'), trailing: const Icon(Icons.chevron_right), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RightsPage())))),
    const Padding(padding: EdgeInsets.only(top: 18), child: Text('Bilgilendirme: Sonuçlar yaklaşık brüt tutarlardır; hukuki danışmanlık yerine geçmez.', style: TextStyle(fontSize: 12, color: Colors.grey))),
  ])));
}
