# 🚀 Production Deployment Guide
## Modern Office System - Online Deployment

Bu rehber, sistemi tamamen online production ortamına almak için gereken tüm adımları içerir.

---

## 📋 Ön Hazırlık Kontrol Listesi

### ✅ Tamamlanması Gerekenler:
- [x] Tüm testler geçiyor
- [x] Frontend build başarılı
- [x] Backend build başarılı
- [x] Dokümantasyon hazır
- [ ] Git repository hazır
- [ ] Supabase projesi oluşturuldu
- [ ] Vercel hesabı hazır
- [ ] Railway hesabı hazır

---

## 🔧 ADIM 1: Git Repository Hazırlığı

### 1.1 Değişiklikleri Commit Et

```bash
# Proje dizinine git
cd "C:\Users\user\Desktop\Rapor Sistemi"

# Tüm değişiklikleri ekle
git add .

# Commit yap
git commit -m "Production ready: All tests passing, builds successful, documentation complete"

# GitHub'a push et
git push origin main
```

**Not:** Eğer henüz GitHub repository'niz yoksa:

```bash
# GitHub'da yeni repository oluştur (web arayüzünden)
# Sonra local'de:
git remote add origin https://github.com/KULLANICI_ADINIZ/modern-office-system.git
git branch -M main
git push -u origin main
```

---

## 🗄️ ADIM 2: Supabase Database Kurulumu

### 2.1 Supabase Projesi Oluştur

1. **Supabase'e Git:** https://supabase.com
2. **Sign In / Sign Up** yap
3. **New Project** butonuna tıkla
4. Proje bilgilerini gir:
   - **Name:** modern-office-system
   - **Database Password:** Güçlü bir şifre oluştur (kaydet!)
   - **Region:** Europe West (Ireland) veya size yakın
   - **Pricing Plan:** Free

### 2.2 Database Schema Oluştur

1. Supabase Dashboard'da **SQL Editor**'e git
2. `backend/supabase/migrations/001_initial_schema.sql` dosyasını aç
3. İçeriği kopyala ve SQL Editor'e yapıştır
4. **Run** butonuna tıkla

5. Aynı şekilde `002_row_level_security.sql` dosyasını çalıştır

### 2.3 Environment Variables'ı Kaydet

Supabase Dashboard'da **Settings > API** bölümünden:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc... (Service Role Key)
```

**ÖNEMLİ:** Bu bilgileri güvenli bir yere kaydet!

---

## 🎨 ADIM 3: Frontend Deployment (Vercel)

### 3.1 Vercel Hesabı Oluştur

1. **Vercel'e Git:** https://vercel.com
2. **Sign Up** yap (GitHub ile giriş önerilir)
3. GitHub hesabınızı bağlayın

### 3.2 Projeyi Import Et

1. Vercel Dashboard'da **Add New > Project**
2. GitHub repository'nizi seçin
3. **Import** butonuna tıklayın

### 3.3 Build Settings Yapılandır

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
```

### 3.4 Environment Variables Ekle

**Environment Variables** bölümünde:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=https://your-backend.railway.app
```

**Not:** Backend URL'i henüz bilmiyorsanız, önce backend'i deploy edin, sonra buraya ekleyin.

### 3.5 Deploy Et

1. **Deploy** butonuna tıklayın
2. Build tamamlanana kadar bekleyin (~2-3 dakika)
3. Deploy URL'inizi kaydedin: `https://your-app.vercel.app`

---

## ⚙️ ADIM 4: Backend Deployment (Railway)

### 4.1 Railway Hesabı Oluştur

1. **Railway'e Git:** https://railway.app
2. **Sign Up** yap (GitHub ile giriş önerilir)
3. GitHub hesabınızı bağlayın

### 4.2 Yeni Proje Oluştur

1. Railway Dashboard'da **New Project**
2. **Deploy from GitHub repo** seçin
3. Repository'nizi seçin
4. **Deploy Now** tıklayın

### 4.3 Service Settings

1. Deploy edilen service'e tıklayın
2. **Settings** sekmesine gidin
3. **Root Directory:** `backend` olarak ayarlayın
4. **Start Command:** `npm start` olarak ayarlayın

### 4.4 Environment Variables Ekle

**Variables** sekmesinde:

```
NODE_ENV=production
PORT=3000

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...

# Email (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Frontend URL (CORS için)
FRONTEND_URL=https://your-app.vercel.app

# JWT Secret
JWT_SECRET=your-super-secret-key-here
```

### 4.5 Domain Ayarla

1. **Settings > Networking** bölümüne git
2. **Generate Domain** butonuna tıkla
3. Domain'i kaydet: `https://your-backend.railway.app`

### 4.6 Frontend'i Güncelle

Vercel'e geri dön ve `VITE_API_URL` değişkenini güncelle:

```
VITE_API_URL=https://your-backend.railway.app
```

Vercel otomatik olarak yeniden deploy edecek.

---

## 📧 ADIM 5: Email Service Kurulumu (Gmail)

### 5.1 Gmail App Password Oluştur

1. Google Account'a git: https://myaccount.google.com
2. **Security** > **2-Step Verification** aktif et
3. **App passwords** bölümüne git
4. **Select app:** Mail
5. **Select device:** Other (Custom name)
6. İsim gir: "Modern Office System"
7. **Generate** tıkla
8. Oluşan 16 haneli şifreyi kaydet

### 5.2 Railway'de Environment Variable Güncelle

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx (boşluksuz)
```

---

## 🔐 ADIM 6: Güvenlik Kontrolleri

### 6.1 Environment Variables Kontrolü

**Kontrol Et:**
- [ ] Tüm secret key'ler güvenli
- [ ] Production URL'leri doğru
- [ ] CORS ayarları yapılandırılmış
- [ ] Database credentials güvenli

### 6.2 Supabase RLS Kontrolü

1. Supabase Dashboard > **Authentication > Policies**
2. Tüm tablolarda RLS aktif olmalı
3. Policy'leri test et

### 6.3 API Rate Limiting

Backend'de rate limiting aktif olduğunu doğrula:
- `/api/auth/*` endpoints: 5 req/min
- Diğer endpoints: 100 req/min

---

## 🧪 ADIM 7: Production Test

### 7.1 Health Check

```bash
# Backend health check
curl https://your-backend.railway.app/health

# Beklenen response:
{
  "status": "healthy",
  "timestamp": "2026-01-30T...",
  "checks": {
    "database": { "status": "ok" },
    "email": { "status": "ok" },
    ...
  }
}
```

### 7.2 Frontend Test

1. Frontend URL'i aç: `https://your-app.vercel.app`
2. Register sayfasına git
3. Yeni kullanıcı oluştur
4. Login yap
5. Temel özellikleri test et:
   - Dashboard görüntüleme
   - Task oluşturma
   - Issue bildirme

### 7.3 Email Test

1. Bir task oluştur ve birine ata
2. Email geldiğini kontrol et
3. Email içindeki link'lerin çalıştığını doğrula

---

## 📊 ADIM 8: Monitoring Kurulumu

### 8.1 Vercel Analytics

1. Vercel Dashboard > Project > **Analytics**
2. Analytics'i aktif et (Free tier)

### 8.2 Railway Metrics

1. Railway Dashboard > Service > **Metrics**
2. CPU, Memory, Network kullanımını izle

### 8.3 Supabase Monitoring

1. Supabase Dashboard > **Database > Logs**
2. Query performance'ı izle

### 8.4 Custom Monitoring

Backend monitoring endpoint'i kullan:
```
https://your-backend.railway.app/api/monitoring/metrics
```

---

## 👥 ADIM 9: İlk Kullanıcıları Oluştur

### 9.1 Admin Kullanıcı

1. Frontend'de register ol
2. Supabase Dashboard > **Table Editor > profiles**
3. Kullanıcının `role` alanını `admin` yap

### 9.2 Test Kullanıcıları

Ekip üyelerine davet gönderin:
- Register link'i paylaş
- İlk login'de profil tamamlamalarını iste

---

## 🎓 ADIM 10: Kullanıcı Eğitimi

### 10.1 Dokümantasyon Paylaş

Kullanıcılara şu dokümanları paylaş:
- `USER_MANUAL.md` - Kullanım kılavuzu
- `API_DOCUMENTATION.md` - Geliştiriciler için

### 10.2 Eğitim Oturumu

**Admin Eğitimi (2-3 saat):**
- Sistem genel bakış
- Issue yönetimi workflow
- Kullanıcı yönetimi
- Raporlama ve analytics

**Çalışan Eğitimi (1 saat):**
- Login ve navigasyon
- Task yönetimi
- Issue bildirme
- Profil ayarları

---

## 🔄 ADIM 11: CI/CD Aktifleştirme

### 11.1 GitHub Secrets Ekle

GitHub Repository > **Settings > Secrets and variables > Actions**

Eklenecek secrets:

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
RAILWAY_TOKEN=your-railway-token
BACKEND_URL=https://your-backend.railway.app
FRONTEND_URL=https://your-app.vercel.app
```

### 11.2 Vercel Token Alma

1. Vercel Dashboard > **Settings > Tokens**
2. **Create Token**
3. Token'ı kopyala ve GitHub'a ekle

### 11.3 Railway Token Alma

1. Railway Dashboard > **Account Settings > Tokens**
2. **Create Token**
3. Token'ı kopyala ve GitHub'a ekle

### 11.4 CI/CD Test

```bash
# Küçük bir değişiklik yap
echo "# Production Ready" >> README.md

# Commit ve push
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

GitHub Actions sekmesinde workflow'u izle.

---

## 📱 ADIM 12: PWA Kurulumu

### 12.1 HTTPS Kontrolü

- Vercel otomatik HTTPS sağlar ✅
- PWA için HTTPS gerekli

### 12.2 Manifest Kontrolü

Frontend URL'de:
```
https://your-app.vercel.app/manifest.webmanifest
```

Manifest dosyasının erişilebilir olduğunu doğrula.

### 12.3 Service Worker Test

Chrome DevTools:
1. **Application** sekmesi
2. **Service Workers** bölümü
3. Service worker'ın aktif olduğunu doğrula

### 12.4 Install Prompt Test

Mobil cihazda veya Chrome'da:
- "Add to Home Screen" prompt'u görünmeli
- Install edip test et

---

## 🎯 ADIM 13: Go-Live Checklist

### Son Kontroller:

- [ ] Frontend erişilebilir
- [ ] Backend health check OK
- [ ] Database bağlantısı çalışıyor
- [ ] Email gönderimi çalışıyor
- [ ] Authentication çalışıyor
- [ ] Admin kullanıcı oluşturuldu
- [ ] Test kullanıcıları oluşturuldu
- [ ] Monitoring aktif
- [ ] CI/CD pipeline çalışıyor
- [ ] PWA install edilebilir
- [ ] Dokümantasyon paylaşıldı
- [ ] Kullanıcı eğitimi tamamlandı

---

## 📞 Destek ve Bakım

### İlk Hafta

**Günlük Kontroller:**
- Health check endpoint'i kontrol et
- Error log'ları incele
- Kullanıcı feedback'i topla
- Performance metrics'i izle

### İlk Ay

**Haftalık Kontroller:**
- Database boyutu
- API response times
- Email delivery rate
- User adoption rate

### Devam Eden Bakım

**Aylık:**
- Dependency updates
- Security patches
- Feature requests değerlendirme
- Performance optimization

---

## 🆘 Sorun Giderme

### Frontend Yüklenmiyor

1. Vercel deployment log'larını kontrol et
2. Environment variables'ı doğrula
3. Browser console'da hata var mı bak

### Backend Bağlantı Hatası

1. Railway deployment log'larını kontrol et
2. Health endpoint'i test et
3. Database connection string'i doğrula

### Email Gönderilmiyor

1. Gmail App Password doğru mu?
2. 2-Step Verification aktif mi?
3. Backend log'larında email error var mı?

### Database Bağlantı Hatası

1. Supabase project aktif mi?
2. Connection string doğru mu?
3. RLS policies doğru yapılandırılmış mı?

---

## 🎉 Tebrikler!

Sisteminiz artık production'da ve kullanıma hazır!

### Önemli URL'ler:

- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-backend.railway.app
- **Database:** https://app.supabase.com/project/xxxxx
- **Monitoring:** https://your-backend.railway.app/api/monitoring/metrics

### Sonraki Adımlar:

1. Kullanıcı feedback'i topla
2. Analytics'i düzenli incele
3. Feature roadmap oluştur
4. Community oluştur

---

**Hazırlayan:** Kiro AI Assistant  
**Tarih:** 30 Ocak 2026  
**Versiyon:** 1.0

**Not:** Bu rehber tamamen ücretsiz hosting çözümleri kullanır. Toplam maliyet: $0/ay 🎉
