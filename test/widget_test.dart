import 'package:flutter_test/flutter_test.dart';
import 'package:isci_haklari_pro/app.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  testWidgets('Dashboard displays title and calculators', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: IsciHaklariApp()));
    expect(find.text('İşçi Hakları Pro'), findsOneWidget);
    expect(find.text('Kıdem tazminatı'), findsOneWidget);
    expect(find.text('İhbar tazminatı'), findsOneWidget);
  });
}
