# Office Reporting System - Apps Script Project

Bu proje, Google Sheets ve Apps Script tabanlı kapsamlı bir ofis raporlama sistemidir.

## Proje Yapısı

### Core Files

- **`main.gs`** - Ana giriş noktası ve sistem başlatma fonksiyonları
- **`config.gs`** - Global konfigürasyon, sabitler ve ayarlar
- **`utils.gs`** - Yardımcı fonksiyonlar, hata yönetimi ve loglama
- **`setup.gs`** - Sistem kurulum ve Master Spreadsheet oluşturma fonksiyonları

### Konfigürasyon

Sistem aşağıdaki ana bileşenleri içerir:

- **Master Spreadsheet**: Merkezi veri deposu (sadece admin erişimi)
- **User Spreadsheets**: Kullanıcı bazlı kişisel spreadsheet'ler
- **Otomatik ID Üretimi**: T-001, ISS-001, P-001 formatında benzersiz ID'ler
- **Email Bildirimleri**: Kritik durumlar için otomatik email gönderimi
- **Haftalık Raporlama**: Otomatik haftalık özet raporları

## İlk Kurulum

### 1. Google Apps Script Projesi Oluşturma

1. [Google Apps Script](https://script.google.com) adresine gidin
2. "Yeni proje" oluşturun
3. Bu repository'deki tüm `.gs` dosyalarını projeye kopyalayın

### 2. Sistem Başlatma

Apps Script editöründe aşağıdaki fonksiyonu çalıştırın:

```javascript
// Tam kurulum (admin ve team üyeleri ile)
initializeSystem(
  ['admin@company.com'],                    // Admin email'leri
  ['user1@company.com', 'user2@company.com'] // Team üye email'leri (opsiyonel)
);

// Veya hızlı kurulum (sadece mevcut kullanıcı admin olarak)
quickSetup();
```

### 3. Sistem Durumu Kontrolü

```javascript
getSystemInfo();  // Sistem bilgilerini gösterir
runSystemTest(); // Sistem testlerini çalıştırır
```

## Sistem Bileşenleri

### Master Spreadsheet Sheets

- **Tasks_Master**: Görev tanımları ve yönetim notları
- **Daily_Report**: Günlük raporlar
- **Weekly_Report**: Haftalık özetler
- **Projects**: Proje takibi
- **Issue_Log**: Sorun kayıtları
- **Dashboard**: KPI'lar ve görselleştirmeler
- **System_Log**: Sistem logları (otomatik oluşturulur)

### User Spreadsheet Sheets

- **Daily_Input**: Günlük veri giriş formu
- **My_Summary**: Kişisel özet ve istatistikler
- **My_Tasks**: Atanmış görevler listesi

## Güvenlik ve Erişim

- **Master Spreadsheet**: Sadece admin kullanıcıları erişebilir
- **User Spreadsheets**: Her kullanıcı sadece kendi spreadsheet'ine erişebilir
- **Admin Notes**: Sadece admin kullanıcıları görebilir
- **Otomatik Koruma**: Drive API ile erişim kontrolü

## Loglama ve Hata Yönetimi

Sistem kapsamlı loglama ve hata yönetimi içerir:

```javascript
Logger.info('Bilgi mesajı');
Logger.warn('Uyarı mesajı');
Logger.error('Hata mesajı', error, context);
Logger.debug('Debug mesajı');
```

- Tüm loglar Master Spreadsheet'teki `System_Log` sheet'inde saklanır
- Kritik hatalar admin'lere email ile bildirilir
- Retry mekanizması ile geçici hataları otomatik çözer

## Yardımcı Fonksiyonlar

### Email Doğrulama
```javascript
isValidEmail('test@example.com'); // true/false
```

### Süre Hesaplama
```javascript
calculateDuration('09:00', '17:00'); // 8.0 (saat)
```

### Tarih Formatlama
```javascript
formatDate(new Date()); // '2024-01-15'
formatTime(new Date()); // '14:30'
```

### Hata Yönetimi ile Fonksiyon Sarma
```javascript
const safeFunction = withErrorHandling(myFunction, 'myFunction');
```

### Retry Mekanizması
```javascript
retryWithBackoff(() => riskyOperation(), 3, 1000);
```

## Geliştirme Notları

### Sonraki Adımlar

Bu Task 1 sadece temel altyapıyı kurar. Sonraki task'lar şunları implement edecek:

- Task 2: Master Spreadsheet detay kurulumu
- Task 3: Conditional formatting
- Task 4: ID üretim sistemi
- Task 5: Kullanıcı yönetimi
- Task 6+: Veri senkronizasyonu, issue yönetimi, raporlama

### Konfigürasyon Değişiklikleri

`config.gs` dosyasındaki `CONFIG` objesini düzenleyerek sistem ayarlarını değiştirebilirsiniz:

- Sheet isimleri
- ID formatları
- Email ayarları
- Renk kodları
- Dropdown değerleri

### Test Fonksiyonları

```javascript
runSystemTest();        // Tüm sistem testlerini çalıştır
getSystemStatus();      // Sistem durumunu kontrol et
showUsageInstructions(); // Kullanım talimatlarını göster
```

## Sorun Giderme

### Yaygın Sorunlar

1. **"Permission denied" hatası**: Admin email'lerini kontrol edin
2. **"Spreadsheet not found"**: Master Spreadsheet ID'sini kontrol edin
3. **Email gönderilmiyor**: Gmail API limitlerini kontrol edin

### Debug Modu

```javascript
Logger.debug('Debug mesajı', { context: 'additional info' });
```

### Sistem Sıfırlama

```javascript
resetSystemConfiguration(); // Sadece admin kullanıcıları
```

## Destek

Sistem loglarını kontrol etmek için Master Spreadsheet'teki `System_Log` sheet'ini inceleyin. Tüm hata ve uyarı mesajları burada saklanır.