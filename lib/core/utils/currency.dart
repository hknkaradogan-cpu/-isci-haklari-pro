import 'package:intl/intl.dart';

final _money = NumberFormat.currency(locale: 'tr_TR', symbol: '₺', decimalDigits: 2);
String money(double value) => _money.format(value);
