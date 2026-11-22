import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get light => _build(Brightness.light);
  static ThemeData get dark => _build(Brightness.dark);
  static ThemeData _build(Brightness brightness) {
    final scheme = ColorScheme.fromSeed(seedColor: const Color(0xFF176B5B), brightness: brightness);
    return ThemeData(useMaterial3: true, colorScheme: scheme, scaffoldBackgroundColor: brightness == Brightness.light ? const Color(0xFFF5F7F6) : null, appBarTheme: const AppBarTheme(centerTitle: false), cardTheme: CardThemeData(elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18))));
  }
}
