# 🚀 Production Deployment - Task Listesi

## Genel Bakış
Bu dosya, sistemi production'a almak için gereken tüm task'ları içerir.
Her task'ın durumu, kim tarafından yapılacağı ve detaylı adımları belirtilmiştir.

---

## 📊 Task Durumu Özeti

- ✅ **Tamamlandı:** 5 task
- 🤖 **Kiro Yapabilir:** 1 task
- 👤 **Kullanıcı Yapmalı:** 7 task
- **Toplam:** 13 task

---

## Task Listesi

### ✅ TASK 1: Kod Hazırlığı ve Test
**Durum:** ✅ TAMAMLANDI  
**Yapan:** Kiro AI  
**Süre:** Tamamlandı

**Yapılanlar:**
- [x] Tüm testler çalıştırıldı ve geçti
- [x] Frontend build başarılı
- [x] Backend build başarılı
- [x] TypeScript hataları düzeltildi
- [x] UUID paketi eklendi

---

### ✅ TASK 2: Dokümantasyon Hazırlığı
**Durum:** ✅ TAMAMLANDI  
**Yapan:** Kiro AI  
**Süre:** Tamamlandı

**Yapılanlar:**
- [x] Production Readiness Report oluşturuldu
- [x] Production Deployment Guide hazırlandı
- [x] Quick Deploy Commands dokümante edildi
- [x] Adım adım yapılacaklar listesi oluşturuldu

---

### ✅ TASK 3: Git Commit
**Durum:** ✅ TAMAMLANDI  
**Yapan:** Kiro AI  
**Süre:** Tamamlandı

**Yapılanlar:**
- [x] Tüm değişiklikler git'e eklendi
- [x] Commit mesajı ile kaydedildi
- [x] 46 dosya commit edildi

---


### 🤖 TASK 4: Git Push (Kiro Yapabilir - Ama Credentials Gerekli)
**Durum:** ⏳ BEKLİYOR  
**Yapan:** Kullanıcı (Manuel)  
**Süre:** 2 dakika  
**Öncelik:** YÜKSEK

**Neden Kullanıcı Yapmalı:**
- GitHub credentials gerekli (username/password veya token)
- SSH key veya personal access token gerekebilir
- 2FA aktifse authentication gerekli

**Yapılacaklar:**

```powershell
# 1. Proje dizinine git
cd "C:\Users\user\Desktop\Rapor Sistemi"

# 2. Remote kontrol et
git remote -v

# 3. Push et
git push origin main
```

**Eğer Hata Alırsan:**

**Hata: "remote origin does not exist"**
```powershell
# GitHub'da yeni repository oluştur, sonra:
git remote add origin https://github.com/KULLANICI_ADINIZ/modern-office-system.git
git push -u origin main
```

**Hata: "Authentication failed"**
```powershell
# Personal Access Token kullan
# GitHub > Settings > Developer settings > Personal access tokens > Generate new token
# Token'ı şifre olarak kullan
```

**Başarı Kontrolü:**
- GitHub repository'de yeni commit görünmeli
- Tüm dosyalar online olmalı

---


### 👤 TASK 5: Supabase Database Kurulumu
**Durum:** ⏳ BEKLİYOR  
**Yapan:** Kullanıcı (Web Arayüzü)  
**Süre:** 5 dakika  
**Öncelik:** YÜKSEK

**Neden Kullanıcı Yapmalı:**
- Web arayüzünde login gerekli
- Kredi kartı bilgisi istenebilir (free tier için bile)
- Email verification gerekli

**Adım Adım:**

**5.1. Supabase Hesabı Oluştur**
1. https://supabase.com adresine git
2. "Start your project" veya "Sign In" tıkla
3. GitHub ile giriş yap (önerilir)
4. Email'ini verify et

**5.2. Yeni Proje Oluştur**
1. Dashboard'da "New Project" tıkla
2. Organization seç veya oluştur
3. Proje bilgilerini doldur:
   ```
   Name: modern-office-system
   Database Password: [GÜÇLÜ BİR ŞİFRE - KAYDET!]
   Region: Europe West (Ireland)
   Pricing Plan: Free
   ```
4. "Create new project" tıkla
5. 1-2 dakika bekle (proje oluşturuluyor)

**5.3. Database Schema Oluştur**
1. Sol menüden "SQL Editor" tıkla
2. "New query" tıkla
3. Dosya aç: `backend/supabase/migrations/001_initial_schema.sql`
4. İçeriği kopyala ve SQL Editor'e yapıştır
5. "Run" (yeşil play) butonuna tıkla
6. Başarı mesajı görmelisin: "Success. No rows returned"

7. Aynı işlemi tekrarla: `002_row_level_security.sql`
8. Run tıkla
9. Başarı mesajı görmelisin

**5.4. API Keys'i Kaydet**
1. Sol menüden "Settings" > "API" tıkla
2. Şu bilgileri bir text dosyasına KAYDET:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**ÖNEMLİ:** Bu bilgileri güvenli bir yerde sakla!

**Başarı Kontrolü:**
- Table Editor'de tablolar görünmeli: profiles, tasks, issues, activity_log
- RLS policies aktif olmalı

---


### 👤 TASK 6: Vercel Frontend Deployment
**Durum:** ⏳ BEKLİYOR  
**Yapan:** Kullanıcı (Web Arayüzü)  
**Süre:** 5 dakika  
**Öncelik:** YÜKSEK

**Neden Kullanıcı Yapmalı:**
- Web arayüzünde login gerekli
- GitHub repository erişimi için authorization gerekli
- Environment variables manuel girilmeli

**Adım Adım:**

**6.1. Vercel Hesabı Oluştur**
1. https://vercel.com adresine git
2. "Sign Up" tıkla
3. "Continue with GitHub" seç (önerilir)
4. GitHub'da Vercel'e yetki ver

**6.2. Projeyi Import Et**
1. Vercel Dashboard'da "Add New" > "Project" tıkla
2. GitHub repository'ni bul ve seç
3. "Import" butonuna tıkla

**6.3. Build Settings Yapılandır**
1. Framework Preset: **Vite** (otomatik seçilmeli)
2. Root Directory: **frontend** (Browse ile seç)
3. Build Command: `npm run build` (otomatik)
4. Output Directory: `dist` (otomatik)
5. Install Command: `npm ci` (otomatik)

**6.4. Environment Variables Ekle**
1. "Environment Variables" bölümünü aç
2. Şu değişkenleri ekle:

```
Name: VITE_SUPABASE_URL
Value: https://xxxxxxxxxxxxx.supabase.co
(Supabase'den aldığın Project URL)

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(Supabase'den aldığın anon public key)

Name: VITE_API_URL
Value: BACKEND_URL_BURAYA_GELECEK
(Şimdilik boş bırak veya placeholder yaz, Task 7'den sonra güncelleyeceğiz)
```

**6.5. Deploy Et**
1. "Deploy" butonuna tıkla
2. Build log'larını izle (2-3 dakika)
3. "Congratulations!" mesajını gör
4. Production URL'i KAYDET: `https://your-app-name.vercel.app`

**Başarı Kontrolü:**
- Vercel URL'i açılmalı
- Loading screen görünmeli (backend henüz yok)
- Console'da backend connection error normal (henüz backend deploy etmedik)

---


### 👤 TASK 7: Railway Backend Deployment
**Durum:** ⏳ BEKLİYOR  
**Yapan:** Kullanıcı (Web Arayüzü)  
**Süre:** 5 dakika  
**Öncelik:** YÜKSEK

**Neden Kullanıcı Yapmalı:**
- Web arayüzünde login gerekli
- GitHub repository erişimi için authorization gerekli
- Environment variables manuel girilmeli

**Adım Adım:**

**7.1. Railway Hesabı Oluştur**
1. https://railway.app adresine git
2. "Login" veya "Start a New Project" tıkla
3. "Login with GitHub" seç
4. GitHub'da Railway'e yetki ver

**7.2. Yeni Proje Oluştur**
1. Dashboard'da "New Project" tıkla
2. "Deploy from GitHub repo" seç
3. Repository'ni bul ve seç
4. "Deploy Now" tıkla
5. Deployment başlayacak (ilk deploy 2-3 dakika sürer)

**7.3. Service Settings Yapılandır**
1. Deploy edilen service'e tıkla
2. "Settings" sekmesine git
3. Şu ayarları yap:
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`
   - **Build Command:** `npm run build` (otomatik olmalı)

**7.4. Environment Variables Ekle**
1. "Variables" sekmesine git
2. "New Variable" ile tek tek ekle:

```
NODE_ENV = production
PORT = 3000

SUPABASE_URL = https://xxxxxxxxxxxxx.supabase.co
(Supabase'den aldığın Project URL)

SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(Supabase'den aldığın service_role key - ANON KEY DEĞİL!)

GMAIL_USER = your-email@gmail.com
(Gmail adresin)

GMAIL_APP_PASSWORD = xxxx xxxx xxxx xxxx
(Task 8'de oluşturacağız, şimdilik boş bırak)

FRONTEND_URL = https://your-app-name.vercel.app
(Task 6'da aldığın Vercel URL)

JWT_SECRET = super-secret-random-key-12345
(Rastgele güçlü bir şifre oluştur)
```

**7.5. Domain Oluştur**
1. "Settings" > "Networking" bölümüne git
2. "Generate Domain" butonuna tıkla
3. Domain oluşturulacak: `https://your-backend.railway.app`
4. Bu URL'i KAYDET!

**7.6. Redeploy Et**
1. "Deployments" sekmesine git
2. En son deployment'a tıkla
3. "Redeploy" tıkla (environment variables'ı yüklemek için)

**Başarı Kontrolü:**
```powershell
# PowerShell'de test et:
Invoke-WebRequest -Uri "https://your-backend.railway.app/health"
```

Başarılı response görmelisin (database ve email status'ü olacak)

---


### 👤 TASK 8: Gmail App Password Oluştur
**Durum:** ⏳ BEKLİYOR  
**Yapan:** Kullanıcı (Google Account)  
**Süre:** 3 dakika  
**Öncelik:** ORTA

**Neden Kullanıcı Yapmalı:**
- Google Account login gerekli
- 2-Factor Authentication kurulumu gerekli
- Güvenlik doğrulaması gerekebilir

**Adım Adım:**

**8.1. 2-Step Verification Aktif Et**
1. https://myaccount.google.com adresine git
2. Sol menüden "Security" tıkla
3. "2-Step Verification" bölümünü bul
4. Eğer aktif değilse, "Get Started" tıkla
5. Telefon numaranı ekle ve doğrula
6. 2-Step Verification'ı aktif et

**8.2. App Password Oluştur**
1. Security sayfasında "App passwords" bölümünü bul
2. "App passwords" tıkla (şifre isteyebilir)
3. "Select app" dropdown'dan "Mail" seç
4. "Select device" dropdown'dan "Other (Custom name)" seç
5. İsim gir: "Modern Office System"
6. "Generate" butonuna tıkla
7. 16 haneli şifre görünecek: `xxxx xxxx xxxx xxxx`
8. Bu şifreyi KAYDET! (bir daha göremezsin)

**8.3. Railway'de Environment Variable Güncelle**
1. Railway Dashboard'a dön
2. Service > "Variables" sekmesi
3. `GMAIL_APP_PASSWORD` değişkenini bul
4. 16 haneli şifreyi yapıştır (BOŞLUKSUZ: `xxxxxxxxxxxxxxxx`)
5. Save tıkla
6. Service otomatik redeploy olacak

**Başarı Kontrolü:**
```powershell
# Email service status kontrol et:
Invoke-WebRequest -Uri "https://your-backend.railway.app/api/monitoring/email"
```

Response'da `"status": "ok"` görmelisin

---


### 👤 TASK 9: Frontend Backend URL Güncelleme
**Durum:** ⏳ BEKLİYOR  
**Yapan:** Kullanıcı (Vercel Dashboard)  
**Süre:** 2 dakika  
**Öncelik:** YÜKSEK

**Neden Kullanıcı Yapmalı:**
- Vercel dashboard'da login gerekli
- Environment variable güncelleme yetkisi gerekli

**Adım Adım:**

**9.1. Vercel'de Environment Variable Güncelle**
1. https://vercel.com/dashboard adresine git
2. Project'ini seç
3. "Settings" sekmesine git
4. Sol menüden "Environment Variables" seç
5. `VITE_API_URL` değişkenini bul
6. "Edit" tıkla
7. Value'yu güncelle: `https://your-backend.railway.app`
   (Task 7'de aldığın Railway URL)
8. "Save" tıkla

**9.2. Redeploy Tetikle**
1. "Deployments" sekmesine git
2. En son deployment'ın yanındaki "..." menüsüne tıkla
3. "Redeploy" seç
4. "Redeploy" butonuna tıkla
5. 2-3 dakika bekle

**Başarı Kontrolü:**
1. Frontend URL'i aç: `https://your-app-name.vercel.app`
2. Login sayfası düzgün yüklenmeli
3. Console'da (F12) backend connection error olmamalı
4. Register sayfası çalışmalı

---


### 👤 TASK 10: İlk Admin Kullanıcı Oluştur
**Durum:** ⏳ BEKLİYOR  
**Yapan:** Kullanıcı (Frontend + Supabase)  
**Süre:** 3 dakika  
**Öncelik:** YÜKSEK

**Neden Kullanıcı Yapmalı:**
- Frontend'de register işlemi gerekli
- Supabase'de manuel role değişikliği gerekli

**Adım Adım:**

**10.1. Frontend'de Register Ol**
1. Frontend URL'i aç: `https://your-app-name.vercel.app`
2. "Register" linkine tıkla
3. Formu doldur:
   ```
   Email: admin@yourcompany.com
   Password: [Güçlü bir şifre - KAYDET!]
   Full Name: Admin User
   Department: Management (opsiyonel)
   ```
4. "Register" butonuna tıkla
5. Başarılı mesaj görmelisin
6. Otomatik login olacaksın

**10.2. Supabase'de Admin Yetkisi Ver**
1. Supabase Dashboard'a git
2. "Table Editor" tıkla
3. "profiles" tablosunu seç
4. Yeni oluşturduğun kullanıcıyı bul (email'e göre)
5. `role` kolonuna tıkla
6. Değeri `employee`'den `admin`'e değiştir
7. Enter'a bas veya başka yere tıkla (otomatik kaydedilir)

**10.3. Frontend'de Logout ve Login**
1. Frontend'de sağ üst köşeden "Logout" tıkla
2. Tekrar "Login" tıkla
3. Admin email ve şifrenle login ol
4. Artık admin dashboard'u görmelisin!

**Başarı Kontrolü:**
- Dashboard'da "Admin" menüsü görünmeli
- "Admin Issues" sayfasına erişebilmelisin
- "Users" yönetimi görünmeli

---


### 👤 TASK 11: Production Test
**Durum:** ⏳ BEKLİYOR  
**Yapan:** Kullanıcı (Manuel Test)  
**Süre:** 10 dakika  
**Öncelik:** YÜKSEK

**Neden Kullanıcı Yapmalı:**
- Manuel UI testi gerekli
- Gerçek kullanıcı senaryoları test edilmeli
- Email testi için gerçek email gerekli

**Test Senaryoları:**

**11.1. Backend Health Check**
```powershell
# PowerShell'de çalıştır:
Invoke-WebRequest -Uri "https://your-backend.railway.app/health" | Select-Object -Expand Content
```

**Beklenen Sonuç:**
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "ok" },
    "email": { "status": "ok" },
    "memory": { "status": "ok" },
    "uptime": { "status": "ok" }
  }
}
```

**11.2. Authentication Test**
1. Frontend'de logout ol
2. Yanlış şifre ile login dene → Hata mesajı görmeli
3. Doğru şifre ile login ol → Başarılı olmalı
4. Dashboard yüklenmeli

**11.3. Task Management Test**
1. "Tasks" sayfasına git
2. "New Task" butonuna tıkla
3. Yeni task oluştur:
   ```
   Title: Test Task
   Description: Production test task
   Category: One Time
   Priority: Medium
   Assigned To: Kendini seç
   ```
4. "Create" tıkla
5. Task listesinde görünmeli

**11.4. Issue Management Test**
1. "Issues" sayfasına git
2. "Report Issue" butonuna tıkla
3. Yeni issue oluştur:
   ```
   Title: Test Issue
   Description: Production test issue
   Priority: Low
   Suggested Assignee: Kendini seç
   ```
4. "Submit" tıkla
5. Issue listesinde görünmeli

**11.5. Admin Workflow Test**
1. "Admin" > "Issues" sayfasına git
2. Pending issue'yu gör
3. "Assign" butonuna tıkla
4. Kendine ata
5. Task'a dönüştürüldüğünü gör

**11.6. Email Test**
1. Task 11.5'teki issue assignment'tan sonra
2. Email kutunu kontrol et
3. "New Task Assigned" email'i gelmiş olmalı
4. Email içindeki link'e tıkla
5. Task detay sayfası açılmalı

**11.7. Dashboard Test**
1. "Dashboard" sayfasına git
2. Metrics görünmeli (task count, completion rate, etc.)
3. Charts yüklenmeli
4. Recent activity listesi olmalı

**11.8. PWA Test (Opsiyonel)**
1. Chrome'da frontend URL'i aç
2. F12 > Application sekmesi
3. Service Workers aktif olmalı
4. Manifest doğru olmalı
5. "Install" prompt görünebilir

**Başarı Kriterleri:**
- [ ] Tüm sayfalar yükleniyor
- [ ] Authentication çalışıyor
- [ ] Task CRUD işlemleri çalışıyor
- [ ] Issue workflow çalışıyor
- [ ] Email gönderimi çalışıyor
- [ ] Dashboard metrics görünüyor
- [ ] Hiçbir console error yok

---


### 👤 TASK 12: CI/CD Pipeline Kurulumu (Opsiyonel)
**Durum:** ⏳ BEKLİYOR  
**Yapan:** Kullanıcı (GitHub Secrets)  
**Süre:** 5 dakika  
**Öncelik:** DÜŞÜK

**Neden Kullanıcı Yapmalı:**
- GitHub repository settings erişimi gerekli
- Vercel ve Railway token'ları gerekli

**Adım Adım:**

**12.1. Vercel Token Al**
1. Vercel Dashboard > Settings > Tokens
2. "Create Token" tıkla
3. Name: "GitHub Actions"
4. Scope: Full Account
5. "Create" tıkla
6. Token'ı KAYDET (bir daha göremezsin)

**12.2. Railway Token Al**
1. Railway Dashboard > Account Settings > Tokens
2. "Create Token" tıkla
3. Name: "GitHub Actions"
4. "Create" tıkla
5. Token'ı KAYDET

**12.3. GitHub Secrets Ekle**
1. GitHub repository'ne git
2. Settings > Secrets and variables > Actions
3. "New repository secret" tıkla
4. Şu secret'ları ekle:

```
VERCEL_TOKEN = [Vercel token]
VERCEL_ORG_ID = [Vercel dashboard > Settings > General > Team ID]
VERCEL_PROJECT_ID = [Vercel project > Settings > General > Project ID]
RAILWAY_TOKEN = [Railway token]
BACKEND_URL = https://your-backend.railway.app
FRONTEND_URL = https://your-app-name.vercel.app
```

**12.4. CI/CD Test**
1. Küçük bir değişiklik yap (örn: README.md)
2. Commit ve push et
3. GitHub > Actions sekmesine git
4. Workflow'un çalıştığını gör
5. Başarılı olduğunu doğrula

**Başarı Kontrolü:**
- GitHub Actions'da yeşil check mark
- Vercel'de otomatik deployment
- Railway'de otomatik deployment

---


### ✅ TASK 13: Go-Live ve Dokümantasyon
**Durum:** ⏳ BEKLİYOR  
**Yapan:** Kullanıcı  
**Süre:** 10 dakika  
**Öncelik:** ORTA

**Yapılacaklar:**

**13.1. Production URL'leri Kaydet**
Bir dokümana kaydet:
```
Frontend: https://your-app-name.vercel.app
Backend: https://your-backend.railway.app
Database: https://app.supabase.com/project/xxxxx
Admin Email: admin@yourcompany.com
Admin Password: [şifren]
```

**13.2. Ekip Üyelerini Davet Et**
1. Ekip üyelerine frontend URL'i gönder
2. Register olmalarını söyle
3. Gerekirse admin yetkisi ver (Supabase'de)

**13.3. Kullanıcı Eğitimi Planla**
- Admin eğitimi: 2-3 saat
- Çalışan eğitimi: 1 saat
- Dokümantasyon paylaş: USER_MANUAL.md

**13.4. Monitoring Kur**
1. Günlük health check: `https://your-backend.railway.app/health`
2. Haftalık metrics review: `https://your-backend.railway.app/api/monitoring/metrics`
3. Vercel Analytics aktif et (Settings > Analytics)
4. Railway Metrics izle (Dashboard > Metrics)

**13.5. Backup Stratejisi**
- Supabase otomatik backup yapıyor (free tier: 7 gün)
- Önemli: Database password'ü güvenli yerde sakla
- Haftalık manuel backup önerilir (Supabase > Database > Backups)

**Başarı Kriterleri:**
- [ ] Tüm URL'ler kaydedildi
- [ ] En az 1 test kullanıcı oluşturuldu
- [ ] Monitoring kuruldu
- [ ] Backup stratejisi belirlendi
- [ ] Ekip bilgilendirildi

---

## 🎉 TAMAMLANDI!

Tüm task'lar tamamlandığında sisteminiz production'da olacak!

### 📊 Final Checklist

- [ ] Task 1: Kod Hazırlığı ✅
- [ ] Task 2: Dokümantasyon ✅
- [ ] Task 3: Git Commit ✅
- [ ] Task 4: Git Push
- [ ] Task 5: Supabase Kurulumu
- [ ] Task 6: Vercel Deployment
- [ ] Task 7: Railway Deployment
- [ ] Task 8: Gmail Setup
- [ ] Task 9: Frontend URL Güncelleme
- [ ] Task 10: Admin Kullanıcı
- [ ] Task 11: Production Test
- [ ] Task 12: CI/CD (Opsiyonel)
- [ ] Task 13: Go-Live

### 🎯 Sonraki Adımlar

1. Bu dosyayı yazdır veya ikinci ekranda aç
2. Task 4'ten başla (Git Push)
3. Her task'ı sırayla tamamla
4. Checkbox'ları işaretle
5. Sorun yaşarsan ilgili task'ın "Başarı Kontrolü" bölümüne bak

### 💰 Maliyet Özeti

- Vercel: $0/ay (Free tier)
- Railway: $0/ay (Free tier - 500 saat/ay)
- Supabase: $0/ay (Free tier - 500MB DB)
- GitHub Actions: $0/ay (Free tier - 2000 dakika/ay)
- Gmail SMTP: $0/ay (Free)

**Toplam: $0/ay** 🎉

---

**Hazırlayan:** Kiro AI Assistant  
**Tarih:** 30 Ocak 2026  
**Versiyon:** 1.0

**Not:** Bu task listesi, sistemi sıfırdan production'a almak için gereken tüm adımları içerir. Her task bağımsız olarak tamamlanabilir, ancak sıralı takip edilmesi önerilir.
