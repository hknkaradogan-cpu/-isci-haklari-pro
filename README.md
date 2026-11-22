# İşçi Hakları Pro

Türkiye'deki çalışanlar, İK ve bordro uzmanları için kıdem, ihbar, yıllık izin, fazla mesai, resmi tatil ve hafta tatili hesaplayıcıları; "İşten ayrılırsam ne kadar alırım?" toplam alacak ekranı; çevrimdışı işçi hakları kütüphanesi; asgari ücret arşivi; hesaplama geçmişi, favoriler, PDF raporlar ve hatırlatıcılar.

Tek kod tabanı iki şekilde çalışır:

- **Android uygulaması (APK):** Capacitor ile paketlenir. İnternetsiz çalışır, gerçek telefon bildirimleri gönderir, PDF'i telefona kaydeder ya da WhatsApp/e-posta ile paylaşır.
- **Web sitesi:** Aynı uygulama tek bir `index.html` dosyasıdır. Her tarayıcıda açılır ve "Ana ekrana ekle" ile kurulabilir (PWA).

Veriler Kasım 2026 itibarıyla günceldir: brüt asgari ücret 33.030 TL, Temmuz–Aralık 2026 kıdem tavanı 73.729,87 TL, 2026 ücret gelir vergisi tarifesi, damga vergisi binde 7,59.

---

## 1. APK'yı telefona kurmanın en kolay yolu (bilgisayarda Android Studio gerekmez)

APK, GitHub'ın ücretsiz sunucularında otomatik olarak derlenir.

1. github.com'da ücretsiz bir hesap açın ve **New repository** ile boş bir depo oluşturun (ör. `isci-haklari-pro`). Depo **Public** olursa GitHub Actions dakikaları sınırsızdır.
2. Bu klasördeki tüm dosyaları depoya yükleyin. `.github` klasörü dahil her şey gitmeli. Bilgisayarınızda git varsa:
   ```bash
   git init && git add . && git commit -m "İlk sürüm"
   git branch -M main
   git remote add origin https://github.com/hknkaradogan-cpu/-isci-haklari-pro.git
   git push -u origin main
   ```
3. Yükleme bitince **Actions** sekmesinde "APK ve Web Sitesi Derle" işi başlar. Yaklaşık 5–8 dakika sürer.
4. Bittiğinde telefonunuzdan deponun **Releases** bölümünü açın, `IsciHaklariPro-v1.0.X.apk` dosyasına dokunun ve indirin.
5. İndirilen dosyayı açın. Telefon "Bilinmeyen uygulamaları yükle" izni isterse tarayıcınız için izin verin ve **Yükle**'ye dokunun.

Kodda değişiklik yapıp tekrar yüklediğinizde yeni APK kendiliğinden derlenir. Tüm sürümler aynı anahtarla imzalandığı için eski sürümün üzerine kurulur ve verileriniz korunur.

### Web sitesini yayınlamak (GitHub Pages)
Her derlemede site `gh-pages` dalına yüklenir. Bir kez deponun **Settings → Pages** ayarında **Branch: gh-pages / (root)** seçip kaydedin; site şu adreste yayına girer:
`https://hknkaradogan-cpu.github.io/-isci-haklari-pro/`

---

## 2. Kendi bilgisayarınızda derleme

Gerekenler: Node.js 20+, JDK 21, Android Studio (Android SDK 35).

```bash
npm ci
npm run build          # www/index.html (web sürümü) üretir
npm run android:apk    # android/app/build/outputs/apk/release/app-release.apk
```
Android Studio ile açmak için: `npx cap open android`.

İkonları değiştirmek için `scripts/make-icons.mjs` dosyasını düzenleyip `npm run icons` çalıştırın.

---

## 3. Proje yapısı (özellik tabanlı)

```
src/
  core/                 constants (yasal parametreler), tax (gelir/damga vergisi), dates,
                        storage (geçmiş/favori/ayar/hatırlatıcı depoları), pdf, notifications,
                        platform (Android/web köprüsü), router, theme, format
  shared/               ui (Button, TextField, DatePicker, ResultCard, InfoCard, CalculationCard,
                        SectionHeader, Loading, Dialog, EmptyState, Error), calculator (ortak form
                        iskeleti), icons
  features/
    dashboard/  severance/  notice/  annual_leave/  overtime/  holiday_work/  weekend_work/
    quit_calculator/  rights_library/  min_wage/  reports/  history/  favorites/
    reminders/  settings/
                        Her hesaplayıcıda engine.js (hesap motoru) + page.js (arayüz)
  main.js  index.html  styles.css
scripts/build.mjs       Tek dosyalık web uygulaması + PWA üretir
android/                Capacitor Android projesi
.github/workflows/      Bulutta APK + web sitesi derleme
```

**Yasal rakamları güncellemek:** her Ocak ve Temmuz'da `src/core/constants.js` içindeki `SEVERANCE_CAPS`, `TAX_BRACKETS` ve `MIN_WAGE_2026` değerlerini, ayrıca `src/features/min_wage/data.js` dosyasını güncelleyip GitHub'a yükleyin. Uygulamada Ayarlar → "Kıdem tavanını elle belirle" alanı geçici çözüm olarak kullanılabilir.

### Hesaplama kuralları
| Kalem | Formül | Kesinti |
|---|---|---|
| Kıdem | Giydirilmiş brüt (tavanla sınırlı) × (yıl + ay/12 + gün/365); en az 1 yıl | Yalnızca damga vergisi |
| İhbar | Brüt/30 × (2/4/6/8 hafta × 7) | Gelir vergisi + damga |
| Yıllık izin | Brüt/30 × gün | SGK %15 + gelir vergisi + damga |
| Fazla mesai | Brüt/225 × 1,5 × saat | SGK %15 + gelir vergisi + damga |
| Resmi tatil | Brüt/30 × gün (ek 1 yevmiye) | SGK %15 + gelir vergisi + damga |
| Hafta tatili | Brüt/30 × 1,5 × gün | SGK %15 + gelir vergisi + damga |

Gelir vergisi, ödeme ayına kadar oluşan tahmini kümülatif matraha göre dilimli hesaplanır. Ek ödemelerde asgari ücret istisnası uygulanmaz; bu yüzden sonuç ihtiyatlı bir tahmindir.

---

## 4. Google Play'de yayınlama rehberi

1. **Geliştirici hesabı:** play.google.com/console adresinden 25 $ tek seferlik ücretle hesap açın. Yeni kişisel hesaplarda yayından önce en az 12 test kullanıcısıyla 14 günlük kapalı test zorunludur.
2. **Kendi gizli imza anahtarınızı oluşturun.** Depodaki `ihp-sideload.keystore` herkese açık olduğundan Play Store için kullanılmamalıdır:
   ```bash
   keytool -genkeypair -v -keystore play-upload.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000
   ```
   Bu dosyayı ve şifresini güvenli bir yerde saklayın. `android/app/build.gradle` içindeki `signingConfigs` bölümüne ekleyin; şifreleri koda değil ortam değişkenlerine yazın.
3. **AAB üretin:** `cd android && ./gradlew bundleRelease` → `app/build/outputs/bundle/release/app-release.aab`
4. **Play Console:** Uygulama oluşturun → Mağaza girişi (aşağıdaki metinler) → İçerik derecelendirmesi anketi → Hedef kitle (18+) → Veri güvenliği ("Veri toplanmaz, paylaşılmaz") → Gizlilik politikası URL'si (uygulamadaki metni GitHub Pages'te bir sayfa olarak yayınlayabilirsiniz).
5. **Finans uygulaması beyanı:** "Finans özellikleri" sorusunda kredi veya yatırım hizmeti olmadığını, yalnızca hesaplayıcı olduğunu belirtin.
6. AAB'yi **Kapalı test** kanalına yükleyin; test süresi bitince **Üretim**'e taşıyın.

### Reklam ve analitik (isteğe bağlı)
AdMob ve Firebase, sizin hesaplarınıza ait kimlikler gerektirdiği için bu sürüme eklenmedi. Uygulama şu anda reklamsız ve veri toplamayan bir yapıda. Eklemek isterseniz:
- **AdMob:** admob.google.com'da uygulama ve reklam birimleri oluşturun, `@capacitor-community/admob` eklentisini kurun. Banner'ı yalnızca ana sayfa ve kütüphane altında, geçiş reklamını yalnızca sonuç ekranından ana sayfaya dönerken (en fazla 3 dakikada bir), ödüllü reklamı da "çoklu PDF raporu" gibi isteğe bağlı bir özellikte gösterin. Hesaplama akışını hiçbir zaman reklamla kesmeyin.
- **Firebase Analytics / Crashlytics:** Firebase Console'da Android uygulaması ekleyin (`com.iscihaklari.pro`), `google-services.json` dosyasını `android/app/` içine koyun ve `@capacitor-firebase/analytics` ile `@capacitor-firebase/crashlytics` eklentilerini kurun. Ardından Play Console'daki veri güvenliği beyanını güncelleyin.

---

## 5. Mağaza girişi (Store Listing)

**Uygulama adı (30):** İşçi Hakları Pro: Kıdem Hesapla

**Kısa açıklama (80):** Kıdem, ihbar, yıllık izin ve fazla mesai alacağını saniyeler içinde hesapla.

**Tam açıklama:**
> İşten ayrılmayı mı düşünüyorsunuz, işten mi çıkarıldınız? İşçi Hakları Pro ile alacağınızı brüt maaşınızla saniyeler içinde, 2026 güncel rakamlarıyla hesaplayın.
>
> ★ İşten Ayrılırsam Ne Kadar Alırım? İstifa, işveren feshi, emeklilik, askerlik, evlilik veya haklı fesih: kıdem, ihbar, izin ve fazla mesai alacağınızın toplamı tek ekranda.
> ★ Kıdem tazminatı: yıl, ay, gün bazında; yol, yemek ve ek ödemeler dahil giydirilmiş ücret; güncel tavan ve damga vergisi
> ★ İhbar tazminatı: 2–8 hafta yasal süre otomatik, gelir vergisi ve damga vergisi
> ★ Yıllık izin ücreti, fazla mesai (%50 zamlı), resmi tatil ve hafta tatili çalışması
> ★ İşçi hakları kütüphanesi: kıdem, ihbar, fazla mesai, izin, SGK, mobbing, haklı fesih (internetsiz)
> ★ 2010–2026 asgari ücret arşivi
> ★ Profesyonel PDF rapor: kaydedin veya WhatsApp ve e-postayla paylaşın
> ★ Hesaplama geçmişi, favoriler, emeklilik ve izin hatırlatıcıları
> ★ Karanlık mod, reklamsız ve veri toplamaz; tüm bilgiler telefonunuzda kalır
>
> Hesaplamalar bilgilendirme amaçlıdır ve hukuki danışmanlık yerine geçmez.

**Kategori:** Finans (alternatif: İş). **Etiketler:** Hesap makinesi, Kişisel finans.

**Ekran görüntüsü önerileri (1080×1920, 6 adet):** 1) "İşten ayrılırsam ne kadar alırım?" sonuç ekranı ve büyük net tutar, 2) Ana sayfa kartları, 3) Kıdem detay dökümü, 4) PDF rapor, 5) Haklar kütüphanesi, 6) Karanlık mod. Her görselin üstüne 3–5 kelimelik başlık koyun ("Tazminatını 10 saniyede öğren").

### İkon önerisi
Mavi degrade (#42A5F5 → #1565C0 → #0B3C8A) üzerinde beyaz adalet terazisi. Yazı yok, sade ve 48 px'te de okunur. Play Store için 512×512 PNG: `www/icon-512.png`. Öne çıkan görsel (1024×500): mavi zemin, solda terazi, sağda "Kıdem • İhbar • İzin • Mesai".

---

## 6. Anahtar kelime ve ASO stratejisi

**Birincil (başlık + kısa açıklama):** kıdem tazminatı hesaplama, ihbar tazminatı, işçi hakları, tazminat hesaplama

**İkincil (tam açıklamada 2–3 kez, doğal biçimde):** fazla mesai hesaplama, yıllık izin ücreti, istifa tazminat, işten çıkarılınca ne alırım, emeklilik kıdem tazminatı, haklı fesih, asgari ücret 2026, kıdem tavanı, net maaş, iş kanunu

**Uzun kuyruk:** "istifa edersem tazminat alır mıyım", "askerlik kıdem tazminatı", "evlilik tazminatı kadın", "mobbing nedir", "hafta tatili mesai ücreti"

**Taktikler**
- Ocak ve Temmuz'da (asgari ücret ve kıdem tavanı değişince) uygulamayı güncelleyin ve açıklamada "2026 Temmuz güncel tavan" gibi ifadelerle tazeliği öne çıkarın. Bu dönemlerde aramalar zirve yapar.
- Sürüm notlarına güncel rakamları yazın.
- Uygulama içinden ilk başarılı PDF'ten veya üçüncü hesaplamadan sonra değerlendirme isteyin (Google Play In-App Review). Hesaplama sırasında asla istemeyin.
- Rakip uygulamaların yorumlarındaki şikâyetlere (reklam yoğunluğu, eski rakamlar) yanıt olarak "reklamsız / güncel" vurgusu yapın.
- Web sitesi sürümünü (GitHub Pages) blog yazılarıyla ("Kıdem tazminatı nasıl hesaplanır 2026") destekleyip Play Store bağlantısı verin; organik trafik mağaza sıralamasına da yansır.
- Mağaza girişinde A/B testi (Store listing experiments) ile ikon ve ilk ekran görüntüsünü deneyin.

---

## Yasal not
Hesaplamalar 4857 sayılı İş Kanunu, 1475 s. Kanun md.14, Gelir Vergisi Kanunu ve Damga Vergisi Kanunu esas alınarak yapılan tahminlerdir. Kesin tutar için bordro uzmanına, avukata veya ALO 170'e başvurun.
