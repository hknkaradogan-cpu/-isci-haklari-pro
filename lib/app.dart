import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'features/dashboard/dashboard_page.dart';

class IsciHaklariApp extends StatelessWidget {
  const IsciHaklariApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(title: 'İşçi Hakları Pro', debugShowCheckedModeBanner: false, theme: AppTheme.light, darkTheme: AppTheme.dark, themeMode: ThemeMode.system, home: const DashboardPage());
}
