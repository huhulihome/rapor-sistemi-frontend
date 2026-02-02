# Backend Hızlı Deployment Rehberi

## ✅ Durum
Backend repo'su clone edildi: `C:\Users\user\Desktop\backend-repo`
Checklist dosyaları kopyalandı!

---

## 🚀 Şimdi Yapmanız Gerekenler (5 Dakika)

### 1. Yeni Terminal Açın
Windows PowerShell veya CMD açın

### 2. Backend Repo Klasörüne Gidin
```bash
cd "C:\Users\user\Desktop\backend-repo"
```

### 3. Değişiklikleri Kontrol Edin
```bash
git status
```

Şunları görmelisiniz:
```
modified:   src/app.ts
new file:   src/routes/checklist.ts
```

### 4. Dosyaları Git'e Ekleyin
```bash
git add .
```

### 5. Commit Yapın
```bash
git commit -m "Checklist özelliği eklendi"
```

### 6. GitHub'a Push Edin
```bash
git push origin main
```

### 7. Render'ı Kontrol Edin
1. https://dashboard.render.com/ adresine gidin
2. Backend servisinizi açın
3. "Events" sekmesinde yeni deployment başlamalı
4. 5-10 dakika bekleyin

### 8. Test Edin
```bash
curl https://rapor-sistemi-backend.onrender.com/health
```

---

## 📋 Komutların Tamamı (Kopyala-Yapıştır)

```bash
cd "C:\Users\user\Desktop\backend-repo"
git status
git add .
git commit -m "Checklist özelliği eklendi"
git push origin main
```

---

## ✅ Başarı Kontrolü

### Git Push Başarılı mı?
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
Total X (delta X), reused 0 (delta 0)
To https://github.com/huhulihome/rapor-sistemi-backend.git
   xxxxxx..yyyyyy  main -> main
```

### Render Deployment Başladı mı?
- Dashboard'da "Deploy started" event'i görünmeli
- "Building" -> "Deploying" -> "Live" aşamaları

### API Çalışıyor mu?
```bash
curl https://rapor-sistemi-backend.onrender.com/health
# Yanıt: {"status":"ok",...}
```

---

## 🎯 Özet

1. ✅ Backend repo clone edildi
2. ✅ Checklist dosyaları kopyalandı
3. 🔄 Şimdi siz: Git push yapın
4. 🔄 Render: Otomatik deploy edecek
5. ✅ Test: Checklist çalışacak!

---

## 🆘 Sorun Çıkarsa

### "Permission denied" Hatası
```bash
# SSH key yerine HTTPS kullanın
git remote set-url origin https://github.com/huhulihome/rapor-sistemi-backend.git
git push origin main
```

### "Authentication failed" Hatası
- GitHub'a giriş yapın
- Personal Access Token oluşturun
- Token'ı şifre olarak kullanın

### Render Deployment Başlamadı
- Dashboard'dan "Manual Deploy" yapın
- "Clear build cache & deploy" seçin

---

**Hazırlayan**: Kiro AI
**Tarih**: 2 Şubat 2026
**Durum**: Backend dosyaları hazır, sadece push gerekiyor!
