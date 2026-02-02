# Manuel Deployment Rehberi

## Otomatik Deployment Kontrol

Önce otomatik deployment'ın çalışıp çalışmadığını kontrol edelim:

### 1. Vercel (Frontend) Kontrol
1. https://vercel.com/dashboard adresine gidin
2. Giriş yapın
3. "rapor-sistemi-frontend" projesini bulun
4. Son deployment'ları kontrol edin
5. Eğer yeni bir deployment görüyorsanız, otomatik çalışıyor demektir

### 2. Render (Backend) Kontrol
1. https://dashboard.render.com/ adresine gidin
2. Giriş yapın
3. Backend servisinizi bulun
4. "Events" veya "Logs" sekmesine bakın
5. Yeni bir deployment başlamış mı kontrol edin

---

## Manuel Deployment - Vercel (Frontend)

### Yöntem 1: Vercel Dashboard Üzerinden (En Kolay)

1. **Vercel Dashboard'a Gidin**
   - https://vercel.com/dashboard
   - Giriş yapın

2. **Projenizi Seçin**
   - "rapor-sistemi-frontend" projesine tıklayın

3. **Deployments Sekmesi**
   - Üst menüden "Deployments" sekmesine gidin

4. **Manuel Deploy**
   - Sağ üstte "..." (üç nokta) menüsüne tıklayın
   - "Redeploy" seçeneğini seçin
   - "Use existing Build Cache" seçeneğini KAPATIN
   - "Redeploy" butonuna tıklayın

5. **Deployment Takibi**
   - Deployment başlayacak
   - "Building" -> "Deploying" -> "Ready" aşamalarını göreceksiniz
   - 2-3 dakika sürer

### Yöntem 2: Vercel CLI ile (Terminal)

```bash
# 1. Vercel CLI'yi yükleyin (sadece ilk kez)
npm install -g vercel

# 2. Vercel'e giriş yapın
vercel login

# 3. Frontend klasörüne gidin
cd frontend

# 4. Deploy edin
vercel --prod

# Sorular gelecek:
# - Set up and deploy? -> Y (Yes)
# - Which scope? -> Hesabınızı seçin
# - Link to existing project? -> Y (Yes)
# - What's the name of your existing project? -> rapor-sistemi-frontend
```

---

## Manuel Deployment - Render (Backend)

### Yöntem 1: Render Dashboard Üzerinden (En Kolay)

1. **Render Dashboard'a Gidin**
   - https://dashboard.render.com/
   - Giriş yapın

2. **Backend Servisinizi Seçin**
   - Sol menüden "Web Services" seçin
   - Backend servisinizi bulun ve tıklayın

3. **Manuel Deploy**
   - Sağ üstte "Manual Deploy" butonunu bulun
   - "Deploy latest commit" seçeneğini seçin
   - "Deploy" butonuna tıklayın

4. **Deployment Takibi**
   - "Logs" sekmesinden deployment loglarını izleyin
   - "Building" -> "Deploying" -> "Live" aşamalarını göreceksiniz
   - 5-10 dakika sürer

### Yöntem 2: Render CLI ile (Terminal)

```bash
# 1. Render CLI'yi yükleyin (sadece ilk kez)
npm install -g @render/cli

# 2. Render'a giriş yapın
render login

# 3. Backend klasörüne gidin
cd backend

# 4. Deploy edin
render deploy
```

### Yöntem 3: Git Push ile Tetikleme

Eğer otomatik deployment ayarları varsa ama çalışmıyorsa:

```bash
# Boş bir commit yaparak deployment'ı tetikleyin
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

---

## Deployment Sonrası Kontrol

### Frontend Kontrolü

1. **Siteyi Açın**
   ```
   https://rapor-sistemi-frontend.vercel.app
   ```

2. **Tarayıcı Cache'ini Temizleyin**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

3. **Checklist Testi**
   - Giriş yapın
   - Bir görev açın
   - Sayfanın altında "Kontrol Listesi" bölümünü görmelisiniz

4. **Console Kontrolü**
   - F12 tuşuna basın
   - Console sekmesine bakın
   - Kırmızı hatalar var mı kontrol edin

### Backend Kontrolü

1. **Health Check**
   ```bash
   curl https://rapor-sistemi-backend.onrender.com/health
   ```
   
   Yanıt:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-02-02T...",
     "environment": "production"
   }
   ```

2. **API Test**
   - Tarayıcıda bir görev açın
   - F12 -> Network sekmesi
   - Checklist API çağrılarını kontrol edin:
     - `/api/tasks/:taskId/checklist` (GET)
   - Status code 200 olmalı

---

## Sorun Giderme

### Vercel Deployment Hataları

**Hata: "Build failed"**
```bash
# Frontend klasöründe build test edin
cd frontend
npm install
npm run build

# Hata varsa düzeltin ve tekrar push edin
git add .
git commit -m "Fix build errors"
git push origin main
```

**Hata: "Environment variables missing"**
1. Vercel Dashboard -> Projeniz -> Settings -> Environment Variables
2. Gerekli değişkenleri ekleyin:
   - `VITE_API_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Render Deployment Hataları

**Hata: "Build failed"**
```bash
# Backend klasöründe build test edin
cd backend
npm install
npm run build

# Hata varsa düzeltin ve tekrar push edin
git add .
git commit -m "Fix build errors"
git push origin main
```

**Hata: "Environment variables missing"**
1. Render Dashboard -> Servisiniz -> Environment
2. Gerekli değişkenleri ekleyin:
   - `NODE_ENV=production`
   - `PORT=3001`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `JWT_SECRET`

### Checklist Görünmüyor

1. **Cache Temizleme**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

2. **Deployment Kontrolü**
   - Vercel: Son deployment "Ready" durumunda mı?
   - Render: Servis "Live" durumunda mı?

3. **Console Hataları**
   - F12 -> Console
   - Kırmızı hatalar var mı?
   - Network sekmesinde API çağrıları başarılı mı?

4. **API Test**
   ```bash
   # Token alın (tarayıcı console'da)
   localStorage.getItem('supabase.auth.token')
   
   # API'yi test edin
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://rapor-sistemi-backend.onrender.com/api/tasks/TASK_ID/checklist
   ```

---

## Hızlı Deployment Komutları

### Tüm Sistemi Deploy Et

```bash
# 1. Değişiklikleri commit edin
git add .
git commit -m "Deployment için hazır"
git push origin main

# 2. Frontend deploy (Vercel CLI)
cd frontend
vercel --prod

# 3. Backend deploy (Render Dashboard'dan manuel)
# https://dashboard.render.com/ -> Servisiniz -> Manual Deploy

# 4. Kontrol
curl https://rapor-sistemi-backend.onrender.com/health
```

### Sadece Frontend Deploy

```bash
cd frontend
vercel --prod
```

### Sadece Backend Deploy

```bash
# Render Dashboard'dan:
# https://dashboard.render.com/ -> Servisiniz -> Manual Deploy

# VEYA boş commit ile tetikle:
git commit --allow-empty -m "Deploy backend"
git push origin main
```

---

## Deployment Checklist

### Deployment Öncesi
- [ ] Tüm değişiklikler commit edildi
- [ ] GitHub'a push edildi
- [ ] Environment variables ayarlandı
- [ ] Build hataları yok

### Deployment Sırası
- [ ] Frontend deploy edildi (Vercel)
- [ ] Backend deploy edildi (Render)
- [ ] Deployment logları kontrol edildi
- [ ] Hatalar giderildi

### Deployment Sonrası
- [ ] Site açılıyor
- [ ] Giriş yapılabiliyor
- [ ] Checklist görünüyor
- [ ] API çağrıları çalışıyor
- [ ] Console'da hata yok

---

## Yardım ve Destek

### Vercel Dokümantasyon
- https://vercel.com/docs/deployments/overview

### Render Dokümantasyon
- https://render.com/docs/deploys

### Sorun Devam Ederse
1. Deployment loglarını kontrol edin
2. Environment variables'ları kontrol edin
3. Build komutlarını local'de test edin
4. GitHub repository ayarlarını kontrol edin

---

**Son Güncelleme**: 2 Şubat 2026
**Durum**: Manuel deployment rehberi hazır
