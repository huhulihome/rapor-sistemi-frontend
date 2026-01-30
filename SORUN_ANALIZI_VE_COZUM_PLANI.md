# 🔍 Sorun Analizi ve Çözüm Planı

**Tarih:** 30 Ocak 2026  
**Durum:** Analiz Tamamlandı - İmplementasyon Bekliyor

---

## 📋 SORUNLAR

### 🔴 SORUN 1: Rutin Görevler Otomatik Yenilenmiyor

**Açıklama:**
- Rutin görevler oluşturuluyor ✅
- Tamamlandı yapıldığında yeni görev oluşmuyor ❌
- Tek seferlik görev gibi davranıyor ❌

**Mevcut Durum:**
- ✅ Database migration var (`005_recurring_tasks.sql`)
- ✅ Trigger fonksiyonu var (`create_next_recurring_task()`)
- ✅ Fix migration var (`008_fix_recurring_task_trigger.sql`)
- ✅ Frontend form recurring options gösteriyor
- ❓ Trigger çalışıyor mu?
- ❓ Migration Supabase'de çalıştırıldı mı?

**Olası Nedenler:**
1. Migration dosyaları Supabase'de çalıştırılmamış
2. Trigger aktif değil
3. Task complete edilirken trigger tetiklenmiyor
4. RLS policy trigger'ı engelliyor

---

### 🔴 SORUN 2: To-Do List Karışıklığı

**Açıklama:**
- Admin kendi to-do listesinde kullanıcıların to-do'larını görüyor ❌
- Kullanıcılar kendi to-do listelerini görebiliyor ✅
- Admin tüm to-do'ları görebilmeli ama kendi listesi ayrı olmalı ❌

**Mevcut Durum:**
- ✅ `todos` tablosu var (`009_todos_table.sql`)
- ✅ RLS policies var
- ✅ Frontend component var (`PersonalTodoList.tsx`)
- ❌ Admin view'da filtreleme yok
- ❌ "Kendi to-do'larım" vs "Tüm to-do'lar" ayrımı yok

**Olası Nedenler:**
1. Frontend'de admin için özel view yok
2. API endpoint'te user_id filtresi eksik
3. Component'te admin/user ayrımı yapılmamış

---

## 🎯 ÇÖZÜM PLANI

### ✅ GÖREV 1: Recurring Task Migration Kontrolü ve Düzeltme

**Öncelik:** 🔴 YÜKSEK  
**Süre:** 15 dakika  
**Zorluk:** Kolay

**Alt Görevler:**

#### 1.1. Supabase'de Migration Durumu Kontrol
- [ ] Supabase Dashboard > SQL Editor
- [ ] `SELECT * FROM tasks LIMIT 1;` çalıştır
- [ ] Kolonları kontrol et:
  - `is_recurring`
  - `recurrence_pattern`
  - `recurrence_interval`
  - `next_occurrence`
  - `parent_task_id`
  - `recurrence_end_date`
  - `last_completed_at`
  - `task_type`

**Eğer kolonlar yoksa:**
- `005_recurring_tasks.sql` dosyasını Supabase'de çalıştır
- `008_fix_recurring_task_trigger.sql` dosyasını çalıştır

#### 1.2. Trigger Durumu Kontrol
```sql
-- Trigger var mı kontrol et
SELECT * FROM pg_trigger WHERE tgname = 'trigger_recurring_task';

-- Function var mı kontrol et
SELECT proname FROM pg_proc WHERE proname = 'create_next_recurring_task';
```

**Eğer yoksa:**
- Migration dosyalarını tekrar çalıştır

#### 1.3. Test Senaryosu
1. Yeni rutin görev oluştur:
   - Category: Routine
   - Recurrence: Weekly
   - Interval: 1
2. Görevi "Completed" yap
3. Tasks tablosunu kontrol et:
   ```sql
   SELECT id, title, status, is_recurring, next_occurrence, parent_task_id
   FROM tasks
   WHERE title = 'Test Rutin Görev'
   ORDER BY created_at DESC;
   ```
4. Yeni görev oluşmuş mu kontrol et

---

### ✅ GÖREV 2: Backend Recurring Task Endpoint Düzeltme

**Öncelik:** 🔴 YÜKSEK  
**Süre:** 20 dakika  
**Zorluk:** Orta

**Alt Görevler:**

#### 2.1. Task Update Endpoint Kontrolü
- [ ] `backend/src/routes/tasks.ts` dosyasını aç
- [ ] PUT `/api/tasks/:id` endpoint'ini kontrol et
- [ ] Status update'te trigger tetikleniyor mu?

#### 2.2. Recurring Fields Backend'e Ekle
- [ ] `backend/src/types/api.ts` kontrol et
- [ ] CreateTaskRequest interface'inde recurring fields var mı?
- [ ] UpdateTaskRequest interface'inde recurring fields var mı?

#### 2.3. Task Create Endpoint Güncelle
- [ ] POST `/api/tasks` endpoint'inde recurring fields kaydet
- [ ] Validation ekle

---

### ✅ GÖREV 3: To-Do List Admin View Düzeltme

**Öncelik:** 🟡 ORTA  
**Süre:** 30 dakika  
**Zorluk:** Orta

**Alt Görevler:**

#### 3.1. Backend To-Do API Güncelleme
**Dosya:** `backend/src/routes/todos.ts` (oluşturulacak)

```typescript
// GET /api/todos - Kendi to-do'larını getir
router.get('/todos', authenticateUser, async (req, res) => {
  const userId = req.user.id;
  
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  res.json({ data, error });
});

// GET /api/todos/all - Admin: Tüm to-do'ları getir
router.get('/todos/all', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('todos')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false });
    
  res.json({ data, error });
});

// GET /api/todos/user/:userId - Admin: Belirli kullanıcının to-do'larını getir
router.get('/todos/user/:userId', requireAdmin, async (req, res) => {
  const { userId } = req.params;
  
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  res.json({ data, error });
});
```

#### 3.2. Frontend Component Güncelleme
**Dosya:** `frontend/src/components/dashboard/PersonalTodoList.tsx`

**Değişiklikler:**
1. Admin için tab sistemi ekle:
   - "Kendi To-Do'larım"
   - "Tüm Kullanıcılar"

2. Kullanıcı seçimi dropdown ekle (admin için)

3. API endpoint'leri güncelle:
   - Normal user: `/api/todos`
   - Admin (kendi): `/api/todos`
   - Admin (tümü): `/api/todos/all`
   - Admin (belirli user): `/api/todos/user/:userId`

#### 3.3. Admin Dashboard'a To-Do Overview Ekle
**Dosya:** `frontend/src/pages/AdminDashboard.tsx`

- Kullanıcı bazlı to-do istatistikleri
- En çok to-do'su olan kullanıcılar
- Tamamlanma oranları

---

### ✅ GÖREV 4: Frontend Recurring Task Form Düzeltme

**Öncelik:** 🟡 ORTA  
**Süre:** 15 dakika  
**Zorluk:** Kolay

**Alt Görevler:**

#### 4.1. TaskForm Component Kontrolü
- [ ] `frontend/src/components/tasks/TaskForm.tsx` aç
- [ ] Recurring fields form'da submit ediliyor mu?
- [ ] API'ye gönderiliyor mu?

#### 4.2. Task Create/Update API Çağrısı
- [ ] `onSubmit` fonksiyonunu kontrol et
- [ ] Recurring fields payload'a dahil mi?

---

### ✅ GÖREV 5: Test ve Doğrulama

**Öncelik:** 🟢 DÜŞÜK  
**Süre:** 20 dakika  
**Zorluk:** Kolay

**Alt Görevler:**

#### 5.1. Recurring Task Testi
1. Yeni rutin görev oluştur
2. Tamamla
3. Yeni görev oluştu mu kontrol et
4. Tarih doğru mu kontrol et

#### 5.2. To-Do List Testi
1. Normal user olarak login ol
2. To-do oluştur
3. Sadece kendi to-do'larını gör
4. Admin olarak login ol
5. Kendi to-do'larını gör
6. "Tüm Kullanıcılar" sekmesine geç
7. Tüm to-do'ları gör
8. Belirli kullanıcı seç
9. O kullanıcının to-do'larını gör

---

## 📊 GÖREV ÖNCELİK SIRASI

1. **GÖREV 1** - Recurring Task Migration (15 dk) 🔴
2. **GÖREV 2** - Backend Recurring Endpoint (20 dk) 🔴
3. **GÖREV 4** - Frontend Recurring Form (15 dk) 🟡
4. **GÖREV 3** - To-Do Admin View (30 dk) 🟡
5. **GÖREV 5** - Test ve Doğrulama (20 dk) 🟢

**Toplam Süre:** ~100 dakika (1.5 saat)

---

## 🔧 HIZLI BAŞLANGIÇ

### Şimdi Yapılacaklar:

1. **Supabase'de Migration Kontrol:**
   ```sql
   -- Kolonları kontrol et
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'tasks' 
   AND column_name IN ('is_recurring', 'recurrence_pattern', 'task_type');
   ```

2. **Eğer kolonlar yoksa:**
   - `supabase/migrations/005_recurring_tasks.sql` dosyasını aç
   - İçeriği kopyala
   - Supabase SQL Editor'de çalıştır
   - `supabase/migrations/008_fix_recurring_task_trigger.sql` dosyasını çalıştır

3. **Backend To-Do Routes Oluştur:**
   - `backend/src/routes/todos.ts` dosyası oluştur
   - Yukarıdaki kodu ekle
   - `backend/src/app.ts`'de route'u ekle

4. **Frontend To-Do Component Güncelle:**
   - `PersonalTodoList.tsx` dosyasını aç
   - Admin tab sistemi ekle

---

## 📝 NOTLAR

### Recurring Tasks:
- Migration dosyaları mevcut ✅
- Trigger fonksiyonu yazılmış ✅
- Frontend form hazır ✅
- **Eksik:** Migration Supabase'de çalıştırılmamış olabilir

### To-Do List:
- Database table mevcut ✅
- RLS policies var ✅
- Frontend component var ✅
- **Eksik:** Admin view ayrımı yok

---

**Hazırlayan:** Kiro AI Assistant  
**Sonraki Adım:** Görev 1'i başlat - Migration kontrolü
