# Deployment - Adım Adım Rehber

## 🎯 Hedef
Checklist özelliğini production'a deploy etmek

---

## 📋 Ön Hazırlık (Zaten Tamamlandı ✅)

- ✅ Kod GitHub'a push edildi
- ✅ Supabase migration çalıştırıldı
- ✅ Backend ve frontend dosyaları hazır

---

## 🚀 ADIM 1: Vercel (Frontend) Deployment

### Seçenek A: Dashboard Üzerinden (ÖNERİLEN - EN KOLAY)

#### 1.1. Vercel'e Giriş Yapın
```
🌐 https://vercel.com/dashboard
```
- Email/GitHub ile giriş yapın

#### 1.2. Projenizi Bulun
- Dashboard'da "rapor-sistemi-frontend" projesini arayın
- Projeye tıklayın

#### 1.3. Deployment Durumunu Kontrol Edin
- Üst menüden **"Deployments"** sekmesine gidin
- En üstteki deployment'a bakın:
  - ✅ **"Ready"** yazıyorsa -> Otomatik deploy olmuş, bir şey yapmanıza gerek yok!
  - 🔄 **"Building"** yazıyorsa -> Deployment devam ediyor, bekleyin
  - ❌ **"Failed"** yazıyorsa -> Manuel deploy yapmanız gerekiyor

#### 1.4. Manuel Deploy (Gerekirse)
Eğer otomatik deploy olmadıysa:

1. Sağ üstte **"..."** (üç nokta) menüsüne tıklayın
2. **"Redeploy"** seçeneğini seçin
3. Açılan pencerede:
   - ✅ **"Use existing Build Cache"** seçeneğini KAPATIN (unchecked)
   - 🔵 **"Redeploy"** butonuna tıklayın

#### 1.5. Deployment'ı İzleyin
- Deployment başlayacak
- Aşamalar:
  ```
  🔄 Queued (Sırada)
  ⚙️ Building (İnşa ediliyor)
  🚀 Deploying (Deploy ediliyor)
  ✅ Ready (Hazır)
  ```
- Süre: 2-3 dakika

#### 1.6. Test Edin
```
🌐 https://rapor-sistemi-frontend.vercel.app
```
- Siteyi açın
- Ctrl+Shift+R ile cache'i temizleyin
- Giriş yapın
- Bir görev açın
- Checklist'i görmelisiniz!

---

### Seçenek B: Terminal ile (İLERİ SEVİYE)

```bash
# 1. Vercel CLI'yi yükleyin (sadece ilk kez)
npm install -g vercel

# 2. Giriş yapın
vercel login
# Tarayıcı açılacak, giriş yapın

# 3. Frontend klasörüne gidin
cd frontend

# 4. Deploy edin
vercel --prod

# 5. Soruları cevaplayın:
# ? Set up and deploy? -> Y
# ? Which scope? -> Hesabınızı seçin
# ? Link to existing project? -> Y
# ? What's the name? -> rapor-sistemi-frontend

# 6. Bekleyin (2-3 dakika)
# ✅ Deployment tamamlandı!
```

---

## 🔧 ADIM 2: Render (Backend) Deployment

### Seçenek A: Dashboard Üzerinden (ÖNERİLEN - EN KOLAY)

#### 2.1. Render'a Giriş Yapın
```
🌐 https://dashboard.render.com/
```
- Email/GitHub ile giriş yapın

#### 2.2. Backend Servisinizi Bulun
- Sol menüden **"Web Services"** seçin
- Backend servisinizi bulun (örn: "rapor-sistemi-backend")
- Servis adına tıklayın

#### 2.3. Deployment Durumunu Kontrol Edin
- Üst kısımda servis durumunu görürsünüz:
  - ✅ **"Live"** + yeşil nokta -> Servis çalışıyor
  - 🔄 **"Building"** -> Deployment devam ediyor
  - ❌ **"Failed"** -> Hata var

- **"Events"** sekmesine bakın:
  - Son event'e bakın
  - Eğer yeni bir "Deploy started" görüyorsanız -> Otomatik deploy çalışıyor!

#### 2.4. Manuel Deploy (Gerekirse)
Eğer otomatik deploy olmadıysa:

1. Sağ üstte **"Manual Deploy"** butonunu bulun
2. Dropdown'dan **"Deploy latest commit"** seçin
3. 🔵 **"Deploy"** butonuna tıklayın

#### 2.5. Deployment'ı İzleyin
- **"Logs"** sekmesine gidin
- Deployment loglarını canlı izleyin:
  ```
  🔄 Starting build...
  📦 Installing dependencies...
  ⚙️ Building application...
  🚀 Deploying...
  ✅ Deploy live!
  ```
- Süre: 5-10 dakika

#### 2.6. Test Edin
```bash
# Terminal'de test edin:
curl https://rapor-sistemi-backend.onrender.com/health

# Yanıt:
{
  "status": "ok",
  "timestamp": "2026-02-02T...",
  "environment": "production"
}
```

---

### Seçenek B: Git Push ile Tetikleme

```bash
# Boş bir commit yaparak deployment'ı tetikleyin
git commit --allow-empty -m "Trigger Render deployment"
git push origin main

# Render otomatik olarak yeni commit'i algılayacak
# Dashboard'dan deployment'ı izleyin
```

---

## ✅ ADIM 3: Deployment Doğrulama

### 3.1. Frontend Kontrolü

1. **Siteyi Açın**
   ```
   🌐 https://rapor-sistemi-frontend.vercel.app
   ```

2. **Cache Temizleyin**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **Giriş Yapın**
   - Email: osmanbaranaktepe@gmail.com
   - Şifreniz

4. **Görev Açın**
   - Görevler sayfasına gidin
   - Herhangi bir görevi açın

5. **Checklist Kontrolü**
   - Sayfayı aşağı kaydırın
   - **"Kontrol Listesi"** başlığını görmelisiniz
   - Altında "Yeni öğe ekle..." input'u olmalı

### 3.2. Backend Kontrolü

1. **Health Check**
   ```bash
   curl https://rapor-sistemi-backend.onrender.com/health
   ```
   ✅ Status: "ok" dönmeli

2. **API Test (Tarayıcıda)**
   - F12 tuşuna basın
   - **Network** sekmesine gidin
   - Bir görev açın
   - `/api/tasks/.../checklist` çağrısını bulun
   - Status: **200 OK** olmalı

### 3.3. Checklist Fonksiyonellik Testi

1. **Öğe Ekleme**
   - "Yeni öğe ekle..." input'una yazın: "Test öğesi"
   - **+** butonuna tıklayın
   - Öğe listeye eklenmeli

2. **Öğe Tamamlama**
   - Öğenin yanındaki ⭕ checkbox'a tıklayın
   - ✅ İşaretlenmeli
   - İlerleme çubuğu güncellenme li
   - Yüzde göstergesi değişmeli

3. **Öğe Silme**
   - Öğenin yanındaki 🗑️ çöp kutusu ikonuna tıklayın
   - Onay sorusu çıkacak
   - "Evet" deyin
   - Öğe silinmeli

---

## 🔍 Sorun Giderme

### Checklist Görünmüyor ❌

#### Çözüm 1: Cache Temizleme
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

#### Çözüm 2: Deployment Kontrolü
1. Vercel Dashboard -> Son deployment "Ready" mi?
2. Render Dashboard -> Servis "Live" mi?

#### Çözüm 3: Console Kontrolü
1. F12 tuşuna basın
2. **Console** sekmesine bakın
3. Kırmızı hatalar var mı?
4. Varsa, hata mesajını okuyun

#### Çözüm 4: Network Kontrolü
1. F12 tuşuna basın
2. **Network** sekmesine gidin
3. Bir görev açın
4. `/api/tasks/.../checklist` çağrısını bulun
5. Status code ne?
   - 200 ✅ -> API çalışıyor
   - 404 ❌ -> Backend deploy olmamış
   - 401 ❌ -> Token sorunu, yeniden giriş yapın
   - 500 ❌ -> Backend hatası, logları kontrol edin

### API Hataları ❌

#### 404 Not Found
- Backend deploy olmamış olabilir
- Render Dashboard'dan deployment'ı kontrol edin
- Manuel deploy yapın

#### 401 Unauthorized
- Token süresi dolmuş
- Çıkış yapıp yeniden giriş yapın

#### 500 Server Error
- Backend'de hata var
- Render Dashboard -> Logs sekmesinden hataları kontrol edin

---

## 📊 Deployment Durum Tablosu

| Bileşen | Durum | Kontrol | Süre |
|---------|-------|---------|------|
| GitHub Push | ✅ Tamamlandı | `git log` | - |
| Supabase Migration | ✅ Tamamlandı | SQL sorgusu | - |
| Vercel (Frontend) | 🔄 Bekliyor | Dashboard | 2-3 dk |
| Render (Backend) | 🔄 Bekliyor | Dashboard | 5-10 dk |
| Checklist Özelliği | ⏳ Test Edilecek | Manuel test | 2 dk |

---

## 🎉 Başarı Kriterleri

Deployment başarılı sayılır eğer:

- ✅ Vercel deployment "Ready" durumunda
- ✅ Render servis "Live" durumunda
- ✅ Site açılıyor ve giriş yapılabiliyor
- ✅ Görev detay sayfasında "Kontrol Listesi" görünüyor
- ✅ Checklist öğeleri eklenebiliyor, tamamlanabiliyor, silinebiliyor
- ✅ İlerleme çubuğu çalışıyor
- ✅ Console'da hata yok
- ✅ API çağrıları başarılı (200 OK)

---

## 📞 Yardım

Sorun devam ederse:

1. **Vercel Logs**: Dashboard -> Projeniz -> Deployments -> Son deployment -> Logs
2. **Render Logs**: Dashboard -> Servisiniz -> Logs
3. **Browser Console**: F12 -> Console sekmesi
4. **Network Tab**: F12 -> Network sekmesi

---

**Hazırlayan**: Kiro AI
**Tarih**: 2 Şubat 2026
**Versiyon**: 1.0
