# İşçi Hakları Pro

Türkçe, çevrimdışı çalışabilen işçilik alacakları hesaplama uygulaması.

## İlk sürüm
- Kıdem tazminatı için yaklaşık brüt hesaplama
- İhbar tazminatı için yaklaşık brüt hesaplama
- Yıllık izin ücreti ve fazla mesai hesaplama
- Temel iş hukuku rehberi

> Bu uygulama hukuki danışmanlık değildir. Hesaplamalar tahminidir; güncel mevzuat, ücret kalemleri, vergi/SGK istisnaları ve somut fesih nedeni sonucu değiştirebilir. Kıdem tazminatı tavanı tarih bazında güncellenmelidir.

## Android APK
GitHub Actions, `main` dalına her push yapıldığında Android APK üretir. APK, Actions > ilgili workflow run > Artifacts bölümünden alınabilir.

## Geliştirme
Flutter stable ve Dart stable gerekir. `flutter pub get`, `flutter analyze`, `flutter test` komutlarını çalıştırın.

Firebase ve AdMob ilk sürümde etkin değildir; uygulama sahibinin hesap ve kimlik bilgileri gerektirir. Gizli anahtarları depoya eklemeyin.
