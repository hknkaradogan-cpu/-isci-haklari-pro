import 'package:flutter/material.dart';
import '../../core/utils/currency.dart';
import 'calculation_result.dart';

class CalculatorPage extends StatefulWidget {
  const CalculatorPage({super.key, required this.type, required this.title});
  final String type;
  final String title;
  @override
  State<CalculatorPage> createState() => _CalculatorPageState();
}
class _CalculatorPageState extends State<CalculatorPage> {
  final _salary = TextEditingController();
  final _years = TextEditingController(text: '1');
  final _months = TextEditingController(text: '0');
  final _days = TextEditingController(text: '365');
  final _extra = TextEditingController(text: '0');
  final _ceiling = TextEditingController(text: '0');
  CalculationResult? _result;
  double _value(TextEditingController c) => double.tryParse(c.text.trim().replaceAll('.', '').replaceAll(',', '.')) ?? 0;
  @override
  void dispose() { _salary.dispose(); _years.dispose(); _months.dispose(); _days.dispose(); _extra.dispose(); _ceiling.dispose(); super.dispose(); }
  void _calculate() {
    final salary = _value(_salary);
    if (salary <= 0) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Lütfen geçerli bir brüt ücret girin.'))); return; }
    setState(() {
      switch (widget.type) {
        case 'severance': _result = LaborCalculator.severance(monthlyGross: salary, years: _value(_years), months: _value(_months), ceiling: _value(_ceiling)); break;
        case 'notice': _result = LaborCalculator.notice(monthlyGross: salary, serviceDays: _value(_days).round()); break;
        case 'leave': _result = LaborCalculator.annualLeave(monthlyGross: salary, unusedDays: _value(_extra)); break;
        default: _result = LaborCalculator.overtime(monthlyGross: salary, hours: _value(_extra));
      }
    });
  }
  Widget _field(String label, TextEditingController c) => Padding(padding: const EdgeInsets.only(bottom: 12), child: TextField(controller: c, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: InputDecoration(labelText: label, border: const OutlineInputBorder(), prefixIcon: const Icon(Icons.edit_outlined))));
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: Text(widget.title)), body: ListView(padding: const EdgeInsets.all(16), children: [
    _field('Aylık brüt ücret (TL)', _salary),
    if (widget.type == 'severance') ...[_field('Çalışma yılı', _years), _field('Ek ay', _months), _field('Uygulanacak kıdem tavanı (TL) — bilmiyorsanız 0', _ceiling)],
    if (widget.type == 'notice') _field('Toplam hizmet günü', _days),
    if (widget.type == 'leave') _field('Kullanılmayan izin günü', _extra),
    if (widget.type == 'overtime') _field('Fazla çalışma saati', _extra),
    FilledButton.icon(onPressed: _calculate, icon: const Icon(Icons.calculate_outlined), label: const Text('Hesapla')),
    if (_result != null) ...[const SizedBox(height: 18), Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(_result!.title, style: Theme.of(context).textTheme.titleMedium), const SizedBox(height: 8), Text(money(_result!.gross), style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary)), const Divider(height: 24), const Text('Hesaplama notları', style: TextStyle(fontWeight: FontWeight.bold)), const SizedBox(height: 8), ..._result!.notes.map((n) => Padding(padding: const EdgeInsets.only(bottom: 6), child: Text('• $n')))]))),],
    const SizedBox(height: 16), const Text('Önemli: Bu araç yaklaşık brüt tutar gösterir. İş sözleşmesi, ücretin ek unsurları, fesih nedeni, istisnalar ve güncel mevzuat sonucu değiştirebilir. Kesin hak ediş için uzman desteği alın.', style: TextStyle(fontSize: 12, color: Colors.grey)),
  ]));
}
