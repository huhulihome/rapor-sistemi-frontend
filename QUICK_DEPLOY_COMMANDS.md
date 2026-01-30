# ⚡ Quick Deploy Commands
## Hızlı Production Deployment Komutları

Bu dosya, sistemi hızlıca production'a almak için gereken komutları içerir.

---

## 🔥 HIZLI BAŞLANGIÇ (5 Dakika)

### 1. Git Push (Yerel Değişiklikleri Gönder)

```bash
# Proje dizinine git
cd "C:\Users\user\Desktop\Rapor Sistemi"

# Tüm değişiklikleri ekle
git add .

# Commit yap
git commit -m "Production ready: All tests passing, builds successful"

# GitHub'a push et
git push origin main
```

**Eğer ilk kez push ediyorsanız:**

```bash
# GitHub'da repository oluşturun, sonra:
git remote add origin https://github.com/KULLANICI_ADINIZ/modern-office-system.git
git branch -M main
git push -u origin main
```

---

## 🗄️ SUPABASE KURULUMU

### Web Arayüzünden:

1. https://supabase.com → Sign In
2. New Project → İsim ver, şifre oluştur
3. SQL Editor'e git
4. `backend/supabase/migrations/001_initial_schema.sql` içeriğini yapıştır → Run
5. `backend/supabase/migrations/002_row_level_security.sql` içeriğini yapıştır → Run
6. Settings > API → URL ve Keys'i kaydet

**Kaydetmeniz Gerekenler:**
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

---

## 🎨 VERCEL DEPLOYMENT (Frontend)

### Web Arayüzünden:

1. https://vercel.com → Sign Up (GitHub ile)
2. Add New > Project
3. GitHub repo'nuzu seçin
4. Settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Environment Variables ekle:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=https://your-backend.railway.app
```

6. Deploy → URL'i kaydet

**Alternatif: Vercel CLI ile**

```bash
# Vercel CLI kur
npm install -g vercel

# Frontend dizinine git
cd frontend

# Deploy et
vercel --prod

# Environment variables ekle (interactive)
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_API_URL
```

---

## ⚙️ RAILWAY DEPLOYMENT (Backend)

### Web Arayüzünden:

1. https://railway.app → Sign Up (GitHub ile)
2. New Project > Deploy from GitHub repo
3. Repo'nuzu seçin
4. Settings:
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`

5. Variables ekle:
```
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET=your-super-secret-key-here
```

6. Settings > Networking > Generate Domain → URL'i kaydet

**Alternatif: Railway CLI ile**

```bash
# Railway CLI kur
npm install -g @railway/cli

# Login
railway login

# Backend dizinine git
cd backend

# Deploy et
railway up

# Environment variables ekle
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set SUPABASE_URL=https://xxxxx.supabase.co
# ... diğer variables
```

---

## 📧 GMAIL APP PASSWORD

### Gmail App Password Oluştur:

1. https://myaccount.google.com
2. Security > 2-Step Verification → Aktif et
3. App passwords → Mail > Other (Custom name)
4. İsim: "Modern Office System"
5. Generate → 16 haneli şifreyi kaydet
6. Railway'de `GMAIL_APP_PASSWORD` olarak ekle

---

## 🔄 FRONTEND'İ BACKEND URL İLE GÜNCELLE

Backend deploy edildikten sonra:

1. Railway'den backend URL'i al: `https://your-backend.railway.app`
2. Vercel'e git > Project > Settings > Environment Variables
3. `VITE_API_URL` değişkenini güncelle
4. Vercel otomatik redeploy edecek

---

## ✅ TEST KOMUTLARI

### Backend Health Check

```bash
# Windows PowerShell
Invoke-WebRequest -Uri "https://your-backend.railway.app/health" | Select-Object -Expand Content

# veya curl (Git Bash)
curl https://your-backend.railway.app/health
```

**Beklenen Sonuç:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-30T...",
  "checks": {
    "database": { "status": "ok" },
    "email": { "status": "ok" }
  }
}
```

### Frontend Test

```bash
# Browser'da aç
start https://your-app.vercel.app
```

---

## 🔐 İLK ADMIN KULLANICI OLUŞTUR

### 1. Frontend'de Register Ol

```
https://your-app.vercel.app/register
```

### 2. Supabase'de Admin Yap

1. Supabase Dashboard → Table Editor → profiles
2. Yeni oluşturduğun kullanıcıyı bul
3. `role` kolonunu `admin` yap
4. Save

### 3. Logout ve Login

Frontend'de logout yap, tekrar login yap. Artık admin yetkilerine sahipsin!

---

## 📊 MONITORING URL'LERİ

### Hızlı Erişim:

```bash
# Backend Health
https://your-backend.railway.app/health

# Backend Metrics
https://your-backend.railway.app/api/monitoring/metrics

# Database Status
https://your-backend.railway.app/api/monitoring/database

# System Info
https://your-backend.railway.app/api/monitoring/system
```

---

## 🚨 SORUN GİDERME KOMUTLARI

### Vercel Logs

```bash
# Vercel CLI ile
vercel logs

# veya web'den
# https://vercel.com/dashboard → Project → Deployments → Logs
```

### Railway Logs

```bash
# Railway CLI ile
railway logs

# veya web'den
# https://railway.app/dashboard → Service → Deployments → Logs
```

### Local Test (Production Build)

```bash
# Frontend
cd frontend
npm run build
npm run preview

# Backend
cd backend
npm run build
npm start
```

---

## 🔄 GÜNCELLEME KOMUTLARI

### Kod Değişikliği Sonrası:

```bash
# 1. Değişiklikleri commit et
git add .
git commit -m "Feature: Yeni özellik açıklaması"

# 2. Push et
git push origin main

# 3. Vercel ve Railway otomatik deploy edecek
# GitHub Actions'da progress'i izle
```

### Manuel Redeploy:

```bash
# Vercel
cd frontend
vercel --prod

# Railway
cd backend
railway up
```

---

## 📱 PWA TEST

### Chrome DevTools:

```
1. Frontend URL'i aç
2. F12 → Application sekmesi
3. Service Workers → Aktif olmalı
4. Manifest → Doğru bilgiler olmalı
```

### Mobil Test:

```
1. Mobil cihazda frontend URL'i aç
2. "Add to Home Screen" prompt'u görünmeli
3. Install et
4. Home screen'den aç
5. Offline çalışmayı test et (airplane mode)
```

---

## 🎯 DEPLOYMENT CHECKLIST

Deployment öncesi kontrol:

```bash
# ✅ Tests
cd frontend && npm test
cd ../backend && npm test

# ✅ Builds
cd frontend && npm run build
cd ../backend && npm run build

# ✅ Git status
git status

# ✅ Git push
git push origin main
```

---

## 💡 HIZLI İPUÇLARI

### Environment Variables Şablonu

**Frontend (.env.production):**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=https://your-backend.railway.app
```

**Backend (.env.production):**
```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxx
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET=your-super-secret-key-here
```

### Hızlı Backup

```bash
# Database backup (Supabase otomatik yapar)
# Manuel backup için:
# Supabase Dashboard → Database → Backups → Download

# Code backup
git push origin main
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

---

## 🎉 BAŞARILI DEPLOYMENT SONRASI

### Paylaş:

```
✅ Frontend: https://your-app.vercel.app
✅ Backend: https://your-backend.railway.app
✅ Status: Production Ready
✅ Cost: $0/month
```

### İlk Adımlar:

1. Admin kullanıcı oluştur
2. Test kullanıcıları ekle
3. Ekip üyelerini davet et
4. Kullanıcı eğitimi planla
5. Monitoring'i düzenli kontrol et

---

**Hazırlayan:** Kiro AI Assistant  
**Güncelleme:** 30 Ocak 2026

**Not:** Tüm komutlar Windows PowerShell için optimize edilmiştir. Git Bash kullanıyorsanız, komutlar aynı şekilde çalışacaktır.
